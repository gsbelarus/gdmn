import {IERModelView2Props} from "./ERModelView2.types";
import React, {useCallback, useEffect, useState, useRef} from "react";
import {IDataRow, RecordSet, rsActions, TFieldType} from "gdmn-recordset";
import {List} from "immutable";
import {createGrid, GDMNGrid} from "gdmn-grid";
import {gdmnActions, gdmnActionsAsync} from "../gdmn/actions";
import {CommandBar, ICommandBarItemProps, TextField, getTheme} from "office-ui-fabric-react";
import {bindGridActions} from "./utils";
import CSSModules from 'react-css-modules';
import styles from './NLPDataView/styles.css';
import {InspectorForm} from "@src/app/components/InspectorForm";
import {useSaveGridState} from "../../hooks/useSavedGridState";
import {apiService} from "@src/app/services/apiService";
import { ERModel } from "gdmn-orm";
import { useMessageBox } from "@src/app/components/MessageBox/MessageBox";

export const ERModelView2 = CSSModules( (props: IERModelView2Props) => {

  const { entities, attributes, viewTab, erModel, dispatch, gcsEntities, gcsAttributes, match, gridColors, history } = props;
  const [showInspector, setShowInspector] = useState(false);
  const [gridRefEntities, getSavedStateEntities] = useSaveGridState(dispatch, match.url, viewTab, 'entities');
  const [gridRefAttributes, getSavedStateAttributes] = useSaveGridState(dispatch, match.url, viewTab, 'attributes');
  const [MessageBox, messageBox] = useMessageBox();

  const getSavedEntitiesFilter = (): string => {
    if (viewTab && viewTab.sessionData && typeof(viewTab.sessionData.entitiesFilter) === 'string') {
      return viewTab.sessionData.entitiesFilter as string;
    }
    return '';
  };

  const getSavedAttributesFilter = (): string => {
    if (viewTab && viewTab.sessionData && typeof(viewTab.sessionData.attributesFilter) === 'string') {
      return viewTab.sessionData.attributesFilter as string;
    }
    return '';
  };

  const entitiesFilter = useRef(getSavedEntitiesFilter());
  const attributesFilter = useRef(getSavedAttributesFilter());

  useEffect( () => {
    return () => {
      dispatch(gdmnActions.saveSessionData({
        viewTabURL: match.url,
        sessionData: {
          entitiesFilter: entitiesFilter.current,
          attributesFilter: attributesFilter.current
        }
      }));
    };
  }, []);

  // TODO: удаление перенести на уровень middleware
  // дополнительно проверять:
  // https://github.com/gsbelarus/gdmn/issues/296
  const deleteRecord = useCallback( () => {
    if (entities?.size && erModel) {
      const entityName = entities.getString('name');
      const entity = erModel.entity(entityName);

      const children = Object.values(erModel.entities).filter( e => e.parent === entity );
      const references = erModel.entityReferencedBy(entity);

      if (children.length) {
        messageBox({
          title: `Нельзя удалить ${entityName}`,
          message: `Так как от неё наследованы сущности: ${children.map( e => e.name ).join(', ')}`,
          type: 'MB_OK',
          icon: 'Attention'
        });
      }
      else if (references.length) {
        const refNames = references.length <= 20
          ? references.map( er => er.entity.name ).join(', ')
          : references.slice(0, 20).map( er => er.entity.name ).join(', ') + '...';

        messageBox({
          title: `Нельзя удалить ${entityName}`,
          message: `Так как на неё ссылаются сущности: ${refNames}`,
          type: 'MB_OK',
          icon: 'Attention'
        });
      }
      else {
        dispatch(async dispatch => {
          const result = await apiService.deleteEntity({ entityName });

          if (!result.error) {
            const newERModel = new ERModel(erModel);
            newERModel.remove(entity);
            dispatch(gdmnActions.setSchema(newERModel));
            dispatch(rsActions.setRecordSet(entities.delete(true)));
          } else {
            throw new Error(result.error.message);
          }
        });
      }
    }
  }, [entities, viewTab, erModel]);

  useEffect(() => {
    if (!erModel || !Object.keys(erModel.entities).length) {
      return;
    }

    //При изменении ermodel необходимо пересоздать recordset
    if (entities) {
      dispatch(rsActions.deleteRecordSet({name: 'entities'}));
    }

    dispatch(rsActions.createRecordSet({
      name: 'entities',
      rs: RecordSet.create({
        name: 'entities',
        fieldDefs: [
          {
            fieldName: 'name',
            dataType: TFieldType.String,
            size: 31,
            caption: 'Entity name'
          },
          {
            fieldName: 'description',
            dataType: TFieldType.String,
            size: 60,
            caption: 'Description'
          }
        ],
        data: List(
          Object.entries(erModel.entities).map(
            ([name, ent]) =>
              ({
                name,
                description: ent.lName.ru ? ent.lName.ru.name : name
              } as IDataRow)
          )
        )
      })
    }));

    entities && onSetFilter({ rs: entities, filter: entitiesFilter.current });
  }, [erModel]);

  useEffect( () => {
    if (!erModel || !Object.keys(erModel.entities).length) {
      return;
    }

    if (!entities) {
      if (attributes) {
        dispatch(
          rsActions.deleteRecordSet(attributes)
        );
      }

      return;
    }

    if (!entities.size) {
      if (attributes && attributes.size) {
        dispatch(
          rsActions.setRecordSet(attributes.setData({
            data: undefined,
            masterLink: {
              masterName: entities.name,
              value: undefined
            }
          }))
        );
      }

      return;
    }

    const currEntity = entities.size ? entities.getString('name') : undefined;

    if (attributes) {
      if (!attributes.masterLink || attributes.masterLink.masterName !== entities.name) {
        throw new Error(`Invalid master-detail link for entities-attributes rs`);
      }

      if (!attributes.masterLink.value || attributes.masterLink.value !== currEntity) {
        const data = currEntity && erModel.entities[currEntity]
          ?
          List(
            Object.entries(erModel.entities[currEntity].attributes).map(
              ([name, ent]) =>
                ({
                  name,
                  description: ent.lName && ent.lName.ru ? ent.lName.ru.name : name
                } as IDataRow)
            )
          )
          :
          List<IDataRow>();

        dispatch(
          rsActions.setRecordSet(attributes.setData({
              data,
              masterLink: {
                masterName: entities.name,
                value: currEntity
              }
            })
          )
        );
      }
    } else {
      dispatch(rsActions.createRecordSet({
        name: 'attributes',
        rs: RecordSet.create({
          name: 'attributes',
          fieldDefs: [
            {
              fieldName: 'name',
              size: 31,
              dataType: TFieldType.String,
              caption: 'Attribute name'
            },
            {
              fieldName: 'description',
              dataType: TFieldType.String,
              size: 60,
              caption: 'Description'
            }
          ],
          data: currEntity
            ?
            List(
              Object.entries(erModel.entities[currEntity].attributes).map(
                ([name, ent]) =>
                  ({
                    name,
                    description: ent.lName.ru ? ent.lName.ru.name : name
                  } as IDataRow)
              )
            )
            :
            List<IDataRow>(),
          masterLink: {
            masterName: entities.name,
            value: currEntity
          }
        })
      }));

      attributes && onSetFilter({ rs: attributes, filter: attributesFilter.current });
    }
  }, [erModel, entities]);

  useEffect( () => {
    if (!gcsEntities && entities) {
      dispatch(
        createGrid({
          name: 'entities',
          columns: entities.fieldDefs.map(fd => ({
            name: fd.fieldName,
            caption: [fd.caption || fd.fieldName],
            fields: [{ ...fd }],
            width: fd.dataType === TFieldType.String && fd.size ? fd.size * 10 : undefined,
            hidden: false
          })),
          leftSideColumns: 0,
          rightSideColumns: 0,
          hideFooter: true
        })
      );
    }
  }, [entities]);

  useEffect( () => {
    if (!gcsAttributes && attributes) {
      dispatch(
        createGrid({
          name: 'attributes',
          columns: attributes.fieldDefs.map(fd => ({
            name: fd.fieldName,
            caption: [fd.caption || fd.fieldName],
            fields: [{ ...fd }],
            width: fd.dataType === TFieldType.String && fd.size ? fd.size * 10 : undefined,
            hidden: false
          })),
          leftSideColumns: 0,
          rightSideColumns: 0,
          hideFooter: true
        })
      );
    }
  }, [attributes]);

  useEffect( () => {
    const rs = ([] as string[]).concat( entities ? [entities.name] : [] ).concat( attributes ? [attributes.name] : [] );

    if (!viewTab) {
      dispatch(gdmnActions.addViewTab({
        url: match.url,
        caption: 'ERModel',
        canClose: true,
        rs
      }));
    } else {
      if (!viewTab.rs || viewTab.rs.length !== rs.length) {
        dispatch(gdmnActions.updateViewTab({
          url: match.url,
          viewTab: {
            rs
          }
        }));
      }
    }
  }, [entities, attributes, viewTab]);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'loadEntity',
      disabled: !entities || !entities.size,
      text: 'Load entity',
      iconProps: {
        iconName: 'Table'
      },
      onClick: () => !!entities && !!entities.size && history.push(`entity/${entities.getString('name')}`)
    },
    {
      key: 'reloadERModel',
      text: entities ? 'Reload ERModel' : 'Load ERModel',
      iconProps: {
        iconName: 'DatabaseSync'
      },
      onClick: () => dispatch(gdmnActionsAsync.apiGetSchema())
    },
    {
      key: 'Inspector',
      disabled: !entities || !entities.size,
      text: 'Show Inspector',
      iconProps: {
        iconName: 'FileCode'
      },
      onClick: () => setShowInspector(true)
    },
    {
      key: 'addEntity',
      text: 'Add',
      iconProps: {
        iconName: 'Add'
      },
      onClick: () => history.push(`entityDlg/create/${Math.floor(Math.random() * 999_999_999_999)}`)
    },
    {
      key: 'UpdateEntity',
      disabled: !entities || !entities.size,
      text: 'Edit',
      iconProps: {
        iconName: 'Edit'
      },
      onClick: () => !!entities && !!entities.size && history.push(`entityDlg/${entities.getString('name')}`)
    },
    {
      key: 'deleteEntity',
      disabled: !entities || !entities.size,
      text: 'Delete',
      iconProps: {
        iconName: 'Delete'
      },
      onClick: deleteRecord
    }
  ];

  const { onSetFilter, ...gridActions } = bindGridActions(dispatch);

  return (
    <div
      styleName="MDGrid"
      style={{
        borderLeft: '1px solid ' + getTheme().palette.themeDarker
      }}
    >
      <div styleName="MDGridTop">
        <CommandBar items={commandBarItems} />
        <MessageBox />
      </div>
      {
        showInspector && entities && entities.size && erModel &&
        <InspectorForm
          entity={erModel.entities[entities.getString('name')]}
          onDismiss={ () => setShowInspector(false) }
        />
      }
      <div
        styleName="MDGridMasterTop"
        style={{
          paddingLeft: '8px',
          paddingRight: '8px',
          paddingBottom: '8px'
        }}
      >
        <TextField
          disabled={!entities}
          label="Filter:"
          value={entitiesFilter.current}
          onChange={ (_, filter) => {
              if (filter !== undefined && entities) {
                entitiesFilter.current = filter;
                onSetFilter({ rs: entities, filter });
              }
          } }
        />
      </div>
      <div styleName="MDGridMasterTable">
        {
          entities && gcsEntities &&
          <GDMNGrid
            {...gcsEntities}
            rs={entities}
            columns={gcsEntities.columns}
            {...gridActions}
            ref={ grid => grid && (gridRefEntities.current = grid) }
            savedState={getSavedStateEntities()}
            colors={gridColors}
          />
        }
      </div>
      <div
        styleName="MDGridDetailTop"
        style={{
          paddingLeft: '8px',
          paddingRight: '8px',
          paddingBottom: '8px'
        }}
      >
        <TextField
          disabled={!attributes}
          label="Filter:"
          value={attributesFilter.current}
          onChange={ (_, filter) => {
            if (filter !== undefined && attributes) {
              onSetFilter({ rs: attributes, filter });
              attributesFilter.current = filter;
            }
          } }
        />
      </div>
      <div styleName="MDGridDetailTable">
        { attributes && gcsAttributes &&
          <GDMNGrid
            {...gcsAttributes}
            rs={attributes}
            columns={gcsAttributes.columns}
            {...gridActions}
            ref={ grid => grid && (gridRefAttributes.current = grid) }
            savedState={getSavedStateAttributes()}
            colors={gridColors}
          />
        }
      </div>
    </div>
  )
}, styles, { allowMultiple: true });

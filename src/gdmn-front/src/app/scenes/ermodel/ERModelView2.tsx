import {IERModelView2Props} from "./ERModelView2.types";
import React, {useCallback, useEffect, useState} from "react";
import {IDataRow, RecordSet, rsActions, TFieldType} from "gdmn-recordset";
import {List} from "immutable";
import {createGrid, GDMNGrid, IUserColumnsSettings} from "gdmn-grid";
import {gdmnActions, gdmnActionsAsync} from "../gdmn/actions";
import {CommandBar, ICommandBarItemProps, TextField} from "office-ui-fabric-react";
import {bindGridActions} from "./utils";
import CSSModules from 'react-css-modules';
import styles from './EntityDataView/styles.css';
import {InspectorForm} from "@src/app/components/InspectorForm";
import {useSaveGridState} from "./EntityDataView/useSavedGridState";
import {apiService} from "@src/app/services/apiService";
import { useSettings } from "@src/app/hooks/useSettings";
import { ERModel } from "gdmn-orm";
import { useMessageBox } from "@src/app/components/MessageBox/MessageBox";

export const ERModelView2 = CSSModules( (props: IERModelView2Props) => {

  const { entities, attributes, viewTab, erModel, dispatch, gcsEntities, gcsAttributes, match, gridColors, history } = props;
  const [showInspector, setShowInspector] = useState(false);
  const entitiesFilter = entities && entities.filter && entities.filter.conditions.length ? entities.filter.conditions[0].value : '';
  const attributesFilter = attributes && attributes.filter && attributes.filter.conditions.length ? attributes.filter.conditions[0].value : '';
  const [gridRefEntities, getSavedStateEntities] = useSaveGridState(dispatch, match.url, viewTab, 'entities');
  const [gridRefAttributes, getSavedStateAttributes] = useSaveGridState(dispatch, match.url, viewTab, 'attributes');
  const [MessageBox, messageBox] = useMessageBox();

  const [userColumnsSettingsEntity, setUserColumnsSettingsEntity, delUserColumnSettingsEntity] = useSettings<IUserColumnsSettings>({ type: 'GRID.v1', objectID: 'erModel/entity' });
  const [userColumnsSettingsAttr, setUserColumnsSettingsAttr, delUserColumnSettings] = useSettings<IUserColumnsSettings>({ type: 'GRID.v1', objectID: 'erModel/attr' });

  const deleteRecord = useCallback( () => {
    if (entities && entities.size && erModel) {
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
            erModel.remove(entity);
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

  }, [erModel]);

  useEffect( () => {
    if (!erModel || !Object.keys(erModel.entities).length) {
      return;
    }

    if (!entities || !entities.size) {
      return;
    }

    const currEntity = entities.size ? entities.getString('name') : undefined;

    if (attributes) {
      if (!attributes.masterLink || attributes.masterLink.masterName !== entities.name) {
        throw new Error(`Invalid master-detail link for entities-attributes rs`);
      }

      if (attributes.masterLink.values[0].value !== currEntity) {
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
                values: [
                  {
                    fieldName: "name",
                    value: currEntity
                  }
                ]
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
            values: [
              {
                fieldName: 'name',
                value: currEntity
              }
            ]
          }
        })
      }));
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
      //commandBarButtonAs: entities && entities.size ? linkCommandBarButton(`entity/${entities.getString('name')}`) : undefined
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
      //commandBarButtonAs: linkCommandBarButton(`entityDlg/create/${Math.floor(Math.random() * 999_999_999_999)}`)
    },
    {
      key: 'editEntity',
      disabled: !entities || !entities.size,
      text: 'Edit',
      iconProps: {
        iconName: 'Edit'
      },
      onClick: () => !!entities && !!entities.size && history.push(`entityDlg/${entities.getString('name')}`)
      //commandBarButtonAs: entities && entities.size ? linkCommandBarButton(`entityDlg/${entities.getString('name')}`) : undefined
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
    <div styleName="MDGrid">
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
          value={entitiesFilter}
          onChange={ entities ? (_, newValue) => onSetFilter({ rs: entities, filter: newValue ? newValue : '' }) : undefined }
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
            userColumnsSettings={userColumnsSettingsEntity}
            onSetUserColumnsSettings={ userSettings => userSettings && setUserColumnsSettingsEntity(userSettings) }
            onDelUserColumnsSettings={ () => delUserColumnSettingsEntity() }
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
          value={attributesFilter}
          onChange={ attributes ? (_, newValue) => onSetFilter({ rs: attributes, filter: newValue ? newValue : '' }) : undefined }
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
            userColumnsSettings={userColumnsSettingsAttr}
            onSetUserColumnsSettings={ userSettings => userSettings && setUserColumnsSettingsAttr(userSettings) }
            onDelUserColumnsSettings={ () => delUserColumnSettings() }
          />
        }
      </div>
    </div>
  )
}, styles, { allowMultiple: true });

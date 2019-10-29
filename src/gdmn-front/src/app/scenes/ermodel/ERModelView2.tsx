import {IERModelView2Props} from "./ERModelView2.types";
import React, {useCallback, useEffect, useState} from "react";
import {IDataRow, RecordSet, rsActions, TFieldType} from "gdmn-recordset";
import {List} from "immutable";
import {createGrid, GDMNGrid, IUserColumnsSettings} from "gdmn-grid";
import {gdmnActions, gdmnActionsAsync} from "../gdmn/actions";
import {linkCommandBarButton} from "@src/app/components/LinkCommandBarButton";
import {CommandBar, ICommandBarItemProps, TextField} from "office-ui-fabric-react";
import {bindGridActions} from "./utils";
import CSSModules from 'react-css-modules';
import styles from './EntityDataView/styles.css';
import {InspectorForm} from "@src/app/components/InspectorForm";
import {useSaveGridState} from "./EntityDataView/useSavedGridState";
import {apiService} from "@src/app/services/apiService";
import { useSettings } from "@src/app/hooks/useSettings";

export const ERModelView2 = CSSModules( (props: IERModelView2Props) => {

  const { entities, attributes, viewTab, erModel, dispatch, gcsEntities, gcsAttributes, match, gridColors } = props;
  const [showInspector, setShowInspector] = useState(false);
  const entitiesFilter = entities && entities.filter && entities.filter.conditions.length ? entities.filter.conditions[0].value : '';
  const attributesFilter = attributes && attributes.filter && attributes.filter.conditions.length ? attributes.filter.conditions[0].value : '';
  const [gridRefEntities, getSavedStateEntities] = useSaveGridState(dispatch, match.url, viewTab, 'entities');
  const [gridRefAttributes, getSavedStateAttributes] = useSaveGridState(dispatch, match.url, viewTab, 'attributes');

  const [userColumnsSettingsEntity, setUserColumnsSettingsEntity, delUserColumnSettingsEntity] = useSettings<IUserColumnsSettings>({ type: 'GRID.v1', objectID: 'erModel/entity' });
  const [userColumnsSettingsAttr, setUserColumnsSettingsAttr, delUserColumnSettings] = useSettings<IUserColumnsSettings>({ type: 'GRID.v1', objectID: 'erModel/attr' });

  const deleteRecord = useCallback( () => {
    if (entities && entities.size) {
      dispatch(async dispatch => {

        const result = await apiService.deleteEntity({
          entityName: entities.getString('name')
        });

        if (!result.error) {
          dispatch(rsActions.setRecordSet(
            entities.delete(true)))
        }
      });
    }
  }, [entities, viewTab]);

  useEffect(() => {
    if (!erModel || !Object.keys(erModel.entities).length) {
      return;
    }

    if (!entities) {
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
    }
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
      commandBarButtonAs: entities && entities.size ? linkCommandBarButton(`entity/${entities.getString('name')}`) : undefined
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
      commandBarButtonAs: linkCommandBarButton(`entityDlg/create/${Math.floor(Math.random() * 999_999_999_999)}`)
    },
    {
      key: 'editEntity',
      disabled: !entities || !entities.size,
      text: 'Edit',
      iconProps: {
        iconName: 'Edit'
      },
      commandBarButtonAs: entities && entities.size ? linkCommandBarButton(`entityDlg/${entities.getString('name')}`) : undefined
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

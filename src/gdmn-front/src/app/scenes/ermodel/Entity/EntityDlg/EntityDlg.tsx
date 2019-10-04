import React, {useCallback, useEffect, useReducer} from "react";
import { IEntityDlgProps } from "./EntityDlg.types";
import { gdmnActions } from "@src/app/scenes/gdmn/actions";
import { IEntity, IAttribute, Entity, EntityUtils, isIEntity, GedeminEntityType, getGedeminEntityType } from "gdmn-orm";
import { Stack, TextField, Dropdown, CommandBar, ICommandBarItemProps } from "office-ui-fabric-react";
import { getLName } from "gdmn-internals";
import { EntityAttribute } from "./EntityAttribute";
import { Frame } from "@src/app/scenes/gdmn/components/Frame";
import { initAttr, ErrorLinks, validateAttributes, getErrorMessage } from "./utils";
import { useMessageBox } from "@src/app/components/MessageBox/MessageBox";
import { apiService } from "@src/app/services/apiService";
import { str2SemCategories } from "gdmn-nlp";
import { rsActions } from "gdmn-recordset";

/**
 * Диалоговое окно создания/изменения Entity.
 *
 * 1. Поскольку мы будем использовать один и тот же компонент как для создания сущности, так и для ее изменения,
 * возникает вопрос: откуда брать данные для рендера? Так как в случае создания мы еще не имеем объекта
 * сущности под рукой.
 *
 * 2. Для хранения прекрасно подойдут интерфейсы, которые используются в механизме сериализации из проекта gdmn-orm.
 *
 * 3. Таким образом, если компонент используется для редактирования сущности, мы при старте компируем все ее свойства
 * и параметры в объекты стэйта. Если компонент открывается в режиме создания, то просто инициализируем структуры
 * пустыми значениями.
 *
 * 4. Компонент содержит шапку -- название сущности, локализованное название, родителя, тип, и список атрибутов.
 * Для представления на экране атрибута мы создадим отдельный компонент, презентационный.
 *
 * 5. Для редактирования сущности компонент создается через React Router при переходе по url /spa/gdmn/entityDlg/<entityName>
 *
 * 6. Для создания сущности компонент создается через React Router при переходе по url
 * /spa/gdmn/entityDlg/create/<random_number>. Случайное число здесь мы используем как уникальный идентификатор,
 * чтобы позволить открыть одновременно несколько компонентов на экране и для того, чтобы как-то идентифицировать данные
 * в массиве ViewTabs, когда мы будем перемещаться между вкладками не завершив процедуру ввода данных.
 *
 */

function adjustEntityAttributes(entity: IEntity, newEntityType: GedeminEntityType): IEntity {
  if (getGedeminEntityType(entity) === newEntityType) {
    return entity;
  }

  const newEntity = {
    ...entity,
    attributes: entity.attributes.filter( attr => attr.name !== 'PARENT' && attr.name !== 'LB' && attr.name !== 'RB' )
  };

  switch (newEntityType) {
    case 'INHERITED':
      break;

    case 'LBRBTREE':
      newEntity.attributes = [
        {
          name: 'LB',
          type: 'Integer',
          required: true,
          lName: { ru: { name: 'Левая граница интервала' }},
          semCategories: ''
        },
        {
          name: 'RB',
          type: 'Integer',
          required: true,
          lName: { ru: { name: 'Правая граница интервала' }},
          semCategories: ''
        },
        ...newEntity.attributes
      ];

    case 'TREE':
      newEntity.attributes = [
        {
          name: 'PARENT',
          type: 'Parent',
          required: false,
          lName: { ru: { name: 'Ссылка на родительский уровень' }},
          semCategories: ''
        },
        ...newEntity.attributes
      ];
  }

  return newEntity;
};

interface IEntityDlgState {
  initialData?: IEntity;
  entityData?: IEntity;
  changed?: boolean;
  selectedAttr?: number;
  errorLinks: ErrorLinks;
  entityType: GedeminEntityType;
};

function isIEntityDlgState(obj: any): obj is IEntityDlgState {
  return obj instanceof Object && Array.isArray(obj.errorLinks);
};

type Action = { type: 'SET_ENTITY_DATA', entityData: IEntity }
  | { type: 'SET_STATE', state: IEntityDlgState }
  | { type: 'SELECT_ATTR', selectedAttr: number }
  | { type: 'UPDATE_ATTR', newAttr: IAttribute }
  | { type: 'ADD_ATTR' }
  | { type: 'DELETE_ATTR' }
  | { type: 'SET_ENTITY_TYPE', entityType: GedeminEntityType }
  | { type: 'CLEAR_ERROR', attrIdx: number, field: string }
  | { type: 'ADD_ERROR', attrIdx: number, field: string, message: string }
  | { type: 'REVERT' };

function reducer(state: IEntityDlgState, action: Action): IEntityDlgState {

  switch (action.type) {
    case 'SET_ENTITY_DATA': {
      const initialData = state.initialData ? state.initialData : action.entityData;
      const entityData = action.entityData;
      const entityType = getGedeminEntityType(entityData);

      return {
        ...state,
        initialData,
        entityData,
        selectedAttr: entityData && entityData.attributes && entityData.attributes.length ? 0 : undefined,
        changed: JSON.stringify(initialData) !== JSON.stringify(entityData),
        errorLinks: validateAttributes(entityData, entityType, state.errorLinks),
        entityType
      };
    }

    case 'SET_ENTITY_TYPE': {
      if (!state.entityData) {
        return state;
      }

      const entityData = adjustEntityAttributes(state.entityData, action.entityType);

      return {
        ...state,
        entityData,
        entityType: action.entityType,
        errorLinks: validateAttributes(entityData, action.entityType, state.errorLinks)
      };
    }

    case 'SELECT_ATTR': {
      return {
        ...state,
        selectedAttr: action.selectedAttr
      };
    }

    case 'ADD_ERROR': {
      const { attrIdx, field, message } = action;
      const { errorLinks } = state;
      return {
        ...state,
        errorLinks: errorLinks.find( l => l.attrIdx === attrIdx && l.field === field )
          ? errorLinks
          : [...errorLinks, { attrIdx, field, message, internal: true }]
      };
    }

    case 'CLEAR_ERROR': {
      return {
        ...state,
        errorLinks: state.errorLinks.filter( l => !l.internal || l.attrIdx !== action.attrIdx || l.field !== action.field )
      };
    }

    case 'UPDATE_ATTR': {
      const { entityData, selectedAttr } = state;

      if (!entityData || selectedAttr === undefined) {
        return state;
      }

      const newAttributes = [...entityData.attributes];
      newAttributes[selectedAttr] = action.newAttr;
      const newEntityData = {...entityData, attributes: newAttributes };

      return {
        ...state,
        entityData: newEntityData,
        changed: true,
        errorLinks: validateAttributes(newEntityData, state.entityType, state.errorLinks)
      };
    }

    case 'ADD_ATTR': {
      const { entityData, selectedAttr } = state;

      if (!entityData) {
        return state;
      }

      const newIdx = selectedAttr === undefined ? entityData.attributes.length : (selectedAttr + 1);
      const newAttributes = [...entityData.attributes];
      newAttributes.splice(newIdx, 0, initAttr('String'));
      const newEntityData = {...entityData, attributes: newAttributes };

      return {
        ...state,
        entityData: newEntityData,
        selectedAttr: newIdx,
        changed: true,
        errorLinks: validateAttributes(newEntityData, state.entityType, state.errorLinks)
      };
    }

    case 'DELETE_ATTR': {
      const { entityData, selectedAttr, initialData } = state;

      if (!entityData || selectedAttr === undefined) {
        return state;
      }

      const newAttributes = [...entityData.attributes];
      newAttributes.splice(selectedAttr, 1);

      const newEntityData = {...entityData, attributes: newAttributes };

      return {
        ...state,
        entityData: newEntityData,
        selectedAttr: !newAttributes.length
          ? undefined
          : selectedAttr >= newAttributes.length
          ? newAttributes.length - 1
          : selectedAttr,
        changed: JSON.stringify(initialData) !== JSON.stringify(newEntityData),
        errorLinks: validateAttributes(newEntityData, state.entityType, state.errorLinks)
      };
    }

    case 'SET_STATE':
      return action.state;

    case 'REVERT': {
      if (state.initialData) {
        return {
          ...state,
          entityData: state.initialData,
          selectedAttr: state.initialData && state.initialData.attributes && state.initialData.attributes.length ? 0 : undefined,
          changed: false,
          errorLinks: validateAttributes(state.initialData, getGedeminEntityType(state.initialData), state.errorLinks)
        }
      }
    }
  }

  return state;
};

export function EntityDlg(props: IEntityDlgProps): JSX.Element {
  const { entityName, erModel, viewTab, createEntity, dispatch, url, uniqueID, history, entities } = props;

  if ((createEntity && entityName) || (!createEntity && !entityName) || (createEntity && !uniqueID)) {
    throw new Error('Invalid EntityDlg props');
  }

  const entity = erModel && entityName && erModel.entities[entityName];
  const [state, dlgDispatch] = useReducer(reducer, { errorLinks: [], entityType: 'SIMPLE' });
  const [MessageBox, messageBox] = useMessageBox();
  const { entityData, changed, selectedAttr, errorLinks, entityType } = state;

  const deleteViewTab = () => { dispatch(gdmnActions.deleteViewTab({
    viewTabURL: url,
    locationPath: location.pathname,
    historyPush: history.push
  }))};

  const postChanges = useCallback(async (close: boolean) => {
    if (createEntity && entityData && erModel) {
      const result = await apiService.AddEntity(entityData);

      // FIXME: а если ошибка? ее надо как-то вывести в окне
      // например, предусмотреть для нее стейт и панель

      if (!result.error && isIEntity(result.payload.result)) {
        const iEntity = result.payload.result as IEntity;

        const entity = new Entity({
          name: iEntity.name,
          lName: iEntity.lName,
          parent: iEntity.parent ? erModel.entity(iEntity.parent) : undefined,
          isAbstract: iEntity.isAbstract,
          semCategories: str2SemCategories(iEntity.semCategories),
          adapter: iEntity.adapter,
          unique: iEntity.unique
        });
        iEntity.attributes.forEach( attr => entity.add(EntityUtils.createAttribute(attr, entity, erModel)) );

        // FIXME: так а где собственно добавление новой entity в ERModel?

        // entities -- recordset, который нужен нам только для отображения
        // erModel в гриде на соответствующей вкладке.
        // просто удалим его. он пересоздастся, когда будет надо.
        if (entities) {
          dispatch(rsActions.deleteRecordSet({ name: entities.name }));
        }

        // закрывать вкладку имеет смысл, только если все прошло успешно
        // если ошибка -- мы должны остаться на вкладке
        if (close) {
          deleteViewTab();
        }
      }
    }
  }, [changed, entityData, entities, createEntity, erModel]);

  useEffect( () => {
    if (!viewTab) {
      dispatch(gdmnActions.addViewTab({
        url,
        caption: createEntity ? 'New Entity' : `Entity: ${entityName}`,
        canClose: true
      }));
    }
  }, [viewTab, entityName, createEntity]);

  useEffect( () => {
    return () => {
      dispatch(gdmnActions.saveSessionData({
        viewTabURL: url,
        sessionData: state
      }));
    };
  }, [state, url]);

  useEffect( () => {
    if (!entityData && erModel) {
      if (viewTab && isIEntityDlgState(viewTab.sessionData)) {
        dlgDispatch({ type: 'SET_STATE', state: viewTab.sessionData });
      } else {
        if (entity) {
          dlgDispatch({ type: 'SET_ENTITY_DATA', entityData: entity.serialize(true) });
        } else {
          dlgDispatch({
            type: 'SET_ENTITY_DATA',
            entityData: {
              name: '',
              lName: { ru: { name: '' }},
              isAbstract: false,
              semCategories: '',
              unique: [[]],
              attributes: []
            }
          });
        }
      }
    }
  }, [entityData, viewTab, erModel, entity]);

  if (!entityData || !erModel) {
    return <div>Loading...</div>;
  }

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'saveAndClose',
      disabled: !changed || (errorLinks && !!errorLinks.length),
      text: 'Сохранить',
      iconProps: {
        iconName: 'Save'
      },
      onClick: () => postChanges(true)
    },
    {
      key: 'cancelAndClose',
      text: changed ? 'Отменить' : 'Закрыть',
      iconProps: {
        iconName: 'Cancel'
      },
      onClick: deleteViewTab
    },
    {
      key: 'apply',
      disabled: !changed || (errorLinks && !!errorLinks.length),
      text: 'Применить',
      iconProps: {
        iconName: 'CheckMark'
      },
    },
    {
      key: 'revert',
      disabled: !changed,
      text: 'Вернуть',
      iconProps: {
        iconName: 'Undo'
      },
      onClick: () => dlgDispatch({ type: 'REVERT' })
    },
    {
      key: 'addAttr',
      disabled: false,
      text: 'Добавить атрибут',
      iconProps: {
        iconName: 'Add'
      },
      onClick: () => dlgDispatch({ type: 'ADD_ATTR' })
    },
    {
      key: 'deleteAttr',
      disabled: selectedAttr === undefined,
      text: 'Удалить атрибут',
      iconProps: {
        iconName: 'Delete'
      },
      onClick: () => dlgDispatch({ type: 'DELETE_ATTR' })
    },
    {
      key: 'showAdapter',
      disabled: !entityData || !entityData.adapter,
      text: 'Показать адаптер',
      iconProps: {
        iconName: 'PageData'
      },
      onClick: () => messageBox({
        title: 'Adapter',
        message: JSON.stringify(entityData.adapter, undefined, 2),
        code: true
      })
    }
  ];

  return (
    <>
      <CommandBar items={commandBarItems} />
      <MessageBox />
      <Frame scroll height='calc(100% - 42px)'>
        <Frame border marginLeft marginRight>
          <Stack horizontal tokens={{ childrenGap: '0px 16px' }}>
            <Stack.Item>
              <TextField
                label="Name:"
                value={entityData.name}
                errorMessage={getErrorMessage('entityName', errorLinks)}
                readOnly={!createEntity}
                onChange={ (_, newValue) => newValue !== undefined && dlgDispatch({ type: 'SET_ENTITY_DATA', entityData: { ...entityData, name: newValue } }) }
                styles={{
                  root: {
                    width: '240px'
                  }
                }}
              />
            </Stack.Item>
            <Stack.Item>
              <Dropdown
                label="Type:"
                options={[
                  { key: 'SIMPLE', text: 'Simple' },
                  { key: 'TREE', text: 'Tree' },
                  { key: 'LBRBTREE', text: 'LB-RB Tree' },
                  { key: 'INHERITED', text: 'Inherited' }
                ]}
                selectedKey={entityType}
                disabled={!createEntity}
                onChange={ (_, newValue) => newValue && dlgDispatch({ type: 'SET_ENTITY_TYPE', entityType: newValue.key as GedeminEntityType }) }
                styles={{
                  root: {
                    width: '240px'
                  }
                }}
              />
            </Stack.Item>
            <Stack.Item>
              <Dropdown
                label="Parent:"
                options={Object.keys(erModel.entities).map( name => ({ key: name, text: name }) )}
                selectedKey={entityData.parent}
                errorMessage={getErrorMessage('entityParent', errorLinks)}
                disabled={!createEntity || entityType !== 'INHERITED'}
                onChange={ (_, newValue) => newValue && dlgDispatch({ type: 'SET_ENTITY_DATA', entityData: { ...entityData, parent: newValue.key as string } }) }
                styles={{
                  root: {
                    width: '240px'
                  }
                }}
              />
            </Stack.Item>
            <Stack.Item>
              <TextField
                label="Semantic categories:"
                value={entityData.semCategories}
                onChange={ (_, newValue) => newValue !== undefined && dlgDispatch({ type: 'SET_ENTITY_DATA', entityData: { ...entityData, semCategories: newValue } }) }
                styles={{
                  root: {
                    width: '240px'
                  }
                }}
              />
            </Stack.Item>
            <Stack.Item grow={1}>
              <TextField
                label="Description:"
                value={getLName(entityData.lName, ['ru'])}
                onChange={ (_, newValue) => newValue !== undefined && dlgDispatch({ type: 'SET_ENTITY_DATA', entityData: { ...entityData, lName: { ru: { name: newValue } } } }) }
              />
            </Stack.Item>
          </Stack>
        </Frame>
        <Frame marginTop marginLeft marginRight>
          <Stack>
            {
              entityData.attributes.map( (attr, attrIdx) =>
                <EntityAttribute
                  key={`${attrIdx}-${attr.type}`}
                  attr={attr}
                  createAttribute={true}
                  selected={attrIdx === selectedAttr}
                  errorLinks={errorLinks && errorLinks.filter( l => l.attrIdx === attrIdx )}
                  onChange={ newAttr => dlgDispatch({ type: 'UPDATE_ATTR', newAttr }) }
                  onSelect={ () => dlgDispatch({ type: 'SELECT_ATTR', selectedAttr: attrIdx }) }
                  onError={ (field, message) => dlgDispatch({ type: 'ADD_ERROR', attrIdx, field, message }) }
                  onClearError={ field => dlgDispatch({ type: 'CLEAR_ERROR', attrIdx, field }) }
                  erModel={erModel}
                />
              )
            }
          </Stack>
        </Frame>
      </Frame>
    </>
  );
};

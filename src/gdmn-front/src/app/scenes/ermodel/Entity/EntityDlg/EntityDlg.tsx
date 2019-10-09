import React, {useCallback, useEffect, useReducer, useState} from "react";
import { IEntityDlgProps } from "./EntityDlg.types";
import { gdmnActions } from "@src/app/scenes/gdmn/actions";
import { IEntity, IAttribute, Entity, EntityUtils, isIEntity, GedeminEntityType, getGedeminEntityType, isUserDefined } from "gdmn-orm";
import { Stack, TextField, Dropdown, CommandBar, ICommandBarItemProps } from "office-ui-fabric-react";
import { getLName } from "gdmn-internals";
import { EntityAttribute } from "./EntityAttribute";
import { Frame } from "@src/app/scenes/gdmn/components/Frame";
import { initAttr, ErrorLinks, validateAttributes, getErrorMessage, getTempID, isTempID } from "./utils";
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

function adjustEntityAttributes(attributes: IAttribute[] = [], newEntityType: GedeminEntityType = 'SIMPLE'): IAttribute[] {

  const id: IAttribute = {
    name: 'ID',
    type: 'Sequence',
    required: false,
    lName: { ru: { name: 'Идентификатор' }},
    semCategories: '',
    id: getTempID(),
  };

  const inheritedKey: IAttribute = {
    name: 'INHERITEDKEY',
    type: 'Integer',
    required: false,
    lName: { ru: { name: 'Идентификатор' }},
    semCategories: ''
  };

  const lb: IAttribute = {
    name: 'LB',
    type: 'Integer',
    required: true,
    lName: { ru: { name: 'Левая граница интервала' }},
    semCategories: ''
  };

  const rb: IAttribute = {
    name: 'RB',
    type: 'Integer',
    required: true,
    lName: { ru: { name: 'Правая граница интервала' }},
    semCategories: ''
  };

  const parent: IAttribute = {
    name: 'PARENT',
    type: 'Parent',
    required: false,
    lName: { ru: { name: 'Ссылка на родительский уровень' }},
    semCategories: ''
  };

  const editionDate: IAttribute = {
    name: 'EDITIONDATE',
    type: 'Date',
    required: false,
    lName: { ru: { name: 'Дата модификации' }},
    semCategories: ''
  };

  const temp = attributes.filter( attr => attr.name !== 'PARENT' && attr.name !== 'LB' && attr.name !== 'RB' && attr.name !== 'ID' && attr.name !== 'EDITIONDATE');

  switch (newEntityType) {
    case 'INHERITED':
      return [inheritedKey, ...temp];

    case 'SIMPLE':{
      return [id, editionDate, ...temp];}

    case 'LBRBTREE':
      return [id, parent, lb, rb, editionDate, ...temp];

    case 'TREE':
      return [id, parent, editionDate, ...temp];
  }
};

interface IEntityDlgState {
  // это начальная структура сущности в тот момент, когда
  // мы открыли окно на редактирование
  // сравнивая ее (содержимое, не объект!) с entityData
  // мы можем понять у нас поменялось что-то или нет
  // и соответствующим образом настраивать кнопки на
  // тулбаре. при создании новой сущности
  // initialData === undefined
  initialData?: IEntity;

  // это текущее состояние сущности в процессе редактирования
  // из этого объекта рендерится содержимое экрана
  entityData?: IEntity;
  changed?: boolean;
  selectedAttr?: number;
  errorLinks: ErrorLinks;
  // entityType: GedeminEntityType;
};

function isIEntityDlgState(obj: any): obj is IEntityDlgState {
  return obj instanceof Object && Array.isArray(obj.errorLinks);
};

type Action =
  // мы открываем на редактирование сущность, надо
  // на основе данных из ermodel сформировать данные
  // для нашего стэйта
  { type: 'SET_ENTITY_DATA', entityData: IEntity }
  // мы будем создавать новую сущность, надо
  // инициализировать данные нашего стэйта
  | { type: 'CREATE_ENTITY_DATA' }
  // мы в процессе создания/редактирования сущности
  // что-то меняется, например ее название
  | { type: 'EDIT_ENTITY_DATA', entityData: IEntity }
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
      const entityData = {
        ...action.entityData,
        attributes: action.entityData.attributes.map(
          attr => attr.id ? attr : { ...attr, id: getTempID() }
        )
      };

      entityData.attributes.forEach(
        (attr1, idx1) => entityData.attributes.forEach(
          (attr2, idx2) => console.assert(idx1 === idx2 || (idx1 !== idx2 && attr1.id !== attr2.id), `Duplicate attr ID: ${attr1.id}`)
        )
      );

      return {
        ...state,
        initialData: entityData,
        entityData,
        selectedAttr: entityData && entityData.attributes && entityData.attributes.length ? 0 : undefined,
        changed: false,
        errorLinks: [],
       // entityType: getGedeminEntityType(entityData)
      };
    }

    // вызывается при создании новой entity
    case 'CREATE_ENTITY_DATA': {
      return {
        ...state,
        initialData: undefined,
        entityData: {
          name: '',
          lName: { ru: { name: '' }},
          isAbstract: false,
          semCategories: '',
          unique: [[]],
          attributes: adjustEntityAttributes()
        },
        selectedAttr: 0,
        changed: true,
        errorLinks: [],
        //entityType: 'SIMPLE'
      };
    }

    // вызывается при реактировании entity
    case 'EDIT_ENTITY_DATA': {
      const { initialData, errorLinks } = state;

      return {
        ...state,
        entityData: action.entityData,
        changed: initialData === undefined || JSON.stringify(initialData) !== JSON.stringify(action.entityData),
        errorLinks: validateAttributes(action.entityData, errorLinks)
      }
    }

    case 'SET_ENTITY_TYPE': {
      if (!state.entityData) {
        return state;
      }

      const { initialData, errorLinks } = state;
      const entityData = {
        ...state.entityData,
        attributes: adjustEntityAttributes(state.entityData.attributes, action.entityType)
      };
      return {
        ...state,
        entityData,
        changed: initialData === undefined || JSON.stringify(initialData) !== JSON.stringify(entityData),
        errorLinks: validateAttributes(entityData, errorLinks)
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
      console.log(newEntityData);
      return {
        ...state,
        entityData: newEntityData,
        changed: true,
        errorLinks: validateAttributes(newEntityData, state.errorLinks)
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
      console.log(newEntityData);
      return {
        ...state,
        entityData: newEntityData,
        selectedAttr: newIdx,
        changed: true,
        errorLinks: validateAttributes(
          newEntityData,
          state.errorLinks.map(
            l => l.internal && l.attrIdx !== undefined && l.attrIdx >= newIdx ? {...l, attrIdx: l.attrIdx + 1} : l
          )
        )
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
        errorLinks: validateAttributes(
          newEntityData,
          state.errorLinks
            .filter( l => l.attrIdx === undefined || l.attrIdx !== selectedAttr )
            .map( l => l.internal && l.attrIdx !== undefined && l.attrIdx > selectedAttr ? {...l, attrIdx: l.attrIdx - 1} : l )
        )
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
          errorLinks: validateAttributes(state.initialData, state.errorLinks)
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
  const [state, dlgDispatch] = useReducer(reducer, { errorLinks: [] });
  const [MessageBox, messageBox] = useMessageBox();
  const { entityData, changed, selectedAttr, errorLinks, initialData } = state;

  const deleteViewTab = () => { dispatch(gdmnActions.deleteViewTab({
    viewTabURL: url,
    locationPath: location.pathname,
    historyPush: history.push
  }))};

  const postChanges = useCallback(async (close: boolean) => {
    console.log(initialData);
    if (entityData && erModel) {
      if (createEntity) {
        // временные ID атрибутов надо убрать перед отсылкой на сервер!
        const result = await apiService.addEntity({
          ...entityData,
          attributes: entityData.attributes.filter(a => a.name !== 'ID').map( attr => isTempID(attr.id) ? {...attr, id: undefined} : attr )
        });

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
      else if (initialData) {
        // TODO: мы никак пока не отображаем ошибки при удалении атрибута
        // TODO: после удаления атрибута надо обновить ERModel
        console.log(initialData);
        const r = initialData.attributes.every( async attr => {
          if (!entityData.attributes.find( attr2 => attr2.name === attr.name )) {
            const result = await apiService.deleteAttribute({
              entityData: initialData,
              attrName: attr.name
            });

            return !result.error;
          } else {
           return true;
          }
        });

        if (r && close) {
          deleteViewTab();
        }
      }
    }
  }, [changed, entityData, entities, createEntity, erModel, initialData]);

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

  // here we load entityData from ERModel
  useEffect( () => {
    if (!entityData && erModel) {
      if (viewTab && isIEntityDlgState(viewTab.sessionData)) {
        dlgDispatch({ type: 'SET_STATE', state: viewTab.sessionData });
      } else {
        entity
          ? dlgDispatch({ type: 'SET_ENTITY_DATA', entityData: entity.serialize(true) })
          : dlgDispatch({ type: 'CREATE_ENTITY_DATA' });
      }
    }
  }, [entityData, viewTab, erModel, entity]);

  if (!entityData || !erModel) {
    return <div>Loading...</div>;
  }

  const entityType = getGedeminEntityType(entityData);

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
      disabled: !entityType,
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
      onClick: async () => dlgDispatch({type: 'DELETE_ATTR'})
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
        message: JSON.stringify(entityData && entityData.adapter, undefined, 2),
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
                onChange={ (_, newValue) => newValue !== undefined && dlgDispatch({ type: 'EDIT_ENTITY_DATA', entityData: { ...entityData, name: newValue } }) }
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
                onChange={ (_, newValue) => newValue && dlgDispatch({ type: 'EDIT_ENTITY_DATA', entityData: { ...entityData, parent: newValue.key as string } }) }
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
                onChange={ (_, newValue) => newValue !== undefined && dlgDispatch({ type: 'EDIT_ENTITY_DATA', entityData: { ...entityData, semCategories: newValue } }) }
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
                onChange={ (_, newValue) => newValue !== undefined && dlgDispatch({ type: 'EDIT_ENTITY_DATA', entityData: { ...entityData, lName: { ru: { name: newValue } } } }) }
              />
            </Stack.Item>
          </Stack>
        </Frame>
        <Frame marginTop marginLeft marginRight>
          <Stack>
            {
              entityData.attributes.map( (attr, attrIdx) => {
                const createAttr = !initialData || !initialData.attributes.find( prevAttr => prevAttr.name === attr.name );
                return (
                  <EntityAttribute
                    key={attr.id}
                    attr={attr}
                    createAttr={createAttr}
                    userDefined={isUserDefined(attr.name)}
                    selected={attrIdx === selectedAttr}
                    errorLinks={errorLinks && errorLinks.filter( l => l.attrIdx === attrIdx )}
                    onChange={ newAttr => dlgDispatch({ type: 'UPDATE_ATTR', newAttr }) }
                    onSelect={ () => dlgDispatch({ type: 'SELECT_ATTR', selectedAttr: attrIdx }) }
                    onError={ (field, message) => dlgDispatch({ type: 'ADD_ERROR', attrIdx, field, message }) }
                    onClearError={ field => dlgDispatch({ type: 'CLEAR_ERROR', attrIdx, field }) }
                    erModel={erModel}
                  />
                );
              } )
            }
          </Stack>
        </Frame>
      </Frame>
    </>
  );
};

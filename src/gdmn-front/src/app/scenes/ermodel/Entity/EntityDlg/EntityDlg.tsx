import React, { useCallback, useEffect, useReducer, useMemo } from "react";
import { IEntityDlgProps } from "./EntityDlg.types";
import { gdmnActions, gdmnActionsAsync } from "@src/app/scenes/gdmn/actions";
import { IEntity, IAttribute, GedeminEntityType, getGedeminEntityType, isUserDefined, isIEntity, ISequenceAttribute, deserializeEntity, deserializeAttributes, ERModel, IEntityAttribute } from "gdmn-orm";
import { Stack, TextField, Dropdown, CommandBar, ICommandBarItemProps } from "office-ui-fabric-react";
import { getLName } from "gdmn-internals";
import { EntityAttribute } from "./EntityAttribute";
import { Frame } from "@src/app/scenes/gdmn/components/Frame";
import { initAttr, ErrorLinks, validateAttributes, getErrorMessage, getTempID, isTempID } from "./utils";
import { useMessageBox } from "@src/app/components/MessageBox/MessageBox";
import { apiService } from "@src/app/services/apiService";

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

  // TODO Доделать выбор sequence на фронте, по умолчанию подставлять Constants.GLOBAL_GENERATOR
  const id: ISequenceAttribute = {
    name: 'ID',
    type: 'Sequence',
    sequence: 'GD_G_UNIQUE',
    required: true,
    lName: { ru: { name: 'Идентификатор' }},
    semCategories: '',
    id: getTempID()
  };

  const inheritedKey: IAttribute = {
    name: 'INHERITEDKEY',
    type: 'Integer',
    required: true,
    lName: { ru: { name: 'Идентификатор' }},
    semCategories: '',
    id: getTempID()
  };

  const lb: IAttribute = {
    name: 'LB',
    type: 'Integer',
    required: true,
    lName: { ru: { name: 'Левая граница интервала' }},
    semCategories: '',
    id: getTempID()
  };

  const rb: IAttribute = {
    name: 'RB',
    type: 'Integer',
    required: true,
    lName: { ru: { name: 'Правая граница интервала' }},
    semCategories: '',
    id: getTempID()
  };

  const parent: IEntityAttribute = {
    name: 'PARENT',
    type: 'Parent',
    required: false,
    lName: { ru: { name: 'Ссылка на родительский уровень' }},
    semCategories: '',
    references: [],
    id: getTempID()
  };

  const editionDate: IAttribute = {
    name: 'EDITIONDATE',
    type: 'Date',
    required: false,
    lName: { ru: { name: 'Дата модификации' }},
    semCategories: '',
    id: getTempID()
  };

  const temp = attributes.filter( attr => attr.name !== 'PARENT' && attr.name !== 'LB' && attr.name !== 'RB' && attr.name !== 'ID' && attr.name !== 'EDITIONDATE' && attr.name !== 'INHERITEDKEY' );

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

  // список для удаления атрибутов
  attrDeleteList?: string[];

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
  | { type: 'UPDATE_ENTITY_DATA', entityData: IEntity }
  // обновляем InitialData после удаления атрибутов
  // для сравнения при обновлении\добвлении уже без удалённых
  | { type: 'SET_INITIAL_DATA', newInitialData: IEntity }
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
        attrDeleteList: [],
        entityData,
        selectedAttr: entityData && entityData.attributes && entityData.attributes.length ? 0 : undefined,
        changed: false,
        errorLinks: []
      };
    }

    // вызывается при создании новой entity
    case 'CREATE_ENTITY_DATA': {
      return {
        ...state,
        initialData: undefined,
        attrDeleteList: [],
        entityData: {
          name: 'USR$',
          lName: { ru: { name: '' }},
          isAbstract: false,
          semCategories: '',
          unique: [[]],
          attributes: adjustEntityAttributes()
        },
        selectedAttr: undefined,
        changed: true,
        errorLinks: [],
        //entityType: 'SIMPLE'
      };
    }

    // вызывается при реактировании entity
    case 'UPDATE_ENTITY_DATA': {
      const { initialData, errorLinks } = state;

      return {
        ...state,
        entityData: action.entityData,
        changed: initialData === undefined || JSON.stringify(initialData) !== JSON.stringify(action.entityData),
        errorLinks: validateAttributes(action.entityData, errorLinks)
      }
    }

    case 'SET_INITIAL_DATA': {
      return {
        ...state,
        initialData: action.newInitialData,
        attrDeleteList: undefined
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
      const { entityData, selectedAttr, initialData, attrDeleteList } = state;

      if (!entityData || selectedAttr === undefined) {
        return state;
      }

      const newAttributes = [...entityData.attributes];
      const deletedAttr = newAttributes.splice(selectedAttr, 1)[0];

      const newAttrDeleteList = initialData?.attributes.find(i => i.name === deletedAttr.name)
        ? [...attrDeleteList || [], deletedAttr.name]
        : [...attrDeleteList || []];

      const newEntityData = {...entityData, attributes: newAttributes };

      return {
        ...state,
        entityData: newEntityData,
        attrDeleteList: newAttrDeleteList,
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
  const { entityName, erModel, viewTab, createEntity, dispatch, url, uniqueID, history } = props;

  if ((createEntity && entityName) || (!createEntity && !entityName) || (createEntity && !uniqueID)) {
    throw new Error('Invalid EntityDlg props');
  }

  const entity = erModel && entityName && erModel.entities[entityName];
  const [state, dlgDispatch] = useReducer(reducer, { errorLinks: [] });
  const [MessageBox, messageBox] = useMessageBox();
  const { entityData, changed, selectedAttr, errorLinks, initialData, attrDeleteList } = state;

  const deleteViewTab = () => { dispatch(gdmnActions.deleteViewTab({
    viewTabURL: url,
    locationPath: location.pathname,
    historyPush: history.push
  }))};

  const postChanges = useCallback(async (close: boolean) => {
    if (!entityData || !erModel) return;

    if (createEntity) {
      const result = await apiService.addEntity({
        ...entityData,
        attributes: entityData.attributes
          .map(attr => attr.name === 'PARENT' ? {...attr, references: [entityData.name]}: attr)
          .map(attr => isTempID(attr.id) ? {...attr, id: undefined } : attr)
      });

      if (result.error) {
        dispatch(gdmnActions.updateViewTab({ url, viewTab: { error: result.error.message } }));
      } else {
        dispatch(gdmnActionsAsync.apiGetSchema());
        // const sEntity = result.payload.result;
        // if (!isIEntity(sEntity)) throw new Error('Wrong type of data');
        // const newERModel = new ERModel(erModel);
        // newERModel.add(deserializeEntity(newERModel, sEntity, true));
        // deserializeAttributes(newERModel, sEntity, true);
        // dispatch(gdmnActions.setSchema(newERModel));
        close && deleteViewTab();
      }
    } else {
      console.log('update entity');
      // 1. Удаляем атрибуты
      await deleteAtributes()
      // 1. Добавляем новые атрибуты
      await addAtributes();
      // 2. Обновляем изменённые атрибуты
      await updateAtributes();
      // 3. Сохраняем измения сущности
      await updateEntity();

      close && deleteViewTab();
    }

    if (!close) dlgDispatch({ type: 'SET_ENTITY_DATA', entityData });
  }, [changed, entityData, createEntity, erModel]);

  const updateEntity = useCallback(async () => {
    if (!entityData || !erModel || !initialData) return;
    // проверять всё кроме атрибутов
    const checkInitialData = {...initialData};
    delete checkInitialData.attributes;
    const checkEntityData = {...entityData};
    delete checkEntityData.attributes;

    if (JSON.stringify(checkInitialData) === JSON.stringify(checkEntityData)) return;

    const result = await apiService.updateEntity({
      ...entityData,
    });

    if (result.error) {
      dispatch(gdmnActions.updateViewTab({ url, viewTab: { error: result.error.message } }));
      throw new Error(result.error.message);
    }

    dispatch(gdmnActionsAsync.apiGetSchema());
  }, [entityData, erModel, initialData]);


  const addAtributes = useCallback(async () => {
    if (!entityData || !erModel || !initialData) return;

    const attrList = entityData.attributes.filter((attr) => !initialData.attributes.filter(i => !attrDeleteList?.includes(i.name)).find(prevAttr => prevAttr.name === attr.name));

    for (const attr of attrList) {
      const result = await apiService.addAttribute({
        entityData,
        attrData: attr
      });

      if (result.error) {
        dispatch(gdmnActions.updateViewTab({ url, viewTab: { error: result.error.message } }));
        throw new Error(result.error.message);
      }

      dispatch(gdmnActionsAsync.apiGetSchema());
    }
  }, [entityData, erModel, initialData]);

  const deleteAtributes = useCallback(async () => {
    if (!entityData || !erModel || !initialData || !attrDeleteList) return;

  // const attrList = initialData.attributes.filter(attr =>
    //   !entityData.attributes.find(prevAttr => prevAttr.name === attr.name)
    // );

    const attrList = initialData.attributes.filter(attr =>
      attrDeleteList.find(prevAttr => prevAttr === attr.name)
    );

    for (const attr of attrList) {
      const result = await apiService.deleteAttribute({
        entityData,
        attrName: attr.name
      });

      if (result.error) {
        dispatch(gdmnActions.updateViewTab({ url, viewTab: { error: result.error.message } }));
        throw new Error(result.error.message);
      }

      // const newInitialData = {...initialData, attributes: initialData.attributes.filter(attr => attrDeleteList.includes(attr.name))};

      // dlgDispatch({type: 'SET_INITIAL_DATA', newInitialData});

      dispatch(gdmnActionsAsync.apiGetSchema());
    }
  }, [entityData, erModel, initialData]);

  const updateAtributes = useCallback(async () => {
    if (!entityData || !erModel || !initialData) return;

    const attrList = entityData.attributes.filter(attr => initialData.attributes.find(prevAttr => prevAttr.name === attr.name))
      .filter(attr => JSON.stringify(initialData.attributes.filter(i => !attrDeleteList?.includes(i.name)).find(a => a.name === attr.name)) !== JSON.stringify(attr));

    for (const attr of attrList) {
      const result = await apiService.updateAttribute({
        entityData,
        attrData: attr
      });

      if (result.error) {
        dispatch(gdmnActions.updateViewTab({ url, viewTab: { error: result.error.message } }));
        throw new Error(result.error.message);
      }

      dispatch(gdmnActionsAsync.apiGetSchema());
    }
  }, [entityData, erModel, initialData]);

  const deleteAtribute = useCallback(async () => {
    if (!(entityData && erModel && selectedAttr !== undefined)) return;

    dlgDispatch({type: 'DELETE_ATTR'});
  }, [selectedAttr, entityData, createEntity, erModel]);

  useEffect( () => {
    if (!viewTab) {
      dispatch(gdmnActions.addViewTab({
        url,
        caption: createEntity ? 'New Entity' : `Entity: ${entityName}`,
        canClose: true
      }));
    }
  }, [viewTab, entityName, createEntity]);

  useEffect(() => {
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
      onClick: ()=> postChanges(false)
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
      disabled: selectedAttr === undefined || !isUserDefined(entityData.attributes[selectedAttr].name),
      text: 'Удалить атрибут',
      iconProps: {
        iconName: 'Delete'
      },
      onClick: () => deleteAtribute()
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
                errorMessage={getErrorMessage(undefined, 'entityName', errorLinks)}
                readOnly={!createEntity}
                onChange={(_, newValue) => {
                  if (newValue !== undefined) {
                    let name = newValue.toUpperCase();
                    if (!isUserDefined(name)) {
                      return;
                    }
                    dlgDispatch({
                      type: 'UPDATE_ENTITY_DATA',
                      entityData: { ...entityData, name: name /*newValue addUserPrefix(newValue)*/ }})
                  }
                }}
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
                errorMessage={getErrorMessage(undefined, 'entityParent', errorLinks)}
                disabled={!createEntity || entityType !== 'INHERITED'}
                onChange={ (_, newValue) => newValue && dlgDispatch({ type: 'UPDATE_ENTITY_DATA', entityData: { ...entityData, parent: newValue.key as string } }) }
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
                readOnly={!createEntity}
                onChange={ (_, newValue) => newValue !== undefined && dlgDispatch({ type: 'UPDATE_ENTITY_DATA', entityData: { ...entityData, semCategories: newValue } }) }
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
                onChange={ (_, newValue) => newValue !== undefined && dlgDispatch({ type: 'UPDATE_ENTITY_DATA', entityData: { ...entityData, lName: { ru: { name: newValue } } } }) }
              />
            </Stack.Item>
          </Stack>
        </Frame>
        <Frame marginTop marginLeft marginRight>
          <Stack>
            {
              entityData.attributes.map( (attr, attrIdx) => {
                const createAttr = !initialData || !initialData.attributes.filter(i => !attrDeleteList?.includes(i.name)).find( prevAttr => prevAttr.name === attr.name );
                return (
                  <EntityAttribute
                    key={attr.id}
                    attr={attr}
                    attrIdx={attrIdx}
                    createAttr={createAttr}
                    userDefined={isUserDefined(attr.name)}
                    selected={attrIdx === selectedAttr}
                    errorLinks={errorLinks}
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

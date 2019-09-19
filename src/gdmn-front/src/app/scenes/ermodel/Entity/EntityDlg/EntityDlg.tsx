import React, { useEffect, useState, useReducer } from "react";
import { IEntityDlgProps } from "./EntityDlg.types";
import { gdmnActions } from "@src/app/scenes/gdmn/actions";
import { IEntity } from "gdmn-orm";
import { Stack, TextField, Dropdown, CommandBar, ICommandBarItemProps } from "office-ui-fabric-react";
import { getLName } from "gdmn-internals";
import { EntityAttribute } from "./EntityAttribute";

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

interface IEntityDlgState {
  initialData?: IEntity;
  entityData?: IEntity;
  changed?: boolean;
};

type Action = { type: 'SET_ENTITY_DATA', entityData: IEntity }
  | { type: 'SET_STATE', state: IEntityDlgState }
  | { type: 'REVERT' };

function reducer(state: IEntityDlgState, action: Action): IEntityDlgState {

  switch (action.type) {
    case 'SET_ENTITY_DATA': {
      const initialData = state.initialData ? state.initialData : action.entityData;
      const entityData = action.entityData;

      return {
        ...state,
        initialData,
        entityData,
        changed: JSON.stringify(initialData) !== JSON.stringify(entityData)
      };
    }

    case 'SET_STATE':
      return action.state;

    case 'REVERT': {
      if (state.initialData) {
        return {
          ...state,
          entityData: state.initialData,
          changed: false
        }
      }
    }
  }

  return state;
};

export function EntityDlg(props: IEntityDlgProps): JSX.Element {
  const { entityName, erModel, viewTab, createEntity, dispatch, url, uniqueID } = props;

  if ((createEntity && entityName) || (!createEntity && !entityName) || (createEntity && !uniqueID)) {
    throw new Error('Invalid EntityDlg props');
  }

  const entity = erModel && entityName && erModel.entities[entityName];
  const [state, dlgDispatch] = useReducer(reducer, {});
  const { entityData, changed } = state;

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
      if (viewTab && viewTab.sessionData) {
        dlgDispatch({ type: 'SET_STATE', state: viewTab.sessionData });
      } else {
        if (entity) {
          dlgDispatch({ type: 'SET_ENTITY_DATA', entityData: entity.serialize(false) });
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
      disabled: !changed,
      text: 'Сохранить',
      iconProps: {
        iconName: 'Save'
      }
    },
    {
      key: 'cancelAndClose',
      text: changed ? 'Отменить' : 'Закрыть',
      iconProps: {
        iconName: 'Cancel'
      }
    },
    {
      key: 'apply',
      disabled: !changed,
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
    }
  ];

  return (
    <Stack>
      <CommandBar items={commandBarItems} />
      <Stack>
        <TextField
          label="Name:"
          value={entityData.name}
          disabled={!createEntity}
          onChange={ (_, newValue) => newValue !== undefined && dlgDispatch({ type: 'SET_ENTITY_DATA', entityData: { ...entityData, name: newValue } }) }
        />
        <Dropdown
          label="Parent:"
          options={Object.keys(erModel.entities).map( name => ({ key: name, text: name }) )}
          selectedKey={entityData.parent}
          disabled={!createEntity}
          onChange={ (_, newValue) => newValue && dlgDispatch({ type: 'SET_ENTITY_DATA', entityData: { ...entityData, parent: newValue.key as string } }) }
        />
        <TextField
          label="Description:"
          value={getLName(entityData.lName, ['ru'])}
          onChange={ (_, newValue) => newValue !== undefined && dlgDispatch({ type: 'SET_ENTITY_DATA', entityData: { ...entityData, lName: { ru: { name: newValue } } } }) }
        />
        <TextField
          label="Semantic categories:"
          value={entityData.semCategories}
          onChange={ (_, newValue) => newValue !== undefined && dlgDispatch({ type: 'SET_ENTITY_DATA', entityData: { ...entityData, semCategories: newValue } }) }
        />
      </Stack>
      <Stack>
        {
          entityData.attributes.map( attr => <EntityAttribute attr={attr} /> )
        }
      </Stack>
    </Stack>
  );
};

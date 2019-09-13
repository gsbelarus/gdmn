import React, { useEffect, useState } from "react";
import { IEntityDlgProps } from "./EntityDlg.types";
import { gdmnActions } from "@src/app/scenes/gdmn/actions";
import { IEntity } from "gdmn-orm";

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

export function EntityDlg(props: IEntityDlgProps): JSX.Element {
  const { entityName, erModel, viewTab, createEntity, dispatch, url, uniqueID } = props;

  if ((createEntity && entityName) || (!createEntity && !entityName) || (createEntity && !uniqueID)) {
    throw new Error('Invalid EntityDlg props');
  }

  const entity = erModel && entityName && erModel.entities[entityName];
  const [entityData, setEntityData] = useState<IEntity | undefined>();

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
    if (!entityData && erModel) {
      if (viewTab && viewTab.sessionData) {
        setEntityData(viewTab.sessionData as IEntity);
      } else {
        if (entity) {
          setEntityData(entity.serialize(false));
        } else {
          setEntityData({
            name: '',
            lName: { en: { name: '' }},
            isAbstract: false,
            semCategories: '',
            unique: [[]],
            attributes: []
          });
        }
      }
    }
  }, [entityData, viewTab, erModel, entity]);

  if (!entityData) {
    return <div>Loading...</div>;
  }

  return <div>{entityData.name}</div>;
};
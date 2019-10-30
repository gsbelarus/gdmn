import {
  Entity,
  EntityLink,
  EntityLinkField,
  EntityQuery,
  EntityQueryOptions,
  IEntityQueryWhereValue,
  IntegerAttribute,
  ScalarAttribute,
  StringAttribute
} from "gdmn-orm";
import {AdapterUtils} from "../../AdapterUtils";
import {Constants} from "../../ddl/Constants";

export class VirtualQueries {

  public static makeVirtualQuery(query: EntityQuery): EntityQuery {
    const virtualTree = VirtualQueries._makeVirtualTree(query.link);

    const linkTree = new EntityLink(virtualTree, "TREE", Object.values(virtualTree!.attributes)
      .filter(value => value instanceof ScalarAttribute)
      .map(value => new EntityLinkField(value)));

    return new EntityQuery(linkTree);
  }

  public static makeSecondVirtualQuery(query: EntityQuery, withEquals?: boolean): EntityQuery {
    const virtualEntity = VirtualQueries._makeSecondVirtualEntity(query.link);

    const linkEntity = new EntityLink(virtualEntity, "parent", Object.values(virtualEntity!.attributes)
      .filter(value => value instanceof ScalarAttribute)
      .map(value => new EntityLinkField(value)));

    if (withEquals) {
      const equals: IEntityQueryWhereValue[] = [];
      equals.push({
        alias: "parent",
        attribute: linkEntity.entity.attribute("PARENT"),
        value: "11111"
      });
      const options = new EntityQueryOptions(undefined, undefined, [{equals}]);

      return new EntityQuery(linkEntity, options);
    }
    return new EntityQuery(linkEntity);
  }

  public static makeThirdVirtualQuery(query: EntityQuery, withEquals?: boolean): EntityQuery {
    const virtualEntity = VirtualQueries._makeThirdVirtualEntity(query.link);

    const linkEntity = new EntityLink(virtualEntity, "parent", Object.values(virtualEntity!.attributes)
      .filter(value => value instanceof ScalarAttribute)
      .map(value => new EntityLinkField(value)));

    if (withEquals) {
      const equals: IEntityQueryWhereValue[] = [];
      equals.push({
        alias: "parent",
        attribute: linkEntity.entity.attribute("PARENT"),
        value: "11111"
      });
      const options = new EntityQueryOptions(undefined, undefined, [{equals}]);

      return new EntityQuery(linkEntity, options);
    }
    return new EntityQuery(linkEntity);
  }

  private static _makeQueryToTree(): Entity {
    let queryToTree = new Entity({
      name: "TREE",
      lName: {},
      adapter: {relation: [{relationName: "TREE", pk: [Constants.DEFAULT_PARENT_KEY_NAME]}]}
    });

    queryToTree.add(new StringAttribute({
      name: Constants.DEFAULT_ID_NAME,
      lName: {ru: {name: "Идентификатор"}},
      adapter: {
        relation: AdapterUtils.getOwnRelationName(queryToTree),
        field: Constants.DEFAULT_ID_NAME
      }
    }));

    const fieldParent = new IntegerAttribute({
      name: Constants.DEFAULT_PARENT_KEY_NAME,
      lName: {},
      entities: [queryToTree],
      adapter: {relation: "TREE", field: "PARENT"}
    });
    queryToTree.add(fieldParent);

    return queryToTree;
  }

  private static _makeVirtualTree(link: EntityLink): Entity {
    //я так понимаю, здесь создаем новую entity с полями ID и PARENT(надо ли эти поля здесь?, они могут и прийти в fields)
    let queryToTree = VirtualQueries._makeQueryToTree();
    //добавляем поля

    queryToTree = VirtualQueries._addVirtualFields(queryToTree, link);

    // link.fields
    //   .forEach((field) => {
    //     //временно отфильтруем ID и PARENT
    //     if (field.attribute.adapter.field !== Constants.DEFAULT_ID_NAME && field.attribute.adapter.field !== Constants.DEFAULT_PARENT_KEY_NAME)  {
    //       //если не поле-сылка
    //       if (!field.links) {
    //         if (!link.entity.isIntervalTree && link.entity.isTree && queryToTree) {
    //           if (field.attribute.adapter) {
    //             queryToTree = VirtualQueries._makeVirtualFields(queryToTree, field.attribute.adapter.field);
    //           } else {
    //                 //что делать, если нет адаптера?
    //           }
    //         }
    //       //если поле-ссылка
    //       } else {
    //         field.links.forEach(fieldLink => {
    //           fieldLink.fields.forEach((f) => {
    //             if (!fieldLink.entity.isIntervalTree && fieldLink.entity.isTree && queryToTree) {
    //               if (f.attribute.adapter) {
    //                 queryToTree = VirtualQueries._makeVirtualFields(queryToTree, f.attribute.adapter.field);
    //             } else {
    //                 //что делать, если нет адаптера?
    //               }
    //             }
    //           })
    //       })
    //     }}
    //   });



    // link.fields
    //   .filter((field) => !field.links)
    //   .forEach((field) => {
    //     const attribute = field.attribute as ScalarAttribute;
    //     if (!link.entity.isIntervalTree && link.entity.isTree && queryToTree) {
    //       queryToTree = VirtualQueries._makeVirtualFields(queryToTree, attribute.adapter!.field);
    //     }
    //   });

    // link.fields
    //   .reduce((items, field) => {
    //     if (field.links) {
    //         for (const link of field.links) {
    //         link.fields
    //             .filter((field) => !field.links)
    //             .map((field) => {
    //             const attribute = field.attribute as ScalarAttribute;
    //             if (!link.entity.isIntervalTree && link.entity.isTree && queryToTree) {
    //                 queryToTree = VirtualQueries._makeVirtualFields(queryToTree, attribute.adapter!.field);
    //             }
    //             });
    //         }
    //     }
    //     return items;
    //   }, [] as string[]);

    return queryToTree;

  }

  private static _makeSecondVirtualEntity(link: EntityLink): Entity {
    let query = new Entity({
      name: AdapterUtils.getOwnRelationName(link.entity),
      lName: {},
      adapter: {
        relation: [{
          relationName: AdapterUtils.getOwnRelationName(link.entity),
          pk: [Constants.DEFAULT_PARENT_KEY_NAME]
        }]
      }
    });

    query.add(new StringAttribute({
      name: Constants.DEFAULT_ID_NAME,
      lName: {},
      adapter: {
        relation: AdapterUtils.getOwnRelationName(query),
        field: Constants.DEFAULT_ID_NAME
      }
    }));

    query.add(new IntegerAttribute({
      name: Constants.DEFAULT_PARENT_KEY_NAME,
      lName: {},
      adapter: {
        relation: AdapterUtils.getOwnRelationName(query),
        field: Constants.DEFAULT_PARENT_KEY_NAME
      }
    }));

        //добавляем поля
        query = VirtualQueries._addVirtualFields(query, link);
        // link.fields
        // .forEach((field) => {
        //   //временно отфильтруем ID и PARENT
        //   if (field.attribute.adapter.field !== Constants.DEFAULT_ID_NAME && field.attribute.adapter.field !== Constants.DEFAULT_PARENT_KEY_NAME)  {
        //     //если не поле-сылка
        //     if (!field.links) {
        //       if (!link.entity.isIntervalTree && link.entity.isTree && query) {
        //         if (field.attribute.adapter) {
        //           query = VirtualQueries._makeVirtualFields(query, field.attribute.adapter.field);
        //         } else {
        //               //что делать, если нет адаптера?
        //         }
        //       }
        //     //если поле-ссылка
        //     } else {
        //       field.links.forEach(fieldLink => {
        //         fieldLink.fields.forEach((f) => {
        //           if (!fieldLink.entity.isIntervalTree && fieldLink.entity.isTree && query) {
        //             if (f.attribute.adapter) {
        //               query = VirtualQueries._makeVirtualFields(query, f.attribute.adapter.field);
        //           } else {
        //               //что делать, если нет адаптера?
        //             }
        //           }
        //         })
        //     })
        //   }}
        // });

    // link.fields
    //   .filter((field) => !field.links)
    //   .map((field) => {
    //     const attribute = field.attribute as ScalarAttribute;
    //     if (!link.entity.isIntervalTree && link.entity.isTree && query) {
    //       query = VirtualQueries._makeVirtualFields(query, attribute.adapter!.field);
    //     }
    //   });

    // link.fields.reduce((items, field) => {
    //   if (field.links) {
    //     for (const link of field.links) {
    //       link.fields
    //         .filter((field) => !field.links)
    //         .map((field) => {
    //           const attribute = field.attribute as ScalarAttribute;
    //           if (!link.entity.isIntervalTree && link.entity.isTree && query) {
    //             query = VirtualQueries._makeVirtualFields(query, attribute.adapter!.field);
    //           }
    //         });
    //     }
    //   }
    //   return items;
    // }, [] as string[]);

    return query;
  }

  private static _makeThirdVirtualEntity(link: EntityLink): Entity {
    let query = new Entity({
      name: AdapterUtils.getOwnRelationName(link.entity),
      lName: {},
      adapter: {
        relation: [{
          relationName: AdapterUtils.getOwnRelationName(link.entity),
          pk: [Constants.DEFAULT_PARENT_KEY_NAME]
        }, {
          relationName: "TREE",
          pk: [Constants.DEFAULT_ID_NAME]
        }]
      }
    });

    query.add(new StringAttribute({
      name: Constants.DEFAULT_ID_NAME,
      lName: {},
      adapter: {
        relation: query.adapter!.relation[0].relationName,
        field: Constants.DEFAULT_ID_NAME
      }
    }));
    query.add(new IntegerAttribute({
      name: Constants.DEFAULT_PARENT_KEY_NAME,
      lName: {},
      adapter: {
        relation: query.adapter!.relation[0].relationName,
        field: Constants.DEFAULT_PARENT_KEY_NAME
      }
    }));

    // link.fields
    //   .filter((field) => !field.links)
    //   .map((field) => {
    //     const attribute = field.attribute as ScalarAttribute;
    //     if (!link.entity.isIntervalTree && link.entity.isTree && query) {
    //       query = VirtualQueries._makeVirtualFields(query, attribute.adapter!.field);
    //     }
    //   });

    // link.fields.reduce((items, field) => {
    //   if (field.links) {
    //     for (const link of field.links) {
    //       link.fields
    //         .filter((field) => !field.links)
    //         .map((field) => {
    //           const attribute = field.attribute as ScalarAttribute;
    //           if (!link.entity.isIntervalTree && link.entity.isTree && query) {
    //             query = VirtualQueries._makeVirtualFields(query, attribute.adapter!.field);
    //           }
    //         });
    //     }
    //   }
    //   return items;
    // }, [] as string[]);

        //добавляем поля
        query = VirtualQueries._addVirtualFields(query, link);
        // link.fields
        // .forEach((field) => {
        //   //временно отфильтруем ID и PARENT
        //   if (field.attribute.adapter.field !== Constants.DEFAULT_ID_NAME && field.attribute.adapter.field !== Constants.DEFAULT_PARENT_KEY_NAME)  {
        //     //если не поле-сылка
        //     if (!field.links) {
        //       if (!link.entity.isIntervalTree && link.entity.isTree && query) {
        //         if (field.attribute.adapter) {
        //           query = VirtualQueries._makeVirtualFields(query, field.attribute.adapter.field);
        //         } else {
        //               //что делать, если нет адаптера?
        //         }
        //       }
        //     //если поле-ссылка
        //     } else {
        //       field.links.forEach(fieldLink => {
        //         fieldLink.fields.forEach((f) => {
        //           if (!fieldLink.entity.isIntervalTree && fieldLink.entity.isTree && query) {
        //             if (f.attribute.adapter) {
        //               query = VirtualQueries._makeVirtualFields(query, f.attribute.adapter.field);
        //           } else {
        //               //что делать, если нет адаптера?
        //             }
        //           }
        //         })
        //     })
        //   }}
        // });
    return query;
  }

  private static _addVirtualFields(query: Entity, link: EntityLink): Entity {
        //добавляем поля
        link.fields
        .forEach((field) => {
          //временно отфильтруем ID и PARENT
          if (field.attribute.adapter.field !== Constants.DEFAULT_ID_NAME && field.attribute.adapter.field !== Constants.DEFAULT_PARENT_KEY_NAME)  {
            //если не поле-сылка
            if (!field.links) {
              if (!link.entity.isIntervalTree && link.entity.isTree && query) {
                if (field.attribute.adapter) {
                  query = VirtualQueries._makeVirtualFields(query, field.attribute.adapter.field);
                } else {
                      //что делать, если нет адаптера?
                }
              }
            //если поле-ссылка
            } else {
              field.links.forEach(fieldLink => {
                fieldLink.fields.forEach((f) => {
                  if (!fieldLink.entity.isIntervalTree && fieldLink.entity.isTree && query) {
                    if (f.attribute.adapter) {
                      query = VirtualQueries._makeVirtualFields(query, f.attribute.adapter.field);
                  } else {
                      //что делать, если нет адаптера?
                    }
                  }
                })
            })
          }}
        });
    return query;
  }

  private static _makeVirtualFields(queryToTree: Entity, nameFields: string): Entity {
    const field = new StringAttribute({
      name: nameFields,
      required: true,
      lName: {},
      adapter: {"relation": queryToTree.name, "field": nameFields}
    });
    queryToTree.add(field);

    return queryToTree;
  }
}

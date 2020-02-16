import {
  EntityDelete,
  EntityInsert,
  EntityUpdate,
  IEntityDeleteInspector,
  IEntityInsertInspector,
  IEntityUpdateInspector,
  ParentAttribute
} from "../src";
import {Entity} from "../src/model/Entity";
import {ERModel} from "../src/model/ERModel";
import {DetailAttribute} from "../src/model/link/DetailAttribute";
import {EntityAttribute} from "../src/model/link/EntityAttribute";
import {SetAttribute} from "../src/model/link/SetAttribute";
import {FloatAttribute} from "../src/model/scalar/number/FloatAttribute";
import {IntegerAttribute} from "../src/model/scalar/number/IntegerAttribute";
import {StringAttribute} from "../src/model/scalar/StringAttribute";
import {EntityQuery, IEntityQueryInspector} from "../src/query-models/EntityQuery";

describe("EntityQuery", () => {
  const erModel = new ERModel();

  beforeAll(() => {
    const testEntity = erModel.add(new Entity({name: "TEST_ENTITY", lName: {}}));
    testEntity.add(new StringAttribute({name: "TEST_STRING", lName: {}}));
    testEntity.add(new FloatAttribute({name: "TEST_FLOAT", lName: {}}));

    const masterEntity = erModel.add(new Entity({name: "MASTER_ENTITY", lName: {}}));
    masterEntity.add(new StringAttribute({name: "TEST_STRING", lName: {}}));
    masterEntity.add(new EntityAttribute({
      name: "LINK",
      lName: {},
      entities: [testEntity]
    }));

    const detailEntity = erModel.add(new Entity({name: "DETAIL_ENTITY", lName: {}}));
    detailEntity.add(new StringAttribute({name: "TEST_STRING1", lName: {}}));
    detailEntity.add(new StringAttribute({name: "TEST_STRING2", lName: {}}));
    detailEntity.add(new EntityAttribute({
      name: "LINK",
      lName: {},
      entities: [testEntity]
    }));

    masterEntity.add(new DetailAttribute({
      name: "DETAIL_ENTITY",
      lName: {},
      entities: [detailEntity]
    }));

    const setAttr = new SetAttribute({
      name: "SET_LINK",
      lName: {},
      entities: [testEntity]
    });
    setAttr.add(new IntegerAttribute({name: "TEST_INTEGER", lName: {}}));
    masterEntity.add(setAttr);

    const childEntity = erModel.add(new Entity({
      name: "CHILD_ENTITY",
      lName: {},
      parent: testEntity
    }));
    childEntity.add(new StringAttribute({name: "TEST_STRING", lName: {}}));
    childEntity.add(new StringAttribute({name: "TEST_STRING1", lName: {}}));
    childEntity.add(new ParentAttribute({name: "PARENT", lName: {}, entities: [childEntity]}));
    childEntity.add(new EntityAttribute({name: "LINK", lName: {}, entities: [testEntity]}));
    childEntity.add(setAttr);

  });

  it("Get all references", () => {
    const references = erModel.entityReferencedBy(erModel.entity('TEST_ENTITY'));
    expect(references.length).toEqual(3);
  });

  it("Query: serialize/deserialize", () => {
    const inspectorQuery: IEntityQueryInspector = {
      link: {
        entity: "MASTER_ENTITY",
        alias: "me",
        fields: [
          {
            attribute: "LINK",
            links: [{
              entity: "TEST_ENTITY",
              alias: "te",
              fields: [
                {attribute: "TEST_STRING"}
              ]
            }]
          },
          {
            attribute: "SET_LINK",
            setAttributes: ["TEST_INTEGER"],
            links: [{
              entity: "TEST_ENTITY",
              alias: "s",
              fields: [
                {attribute: "TEST_STRING"}
              ]
            }]
          },
          {
            attribute: "DETAIL_ENTITY",
            links: [{
              entity: "DETAIL_ENTITY",
              alias: "de",
              fields: [
                {attribute: "TEST_STRING2"},
                {
                  attribute: "LINK",
                  links: [{
                    entity: "TEST_ENTITY",
                    alias: "te",
                    fields: [
                      {attribute: "TEST_STRING"}
                    ]
                  }]
                }
              ]
            }]
          }
        ]
      },
      options: {
        where: [
          {
            equals: [
              {
                alias: "de",
                attribute: "TEST_STRING1",
                value: "asd"
              }, {
                alias: "te",
                attribute: "TEST_FLOAT",
                value: 10
              }
            ]
          }, {
            or: [
              {
                not: [{isNull: [{alias: "de", attribute: "TEST_STRING1"}]}]
              }, {
                not: [{isNull: [{alias: "te", attribute: "TEST_FLOAT"}]}]
              }
            ]
          }
        ],
        order: [{
          alias: "de",
          attribute: "TEST_STRING2"
        }, {
          alias: "te",
          attribute: "TEST_FLOAT",
          type: "DESC"
        }]
      }
    };

    const eq1 = EntityQuery.inspectorToObject(erModel, inspectorQuery);

    expect(inspectorQuery).toEqual(eq1.inspect());

    const eq2 = eq1.duplicate(erModel);
    expect(eq1 !== eq2).toBeTruthy();
    expect(eq1.link !== eq2.link).toBeTruthy();
    expect(eq1.options !== eq2.options).toBeTruthy();
    expect(eq1.inspect()).toEqual(eq1.inspect());
  });

  it("Insert: serialize/deserialize", () => {
    const inspectorInsert: IEntityInsertInspector = {
      entity: "CHILD_ENTITY",
      fields: [
        {
          attribute: "TEST_STRING1",
          value: "dfdfd"
        },
        {
          attribute: "PARENT",
          value: 36
        },
        {
          attribute: "LINK",
          value: 36
        },
        {
          attribute: "SET_LINK",
          value: [
            {
              pkValues: [36],
              setAttributes: [{attribute: "TEST_INTEGER", value: "111"}]
            }
          ]
        }
      ]
    };

    expect(inspectorInsert).toEqual(EntityInsert.inspectorToObject(erModel, inspectorInsert).inspect());
  });

  it("Delete: serialize/deserialize", () => {
    const inspectorDelete: IEntityDeleteInspector = {
      entity: "CHILD_ENTITY",
      pkValues: [36]
    };

    expect(inspectorDelete).toEqual(EntityDelete.inspectorToObject(erModel, inspectorDelete).inspect());
  });

  it("Update: serialize/deserialize", () => {
    const inspectorUpdate: IEntityUpdateInspector = {
      entity: "CHILD_ENTITY",
      fields: [
        {
          attribute: "TEST_STRING1",
          value: "dfdfd"
        },
        {
          attribute: "PARENT",
          value: 36
        },
        {
          attribute: "SET_LINK",
          value: [
            {
              pkValues: [36],
              setAttributes: [{attribute: "TEST_INTEGER", value: "111"}]
            }
          ]
        }
      ],
      pkValues: [36]
    };

    expect(inspectorUpdate).toEqual(EntityUpdate.inspectorToObject(erModel, inspectorUpdate).inspect());
  });
});

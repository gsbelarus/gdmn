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
  });

  it("serialize/deserialize", () => {
    const inspectorQuery: IEntityQueryInspector = {
      link: {
        entity: "MASTER_ENTITY",
        alias: "me",
        fields: [
          {
            attribute: "LINK",
            link: {
              entity: "TEST_ENTITY",
              alias: "te",
              fields: [
                {attribute: "TEST_STRING"}
              ]
            }
          },
          {
            attribute: "SET_LINK",
            setAttributes: ["TEST_INTEGER"],
            link: {
              entity: "TEST_ENTITY",
              alias: "s",
              fields: [
                {attribute: "TEST_STRING"}
              ]
            }
          },
          {
            attribute: "DETAIL_ENTITY",
            link: {
              entity: "DETAIL_ENTITY",
              alias: "de",
              fields: [
                {attribute: "TEST_STRING2"},
                {
                  attribute: "LINK",
                  link: {
                    entity: "TEST_ENTITY",
                    alias: "te",
                    fields: [
                      {attribute: "TEST_STRING"}
                    ]
                  }
                }
              ]
            }
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

    expect(inspectorQuery).toEqual(EntityQuery.inspectorToObject(erModel, inspectorQuery).inspect());
  });
});

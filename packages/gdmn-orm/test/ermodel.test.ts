import {Entity, ERModel, StringAttribute} from "../src";
import {deserializeERModel} from "../src/serialize";

describe("ERModel", async () => {

  const erModel = new ERModel();

  beforeAll(() => {
    const entity = erModel.add(new Entity({name: "Test", lName: {en: {name: "Test"}}}));
    const testAttr = entity.add(new StringAttribute({
      name: "TEST_FIELD", lName: {en: {name: "Test field"}}
    }));
    entity.addUnique([testAttr]);
  });

  it("serialize/deserialize", async () => {
    const serialized = erModel.serialize();

    const erModel2 = deserializeERModel(serialized);

    expect(erModel).toEqual(erModel2);
    expect(erModel2.entities.Test.isTree).toBeFalsy();
  });

  it("serialize/deserialize withAdapter: true", async () => {
    const serialized = erModel.serialize(true);

    const erModel2 = deserializeERModel(serialized, true);

    expect(erModel).toEqual(erModel2);
    expect(erModel2.entities.Test.isTree).toBeFalsy();
  });
});

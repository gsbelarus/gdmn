import {Entity, ERModel, StringAttribute} from "../src";
import {deserializeERModel} from "../src/serialize";

describe("ERModel", async () => {

  it("serialize/deserialize", async () => {
    const erModel = new ERModel();

    const entity = erModel.add(new Entity({name: "Test", lName: {en: {name: "Test"}}}));
    const testAttr = entity.add(new StringAttribute({
      name: "TEST_FIELD", lName: {en: {name: "Test field"}}
    }));
    await entity.add([testAttr]);

    const serialized = erModel.serialize();

    const erModel2 = deserializeERModel(serialized);

    expect(erModel).toEqual(erModel2);
    expect(erModel2.entities.Test.isTree).toBeFalsy();
  });
});

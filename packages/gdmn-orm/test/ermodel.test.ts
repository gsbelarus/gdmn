import {Entity, ERModel, StringAttribute} from "../src";
import {deserializeERModel} from "../src/serialize";

describe("ERModel", async () => {

  it("serialize/deserialize", async () => {
    const erModel = new ERModel();
    await erModel.initDataSource();

    const transaction = await erModel.startTransaction();

    try {
      const entity = await erModel.create(new Entity({
        name: "TEST", lName: {en: {name: "Test"}}
      }), transaction);
      const testAttr = await entity.create(new StringAttribute({
        name: "TEST_FIELD", lName: {en: {name: "Test field"}}
      }), transaction);
      await entity.addAttrUnique([testAttr], transaction);
    } finally {
      if (!transaction.finished) {
        await transaction.commit();
      }
    }

    const serialized = erModel.serialize();

    const erModel2 = deserializeERModel(serialized);

    expect(erModel).toEqual(erModel2);
    expect(erModel2.entities.TEST.isTree).toBeFalsy();
  });

  it("serialize/deserialize (old)", async () => {
    const erModel = new ERModel();

    const entity = erModel.add(new Entity({name: "Test", lName: {en: {name: "Test"}}}));
    const testAttr = entity.add(new StringAttribute({
      name: "TEST_FIELD", lName: {en: {name: "Test field"}}
    }));
    await entity.addUnique([testAttr]);

    const serialized = erModel.serialize();

    const erModel2 = deserializeERModel(serialized);

    expect(erModel).toEqual(erModel2);
    expect(erModel2.entities.Test.isTree).toBeFalsy();
  });
});

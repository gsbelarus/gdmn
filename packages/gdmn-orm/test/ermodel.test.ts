import {Entity, ERModel, Sequence, SequenceAttribute, StringAttribute} from "../src";
import {deserializeERModel} from "../src/serialize";

describe("ERModel", () => {

  const erModel = new ERModel();

  beforeAll(() => {
    const sequence = erModel.add(new Sequence({name: "TestSequence"}));
    const entity = erModel.add(new Entity({name: "Test", lName: {en: {name: "Test"}}}));
    entity.add(new SequenceAttribute({
      name: "TEST_ID", lName: {en: {name: "Test id"}}, sequence
    }));
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

  it("copy", async () => {
    const erModel2 = new ERModel(erModel);
    expect(erModel).toEqual(erModel2);
  });

  it("notEmpty", async () => {
    const erModel2 = new ERModel();
    expect(erModel2.notEmpty).toEqual(false);
    expect(erModel.notEmpty).toEqual(true);
  });
});

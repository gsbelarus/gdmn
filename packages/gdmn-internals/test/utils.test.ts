import { isValidDate } from "gdmn-internals";


describe("utils", () => {
  it("isValidDate", () => {
    expect(isValidDate(undefined)).toEqual(false);
    expect(isValidDate(1)).toEqual(false);
    expect(isValidDate('abc')).toEqual(false);
    expect(isValidDate(new Date())).toEqual(true);
  });
});
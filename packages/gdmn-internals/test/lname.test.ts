import { LName, getLName } from "gdmn-internals";

describe("lname", () => {
  it("lname", () => {
    const ln: LName = {
      en: {
        name: 'abc'
      },
      ru: {
        name: 'cde'
      }
    };

    expect(getLName(ln, ['ru', 'en', 'by'])).toEqual('cde');
    expect(getLName(ln, ['en', 'by'])).toEqual('abc');
    expect(getLName(ln, ['by'])).toEqual('abc');
    expect(getLName(ln, ['by', 'ru'])).toEqual('cde');

    expect(getLName(ln)).toEqual('abc');

    const fln: LName = {
      en: {
        name: 'abc',
        fullName: 'fabc'
      },
      ru: {
        name: 'cde',
        fullName: 'fcde'
      }
    };

    expect(getLName(fln, ['ru', 'en', 'by'])).toEqual('cde');
    expect(getLName(fln, ['en', 'by'])).toEqual('abc');
    expect(getLName(fln, ['by'])).toEqual('abc');
    expect(getLName(fln, ['by', 'ru'])).toEqual('cde');

    expect(getLName(fln, ['ru', 'en', 'by'], true)).toEqual('fcde');
    expect(getLName(fln, ['en', 'by'], true)).toEqual('fabc');
    expect(getLName(fln, ['by'], true)).toEqual('fabc');
    expect(getLName(fln, ['by', 'ru'], true)).toEqual('fcde');

    expect(getLName(fln, [], true)).toEqual('fabc');

    const eln: LName = { };

    expect(getLName(eln, ['ru', 'en', 'by'])).toEqual('');
    expect(getLName(eln, ['en', 'by'])).toEqual('');
    expect(getLName(eln, ['by'])).toEqual('');
    expect(getLName(eln, ['by', 'ru'])).toEqual('');

    expect(getLName(eln, ['ru', 'en', 'by'], true)).toEqual('');
    expect(getLName(eln, ['en', 'by'], true)).toEqual('');
    expect(getLName(eln, ['by'], true)).toEqual('');
    expect(getLName(eln, ['by', 'ru'], true)).toEqual('');
  });
});
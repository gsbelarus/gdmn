import {ContextVariables} from "gdmn-orm";
import moment from "moment";
import {Constants} from "../Constants";

export interface IRange<T> {
  minValue: T;
  maxValue: T;
}

export function isCheckForBoolean(validationSource: string | null): boolean {
  if (validationSource) {
    switch (validationSource) {
      // custom formats
      default:
        const template = /^CHECK\s*\((\(?VALUE \s*IS \s*NULL\)?\s*OR\s*)?\(?VALUE \s*IN\s*\(0,\s*1\)\)?\)$/i;
        if (template.test(validationSource)) {
          return true;
        }
        break;
    }
  }
  return false;
}

export function check2Enum(validationSource: string | null): string [] {
  // TODO CHECK((VALUE IS NULL) OR (VALUE = 'M') OR (VALUE = 'F') OR ...)
  const enumValues = [];
  if (validationSource) {
    const valuesTemplate = /CHECK\s*\((\(?VALUE\s+IS\s+NULL\)?\s*OR\s*)?(\(?VALUE\s+IN\s*\(\s*){1}((?:\'[A-Z0-9]\'(?:\,\s*)?)+)\)?\)\)/i;
    let match;
    if (match = valuesTemplate.exec(validationSource)) {
      const valueTemplate = /\'([A-Z0-9]{1})\'/g;
      let enumValue;
      while (enumValue = valueTemplate.exec(match[3])) {
        enumValues.push(enumValue[1]);
      }
    }
  }
  return enumValues;
}

export function check2StrMin(validationSource: string | null): number | undefined {
  if (validationSource) {
    switch (validationSource) {
      // custom formats
      case "CHECK (VALUE > '')":
      case "CHECK ((VALUE IS NULL) OR (VALUE > ''))":
        return 1;
      default:
        const template = /^CHECK\s*\((\(?VALUE \s*IS \s*NULL\)?\s*OR\s*)?\(?CHAR_LENGTH\s*\(VALUE\)\s*>=\s*(.+?)\)?\)$/i;
        if (template.test(validationSource)) {
          return Number(validationSource.replace(template, "$2"));
        }
        console.warn(`Not processed: ${validationSource}`);
        break;
    }
  }
}

export function check2IntRange(validationSource: string | null,
                               rangeLimit?: { min: number, max: number }): IRange<number | undefined> {
  switch (validationSource) {
    case "CHECK (VALUE > 0)":
      return {minValue: 1, maxValue: rangeLimit && rangeLimit.max !== undefined ? rangeLimit.max : undefined};
    default:
      return check2NumberRange(validationSource, rangeLimit);
  }
}

export function check2NumberRange(validationSource: string | null,
                                  rangeLimit?: { min: number, max: number }): IRange<number | undefined> {
  const {min, max} = rangeLimit || {min: undefined, max: undefined};
  const range = checkRange(validationSource);

  let minValue = range.min !== undefined ? Number.parseFloat(range.min) : min;
  let maxValue = range.max !== undefined ? Number.parseFloat(range.max) : max;
  if (minValue !== undefined && min !== undefined && minValue < min) {
    minValue = min;
  }
  if (maxValue !== undefined && max !== undefined && maxValue > max) {
    maxValue = max;
  }
  return {minValue, maxValue};
}

export function check2TimestampRange(validationSource: string | null): IRange<Date> {
  const range = checkRange(validationSource);
  let minDate = moment.utc(range.min, Constants.TIMESTAMP_TEMPLATE);
  let maxDate = moment.utc(range.max, Constants.TIMESTAMP_TEMPLATE);
  if (minDate.isValid() && minDate.isBefore(Constants.MIN_TIMESTAMP)) {
    minDate = moment.utc(Constants.MIN_TIMESTAMP, Constants.TIMESTAMP_TEMPLATE);
  }
  if (maxDate.isValid() && maxDate.isAfter(Constants.MAX_TIMESTAMP)) {
    maxDate = moment.utc(Constants.MAX_TIMESTAMP, Constants.TIMESTAMP_TEMPLATE);
  }
  return {
    minValue: minDate.isValid() ? minDate.local().toDate() : Constants.MIN_TIMESTAMP,
    maxValue: maxDate.isValid() ? maxDate.local().toDate() : Constants.MAX_TIMESTAMP
  };
}

export function check2TimeRange(validationSource: string | null): IRange<Date | undefined> {
  const range = checkRange(validationSource);
  const minDate = moment.utc(range.min, Constants.TIME_TEMPLATE);
  const maxDate = moment.utc(range.max, Constants.TIME_TEMPLATE);
  if (minDate.isValid()) {
    minDate.year(Constants.MIN_TIMESTAMP.getUTCFullYear())
      .month(Constants.MIN_TIMESTAMP.getUTCMonth())
      .date(Constants.MIN_TIMESTAMP.getUTCDate());
  }
  if (maxDate.isValid()) {
    maxDate.year(Constants.MIN_TIMESTAMP.getUTCFullYear())
      .month(Constants.MIN_TIMESTAMP.getUTCMonth())
      .date(Constants.MIN_TIMESTAMP.getUTCDate());
  }
  return {
    minValue: minDate.isValid() ? minDate.local().toDate() : undefined,
    maxValue: maxDate.isValid() ? maxDate.local().toDate() : undefined
  };
}

export function check2DateRange(validationSource: string | null): IRange<Date> {
  const range = checkRange(validationSource);
  let minDate = moment.utc(range.min, Constants.DATE_TEMPLATE);
  let maxDate = moment.utc(range.max, Constants.DATE_TEMPLATE);
  if (minDate.isValid() && minDate.isBefore(Constants.MIN_TIMESTAMP)) {
    minDate = moment.utc(Constants.MIN_TIMESTAMP, Constants.DATE_TEMPLATE);
  }
  if (maxDate.isValid() && maxDate.isAfter(Constants.MAX_TIMESTAMP)) {
    maxDate = moment.utc(Constants.MAX_TIMESTAMP, Constants.DATE_TEMPLATE);
  }
  return {
    minValue: minDate.isValid() ? minDate.local().toDate() : Constants.MIN_TIMESTAMP,
    maxValue: maxDate.isValid() ? maxDate.local().toDate() : Constants.MAX_TIMESTAMP
  };
}

export function checkRange(validationSource: string | null): { min: string | undefined, max: string | undefined } {
  if (validationSource) {
    switch (validationSource) {
      // custom formats
      case "CHECK(((VALUE IS NULL) OR (VALUE >= 0)))":  // двойные общие скобки
        return {min: "0", max: undefined};
      default:
        const template = /^CHECK\s*\((\(?VALUE\s+IS\s+NULL\)?\s*OR\s*)?\(?VALUE\s+BETWEEN\s+(.+?)\s+AND\s+(.+?)\)?\)$/i;
        if (template.test(validationSource)) {
          return {
            min: validationSource.replace(template, "$2"),
            max: validationSource.replace(template, "$3")
          };
        }
        const template2 = /^CHECK\s*\((\(?VALUE\s+IS\s+NULL\)?\s*OR\s*)?\(?\(?VALUE\s*>=\s*(.+?)\)?\s*AND\s*\(?VALUE\s*<=\s*(.+?)\)?\)?\)$/i;
        if (template2.test(validationSource)) {
          return {
            min: validationSource.replace(template2, "$2"),
            max: validationSource.replace(template2, "$3")
          };
        }
        const minTemplate = /^CHECK\s*\((\(?VALUE\s+IS\s+NULL\)?\s*OR\s*)?\(?VALUE\s*>=\s*(.+?)\)?\)$/i;
        if (minTemplate.test(validationSource)) {
          return {
            min: validationSource.replace(minTemplate, "$2"),
            max: undefined
          };
        }
        const maxTemplate = /^CHECK\s*\((\(?VALUE\s+IS\s+NULL\)?\s*OR\s*)?\(?VALUE\s*<=\s*(.+?)\)?\)$/i;
        if (maxTemplate.test(validationSource)) {
          return {
            min: undefined,
            max: validationSource.replace(maxTemplate, "$2")
          };
        }
        console.warn(`Not processed: ${validationSource}`);
        break;
    }
  }
  return {min: undefined, max: undefined};
}

export function cropDefault(defaultSource: string | null): string | null {
  if (defaultSource) {
    return defaultSource
      .replace(/DEFAULT /i, "")
      .replace(/^'(.+(?='$))'$/i, "$1");
  }
  return defaultSource;
}

export function default2Boolean(defaultSource: string | null): boolean {
  defaultSource = cropDefault(defaultSource);
  return !!defaultSource && Boolean(Number.parseInt(defaultSource));
}

export function default2Int(defaultSource: string | null): number | undefined {
  defaultSource = cropDefault(defaultSource);
  if (defaultSource) {
    return Number.parseInt(defaultSource);
  }
}

export function default2Float(defaultSource: string | null): number | undefined {
  defaultSource = cropDefault(defaultSource);
  if (defaultSource) {
    return Number.parseFloat(defaultSource);
  }
}

export function default2String(defaultSource: string | null): string | undefined {
  defaultSource = cropDefault(defaultSource);
  if (defaultSource) {
    return defaultSource;
  }
}

export function default2Time(defaultSource: string | null): Date | ContextVariables | undefined {
  defaultSource = cropDefault(defaultSource);
  if (defaultSource === "CURRENT_TIME") {
    return defaultSource;
  }
  const mDate = moment.utc(defaultSource!, Constants.TIME_TEMPLATE);
  if (mDate.isValid()) {
    return mDate
      .year(Constants.MIN_TIMESTAMP.getUTCFullYear())
      .month(Constants.MIN_TIMESTAMP.getUTCMonth())
      .date(Constants.MIN_TIMESTAMP.getUTCDate())
      .local().toDate();
  }
}

export function default2Timestamp(defaultSource: string | null): Date | ContextVariables | undefined {
  defaultSource = cropDefault(defaultSource);
  if (defaultSource === "CURRENT_TIMESTAMP") {
    return defaultSource;
  }
  if (defaultSource === "CURRENT_TIMESTAMP(0)") {
    return defaultSource;
  }
  const mDate = moment.utc(defaultSource!, Constants.TIMESTAMP_TEMPLATE);
  if (mDate.isValid()) {
    return mDate.local().toDate();
  }
}

export function default2Date(defaultSource: string | null): Date | ContextVariables | undefined {
  defaultSource = cropDefault(defaultSource);
  if (defaultSource === "CURRENT_DATE") {
    return defaultSource;
  }
  const mDate = moment.utc(defaultSource!, Constants.DATE_TEMPLATE);
  if (mDate.isValid()) {
    return mDate.local().toDate();
  }
}

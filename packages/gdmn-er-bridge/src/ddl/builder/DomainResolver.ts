import {
  Attribute,
  BlobAttribute,
  BooleanAttribute,
  ContextVariables,
  DateAttribute,
  EntityAttribute,
  EnumAttribute,
  FloatAttribute,
  IntegerAttribute,
  MAX_16BIT_INT,
  MAX_32BIT_INT,
  MAX_64BIT_INT,
  MIN_16BIT_INT,
  MIN_32BIT_INT,
  MIN_64BIT_INT,
  NumberAttribute,
  NumericAttribute,
  ScalarAttribute,
  SequenceAttribute,
  SetAttribute,
  StringAttribute,
  TimeAttribute,
  TimeStampAttribute
} from "gdmn-orm";
import moment from "moment";
import {Constants} from "../Constants";
import {IDomainProps} from "./DDLHelper";

export class DomainResolver {

  public static resolve(attr: Attribute): IDomainProps {
    return {
      type: DomainResolver._getType(attr),
      default: DomainResolver._getDefaultValue(attr),
      notNull: attr.required,
      check: DomainResolver._getChecker(attr)
    };
  }

  private static _getType(attr: Attribute): string {
    let expr = "";
    // TODO TimeIntervalAttribute
    if (SetAttribute.isType(attr)) {
      expr = `VARCHAR(${attr.presLen})`;
    } else if (EntityAttribute.isType(attr)) {
      expr = `INTEGER`;
    } else if (EnumAttribute.isType(attr)) {
      expr = `VARCHAR(1)`;
    } else if (DateAttribute.isType(attr)) {
      expr = `DATE`;
    } else if (TimeAttribute.isType(attr)) {
      expr = `TIME`;
    } else if (TimeStampAttribute.isType(attr)) {
      expr = `TIMESTAMP`;
    } else if (SequenceAttribute.isType(attr)) {
      expr = `INTEGER`;
    } else if (IntegerAttribute.isType(attr)) {
      expr = DomainResolver._getIntTypeByRange(attr.minValue, attr.maxValue);
    } else if (NumericAttribute.isType(attr)) {
      expr = `NUMERIC(${attr.precision}, ${attr.scale})`;
    } else if (FloatAttribute.isType(attr)) {
      expr = `FLOAT`;
    } else if (BooleanAttribute.isType(attr)) {
      expr = `SMALLINT`;
    } else if (StringAttribute.isType(attr)) {
      if (attr.maxLength === undefined) {
        expr = `BLOB SUB_TYPE TEXT`;
      } else {
        expr = `VARCHAR(${attr.maxLength})`;
      }
    } else if (BlobAttribute.isType(attr)) {
      expr = `BLOB`;
    } else {
      expr = `BLOB SUB_TYPE TEXT`;
    }
    return expr;
  }

  private static _getChecker(attr: Attribute): string {
    let expr = "";
    if (NumberAttribute.isType(attr)) {
      const minCond = attr.minValue !== undefined ? DomainResolver._val2Str(attr, attr.minValue) : undefined;
      const maxCond = attr.maxValue !== undefined ? DomainResolver._val2Str(attr, attr.maxValue) : undefined;
      if (minCond && maxCond) {
        expr = `CHECK(VALUE BETWEEN ${minCond} AND ${maxCond})`;
      } else if (minCond) {
        expr = `CHECK(VALUE >= ${minCond})`;
      } else if (maxCond) {
        expr = `CHECK(VALUE <= ${maxCond})`;
      }
    } else if (StringAttribute.isType(attr)) {
      const minCond = attr.minLength !== undefined ? `CHAR_LENGTH(VALUE) >= ${attr.minLength}` : undefined;
      if (minCond) {
        expr = `CHECK(${minCond})`;
      }
    } else if (EnumAttribute.isType(attr)) {
      expr = `CHECK(VALUE IN (${attr.values.map((item) => `'${item.value}'`).join(", ")}))`;
    } else if (BooleanAttribute.isType(attr)) {
      expr = `CHECK(VALUE IN (0, 1))`;
    }
    return expr;
  }

  private static _getDefaultValue(attr: any): string {
    let expr = "";
    if (attr.defaultValue !== undefined) {
      expr = `${DomainResolver._val2Str(attr, attr.defaultValue)}`;
    }
    return expr;
  }

  private static _val2Str(attr: ScalarAttribute, value: any): string | undefined {
    if (DateAttribute.isType(attr)) {
      return DomainResolver._date2Str(value);
    } else if (TimeAttribute.isType(attr)) {
      return DomainResolver._time2Str(value);
    } else if (TimeStampAttribute.isType(attr)) {
      return DomainResolver._dateTime2Str(value);
    } else if (NumberAttribute.isType(attr)) {
      return `${value}`;
    } else if (StringAttribute.isType(attr)) {
      return `'${value}'`;
    } else if (BooleanAttribute.isType(attr)) {
      return `${+value}`;
    } else if (EnumAttribute.isType(attr)) {
      return `'${value}'`;
    }
  }

  private static _getIntTypeByRange(min: number = MIN_32BIT_INT, max: number = MAX_32BIT_INT): string {
    const minR = [MIN_16BIT_INT, MIN_32BIT_INT, MIN_64BIT_INT];
    const maxR = [MAX_16BIT_INT, MAX_32BIT_INT, MAX_64BIT_INT];

    const start = minR.find((b) => b <= min);
    const end = maxR.find((b) => b >= max);
    if (start === undefined) throw new Error("Out of range");
    if (end === undefined) throw new Error("Out of range");

    switch (minR[Math.max(minR.indexOf(start), maxR.indexOf(end))]) {
      case MIN_64BIT_INT:
        return "BIGINT";
      case MIN_16BIT_INT:
        return "SMALLINT";
      case MIN_32BIT_INT:
      default:
        return "INTEGER";
    }
  }

  private static _date2Str(date: Date | ContextVariables): string {
    if (date instanceof Date) {
      return `'${moment(date).utc().format(Constants.DATE_TEMPLATE)}'`;
    }
    return date;
  }

  private static _dateTime2Str(date: Date | ContextVariables): string {
    if (date instanceof Date) {
      return `'${moment(date).utc().format(Constants.TIMESTAMP_TEMPLATE)}'`;
    }
    return date;
  }

  private static _time2Str(date: Date | ContextVariables): string {
    if (date instanceof Date) {
      return `'${moment(date).utc().format(Constants.TIME_TEMPLATE)}'`;
    }
    return date;
  }
}

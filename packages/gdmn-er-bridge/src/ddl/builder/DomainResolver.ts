import {
  Attribute,
  ContextVariables,
  EnumAttribute,
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
  SetAttribute,
  StringAttribute,
  BlobAttribute
} from "gdmn-orm";
import moment from "moment";
import {Constants} from "../Constants";
import {IDomainProps} from "../DDLHelper";

export class DomainResolver {

  public static resolve(attr: Attribute): IDomainProps {
    return {
      type: DomainResolver._getType(attr),
      default: DomainResolver._getDefaultValue(attr),
      notNull: attr.required,
      check: DomainResolver._getChecker(attr)
    };
  }

  public static _getType(attr: Attribute): string {
    switch (attr.type) {
      case "String": {
        const _attr = attr as StringAttribute;
        if (_attr.maxLength === undefined) {
          return `BLOB SUB_TYPE TEXT`;
        } else {
          return `VARCHAR(${_attr.maxLength})`;
        }
      }
      case "Set": {
        const _attr = attr as SetAttribute;
        return _attr.isChar ? `VARCHAR(${_attr.presLen})` : `SMALLINT`;
      }
      case "Integer": {
        const _attr = attr as IntegerAttribute;
        return DomainResolver._getIntTypeByRange(_attr.minValue, _attr.maxValue);
      }
      case "Numeric": {
        const _attr = attr as NumericAttribute;
        return `NUMERIC(${_attr.precision}, ${_attr.scale})`;
      }
      case "Sequence":
      case "Entity":
      case "Parent":
      case "Detail":
        return `INTEGER`;
      case "Enum":
        return `VARCHAR(1)`;
      case "Date":
        return `DATE`;
      case "Time":
        return `TIME`;
      case "TimeStamp":
        return `TIMESTAMP`;
      case "Float":
        return `DOUBLE PRECISION`;
      case "Boolean":
        return `SMALLINT`;
      case "Blob": {
        const _attr = attr as BlobAttribute;
        if(_attr.subType === "Text") {
          return `BLOB SUB_TYPE TEXT`;
        } else {
          return `BLOB`;
        }
      }
    }
  }

  private static _getChecker(attr: Attribute): string {
    if (attr instanceof ScalarAttribute) {
      switch (attr.type) {
        case "String": {
          const _attr = attr as StringAttribute;
          const minCond = _attr.minLength !== undefined ? `CHAR_LENGTH(VALUE) >= ${_attr.minLength}` : undefined;
          if (minCond) {
            return `CHECK(${minCond})`;
          }
          return "";
        }
        case "Enum": {
          const _attr = attr as EnumAttribute;
          return `CHECK(VALUE IN (${_attr.values.map((item) => `'${item.value}'`).join(", ")}))`;
        }
        case "Boolean": {
          return `CHECK(VALUE IN (0, 1))`;
        }
        default: {
          if (attr instanceof NumberAttribute) {
            const minCond = attr.minValue !== undefined ? DomainResolver._val2Str(attr, attr.minValue) : undefined;
            const maxCond = attr.maxValue !== undefined ? DomainResolver._val2Str(attr, attr.maxValue) : undefined;
            if (minCond && maxCond) {
              return `CHECK(VALUE BETWEEN ${minCond} AND ${maxCond})`;
            } else if (minCond) {
              return `CHECK(VALUE >= ${minCond})`;
            } else if (maxCond) {
              return `CHECK(VALUE <= ${maxCond})`;
            }
          }
          break;
        }
      }
    }

    return "";
  }

  private static _getDefaultValue(attr: any): string {
    let expr = "";
    if (attr.defaultValue !== undefined) {
      expr = `${DomainResolver._val2Str(attr, attr.defaultValue)}`;
    }
    return expr;
  }

  private static _val2Str(attr: ScalarAttribute, value: any): string | undefined {
    switch (attr.type) {
      case "Date":
        return DomainResolver._date2Str(value);
      case "Time":
        return DomainResolver._time2Str(value);
      case "TimeStamp":
        return DomainResolver._dateTime2Str(value);
      case "String":
        return `'${value}'`;
      case "Boolean":
        return `${+value}`;
      case "Enum":
        return `'${value}'`;
      default:
        if (attr instanceof NumberAttribute) {
          return `${value}`;
        }
        break;
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

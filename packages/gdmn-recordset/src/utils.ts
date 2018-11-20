import { IDataRow, TDataType } from "./types";

export function checkField<R extends IDataRow = IDataRow>(row: R, fieldName: string, defaultValue?: TDataType): TDataType {
  const value = row[fieldName];

  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Unknown field name ${fieldName}`);
    }
    return defaultValue;
  }

  return value;
};

export function getAsString<R extends IDataRow = IDataRow>(row: R, fieldName: string, defaultValue?: string): string {
  const value = checkField(row, fieldName, defaultValue);

  if (value === null) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.toString();
};

export function getAsNumber<R extends IDataRow = IDataRow>(row: R, fieldName: string, defaultValue?: number): number {
  const value = checkField(row, fieldName, defaultValue);

  if (value === null) {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  throw new Error(`Field ${fieldName} can't be converted to number`);
};

export function getAsBoolean<R extends IDataRow = IDataRow>(row: R, fieldName: string, defaultValue?: boolean): boolean {
  const value = checkField(row, fieldName, defaultValue);

  if (value === null) {
    return false;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return !!value;
  }

  if (value.toString().toUpperCase() === 'TRUE') {
    return true;
  }

  if (value.toString().toUpperCase() === 'FALSE') {
    return false;
  }

  throw new Error(`Field ${fieldName} can't be converted to boolean`);
};

export function getAsDate<R extends IDataRow = IDataRow>(row: R, fieldName: string, defaultValue?: Date): Date {
  const value = checkField(row, fieldName, defaultValue);

  if (value instanceof Date) {
    return value;
  }

  throw new Error(`Field ${fieldName} can't be converted to Date`);
};

export function isNull<R extends IDataRow = IDataRow>(row: R, fieldName: string): boolean {
  const value = checkField(row, fieldName);

  return value === null;
};

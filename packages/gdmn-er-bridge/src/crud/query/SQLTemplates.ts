export type JoinType = "LEFT" | "RIGHT" | "";

export abstract class SQLTemplates {

  public static field(alias: string, fieldAlias: string, fieldName: string): string {
    return `  ${alias && `${alias}.`}${fieldName} AS ${fieldAlias}`;
  }

  public static from(alias: string, tableName: string): string {
    return `FROM ${tableName} ${alias}`;
  }

  public static join(joinTableName: string,
                     joinAlias: string,
                     joinFieldName: string,
                     alias: string,
                     fieldName: string,
                     type: JoinType = ""): string {
    return `  ${type ? `${type} ` : type}JOIN ${joinTableName} ${joinAlias} ON ` +
      SQLTemplates.equals(joinAlias, joinFieldName, `${alias && `${alias}.`}${fieldName}`);
  }

  public static joinWithTree(joinTableName: string,
                             joinAlias: string,
                             joinFieldName: string,
                             alias: string,
                             fieldName: string): string {
    return `  JOIN ${joinTableName} ${joinAlias} ON ` +
      SQLTemplates.lessOrEquals(joinAlias, joinFieldName, `${alias && `${alias}.`}${joinFieldName}`)
      + " AND " + SQLTemplates.greaterOrEquals(joinAlias, fieldName, `${alias && `${alias}.`}${fieldName}`);
  }

  public static order(alias: string, fieldName: string, sort: string): string {
    return `${alias && `${alias}.`}${fieldName} ${sort}`;
  }

  public static isNull(alias: string, fieldName: string): string {
    return `${alias && `${alias}.`}${fieldName} IS NULL`;
  }

  public static condition(alias: string, fieldName: string, operator: string, value: string): string {
    return `${alias && `${alias}.`}${fieldName} ${operator} ${value}`;
  }

  public static equals(alias: string, fieldName: string, value: string): string {
    return SQLTemplates.condition(alias, fieldName, "=", value);
  }

  public static greater(alias: string, fieldName: string, value: string): string {
    return SQLTemplates.condition(alias, fieldName, ">", value);
  }

  public static less(alias: string, fieldName: string, value: string): string {
    return SQLTemplates.condition(alias, fieldName, "<", value);
  }

  public static lessOrEquals(alias: string, fieldName: string, value: string): string {
    return SQLTemplates.condition(alias, fieldName, "<=", value);
  }

  public static greaterOrEquals(alias: string, fieldName: string, value: string): string {
    return SQLTemplates.condition(alias, fieldName, ">=", value);
  }

}

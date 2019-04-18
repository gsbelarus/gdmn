export type JoinType = "LEFT" | "RIGHT" | "";

export abstract class SQLTemplates {

  public static from(alias: string, tableName: string): string {
    return `FROM ${tableName}${alias && ` ${alias}`}`;
  }

  public static field(alias: string, fieldAlias: string, fieldName: string): string {
    return `  ${alias && `${alias}.`}${fieldName}${fieldAlias && ` AS ${fieldAlias}`}`;
  }

  public static fromWithTree(alias: string, tableName: string, Query1: string, Query2: string, Query3: string): string {
    return `FROM (\n` +
      `  WITH RECURSIVE ${tableName} AS (\n` +
      Query1.split("\n").map((str) => "    " + str).join("\n") +
      `\n\n    UNION ALL\n\n` +
      Query2.split("\n").map((str) => "    " + str).join("\n") +
      `\n  )\n` +
      Query3.split("\n").map((str) => "  " + str).join("\n") +
      `\n) ${alias}`;
  }

  public static joinWithSimpleTree(alias: string, tableName: string, Query1: string, Query2: string, Query3: string): string {
    return ` (\n` +
      `  WITH RECURSIVE ${tableName} AS (\n` +
      Query1.split("\n").map((str) => "    " + str).join("\n") +
      `\n\n    UNION ALL\n\n` +
      Query2.split("\n").map((str) => "    " + str).join("\n") +
      `\n  )\n` +
      Query3.split("\n").map((str) => "  " + str).join("\n") +
      `\n) `;
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

  public static condition(alias: string, fieldName: string, operator: string, value: string, wrapper?: (text: string) => string): string {
    const field = `${alias && `${alias}.`}${fieldName}`;
    return `${wrapper ? wrapper(field) : field} ${operator} ${wrapper ? wrapper(value) : value}`;
  }

  public static assign(alias: string, fieldName: string, value: string): string {
    return SQLTemplates.condition(alias, fieldName, "=", value);
  }

  public static equals(alias: string, fieldName: string, value: string): string {
    return SQLTemplates.condition(alias, fieldName, "=", value);
  }

  public static contains(alias: string, fieldName: string, value: string): string {
    return SQLTemplates.condition(alias, fieldName, "CONTAINING", value);
  }

  public static startingWith(alias: string, fieldName: string, value: string): string {
    return SQLTemplates.condition(alias, fieldName, "STARTING WITH", value);
  }

  public static inOperator(alias: string, fieldName: string, value: string): string {
    return SQLTemplates.condition(alias, fieldName, "IN", `(${value})`);
  }

  public static equalsWithUpper(alias: string, fieldName: string, value: string): string {
    return SQLTemplates.condition(alias, fieldName, "=", value, (text) => `UPPER(${text})`);
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

  public static between(alias: string, fieldName: string, value: string): string {
    return SQLTemplates.condition(alias, fieldName, "BETWEEN", value);
  }

  public static like(alias: string, fieldName: string, value: string): string {
    return SQLTemplates.condition(alias, fieldName, "LIKE", value);
  }

  public static similarTo(alias: string, fieldName: string, value: string): string {
    return SQLTemplates.condition(alias, fieldName, "SIMILAR TO", value);
  }
}

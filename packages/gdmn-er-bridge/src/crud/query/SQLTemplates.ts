export type JoinType = "LEFT" | "RIGHT" | "";

export abstract class SQLTemplates {
  /* SQLTemplates for Insert  */
  public static fieldInsert(fieldName: string): string {
    return `${fieldName}`;
  }

  public static valueInsert(fieldName: string): string {
    return `${fieldName}`;
  }

  public static fromInsert(tableName: string): string {
    return `${tableName}`;
  }

  /* SQLTemplates for Update  */
  public static fieldUpdate(fieldName: string, value?: string): string {
    return `${fieldName} = ${value}`;
  }

  public static fromUpdate(tableName: string): string {
    return `${tableName}`;
  }

  /* SQLTemplates for Delete  */
  public static fromDelete(tableName: string): string {
    return `FROM ${tableName}`;
  }

  /* SQLTemplates for Common  */
  public static from(alias: string, tableName: string): string {
    return `FROM ${tableName} ${alias}`;
  }

  public static field(alias: string, fieldAlias: string, fieldName: string, withoutFieldAlias?: boolean): string {
    if (withoutFieldAlias) {
      return `  ${alias && `${alias}.`}${fieldName}`;
    }
    return `  ${alias && `${alias}.`}${fieldName} AS ${fieldAlias}`;
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

  public static condition(alias: string, fieldName: string, operator: string, value: string): string {
    return `${alias && `${alias}.`}${fieldName} ${operator} ${value}`;
  }

  public static conditionUpdate(fieldName: string, operator: string, value: string): string {
    return `${fieldName} ${operator} ${value}`;
  }

  public static equals(alias: string, fieldName: string, value: string): string {
    return SQLTemplates.condition(alias, fieldName, "=", value);
  }

  public static equalsUpdate(fieldName: string, value: string): string {
    return SQLTemplates.conditionUpdate(fieldName, "=", value);
  }

  public static isNullUpdate(fieldName: string): string {
    return `${fieldName} IS NULL`;
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

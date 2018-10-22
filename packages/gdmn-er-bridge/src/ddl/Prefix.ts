export class Prefix {

  public static GDMN = "GD";
  public static GENERATOR = "G";
  public static DOMAIN = "DOMAIN";
  public static TABLE = "TABLE";
  public static UNIQUE = "UQ";
  public static INDEX = "I";
  public static PRIMARY_KEY = "PK";
  public static FOREIGN_KEY = "FK";
  public static TRIGGER_BI = "BI";

  public static join(name: string, ...prefixes: string[]): string {
    if (!prefixes.length) return name;
    return `${prefixes.join("_")}_${name}`;
  }
}

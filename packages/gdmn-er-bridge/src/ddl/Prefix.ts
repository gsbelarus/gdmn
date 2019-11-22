export class Prefix {

  public static GDMN = "GD";
  public static GENERATOR = "G";
  public static DOMAIN = "DOMAIN";
  public static TABLE = "TABLE";
  public static CONSTRAINT = "C";
  public static UNIQUE = "UQ";
  public static INDEX = "I";
  public static PRIMARY_KEY = "PK";
  public static FOREIGN_KEY = "FK";
  public static TRIGGER_BI = "BI";
  public static CROSS = "USR$CROSS";

  public static join(name: any, ...prefixes: string[]): string {
    if (!prefixes.length) return name;
    return `${prefixes.join("_")}_${name}`;
  }

  public static table(name: any): string {
    return Prefix.join(name, Prefix.TABLE);
  }

  public static domain(name: any): string {
    return Prefix.join(name, Prefix.DOMAIN);
  }

  public static triggerBeforeInsert(name: any): string {
    return Prefix.join(name, Prefix.TRIGGER_BI);
  }

  public static uniqueConstraint(name: any): string {
    return Prefix.join(name, Prefix.CONSTRAINT, Prefix.UNIQUE);
  }

  public static indexConstraint(name: any): string {
    return Prefix.join(name, Prefix.CONSTRAINT, Prefix.INDEX);
  }

  public static pkConstraint(name: any): string {
    return Prefix.join(name, Prefix.CONSTRAINT, Prefix.PRIMARY_KEY);
  }
 
  public static crossPkConstraint(name: any): string {
    return Prefix.join(Prefix.PRIMARY_KEY, name);
  }

  public static fkConstraint(name: any): string {
    return Prefix.join(name, Prefix.CONSTRAINT, Prefix.FOREIGN_KEY);
  }

  public static crossFkConstraint(name: any, constraint: any): string {
    return Prefix.join(name, constraint, Prefix.FOREIGN_KEY);
  }

  public static crossTable(triggerCross: any, bdID: any): string {
    return Prefix.join(bdID, Prefix.CROSS + triggerCross);
  }
}

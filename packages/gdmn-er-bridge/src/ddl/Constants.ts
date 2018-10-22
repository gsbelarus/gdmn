import moment from "moment";
import {Prefix} from "./Prefix";

export class Constants {

  public static GLOBAL_GENERATOR = Prefix.join("UNIQUE", Prefix.GDMN, Prefix.GENERATOR);
  public static GLOBAL_DDL_GENERATOR = Prefix.join("DDL", Prefix.GDMN, Prefix.GENERATOR);

  public static DEFAULT_ID_NAME = "ID";
  public static DEFAULT_INHERITED_KEY_NAME = "INHERITEDKEY";
  public static DEFAULT_MASTER_KEY_NAME = "MASTERKEY";
  public static DEFAULT_PARENT_KEY_NAME = "PARENT";
  public static DEFAULT_CROSS_PK_OWN_NAME = "KEY1";
  public static DEFAULT_CROSS_PK_REF_NAME = "KEY2";
  public static DEFAULT_LB_NAME = "LB";
  public static DEFAULT_RB_NAME = "RB";

  public static TIME_TEMPLATE = "HH:mm:ss.SSS";
  public static DATE_TEMPLATE = "DD.MM.YYYY";
  public static TIMESTAMP_TEMPLATE = "DD.MM.YYYY HH:mm:ss.SSS";

  public static MIN_TIMESTAMP = moment().utc().year(1900).startOf("year").toDate();
  public static MAX_TIMESTAMP = moment().utc().year(9999).endOf("year").toDate();
}

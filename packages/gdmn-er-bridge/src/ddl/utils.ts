import { isUserDefined } from "gdmn-orm";
import { Constants } from "./Constants";

export class DDLUtils {
  /** Функция возвращает имя без префикса */
  public stripUserPrefix(name: string) {
    return isUserDefined(name)
      ? name.substring(Constants.DEFAULT_USR_PREFIX.length)
      : name;
  }
}

export const ddlUtils = new DDLUtils();

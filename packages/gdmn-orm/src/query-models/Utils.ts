import {IEntityQueryResponse, IEntityQueryResponseFieldAliases} from "../index";

export class Utils {

  public static findAttrValue<R>(row: any,
                                 aliases: IEntityQueryResponseFieldAliases,
                                 linkAlias: string,
                                 attribute: string,
                                 setAttribute?: string): R {
    const c = Object.entries(aliases);

    const aliasEntry = c.find(([key, value]) => {
      if (setAttribute && value.linkAlias === linkAlias && value.setAttribute === setAttribute) {
        return true;
      }
      if (attribute && value.linkAlias === linkAlias && value.attribute === attribute) {
        return true;
      }
      return false;
    });

    if (!aliasEntry) {
      throw new Error(`Attribute '${attribute}' is not found for linkAlias '${linkAlias}'`);
    }

    return row[aliasEntry[0]];
  }

  public static findAttrValues<R>(result: IEntityQueryResponse,
                                  linkAlias: string,
                                  attribute: string,
                                  setAttribute?: string): R[] {
    return result.data.map((row: any) =>
      this.findAttrValue(row,
        result.aliases,
        linkAlias,
        attribute,
        setAttribute));
  }
}

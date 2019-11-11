import {
  Attribute,
  EntityLink,
  EntityLinkField,
  EntityQuerySet,
  IEntityQuerySetWhere,
  ScalarAttribute,
  SetAttribute
} from "gdmn-orm";
import {AdapterUtils} from "../../AdapterUtils";
import {SQLTemplates} from "./SQLTemplates";

export interface IParams {
  [paramName: string]: any;
}

export class SelectSet {

  public readonly query: EntityQuerySet;
  public readonly sql: string = "";
  public readonly params: IParams = {};
  public readonly fieldAliases = new Map<EntityLinkField, Map<Attribute, string>>();

  private readonly _linkAliases = new Map<EntityLink, { [relationName: string]: string }>();

  constructor(query: EntityQuerySet) {
    this.query = query;
    this.sql = this._getSelect(this.query);
  }

  private _findSetField(query: EntityQuerySet):EntityLinkField | undefined {
    return query.link.fields.find((field) => field.attribute.type === "Set")
  }

  private _getSelect(query: EntityQuerySet, existsLink?: EntityLink): string {
    const {options, link} = query;

    let sql = `SELECT` +
      `\n${this._makeFields(link).join(",\n")}` +
      `\n${this._makeFrom(query) + '\n'}` +
      this._makeJoin(link).join("\n") +
      `\nWHERE ${this._makeWhereConditions(query, options && options.where)}`;
    return sql;
  }

  private _makeFields(link: EntityLink, withoutAlias?: boolean): string[] {
    const fields = link.fields
      .filter((field) => !field.links)
      .map((field) => {
        const attribute = field.attribute as ScalarAttribute;
        const tableAlias = this._getTableAlias(link, attribute.adapter!.relation);
        const fieldAlias = withoutAlias ? "" : this._getFieldAlias(field);
        return SQLTemplates.field(tableAlias, fieldAlias, attribute.adapter!.field);
      });

    const joinedFields = link.fields.reduce((items, field) => {
      if (field.links) {
        if (field.setAttributes) {
          const attribute = field.attribute as SetAttribute;
          const crossFields = field.setAttributes.map((setAttr) => {
            return SQLTemplates.field(
              this._getTableAlias(link, attribute.adapter!.crossRelation),
              this._getFieldAlias(field, setAttr),
              setAttr.adapter!.field
            );
          });
          items = items.concat(crossFields);
        }
        for (const fLink of field.links) {
          items = items.concat(this._makeFields(fLink));
        }
        return items;
      }
      return items;
    }, [] as string[]);

    return fields.concat(joinedFields);
  }

  private _makeFrom(query: EntityQuerySet): string {
    const {link} = query;
    const findSetField =  this._findSetField(query);

    return SQLTemplates.from(this._getTableAlias(
        link,
        findSetField!.attribute.adapter!.crossRelation),
        findSetField!.attribute.adapter!.crossRelation);
  }

  private _makeJoin(link: EntityLink): string[] {

    return link.fields.reduce((joins, field) => {
      if (field.links) {
        for (const fLink of field.links) {

          const linkFirstRelationName = AdapterUtils.getMainRelationName(fLink.entity);
          const linkFirstPKFieldName = AdapterUtils.getPKFieldName(fLink.entity, linkFirstRelationName);
          if(field.attribute.type === "Set"){
                const attr = field.attribute as SetAttribute;
                joins.push(
                  SQLTemplates.join(
                    linkFirstRelationName,
                    this._getTableAlias(fLink, linkFirstRelationName),
                    linkFirstPKFieldName,
                    this._getTableAlias(link, attr.adapter!.crossRelation),
                    attr.adapter!.crossPk[1],
                    "LEFT"
                  )
                );
          }
        }
        return joins;
      }
      return joins;
    }, [] as string[]);
  }

  private _makeWhereConditions(query: EntityQuerySet, where?: IEntityQuerySetWhere[]): string[] {
    if (!where) {
      return [];
    }
    const findSetField =  this._findSetField(query);

    return where.reduce((items, item) => {
        return item.equals!.map((equals) => {
          const alias = this._getTableAlias(query.link, findSetField!.attribute.adapter!.crossRelation);
          return SQLTemplates.equals(alias, findSetField!.attribute.adapter!.crossPk[0], this._addToParams(equals.value));
        });
    }, [] as string[]);
  }

  private _getLink(alias: string, link: EntityLink, existsLink?: EntityLink): EntityLink {
    const findLink = link.deepFindLink(alias) ? link.deepFindLink(alias) : existsLink && existsLink.deepFindLink(alias);
    if (!findLink) {
      throw new Error(`Alias ${alias} is not found`);
    }
    return findLink;
  }

  private _getTableAlias(link: EntityLink, relationName: string): string {
    let linkAlias = this._linkAliases.get(link);
    if (!linkAlias) {
      linkAlias = {};
      this._linkAliases.set(link, linkAlias);
    }
    let relAlias = linkAlias[relationName];
    let i = 0;
    if (!relAlias) {
      for (const values of this._linkAliases.values()) {
        i += Object.keys(values).length;
      }
      relAlias = `T$${i + 1}`;
      linkAlias[relationName] = relAlias;
    }
    return relAlias;
  }

  private _getFieldAlias(field: EntityLinkField, setAttr?: Attribute): string {
    if ((setAttr && !field.setAttributes)
      || (setAttr && field.setAttributes && !field.setAttributes.some((attr) => attr === setAttr))) {
      throw new Error("Incorrect set attribute");
    }
    let fieldAlias = this.fieldAliases.get(field);
    if (!fieldAlias) {
      fieldAlias = new Map<Attribute, string>();
      this.fieldAliases.set(field, fieldAlias);
    }
    let attrAlias = fieldAlias.get(setAttr || field.attribute);

    let i = 0;
    if (!attrAlias) {
      for (const values of this.fieldAliases.values()) {
        i += values.size;
      }
      attrAlias = `F$${i + 1}`;
      fieldAlias.set(setAttr || field.attribute, attrAlias);
    }
    return attrAlias;
  }

  private _addToParams(value: any): string {
    const length = Object.keys(this.params).length;
    const placeholder = `P$${length + 1}`;
    this.params[placeholder] = value;
    return `:${placeholder}`;
  }
}

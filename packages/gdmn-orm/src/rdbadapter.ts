import clone from "clone";

export const MIN_64BIT_INT = -9223372036854775808;
export const MAX_64BIT_INT = +9223372036854775807;
export const MIN_32BIT_INT = -2147483648;
export const MAX_32BIT_INT = +2147483647;
export const MIN_16BIT_INT = -32768;
export const MAX_16BIT_INT = +32767;

export const systemFields = [
  "AVIEW",
  "ACHAG",
  "AFULL",
  "DISABLED",
  "CREATIONDATE",
  "CREATORKEY",
  "EDITIONDATE",
  "EDITORKEY"
];

export interface ISequenceAdapter {
  sequence: string;
}

export interface IEntitySelector {
  field: string;
  value: (number | string) | Array<(number | string)>;
}

export function sameSelector(selA: IEntitySelector | undefined, selB: IEntitySelector | undefined): boolean {
  if (selA === undefined && selB === undefined) {
    return true;
  }

  if (selA === undefined || selB === undefined) {
    return false;
  }

  if (selA.field !== selB.field) {
    return false;
  }

  if (typeof selA.value !== typeof selB.value) {
    return false;
  }

  if (Array.isArray(selA.value) && Array.isArray(selB.value)) {
    if (typeof selA.value[0] === "number" && typeof selB.value[0] === "number") {
      return JSON.stringify((selA.value as number[]).sort((a, b) => a - b)) ===
        JSON.stringify((selB.value as number[]).sort((a, b) => a - b));
    }

    if (typeof selA.value[0] === "string" && typeof selB.value[0] === "string") {
      return JSON.stringify(selA.value.sort()) === JSON.stringify(selB.value.sort());
    }

    return !selA.value.length && !selB.value.length;
  }

  return selA.value === selB.value;
}

export type Weak = true;

export interface IRelation {
  relationName: string;
  pk?: string[];
  selector?: IEntitySelector;
  fields?: string[];
  weak?: Weak;
}

export interface IEntityAdapter {
  relation: IRelation[];
  refresh?: boolean;
}

export interface IAttributeAdapter {
  relation: string;
  field: string;
}

export interface ISetAttributeAdapter {
  crossRelation: string;
  crossPk: string[];
  presentationField?: string;
}

/**
 * Адаптер для атрибута детальной сущности это массив из объектов,
 * каждый из которых содержит имя детальной таблицы и имя её поля,
 * являющегося внешним ключем на одну из таблиц мастер сущности.
 *
 * Рассмотрим структуру сложного документа. Шапка хранится в двух
 * таблицах:
 *
 *  GD_DOCUMENT -- DOC_HEADER_TABLE
 *
 * позиция тоже хранится в двух таблицах:
 *
 *  GD_DOCUMENT -- DOC_LINE_TABLE
 *
 * В ER модели, сущность документа будет содержать атрибут
 * детальной сущности (позиции документа). Как правило, имя атрибута
 * совпадает с именем детальной таблицы.
 *
 * Адаптер детальной сущности будет содержать следующий массив:
 *
 * [
 *   {
 *     detailRelation: 'GD_DOCUMENT',
 *     link2masterField: 'PARENT'
 *   },
 *   {
 *     detailRelation: 'DOC_LINE_TABLE',
 *     link2masterfield: 'MASTERKEY'
 *   }
 * ]
 */
export interface IDetailAttributeAdapter {
  masterLinks: Array<{
    detailRelation: string;
    link2masterField: string;
  }>;
}

export interface ICrossRelation {
  owner: string;
  selector?: IEntitySelector;
}

export interface ICrossRelations {
  [name: string]: ICrossRelation;
}

export function relationName2Adapter(relationName: string): IEntityAdapter {
  return {
    relation: [{
      relationName
    }]
  };
}

export function relationNames2Adapter(relationNames: string[]): IEntityAdapter {
  return {relation: relationNames.map((relationName) => ({relationName}))};
}

export function appendAdapter(src: IEntityAdapter, relationName: string): IEntityAdapter {
  const em = clone(src);
  if (relationName && !em.relation.find((r) => r.relationName === relationName)) {
    em.relation.push({relationName});
  }
  return em;
}

export function sameAdapter(mapA: IEntityAdapter, mapB: IEntityAdapter): boolean {
  const arrA = mapA.relation.filter((r) => !r.weak);
  const arrB = mapB.relation.filter((r) => !r.weak);
  return arrA.length === arrB.length
    && arrA.every((a, idx) => a.relationName === arrB[idx].relationName
      && sameSelector(a.selector, arrB[idx].selector));
}

export function hasField(em: IEntityAdapter, rn: string, fn: string): boolean {
  const r = em.relation.find((ar) => ar.relationName === rn);

  if (!r) {
    throw new Error(`Can't find relation ${rn} in adapter`);
  }

  return !r.fields || !!r.fields.find((f) => f === fn);
}

export function isUserDefined(name: string): boolean {
  return name.substring(0, 4) === "USR$";
}

export function condition2Selectors(cond: string): IEntitySelector[] {
  // conditions like field_name = some_int_value
  const matchA = /([A-Za-z_0-9]+)\s*=\s*([0-9]+)/.exec(cond);
  if (matchA) {
    return [
      {
        field: matchA[1].toUpperCase(),
        value: Number.parseInt(matchA[2], 10)
      }
    ];
  }

  // conditions like field_name in (some_int_value_1 [, some_int_value_2...])
  const matchB = /([A-Za-z_0-9]+)\s+IN\s*\(([0-9,]+)\)/i.exec(cond);
  if (matchB) {
    const regExpC = /([0-9]+)/g;
    const values = matchB[2];
    const result = [];
    let matchC = regExpC.exec(values);
    while (matchC) {
      result.push({field: matchB[1].toUpperCase(), value: Number.parseInt(matchC[0], 10)});
      matchC = regExpC.exec(values);
    }
    return result;
  }

  return [];
}

export function adjustName(relationName: string): string {
  // return relationName.replace('$', '_');
  return relationName;
}

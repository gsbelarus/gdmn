import { IRectangle, IObject, Objects, IGrid, IField } from "./types";
import { getTheme, IStyle, ITextFieldStyles, ILabelStyles } from "office-ui-fabric-react";
import { EntityAttribute, Entity } from "gdmn-orm";
import { getLName } from "gdmn-internals";
import { RecordSet, IFieldDef } from "gdmn-recordset";
import { ISetComboBoxData } from "../ermodel/utils";

export const isSingleCell = (rect?: IRectangle) => rect && rect.left === rect.right && rect.top === rect.bottom;
export const inRect = (rect: IRectangle | undefined, x: number, y: number) => rect && x >= rect.left && y >= rect.top && x <= rect.right && y <= rect.bottom;
export const rectIntersect = (rect1: IRectangle, rect2?: IRectangle) => rect2 && !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.top > rect2.bottom || rect1.bottom < rect2.top);
export const isValidRect = (rect: IRectangle) => rect.left <= rect.right && rect.bottom >= rect.top;
export const outOfBorder = (rect: IRectangle, borders: IRectangle) => rect.left < borders.left || rect.top < borders.top || rect.right > borders.right || rect.bottom > borders.bottom;
export const rect = (left: number, top: number, right: number, bottom: number) => ({left, top, right, bottom});
export const sameRect = (rect1?: IRectangle, rect2?: IRectangle) => (rect1 === rect2) ||
  (rect1 && rect2 && rect1.left === rect2.left && rect1.top === rect2.top && rect1.right === rect2.right && rect1.bottom === rect2.bottom);

export const makeRect = (rect: IRectangle, x: number, y: number) => inRect(rect, x, y)
  ?
    {
      left: rect.left,
      top: rect.top,
      right: x,
      bottom: y
    }
  :
    {
      left: Math.min(rect.left, x),
      top: Math.min(rect.top, y),
      right: Math.max(rect.right, x),
      bottom: Math.max(rect.bottom, y),
    };

export const outOfGrid = (r: IRectangle, grid: IGrid) => outOfBorder(r, rect(0, 0, grid.columns.length - 1, grid.rows.length - 1));

const inheritValue = (object: IObject, valueName: string, objects: Objects): any => {
  const res = (object as any)[valueName];

  if (res === undefined) {
    const parent = objects.find( obj => object.parent === obj.name );
    if (parent) {
      return inheritValue(parent, valueName, objects);
    }
  }

  return res;
};

export const getColor = (color: string | undefined): string | undefined => {
  let res;

  if (color) {
    const [objName, colorName] = color.split('.');

    if (objName === 'palette') {
      res = (getTheme().palette as any)[colorName];
    }
    else if (objName === 'semanticColors') {
      res = (getTheme().semanticColors as any)[colorName];
    }

    if (!res) {
      res = color;
    }
  }

  return res;
};

export const object2style = (object: IObject, objects: Objects, enabled: boolean = true): React.CSSProperties =>
  enabled
  ?
    {
      backgroundColor: getColor(inheritValue(object, 'backgroundColor', objects)),
      color: getColor(inheritValue(object, 'color', objects)),
      margin: '0 4px 4px 0'
    }
  :
   {};

export const object2IStyle = (object: IObject, objects: Objects): IStyle => ({
  backgroundColor: getColor(inheritValue(object, 'backgroundColor', objects)),
  color: getColor(inheritValue(object, 'color', objects)),
});

export const object2ITextFieldStyles = (object: IObject, objects: Objects): Partial<ITextFieldStyles> => ({
  root: object2IStyle(object, objects),
  fieldGroup: object2IStyle(object, objects),
  subComponentStyles: {
    label: object2ILabelStyles(object, objects)
  }
});

export const object2ILabelStyles = (object: IObject, objects: Objects): Partial<ILabelStyles> => ({
  root: object2IStyle(object, objects)
});

export const getFields = (rs?: RecordSet, entity?: Entity): IField[] =>
  rs && entity
  ?
    rs.fieldDefs.map(fd => {
      const attr = fd.eqfa && ((fd.eqfa.linkAlias !== rs.eq!.link.alias )
        ? entity.attributes[fd.eqfa.linkAlias] as EntityAttribute
        : entity.attributes[fd.eqfa.attribute]);
      return ({
        type: 'FIELD',
        parent: 'Area1',
        fieldName: fd.eqfa ? `${fd.eqfa.linkAlias}.${fd.eqfa?.attribute}` : fd.fieldName,
        label: attr ? getLName(attr.lName, ['by', 'ru', 'en']) : fd.caption,
        name: fd.caption
      } as IField)
    })
  :
    [];

export const getSetFields = (setComboBoxData?: ISetComboBoxData, entity?: Entity): IField[] =>
  entity && setComboBoxData
  ?
    Object.keys(setComboBoxData).map(fd => {
      const attr = entity.attributes[fd] as EntityAttribute;
        return ({
          type: 'FIELD',
          parent: 'Area1',
          fieldName: fd,
          label: attr ? getLName(attr.lName, ['by', 'ru', 'en']) : fd,
          name: fd
        } as IField)
      })
  :
    [];

export interface ISelectField {
  key: string;
  name: string;
  label: string;
  dataType: string;
};

export const getSelectFields = (rs?: RecordSet, entity?: Entity): ISelectField[] =>
  rs?.fieldDefs && entity
  ?
    rs.fieldDefs.map(fd => {
      const attr = fd.eqfa && ((fd.eqfa.linkAlias !== rs.eq!.link.alias )
        ? entity.attributes[fd.eqfa.linkAlias] as EntityAttribute
        : entity.attributes[fd.eqfa.attribute]);
      return {
        key: fd.eqfa ? `${fd.eqfa.linkAlias}.${fd.eqfa?.attribute}` : '',
        name: fd.eqfa ? `${fd.eqfa.linkAlias}.${fd.eqfa?.attribute}` : '',
        label: attr ? getLName(attr.lName, ['by', 'ru', 'en']) : fd.caption,
        dataType: attr ? attr.inspectDataType() : 'S'
      } as ISelectField;
    })
  : [];

export const getSetSelectFields = (setComboBoxData?: ISetComboBoxData, entity?: Entity): ISelectField[] =>
  setComboBoxData && entity
  ?
    Object.keys(setComboBoxData).map(fd => {
      const attr = entity.attributes[fd] as EntityAttribute;
        return {
          key: fd,
          name: fd,
          label: attr ? getLName(attr.lName, ['by', 'ru', 'en']) : fd,
          dataType: attr ? attr.inspectDataType() : 'S'
        } as ISelectField;
      })
  : [];

/**
 * В файле с настройками мы храним название поля ввиде строки
 * формата АЛИАС_ИЗ_ENTITY_QUERY.ИМЯ_ПОЛЯ или ИМЯ_ПОЛЯ. В последнем
 * случае считается, что поле принадлежит корневому алиасу.
 * Данная функция позволяет сопоставить такое имя с определением
 * поля из RecordSet. Возвращает undefined, если в RecordSet
 * нет подходящего поля.
 * @param fn Имя поля. Строка в формате АЛИАС_ИЗ_ENTITY_QUERY.ИМЯ_ПОЛЯ или ИМЯ_ПОЛЯ.
 * @param rs RecordSet.
 */
export const getFieldDefByFieldName = (fn: string, rs: RecordSet): IFieldDef | undefined => {
  const f = fn.split('.');
  if (f.length === 1) {
    return rs.fieldDefs.find( fd => fd.eqfa?.linkAlias === rs?.eq?.link.alias && fd.eqfa?.attribute === f[0] );
  } else {
    return rs.fieldDefs.find( fd => fd.eqfa?.linkAlias === f[0] && fd.eqfa?.attribute === f[1] );
  }
}

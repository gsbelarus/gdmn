export type TUnit = 'AUTO' | 'FR' | 'PX';

export interface ISize {
  unit: TUnit;
  value?: number;
};

export interface IGrid {
  columns: ISize[];
  rows: ISize[];
};

export interface IRectangle {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type TObjectType = 'WINDOW' | 'AREA' | 'LABEL' | 'IMAGE' | 'FIELD' | 'FRAME';

export const objectNamePrefixes = {
  'WINDOW': 'Window',
  'AREA': 'Area',
  'LABEL': 'Label',
  'IMAGE': 'Image',
  'FIELD': 'Field',
  'FRAME': 'Frame'
};

export interface IObject {
  name: string;
  parent?: string;
  type: TObjectType;
  color?: string;
  backgroundColor?: string;
};

export interface IWindow extends IObject {
  type: 'WINDOW';
};

export function isWindow(x: IObject | undefined): x is IWindow {
  return x instanceof Object && x.type === 'WINDOW';
};

export interface ILabel extends IObject {
  type: 'LABEL';
  text: string;
};

export function isLabel(x: IObject | undefined): x is ILabel {
  return x instanceof Object && x.type === 'LABEL';
};

export interface IImage extends IObject {
  type: 'IMAGE';
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export function isImage(x: IObject | undefined): x is IImage {
  return x instanceof Object && x.type === 'IMAGE';
};

export interface IFrame extends IObject {
  type: 'FRAME';
  caption?: string;
  border?: boolean;
  height?: string;
  marginLeft?: boolean;
  marginTop?: boolean;
  marginRight?: boolean;
  marginBottom?: boolean;
};

export function isFrame(x: IObject | undefined): x is IFrame {
  return x instanceof Object && x.type === 'FRAME';
};

export interface IField extends IObject {
  type: 'FIELD';
  fieldName: string;
  label: string;
};

export function isField(x: IObject | undefined): x is IField {
  return x instanceof Object && x.type === 'FIELD';
};

export interface IObjectWithCoord extends IObject, IRectangle { };

export interface IArea extends IObjectWithCoord {
  type: 'AREA';
  horizontal?: boolean;
};

export function isArea(x: IObject | undefined): x is IArea {
  return x instanceof Object && x.type === 'AREA';
};

export type Object = IWindow | IArea | ILabel | IImage | IField | IFrame;

export type Objects = Object[];

export const getAreas = (objects: Objects): IArea[] => objects.filter( object => isArea(object) ) as IArea[];
export const getFrames = (objects: Objects): IFrame[] => objects.filter( object => isFrame(object) ) as IFrame[];
export const getWindow = (objects: Objects): IWindow => objects.find( object => isWindow(object) ) as IWindow;

export type OnUpdateSelectedObject = (newProps: Partial<Object>) => void;

export const deleteWithChildren = (deletedObject: Object, objects: Objects) => {
  let res = objects;
  let firstChild: Object | undefined;
  while (firstChild = res.find( object => object.parent === deletedObject.name )) {
    res = deleteWithChildren(firstChild, res).filter( object => object !== firstChild );
  }
  return res.filter( object => object !== deletedObject );
};

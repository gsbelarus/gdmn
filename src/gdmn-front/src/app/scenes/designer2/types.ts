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

export type TObjectType = 'WINDOW' | 'AREA' | 'LABEL' | 'IMAGE' | 'FIELD';

export const objectNamePrefixes = {
  'WINDOW': 'Window',
  'AREA': 'Area',
  'LABEL': 'Label',
  'IMAGE': 'Image',
  'FIELD': 'Field'
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
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
};

export function isImage(x: IObject | undefined): x is IImage {
  return x instanceof Object && x.type === 'IMAGE';
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

export type Object = IWindow | IArea | ILabel | IImage | IField;

export type Objects = Object[];

export const areas = (objects: Objects): IArea[] => objects.filter( object => isArea(object) ) as IArea[];

export type OnUpdateSelectedObject = (newProps: Partial<Object>) => void;


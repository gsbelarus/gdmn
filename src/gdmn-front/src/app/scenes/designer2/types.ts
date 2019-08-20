export type TUnit = 'AUTO' | 'FR' | 'PX';

export interface ISize {
  unit: TUnit;
  value?: number;
};

export interface IGridSize {
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

export function isWindow(x: IObject): x is IArea {
  return x.type === 'WINDOW';
};

export interface ILabel extends IObject {
  type: 'LABEL';
  text: string;
};

export interface IObjectWithCoord extends IObject, IRectangle { };

export interface IArea extends IObjectWithCoord {
  type: 'AREA';
  horizontal?: boolean;
};

export function isArea(x: IObject): x is IArea {
  return x.type === 'AREA';
};

export type Object = IWindow | IArea | ILabel;

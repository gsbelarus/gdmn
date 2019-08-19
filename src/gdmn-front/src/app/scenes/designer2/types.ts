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

import React from "react";
import { IGridSize, ISize, IArea } from "./types";
import { SizeLine } from "./SizeLine";
import { AreaSize } from "./AreaSize";

export interface IGridInspectorProps {
  grid: IGridSize;
  selectedArea?: IArea;
  onUpdateGrid: (updateColumn: boolean, idx: number, newSize: ISize) => void;
  onChangeArea: (newArea: IArea) => void;
};

export const GridInspector = ({ grid, onUpdateGrid, selectedArea, onChangeArea }: IGridInspectorProps) => {
  return (
    <>
      <AreaSize selectedArea={selectedArea} onChange={onChangeArea} />
      {grid.columns.map( (column, idx) =>
        <SizeLine
          key={`Column${idx}`}
          label="Column"
          idx={idx}
          size={column}
          onSetUnit={ unit => onUpdateGrid(true, idx, {...column, unit}) }
          onSetValue={ value => onUpdateGrid(true, idx, {...column, value}) }
        />
      )}
      {grid.rows.map( (row, idx) =>
        <SizeLine
          key={`Row${idx}`}
          label="Row"
          idx={idx}
          size={row}
          onSetUnit={ unit => onUpdateGrid(false, idx, {...row, unit}) }
          onSetValue={ value => onUpdateGrid(false, idx, {...row, value}) }
        />
      )}
    </>
  );
};
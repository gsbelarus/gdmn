import React from "react";
import { IGrid, ISize, IArea } from "./types";
import { SizeLine } from "./SizeLine";
import { AreaSize } from "./AreaSize";
import { Label } from "office-ui-fabric-react";

export type OnUpdateGrid = (updateColumn: boolean, idx: number, newSize: ISize) => void;

export interface IGridInspectorProps {
  grid: IGrid;
  selectedArea?: IArea;
  onUpdateGrid: OnUpdateGrid;
  onChangeArea: (newArea: IArea) => void;
};

export const GridInspector = ({ grid, onUpdateGrid, selectedArea, onChangeArea }: IGridInspectorProps) => {
  return (
    <>
      <AreaSize selectedArea={selectedArea} grid={grid} onChange={onChangeArea} />
      <Label>Grid size:</Label>
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
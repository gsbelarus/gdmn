import React from "react";
import { IGridSize, IRectangle, ISize, IArea } from "./types";
import { isSingleCell } from "./utils";
import { SizeLine } from "./SizeLine";

export interface IGridInspectorProps {
  grid: IGridSize;
  gridSelection?: IRectangle;
  selectedArea?: IArea;
  onUpdateGrid: (updateColumn: boolean, idx: number, newSize: ISize) => void;
};

export const GridInspector = (props: IGridInspectorProps) => {

  const { grid, gridSelection, onUpdateGrid } = props;

  if (!gridSelection || !isSingleCell(gridSelection)) {
    return (
      <div>
        Select one cell to adjust width and height of grid's column and row.
      </div>
    );
  }

  const columnSize = grid.columns[gridSelection.left];
  const rowSize = grid.rows[gridSelection.top];

  return (
    <>
      <SizeLine
        label="Column"
        idx={gridSelection.left}
        size={columnSize}
        onSetUnit={ unit => onUpdateGrid(true, gridSelection.left, {...columnSize, unit}) }
        onSetValue={ value => onUpdateGrid(true, gridSelection.left, {...columnSize, value}) }
      />
      <SizeLine
        label="Row"
        idx={gridSelection.top}
        size={rowSize}
        onSetUnit={ unit => onUpdateGrid(false, gridSelection.top, {...columnSize, unit}) }
        onSetValue={ value => onUpdateGrid(false, gridSelection.top, {...columnSize, value}) }
      />
    </>
  );
};
import React from "react";
import { getTheme } from "office-ui-fabric-react";
import { inRect, makeRect, rect } from "./utils";
import { IRectangle } from "./types";

interface IGridCellProps {
  x: number;
  y: number;
  gridSelection?: IRectangle;
  onSetGridSelection: (r: IRectangle) => void;
};

export const GridCell = ({ x, y, gridSelection, onSetGridSelection }: IGridCellProps) =>
  <div
    key={`grid_cell_${y + 1} / ${x + 1} / ${y + 2} / ${x + 2}`}
    style={{
      gridArea: `${y + 1} / ${x + 1} / ${y + 2} / ${x + 2}`,
      borderColor: getTheme().palette.neutralTertiary,
      backgroundColor: inRect(gridSelection, x, y) ? getTheme().palette.red : undefined,
      border: '1px dotted',
      borderRadius: '4px',
      margin: '2px',
      zIndex: 10,
      padding: '4px',
      opacity: 0.6
    }}
    onClick={ e => {
      e.stopPropagation();
      e.preventDefault();
      if (e.shiftKey && gridSelection) {
        onSetGridSelection(makeRect(gridSelection, x, y));
      } else {
        onSetGridSelection(rect(x, y, x, y));
      }
    }}
  >
    {`(${x}, ${y})`}
  </div>;
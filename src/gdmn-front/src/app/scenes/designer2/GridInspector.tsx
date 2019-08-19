import React from "react";
import { Stack, Dropdown, TextField } from "office-ui-fabric-react";
import { IGridSize, IRectangle, ISize } from "./types";
import { isSingleCell } from "./utils";

export interface IGridInspectorProps {
  grid: IGridSize;
  gridSelection?: IRectangle;
  onSetColumnWidth: (column: number, size: ISize) => void;
  onSetRowHeight: (row: number, size: ISize) => void;
};

export const GridInspector = (props: IGridInspectorProps) => {

  const { grid, gridSelection } = props;
  const columnSize = gridSelection && isSingleCell(gridSelection) ? grid.columns[gridSelection.left] : undefined;
  const rowSize = gridSelection && isSingleCell(gridSelection) ? grid.rows[gridSelection.top] : undefined;

  const options = [
    { key: 'AUTO', text: 'AUTO' },
    { key: 'FR', text: 'FR' },
    { key: 'PX', text: 'PX' }
  ];

  const tokens = { childrenGap: 10 };

  if (isSingleCell(gridSelection)) {
    return (
      <>
        <Stack horizontal tokens={tokens}>
          <Stack.Item align="end">
            <Dropdown
              label={`Column ${gridSelection!.left + 1}:`}
              options={options}
              selectedKey={columnSize ? columnSize.unit : undefined}
              styles={{
                root: {
                  width: '96px'
                }
              }}
            />
          </Stack.Item>
          {
            columnSize && columnSize.unit !== 'AUTO'
            ?
              <Stack.Item align="end">
                <TextField
                />
              </Stack.Item>
            : null
          }
        </Stack>
        <Stack horizontal tokens={tokens}>
          <Stack.Item align="end">
            <Dropdown
              label={`Row ${gridSelection!.top + 1}:`}
              selectedKey={rowSize ? rowSize.unit : undefined}
              options={options}
              styles={{
                root: {
                  width: '96px'
                }
              }}
            />
          </Stack.Item>
          {
            rowSize && rowSize.unit !== 'AUTO'
            ?
              <Stack.Item align="end">
                <TextField
                />
              </Stack.Item>
            : null
          }
        </Stack>
      </>
    );
  } else {
    return (
      <div>
        Select one cell to adjust width and height of grid's column and row.
      </div>
    );
  }
};
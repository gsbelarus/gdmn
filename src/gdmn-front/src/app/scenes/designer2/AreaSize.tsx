import React, { useCallback } from "react";
import { IArea } from "./types";
import { Label, Stack, TextField } from "office-ui-fabric-react";
import { isValidRect, sameRect } from "./utils";

interface IAreaSizeProps {
  selectedArea?: IArea;
  onChange: (area: IArea) => void;
};

const propNames = ['Left', 'Top', 'Right', 'Bottom'];

export const AreaSize = ({ selectedArea, onChange }: IAreaSizeProps) => {

  const getOnChange = useCallback( (propName: string) => (_e: any, newValue?: string | undefined) => {
    if (selectedArea && newValue !== '' && newValue !== undefined) {
      const v = Number(newValue);
      if (!isNaN(v)) {
        const newArea = { ...selectedArea, [propName]: v };
        if (isValidRect(newArea) && !sameRect(newArea, selectedArea)) {
          onChange(newArea);
        }
      }
    }
  }, [selectedArea, onChange]);

  return (
    <div>
      {
        selectedArea
          ? <Label>Selected area "{selectedArea.name}":</Label>
          : <Label>Please, select area to adjust its borders.</Label>
      }
      <Stack horizontal tokens={{ childrenGap: 4 }}>
        {
          propNames.map( n =>
            <TextField
              key={n}
              label={n}
              disabled={!selectedArea}
              defaultValue={selectedArea ? (selectedArea as any)[n.toLowerCase()].toString() : ''}
              onChange={ getOnChange(n.toLowerCase()) }
            />
          )
        }
      </Stack>
    </div>
  );
}
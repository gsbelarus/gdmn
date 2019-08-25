import React, { useState, useEffect, useMemo } from "react";
import { IArea, IGrid } from "./types";
import { Label, Stack, TextField, getTheme } from "office-ui-fabric-react";
import { isValidRect, sameRect, rect, outOfGrid } from "./utils";

interface IAreaSizeProps {
  selectedArea?: IArea;
  grid: IGrid;
  onChange: (area: IArea) => void;
};

export const AreaSize = ({ selectedArea, grid, onChange }: IAreaSizeProps) => {

  const [left, setLeft] = useState('');
  const [top, setTop] = useState('');
  const [right, setRight] = useState('');
  const [bottom, setBottom] = useState('');
  const [error, setError] = useState(false);
  const [savedArea, setSavedArea] = useState<IArea | undefined>(undefined);

  useEffect( () => {
    setLeft(selectedArea ? selectedArea.left.toString() : '');
    setTop(selectedArea ? selectedArea.top.toString() : '');
    setRight(selectedArea ? selectedArea.right.toString() : '');
    setBottom(selectedArea ? selectedArea.bottom.toString() : '');
    setError(false);
    setSavedArea(selectedArea);
  }, [selectedArea]);

  useEffect( () => {
    if (savedArea === selectedArea) {
      if (!selectedArea) {
        setError(false);
        return;
      }

      if (left === '' || top === '' || right === '' || bottom === '') {
        setError(true);
        return;
      }

      const tempRect = rect(Number(left), Number(top), Number(right), Number(bottom));

      if (isValidRect(tempRect) && !outOfGrid(tempRect, grid)) {
        if (selectedArea && !sameRect(tempRect, selectedArea)) {
          onChange({...selectedArea, ...tempRect});
        }
        setError(false);
      } else {
        setError(true);
      }
    }
  }, [left, right, top, bottom, selectedArea, savedArea]);

  const styles = useMemo( () => error ? {
    fieldGroup: {
      backgroundColor: getTheme().semanticColors.errorBackground
    },
    subComponentStyles: {
      label: {
        root: {
          color: getTheme().semanticColors.errorText
        }
      }
    }
  }: {}, [error] );

  return (
    <div>
      {
        selectedArea
          ? <Label>Selected area "{selectedArea.name}":</Label>
          : <Label>Please, select area to adjust its borders.</Label>
      }
      <Stack horizontal tokens={{ childrenGap: 4 }}>
        <TextField
          label='Left'
          disabled={!selectedArea}
          value={left}
          styles={styles}
          onChange={ (e, newValue) => newValue !== undefined && setLeft(newValue) }
        />
        <TextField
          label='Top'
          disabled={!selectedArea}
          value={top}
          styles={styles}
          onChange={ (e, newValue) => newValue !== undefined && setTop(newValue) }
        />
        <TextField
          label='Right'
          disabled={!selectedArea}
          value={right}
          styles={styles}
          onChange={ (e, newValue) => newValue !== undefined && setRight(newValue) }
        />
        <TextField
          label='Bottom'
          disabled={!selectedArea}
          value={bottom}
          styles={styles}
          onChange={ (e, newValue) => newValue !== undefined && setBottom(newValue) }
        />
      </Stack>
    </div>
  );
}
import { getTheme, ISelectableOption, Icon, ComboBox } from "office-ui-fabric-react";
import React, { useMemo, useCallback } from "react";

export interface IColorDropDownProps {
  selectedColor?: string;
  label: string;
  onChange: (event: any, color?: string) => void;
};

export const ColorDropDown = (props: IColorDropDownProps) => {
  const { label, selectedColor, onChange } = props;

  const options = useMemo( () =>
    [{ key: 'undefined', text: 'No color' }]
      .concat(
        Object.entries(getTheme().palette)
          .map( ([name, color]) => ({ key: `palette.${name}`, text: `palette.${name}`, data: { color } }) )
          .concat(Object.entries(getTheme().semanticColors)
            .map( ([name, color]) => ({ key: `semanticColors.${name}`, text: `semanticColors.${name}`, data: { color } }) )
          )
      )
  , []);

  const onRenderOption = useCallback( (option?: ISelectableOption) => (
    option
    ?
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
      }}>
        <Icon
          iconName="SquareShapeSolid"
          styles={{
            root: {
              marginRight: '8px',
              paddingTop: '4px',
              color: option.data ? option.data.color : undefined,
              textShadow: '1px 1px dimGray',
              visibility: option.data ? 'visible' : 'hidden'
            }
          }}
        />
        <span>
          {option.text}
        </span>
      </div>
    :
      null
  ), []);

  return (
    <ComboBox
      label={label}
      onRenderOption={onRenderOption}
      options={options}
      selectedKey={selectedColor}
      onChange={ (e, option) => option && onChange(e, option.data ? option.key as string : undefined ) }
    />
  );
};
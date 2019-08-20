import { getTheme, ISelectableOption, Icon, ComboBox } from "office-ui-fabric-react";
import React, { useMemo, useCallback } from "react";

export interface IColorDropDownProps {
  selectedColor?: string;
  label: string;
  onSelectColor: (color: string) => void;
};

export const ColorDropDown = (props: IColorDropDownProps) => {
  const { label, selectedColor, onSelectColor } = props;

  const options = useMemo( () =>
    Object.entries(getTheme().palette)
      .map( ([name, color]) => ({ key: `palette.${name}`, text: `palette.${name}`, data: { color } }) )
      .concat(Object.entries(getTheme().semanticColors)
        .map( ([name, color]) => ({ key: `semanticColors.${name}`, text: `semanticColors.${name}`, data: { color } }) )
  ), []);

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
              color: option.data.color,
              textShadow: '1px 1px dimGray'
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
      onChange={ (_e, option) => option && onSelectColor(option.key as string) }
    />
  );
};
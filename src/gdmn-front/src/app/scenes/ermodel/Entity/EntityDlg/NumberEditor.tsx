import { INumberAttribute, isINumericAttribute, INumericAttribute } from "gdmn-orm";
import { Stack, Dropdown } from "office-ui-fabric-react";
import React from "react";
import { getErrorMessage } from "./utils";
import { NumberField } from "./NumberField";
import { IAttributeEditorProps } from "./EntityAttribute";

export const NumberEditor = ({ attr, attrIdx, errorLinks, onChange, createAttr, userDefined, onError, onClearError }: IAttributeEditorProps<INumberAttribute<number> | INumericAttribute>) =>
  <Stack horizontal tokens={{ childrenGap: '0px 16px' }}>
    <NumberField
      label="Min value:"
      onlyInteger={attr.type === 'Integer'}
      value={attr.minValue}
      readOnly={!userDefined}
      errorMessage={getErrorMessage(attrIdx, 'minValue', errorLinks)}
      width="180px"
      onChange={ minValue => { onChange({ ...attr, minValue }); onClearError && onClearError('minValue'); } }
      onInvalidValue={ () => onError && onError('minValue', 'Invalid value') }
    />
    <NumberField
      label="Max value:"
      onlyInteger={attr.type === 'Integer'}
      value={attr.maxValue}
      readOnly={!userDefined}
      errorMessage={getErrorMessage(attrIdx, 'maxValue', errorLinks)}
      width="180px"
      onChange={ maxValue => { onChange({ ...attr, maxValue }); onClearError && onClearError('maxValue'); } }
      onInvalidValue={ () => onError && onError('maxValue', 'Invalid value') }
    />
    {
      isINumericAttribute(attr)
      ? <>
          <Dropdown
            label="Precision:"
            selectedKey={attr.precision}
            options={ new Array(18).fill(undefined).map( (_, idx) => ({ key: idx + 1, text: (idx + 1).toString() }) ) }
            errorMessage={getErrorMessage(attrIdx, 'precision', errorLinks)}
            styles={{
              root: {
                width: '180px'
              }
            }}
            onChange={
              createAttr ? (_, newValue) => newValue && onChange({ ...attr, precision: newValue.key as number }) : undefined
            }
          />
          <Dropdown
            label="Scale:"
            selectedKey={attr.scale}
            options={ new Array(18).fill(undefined).map( (_, idx) => ({ key: idx, text: idx.toString() }) ).filter( i => i.key <= attr.precision ) }
            errorMessage={getErrorMessage(attrIdx, 'scale', errorLinks)}
            styles={{
              root: {
                width: '180px'
              }
            }}
            onChange={
              createAttr ? (_, newValue) => newValue && onChange({ ...attr, scale: newValue.key as number }) : undefined
            }
          /> 
        </>
      : null
    }
    <Stack.Item grow={1}>
      <NumberField
        label="Default value:"
        onlyInteger={attr.type === 'Integer'}
        value={attr.defaultValue}
        readOnly={!userDefined}
        errorMessage={getErrorMessage(attrIdx, 'defaultValue', errorLinks)}
        onChange={ defaultValue => { onChange({ ...attr, defaultValue }); onClearError && onClearError('defaultValue'); } }
        onInvalidValue={ () => onError && onError('defaultValue', 'Invalid value') }
      />
    </Stack.Item>
  </Stack>

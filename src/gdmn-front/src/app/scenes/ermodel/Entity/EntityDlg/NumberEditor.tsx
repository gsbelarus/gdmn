import { INumberAttribute, INumericAttribute, isINumericAttribute } from "gdmn-orm";
import { Stack, Dropdown } from "office-ui-fabric-react";
import React from "react";
import { getErrorMessage, ErrorLinks } from "./utils";
import { NumberField } from "./NumberField";

interface INumberEditorProps {
  attr: INumberAttribute<number> | INumericAttribute,
  createAttribute: boolean,
  errorLinks?: ErrorLinks;
  onChange: (newAttr: INumberAttribute<number> | INumericAttribute) => void;
  onError?: (field: string, message: string) => void;
  onClearError?: (field: string) => void;
};

export const NumberEditor = ({ attr, errorLinks, onChange, onError, onClearError }: INumberEditorProps) =>
  <Stack horizontal tokens={{ childrenGap: '0px 16px' }}>
    <NumberField
      label="Min value:"
      value={attr.minValue}
      errorMessage={getErrorMessage('minValue', errorLinks)}
      width="180px"
      onlyInteger={attr.type === 'Integer'}
      onChange={ minValue => { onChange({ ...attr, minValue }); onClearError && onClearError('minValue'); } }
      onInvalidValue={ () => onError && onError('minValue', 'Invalid value') }
    />
    <NumberField
      label="Max value:"
      value={attr.maxValue}
      errorMessage={getErrorMessage('maxValue', errorLinks)}
      width="180px"
      onlyInteger={attr.type === 'Integer'}
      onChange={ maxValue => { onChange({ ...attr, maxValue }); onClearError && onClearError('maxValue'); } }
      onInvalidValue={ () => onError && onError('maxValue', 'Invalid value') }
    />
    {
      isINumericAttribute(attr)
      ? <>
          <Dropdown
            label="Scale:"
            selectedKey={attr.scale}
            errorMessage={getErrorMessage('scale', errorLinks)}
            options={ new Array(18).fill(undefined).map( (_, idx) => ({ key: idx + 1, text: (idx + 1).toString() }) ) }
            onChanged={ newValue => onChange({ ...attr, scale: newValue.key as number }) }
            styles={{
              root: {
                width: '180px'
              }
            }}
          />
          <Dropdown
            label="Precision:"
            selectedKey={attr.precision}
            errorMessage={getErrorMessage('precision', errorLinks)}
            options={ new Array(18).fill(undefined).map( (_, idx) => ({ key: idx, text: idx.toString() }) ).filter( i => i.key <= attr.scale ) }
            onChanged={ newValue => onChange({ ...attr, precision: newValue.key as number }) }
            styles={{
              root: {
                width: '180px'
              }
            }}
          />
        </>
      : null
    }
    <Stack.Item grow={1}>
      <NumberField
        label="Default value:"
        value={attr.defaultValue}
        errorMessage={getErrorMessage('defaultValue', errorLinks)}
        onlyInteger={attr.type === 'Integer'}
        onChange={ defaultValue => { onChange({ ...attr, defaultValue }); onClearError && onClearError('defaultValue'); } }
        onInvalidValue={ () => onError && onError('defaultValue', 'Invalid value') }
      />
    </Stack.Item>
  </Stack>

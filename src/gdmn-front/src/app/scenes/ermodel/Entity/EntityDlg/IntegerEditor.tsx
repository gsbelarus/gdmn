import { INumberAttribute } from "gdmn-orm";
import { Stack } from "office-ui-fabric-react";
import React from "react";
import { getErrorMessage, ErrorLinks } from "./utils";
import { NumberField } from "./NumberField";

interface IIntegerEditorProps {
  attr:  INumberAttribute<number>,
  createAttribute: boolean,
  errorLinks?: ErrorLinks;
  onChange: (newAttr: INumberAttribute<number>) => void;
  onError?: (fieldName: string, errorMessage: string) => void;
  onClearError?: (fieldName: string) => void;
};

export const IntegerEditor = ({ attr, errorLinks, onChange, onError, onClearError }: IIntegerEditorProps) =>
  <Stack horizontal tokens={{ childrenGap: '0px 16px' }}>
    <NumberField
      label="Min value:"
      value={attr.minValue}
      errorMessage={getErrorMessage('minValue', errorLinks)}
      onlyInteger
      onChange={ minValue => { onChange({ ...attr, minValue }); onClearError && onClearError('minValue'); } }
      onInvalidValue={ () => onError && onError('minValue', 'Invalid value') }
    />
    <NumberField
      label="Max value:"
      value={attr.maxValue}
      errorMessage={getErrorMessage('maxValue', errorLinks)}
      onlyInteger
      onChange={ maxValue => { onChange({ ...attr, maxValue }); onClearError && onClearError('maxValue'); } }
      onInvalidValue={ () => onError && onError('maxValue', 'Invalid value') }
    />
    <Stack.Item grow={1}>
      <NumberField
        label="Default value:"
        value={attr.defaultValue}
        errorMessage={getErrorMessage('defaultValue', errorLinks)}
        onlyInteger
        onChange={ defaultValue => { onChange({ ...attr, defaultValue }); onClearError && onClearError('defaultValue'); } }
        onInvalidValue={ () => onError && onError('defaultValue', 'Invalid value') }
      />
    </Stack.Item>
</Stack>

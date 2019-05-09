import React, { useEffect, useState } from "react";
import { TextField } from "office-ui-fabric-react";

interface IWrappedTextFieldProps {
  label?: string;
  value: string;
  onChanged: () => void;
  onApplyChanges: (value: string) => void;
};

export const WrappedTextField = (props: IWrappedTextFieldProps) => {
  const { label, value, onChanged, onApplyChanges } = props;
  const [ currValue, setCurrValue ] = useState<string | null>(null);
  const [ notified, setNotified ] = useState(false);
  useEffect(() => {
    if (!notified && currValue !== null) {
      setNotified(true);
      onChanged();
    }
  }, [ currValue, notified ]);
  return (<TextField label={label} defaultValue={value} onChange={(_, value) => {
    if (value)
      setCurrValue(value);
  }} onBlur={() => {
    if (currValue !== null) {
      onApplyChanges(currValue);
    }
    setCurrValue(null);
  }} />);
};

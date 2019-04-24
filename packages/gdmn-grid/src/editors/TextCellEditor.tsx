import React, { CSSProperties, useRef, useLayoutEffect } from 'react';

export interface ITextCellEditorProps {
  value: string;
  style: CSSProperties;
  className?: string;
  onSave: (newValue: string) => void;
  onCancel: () => void;
};

export function TextCellEditor(props: ITextCellEditorProps): JSX.Element {

  const { value, style, className, onCancel, onSave } = props;
  const inputEl: React.RefObject<HTMLInputElement> = useRef(null);

  useLayoutEffect( () => {
    if (inputEl.current) {
      inputEl.current.focus();
    }
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'Enter': {
        e.stopPropagation();
        e.preventDefault();
        if (inputEl.current) {
          onSave(inputEl.current.value);
        } else {
          onCancel();
        }
        break;
      }

      case 'Esc':
      case 'Escape': {
        e.stopPropagation();
        e.preventDefault();
        onCancel();
        break;
      }
    }
  }

  return (
    <div
      className={className}
      style={style}
      onKeyDown={onKeyDown}
    >
      <input
        type="text"
        defaultValue={value}
        ref={inputEl}
        onBlur={ e => onSave(e.target.value) }
      />
    </div>
  )
};
import { ICodeViewProps } from "./CodeView.types";
import React, { useEffect, useRef, useReducer } from "react";
import { useTab } from "@src/app/hooks/useTab";
import Blockly from 'blockly';
import Editor from '@monaco-editor/react';
import { ICommandBarItemProps, CommandBar, ComboBox, Stack, IComboBoxOption } from "office-ui-fabric-react";
import { scriptActions } from "@src/app/script/actions";

const toolbox =
  `<xml xmlns="https://developers.google.com/blockly/xml" id="toolbox" style="display: none">
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
    <block type="controls_repeat_ext"></block>
    <block type="math_number">
      <field name="NUM">123</field>
    </block>
    <block type="math_arithmetic"></block>
    <block type="text"></block>
    <block type="text_print"></block>
  </xml>`;

interface ICodeState {
  selectedId?: string;
  loadedId?: string;
  scriptIds?: IComboBoxOption[];
};

type Action = { type: 'SET_SELECTED_ID', selectedId: string }
  | { type: 'SET_LOADED_ID', loadedId: string }
  | { type: 'SET_SCRIPT_IDS', scriptIds: IComboBoxOption[] };

function reducer(state: ICodeState, action: Action): ICodeState {
  switch (action.type) {
    case 'SET_SELECTED_ID':
      return { ...state, selectedId: action.selectedId };

    case 'SET_LOADED_ID':
      return { ...state, loadedId: action.loadedId };

    case 'SET_SCRIPT_IDS':
      return { ...state, scriptIds: action.scriptIds };
  }
};

export const CodeView = (props: ICodeViewProps): JSX.Element => {

  const { viewTab, url, dispatch, scriptState: { scripts, listLoaded } } = props;
  const [{ selectedId, loadedId, scriptIds }, codeDispatch] = useReducer(reducer, {
    scriptIds: listLoaded ? Object.keys(scripts).map( key => ({ key, text: key }) ) : undefined
  });
  const editor = useRef<any>();
  const getEditorValue = useRef<any>();

  useTab(viewTab, url, 'Code', true, dispatch);

  useEffect( () => {
    Blockly.inject('BlocklyDiv', { toolbox });

    if (!listLoaded) {
      dispatch(scriptActions.list());
    }
  }, []);

  useEffect( () => {
    if (listLoaded && !scriptIds) {
      codeDispatch({ type: 'SET_SCRIPT_IDS', scriptIds: Object.keys(scripts).map( key => ({ key, text: key }) ) });
    }
  }, [listLoaded, scripts, scriptIds]);

  useEffect( () => {
    if (selectedId && (selectedId !== loadedId)) {
      const script = scripts[selectedId];

      if (!script || script.source === undefined) {
        dispatch(scriptActions.load(selectedId));
      } else {
        if (script.source !== undefined) {
          editor.current.setValue(script.source);
        }
        codeDispatch({ type: 'SET_LOADED_ID', loadedId: selectedId });
      }
    }
  }, [selectedId, loadedId, scripts]);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'saveAndClose',
      text: 'Сохранить',
      iconProps: {
        iconName: 'Save'
      },
      onClick: () => {
        if (selectedId !== undefined) {
          dispatch(scriptActions.save({ id: selectedId, source: getEditorValue.current() }));
        }
      }
    }
  ];

  return (
    <div
      style={{
        display: 'grid',
        width: '100%',
        height: '100%',
        gridTemplateColumns: '1fr 600px',
        gridTemplateRows: 'auto 1fr'
      }}
    >
      <div
        style={{
          gridColumn: '1 / 2',
          gridRow: '1 / 1'
        }}
      >
        <Stack horizontal>
          <CommandBar items={commandBarItems} />
          <ComboBox
            options={scriptIds}
            selectedKey={selectedId}
            onChange={ (_, option) => option && codeDispatch({ type: 'SET_SELECTED_ID', selectedId: option.key as string }) }
          />
        </Stack>
      </div>
      <div
        style={{
          gridColumn: '1 / 1',
          gridRow: '2 / 2'
        }}
      >
        <div id="BlocklyDiv" style={{ width: '100%', height: '100%' }}></div>
      </div>
      <div
        style={{
          gridColumn: '2 / 2',
          gridRow: '2 / 2'
        }}
      >
        <Editor
          height="100%"
          language="javascript"
          value={"// write your code here"}
          editorDidMount={ (_getEditorValue, _editor) => { getEditorValue.current = _getEditorValue; editor.current = _editor; } }
        />
      </div>
    </div>
  );
};

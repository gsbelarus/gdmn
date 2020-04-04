import { ICodeViewProps } from "./CodeView.types";
import React, { useEffect, useState } from "react";
import { useTab } from "@src/app/hooks/useTab";
import Blockly from 'blockly';
import Editor from '@monaco-editor/react';
import { ICommandBarItemProps, CommandBar, ComboBox, Stack, IComboBoxOption } from "office-ui-fabric-react";
import { apiService } from "@src/app/services/apiService";

export const CodeView = (props: ICodeViewProps): JSX.Element => {

  const { viewTab, url, dispatch } = props;

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

  useTab(viewTab, url, 'Code', true, dispatch);
  const [scriptIds, setScriptIds] = useState<IComboBoxOption[] | undefined>(undefined);

  useEffect( () => {
    Blockly.inject('BlocklyDiv', { toolbox });

    apiService.listSetting({ query: { type: 'SCRIPT' } })
    .then( response => {
      if (response.error) {
        console.log(response.error);
      } else {
        setScriptIds(response.payload.result?.ids.map( key => ({ key, text: key }) ));
      }
    });
  }, []);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'saveAndClose',
      text: 'Сохранить',
      iconProps: {
        iconName: 'Save'
      },
      onClick: () => { }
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
        />
      </div>
    </div>
  );
};

import { ICodeViewProps } from "./CodeView.types";
import React, { useEffect } from "react";
import { useTab } from "@src/app/hooks/useTab";
import Blockly from 'blockly';

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

  useEffect( () => {
    Blockly.inject('BlocklyDiv', { toolbox });
  }, []);

  return (
    <div
      style={{
        display: 'grid',
        width: '100%',
        height: '100%',
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'auto 1fr'
      }}
    >
      <div
        style={{
          gridColumn: '1 / 1',
          gridRow: '1 / 1'
        }}
      >
        ABC
      </div>
      <div
        style={{
          gridColumn: '1 / 1',
          gridRow: '2 / 2'
        }}
      >
        <div id="BlocklyDiv" style={{ width: '100%', height: '100%' }}></div>
      </div>
    </div>
  );
};

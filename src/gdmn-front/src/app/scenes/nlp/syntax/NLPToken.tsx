import { INLPToken } from "gdmn-nlp";
import React from "react";
import { getTheme, Stack } from "office-ui-fabric-react";

const colors: { [name: string]: string } = {
  'WhiteSpace': 'powderblue',
  'LineBreak': 'lightsalmon',
  'Comma': 'lightgreen',
  'PunctuationMark': 'yellowgreen',
  'CyrillicWord': 'white',
  'Number': 'wheat',
  'DateToken': 'sandybrown',
  'IDToken': 'violet'
};

export const NLPToken = ({ token }: { token: INLPToken }) => {

  const tokenImage = token.image.trim() ? token.image : '\xa0';
  const uniformPOS = token.uniformPOS ? <span style={{ paddingLeft: '2px' }}>{token.uniformPOS.map( u => <sup>{u.image}</sup> )}</span> : null;
  const numerals = token.numerals ? <span style={{ paddingLeft: '2px' }}>{token.numerals.map( u => <sup>{u.image}</sup> )}</span> : null;

  return (
    <Stack tokens={{ childrenGap: '4px' }}>
      <div
        style={{
          backgroundColor: colors[token.tokenType.name],
          border: '1px solid ' + getTheme().palette.black,
          borderRadius: '2px',
          padding: '0 4px 2px 4px',
          color: 'black',
          minWidth: '16px',
          minHeight: '26px'
        }}
      >
        {tokenImage}
        {uniformPOS}
        {numerals}
      </div>
      {
        token.words &&
        token.words.map( w =>
          <div
            style={{
              border: '1px dotted ' + getTheme().palette.black,
              borderRadius: '2px',
              padding: '0 4px 2px 4px',
              color: 'black'
            }}
          >
            {w.getSignature()}
          </div>
        )
      }
    </Stack>
  );
};
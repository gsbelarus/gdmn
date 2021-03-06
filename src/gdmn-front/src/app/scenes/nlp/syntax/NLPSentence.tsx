import { IRusSentence } from "gdmn-nlp";
import { Stack, getTheme } from "office-ui-fabric-react";
import React from "react";

interface INLPSentenceProps {
  sentence: IRusSentence;
};

export const NLPSentence = (props: INLPSentenceProps) => {
  const { sentence } = props;

  return (
    <Stack horizontal tokens={{ childrenGap: '4px' }}>
      {
        sentence.phrases.map(
          (phrase, idx) =>
            <div
              key={idx}
              style={{
                border: '1px solid ' + getTheme().palette.themeDark,
                borderRadius: '2px',
                padding: '0 4px 4px 4px',
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: '4px'
                }}
              >
                {phrase.phraseId}
              </div>
              <Stack horizontal tokens={{ childrenGap: '4px' }}>
                {
                  phrase.wordOrToken.map(
                    (w, idx) =>
                      w && <div
                        key={idx}
                        style={{
                          border: '1px dotted ' + getTheme().palette.themeDark,
                          borderRadius: '2px',
                          padding: '0 2px 0 2px'
                        }}
                      >
                        {w.type === 'EMPTY' ? null : w.type === 'WORD' ? w.word.getText() : w.token.image}
                      </div>
                  )
                }
              </Stack>
            </div>
        )
      }
    </Stack>
  )
};
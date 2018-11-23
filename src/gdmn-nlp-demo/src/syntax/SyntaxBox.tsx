import React, { Component } from "react";
import { TextField, DefaultButton } from "office-ui-fabric-react";
import "./SyntaxBox.css";
import { IToken } from "chevrotain";
import { ParsedText, Phrase, AnyWord, tokenize, CyrillicWord, morphAnalyzer } from "gdmn-nlp";
import { Edge as DagreEdge, graphlib, layout } from 'dagre';
import { Rect } from "./Rect";
import { Edge } from "./Edge";
import { predefinedPhrases } from "./phrases";
import { ICommand } from 'gdmn-nlp-agent';
import { isMorphToken, IMorphToken } from "gdmn-nlp";

export interface ISyntaxBoxProps {
  text: string,
  coombinations: IToken[][],
  errorMsg?: string,
  parsedText?: ParsedText,
  parserDebug?: ParsedText[],
  commandError?: string,
  command?: ICommand,
  onSetText: (text: string) => void
};

export interface ISyntaxBoxState {
  editedText: string,
  showPhrases: boolean,
  tokens: IToken[],
  verboseErrors?: any
}

export class SyntaxBox extends Component<ISyntaxBoxProps, ISyntaxBoxState> {
  state: ISyntaxBoxState = {
    editedText: this.props.text,
    showPhrases: false,
    tokens: tokenize(this.props.text)
  }

  private _getColor(t: IToken): string {
    return t.tokenType.name.substr(0, 4) + 'Color';
  }

  private _getCoombinations(): JSX.Element {
    const stacks: IToken[][] = [];
    const { coombinations, parsedText } = this.props;

    const getClassName = (i: number, signature: string): string => {
      return parsedText && parsedText.wordsSignatures[i] && signature === parsedText.wordsSignatures[i] ? 'ACTIVEColor' : '';
    }

    for (let i = 0; i < coombinations.length; i++) {
      for (let j = 0; j < coombinations[0].length; j++) {
        if (!stacks[j]) {
          stacks[j] = [];
        }
        if (!stacks[j].find( k => k === coombinations[i][j])) {
          stacks[j].push(coombinations[i][j]);
        }
      }
    }

    return (
      <>
        {
          coombinations.length ?
            <div>
              Total combinatorial count: {coombinations.length}
            </div>
          : undefined
        }
        <div className="SyntaxCoombinations">
          {
            stacks.map( (s, idx) => (
              <div key={idx}>
                <div className={this._getColor(s[0])}>
                  {s[0].image}
                  {
                    isMorphToken(s[0]) && (s[0] as IMorphToken).hsm ?
                      <sup>
                        {(s[0] as IMorphToken).hsm.map( h => h[0] && <span>{h[0].word}</span> )}
                      </sup>
                    : undefined
                  }
                </div>
                {
                  s.map( (w, wi) => (
                    <div key={wi} className={getClassName(idx, w.tokenType.name)}>
                      {w.tokenType.name}
                    </div>
                  ))
                }
              </div>
            ))
          }
        </div>
      </>
    );
  }

  private _renderPhrase() {
    const { parsedText } = this.props;

    if (!parsedText || !parsedText.phrase) {
      return undefined;
    }

    const phrase = parsedText.phrase;

    // Create a new directed graph
    const g = new graphlib.Graph();

    if (phrase instanceof Phrase) {
      // Set an object for the graph label
      g.setGraph({});

      // Default to assigning a new object as a label for each new edge.
      g.setDefaultEdgeLabel(() => {
        return {};
      });

      const recurs = (
        phr: AnyWord | Phrase<AnyWord>
      ) => {
        if (phr instanceof Phrase) {
          const label = phr.getName().label;
          g.setNode(phr.id.toString(), {
            label,
            width: label.length * 9 + 8,
            height: 26,
            className: 'phrase'
          });
          phr.items.forEach(p => {
            g.setEdge(phr.id.toString(), p.id.toString());
            recurs(p);
          });
        } else {
          const label = phr.getText();
          g.setNode(phr.id.toString(), {
            label,
            width: label.length * 9 + 8,
            height: 26,
            className: 'word',
            rank: 'min'
          });
        }
      };

      recurs(phrase);

      g.graph().ranksep = 36;
      g.graph().marginx = 2;
      g.graph().marginy = 2;
      layout(g);
    }

    const makeRect = (n: string, idx: number) => {
      const nd = g.node(n);
      if (!nd) return null;

      const x = nd.x - nd.width / 2;
      const y = nd.y - nd.height / 2;
      return (
        <Rect key={idx} x={x} y={y} width={nd.width} height={nd.height} text={nd.label} className={nd.className} />
      );
    };

    const makeEdge = (e: DagreEdge, idx: number) => <Edge key={idx} points={g.edge(e).points} />;

    return (
      <div className="CommandAndGraph">
        <div>
          Parsed with {parsedText.parser.getName().label}:
        </div>
        <div>
          {g.graph() ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={g.graph().width}
              height={g.graph().height}
              viewBox={'0 0 ' + g.graph().width + ' ' + g.graph().height}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerUnits="strokeWidth"
                  markerWidth="8"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 Z" style={{ strokeWidth: '1' }} />
                </marker>
              </defs>
              <g>
                {g.nodes().map((n, idx) => makeRect(n, idx))}
                {g.edges().map((e, idx) => makeEdge(e, idx))}
              </g>
            </svg>
          ) : null}
        </div>
      </div>
    );
  }

  private _renderCommand(command: ICommand) {
    return (
      <div className="command">
        <div className={`action${command.action}`} />
        {command.objects &&
          command.objects.map((co, idx) => (
            <div className="commandObject" key={idx}>
              <div className="entityName">{co.entity.name}</div>
              {co.conditions &&
                co.conditions.map((cond, idx2) => (
                  <div className="condition" key={idx2}>
                    <div className="attr">{cond.attr.name}</div>
                    <div className={`op${cond.op}`} />
                    <div className="value">{cond.value}</div>
                  </div>
                ))}
            </div>
          ))}
      </div>
    );
  }

  render() {
    const { editedText, showPhrases, verboseErrors, tokens } = this.state;
    const { onSetText, errorMsg, parserDebug, commandError, command } = this.props;

    return (<div className="ContentBox">
      <div className="SyntaxBoxInput">
        <TextField
          label="Text"
          value={editedText}
          onChange={
            (e: React.ChangeEvent<HTMLInputElement>) => {
              try {
                const tokens = tokenize(e.target.value);
                this.setState({
                  editedText: e.target.value,
                  tokens
                });
              }
              catch(err) {
                this.setState({
                  editedText: err.message,
                  tokens: []
                });
              }
            }
          }
        />
        <DefaultButton
          text="..."
          style={{ maxWidth: '48px' }}
          onClick={ () => this.setState({ showPhrases: true }) }
        />
        <DefaultButton
          text="Analyze"
          onClick={ () => onSetText(editedText) }
        />
      </div>
      <div className="SyntaxTokens">
        {
          tokens.map( (t, idx) =>
            <div key={idx}>
              <div className={`Token${t.tokenType.name}`}>
                {t.image.split('').map( (ch, idx) => ch === ' ' ? <span key={idx}>&nbsp;</span> : ch)}
              </div>
              {
                t.tokenType === CyrillicWord ? morphAnalyzer(t.image).map( w =>
                  <div key={w.getSignature()}>
                    {w.getSignature()}
                  </div>)
                :
                undefined
              }
            </div>
          )
        }
      </div>
      {errorMsg && <div className="SyntaxError">{errorMsg}</div>}
      {showPhrases ?
        <div>
          {predefinedPhrases.map( (p, idx) => <DefaultButton key={idx} text={p} onClick={
            () => this.setState({
              editedText: p,
              tokens: tokenize(p),
              showPhrases: false
            })
          }/> )}
        </div>
      : undefined}
      {this._getCoombinations()}
      {this._renderPhrase()}
      {commandError && <div className="SyntaxError">{commandError}</div>}
      {command && <div>Command:{this._renderCommand(command)}</div>}
      {parserDebug ?
         <div className="ParserDebug">
           {parserDebug.map( (pd, idx) =>
              <div key={idx}>
                <div>
                  Parser: {pd.parser.getName().label}
                </div>
                <div className="DebugWordSignatures">
                  {pd.wordsSignatures.map( (ws, wi) => <div key={wi}>{ws}</div> )}
                </div>
                {
                  pd.errors[0] ?
                  <div>
                    <div>
                      {pd.errors[0].message}
                    </div>
                    {
                      verboseErrors === pd.errors ?
                      <div>
                        <pre className="ParserError">
                          {JSON.stringify(pd.errors, (key, value) => (key === 'token' || key === 'previousToken') ? `${value['image']} - ${value['tokenType']['tokenName']}` : value, 2)}
                        </pre>
                        <DefaultButton
                          text="Hide"
                          onClick={ () => this.setState({ verboseErrors: undefined }) }
                        />
                      </div>
                      :
                      <DefaultButton
                        text="Verbose..."
                        onClick={ () => this.setState({ verboseErrors: pd.errors }) }
                      />
                    }
                  </div>
                  :
                  undefined
                }
              </div>
           )}
         </div>
      :undefined}
    </div>);
  }
};

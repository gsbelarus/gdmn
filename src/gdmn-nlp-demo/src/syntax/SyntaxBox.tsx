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
import { Select } from "../query/Select";
import { EntityQuery, IEntityQueryWhere, IEntityQueryWhereValue, IEntityQueryAlias, ScalarAttribute, IEntityQueryOrder } from "gdmn-orm";

export interface ISyntaxBoxProps {
  text: string,
  coombinations: IToken[][],
  errorMsg?: string,
  parsedText?: ParsedText,
  parserDebug?: ParsedText[],
  commandError?: string,
  command?: ICommand[],
  isVisibleQuery: boolean,
  host: string,
  port: string,
  isReadFile: boolean,
  onSetText: (text: string) => void,
  onLoadRecordSet: (query: EntityQuery, host: string, port: string) => void
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
                        {(s[0] as IMorphToken).hsm.map( (h, idx) => h[0] && <span key={idx}>{h[0].word}</span> )}
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

  private collUpsFields(id: string, idButton: string) {
    var div = document.getElementById(id);
    div.style.display = div.style.display !== "none"
      && div.style.display !== "block" ? "block" : div.style.display === "none" ? "block" : "none";
    var button = document.getElementById(idButton);
    button.innerHTML = div.style.display === "none" ? "..." : "^";
}

  private displaySKIP(skip: number) {
    return <div className="skip">
      <div>SKIP</div>
      <div className="skipNumber">{skip}</div>
    </div>
  }

  private displayFIRST(first: number) {
    return <div className="first">
      <div>FIRST</div>
      <div className="firstNumber">{first}</div>
    </div>
  }

  private displayORDER(orders: IEntityQueryOrder[]) {
    return orders.map( (order, idx) =>
      <div className="order" key={idx}>
        <div className="alias">{order.alias}</div>
        <div className="attr">{order.attribute.name}</div>
        <div className="typeOrder">{order.type}</div>
      </div>
    )
  }

  private displayWHERE(wheres: IEntityQueryWhere[]) {
    return wheres.map( (where, idx1) =>
      <div className="where" key={idx1}>
        {this.displayOR(where.or, idx1)}
        {this.displayAND(where.and, idx1)}
        {this.displayNOT(where.not, idx1)}
        {this.displayISNULL(where.isNull, null)}
        {this.displayEQUALS(where.equals, null)}
      </div>
    )
  }

  private displayAND(ands: IEntityQueryWhere[], idx: number | null) {
    return ands && <div className="allAnds" key={idx}>
            { ands.map( (and, idx1) =>
              <div  key={`and${idx1}`}>
                { idx1 !== 0 ? <div>AND</div> : undefined }
                { and.or ? this.displayOR(and.or, null) : undefined }
                { and.and ? this.displayAND(and.and, null) : undefined }
                { and.not ? this.displayNOT(and.not, null) : undefined }
                { and.isNull ? this.displayISNULL(and.isNull, null) : undefined }
                <div className="and" key={idx1}>
                  {this.displayEQUALS(and.equals, null)}
              </div>
            </div>
          ) }</div>
  }

  private displayOR(ors: IEntityQueryWhere[], idx: number | null) {
    return ors && <div className="allOrs" key={idx}>
            { ors.map( (or, idx1) =>
              <div  key={`or${idx1}`}>
                { idx1 !== 0 ? <div>OR</div> : undefined }
                { or.and ? this.displayAND(or.and, null) : undefined }
                { or.or ? this.displayOR(or.or, null) : undefined }
                { or.not ? this.displayNOT(or.not, null) : undefined }
                { or.isNull ? this.displayISNULL(or.isNull, null) : undefined }
                <div className="or" key={idx1}>
                {this.displayEQUALS(or.equals, null)}
              </div>
            </div>
          ) }</div>
  }

  private displayEQUALS(equals: IEntityQueryWhereValue[], idx: number | null) {
    return equals && <div className="equals">
            {equals.map((equal, idx1) =>
              <div className="equal" key={idx1}>
                <div className="alias">{equal.alias}</div>
                <div className="attr">{equal.attribute.name}</div>
                <div className="opEQ" />
                <div className="value"> {equal.value} </div>
              </div>
            )}
          </div>
  }

  private displayISNULL(isNulls: IEntityQueryAlias<ScalarAttribute>[], idx: number | null) {
    return isNulls && <div className="allisNulls" key={idx}>
            { isNulls.map( (isNull, idx1) =>
              <div  key={`isNull${idx1}`}>
                { <div>IsNULL</div> }
                <div className="isNull" key={idx1}>
                  <div className="alias">{isNull.alias}</div>
                  <div className="attr">{isNull.attribute.name}</div>
                </div>
              </div>
             ) }</div>

  }

  private displayNOT(nots: IEntityQueryWhere[], idx: number | null) {
    return nots && <div className="allNots" key={idx}>
            { nots.map( (not, idx1) =>
              <div  key={`not${idx1}`}>
                { <div>NOT</div> }
                { not.and ? this.displayAND(not.and, null) : undefined }
                { not.or ? this.displayOR(not.or, null) : undefined }
                { not.not ? this.displayNOT(not.not, null) : undefined }
                { not.isNull ? this.displayISNULL(not.isNull, null) : undefined }
                <div className="not" key={idx1}>
                {this.displayEQUALS(not.equals, null)}
              </div>
            </div>
          ) }</div>
  }

  private _renderCommand(command: ICommand) {
    return (
      <div className="command">
        <div className="commandAction">
         <div className={`action${command.action}`} />
         <div>
            {
              command.payload.options.skip &&
              this.displaySKIP(command.payload.options.skip)
            }
            {
              command.payload.options.first &&
              this.displayFIRST(command.payload.options.first)
            }
          </div>
        </div>
        <div className="payload" >
        <div className="alias">{command.payload.link.alias}</div>
        <div className="entityName"> {command.payload.link.entity.name} </div>
        <div className="fields">
          <div id="scrollUp0" className="scrollUp">
            <div className="s">
              { command.payload.link.fields.map( (field, idx) =>
                <div key={idx}>
                  <div className="field">{field.attribute.name}
                  {field.links && field.links.length && // TODO
                    <div className="payload">
                      <div className="alias">{field.links[0].alias}</div>
                      <div className="entityName">{field.links[0].entity.name}</div>
                      { field.links[0].fields && <div className="fields">
                        <div id={`scrollUp${field.links[0].alias}/${idx}`} className="scrollUp">
                          <div className="s">
                            {field.links[0].fields.map( (f, idxf) => <div className="field" key={idxf}>{f.attribute.name}</div> )}
                          </div>
                        </div>
                        <button id={`buttonForScroll${field.links[0].alias}/${idx}`} className="buttonForScroll"
                          onClick={ () =>
                            this.collUpsFields(
                              `scrollUp${field.links[0].alias}/${idx}`,
                              `buttonForScroll${field.links[0].alias}/${idx}`
                            ) }>...</button>
                      </div> }
                    </div>
                  } </div>
                </div>
              ) }
              </div>
            </div>
            <button id="buttonForScroll0" className="buttonForScroll"
              onClick={ () => this.collUpsFields("scrollUp0", "buttonForScroll0") }>...</button>
          </div>
        </div>
        {
          command.payload.options &&
          <div className="options">
            {
              command.payload.options.where && command.payload.options.where.length &&
              <div className="boxWhere">
                <div className="titleBoxWhere">WHERE</div>
                <div className="wheres">{this.displayWHERE(command.payload.options.where)}</div>
              </div>
            }
            {
              command.payload.options.order &&
              <div className="orders">
                <div>ORDER BY</div>
                {this.displayORDER(command.payload.options.order)}
              </div>
            }
          </div>
        }
      </div>
    );
  }

  private createStringSelect(query: EntityQuery) {
    const selectQuery = new Select(query);
    return (
      <div className="SelectQuery">
        <pre className="sql">{selectQuery.sql}</pre>
        <div className="params">{JSON.stringify(selectQuery.params)}</div>
      </div>
    );
  }

  render() {
    const { editedText, showPhrases, verboseErrors, tokens } = this.state;
    const { text, onSetText, errorMsg, parserDebug, commandError, command, isVisibleQuery, host, port, isReadFile, onLoadRecordSet } = this.props;

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
                  showPhrases: false,
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
          onClick={ () => { this.setState({ showPhrases: false }); onSetText(editedText); }}
        />
        <DefaultButton
          text="Query"
          disabled={ isVisibleQuery && command && host !== '' && port != '' ? false : true }
          onClick={ () => {
            const query = command[0].payload;
            onLoadRecordSet(query, host, port);
          } }
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
      <div className={ text === editedText || parserDebug ? '' : 'SemiTransparent' }>
        {this._getCoombinations()}
        {this._renderPhrase()}
        {commandError && <div className="SyntaxError">{commandError}</div>}
        {command && <div>Command:{this._renderCommand(command[0])}</div>}
        {command  && <div>Select query:{this.createStringSelect(command[0].payload)}</div>}
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
      </div>
    </div>);
  }
};

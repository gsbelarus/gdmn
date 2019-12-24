import React, { Component } from "react";
import { TextField, DefaultButton, ComboBox } from "office-ui-fabric-react";
import "./SyntaxBox.css";
import { IToken } from "chevrotain";
import { ParsedText, tokenize, CyrillicWord, morphAnalyzer, PunctuationMark } from "gdmn-nlp";
import { predefinedPhrases } from "./phrases";
import { ICommand } from 'gdmn-nlp-agent';
import { isMorphToken, IMorphToken } from "gdmn-nlp";
import { Select } from "../query/Select";
import { EntityQuery, IEntityQueryWhere, IEntityQueryWhereValue, IEntityQueryAlias, ScalarAttribute, IEntityQueryOrder } from "gdmn-orm";
import { IERModels } from "../ermodel/reducer";
import { PhraseSyntaxTree } from "../components/PhraseSyntaxTree";

export interface ISyntaxBoxProps {
  text: string,
  coombinations: IToken[][],
  errorMsg?: string,
  parsedText?: ParsedText[],
  parserDebug?: ParsedText[][],
  erModels: IERModels,
  host: string,
  port: string,
  loading: boolean,
  onAnalyze: (erModelName: string, text: string) => void,
  onQuery: (erModelName: string) => void,
  onClear: (erModelName: string) => void
}

export interface ISyntaxBoxState {
  editedText: string;
  showPhrases: boolean;
  tokens: IToken[];
  verboseErrors?: any;
  selectedERModel?: string;
}

export class SyntaxBox extends Component<ISyntaxBoxProps, ISyntaxBoxState> {
  state: ISyntaxBoxState = {
    editedText: this.props.text,
    showPhrases: false,
    tokens: tokenize(this.props.text),
    selectedERModel: 'db'
  }

  private _getColor(t: IToken): string {
    if (t.tokenType) {
      return t.tokenType.name.substr(0, 4) + 'Color';
    }
    return '';
  }

  private _getCoombinations(): JSX.Element {
    const stacks: IToken[][] = [];
    const { coombinations, parsedText } = this.props;

    const getClassName = (i: number, signature: string): string => {
      if(parsedText) {
        const pt = parsedText.map(item => item.wordsSignatures).reduce((prev, curr) => [...prev, ...curr]);
        return parsedText && pt[i] && signature === pt[i] ? 'ACTIVEColor' : '';
      }
      return '';
    }

    for (let i = 0; i < coombinations.length; i++) {
      for (let j = 0; j < coombinations[0].length; j++) {
        if (!stacks[j]) {
          stacks[j] = [];
        }
        if (!stacks[j].find(k => k === coombinations[i][j])) {
          stacks[j].push(coombinations[i][j]);
        }
      }
    }

    let countPunktuationMark = 0;

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
            stacks.map((s, idx) => (
              <div key={idx}>
                <div className={this._getColor(s[0])}>
                  {s[0].image}
                  {
                    isMorphToken(s[0]) && (s[0] as IMorphToken).hsm ?
                      <sup>
                        {(s[0] as IMorphToken).hsm!.map((h, idx) => h[0] && <span key={idx}>{h[0].word}</span>)}
                      </sup>
                      : undefined
                  }
                </div>
                {
                  s.map((w, wi) => {
                    if(w.tokenType === PunctuationMark) countPunktuationMark++;
                    if(w.tokenType) {
                      return <div key={wi} className={getClassName(idx - countPunktuationMark, w.tokenType.name)}>
                        {w.tokenType.name}
                      </div>
                    } else {
                      return undefined;
                    }
                  })
                }
              </div>
            ))
          }
        </div>
      </>
    );
  }

  private collUpsFields(id: string, idButton: string) {
    let div = document.getElementById(id);
    if (div) {
      div.style.display = div.style.display !== "none"
        && div.style.display !== "block" ? "block" : div.style.display === "none" ? "block" : "none";
      let button = document.getElementById(idButton);
      if (button) {
        button.innerHTML = div.style.display === "none" ? "..." : "^";
      }
    }
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
    return orders.map((order, idx) =>
      <div className="order" key={idx}>
        <div className="alias">{order.alias}</div>
        <div className="attr">{order.attribute.name}</div>
        <div className="typeOrder">{order.type}</div>
      </div>
    )
  }

  private displayWHERE(wheres: IEntityQueryWhere[]) {
    return wheres.map((where, idx1) =>
      where && <div className="where" key={idx1}>
        {where.or && this.displayOR(where.or)}
        {where.and && this.displayAND(where.and)}
        {where.not && this.displayNOT(where.not)}
        {where.isNull && this.displayISNULL(where.isNull)}
        {where.equals && this.displayEQUALS(where.equals)}
        {where.contains && this.displayCONTAINS(where.contains)}
        {where.greater && this.displayGREATER(where.greater)}
        {where.less && this.displayLESS(where.less)}
      </div>
    )
  }

  private displayAND(ands: IEntityQueryWhere[]) {
    return ands && <div className="allAnds">
      {ands.map((and, idx1) =>
        <div key={`and${idx1}`}>
          {idx1 !== 0 ? <div>AND</div> : undefined}
          {and.or ? this.displayOR(and.or) : undefined}
          {and.and ? this.displayAND(and.and) : undefined}
          {and.not ? this.displayNOT(and.not) : undefined}
          {and.isNull ? this.displayISNULL(and.isNull) : undefined}
          <div className="and" key={idx1}>
            {and.equals && this.displayEQUALS(and.equals)}
          </div>
        </div>
      )}</div>
  }

  private displayOR(ors: IEntityQueryWhere[]) {
    return ors && <div className="allOrs">
      {ors.map((or, idx1) =>
        <div key={`or${idx1}`}>
          {idx1 !== 0 ? <div>OR</div> : undefined}
          {or.and ? this.displayAND(or.and) : undefined}
          {or.or ? this.displayOR(or.or) : undefined}
          {or.not ? this.displayNOT(or.not) : undefined}
          {or.isNull ? this.displayISNULL(or.isNull) : undefined}
          <div className="or" key={idx1}>
            {or.equals && this.displayEQUALS(or.equals)}
          </div>
        </div>
      )}</div>
  }

  private displayEQUALS(equals: IEntityQueryWhereValue[]) {
    return equals && (equals.length !== 1 ? <div className="equals">
      {equals.map((equal, idx1) =>
        <div className="equal" key={idx1}>
          <div className="alias">{equal.alias}</div>
          <div className="attr">{equal.attribute.name}</div>
          <div className="opEQ" />
          <div className="value"> {equal.value} </div>
        </div>
      )}
    </div>
      : <div className="equal">
        <div className="alias">{equals[0].alias}</div>
        <div className="attr">{equals[0].attribute.name}</div>
        <div className="opEQ" />
        <div className="value"> {equals[0].value} </div>
      </div>)
  }

  private displayISNULL(isNulls: IEntityQueryAlias<ScalarAttribute>[]) {
    return isNulls && (isNulls.length !== 1 ? <div className="allisNulls">
      {isNulls.map((isNull, idx1) =>
        <div key={`isNull${idx1}`}>
          {<div>IsNULL</div>}
          <div className="isNull" key={idx1}>
            <div className="alias">{isNull.alias}</div>
            <div className="attr">{isNull.attribute.name}</div>
          </div>
        </div>
      )}</div>
      : <div key={`isNull`} className="allisNulls">
        {<div>IsNULL</div>}
        <div className="isNull">
          <div className="alias">{isNulls[0].alias}</div>
          <div className="attr">{isNulls[0].attribute.name}</div>
        </div>
      </div>)
  }

  private displayNOT(nots: IEntityQueryWhere[]) {
    return nots && (nots.length !== 1 ? <div className="allNots">
      {nots.map((not, idx1) =>
        <div key={`not${idx1}`}>
          {<div>NOT</div>}
          {not.and ? this.displayAND(not.and) : undefined}
          {not.or ? this.displayOR(not.or) : undefined}
          {not.not ? this.displayNOT(not.not) : undefined}
          {not.isNull ? this.displayISNULL(not.isNull) : undefined}
          <div className="not" key={idx1}>
            {not.equals && this.displayEQUALS(not.equals)}
          </div>
          <div className="not" key={idx1}>
            {not.contains && this.displayCONTAINS(not.contains)}
          </div>
          <div className="not" key={idx1}>
            {not.greater && this.displayGREATER(not.greater)}
          </div>
          <div className="not" key={idx1}>
            {not.less && this.displayLESS(not.less)}
          </div>
        </div>
      )}</div>
      : <div className="allNots">
        <div key={`not`}>
          {<div>NOT</div>}
          {nots[0].and ? this.displayAND(nots[0].and) : undefined}
          {nots[0].or ? this.displayOR(nots[0].or) : undefined}
          {nots[0].not ? this.displayNOT(nots[0].not) : undefined}
          {nots[0].isNull ? this.displayISNULL(nots[0].isNull) : undefined}
          <div className="not">
            {nots[0].equals && this.displayEQUALS(nots[0].equals)}
          </div>
          <div className="not">
            {nots[0].contains && this.displayCONTAINS(nots[0].contains)}
          </div>
          <div className="not">
            {nots[0].greater && this.displayGREATER(nots[0].greater)}
          </div>
          <div className="not">
            {nots[0].less && this.displayLESS(nots[0].less)}
          </div>
        </div>
      </div>)
  }

  private displayGREATER(greaters: IEntityQueryWhereValue[]) {
    return greaters && (greaters.length !== 1 ? <div className="greaters">
      {greaters.map((greater, idx1) =>
        <div className="greater" key={idx1}>
          <div className="alias">{greater.alias}</div>
          <div className="attr">{greater.attribute.name}</div>
          <div className="opGR" />
          <div className="value">{greater.value}</div>
        </div>
      )}
    </div>
      : <div className="greater">
        <div className="alias">{greaters[0].alias}</div>
        <div className="attr">{greaters[0].attribute.name}</div>
        <div className="opGR" />
        <div className="value">{greaters[0].value}</div>
      </div>)
  }

  private displayLESS(less: IEntityQueryWhereValue[]) {
    return less && (less.length !== 1 ? <div className="arrayLess">
      {less.map((item, idx1) =>
        <div className="less" key={idx1}>
          <div className="alias">{item.alias}</div>
          <div className="attr">{item.attribute.name}</div>
          <div className="opL" />
          <div className="value">{item.value}</div>
        </div>
      )}
    </div>
      : <div className="less">
        <div className="alias">{less[0].alias}</div>
        <div className="attr">{less[0].attribute.name}</div>
        <div className="opL" />
        <div className="value">{less[0].value}</div>
      </div>)
  }

  private displayCONTAINS(contains: IEntityQueryWhereValue[]) {
    return contains && (contains.length !== 1 ? <div className="contains">
      {contains.map((contain, idx1) =>
        <div className="contain" key={idx1}>
          <div className="alias">{contain.alias}</div>
          <div className="attr">{contain.attribute.name}</div>
          <div className="opEQ" />
          <div className="value">...{contain.value}...</div>
        </div>
      )}
    </div>
      : <div className="contain">
        <div className="alias">{contains[0].alias}</div>
        <div className="attr">{contains[0].attribute.name}</div>
        <div className="opEQ" />
        <div className="value">...{contains[0].value}...</div>
      </div>)
  }

  private _renderCommand(command: ICommand) {
    return (
      <div className="command">
        <div className="commandAction">
          <div className={`action${command.action}`} />
          {command.payload.options && <div>
            {
              command.payload.options.skip &&
              this.displaySKIP(command.payload.options.skip)
            }
            {
              command.payload.options.first &&
              this.displayFIRST(command.payload.options.first)
            }
          </div>}
        </div>
        <div className="payload" >
          <div className="alias">{command.payload.link.alias}</div>
          <div className="entityName"> {command.payload.link.entity.name} </div>
          <div className="fields">
            <div id="scrollUp0" className="scrollUp">
              <div className="s">
                {command.payload.link.fields.map((field, idx) =>
                  <div key={idx}>
                    {field.links && field.links.length ?
                      field.links.map((payload, idxp) => {
                        return <div className="field" key={idxp}>
                          <div>{field.attribute.name}</div>
                          <div className="payload">
                            <div className="alias">{payload.alias}</div>
                            <div className="entityName">{payload.entity.name}</div>
                            {payload.fields && <div className="fields">
                              <div id={`scrollUp${payload.alias}/${idxp}-${idx}`} className="scrollUp">
                                <div className="s">
                                  {payload.fields.map((f, idxf) => <div className="field" key={idxf}>{f.attribute.name}</div>)}
                                </div>
                              </div>
                              <button id={`buttonForScroll${payload.alias}/${idxp}-${idx}`} className="buttonForScroll"
                                onClick={field && field.links && field.links[idxp] ? () =>
                                  this.collUpsFields(
                                    `scrollUp${field!.links![idxp]!.alias}/${idxp}-${idx}`,
                                    `buttonForScroll${field!.links![idxp]!.alias}/${idxp}-${idx}`
                                  ) : undefined}>...</button>
                            </div>}
                          </div>
                        </div>
                      })
                      : <div className="field">{field.attribute.name}</div>
                    } </div>
                )}
              </div>
            </div>
            <button id="buttonForScroll0" className="buttonForScroll"
              onClick={() => this.collUpsFields("scrollUp0", "buttonForScroll0")}>...</button>
          </div>
        </div>
        {
          command.payload.options && (command.payload.options.where || command.payload.options.order) &&
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
    if (query.link.entity.adapter) {
      const selectQuery = new Select(query);
      return (
        <div className="SelectQuery">
          <pre className="sql">{selectQuery.sql}</pre>
          <div className="params">{JSON.stringify(selectQuery.params)}</div>
        </div>
      );
    }
  }

  render() {
    const { editedText, showPhrases, verboseErrors, tokens, selectedERModel } = this.state;
    const { text, onAnalyze, errorMsg, parserDebug, onQuery, onClear, parsedText, erModels, host, port, loading } = this.props;

    const erModelState = selectedERModel ? erModels[selectedERModel] : undefined;
    const canQuery = erModelState && erModelState.command && !loading && (
      !erModelState.command[0].payload.link.entity.adapter
      ||
      (
        host && port
      )
    );
    const commandError = erModelState ? erModelState.commandError : undefined;
    const command = erModelState ? erModelState.command : undefined;

    return (<div className="ContentBox">
      <div className="SyntaxBoxInput">
        <TextField
          label="Text"
          value={editedText}
          onChange={
            (_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
              if (newValue) {
                try {
                  const tokens = tokenize(newValue);
                  this.setState({
                    editedText: newValue,
                    showPhrases: false,
                    tokens
                  });
                }
                catch (err) {
                  this.setState({
                    editedText: err.message,
                    tokens: []
                  });
                }
              } else {
                this.setState({
                  editedText: '',
                  showPhrases: false,
                  tokens: []
                });
              }
            }
          }
        />
        <DefaultButton
          text="..."
          style={{ maxWidth: '48px' }}
          onClick={() => this.setState({ showPhrases: true, selectedERModel })}
        />
        <ComboBox
          selectedKey={selectedERModel ? (erModels[selectedERModel] ? selectedERModel : undefined) : undefined}
          label="ER-Model"
          autoComplete="on"
          options={Object.keys(erModels).map(key => ({ key, text: key }))}
          onPendingValueChanged={(option, _pendingIndex, _newSelectedERModel) => {
            if (option && erModels[option.text]) this.setState({ selectedERModel: option.text });
          }}
        />
        <DefaultButton
          text="Analyze"
          disabled={!tokens.length || !selectedERModel || !erModels[selectedERModel] || erModels[selectedERModel].loading}
          onClick={selectedERModel ? () => { this.setState({ showPhrases: false }); onAnalyze(selectedERModel, editedText); } : undefined}
        />
        <DefaultButton
          text="Query"
          disabled={!canQuery}
          onClick={selectedERModel ? () => onQuery(selectedERModel) : undefined}
        />
        <DefaultButton
          text="Clear"
          disabled={!selectedERModel || (!parsedText && !parserDebug)}
          onClick={selectedERModel ? () => onClear(selectedERModel) : undefined}
        />
      </div>
      <div className="SyntaxTokens">
        {
          tokens.map((t, idx) =>
            t.tokenType && <div key={idx}>
              <div className={`Token${t.tokenType.name}`}>
                {t.image.split('').map((ch, idx) => ch === ' ' ? <span key={idx}>&nbsp;</span> : ch)}
              </div>
              {
                t.tokenType === CyrillicWord ? morphAnalyzer(t.image).map(w =>
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
          {predefinedPhrases.map((p, idx) => <DefaultButton key={idx} text={p} onClick={
            () => this.setState({
              editedText: p,
              tokens: tokenize(p),
              showPhrases: false
            })
          } />)}
        </div>
        : undefined}
      <div className={text === editedText || parserDebug ? '' : 'SemiTransparent'}>
        {this._getCoombinations()}
        {parsedText && <div className="PhraseSyntaxTrees"> {parsedText.map( (phrase, id) => <div key={id}><PhraseSyntaxTree parsedText={phrase} /></div> )}</div> }
        {commandError && <div className="SyntaxError">{commandError}</div>}
        {command && <div>Command:{this._renderCommand(command[0])}</div>}
        {command && <pre>{JSON.stringify(command[0].payload.inspect(), undefined, 2)}</pre>}
        {command && command[0].payload.link.entity.adapter && <div>Select query:{this.createStringSelect(command[0].payload)}</div>}
        {parserDebug ?
          parserDebug.map((item, key) =>
            <div className="ParserDebug" key={key}>
              {item.map((pd, idx) =>
                pd.parser && <div key={idx}>
                  <div>
                    Parser: {pd.parser.getName().label}
                  </div>
                  <div className="DebugWordSignatures">
                    {pd.wordsSignatures.map((ws, wi) => <div key={wi}>{ws}</div>)}
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
                                onClick={() => this.setState({ verboseErrors: undefined })}
                              />
                            </div>
                            :
                            <DefaultButton
                              text="Verbose..."
                              onClick={() => this.setState({ verboseErrors: pd.errors })}
                            />
                        }
                      </div>
                      :
                      undefined
                  }
                </div>
              )}
            </div>
          )
          : undefined}
      </div>
    </div>);
  }
};

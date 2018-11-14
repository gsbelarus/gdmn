import React, { Component } from "react";
import { TextField, DefaultButton } from "office-ui-fabric-react";
import "./SyntaxBox.css";
import { IToken } from "chevrotain";

export interface ISyntaxBoxProps {
  text: string,
  coombinations: IToken[][]
  onSetText: (text: string) => void
};

export interface ISyntaxBoxState {
  editedText: string
}

export class SyntaxBox extends Component<ISyntaxBoxProps, ISyntaxBoxState> {
  state: ISyntaxBoxState = {
    editedText: this.props.text
  }

  private _getColor(t: IToken): string {
    return t.tokenType.name.substr(0, 4) + 'Color';
  }

  private _getCoombinations(): JSX.Element {
    const stacks: IToken[][] = [];
    const { coombinations } = this.props;

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
      <div className="SyntaxCoombinations">
        {
          stacks.map( (s, idx) => (
            <div key={idx}>
              <div className={this._getColor(s[0])}>
                {s[0].image}
              </div>
              {
                s.map( (w, wi) => (
                  <div key={wi}>
                    {w.tokenType.name}
                  </div>
                ))
              }
            </div>
          ))
        }
      </div>
    );
  }

  render() {
    const { editedText } = this.state;
    const { onSetText } = this.props;

    return (<div className="ContentBox">
      <div className="SyntaxBoxInput">
        <TextField
          label="Text"
          value={editedText}
          onChange={ (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ editedText: e.target.value }) }
        />
        <DefaultButton
          text="Analyze"
          onClick={ () => onSetText(editedText) }
        />
      </div>
      {this._getCoombinations()}
    </div>);
  }
};
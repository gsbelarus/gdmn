import React, { Component } from "react";
import { TextField, DefaultButton } from "office-ui-fabric-react";
import "./SyntaxBox.css";

export interface ISyntaxBoxProps {
  text: string,
  onSetText: (text: string) => void
};

export interface ISyntaxBoxState {
  editedText: string
}

export class SyntaxBox extends Component<ISyntaxBoxProps, ISyntaxBoxState> {
  state: ISyntaxBoxState = {
    editedText: this.props.text
  }

  render() {
    const { editedText } = this.state;

    return (<div className="ContentBox">
      <div className="SyntaxBoxInput">
        <TextField
          label="Text"
          value={editedText}
          onChange={ (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ editedText: e.target.value }) }
        />
        <DefaultButton
          text="Analyze"
        />
      </div>
    </div>);
  }
};
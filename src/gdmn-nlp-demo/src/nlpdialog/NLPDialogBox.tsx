import React, { Component } from "react";
import { NLPDialogScroll } from "./NLPDialogScroll";
import "./NLPDialogBox.css";
import { INLPDialogState } from "./reducer";
import { PhraseSyntaxTree } from "../components/PhraseSyntaxTree";

export interface IChatBoxProps {
  nlpDialog: INLPDialogState;
  addNLPMessage: (text: string) => void;
}

export class ChatBox extends Component<IChatBoxProps, {}> {
  render() {
    const { nlpDialog, addNLPMessage } = this.props;
    const { parsedText } = nlpDialog;

    return (
      <div className="NLPDialogArea">
        <div className="NLPDialogColumn">
          <NLPDialogScroll nlpDialog={nlpDialog.items} addNLPMessage={addNLPMessage} />
        </div>
        {
          parsedText && <PhraseSyntaxTree parsedText={parsedText} />
        }
      </div>
    );
  }
}
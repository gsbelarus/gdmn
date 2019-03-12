import React, { Component } from "react";
import { NLPDialogScroll } from "./NLPDialogScroll";
import "./NLPDialogBox.css";
import { INLPDialogState } from "./reducer";

export interface IChatBoxProps {
  nlpDialog: INLPDialogState;
  addNLPMessage: (text: string) => void;
}

export class ChatBox extends Component<IChatBoxProps, {}> {
  render() {
    const { nlpDialog, addNLPMessage } = this.props;

    return (
      <div className="NLPDialogArea">
        <NLPDialogScroll nlpDialog={nlpDialog.items} addNLPMessage={addNLPMessage} />
      </div>
    );
  }
}
import React, { Component } from "react";
import { NLPDialogScroll } from "./NLPDialogScroll";
import "./NLPDialogBox.css";
import { NLPDialog } from "gdmn-nlp-agent";

export interface IChatBoxProps {
  nlpDialog: NLPDialog;
  addNLPMessage: (text: string) => void;
}

export class ChatBox extends Component<IChatBoxProps, {}> {
  render() {
    return (
      <div className="NLPDialogArea">
        <NLPDialogScroll {...this.props} />
      </div>
    );
  }
}
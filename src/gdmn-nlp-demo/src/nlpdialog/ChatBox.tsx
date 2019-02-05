import React, { Component } from "react";
import { NLPDialogScroll } from "./NLPDialogScroll";

export class ChatBox extends Component<{}, {}> {
  render() {
    return <NLPDialogScroll nlpDialog={[{ who: 'abc', text: 'cdfdcvdv' }]} addNlpMessage={ text => {} } />;
  }
}
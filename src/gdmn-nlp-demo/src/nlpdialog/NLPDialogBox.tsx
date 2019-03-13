import React, { Component } from "react";
import { NLPDialogScroll } from "./NLPDialogScroll";
import "./NLPDialogBox.css";
import { INLPDialogState } from "./reducer";
import { PhraseSyntaxTree } from "../components/PhraseSyntaxTree";
import { RecordSet } from "gdmn-recordset";
import { GridComponentState, TEventCallback, TCancelSortDialogEvent, TApplySortDialogEvent, TColumnResizeEvent, TColumnMoveEvent, TSelectRowEvent,
  TSelectAllRowsEvent, TSetCursorPosEvent, TSortEvent, TToggleGroupEvent } from "gdmn-grid";

export interface IChatBoxProps {
  nlpDialog: INLPDialogState;
  rs?: RecordSet;
  grid?: GridComponentState;
  onCancelSortDialog: TEventCallback<TCancelSortDialogEvent>;
  onApplySortDialog: TEventCallback<TApplySortDialogEvent>;
  onColumnResize: TEventCallback<TColumnResizeEvent>;
  onColumnMove: TEventCallback<TColumnMoveEvent>;
  onSelectRow: TEventCallback<TSelectRowEvent>;
  onSelectAllRows: TEventCallback<TSelectAllRowsEvent>;
  onSetCursorPos: TEventCallback<TSetCursorPosEvent>;
  onSort: TEventCallback<TSortEvent>;
  onToggleGroup: TEventCallback<TToggleGroupEvent>;
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
        <div className="NLPDialogResultColumn">
          {
            parsedText && <PhraseSyntaxTree parsedText={parsedText} />
          }
        </div>
      </div>
    );
  }
}
import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { IHistoryStateProps, IHistoryContainerProps } from "./HistoryDialog.types";
import { HistoryDialog } from "./HistoryDialog";

export const HistoryDialogContainer = connect(
  (state: IState, ownProps: IHistoryContainerProps): IHistoryStateProps => ({
    erModel: state.gdmnState.erModel,
    rs: state.recordSet[ownProps.id],
    gcs: state.grid[ownProps.id],
  })
)(HistoryDialog);

import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { IThemeEditorStateProps, IThemeEditorContainerProps } from "./ThemeEditor.types";
import { ThemeEditor } from "./ThemeEditor";

export const ThemeEditorContainer = connect(
  (state: IState, ownProps: IThemeEditorContainerProps): IThemeEditorStateProps => ({
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url )
  })
)(ThemeEditor);
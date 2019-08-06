import { IViewTab } from "../gdmn/types";
import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { GdmnAction } from "../gdmn/actions";

export interface IThemeEditorContainerProps {
  url: string;
};

export interface IThemeEditorProps {
  url: string;
  dispatch: ThunkDispatch<IState, never, GdmnAction>;
  viewTab?: IViewTab;
};

export interface IThemeEditorStateProps {
  viewTab?: IViewTab;
};

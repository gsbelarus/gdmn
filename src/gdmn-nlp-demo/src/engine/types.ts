import { ThunkDispatch } from "redux-thunk";
import { State } from "../store";
import { RecordSetAction } from "gdmn-recordset";
import { GridAction } from "gdmn-grid";
import { EntityQuery } from "gdmn-orm";
import { LoadingQuery } from "../syntax/actions";
import { ActionType } from "typesafe-actions";

export type ExecuteCommand = (dispatch: ThunkDispatch<State, never, RecordSetAction | GridAction | ActionType<LoadingQuery>>, name: string, eq: EntityQuery) => void;

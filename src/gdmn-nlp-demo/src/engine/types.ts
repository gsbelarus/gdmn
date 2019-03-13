import { ThunkDispatch } from "redux-thunk";
import { State } from "../store";
import { RecordSetAction } from "gdmn-recordset";
import { GridAction } from "gdmn-grid";
import { EntityQuery } from "gdmn-orm";

export type ExecuteCommand = (dispatch: ThunkDispatch<State, never, RecordSetAction | GridAction>, name: string, eq: EntityQuery) => void;

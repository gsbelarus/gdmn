import { State } from "../store";
import { RSAction } from "gdmn-recordset";
import { GridAction } from "gdmn-grid";
import { EntityQuery } from "gdmn-orm";
import { LoadingQuery } from "../syntax/actions";
import { ActionType } from "typesafe-actions";
import { Dispatch } from "redux";

export type ExecuteCommand = (dispatch: Dispatch<RSAction | GridAction | ActionType<LoadingQuery>>, getState: () => State, name: string, eq: EntityQuery) => Promise<any>;

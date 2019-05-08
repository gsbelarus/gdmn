import { ThunkDispatch } from "redux-thunk";
import { State } from "../store";
import { RSAction, rsActions, RecordSet, IDataRow, TFieldType, IFieldDef } from "gdmn-recordset";
import { GridAction, deleteGrid, createGrid } from "gdmn-grid";
import { EntityQuery, IEntityQueryResponse } from "gdmn-orm";
import { List } from "immutable";
import { ExecuteCommand } from "./types";
import { loadingQuery, LoadingQuery } from "../syntax/actions";
import { ActionType } from "typesafe-actions";
import { Dispatch } from "redux";

export const executeCommand: ExecuteCommand = async (dispatch: Dispatch<RSAction | GridAction | ActionType<LoadingQuery>>, getState: () => State, name: string, eq: EntityQuery) => {
  if (getState().grid[name]) {
    dispatch(deleteGrid({ name }));
  }

  if (getState().recordSet[name]) {
    dispatch(rsActions.deleteRecordSet({ name }));
  }

  const { host, port } = getState().param;

  if (!host || !port) {
    return Promise.resolve();
  }

  return (
    Promise.resolve()
    .then( () => dispatch(loadingQuery(true)) )
    .then( () => fetch(`http://${host}:${port}/data?query=${encodeURIComponent(eq.serialize())}`) )
    .then( response => response.json() )
    .then( responseJson => {
      const rs = RecordSet.create({
        name,
        fieldDefs: sqlResult2fieldDefs(eq, responseJson),
        data: List(responseJson.data as IDataRow[]),
        eq
      });
      dispatch(rsActions.createRecordSet({ name, rs }));

      dispatch(createGrid({
        name,
        columns: rs.fieldDefs.map(fd => ({
          name: fd.fieldName,
          caption: [fd.caption || fd.fieldName],
          fields: [{...fd}],
          width: fd.dataType === TFieldType.String && fd.size ? fd.size * 10 : undefined
        })),
        leftSideColumns: 0,
        rightSideColumns: 0,
        hideFooter: true
      }));

      dispatch(loadingQuery(false));
    })
    .catch( err => {
      console.log(err);
      dispatch(loadingQuery(false));
     })
  );
};

const sqlResult2fieldDefs = (query: EntityQuery, res: IEntityQueryResponse): IFieldDef[] => {
  const keysAliases = Object.keys(res.aliases);
  return keysAliases.map((alias) => {
    const eqfa = res.aliases[alias];
    const link = query.link.deepFindLink(eqfa.linkAlias)!;
    const findField = link.fields.find( field => field.attribute.name === eqfa.attribute );

    if (!findField) {
      throw new Error('Invalid query data!');
    }

    const attr = findField.attribute;
    let dataType;
    let size: number | undefined = undefined;

    switch(attr.type) {
      case "Blob":
      case "Enum":
      case "String":
        dataType = TFieldType.String;
        break;
      case "Sequence":
      case "Integer":
        dataType = TFieldType.Integer;
        break;
      case "Float":
        dataType = TFieldType.Float;
        break;
      case "TimeStamp":
      case "Time":
      case "Date":
        dataType = TFieldType.Date;
        break;
      case "Boolean":
        dataType = TFieldType.Boolean;
        break;
      case "Numeric":
        dataType = TFieldType.Currency;
        break;
      default:
        throw new Error(`Unsupported attribute type ${attr.type} of ${attr.name}`);
    }

    const caption = attr.name;
    return {fieldName: alias, dataType, size, caption, eqfa};
  });
};






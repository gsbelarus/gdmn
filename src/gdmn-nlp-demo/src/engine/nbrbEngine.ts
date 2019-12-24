import { State } from "../store";
import { RSAction, rsActions, RecordSet, IDataRow, TFieldType, IFieldDef } from "gdmn-recordset";
import { GridAction, deleteGrid, createGrid } from "gdmn-grid";
import { EntityQuery } from "gdmn-orm";
import { List } from "immutable";
import { ExecuteCommand } from "./types";
import { Dispatch } from "redux";

export const executeCommand: ExecuteCommand = async (dispatch: Dispatch<RSAction | GridAction>, getState: () => State, name: string, eq: EntityQuery) => {
  if (getState().grid[name]) {
    dispatch(deleteGrid({ name }));
  }

  if (getState().recordSet[name]) {
    dispatch(rsActions.deleteRecordSet({ name }));
  }

  let year = new Date().getFullYear();
  let month = new Date().getMonth() + 1;
  let day = new Date().getDate();

  if (eq.options && eq.options.where && eq.options.where[0] && eq.options!.where![0]!.equals && eq.options!.where![0]!.equals[0]) {
    if (eq.link.alias === eq.options!.where![0]!.equals![0].alias) {
      if (eq.options!.where![0]!.equals![0].attribute.name === 'Date') {
        const dateSplit = (eq.options!.where![0]!.equals![0].value as string).split('.');
        day = isNaN(parseInt(dateSplit[0])) ? day : parseInt(dateSplit[0]);
        month = isNaN(parseInt(dateSplit[1])) ? month : parseInt(dateSplit[1]);
        year = isNaN(parseInt(dateSplit[2])) ? year : parseInt(dateSplit[2]);
      }
    }
  }

  return (
    fetch(`http://www.nbrb.by/API/ExRates/Rates?onDate=${year.toString()}-${month.toString()}-${day.toString()}&Periodicity=0`)
    .then( response => response.json() )
    .then( responseJson => responseJson as JSONResult )
    .then( responseJson => {
      const rs = RecordSet.create({
        name,
        fieldDefs: jsonResult2fieldDefs(eq, responseJson),
        data: List(responseJson as IDataRow[]),
        eq: eq
      });
      dispatch(rsActions.createRecordSet({name, rs}));

      const getMaxLength = (fn: string) => {
        let len = 0;
        for (let i = 0; i < rs.size; i++) {
          if (rs.getString(fn, i).length > len) {
            len = rs.getString(fn, i).length;
          }
        }
        return len;
      }

      dispatch(createGrid({
        name,
        columns: rs.fieldDefs.map(fd => ({
          name: fd.fieldName,
          caption: [fd.caption || fd.fieldName],
          fields: [{...fd}],
          width: getMaxLength(fd.fieldName) * 8 + 16
        })),
        leftSideColumns: 0,
        rightSideColumns: 0,
        hideFooter: true
      }));
    })
    .catch(console.log)
  );
};

type JSONResult = {
  [name: string]: any
}[];

const jsonResult2fieldDefs = (_query: EntityQuery, res: JSONResult): IFieldDef[] => {
  if (!res.length) return [];

  return Object.keys(res[0]).map( key => {
    return {
      fieldName: key,
      dataType: TFieldType.String,
      size: 40,
      caption: key
    };
  });
};

import { ThunkDispatch } from "redux-thunk";
import { State } from "../store";
import { RecordSetAction, deleteRecordSet, RecordSet, IDataRow, createRecordSet, TFieldType, IFieldDef } from "gdmn-recordset";
import { GridAction, deleteGrid, createGrid } from "gdmn-grid";
import { EntityQuery, IEntityQueryResponse } from "gdmn-orm";
import { List } from "immutable";

export const executeCommand = (dispatch: ThunkDispatch<State, never, RecordSetAction | GridAction>, name: string, eq: EntityQuery) =>
  dispatch(
    async (dispatch: ThunkDispatch<State, never, RecordSetAction | GridAction>, getState: () => State) => {
      if (getState().grid[name]) {
        dispatch(deleteGrid({ name }));
      }
      if (getState().recordSet[name]) {
        dispatch(deleteRecordSet({ name }));
      }

      const { host, port } = getState().param;

      const response = await fetch(`http://${host}:${port}/data?query=${encodeURIComponent(eq.serialize())}`);
      const responseJson = await response.json();

      const rs = RecordSet.create({
        name,
        fieldDefs: sqlResult2fieldDefs(eq, responseJson),
        data: List(responseJson.data as IDataRow[]),
        eq
      });
      dispatch(createRecordSet({ name, rs }));

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
    }
  );

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






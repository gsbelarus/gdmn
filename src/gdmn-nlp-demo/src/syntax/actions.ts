import { createAction } from 'typesafe-actions';
import { EntityQuery, IEntityQueryResponse } from 'gdmn-orm';
import { ThunkDispatch } from 'redux-thunk';
import { State } from '../store';
import { RecordSetAction, RecordSet, TFieldType, IFieldDef, IDataRow, createRecordSet, deleteRecordSet } from 'gdmn-recordset';
import { List } from 'immutable';
import { createGrid, deleteGrid, GridAction } from 'gdmn-grid';

export const setSyntaxText = createAction('SYNTAX/SET_SYNTAX_TEXT', resolve => {
    return (text: string) => resolve(text);
  });

export type SetSyntaxText = typeof setSyntaxText;

let fieldDefs = (query: EntityQuery, res: IEntityQueryResponse ): IFieldDef[] => {
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

export const loadRecordSet = (query: EntityQuery, host: string, port: string) => (
  async (dispatch: ThunkDispatch<State, never, RecordSetAction | GridAction>, getState: () => State) => {
    if (getState().grid['db']) {
      dispatch(deleteGrid({name: 'db'}));
    }
    if (getState().recordSet['db']) {
      dispatch(deleteRecordSet({name: 'db'}));
    }

    const response = await fetch(`http://${host}:${port}/data?query=${encodeURIComponent(query.serialize())}`);
    const responseJson = await response.json();

    const rs = RecordSet.create({
      name: 'db',
      fieldDefs: fieldDefs(query, responseJson),
      data: List(responseJson.data as IDataRow[]),
      eq: query
    });
    dispatch(createRecordSet({name: rs.name, rs}));

    dispatch(createGrid({
      name: rs.name,
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

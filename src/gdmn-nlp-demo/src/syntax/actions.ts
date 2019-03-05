import { createAction } from 'typesafe-actions';
import { EntityQuery, IEntityQueryResponse } from 'gdmn-orm';
import { ThunkDispatch } from 'redux-thunk';
import { State } from '../store';
import { RecordSetAction, RecordSet, TFieldType, IFieldDef, IDataRow, createRecordSet } from 'gdmn-recordset';
import { List } from 'immutable';

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

export const loadRecordSet = (query: EntityQuery, host: string, port: string)  => (dispatch: ThunkDispatch<State, never, RecordSetAction>, _getState: () => State) => {
  fetch(`http://${host}:${port}/data?query=${encodeURIComponent(query.serialize())}`)
  .then(res => res.json())
  .then(res => RecordSet.create({
    name: 'db',
    fieldDefs: fieldDefs(query, res),
    data: List(res.data as IDataRow[]),
    srcEoF: true,
    eq: query
  }))
  .then(res => dispatch(createRecordSet({ name: res.name, rs: res })))
};

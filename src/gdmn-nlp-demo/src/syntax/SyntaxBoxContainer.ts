import { connect } from 'react-redux';
import { State } from '../store';
import { SyntaxBox } from './SyntaxBox';
import { SyntaxAction } from './reducer';
import * as syntaxActions from './actions';
import * as erModelActions from '../ermodel/actions';
import { ThunkDispatch } from 'redux-thunk';
import { ERModelAction } from '../ermodel/reducer';
import { RusPhrase } from 'gdmn-nlp';
import {
  createRecordSet,
  deleteRecordSet,
  IDataRow,
  IFieldDef,
  RecordSet,
  RecordSetAction,
  TFieldType
} from 'gdmn-recordset';
import {createGrid, deleteGrid, GridAction} from 'gdmn-grid';
import { EntityQuery, IEntityQueryResponse } from 'gdmn-orm';
import { List } from 'immutable';

export const SyntaxBoxContainer = connect(
  (state: State) => {
    const erModel = state.ermodel['db'];
    if (erModel) {
      return {
        ...state.syntax,
        isVisibleQuery: erModel.command && state.param.host && state.param.port,
        commandError: erModel.commandError,
        command: erModel.command
      }
    }

    return {...state.syntax};
  },
  (dispatch: ThunkDispatch<State, never, SyntaxAction | ERModelAction | RecordSetAction>) => ({
    onAnalyze: (text: string) => dispatch(
      (dispatch: ThunkDispatch<State, never, SyntaxAction | ERModelAction>, getState: () => State) => {
        dispatch(syntaxActions.setSyntaxText(text));
        const parsedText = getState().syntax.parsedText;
        if (parsedText && parsedText.phrase && parsedText.phrase instanceof RusPhrase) {
          dispatch(erModelActions.processPhrase({name: 'db', phrase: parsedText.phrase as RusPhrase}));
        } else {
          dispatch(erModelActions.clearCommand({name: 'db', clear: true}));
        }
      }
    ),
    onQuery: () => dispatch(
      async (dispatch: ThunkDispatch<State, never, RecordSetAction | GridAction>, getState: () => State) => {
        const {param: {host, port}, ermodel, grid, recordSet} = getState();
        const query = ermodel['db'].command[0].payload;

        if (grid['db']) {
          dispatch(deleteGrid({name: 'db'}));
        }
        if (recordSet['db']) {
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
    )
  })
)(SyntaxBox);

const fieldDefs = (query: EntityQuery, res: IEntityQueryResponse ): IFieldDef[] => {
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

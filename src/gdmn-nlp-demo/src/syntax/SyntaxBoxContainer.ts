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
import { EntityQuery, IEntityQueryResponse, Attribute, StringAttribute, IntegerAttribute, SequenceAttribute, FloatAttribute, DateAttribute, NumberAttribute, BooleanAttribute, EnumAttribute } from 'gdmn-orm';
import { List } from 'immutable';
import { getLName } from 'gdmn-internals';

export const SyntaxBoxContainer = connect(
  (state: State) => (
    {
      ...state.syntax,
      erModels: state.ermodel,
      host: state.param.host,
      port: state.param.port
    }
  ),
  (dispatch: ThunkDispatch<State, never, SyntaxAction | ERModelAction | RecordSetAction>) => ({
    onAnalyze: (erModelName: string, text: string) => dispatch(
      (dispatch: ThunkDispatch<State, never, SyntaxAction | ERModelAction>, getState: () => State) => {
        dispatch(syntaxActions.setSyntaxText(text));
        const parsedText = getState().syntax.parsedText;
        if (parsedText && parsedText.phrase && parsedText.phrase instanceof RusPhrase) {
          dispatch(erModelActions.processPhrase({name: erModelName, phrase: parsedText.phrase as RusPhrase}));
        } else {
          dispatch(erModelActions.clearCommand({name: erModelName, clear: true}));
        }
      }
    ),
    onQuery: (erModelName: string) => dispatch(
      async (dispatch: ThunkDispatch<State, never, RecordSetAction | GridAction>, getState: () => State) => {
        const {param: {host, port}, ermodel, grid, recordSet} = getState();

        if (!ermodel || !ermodel[erModelName] || !ermodel[erModelName].command || !ermodel[erModelName].command![0]) return;

        const query = ermodel[erModelName].command![0].payload;

        if (grid[erModelName]) {
          dispatch(deleteGrid({name: erModelName}));
        }
        if (recordSet[erModelName]) {
          dispatch(deleteRecordSet({name: erModelName}));
        }

        if (erModelName === 'db') {
          const response = await fetch(`http://${host}:${port}/data?query=${encodeURIComponent(query.serialize())}`);
          const responseJson = await response.json();

          const rs = RecordSet.create({
            name: erModelName,
            fieldDefs: sqlResult2fieldDefs(query, responseJson),
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
        } else {
          const response = await fetch(`http://www.nbrb.by/API/ExRates/Rates?onDate=2016-7-6&Periodicity=0`);
          const responseJson = await response.json() as IJSONResult;

          const rs = RecordSet.create({
            name: erModelName,
            fieldDefs: jsonResult2fieldDefs(query, responseJson),
            data: List(responseJson as IDataRow[]),
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
      }
    ),
   onClear: (name: string) => {
     dispatch(syntaxActions.clearSyntaxText());
     dispatch(erModelActions.clearCommand({ name, clear: true }));
    }
  })
)(SyntaxBox);

function attr2fd(attr: Attribute): IFieldDef {
  let dataType;
  let size: number | undefined = undefined;

  if (attr instanceof StringAttribute) {
    dataType = TFieldType.String;
  } else if (attr instanceof IntegerAttribute || attr instanceof SequenceAttribute) {
    dataType = TFieldType.Integer;
  } else if (attr instanceof FloatAttribute) {
    dataType = TFieldType.Float;
  } else if (attr instanceof DateAttribute) {
    dataType = TFieldType.Date;
  } else if (attr instanceof NumberAttribute) {
    dataType = TFieldType.Currency;
  } else if (attr instanceof BooleanAttribute) {
    dataType = TFieldType.Boolean;
  } else if (attr instanceof EnumAttribute) {
    dataType = TFieldType.String;
  } else {
    throw new Error(`Unsupported attribute type ${attr.type} of ${attr.name}`);
  }

  return {
    fieldName: attr.name,
    dataType,
    size,
    caption: getLName(attr.lName)
  };
};

interface IJSONResult {
  [name: string]: any
}[];

const jsonResult2fieldDefs = (query: EntityQuery, res: IJSONResult): IFieldDef[] => {
  if (!res.length) return [];

  return Object.keys(res[0]).map( key => {
    return {
      fieldName: key,
      dataType: TFieldType.String,
      size: 40,
      caption: key
    };
  });

  // return Object.values(query.link.entity.attributes).map( attr => attr2fd(attr) );
};

const sqlResult2fieldDefs = (query: EntityQuery, res: IEntityQueryResponse ): IFieldDef[] => {
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

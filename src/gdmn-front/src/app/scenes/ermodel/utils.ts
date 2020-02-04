import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { RSAction, rsActions, IFieldDef, TFieldType } from "gdmn-recordset";
import { GridAction, cancelSortDialog, TApplySortDialogEvent, applySortDialog,
  TSelectRowEvent, TSelectAllRowsEvent,
  TSetCursorPosEvent, setCursorCol, TSortEvent, TToggleGroupEvent, TOnFilterEvent, TCancelSortDialogEvent } from "gdmn-grid";
import {IComboBoxOption} from "office-ui-fabric-react";
import { EntityQuery } from "gdmn-orm";
import { getLName } from "gdmn-internals";

export interface ILastEdited {
  fieldName: string;
  value: string | boolean ;
};

export interface IChangedFieldStatus{
  id?: string;
  fieldName: string;
  value: string ;
  status: string;
}

export interface IChangedFields {
  [fieldName: string]: string;
};

export interface IFieldStatus{
  fieldName: string;
  value: string ;
  status: string;
}

export interface ISetComboBoxData {
  [setAttrName: string]: IComboBoxOption[];
};

export interface ILastEdited {
  fieldName: string;
  value: string | boolean ;
};

export interface IAttributeData {
  fieldName: string;
  type: string;
  linkName?: string;
  lName?: string;
  required: boolean;
  semCategories: string;
  hidden: boolean;
  mask: string;
  alignment: string;
  format?: string;
  formatDate?: string;
  formatBoolean?: string;
};

export interface IEntityName {
  fieldName: string,
  value: string
};

export function bindGridActions(dispatch: ThunkDispatch<IState, never, RSAction | GridAction>) {
  return {
    onCancelSortDialog: (event: TCancelSortDialogEvent) => dispatch(
      cancelSortDialog({ name: event.rs.name })
    ),

    onApplySortDialog: (event: TApplySortDialogEvent) => dispatch(
      (dispatch, getState) => {
        dispatch(applySortDialog({ name: event.rs.name, sortFields: event.sortFields }));
        dispatch(rsActions.sortRecordSet({ name: event.rs.name, sortFields: event.sortFields }));

        event.ref.scrollIntoView(getState().recordSet[event.rs.name].currentRow);
      }
    ),

    onSelectRow: (event: TSelectRowEvent) => dispatch(
      rsActions.selectRow({
        name: event.rs.name,
        idx: event.idx,
        selected: event.selected
      })
    ),

    onSelectAllRows: (event: TSelectAllRowsEvent) => dispatch(
      rsActions.setAllRowsSelected({
        name: event.rs.name,
        value: event.value
      })
    ),

    onSetCursorPos: (event: TSetCursorPosEvent) => dispatch(
      (dispatch) => {
        dispatch(
          rsActions.setRecordSet(event.rs.setCurrentRow(event.cursorRow))
        );

        dispatch(
          setCursorCol({
            name: event.rs.name,
            cursorCol: event.cursorCol
          })
        );
      }
    ),

    onSort: (event: TSortEvent) => dispatch(
      (dispatch, getState) => {
        dispatch(
          rsActions.sortRecordSet({
            name: event.rs.name,
            sortFields: event.sortFields
          })
        );

        event.ref.scrollIntoView(getState().recordSet[event.rs.name].currentRow);
      }
    ),

    onToggleGroup: (event: TToggleGroupEvent) => dispatch(
      rsActions.toggleGroup({
        name: event.rs.name,
        rowIdx: event.rowIdx
      })
    ),

    onSetFilter: (event: TOnFilterEvent) => {
      if (event.filter) {
        dispatch(rsActions.setFilter({name: event.rs.name, filter: { conditions: [ { value: event.filter } ] } }))
      } else {
        dispatch(rsActions.setFilter({name: event.rs.name, filter: undefined }))
      }
    }
  }
};

export function attr2fd(query: EntityQuery, fieldAlias: string, linkAlias: string, attribute: string): IFieldDef {
  const link = query.link.deepFindLink(linkAlias)!;
  const findField = link.fields.find((field) => field.attribute.name === attribute);

  if (!findField) {
    throw new Error("Invalid query data!");
  }

  const attr = findField.attribute;
  let dataType;
  let size: number | undefined = undefined;

  switch (attr.type) {
    case "Blob":
    case "Enum":
    case "String":
      dataType = TFieldType.String;
      break;
    case "Parent":
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

  const caption = query.link === link ? getLName(attr.lName, ['ru']) : `${link.alias}.${getLName(attr.lName, ['ru'])}`;
  return {
    fieldName: fieldAlias,
    dataType,
    size,
    caption,
    eqfa: { linkAlias, attribute }
  };
};

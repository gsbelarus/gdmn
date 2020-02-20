import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { RSAction, rsActions, IFieldDef, TFieldType, RecordSet } from "gdmn-recordset";
import { GridAction, cancelSortDialog, TApplySortDialogEvent, applySortDialog,
  TSelectRowEvent, TSelectAllRowsEvent,
  TSetCursorPosEvent, setCursorCol, TSortEvent, TToggleGroupEvent, TOnFilterEvent, TCancelSortDialogEvent } from "gdmn-grid";
import {IComboBoxOption} from "office-ui-fabric-react";
import { EntityQuery, Entity, DateAttribute, StringAttribute, NumberAttribute, isNumericAttribute } from "gdmn-orm";
import { getLName } from "gdmn-internals";
import { EntityDataErrors } from "./EntityDataDlg/EntityDataDlg";
import equal from "fast-deep-equal";

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

/**
   * Проверка всех полей из рекордсета на валидность
   */
  export const validateEntityDataValues = (rs: RecordSet, entity: Entity, setComboBoxData: ISetComboBoxData, prevError?: EntityDataErrors): EntityDataErrors | undefined => {
    if (rs && entity) {
      const errors = rs.fieldDefs.reduce(
        (p, fd) => {
          if (fd?.eqfa) {
            const attr = entity.attributes[fd.eqfa.linkAlias !== rs.eq!.link.alias ? fd.eqfa.attribute === 'ID' ? fd.eqfa.linkAlias : '' : fd.eqfa.attribute];
            if (attr) {
              const value = rs.getValue(fd.fieldName);
              //Если поле не заполнено, но оно обязательно для заполнения
              if (value === null && attr.required) {
                p.push({
                  field: fd.fieldName,
                  message: `Value can't be empty`
                });
              }
              //Если поле заполнено, проверим условия
              if (value !== null) {
                switch (attr.type) {
                  case 'Date':
                  case 'Time':
                  case 'TimeStamp': {
                    const s = attr as DateAttribute;
                    const value = rs.getValue(fd.fieldName) as Date;
                    if (s.minValue !== undefined && value < s.minValue) {
                      p.push({
                        field: fd.fieldName,
                        message: `Value < min value`
                      });
                    } else if (s.maxValue && value > s.maxValue) {
                      p.push({
                        field: fd.fieldName,
                        message: `Value > max value`
                      });
                    }
                    break;
                  }

                  case 'String': {
                    const s = attr as StringAttribute;
                    const value = rs.getString(fd.fieldName);
                    if (s.minLength !== undefined  && s.minLength > value.length) {
                      p.push({
                        field: fd.fieldName,
                        message: `Length of value < minLength (${s.minLength})`
                      });
                    }
                    if (s.maxLength !== undefined && s.maxLength < value.length) {
                      p.push({
                        field: fd.fieldName,
                        message: `Length of value > maxLength (${s.maxLength})`
                      });
                    }
                    break;
                  }

                  case 'Integer':
                  case 'Float':
                  case 'Numeric': {
                    const s = attr as NumberAttribute<number>;
                    const value = rs.getValue(fd.fieldName) as number;
                    if (s.minValue !== undefined &&  value < s.minValue) {
                      p.push({
                        field: fd.fieldName,
                        message: `Value < min value (${s.minValue})`
                      });
                    }

                    if (s.maxValue !== undefined && value > s.maxValue) {
                      p.push({
                        field: fd.fieldName,
                        message: `Value > max value (${s.maxValue})`
                      });
                    }

                    if (isNumericAttribute(attr)) {
                      const num = value.toString().split(".");
                      const scale = num[1] ? num[1].length : 0;
                      if (scale > attr.scale) {
                        p.push({
                          field: fd.fieldName,
                          message: `Scale of value > ${attr.scale}`
                        });
                      }
                      if (num[0].length + scale > attr.precision) {
                        p.push({
                          field: fd.fieldName,
                          message: `Precision of value > ${attr.precision}`
                        });
                      }
                    }
                    break;
                  }
                }
              }
            }
          }
          return p;
        }, [] as EntityDataErrors
    );
    //Добавим ошибки по полям-множества
    const allErrors = Object.keys(setComboBoxData).reduce(
      (p, fd) => {
        const attr = entity.attributes[fd];
        if (attr) {
          const value = setComboBoxData[fd];
          //Если поле не заполнено, но оно обязательно для заполнения
          if (!value.length && attr.required) {
            p.push({
              field: fd,
              message: `Value can't be empty`
            });
          }
        }

        return p;
      }, errors as EntityDataErrors)

      return prevError && equal(allErrors, prevError) ? prevError : allErrors;
    }
    return prevError;
  };

  export const getEntityDataErrorMessage = (field: string, entityDataErrors?: EntityDataErrors) => {
    if (entityDataErrors) {
      const el = entityDataErrors.find( l => l.field === field );
      return el && el.message;
    }
    return undefined;
  };

  export const clearEntityDataErrorMessage = (field: string, entityDataErrors?: EntityDataErrors) => {
    if (entityDataErrors) {
      return entityDataErrors.filter( l => l.field !== field );
    }
    return undefined;
  };


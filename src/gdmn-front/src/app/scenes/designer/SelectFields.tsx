import React, { useReducer } from "react";
import { Entity } from "gdmn-orm";
import { Dialog, DialogType, ContextualMenu, DialogFooter, PrimaryButton, DefaultButton, MarqueeSelection, DetailsList, Selection, IColumn, SelectionMode, DetailsListLayoutMode, getTheme } from "office-ui-fabric-react";
import { getLName } from "gdmn-internals";
import { RecordSet } from "gdmn-recordset";
import { getSelectFields } from "./utils";

interface ISelectFieldsProps {
  entity: Entity;
  rs?: RecordSet;
  onCancel: () => void;
  onCreate: (fields: { fieldName: string, label: string }[]) => void;
};

interface ISelectFieldsState {
  fieldsSelected: boolean;
  selection: Selection;
};

type Action = { type: 'UPDATE_SELECTED_FIELDS' };

function reducer(state: ISelectFieldsState, action: Action): ISelectFieldsState {
  if (action.type === 'UPDATE_SELECTED_FIELDS') {
    return {
      ...state,
      fieldsSelected: !!state.selection.getSelection().length
    }
  }

  return state;
};

export const SelectFields = ({ rs, entity, onCancel, onCreate }: ISelectFieldsProps) => {

  const [{ fieldsSelected, selection }, dispatch] = useReducer(reducer, {
    fieldsSelected: false,
    selection: new Selection({
      onSelectionChanged: (): any => dispatch({ type: 'UPDATE_SELECTED_FIELDS' })
  })
  });

  return (
    <Dialog
      hidden={false}
      onDismiss={onCancel}
      dialogContentProps={{
        type: DialogType.close,
        title: 'Create fields editors',
        subText: 'Select one or more fields.'
      }}
      modalProps={{
        isDarkOverlay: true,
        dragOptions: {
          moveMenuItemText: 'Move',
          closeMenuItemText: 'Close',
          menu: ContextualMenu
        }
      }}
      minWidth='680px'
    >
      <div
        data-is-scrollable={true}
        style={{
          overflowY: 'scroll',
          maxHeight: '520px',
          border: '1px solid',
          borderColor: getTheme().semanticColors.bodyDivider,
          borderRadius: '4px'
        }}
      >
        {entity && <MarqueeSelection selection={selection}>
          <DetailsList
            items={
              getSelectFields(rs, entity)

            }
            compact={true}
            columns={[
              {
                key: 'column1',
                name: 'Field name',
                fieldName: 'name',
                isCollapsible: false,
                minWidth: 140
              },
              {
                key: 'column2',
                name: 'Label',
                fieldName: 'label',
                isCollapsible: false,
                minWidth: 200
              },
              {
                key: 'column3',
                name: 'Data Type',
                fieldName: 'dataType',
                isCollapsible: false
              }
            ] as IColumn[]}
            selectionMode={SelectionMode.multiple}
            setKey="set2"
            layoutMode={DetailsListLayoutMode.justified}
            isHeaderVisible={true}
            selection={selection}
            selectionPreservedOnEmptyClick={true}
            enterModalSelectionOnTouch={true}
          />
        </MarqueeSelection>}
      </div>
      <DialogFooter>
        <PrimaryButton disabled={!fieldsSelected} onClick={ () => onCreate(selection.getSelection().map( (s: any) => ({ fieldName: s.name, label: s.label }) ) ) } text="Create" />
        <DefaultButton onClick={onCancel} text="Cancel" />
      </DialogFooter>
    </Dialog>
  );
};

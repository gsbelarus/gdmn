import React, { useState } from "react";
import { Entity } from "gdmn-orm";
import { Dialog, DialogType, ContextualMenu, DialogFooter, PrimaryButton, DefaultButton, MarqueeSelection, DetailsList, Selection, IColumn, SelectionMode, DetailsListLayoutMode, getTheme } from "office-ui-fabric-react";
import { getLName } from "gdmn-internals";

interface ISelectFieldsProps {
  entity: Entity;
  onCancel: () => void;
  onCreate: (fields: { fieldName: string, label: string }[]) => void;
};

export const SelectFields = ({ entity, onCancel, onCreate }: ISelectFieldsProps) => {

  const [fieldsSelected, setFieldsSelected] = useState(false);
  const [selection] = useState(new Selection({
    onSelectionChanged: () => setFieldsSelected(!!selection.getSelection().length)
  }));

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
              Object.entries(entity.attributes).map(
                ([name, attr]) => ({
                  key: name,
                  name,
                  label: getLName(attr.lName, ['by', 'ru', 'en']),
                  dataType: attr.inspectDataType()
                })
              )
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

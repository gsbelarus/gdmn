import React from 'react';
import cn from 'classnames';
import { DefaultButton, IconButton, PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/components/Dialog';
import { ComboBox, IComboBox, IComboBoxOption } from 'office-ui-fabric-react/lib/components/ComboBox';
import { FieldDefs, SortFields } from 'gdmn-recordset';

import './SortDialog.css';

export interface IGDMNSortDialogProps {
  fieldDefs: FieldDefs;
  sortFields: SortFields;
  onCancel: () => void;
  onApply: (sortFields: SortFields) => void;
}

export interface IGDMNSortDialogState {
  sortFields: SortFields;
  attnFieldIdx: number;
}

class GDMNSortDialog extends React.Component<IGDMNSortDialogProps, {}> {
  state: IGDMNSortDialogState = {
    sortFields: this.props.sortFields.length
      ? [...this.props.sortFields]
      : [{ fieldName: this.props.fieldDefs[0].fieldName, asc: true }],
    attnFieldIdx: -1
  };

  setAttnField = (attnFieldIdx: number) => {
    setTimeout(() => this.setState({ attnFieldIdx: -1 }), 400);
    this.setState({ attnFieldIdx });
  };

  selectField = (idx: number) => (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    index?: number,
    value?: string
  ): void => {
    if (!option) return;

    const sortFields = [...this.state.sortFields];
    const attnFieldIdx = sortFields.findIndex((sf, i) => i !== idx && sf.fieldName === option.key);

    if (attnFieldIdx >= 0) {
      this.setAttnField(attnFieldIdx);
    } else {
      sortFields[idx].fieldName = option.key as string;
      this.setState({ sortFields });
    }
  };

  selectFieldOrder = (idx: number) => (event: React.MouseEvent<HTMLButtonElement>) => {
    const sortFields = [...this.state.sortFields];
    sortFields[idx].asc = !sortFields[idx].asc;
    this.setState({ sortFields });
  };

  onDelete = (idx: number) => {
    const sortFields = [...this.state.sortFields];
    sortFields.splice(idx, 1);
    this.setState({ sortFields });
  };

  onAdd = (idx: number) => {
    const sortFields = [...this.state.sortFields];
    const { fieldDefs } = this.props;
    sortFields.splice(idx + 1, 0, {
      fieldName: fieldDefs.find(fd => !sortFields.find(sf => sf.fieldName === fd.fieldName))!.fieldName,
      asc: true
    });
    this.setState({ sortFields });
  };

  onMoveUp = (idx: number) => {
    const sortFields = [...this.state.sortFields];
    const temp = sortFields[idx];
    sortFields[idx] = sortFields[idx - 1];
    sortFields[idx - 1] = temp;
    this.setState({ sortFields });
  };

  onMoveDown = (idx: number) => {
    const sortFields = [...this.state.sortFields];
    const temp = sortFields[idx];
    sortFields[idx] = sortFields[idx + 1];
    sortFields[idx + 1] = temp;
    this.setState({ sortFields });
  };

  onGroupBy = (idx: number) => {
    const sortFields = [...this.state.sortFields];

    if (sortFields[idx].groupBy) {
      for (let i = idx; i < sortFields.length; i++) {
        sortFields[i].groupBy = undefined;
      }
    } else {
      for (let i = 0; i <= idx; i++) {
        sortFields[i].groupBy = true;
      }
    }

    this.setState({ sortFields });
  };

  onCalcAggregates = (idx: number) => {
    const sortFields = [...this.state.sortFields];

    if (sortFields[idx].groupBy) {
      if (sortFields[idx].calcAggregates) {
        sortFields[idx].calcAggregates = undefined;
      } else {
        sortFields[idx].calcAggregates = true;
      }
    } else {
      sortFields[idx].calcAggregates = undefined;
    }

    this.setState({ sortFields });
  };

  render() {
    const { onCancel, onApply, fieldDefs } = this.props;
    const { sortFields, attnFieldIdx } = this.state;
    const fields = () =>
      fieldDefs.map(fd => ({ key: `${fd.fieldName}`, text: fd.caption ? fd.caption : fd.fieldName }));

    return (
      <Dialog
        minWidth={520}
        hidden={false}
        onDismiss={onCancel}
        dialogContentProps={{
          type: DialogType.close,
          title: 'Сортировка и группировка',
          subText: 'Выберите поле или несколько полей и порядок сортировки. Отметьте поля для группировки.'
        }}
      >
        <div className="GDMNSortDialogContainer">
          {sortFields.map((sf, idx) => (
            <div
              key={idx}
              className={cn('GDMNSortDialogRow', { GDMNAttnSortDialogRow: idx >= 0 && idx === attnFieldIdx })}
            >
              <IconButton
                iconProps={{ iconName: sf.asc ? 'Ascending' : 'Descending' }}
                onClick={this.selectFieldOrder(idx)}
              />
              <IconButton
                iconProps={{ iconName: sf.groupBy ? 'RowsChild' : 'Table' }}
                onClick={() => this.onGroupBy(idx)}
              />
              <IconButton
                disabled={!sf.groupBy}
                iconProps={{ iconName: sf.calcAggregates ? 'Calculator' : 'Footer' }}
                onClick={() => this.onCalcAggregates(idx)}
              />
              <ComboBox
                selectedKey={sf.fieldName}
                label="Поле:"
                autoComplete="on"
                options={fields()}
                onChange={this.selectField(idx)}
              />
              <IconButton
                disabled={sortFields.length === fieldDefs.length}
                iconProps={{ iconName: 'Add' }}
                title="Add"
                ariaLabel="Add"
                onClick={() => this.onAdd(idx)}
              />
              <IconButton
                disabled={idx < 1}
                iconProps={{ iconName: 'CaretUpSolid8' }}
                title="Up"
                ariaLabel="Up"
                onClick={() => this.onMoveUp(idx)}
              />
              <IconButton
                disabled={idx === sortFields.length - 1}
                iconProps={{ iconName: 'CaretDownSolid8' }}
                title="Down"
                ariaLabel="Down"
                onClick={() => this.onMoveDown(idx)}
              />
              <IconButton
                disabled={sortFields.length === 1}
                iconProps={{ iconName: 'Delete' }}
                title="Remove"
                ariaLabel="Remove"
                onClick={() => this.onDelete(idx)}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <PrimaryButton onClick={() => onApply(sortFields)} text="Save" />
          <DefaultButton onClick={onCancel} text="Cancel" />
        </DialogFooter>
      </Dialog>
    );
  }
}

export default GDMNSortDialog;

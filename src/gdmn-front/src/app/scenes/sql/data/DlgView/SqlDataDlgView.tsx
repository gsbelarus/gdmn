import { disposeMutex } from '@src/app/components/dataViewMutexes';
import { IViewProps, View } from '@src/app/components/View';
import { ERModel } from 'gdmn-orm';
import { RecordSet } from 'gdmn-recordset';
import { ISqlQueryResponseAliasesOrm } from 'gdmn-internals';
import { ICommandBarItemProps, TextField, IconButton, IButtonProps } from 'office-ui-fabric-react';
import React, { Fragment } from 'react';

export enum DlgState {
  dsBrowse,
  dsInsert,
  dsEdit
}

export interface ISqlDataDlgViewMatchParams {
  id: string;
}

export interface ISqlDataDlgViewProps extends IViewProps<ISqlDataDlgViewMatchParams> {
  src?: RecordSet;
  rs?: RecordSet;
  erModel: ERModel;
  dlgState: DlgState;
  setRow: (rowIndex: number) => void;
  onView: (entityName: string, pk: string) => void;
}

export interface ISqlDataDlgViewState {}

export class SqlDataDlgView extends View<ISqlDataDlgViewProps, ISqlDataDlgViewState, ISqlDataDlgViewMatchParams> {
  public getViewCaption(): string {
    return 'SQL record view';
  }

  public getDataViewKey() {
    return this.getRecordSetList()[0];
  }

  public getRecordSetList() {
    const { id } = this.props.match.params;

    if (!id) {
      throw new Error("Invalid sql id or row id values");
    }

    return [id];
  }

  public isDataLoaded(): boolean {
    return !!this.props.rs;
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    const { setRow } = this.props;

    const rs = this.props.rs;

    if (!rs) return [];

    const currentRow = rs.currentRow;

    const nextRow = (currentRow === (rs.size - 1)) ? currentRow : currentRow + 1;
    const prevRow = (currentRow === 0) ? currentRow : currentRow - 1;

    const items = super.getCommandBarItems();

    const nextItem: ICommandBarItemProps = {
      key: 'next',
      text: 'Next',
      iconProps: {
        iconName: 'next'
      },
      disabled: currentRow === (rs.size - 1),
      onClick: () => {
        setRow(nextRow);
      }
    };
    const prevItem = {
      key: 'previous',
      text: 'Previous',
      iconProps: {
        iconName: 'previous'
      },
      disabled: currentRow === 0,
      onClick: () => {
        setRow(prevRow);
      }
    };

    return [prevItem, nextItem, ...items];
  }

  public componentWillUnmount() {
    disposeMutex(this.getDataViewKey());
  }

  public render() {
    const { rs } = this.props;

    if (!rs) {
      return this.renderLoading();
    }

    const setViewButton = (value: string, field?: ISqlQueryResponseAliasesOrm) => {
      if (!field) return;
      if (!((field.type === 'Entity' || field.type === 'Sequence') && field.entity !== '' )) return;

      console.log(field.entity);
      return (
        <IconButton
          iconProps={{ iconName: 'edit' }}
          title="view"
          ariaLabel="View"
          disabled={!value}
          onClick={() => field.entity ? this.props.onView(field.entity, value) : {} }
        />
      )
    }

    return this.renderWide(
      undefined,
      <div className="dlgView">
        {rs.fieldDefs.map((f, idx) => (
          <Fragment key={idx}>
            <span>{f.caption}</span>
            <div style={{ display: 'flex', alignItems: 'stretch', height: '40px' }}>
              <TextField value={rs.getString(f.fieldName, rs.currentRow, '')} readOnly />
              {f.sqlfa ? setViewButton(rs.getString(f.fieldName, rs.currentRow, ''), f.sqlfa.orm) : null}
            </div>
            {/* TODO: Делать проверку типа поля и если ссылка то отображать кнопку 'Открыть запись' */}
          </Fragment>
        ))}
      </div>
    );
  }
}

import React from 'react';
import { ICommandBarItemProps, TextField } from 'office-ui-fabric-react';
import {RecordSet, TStatus} from "gdmn-recordset";
import {
  GDMNGrid,
  GridComponentState,
  IGridState,
  TLoadMoreRsDataEvent,
  TEventCallback,
  TApplySortDialogEvent,
  TCancelSortDialogEvent,
  TSelectAllRowsEvent,
  TSelectRowEvent,
  TSetCursorPosEvent,
  TSortEvent,
  TToggleGroupEvent,
  TOnFilter,
  TRecordsetSetFieldValue,
  TRecordsetEvent
} from "gdmn-grid";
import { Semaphore } from 'gdmn-internals';
import { ERModel } from 'gdmn-orm';
import { IViewProps, View } from './View';
import { disposeMutex, getMutex } from './dataViewMutexes';
import { ISessionData } from '../scenes/gdmn/types';

export interface IRSAndGCS {
  rs: RecordSet;
  gcs: GridComponentState;
  detail?: IRSAndGCS[];
}

export interface IDataViewProps<R> extends IViewProps<R> {
  data?: IRSAndGCS;
  erModel?: ERModel;
  attachRs: (mutex?: Semaphore) => void;
  loadMoreRsData?: TEventCallback<TLoadMoreRsDataEvent, Promise<any>>;
  refreshRs?: (rs: RecordSet) => void;
  onCancelSortDialog: TEventCallback<TCancelSortDialogEvent>;
  onApplySortDialog: TEventCallback<TApplySortDialogEvent>;
  onSelectRow: TEventCallback<TSelectRowEvent>;
  onSelectAllRows: TEventCallback<TSelectAllRowsEvent>;
  onSetCursorPos: TEventCallback<TSetCursorPosEvent>;
  onSort: TEventCallback<TSortEvent>;
  onToggleGroup: TEventCallback<TToggleGroupEvent>;
  onSetFilter: TOnFilter;
  onInsert: TEventCallback<TRecordsetEvent>;
  onDelete: TEventCallback<TRecordsetEvent>;
  onCancel: TEventCallback<TRecordsetEvent>;
  onSetFieldValue: TEventCallback<TRecordsetSetFieldValue>;
  saveSessionData: (sessionData?: ISessionData) => void;
}

export interface IGridRef {
  [name: string]: GDMNGrid | undefined;
}

interface ISavedGridState {
  [name: string]: IGridState;
}

export abstract class DataView<P extends IDataViewProps<R>, S, R = any> extends View<P, S, R> {
  private _gridRef: IGridRef = {};

  public abstract getDataViewKey(): string;

  public abstract getRecordSetList(): string[];

  public isDataLoaded(): boolean {
    const { data } = this.props;
    return !!(data && data.rs);
  }

  public addViewTab() {
    const { addViewTab, match } = this.props;

    addViewTab({
      caption: this.getViewCaption(),
      url: match.url,
      canClose: true,
      rs: this.getRecordSetList()
    });
  }

  public componentDidMount() {
    if (!this.isDataLoaded()) {
      this.props.attachRs(getMutex(this.getDataViewKey()));
    }

    super.componentDidMount();
  }

  public componentDidUpdate(prevProps: IDataViewProps<R>) {
    // todo
    if (this.props.loadMoreRsData) {
      if (!prevProps.erModel && this.props.erModel) {
        if (!this.isDataLoaded()) {
          this.props.attachRs(getMutex(this.getDataViewKey()));
        }
      }
      return;
    }

    const { attachRs } = this.props;
    if (!this.isDataLoaded()) {
      attachRs(getMutex(this.getDataViewKey()));
    } else {
      const { data } = this.props;
      if (data && data.rs && data.detail && data.detail.length) {


        const masterLink = data.detail[0].rs.masterLink!;
        const detailValue = masterLink.value;
        const masterValue = data.rs.size > 0 && masterLink.masterField ? data.rs.getValue(masterLink.masterField) : '';
        if (detailValue !== masterValue) {
          attachRs(getMutex(this.getDataViewKey()));
        }
      }
    }
  }

  public componentWillUnmount() {
    disposeMutex(this.getDataViewKey());

    const savedState = Object.entries(this._gridRef).reduce((p, [name, g]) => {
      if (g) {
        return { ...p, [name]: g.state };
      } else {
        return p;
      }
    }, {} as ISavedGridState);

    /**
     * TODO: Мы сохраняем в корне хранилища по имени дата вью
     * и никогда не удаляем. Надо сохранять внутри объекта формы,
     * который будет удаляться, когда будет удаляться форма.
     */
    //sessionData.setItem(this.getDataViewKey(), savedState);
    this.props.saveSessionData(savedState);
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    if (!this.isDataLoaded()) {
      return [];
    }

    const { data, match, refreshRs, history } = this.props;

    const items: ICommandBarItemProps[] = [
      {
        key: `add`,
        text: 'Add',
        iconProps: {
          iconName: 'Add'
        },
        onClick: () => history.push(`${match.url}/add`)
        //commandBarButtonAs: linkCommandBarButton(`${match.url}/add`)
      },
      {
        key: `edit`,
        text: 'Edit',
        iconProps: {
          iconName: 'Edit'
        },
        onClick: () => !!data!.rs.size && history.push(`${match.url}/edit/${data!.rs.pk2s().join('-')}`)
        //commandBarButtonAs: data!.rs.size ? linkCommandBarButton(`${match.url}/edit/${data!.rs.pk2s().join('-')}`) : undefined
      },
      {
        key: `delete`,
        text: 'Delete',
        iconProps: {
          iconName: 'Delete'
        }
      }
    ];

    if (data!.rs.status === TStatus.PARTIAL || data!.rs.status === TStatus.LOADING) {
      items.push({
        key: 'load',
        disabled: data!.rs.status === TStatus.LOADING,
        text: 'Load all',
        iconProps: {
          iconName: 'Download'
        },
        onClick: () => this._gridRef[data!.rs.name]!.loadFully(500) as any
      });
    }

    items.push({
      key: 'refresh',
      disabled: !refreshRs || (data!.rs.status === TStatus.LOADING),
      text: 'Refresh',
      iconProps: {
        iconName: 'Refresh'
      },
      onClick: () => refreshRs!(data!.rs)
    });

    return items;
  }

  public getSavedState(rs: RecordSet) {
    //const savedItem = sessionData.getItem(this.getDataViewKey());
    const savedItem = this.props.viewTab ? this.props.viewTab.sessionData : undefined;

    if (savedItem instanceof Object) {
      const savedState = savedItem as ISavedGridState;

      if (savedState[rs.name]) {
        return savedState[rs.name] as IGridState;
      }
    }

    return undefined;
  }

  public renderSettings(rs: RecordSet) {
    const {onSetFilter} = this.props;
    const filter = rs.filter && rs.filter.conditions.length ? rs.filter.conditions[0].value : '';

    return (
      <div className="GridFilter">
        <TextField
          label="Filter:"
          value={filter}
          onChange={ (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
            onSetFilter({
              rs,
              filter: newValue ? newValue : ''
            })
          }}
        />
      </div>
    );
  }

  public renderGrid(
    gridName: string,
    gcs: GridComponentState,
    rs: RecordSet,
    width: string
  ) {
    const {
      onCancelSortDialog,
      onApplySortDialog,
      onSelectRow,
      onSelectAllRows,
      onSetCursorPos,
      onSort,
      onInsert,
      onDelete,
      onCancel,
      onSetFieldValue,
      onToggleGroup,
      loadMoreRsData
    } = this.props;
    return (
      <div style={{ width }}>
        {this.renderSettings(rs)}
        <div style={{ height: 'calc(100% - 154px)' }}>
          <GDMNGrid
            {...gcs}
            rs={rs}
            loadMoreRsData={loadMoreRsData}
            onCancelSortDialog={onCancelSortDialog}
            onApplySortDialog={onApplySortDialog}
            onSelectRow={onSelectRow}
            onSelectAllRows={onSelectAllRows}
            onSetCursorPos={onSetCursorPos}
            onSort={onSort}
            onToggleGroup={onToggleGroup}
            onDelete={onDelete}
            onInsert={onInsert}
            onCancel={onCancel}
            onSetFieldValue={onSetFieldValue}
            ref={(grid: GDMNGrid) => grid && (this._gridRef[gridName] = grid)}
            savedState={this.getSavedState(rs)}
          />
        </div>
      </div>
    );
  }

  public renderMD() {
    const { data } = this.props;
    const masterRS = data!.rs;
    const detailRS = data!.detail![0].rs;
    const masterGridName = masterRS.name;
    const detailGridName = detailRS.name;

    return this.renderWide(undefined,
      <div className="ViewGridPlacement">
        {this.renderModal()}
        {this.renderGrid(masterGridName, data!.gcs, masterRS, '50%')}
        {this.renderGrid(detailGridName, data!.detail![0].gcs, detailRS, '50%')}
      </div>
    );
  }

  public renderS() {
    const { data } = this.props;
    const masterRS = data!.rs;
    const masterGridName = masterRS.name;

    return this.renderWide(undefined,
      <div className="ViewGridPlacement">
        {this.renderModal()}
        {this.renderGrid(masterGridName, data!.gcs, masterRS, '100%')}
      </div>
    );
  }

  public render() {
    if (!this.isDataLoaded()) {
      return this.renderLoading();
    }

    const { data } = this.props;

    if (data!.detail && data!.detail![0].rs) {
      if (!data!.gcs || !data!.detail![0].gcs) {
        return this.renderLoading();
      }

      return this.renderMD();
    } else {
      if (!data!.gcs) {
        return this.renderLoading();
      }

      return this.renderS();
    }
  }
}

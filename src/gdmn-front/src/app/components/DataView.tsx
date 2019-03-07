import React from 'react';
import { ICommandBarItemProps, IComponentAsProps, TextField } from 'office-ui-fabric-react';
import { RecordSet } from 'gdmn-recordset';
import {
  GDMNGrid,
  GridComponentState,
  IGridState,
  TLoadMoreRsDataEvent,
  TEventCallback,
  TApplySortDialogEvent,
  TCancelSortDialogEvent,
  TColumnMoveEvent,
  TColumnResizeEvent,
  TSelectAllRowsEvent,
  TSelectRowEvent,
  TSetCursorPosEvent,
  TSortEvent,
  TToggleGroupEvent,
  TOnFilter
} from "gdmn-grid";
import { Semaphore } from 'gdmn-internals';
import { ERModel } from 'gdmn-orm';
import { IViewProps, View } from './View';
import { disposeMutex, getMutex } from './dataViewMutexes';
import { LinkCommandBarButton } from './LinkCommandBarButton';

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
  onCancelSortDialog: TEventCallback<TCancelSortDialogEvent>;
  onApplySortDialog: TEventCallback<TApplySortDialogEvent>;
  onColumnResize: TEventCallback<TColumnResizeEvent>;
  onColumnMove: TEventCallback<TColumnMoveEvent>;
  onSelectRow: TEventCallback<TSelectRowEvent>;
  onSelectAllRows: TEventCallback<TSelectAllRowsEvent>;
  onSetCursorPos: TEventCallback<TSetCursorPosEvent>;
  onSort: TEventCallback<TSortEvent>;
  onToggleGroup: TEventCallback<TToggleGroupEvent>;
  onSetFilter: TOnFilter;
}

export interface IGridRef {
  [name: string]: GDMNGrid | undefined;
}

export abstract class DataView<P extends IDataViewProps<R>, S, R = any> extends View<P, S, R> {
  private _gridRef: IGridRef = {};

  public abstract getDataViewKey(): string;

  public abstract getRecordsetList(): string[];

  public isDataLoaded(): boolean {
    const { data } = this.props;
    return !!(data && data.rs);
  }

  public addViewTab() {
    const { addViewTab, match } = this.props;

    addViewTab({
      caption: this.getViewCaption(),
      url: match.url,
      rs: this.getRecordsetList()
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
        const detailValue = masterLink.values[0].value;
        const masterValue = data.rs.size > 0 ? data.rs.getValue(data.rs.currentRow, masterLink.values[0].fieldName) : '';
        if (detailValue !== masterValue) {
          attachRs(getMutex(this.getDataViewKey()));
        }
      }
    }
  }

  public componentWillUnmount() {
    disposeMutex(this.getDataViewKey());

    const { updateViewTab, viewTab } = this.props;

    if (viewTab) {
      const savedState = Object.entries(this._gridRef).reduce((p, [name, g]) => {
        if (g) {
          return { ...p, [name]: g.state };
        } else {
          return p;
        }
      }, {});

      updateViewTab({ ...viewTab, savedState });
    }
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    if (!this.isDataLoaded()) {
      return [];
    }

    const { data, match } = this.props;

    const btn = (link: string, supText?: string) => (props: IComponentAsProps<ICommandBarItemProps>) => {
      return <LinkCommandBarButton {...props} link={link} supText={supText} />;
    };

    return [
      {
        key: `add`,
        text: 'Add',
        iconProps: {
          iconName: 'Add'
        },
        commandBarButtonAs: btn(`${match.url}/add`)
      },
      {
        key: `edit`,
        text: 'Edit',
        iconProps: {
          iconName: 'Edit'
        },
        commandBarButtonAs: data!.rs.size ? btn(`${match.url}/edit/${data!.rs.pk2s.join('-')}`) : undefined
      },
      {
        key: `delete`,
        text: 'Delete',
        iconProps: {
          iconName: 'Delete'
        }
      }
    ];
  }

  public getSavedState(rs: RecordSet) {
    const { viewTab } = this.props;

    if (viewTab && viewTab.savedState && viewTab.savedState[rs.name]) {
      return viewTab.savedState[rs.name] as IGridState;
    }

    return undefined;
  }

  public renderModal(): JSX.Element | undefined {
    return undefined;
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
      onColumnResize,
      onColumnMove,
      onSelectRow,
      onSelectAllRows,
      onSetCursorPos,
      onSort,
      onSetFilter,
      onToggleGroup,
      loadMoreRsData
    } = this.props;
    const filter = rs.filter && rs.filter.conditions.length ? rs.filter.conditions[0].value : '';
    return (
      <div style={{ width }}>
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
        <div style={{ height: 'calc(100% - 24px)' }}>
          <GDMNGrid
            {...gcs}
            rs={rs}
            loadMoreRsData={loadMoreRsData}
            onCancelSortDialog={onCancelSortDialog}
            onApplySortDialog={onApplySortDialog}
            onColumnResize={onColumnResize}
            onColumnMove={onColumnMove}
            onSelectRow={onSelectRow}
            onSelectAllRows={onSelectAllRows}
            onSetCursorPos={onSetCursorPos}
            onSort={onSort}
            onToggleGroup={onToggleGroup}
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

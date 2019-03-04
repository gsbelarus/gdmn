import React from 'react';
import { ICommandBarItemProps, IComponentAsProps } from 'office-ui-fabric-react';
import { RecordSet, SortFields } from 'gdmn-recordset';
import { GDMNGrid, GridComponentState, IGridState, TLoadMoreRsData } from 'gdmn-grid';
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
  loadMoreRsData?: TLoadMoreRsData;
  onCancelSortDialog: (gridName: string) => void;
  onApplySortDialog: (rs: RecordSet, gridName: string, sortFields: SortFields, gridRef?: GDMNGrid) => void;
  onColumnResize: (gridName: string, columnIndex: number, newWidth: number) => void;
  onColumnMove: (gridName: string, oldIndex: number, newIndex: number) => void;
  onSelectRow: (rs: RecordSet, idx: number, selected: boolean) => void;
  onSelectAllRows: (rs: RecordSet, value: boolean) => void;
  onSetCursorPos: (rs: RecordSet, gridName: string, cursorCol: number, cursorRow: number) => void;
  onSort: (rs: RecordSet, sortFields: SortFields, gridRef?: GDMNGrid) => void;
  onToggleGroup: (rs: RecordSet, rowIdx: number) => void;
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
        const masterValue = data.rs.getValue(data.rs.currentRow, masterLink.values[0].fieldName);
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
    rs: RecordSet
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
      onToggleGroup,
      loadMoreRsData
    } = this.props;
    return (
      <GDMNGrid
        {...gcs}
        rs={rs}
        loadMoreRsData={loadMoreRsData}
        onCancelSortDialog={() => onCancelSortDialog(gridName)}
        onApplySortDialog={(sortFields: SortFields) =>
          onApplySortDialog(rs, gridName, sortFields, this._gridRef[gridName])
        }
        onColumnResize={(columnIndex: number, newWidth: number) =>
          onColumnResize(gridName, columnIndex, newWidth)
        }
        onColumnMove={(oldIndex: number, newIndex: number) => onColumnMove(gridName, oldIndex, newIndex)}
        onSelectRow={(idx: number, selected: boolean) => onSelectRow(rs, idx, selected)}
        onSelectAllRows={(value: boolean) => onSelectAllRows(rs, value)}
        onSetCursorPos={(cursorCol: number, cursorRow: number) =>
          onSetCursorPos(rs, gridName, cursorCol, cursorRow)
        }
        onSort={(rs: RecordSet, sortFields: SortFields) => onSort(rs, sortFields, this._gridRef[gridName])}
        onToggleGroup={(rowIdx: number) => onToggleGroup(rs, rowIdx)}
        ref={(grid: GDMNGrid) => grid && (this._gridRef[gridName] = grid)}
        savedState={this.getSavedState(rs)}
      />
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
        {this.renderGrid(masterGridName, data!.gcs, masterRS)}
        {this.renderGrid(detailGridName, data!.detail![0].gcs, detailRS)}
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
        {this.renderGrid(masterGridName, data!.gcs, masterRS)}
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

import { disposeMutex, getMutex } from '@src/app/components/dataViewMutexes';
import { IViewProps, View } from '@src/app/components/View';
import { Semaphore } from 'gdmn-internals';
import { ERModel } from 'gdmn-orm';
import { RecordSet } from 'gdmn-recordset';
import { ICommandBarItemProps, TextField } from 'office-ui-fabric-react';
import React, { Fragment } from 'react';

export enum DlgState {
  dsBrowse,
  dsInsert,
  dsEdit
}

export interface ISqlDataDlgViewMatchParams {
  id: string;
  rowid: string;
}

export interface ISqlDataDlgViewProps extends IViewProps<ISqlDataDlgViewMatchParams> {
  src?: RecordSet;
  rs?: RecordSet;
  erModel: ERModel;
  dlgState: DlgState;
  attachRs: (mutex?: Semaphore) => void;
  onView: (url: string) => void;
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
    const { id, rowid } = this.props.match.params;

    if (!id || ! rowid) {
      throw new Error("Invalid sql id or row id values");
    }

    return [id];
  }

  public isDataLoaded(): boolean {
    return !!this.props.rs;
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    const items = super.getCommandBarItems();

    const rowid = Number(this.props.match.params.rowid);

    const urlNext = this.props.match.url.replace(`/view/${rowid}`, `/view/${rowid + 1}`); // TODO проверять кол-во записей. Если текущая - последняя, то блокировать кнопку next
    const urlPrev = this.props.match.url.replace(`/view/${rowid}`, `/view/${rowid - 1}`); // TODO проверять кол-во записей. Если текущая - первая, то блокировать кнопку prev

    const nextItem = {
      key: 'next',
      text: 'Next',
      iconProps: {
        iconName: 'next'
      },
      onClick: () => {
        this.props.onView(urlNext);
      }
    };
    const prevItem = {
      key: 'previous',
      text: 'Previous',
      iconProps: {
        iconName: 'previous'
      },
      onClick: () => {
        this.props.onView(urlPrev);
      }
    };

    return [prevItem, nextItem, ...items];
  }

  public addViewTab() {
    const { addViewTab, match } = this.props;

    addViewTab({
      caption: this.getViewCaption(),
      url: match.url,
      rs: this.getRecordSetList()
    });
  }

  public componentDidMount() {
/*     const { rs } = this.props;
    if (!rs) {
      this.props.attachRs(getMutex(this.getDataViewKey()));
    }
 */
    super.componentDidMount();
  }

  public componentDidUpdate(prevProps: ISqlDataDlgViewProps) {
    const { attachRs } = this.props;
    if (prevProps.erModel !== this.props.erModel) {
      attachRs(getMutex(this.getDataViewKey()));
    }
  }

  public componentWillUnmount() {
    disposeMutex(this.getDataViewKey());
  }

  public render() {
    const { rs } = this.props;

    if (!rs) {
      return this.renderLoading();
    }

    const rowid = Number(this.props.match.params.rowid);

    return this.renderWide(
      undefined,
      <div className="dlgView">
        {rs.fieldDefs.map((f, idx) => (
          <Fragment key={idx}>
            <span>{f.caption}</span>
            <TextField value={this.props.dlgState === DlgState.dsEdit ? rs.getString(rowid, f.fieldName, '') : ''} />
            {/* TODO: Делать проверку типа поля и если ссылка то отображать кнопку 'Открыть запись' */}
          </Fragment>
        ))}
      </div>
    );
  }
}

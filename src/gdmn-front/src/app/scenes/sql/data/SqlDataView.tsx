import React from 'react';
import { DataView, IDataViewProps } from '@src/app/components/DataView';

export interface ISqlDataViewProps extends IDataViewProps<any> {
  run: () => void;
  onChange: (ev: any, text?: string) => void;
}

export interface ISqlDataViewState {}

export class SqlDataView extends DataView<ISqlDataViewProps, ISqlDataViewState> {
  public getDataViewKey(): string {
    return this.getRecordSetList()[0];
  }

  public getRecordSetList() {
    const requestID = this.props.match ?  this.props.match.params.id : "";

    return [requestID];
  }

  public getViewCaption(): string {
    return 'SQL data view';
  }

  public renderModal() {
    const { data } = this.props;
    return super.renderModal();
  }
}

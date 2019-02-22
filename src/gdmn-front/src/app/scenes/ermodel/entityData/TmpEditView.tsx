import React from 'react';

import { IViewProps, View } from '@src/app/components/View';

type ITmpEditViewProps = IViewProps;

class TmpEditView extends View<ITmpEditViewProps> {
  public getViewCaption(): string {
    return `${this.props.match.params.entityName} item edit`;
  }

  public render() {
    return <div>RECORDSET ROW: {this.props.match.params.currentRow}</div>;
  }
}

export { TmpEditView, ITmpEditViewProps };

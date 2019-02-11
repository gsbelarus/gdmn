import { IViewProps, View } from '@src/app/components/View';
import React from 'react';

type ITmpEditViewProps = IViewProps;

class TmpEditView extends View<ITmpEditViewProps> {

  public getViewCaption(): string {
    return this.props.match.params.entityName + '  item edit';
  }

  public render() {
    return (
      <div>EDIT VIEW</div>
    );
  }

}

export {
  TmpEditView,
  ITmpEditViewProps
};

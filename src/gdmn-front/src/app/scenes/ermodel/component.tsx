import React from 'react';
import { ICommandBarItemProps, IComponentAsProps } from 'office-ui-fabric-react';

import { DataView, IDataViewProps } from '@src/app/components/DataView';
import { LinkCommandBarButton } from '@src/app/components/LinkCommandBarButton';
import { RouteComponentProps } from 'react-router';

export interface IERModelViewProps extends IDataViewProps<any> {
  apiGetSchema: () => void;
}

export class ERModelView extends DataView<IERModelViewProps, {}, RouteComponentProps<any>> {
  public getDataViewKey() {
    return 'ermodel';
  }

  public getRecordsetList() {
    return ['entities', 'attributes'];
  }

  public getViewCaption(): string {
    return 'ER Model';
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    const { apiGetSchema, data, match } = this.props;
    const btn = (link: string, supText?: string) => (props: IComponentAsProps<ICommandBarItemProps>) => {
      return <LinkCommandBarButton {...props} link={link} supText={supText} />;
    };

    return [
      ...super.getCommandBarItems(),
      {
        key: 'loadEntity',
        text: 'Load entity',
        iconProps: {
          iconName: 'Table'
        },
        commandBarButtonAs: btn(
          this.isDataLoaded() && data!.rs.size ? `entity/${data!.rs.getString(data!.rs.currentRow, 'name')}` : `${match!.url}`
        )
      },
      {
        key: 'reloadERModel',
        text: this.isDataLoaded() ? 'Reload ERModel' : 'Load ERModel',
        iconProps: {
          iconName: 'DatabaseSync'
        },
        onClick: apiGetSchema
      }
    ];
  }
}

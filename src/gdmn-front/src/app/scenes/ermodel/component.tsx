import { ERModel } from 'gdmn-orm';
import { ICommandBarItemProps, IComponentAsProps } from 'office-ui-fabric-react';

import { DataView, IDataViewProps } from '@src/app/components/DataView';
import { LinkCommandBarButton } from '@src/app/components/LinkCommandBarButton';
import React from 'react';

export interface IERModelViewProps extends IDataViewProps<any> {
  apiGetSchema: () => void
}

export class ERModelView extends DataView<IERModelViewProps, {}> {
  public getDataViewKey() {
    return 'ermodel';
  }

  public getViewCaption(): string {
    return 'ER Model';
  }

  public componentDidMount() {
    const { updateViewTab, match } = this.props;

    if (!match || !match.url) {
      throw new Error(`Invalid view ${this.getViewCaption()}`);
    }

    updateViewTab({
      caption: this.getViewCaption(),
      url: match.url,
      rs: ['entities', 'attributes']
    });
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    const { apiGetSchema, data, match } = this.props;
    const btn = (link: string, supText?: string) => (props: IComponentAsProps<ICommandBarItemProps>) => {
      return <LinkCommandBarButton {...props} link={link} supText={supText} />;
    };

    return [...super.getCommandBarItems(),
      {
        key: 'loadEntity',
        text: 'Load entity',
        iconProps: {
          iconName: 'Table'
        },
        commandBarButtonAs: btn(this.isDataLoaded() ? `entity/${data!.rs.getString(data!.rs.currentRow, 'name')}` : `${match!.url}`)
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



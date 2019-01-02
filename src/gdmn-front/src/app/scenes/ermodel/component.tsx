import { ERModel } from 'gdmn-orm';
import { ICommandBarItemProps, IComponentAsProps } from 'office-ui-fabric-react';

import { DataView, IDataViewProps } from '@src/app/components/DataView';
import { LinkCommandBarButton } from '@src/app/components/LinkCommandBarButton';
import React from 'react';

export interface IERModelViewProps extends IDataViewProps<any> {
  erModel?: ERModel,
  apiGetSchema: () => void
}

export class ERModelView extends DataView<IERModelViewProps, {}> {
  public getViewCaption(): string {
    return 'ER Model';
  }

  public componentDidMount() {
    const { addToTabList, match } = this.props;

    if (!match || !match.url) {
      throw new Error(`Invalid view ${this.getViewCaption()}`);
    }

    addToTabList({
      caption: this.getViewCaption(),
      url: match.url,
      loading: false,
      rs: ['entities', 'attributes']
    });
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    const { apiGetSchema, data, match } = this.props;
    const btn = (link: string, supText?: string) => (props: IComponentAsProps<ICommandBarItemProps>) => {
      return <LinkCommandBarButton {...props} link={link} supText={supText} />;
    };

    return [
      {
        key: 'loadEntity',
        text: 'Load entity',
        iconProps: {
          iconName: 'Table'
        },
        commandBarButtonAs: btn(data ? `entity/Folder` : `${match!.url}`)
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

/*

  private getItems = (): ICommandBarItemProps[] => {
    const { erModel, match, apiGetSchema } = this.props;
    const btn = (link: string, supText?: string) => (props: IComponentAsProps<ICommandBarItemProps>) => (
      <ContextualMenuItemWithLink {...props} link={link} supText={supText} />
    );

    return [
      {
        key: 'GetERModel',
        text: Object.keys(erModel.entities).length
          ? `Reload ERModel (${Object.keys(erModel.entities).length})`
          : `Load ERModel`,
        onClick: apiGetSchema
      }
    ];
  };

*/

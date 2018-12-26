import { ERModel } from 'gdmn-orm';
import { ICommandBarItemProps, IComponentAsProps } from 'office-ui-fabric-react';

import { DataView, IDataViewProps } from '@src/app/components/DataView';
import { LinkCommandBarButton } from '@src/app/components/LinkCommandBarButton';
import React from 'react';

export interface IERModelViewProps extends IDataViewProps<any> {
  erModel?: ERModel,
  apiGetSchema: () => void,
  apiLoadEntityData: (entity: string) => void
}

export class ERModelView extends DataView<IERModelViewProps, {}> {
  public getCommandBarItems(): ICommandBarItemProps[] {
    const { apiGetSchema, apiLoadEntityData, data, history, match } = this.props;
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
        commandBarButtonAs: btn(data ? `${match!.url}/entity/Folder` : `${match!.url}`)

        /*
        onClick: () => {
          if (data && data.rs) {
            history.push(`/entity/${data.rs.getString(data.rs.currentRow, 'name')}`)
            //apiLoadEntityData(data.rs.getString(data.rs.currentRow, 'name'));
          }
        }
        */
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

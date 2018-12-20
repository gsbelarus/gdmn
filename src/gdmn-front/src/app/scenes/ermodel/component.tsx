import { ERModel } from 'gdmn-orm';
import { ICommandBarItemProps } from 'office-ui-fabric-react';

import { DataView, IDataViewProps } from '@src/app/components/DataView';

export interface IERModelViewProps extends IDataViewProps {
  erModel?: ERModel
  apiGetSchema: () => void
}

export class ERModelView extends DataView<IERModelViewProps, {}> {
  public getCommandBarItems(): ICommandBarItemProps[] {
    const { apiGetSchema } = this.props;

    return [
      {
        key: 'loadEntity',
        text: 'Load entity',
        iconProps: {
          iconName: 'Table'
        }
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

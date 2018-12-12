import { DataView, IDataViewProps } from '../components/DataView';
import { ERModel } from 'gdmn-orm';
import { ICommandBarItemProps } from 'office-ui-fabric-react';

export interface IERModelViewProps extends IDataViewProps {
  erModel?: ERModel;
};

export class ERModelView extends DataView<IERModelViewProps, {}> {
  public getCommandBarItems(): ICommandBarItemProps[] {
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
        text: 'Reload ER Model',
        iconProps: {
          iconName: 'DatabaseSync'
        }
      }
    ];
  };
};

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

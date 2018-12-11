import { DataView, IDataViewProps } from '../components/DataView';
import { ERModel } from 'gdmn-orm';

export interface IERModelViewProps extends IDataViewProps {
  erModel?: ERModel;
};

export class ERModelView extends DataView<IERModelViewProps, {}> { };

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

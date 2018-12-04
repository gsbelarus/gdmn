import React from 'react';
import { Button } from 'office-ui-fabric-react';
import { View } from '../../components/View';

export interface IERModelViewProps {
};

export class ERModelView extends View<IERModelViewProps, {}> {
  public render() {
    return this.renderOneColumn(
      <Button text="LOAD ER MODEL" />
    );
  }
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

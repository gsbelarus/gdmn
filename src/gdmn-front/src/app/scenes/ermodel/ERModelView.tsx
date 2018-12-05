import React from 'react';
import { DefaultButton } from 'office-ui-fabric-react';
import { View } from '../components/View';
import { ERModel } from 'gdmn-orm';
import { GDMNGrid } from 'gdmn-grid';
import { List } from 'immutable';
import { RecordSet, TFieldType } from 'gdmn-recordset';

export interface IERModelViewProps {
  erModel?: ERModel;
  entities?: RecordSet;
  fillEntities: (erModel: ERModel) => void;
};

export interface IERModelViewState {
};

export class ERModelView extends View<IERModelViewProps, {}> {
  public state: IERModelViewState = { };

  private fillRecordSets() {
    const { erModel, entities, fillEntities } = this.props;

    if (!erModel) {
      return;
    }

    if (!entities) {
      fillEntities(erModel);
    }
  }

  public componentDidMount() {
    this.fillRecordSets();
  }

  public componentDidUpdate() {
    this.fillRecordSets();
  }

  public render() {
    const { erModel, entities } = this.props;

    return this.renderWide(
      <>
        {entities && `RecordSet: ${entities.size}`}
        {erModel && `ERModel: ${Object.entries(erModel.entities).length}`}
        <DefaultButton text="LOAD ER MODEL" />
      </>
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

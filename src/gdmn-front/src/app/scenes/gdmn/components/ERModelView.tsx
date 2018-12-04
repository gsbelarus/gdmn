import React from 'react';
import { DefaultButton } from 'office-ui-fabric-react';
import { View } from '../../components/View';
import { ERModel } from 'gdmn-orm';
import { GDMNGrid } from 'gdmn-grid';
import { List } from 'immutable';
import { RecordSet, TFieldType } from 'gdmn-recordset';

export interface IERModelViewProps {
  erModel?: ERModel;
};

export interface IERModelViewState {
  entities?: RecordSet;
  attributes?: RecordSet;
};

export class ERModelView extends View<IERModelViewProps, {}> {
  public state: IERModelViewState = { };

  constructor(props: IERModelViewProps) {
    super(props);

    const { erModel } = this.props;

    if (erModel) {
      this.state.entities = RecordSet.createWithData(
        'entities',
        [
          {
            fieldName: 'name',
            dataType: TFieldType.String,
            caption: 'Entity name'
          },
          {
            fieldName: 'description',
            dataType: TFieldType.String,
            caption: 'Description'
          },
        ],
        List(Object.entries(erModel.entities).map( ([name, ent]) => ({
          name,
          description: ent.lName.ru
            ? ent.lName.ru.name
            : name
        })))
      );
    }
  }

  public render() {
    const { erModel } = this.props;
    const { entities } = this.state;

    return this.renderWide(
      <>
        {entities && `Loaded: ${entities.size}`}
        {erModel && `Loaded: ${Object.entries(erModel.entities).length}`}
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

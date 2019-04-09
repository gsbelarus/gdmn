import React from 'react';
import { ICommandBarItemProps, IComponentAsProps } from 'office-ui-fabric-react';
import { DataView, IDataViewProps } from '@src/app/components/DataView';
import { LinkCommandBarButton } from '@src/app/components/LinkCommandBarButton';
import { RouteComponentProps } from 'react-router';
import { InspectorForm } from '@src/app/components/InspectorForm';

export interface IERModelViewProps extends IDataViewProps<any> {
  apiGetSchema: () => void;
}

export interface IERModelViewState {
  showInspector: boolean;
}

export class ERModelView extends DataView<IERModelViewProps, IERModelViewState, RouteComponentProps<any>> {
  public state: IERModelViewState = {
    showInspector: false
  }

  public getDataViewKey() {
    return 'ermodel';
  }

  public getRecordSetList() {
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

    const items = super.getCommandBarItems();
    items
      .filter((item) => item.key === "add" || item.key === "edit" || item.key === "delete")
      .forEach((item) => item.disabled = true);
    return [
      ...items,
      {
        key: 'loadEntity',
        text: 'Load entity',
        iconProps: {
          iconName: 'Table'
        },
        commandBarButtonAs: btn(
          this.isDataLoaded() && data!.rs.size ? `entity/${data!.rs.getString('name')}` : `${match!.url}`
        )
      },
      {
        key: 'reloadERModel',
        text: this.isDataLoaded() ? 'Reload ERModel' : 'Load ERModel',
        iconProps: {
          iconName: 'DatabaseSync'
        },
        onClick: apiGetSchema
      },
      {
        key: 'Inspector',
        text: 'Show Inspector',
        iconProps: {
          iconName: 'FileCode'
        },
        onClick: () => this.setState({ showInspector: true })
      }
    ];
  }

  public renderModal(): JSX.Element | undefined {
    const { erModel, data } = this.props;
    const { showInspector } = this.state;

    if (showInspector && erModel && data && data!.rs && data!.rs!.size) {
      const entityName = data!.rs.getString('name');
      const entity = erModel!.entities[entityName];
      if (entity) {
        return (
          <InspectorForm
            entity={entity}
            onDismiss={ () => this.setState({ showInspector: false }) }
          />
        );
      }
    }

    return super.renderModal();
  }

}

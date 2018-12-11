import React from 'react';
import { DefaultButton } from 'office-ui-fabric-react';
import { View } from '../components/View';
import { ERModel } from 'gdmn-orm';
import { GDMNGrid, IColumn, GetGridRef } from 'gdmn-grid';
import { RecordSet } from 'gdmn-recordset';
import { ConnectedGrid } from '../components/GridContainer';

export interface IERModelViewProps {
  erModel?: ERModel;
  entitiesRs?: RecordSet;
  attributesRs?: RecordSet;
  fillEntities: (erModel: ERModel) => void;
  connectGrid: (name: string, rs: RecordSet, columns: IColumn[] | undefined, getGridRef: GetGridRef) => ConnectedGrid;
}

export interface IERModelViewState {
  entitiesGrid?: ConnectedGrid;
  attributesGrid?: ConnectedGrid;
}

export class ERModelView extends View<IERModelViewProps, {}> {
  private _refEntitiesGrid?: GDMNGrid;
  private _refAttributesGrid?: GDMNGrid;

  public state: IERModelViewState = {};

  private fillRecordSets() {
    const { erModel, entitiesRs, attributesRs, fillEntities } = this.props;

    if (!erModel || !Object.keys(erModel.entities).length) {
      return;
    }

    if (!entitiesRs || !attributesRs) {
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
    const { erModel, entitiesRs, attributesRs, connectGrid } = this.props;
    const { entitiesGrid: EntitiesGrid, attributesGrid: AttributesGrid } = this.state;

    return this.renderWide(
      <>
        {erModel && `ERModel: ${Object.entries(erModel.entities).length}`}
        {entitiesRs && `RecordSet: ${entitiesRs.size}`}
        {entitiesRs && attributesRs && (
          <DefaultButton
            text="Load grid..."
            onClick={() => {
              this.setState({
                entitiesGrid: connectGrid('entities', entitiesRs, undefined, () => {
                  const res = this._refEntitiesGrid;

                  if (!res) {
                    throw new Error(`Grid ref is not set`);
                  }

                  return res;
                }),
                attributesGrid: connectGrid('attributes', attributesRs, undefined, () => {
                  const res = this._refAttributesGrid;

                  if (!res) {
                    throw new Error(`Grid ref is not set`);
                  }

                  return res;
                })
              });
            }}
          />
        )}
        {EntitiesGrid && AttributesGrid && (
          <div className="ViewGridPlacement">
            <EntitiesGrid
              ref={(grid: any) => grid && (this._refEntitiesGrid = grid.getWrappedInstance())}
              rs={entitiesRs!}
            />
            <AttributesGrid
              ref={(grid: any) => grid && (this._refAttributesGrid = grid.getWrappedInstance())}
              rs={attributesRs!}
            />
          </div>
        )}
      </>
    );
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

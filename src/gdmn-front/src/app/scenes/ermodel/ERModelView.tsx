import React from 'react';
import { DefaultButton } from 'office-ui-fabric-react';
import { View } from '../components/View';
import { ERModel } from 'gdmn-orm';
import { GDMNGrid, IColumn, GetGridRef } from 'gdmn-grid';
import { RecordSet } from 'gdmn-recordset';
import { ConnectedGrid } from '../components/GridContainer';

export interface IERModelViewProps {
  erModel?: ERModel,
  entitiesRs?: RecordSet,
  fillEntities: (erModel: ERModel) => void,
  connectGrid: (name: string, rs: RecordSet, columns: IColumn[] | undefined, getGridRef: GetGridRef) => ConnectedGrid
};

export interface IERModelViewState {
  entitiesGrid?: ConnectedGrid;
};

export class ERModelView extends View<IERModelViewProps, {}> {
  private _refEntitiesGrid?: GDMNGrid;

  public state: IERModelViewState = {};

  private fillRecordSets() {
    const { erModel, entitiesRs, fillEntities } = this.props;

    if (!erModel) {
      return;
    }

    if (!entitiesRs) {
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
    const { erModel, entitiesRs, connectGrid } = this.props;
    const { entitiesGrid: EntitiesGrid } = this.state;

    return this.renderWide(
      <>
        {erModel && `ERModel: ${Object.entries(erModel.entities).length}`}
        {entitiesRs && `RecordSet: ${entitiesRs.size}`}
        {entitiesRs && <DefaultButton text="Load grid..." onClick={ () => {
          this.setState({ entitiesGrid: connectGrid('entities', entitiesRs, undefined, () => {
            const res = this._refEntitiesGrid;

            if (!res) {
              throw new Error(`Grid ref is not set`);
            }

            return res;
          }) });
        }} />}
        {EntitiesGrid &&
          <div className="ViewGridPlacement">
            <EntitiesGrid ref={ (grid: any) => grid && (this._refEntitiesGrid = grid.getWrappedInstance()) } rs={entitiesRs!} />
          </div>
        }
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

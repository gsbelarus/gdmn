import { IState } from '@src/app/store/reducer';
import { connect } from 'react-redux';
import { EntityLink, EntityQuery, EntityQueryField, ERModel, ScalarAttribute } from 'gdmn-orm';
import { RecordSetAction } from 'gdmn-recordset';
import { GridAction } from 'gdmn-grid';
import { ThunkDispatch } from 'redux-thunk';
import { TTaskActionNames } from '@gdmn/server-api';

import { TGdmnActions } from '../../gdmn/actions';
import { EntityDataView, IEntityDataViewProps } from './EntityDataView';
import { bindDataViewDispatch } from '@src/app/components/bindDataView';
import { apiService } from '@src/app/services/apiService';

export const EntityDataViewContainer = connect(
  (state: IState, ownProps: IEntityDataViewProps) => {
    const entityName = ownProps.match ? ownProps.match.params.entityName : '';
    return {
      data:
        {
          rs: state.recordSet[entityName],
          gcs: state.grid[entityName]
        },
      erModel: state.gdmnState.erModel
    };
  },

  (dispatch: ThunkDispatch<IState, never, GridAction | RecordSetAction | TGdmnActions>, ownProps: IEntityDataViewProps) => ({
    ...bindDataViewDispatch(dispatch),
    loadFromERModel: (erModel: ERModel) => {

      const entityName = ownProps.match ? ownProps.match.params.entityName : '';

      console.log('LOADING ' + entityName);

      const entity = erModel.entities['Folder'];

      if (!entity) return;

      const q = new EntityQuery(new EntityLink(
        entity,
        'z',
        Object.values(entity.attributes).filter( attr => attr instanceof ScalarAttribute ).map( attr => new EntityQueryField(attr) )
      ));

      apiService
        .getData({
          payload: {
            action: TTaskActionNames.QUERY,
            payload: q.inspect()
          }
        })
        .subscribe( value => {
          if (value.error) {
            console.log(value.error.message);
          } else if (!!value.payload.result) {
            console.log('QUERY response result: ', JSON.stringify(value.payload.result.data));
          }
        });
    }
  }),

  (stateProps, dispatchProps) => {
    const { erModel } = stateProps;
    const { loadFromERModel } = dispatchProps;
    return {
      ...stateProps,
      ...dispatchProps,
      loadData: () => {
        if (erModel && Object.entries(erModel.entities).length) {
          loadFromERModel(erModel);
        }
      }
    }
  }
)(EntityDataView);


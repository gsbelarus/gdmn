import { IState } from '@src/app/store/reducer';
import { connect } from 'react-redux';
import { ERModel, EntityQuery, EntityLink, EntityQueryField, ScalarAttribute } from 'gdmn-orm';
import { RecordSetAction } from 'gdmn-recordset';
import { GridAction } from 'gdmn-grid';
import { ThunkDispatch } from 'redux-thunk';
import { connectDataViewDispatch } from '../components/connectDataView';
import { EntityDataView } from './EntityDataView';
import { TTaskActionNames } from '@gdmn/server-api';
import { apiService } from '@src/app/services/apiService';
import { TGdmnActions } from '../gdmn/actions';

export const getEntityDataViewContainer = (entityName: string) => connect(
  (state: IState) => ({
    data:
      {
        rs: state.recordSet[entityName],
        gcs: state.grid[entityName]
      },
    erModel: state.gdmnState.erModel
  }),

  (dispatch: ThunkDispatch<IState, never, GridAction | RecordSetAction | TGdmnActions>) => ({
    ...connectDataViewDispatch(dispatch),
    loadFromERModel: (erModel: ERModel) => {

        const entity = erModel.entities[entityName];
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
              console.log('QUERY response result: ', value.payload.result);
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


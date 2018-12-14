import { ERModelView } from './ERModelView';
import { IState } from '@src/app/store/reducer';
import { connect } from 'react-redux';
import { ERModel } from 'gdmn-orm';
import { RecordSet, TFieldType, createRecordSet, RecordSetAction } from 'gdmn-recordset';
import { createGrid, GridAction } from 'gdmn-grid';
import { List } from 'immutable';
import { ThunkDispatch } from 'redux-thunk';
import { connectDataViewDispatch } from '../components/connectDataView';
import { GdmnPubSubApi, GdmnPubSubError } from '@src/app/services/GdmnPubSubApi';
import { EntityDataView } from './EntityDataView';
import { TTaskActionNames } from '@gdmn/server-api';

/*
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

        GdmnPubSubApi
          .getData({
            payload: {
              action: TTaskActionNames.QUERY,
              payload: action.payload
            }
          })
          .subscribe(value => {
            if (value.error) {
              dispatch(rootActions.onError(new Error(value.error.message)));
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
*/


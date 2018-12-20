import { gdmnActions, TGdmnActions } from '@src/app/scenes/gdmn/actions';
import { ERModel } from 'gdmn-orm';
import { getType } from 'typesafe-actions';
import { TGdmnViewStateProps } from '@src/app/scenes/gdmn/component';

type TGdmnState = TGdmnViewStateProps;

const initialState: TGdmnState = {
  erModel: new ERModel(),
  loading: false
};

function reducer(state: TGdmnState = initialState, action: TGdmnActions) {
  switch (action.type) {
    case getType(gdmnActions.setSchema): {
      return {
        ...state,
        erModel: action.payload
      };
    }
    case getType(gdmnActions.setLoading): {
      return {
        ...state,
        loading: action.payload.loading,
        loadingMessage: action.payload.message
      };
    }
    default:
      return state;
  }
}

export { reducer, TGdmnState };

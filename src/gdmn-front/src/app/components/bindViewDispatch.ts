import { ThunkDispatch } from 'redux-thunk';
import { IState } from '@src/app/store/reducer';
import { IViewTab } from '../scenes/gdmn/types';
import { gdmnActions, TGdmnActions } from '../scenes/gdmn/actions';

export const bindViewDispatch = (dispatch: ThunkDispatch<IState, never, TGdmnActions>) => ({
  addToTabList: (viewTab: IViewTab) => {
    dispatch(gdmnActions.updateViewTab(viewTab));
  }
});

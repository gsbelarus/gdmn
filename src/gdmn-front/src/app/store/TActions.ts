import { ThunkAction } from 'redux-thunk';

import { TRootActions } from '@src/app/scenes/root/actions';
import { TAuthActions } from '@src/app/scenes/auth/actions';
import { TGdmnActions } from '@src/app/scenes/gdmn/actions';
import { IState, TRsMetaActions } from '@src/app/store/reducer';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';

type TActions = TAuthActions | TRootActions | TGdmnActions | TRsMetaActions;
type TThunkAction = ThunkAction<void, IState, { apiService: GdmnPubSubApi }, TActions>;

export { TActions, TThunkAction };

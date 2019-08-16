import { ThunkAction } from 'redux-thunk';
import { TRootActions } from '@src/app/scenes/root/actions';
import { TAuthActions } from '@src/app/scenes/auth/actions';
import { GdmnAction } from '@src/app/scenes/gdmn/actions';
import { IState } from '@src/app/store/reducer';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';
import { TRsMetaActions } from './rsmeta';

export type TActions = TAuthActions | TRootActions | GdmnAction | TRsMetaActions;
export type TThunkAction = ThunkAction<void, IState, { apiService: GdmnPubSubApi }, TActions>;


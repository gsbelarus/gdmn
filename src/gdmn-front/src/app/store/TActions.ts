import { TRootActions } from '@src/app/scenes/root/actions';
import { TAuthActions } from '@src/app/scenes/auth/actions';
import { TGdmnActions } from '@src/app/scenes/gdmn/actions';
// import { TDataStoresActions } from '@src/app/scenes/datastores/actions';

type TActions =
  // | TDataStoresActions
  TAuthActions | TRootActions | TGdmnActions;

export { TActions };

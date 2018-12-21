import { TRootActions } from '@src/app/scenes/root/actions';
import { TAuthActions } from '@src/app/scenes/auth/actions';
import { TGdmnActions } from '@src/app/scenes/gdmn/actions';

type TActions = TAuthActions | TRootActions | TGdmnActions;

export { TActions };

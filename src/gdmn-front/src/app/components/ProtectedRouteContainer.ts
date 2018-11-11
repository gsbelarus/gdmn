import { connect } from 'react-redux';
import { IProtectedRouteProps, IProtectedRouteStateProps, ProtectedRoute } from '@gdmn/client-core';
import { TUserRoleType } from '@gdmn/server-api';

import { selectAuthState } from '@src/app/store/selectors';
import { IState } from '@src/app/store/reducer';

const ProtectedRouteContainer = connect(
  (state: IState, ownProps: IProtectedRouteProps): IProtectedRouteStateProps => ({
    userRole: !!selectAuthState(state).accessTokenPayload
      ? selectAuthState(state).accessTokenPayload!.role || TUserRoleType.ANONYM
      : TUserRoleType.ANONYM,
    authenticated: selectAuthState(state).authenticated,
    defaultAnonymPath: '/spa/gdmn/auth/signIn', // TODO
    defaultUserPath: '/spa/gdmn' // TODO
  })
)(ProtectedRoute);

export { ProtectedRouteContainer };

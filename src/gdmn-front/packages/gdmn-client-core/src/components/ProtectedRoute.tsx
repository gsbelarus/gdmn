import React, { FC } from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { TUserRoleType } from '@gdmn/server-api';

export const enum RouteAccessLevelType {
  PUBLIC,
  PRIVATE_ANONYM,
  PROTECTED_USER,
  PROTECTED_ADMIN,
  PROTECTED_DEVELOPER
};

/**
 * PUBLIC: any role
 * PROTECTED: role >=
 * PRIVATE: role =
 */
const routeAccessLevels = {
  [RouteAccessLevelType.PUBLIC]: [
    TUserRoleType.ANONYM,
    TUserRoleType.USER,
    TUserRoleType.ADMIN,
    TUserRoleType.DEVELOPER
  ],
  [RouteAccessLevelType.PRIVATE_ANONYM]: [TUserRoleType.ANONYM],
  [RouteAccessLevelType.PROTECTED_USER]: [TUserRoleType.USER, TUserRoleType.ADMIN, TUserRoleType.DEVELOPER],
  [RouteAccessLevelType.PROTECTED_ADMIN]: [TUserRoleType.ADMIN, TUserRoleType.DEVELOPER],
  [RouteAccessLevelType.PROTECTED_DEVELOPER]: [TUserRoleType.DEVELOPER]
}; // TODO: bitMask

function checkAccess(routeAccessLevel: RouteAccessLevelType, userRole: TUserRoleType) {
  return routeAccessLevels[routeAccessLevel].includes(userRole);
};

export interface IProtectedRouteStateProps {
  userRole?: TUserRoleType;
  authenticated?: boolean;
  defaultAnonymPath?: string;
  defaultUserPath?: string;
};

// interface IProtectedRouteActionsProps {
//   onNotAuthorizedAccess: (location: string) => void;
//   onAccessDenied: (location: string) => void;
// }

export interface IProtectedRouteProps extends RouteProps, IProtectedRouteStateProps {
  // , IProtectedRouteActionsProps
  accessLevel: RouteAccessLevelType;
};

export const ProtectedRoute: FC<IProtectedRouteProps> = ({
  accessLevel,
  defaultAnonymPath,
  defaultUserPath,
  userRole,
  authenticated,
  // onNotAuthorizedAccess,
  // onAccessDenied,
  component: Component,
  ...routeProps
}) => {
  if (!Component) return null; // TODO

  return (
    <Route
      {...routeProps}
      render={props => {
        if (!checkAccess(accessLevel, userRole!)) {
          if (!authenticated) {
            // onNotAuthorizedAccess(props.location.pathname);
            return (
              <Redirect
                to={{
                  pathname: defaultAnonymPath,
                  state: { from: props.location.pathname }
                }}
              />
            );
          }
          // onAccessDenied(props.location.pathname); // dispatch({ type:'ON_ERROR', payload: new Error('Нет прав доступа'), error: true });
          return (
            <Redirect
              to={{
                pathname: defaultUserPath,
                state: { from: props.location.pathname }
              }}
            />
          );
        }

        return <Component {...props} />;
      }}
    />
  );
};
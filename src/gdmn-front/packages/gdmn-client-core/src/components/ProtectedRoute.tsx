import React, { SFC } from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

import {UserRoleType} from '../services/Auth';


const enum RouteAccessLevelType {
  PUBLIC,
  PRIVATE_ANONYM,
  PROTECTED_USER,
  PROTECTED_ADMIN,
  PROTECTED_DEVELOPER
}

/**
 * PUBLIC: any role
 * PROTECTED: role >=
 * PRIVATE: role =
 */
const routeAccessLevels = {
  [RouteAccessLevelType.PUBLIC]: [UserRoleType.ANONYM, UserRoleType.USER, UserRoleType.ADMIN, UserRoleType.DEVELOPER],
  [RouteAccessLevelType.PRIVATE_ANONYM]: [UserRoleType.ANONYM],
  [RouteAccessLevelType.PROTECTED_USER]: [UserRoleType.USER, UserRoleType.ADMIN, UserRoleType.DEVELOPER],
  [RouteAccessLevelType.PROTECTED_ADMIN]: [UserRoleType.ADMIN, UserRoleType.DEVELOPER],
  [RouteAccessLevelType.PROTECTED_DEVELOPER]: [UserRoleType.DEVELOPER]
}; // TODO: bitMask

function checkAccess(routeAccessLevel: RouteAccessLevelType, userRole: UserRoleType) {
  return routeAccessLevels[routeAccessLevel].includes(userRole);
}

interface IProtectedRouteStateProps {
  userRole?: UserRoleType;
  authenticated?: boolean;
  defaultAnonymPath?: string;
  defaultUserPath?: string;
}

// interface IProtectedRouteActionsProps {
//   onNotAuthorizedAccess: (location: string) => void;
//   onAccessDenied: (location: string) => void;
// }

interface IProtectedRouteProps extends RouteProps, IProtectedRouteStateProps {
  // , IProtectedRouteActionsProps
  accessLevel: RouteAccessLevelType;
}

const ProtectedRoute: SFC<IProtectedRouteProps> = ({
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
          // onAccessDenied(props.location.pathname);
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

export { ProtectedRoute, IProtectedRouteProps, IProtectedRouteStateProps, RouteAccessLevelType };

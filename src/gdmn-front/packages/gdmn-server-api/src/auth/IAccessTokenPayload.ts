import { IJwtTokenPayload } from './IJwtTokenPayload';

const enum TUserRoleType {
  ANONYM = 0,
  USER = 1,
  ADMIN = 2,
  DEVELOPER = 3
}

interface IAccessTokenPayload extends IJwtTokenPayload {
  id?: number; // user-id
  role?: TUserRoleType; // user-role
}

export { IAccessTokenPayload, TUserRoleType };

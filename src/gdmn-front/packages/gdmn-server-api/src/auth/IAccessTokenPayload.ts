import { IJwtTokenPayload } from './IJwtTokenPayload';

export const enum TUserRoleType {
  ANONYM = 0,
  USER = 1,
  ADMIN = 2,
  DEVELOPER = 3
}

export interface IAccessTokenPayload extends IJwtTokenPayload {
  id?: number; // user-id
  role?: TUserRoleType; // user-role
}

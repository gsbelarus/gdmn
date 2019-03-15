import { IJwtTokenPayload } from './IJwtTokenPayload';

export interface IRefreshTokenPayload extends IJwtTokenPayload {
  [t: string]: any; // todo
}

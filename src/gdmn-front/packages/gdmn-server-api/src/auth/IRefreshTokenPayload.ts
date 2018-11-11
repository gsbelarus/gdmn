import { IJwtTokenPayload } from './IJwtTokenPayload';

interface IRefreshTokenPayload extends IJwtTokenPayload {
  [t: string]: any; // todo
}

export { IRefreshTokenPayload };

import { IJwtToken } from './IJwtToken';

interface IRefreshToken extends IJwtToken {
  [t: string]: any; // todo
}

export { IRefreshToken };

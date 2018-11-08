import jwtDecode from 'jwt-decode';
import {IAccessToken, IRefreshToken, IJwtToken} from '@gdmn/server-api';

import { WebStorage } from './WebStorage';

const enum UserRoleType {
  ANONYM,
  USER,
  ADMIN,
  DEVELOPER
}

class Auth {
  public static ACCESS_TOKEN_MIN_EXPIRES_PT = 0.2;
  public static ACCESS_TOKEN_STORAGE_KEY = 'access_token';
  public static REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';

  private webStorage: WebStorage;

  constructor(webStorage: WebStorage) {
    this.webStorage = webStorage;
  }

  // public

  public async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    await this.webStorage.set(Auth.ACCESS_TOKEN_STORAGE_KEY, accessToken);
    await this.webStorage.set(Auth.REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }

  public async removeTokens(): Promise<void> {
    await this.webStorage.remove(Auth.ACCESS_TOKEN_STORAGE_KEY);
    await this.webStorage.remove(Auth.REFRESH_TOKEN_STORAGE_KEY);
  }

  public async getAccessToken(): Promise<string> {
    return this.webStorage.get(Auth.ACCESS_TOKEN_STORAGE_KEY);
  }

  public async getRefreshToken(): Promise<string> {
    return this.webStorage.get(Auth.REFRESH_TOKEN_STORAGE_KEY);
  }

  public async getDecodedAccessToken(): Promise<IAccessToken> {
    return Auth.decodeToken(await this.getAccessToken());
  }

  public async getDecodedRefreshToken(): Promise<IRefreshToken> {
    return Auth.decodeToken(await this.getRefreshToken());
  }

  public async isAuthenticated(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    const refreshToken = await this.getAccessToken();
    return accessToken !== null && refreshToken !== null;
  }

  public async isFreshAuth(): Promise<boolean> {
    const accessToken = await this.getDecodedAccessToken(); // TODO from state
    console.log(new Date(accessToken.iat * 1000));
    console.log(new Date(accessToken.exp * 1000));
    console.log('is fresh: ' + Auth.isFreshToken(accessToken));
    return Auth.isFreshToken(accessToken);
  }

  public static decodeToken(token: string): IJwtToken {
    return jwtDecode<IJwtToken>(token);
  }

  public static isExpiredToken(token: IJwtToken): boolean {
    return Auth.getExpiredTokenTime(token) > token.exp;
  }

  /**
   * no need refresh token
   */
  public static isFreshToken(token: IJwtToken): boolean {
    if (Auth.isExpiredToken(token)) return false; // session has expired - login in again

    console.log(
      new Date(
        (Auth.getExpiredTokenTime(token) +
          (Auth.getExpiredTokenTime(token) - token.iat) * Auth.ACCESS_TOKEN_MIN_EXPIRES_PT) *
          1000
      )
    );

    return (
      Auth.getExpiredTokenTime(token) +
        (Auth.getExpiredTokenTime(token) - token.iat) * Auth.ACCESS_TOKEN_MIN_EXPIRES_PT <
      token.exp
    );
  }

  private static getExpiredTokenTime(token: IJwtToken): number {
    const timeNow = +new Date() / 1000; // now in seconds
    // return timeNow - token.iat;

    return timeNow;
  }
}

export { Auth, UserRoleType };

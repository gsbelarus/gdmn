import {IJwtToken} from "./IJwtToken";

interface IAccessToken extends IJwtToken {
  id?: number;
  roles?: string[];
}

export { IAccessToken };

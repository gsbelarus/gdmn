interface ISessionData {
  [name: string]: any;
};

const _sessionData: ISessionData = {};

export const sessionData = {
  getItem: (key: string): any => {
    return _sessionData[key];
  },

  setItem: (key: string, data: any) => {
    _sessionData[key] = data;
  },

  removeItem: (key: string) => {
    delete _sessionData[key];
  }
};
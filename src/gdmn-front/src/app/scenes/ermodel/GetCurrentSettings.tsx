import { IUserColumnsSettingsEnvelope, IUserColumnsSettings } from "gdmn-grid/dist/definitions/types";

interface ISettingParams {
  type: string;
  objectID: string;
  userID?: string;
  userGroupsIDs?: string[];
  appID?: string;
  organizationID?: string;
  mediaQuery?: string;
};

interface ISettingData extends ISettingParams {
  data: any;
};

interface ISettingEnvelope extends ISettingData {
  _changed: Date;
  _accessed: Date;
};

//type QuerySettings = (params: ISettingParams[]) => ISettingData[];
function getQuerySettings(params: ISettingParams): ISettingEnvelope[] | undefined {
  setTimeout(() => {}, 5000);
  return  [{
      type: 'grid',
      objectID: 'USR$TEST',
      _changed: new Date('2019.09.21'),
      _accessed: new Date('2019.09.21'),
      userGroupsIDs: ['group1'],
      data: {F$2: {dateFormat: "dd.mm.yy", width: 200}, F$4: {caption: ["55555"], hidden: true}}
    },
    {
      type: 'grid',
      objectID: 'USR$TEST',
      _changed: new Date('2019.09.20'),
      _accessed: new Date('2019.09.20'),
      userID: 'user1',
      data: {F$2: {dateFormat: "dd.mm.yyyy", width: 200}, F$7: {width: 200}}
    },
    {
      type: 'grid',
      objectID: 'entities',
      _changed: new Date('2019.09.21'),
      _accessed: new Date('2019.09.21'),
      userGroupsIDs: ['group1'],
      data: {name: {width: 200}, description: {caption: ["Тест"]}}
    },
    {
      type: 'grid',
      objectID: 'attributes',
      _changed: new Date('2019.09.26'),
      _accessed: new Date('2019.09.20'),
      userID: 'user1',
      data: {name: {width: 300}, description: {caption: ["Тест1"]}}
    }
  ]
}

function getMergedSettings(params: ISettingParams): ISettingEnvelope | undefined {
  const querySettings = getQuerySettings(params);

  if (querySettings) {
    // return params.map( p => {
      const querySetting = querySettings.filter(f => f.objectID === params.objectID);
      const maxChangedDate = querySetting.sort((a, b) => a._changed > b._changed ? -1 : 1)[0]._changed;
      const mergedData = querySetting.reduce((prev, cur) => {
        return {...prev.data, ...cur.data}
        }, querySetting[0].data)
      return {...querySetting[0], _changed: maxChangedDate, data: mergedData}
    // })
  } else {
    return undefined
  }
}

type SaveSetting = (oldData?: ISettingData, newData?: ISettingData) => void;
type DeleteSetting = (data: ISettingData) => ISettingData | undefined;


export function getCurrentSettings(params: ISettingParams[], userSettings?: ISettingEnvelope[]): (ISettingData | undefined)[]  | undefined {

  return params.map(p => {
    const querySettings = getMergedSettings(p);
    const userSetting = userSettings ? userSettings.find(u => u.objectID === p.objectID) : undefined;
    if (querySettings) {
      if ((userSetting && userSetting._changed.toString() < querySettings._changed.toISOString())
        || (!userSetting || (userSetting && Object.getOwnPropertyNames(userSetting).length === 0))) {
        const localStorageSettings: IUserColumnsSettingsEnvelope = {_changed: querySettings._changed, data: querySettings.data};
        localStorage.setItem(`userID/grid/${p.objectID}`, JSON.stringify(localStorageSettings));
        return {type: p.type, objectID: p.objectID, data: querySettings.data}
      }
    }
    return userSetting ? {type: p.type, objectID: p.objectID, data: userSetting.data} : undefined;
  })
}

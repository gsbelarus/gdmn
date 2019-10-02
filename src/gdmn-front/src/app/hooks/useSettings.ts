import { ISettingParams, isISettingEnvelope, ISettingEnvelope } from 'gdmn-internals';
import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const getCurrDateInUTC = () => {
  const date = new Date();
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 
    date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
};

export function useSettings<ST>({ type, objectID }: ISettingParams): [ST, (data: ST) => void] {

  const getFromLocalStorage = () => {
    const rawData = localStorage.getItem(`setting/${type}/${objectID}`);
    const parsedData = rawData ? JSON.parse(rawData) : undefined;
    return isISettingEnvelope(parsedData) ? parsedData : undefined;
  };

  const saveToLocaStorage = (se: ISettingEnvelope) => {
    localStorage.setItem(`setting/${type}/${objectID}`, JSON.stringify(se));    
  };

  const [settingEnvelope, setSettingEnvelope] = useState(getFromLocalStorage());
  const [queryServer, setQueryServer] = useState(true);

  useEffect( () => {       
    if (queryServer) {
      apiService.querySetting({ query: [ { type, objectID } ] })
      .then( response => {
        if (response.error) {
          console.log(response.error);
        } else if (!response.payload.result || !response.payload.result.length) {
          console.log('Settings are not found');
        } else {
          const result = response.payload.result[0];
          if(settingEnvelope) {
            if(settingEnvelope._changed > result._changed) {
              apiService.saveSetting({ newData: settingEnvelope })
            }
            else if (settingEnvelope._changed < result._changed) {
              saveToLocaStorage(result);
              setSettingEnvelope(result);  
            }
          } else {
            saveToLocaStorage(result);
            setSettingEnvelope(result);
          }
        }
      });
      setQueryServer(false);
    }
  }, [queryServer, settingEnvelope]);

  return [
    settingEnvelope ? settingEnvelope.data : undefined,
    (data: ST) => {
      const d = getCurrDateInUTC();
      const se: ISettingEnvelope = {
        type,
        objectID,
        data,
        _changed: d,
        _accessed: d
      };
      setSettingEnvelope(se);
      apiService.saveSetting({ newData: se })
      saveToLocaStorage(se);
    }
  ];
};
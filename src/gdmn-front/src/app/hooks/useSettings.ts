import { isISettingEnvelope, ISettingEnvelope } from 'gdmn-internals';
import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

interface ISettingsHookParams {
  type: string;
  objectID?: string;
};

/**
 * Возвращает массив из двух элементов: данные и функция обновления.
 */
export function useSettings<ST>({ type, objectID }: ISettingsHookParams): [ST, (data: ST) => void] {

  const saveToLocaStorage = (se: ISettingEnvelope) => {
    localStorage.setItem(`setting/${type}/${objectID}`, JSON.stringify(se));
  };

  const [settingEnvelope, setSettingEnvelope] = useState<ISettingEnvelope | undefined>();

  useEffect( () => {

    if (objectID === undefined) {
      setSettingEnvelope(undefined);
      return;
    }

    const rawData = localStorage.getItem(`setting/${type}/${objectID}`);
    const parsedData = rawData ? JSON.parse(rawData) : undefined;
    const fromLocalStorage = isISettingEnvelope(parsedData) ? parsedData : undefined;

    if (fromLocalStorage) {
      setSettingEnvelope(fromLocalStorage);
    }

    apiService.querySetting({ query: [ { type, objectID } ] })
    .then( response => {
      if (response.error) {
        console.log(response.error);
      } else if (!response.payload.result || !response.payload.result.length) {
        console.log('Settings are not found on server');
      } else {
        const result = response.payload.result[0];
        if (fromLocalStorage) {
          if(fromLocalStorage._changed > result._changed) {
            apiService.saveSetting({ newData: fromLocalStorage })
          }
          else if (fromLocalStorage._changed < result._changed) {
            saveToLocaStorage(result);
            setSettingEnvelope(result);
          }
        } else {
          saveToLocaStorage(result);
          setSettingEnvelope(result);
        }
      }
    });
  }, [type, objectID]);

  return [
    settingEnvelope?.data,
    (data: ST) => {
      if (objectID !== undefined) {
        const d = new Date().getTime();
        const se: ISettingEnvelope = {
          type,
          objectID,
          data,
          _changed: d,
          _accessed: d
        };
        if (data) {
          setSettingEnvelope(se);
          apiService.saveSetting({ newData: se });
          saveToLocaStorage(se);
        } else {
          localStorage.removeItem(`setting/${type}/${objectID}`);
          setSettingEnvelope(undefined);
          apiService.deleteSetting({ data: {type, objectID} });
        }
      }
    }
  ];
};

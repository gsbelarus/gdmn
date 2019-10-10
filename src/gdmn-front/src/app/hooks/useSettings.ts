import { ISettingParams, isISettingEnvelope, ISettingEnvelope } from 'gdmn-internals';
import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

/**
 * Возвращает массив из трех элементов: данные, функция обновления и функция удаления.
 */
export function useSettings<ST>({ type, objectID }: ISettingParams): [ST, (data: ST) => void, () => void] {

  const saveToLocaStorage = (se: ISettingEnvelope) => {
    localStorage.setItem(`setting/${type}/${objectID}`, JSON.stringify(se));
  };

  const [settingEnvelope, setSettingEnvelope] = useState<ISettingEnvelope | undefined>();

  useEffect( () => {

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
  }, []);

  return [
    settingEnvelope ? settingEnvelope.data : undefined,
    (data: ST) => {
      const d = new Date().getTime();
      const se: ISettingEnvelope = {
        type,
        objectID,
        data,
        _changed: d,
        _accessed: d
      };
      setSettingEnvelope(se);
      apiService.saveSetting({ newData: se });
      saveToLocaStorage(se);
    },
    () => {
      localStorage.removeItem(`setting/${type}/${objectID}`);
      setSettingEnvelope(undefined);
      apiService.deleteSetting({ data: {type, objectID} });
    }
  ];
};

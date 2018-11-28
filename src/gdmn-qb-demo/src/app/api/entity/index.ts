import { ERModel, deserializeERModel } from 'gdmn-orm';
import { entityList } from '@src/app/api/entity/mockData';

import config from '../../../../configs/config.json';

const baseURL = `${config.server.http.host}:${config.server.http.port}`;

const fetchMockData = async (): Promise<ERModel> => {
  return deserializeERModel(JSON.parse(JSON.stringify(entityList)));
};

const fetchData = async (): Promise<ERModel> => {
  const ermodelsURL = `${baseURL}${config.server.paths.er}`;
  const response = await fetch(ermodelsURL);
  if (!response.ok) throw new Error(response.statusText);

  return deserializeERModel(JSON.parse(await response.json()));
};

export const entityAPI = {
  fetchData,
  fetchMockData
};

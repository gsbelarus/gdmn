import { deserializeERModel, ERModel } from 'gdmn-orm';

import config from '../../../configs/config.json';

import { entityList } from './mockData';

// console.log('test', entityList);
const baseURL = `${config.server.http.host}:${config.server.http.port}`;

const fetchMockData = async (): Promise<ERModel> => {
  console.log(entityList);
  console.log(deserializeERModel(entityList));
  return deserializeERModel(entityList);
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

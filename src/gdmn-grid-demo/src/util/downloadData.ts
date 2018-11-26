/**
 * Грузим справочник валют и курсы с сайта НБРБ и
 * сохраняем в JSON файлы, которые потом с помощью
 * import подключаем сразу в программу.
 */

import fs from "fs";
import fetch from "node-fetch";
import {NBRBCurrencies, NBRBRates} from "../app/types";

const PATH_NB_RB_RATES = "./src/util/nbrbrates.json";
const PATH_NB_RB_CUR = "./src/util/nbrbcurrencies.json";

const urlNBRBRates = "http://www.nbrb.by/API/ExRates/Rates";
const urlNBRBCurrencies = "http://www.nbrb.by/API/ExRates/Currencies";

const force = process.argv.slice(2).includes("-force");

const startDate = new Date(2014, 1, 1);
const endDate = new Date(2018, 11, 1);

const downloadRates = (d: Date, endDate: Date, rates: NBRBRates): Promise<NBRBRates> => {
  if (d < endDate) {
    return fetch(`${urlNBRBRates}?Periodicity=0&onDate=${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`)
      .then(res => res.text())
      .then(res => JSON.parse(res) as NBRBRates)
      .then(res => downloadRates(new Date(d.setDate(d.getDate() + 1)), endDate, rates.concat(res)));
  } else {
    return Promise.resolve(rates);
  }
};

if (force || !fs.existsSync(PATH_NB_RB_RATES)) {
  downloadRates(startDate, endDate, [])
    .then(res => fs.writeFileSync(PATH_NB_RB_RATES, JSON.stringify(res, undefined, 2)))
    .catch(console.log);
}

if (force || !fs.existsSync(PATH_NB_RB_CUR)) {
  fetch(urlNBRBCurrencies)
    .then(res => res.text())
    .then(res => JSON.parse(res) as NBRBCurrencies)
    .then(res => fs.writeFileSync(PATH_NB_RB_CUR, JSON.stringify(res, undefined, 2)));
}

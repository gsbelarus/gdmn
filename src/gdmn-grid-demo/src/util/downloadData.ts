/**
 * Грузим справочник валют и курсы с сайта НБРБ и
 * сохраняем в JSON файлы, которые потом с помощью
 * import подключаем сразу в программу.
 */

import fs from "fs";
import fetch from "node-fetch";
import {NBRBCurrencies, NBRBRates} from "../app/types";

const urlNBRBCurrencies = "http://www.nbrb.by/API/ExRates/Currencies";
const urlNBRBRates = "http://www.nbrb.by/API/ExRates/Rates";

fetch(urlNBRBCurrencies)
  .then(res => res.text())
  .then(res => JSON.parse(res) as NBRBCurrencies)
  .then(res => fs.writeFileSync("./src/util/nbrbcurrencies.json", JSON.stringify(res, undefined, 2)));

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

downloadRates(startDate, endDate, [])
  .then(res => fs.writeFileSync("./src/util/nbrbrates.json", JSON.stringify(res, undefined, 2)))
  .catch(console.log);

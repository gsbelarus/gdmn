import { IDemoRecordSet } from "./types";
import { loadNBRBCurrencies } from "./nbrbCurrencies";
import { loadNBRBRates } from "./nbrbRates";
import { loadNBRBOLAP } from "./nbrbOLAP";
import { loadDemoData } from "./demoData";
import { loadDemoOLAP } from "./demoOLAP";

export const demoRecordSets: IDemoRecordSet[] = [
  {
    name: 'currency',
    createFunc: loadNBRBCurrencies
  },
  {
    name: 'rates',
    createFunc: loadNBRBRates
  },
  {
    name: 'ratesOLAP',
    createFunc: loadNBRBOLAP
  },
  {
    name: 'demo',
    createFunc: loadDemoData
  },
  {
    name: 'demoOLAP',
    createFunc: loadDemoOLAP
  }
];
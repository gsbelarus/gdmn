import { ISettingEnvelope, isISettingData, ISettingParams } from 'gdmn-internals';
import { promises } from "fs";
import { ADatabase, IDBDetail } from './ADatabase';
import log4js from "log4js";
import path from "path";

interface IDataFromFiles {
  fileName: string;
  data: ISettingEnvelope[];
  isChangedData: boolean;
}

export class SettingSaveInMemory extends ADatabase {

  public sessionLogger = log4js.getLogger("Session");
  public taskLogger = log4js.getLogger("Task");

  public dataFromFiles = [] as IDataFromFiles[];

  constructor(dbDetail: IDBDetail) {
    super(dbDetail);
  }

  public async readFileWithSettings(fileName: string):  Promise<ISettingEnvelope[] | undefined> {
    const findData = this.getData(fileName);
    if(!findData) {
      let data = await promises.readFile(fileName, { encoding: 'utf8', flag: 'r' })
        .then( text => JSON.parse(text) )
        .then( arr => {
          if (Array.isArray(arr) && arr.length && isISettingData(arr[0])) {
            this.taskLogger.log(`Read data from file ${fileName}`);
            return arr as ISettingEnvelope[];
          } else {
            this.taskLogger.warn(`Unknown data type in file ${fileName}`);
            return undefined;
          }
        })
        .catch( err => {
          this.taskLogger.warn(`Error reading file ${fileName} - ${err}`);
          return undefined;
        });
      if(data) {
        this.dataFromFiles.push({fileName, data, isChangedData: false})
      }
    }
    return this.getData(fileName);
  }

  public async writeFileSettings() {
    this.dataFromFiles.forEach(async (item, idx) => {
      if(item.isChangedData) {
        const data = this.getData(item.fileName);
        if(data) {
          try {
            await promises.mkdir(path.dirname(item.fileName), { recursive: true });
            await promises.writeFile(item.fileName, JSON.stringify(data, undefined, 2), { encoding: 'utf8', flag: 'w' });
            this.dataFromFiles[idx] = {fileName: item.fileName, data: this.dataFromFiles[idx].data, isChangedData: false }
            return item.isChangedData ? { ... item, isChangedData: false} : item
          }
          catch (e) {
            this.taskLogger.warn(`Error writing data to file ${item.fileName} - ${e}`);
          }
        }
      }
    })
  }

  public getData(fileName: string): ISettingEnvelope[] | undefined {
    const findData = this.dataFromFiles.find(item => item.fileName === fileName);
    return findData ? findData.data : undefined;
  }

  public newData(fileName: string, newData: ISettingEnvelope) {
    let oldData = this.dataFromFiles.find(item => item.fileName === fileName);
    if(oldData) {
      const idx = oldData.data.findIndex( s => isISettingData(s) && s.type === newData.type && s.objectID === newData.objectID );
        if (idx === -1) {
          oldData.data.push(newData);
        } else {
          oldData.data[idx] = newData;
        }
      this.dataFromFiles[this.dataFromFiles.findIndex(item => item.fileName === fileName)] = {fileName, data: [...oldData.data], isChangedData: true};
    } else {
      this.dataFromFiles.push({fileName, data: [newData], isChangedData: true});
    }
  }

  public deleteSettingFromData(fileName: string, param: ISettingParams) {
    const idxOldData = this.dataFromFiles.findIndex(item => item.fileName === fileName);
    if(idxOldData !== -1) {
      const idx = this.dataFromFiles[idxOldData].data.findIndex( s => isISettingData(s) && s.type === param.type && s.objectID === param.objectID );
      if (idx !== -1) {
        this.dataFromFiles[idxOldData].data.splice(idx, 1);
        this.dataFromFiles[idxOldData] = {fileName, data: this.dataFromFiles[idxOldData].data, isChangedData: true }
      }
    }
  }
}

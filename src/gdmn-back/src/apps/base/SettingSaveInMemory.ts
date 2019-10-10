import { ISettingEnvelope, isISettingData, ISettingParams } from 'gdmn-internals';
import { promises } from "fs";
import path from "path";

interface IDataFromFiles {
  fileName: string;
  data: ISettingEnvelope[];
  isChangedData: boolean;
}

export class SettingSaveInMemory {

  private dataFromFiles = [] as IDataFromFiles[];
  private pathFromFolderDB: string;

  constructor(path: string) {
    this.pathFromFolderDB = path;
  }

  private _getSettingFileName(type: string, dbName: string) {
    return `${path.parse(this.pathFromFolderDB).dir}\\${dbName}\\type.${type}.json`;
  }

  private async readFileWithSettings(type: string, dbName: string):  Promise<ISettingEnvelope[] | undefined> {
    const fileName = this._getSettingFileName(type, dbName);
    const findData = this.getData(fileName);
    if(!findData) {
      let data = await promises.readFile(fileName, { encoding: 'utf8', flag: 'r' })
        .then( text => JSON.parse(text) )
        .then( arr => {
          if (Array.isArray(arr) && arr.length && isISettingData(arr[0])) {
            console.log(`Read data from file ${fileName}`);
            return arr as ISettingEnvelope[];
          } else {
            console.log(`Unknown data type in file ${fileName}`);
            return undefined;
          }
        })
        .catch( err => {
          console.log(`Error reading file ${fileName} - ${err}`);
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
            console.log(`Error writing data to file ${item.fileName} - ${e}`);
          }
        }
      }
    })
  }

  private getData(fileName: string): ISettingEnvelope[] | undefined {
    const findData = this.dataFromFiles.find(item => item.fileName === fileName);
    return findData ? findData.data : undefined;
  }
//
  public async findSetting(type: string, objectID: string, dbName: string): Promise<ISettingEnvelope[] | undefined> {
    const fileName = this._getSettingFileName(type, dbName);
    const findData = this.getData(fileName);
    let data;
    if (findData) {
      data = await this.readFileWithSettings(type, dbName);
    }
    return data ? data.filter( s => isISettingData(s) && s.type === type && s.objectID === objectID) as ISettingEnvelope[]: undefined;
  }
//
  public newData(newData: ISettingEnvelope, dbName: string) {
    const fileName = this._getSettingFileName(newData.type, dbName);
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
//
  public deleteSettingFromData(param: ISettingParams, dbName: string) {
    const fileName = this._getSettingFileName(param.type, dbName);
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

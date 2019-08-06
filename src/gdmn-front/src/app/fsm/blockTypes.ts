import { IBlockTypes } from "./types";

export const blockTypes: IBlockTypes = {
  login: {
    id: 'login',
    shape: 'START',
    label: 'Вход в систему',
    outParams: [
      {
        name: 'userName',
        dataType: 'string',
        required: true
      }
    ]
  },

  showData: {
    id: 'showData',
    shape: 'PROCESS',
    label: 'Отображение данных',
    inParams: [
      {
        name: 'userName',
        dataType: 'string',
        required: true
      }
    ],
    outParams: [
      {
        name: 'currentRecord',
        dataType: 'string'
      }
    ],
    blockParams: [
      {
        name: 'queryPhrase',
        dataType: 'string',
        required: true
      }
    ]
  },

  workDone: {
    id: 'workDone',
    shape: 'END',
    label: 'Завершение'
  },

  chooseUserAction: {
    id: 'chooseUserAction',
    shape: 'PROCESS',
    label: 'Choose user action'
  },

  addRecord: {
    id: 'addRecord',
    shape: 'PROCESS',
    label: 'Добавление записи'
  },

  editRecord: {
    id: 'editRecord',
    shape: 'PROCESS',
    label: 'Редактирование записи'
  },

  deleteRecord: {
    id: 'deleteRecord',
    shape: 'PROCESS',
    label: 'Удаление записи'
  },

  decision: {
    id: 'decision',
    shape: 'DECISION',
    label: 'decision'
  }
};
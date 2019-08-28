import { IFSMState } from "./types";

const login: IFSMState = {
  id: 'LOGIN',
  label: { ru: { name: 'Вход в систему' } },
  outParams: [
    {
      name: 'userName',
      dataType: 'string',
      required: true
    }
  ]
};

const showData: IFSMState = {
  id: 'SHOW_DATA',
  label: { ru: { name: 'Отображение данных' } },
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
  params: [
    {
      name: 'queryPhrase',
      dataType: 'string',
      required: true
    }
  ]
};

const workDone: IFSMState = {
  id: 'WORK_DONE',
  label: { ru: { name: 'Завершение' } }
};

export const fsmStates = {
  login,
  showData,
  workDone
};

/*

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

*/
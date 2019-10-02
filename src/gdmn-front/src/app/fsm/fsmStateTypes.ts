import { IFSMStateType } from "./types";

const login: IFSMStateType = {
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

const showData: IFSMStateType = {
  id: 'SHOW_DATA',
  label: { ru: { name: 'Отображение данных' } },
  inParams: [
    {
      name: 'userName',
      dataType: 'string',
      required: true
    },
    {
      name: 'entityName',
      dataType: 'string',
      required: true
    },
    {
      name: 'queryPhrase',
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

const workDone: IFSMStateType = {
  id: 'WORK_DONE',
  label: { ru: { name: 'Завершение' } }
};

export const fsmStateTypes = {
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
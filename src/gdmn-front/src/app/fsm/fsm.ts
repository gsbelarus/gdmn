import { LName } from "gdmn-internals";

export type StateTypeParamDataType = 'string' | 'number';

export interface IStateTypeParam {
  name: string;
  dataType: StateTypeParamDataType;
  required?: boolean;
};

export type ID = string;

export interface IStateType {
  id: ID;
  caption: string;
  inParams?: IStateTypeParam[];
  outParams?: IStateTypeParam[];
  stateParams?: IStateTypeParam[];
};

export interface IStateTypes {
  [name: string]: IStateType;
};

const stateTypes: IStateTypes = {
  logged: {
    id: 'LOGGED',
    caption: 'Вход в систему',
    outParams: [
      {
        name: 'userName',
        dataType: 'string',
        required: true
      }
    ]
  },

  showData: {
    id: 'SHOW_DATA',
    caption: 'Отображение данных',
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
    stateParams: [
      {
        name: 'queryPhrase',
        dataType: 'string',
        required: true
      }
    ]
  },

  workDone: {
    id: 'WORK_DONE',
    caption: 'Завершение'
  },

  filterAndSort: {
    id: 'FILTER_AND_SORT',
    caption: 'Выборка и сортировка'
  },

  addRecord: {
    id: 'ADD_RECORD',
    caption: 'Добавление записи'
  },

  editRecord: {
    id: 'EDIT_RECORD',
    caption: 'Редактирование записи'
  },

  deleteRecord: {
    id: 'DELETE_RECORD',
    caption: 'Удаление записи'
  }
};

export interface IStateParams {
  [name: string]: any;
};

export interface IState {
  id: ID;
  type: IStateType;
  caption?: string;
  params?: IStateParams;
};

export interface IStates {
  [id: string]: IState;
};

export const states: IStates = {
  sLogged: {
    id: 'S_LOGGED',
    type: stateTypes.logged,
  },
  sShowData: {
    id: 'S_SHOW_DATA',
    type: stateTypes.showData,
    params: {
      queryPhrase: 'Покажи рабочее время текущего пользователя.'
    }
  },
  sWorkDone: {
    id: 'S_WORK_DONE',
    type: stateTypes.workDone
  },
  sAddRecord: {
    id: 'S_ADD_RECORD',
    type: stateTypes.addRecord
  },
  sEditRecord: {
    id: 'S_EDIT_RECORD',
    type: stateTypes.editRecord
  },
  sDeleteRecord: {
    id: 'S_DELETE_RECORD',
    type: stateTypes.deleteRecord
  },
  sFilterAndSort: {
    id: 'S_FILTER_AND_SORT',
    type: stateTypes.filterAndSort
  }
};

export type StateTransitionEvent = 'onLogin' | 'onUserAction';

export interface ITransition {
  sFrom: IState;
  sTo: IState;
  onEvent: StateTransitionEvent;
};

export interface IBusinessProcess {
  caption: LName;
  description: LName;
  states: IStates;
  flow: ITransition[];
};

export interface IBusinessProcesses {
  [name: string]: IBusinessProcess;
};

export const businessProcesses: IBusinessProcesses = {
  'WorkTime': {
    caption: {
      ru: {
        name: 'Регистрация рабочего времени'
      }
    },
    description: {
      ru: {
        name: 'Просмотр, выборка, сортировка таблицы рабочего времени. Внесение, редактирование, удаление записей рабочего времени.'
      }
    },
    states,
    flow: [
      {
        sFrom: states.sLogged,
        sTo: states.sShowData,
        onEvent: 'onLogin'
      },
      {
        sFrom: states.sShowData,
        sTo: states.sWorkDone,
        onEvent: 'onUserAction'
      },
      {
        sFrom: states.sShowData,
        sTo: states.sFilterAndSort,
        onEvent: 'onUserAction'
      },
      {
        sFrom: states.sFilterAndSort,
        sTo: states.sShowData,
        onEvent: 'onUserAction'
      },
      {
        sFrom: states.sShowData,
        sTo: states.sAddRecord,
        onEvent: 'onUserAction'
      },
      {
        sFrom: states.sAddRecord,
        sTo: states.sShowData,
        onEvent: 'onUserAction'
      }
    ]
  },
  'Test': {
    caption: {
      ru: {
        name: 'Тестовый процесс'
      }
    },
    description: {
      ru: {
        name: 'Присутствует в списке из соображений тестирования.'
      }
    },
    states: {},
    flow: []
  }
};

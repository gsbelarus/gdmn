import { IFSMFlowchart, IFSMFlowcharts, IFSMState } from "./types";
import { fsmStateTypes } from "./fsmStateTypes";
import { fsmSignals } from "./fsmSignals";

const login: IFSMState = {
  id: 'LOGIN_STATE',
  type: fsmStateTypes.login
};

const showData: IFSMState = {
  id: 'SHOW_DATA_STATE',
  type: fsmStateTypes.showData,
  inParams: {
    entityName: 'TgdcCompany',
    queryPhrase: 'Покажи все TgdcCompany'
  }
};

const workDone: IFSMState = {
  id: 'WORK_DONE',
  type: fsmStateTypes.workDone
};

const workTime: IFSMFlowchart = {
  id: 'workTime',
  label: {
    ru: {
      name: 'Регистрация рабочего времени'
    }
  },
  description: {
    ru: {
      name: 'Просмотр, выборка, сортировка таблицы рабочего времени. Внесение, редактирование, удаление записей рабочего времени.'
    }
  },
  rules: {
    beginRule: {
      id: 'BEGIN',
      state: login,
      signal: fsmSignals.start,
      nextState: showData
    },
    endRule: {
      id: 'END',
      state: showData,
      signal: fsmSignals.finish,
      nextState: workDone
    }
  }
};

export const flowcharts: IFSMFlowcharts = {
  workTime
};

/*

export const blocks: IBlocks = {
  login: {
    id: 'login',
    type: blockTypes.login,
  },
  showData: {
    id: 'showData',
    type: blockTypes.showData,
    params: {
      queryPhrase: 'Покажи рабочее время текущего пользователя.'
    }
  },
  chooseUserAction: {
    id: 'chooseUserAction',
    type: blockTypes.chooseUserAction
  },
  workDone: {
    id: 'workDone',
    type: blockTypes.workDone
  },
  addRecord: {
    id: 'addRecord',
    type: blockTypes.addRecord
  },
  editRecord: {
    id: 'editRecord',
    type: blockTypes.editRecord
  },
  deleteRecord: {
    id: 'deleteRecord',
    type: blockTypes.deleteRecord
  },
  decision: {
    id: 'decision',
    type: blockTypes.decision,
    label: 'Created less than 2 hrs ago?'
  }
};

export const flowcharts: IFlowcharts = {
  'WorkTime': {
    name: 'WorkTime',
    label: {
      ru: {
        name: 'Регистрация рабочего времени'
      }
    },
    description: {
      ru: {
        name: 'Просмотр, выборка, сортировка таблицы рабочего времени. Внесение, редактирование, удаление записей рабочего времени.'
      }
    },
    blocks,
    flow: {
      'begin': {
        id: 'begin',
        from: blocks.login,
        to: blocks.showData
      },
      'ui': {
        id: 'ui',
        from: blocks.showData,
        to: blocks.chooseUserAction
      },
      'userAction': {
        id: 'userAction',
        from: blocks.chooseUserAction,
        to: [blocks.addRecord, blocks.decision, blocks.workDone]
      },
      'addRecord': {
        id: 'addRecord',
        from: blocks.addRecord,
        to: blocks.showData
      },
      'test2hrs': {
        id: 'test2hrs',
        from: blocks.decision,
        yes: [blocks.deleteRecord, blocks.editRecord],
        no: blocks.showData
      },
      'deleteRecord': {
        id: 'deleteRecord',
        from: blocks.deleteRecord,
        to: blocks.showData
      },
      'editRecord': {
        id: 'editRecord',
        from: blocks.editRecord,
        to: blocks.showData
      }
    }
  },
  'Test': {
    name: 'Test',
    label: {
      ru: {
        name: 'Тестовый процесс'
      }
    },
    description: {
      ru: {
        name: 'Присутствует в списке из соображений тестирования.'
      }
    },
    blocks: Object.fromEntries(Object.entries(blocks).filter( ([_, b]) => b.id === 'login' || b.id === 'workDone' )),
    flow: {
      'begin': {
        id: 'begin',
        from: blocks.login,
        to: blocks.workDone
      }
    }
  }
};

*/
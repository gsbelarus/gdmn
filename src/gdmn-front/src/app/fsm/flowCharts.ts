import { IBlocks, IFlowcharts } from "./types";
import { blockTypes } from "./blockTypes";

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

export const flowCharts: IFlowcharts = {
  'WorkTime': {
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
    flow: [
      {
        from: blocks.login,
        to: blocks.showData
      },
      {
        from: blocks.showData,
        to: blocks.chooseUserAction
      },
      {
        from: blocks.chooseUserAction,
        to: [blocks.addRecord, blocks.decision, blocks.workDone]
      },
      {
        from: blocks.addRecord,
        to: blocks.showData
      },
      {
        from: blocks.decision,
        yes: [blocks.deleteRecord, blocks.editRecord],
        no: blocks.showData
      },
      {
        from: blocks.deleteRecord,
        to: blocks.showData
      },
      {
        from: blocks.editRecord,
        to: blocks.showData
      }
    ]
  },
  'Test': {
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
    blocks: {},
    flow: []
  }
};

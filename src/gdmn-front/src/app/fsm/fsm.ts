import { LName } from "gdmn-internals";

export type Shape = 'PROCESS' | 'START' | 'END' | 'DECISION';

export type BlockTypeParamDataType = 'string' | 'number';

export interface IBlockTypeParam {
  name: string;
  dataType: BlockTypeParamDataType;
  required?: boolean;
};

export type ID = string;

export interface IBlockType {
  id: ID;
  shape: Shape;
  label: string;
  inParams?: IBlockTypeParam[];
  outParams?: IBlockTypeParam[];
  blockParams?: IBlockTypeParam[];
};

export interface IBlockTypes {
  [id: string]: IBlockType;
};

const blockTypes: IBlockTypes = {
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

export interface IBlockParams {
  [name: string]: any;
};

export interface IBlock {
  id: ID;
  type: IBlockType;
  label?: string;
  params?: IBlockParams;
};

export interface IBlocks {
  [id: string]: IBlock;
};

export const states: IBlocks = {
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

export interface ITransitionBase {
  from: IBlock;
};

export interface ITransition extends ITransitionBase {
  to: IBlock;
};

export interface IXORTransition extends ITransitionBase {
  to: IBlock[];
};

export interface IDecisionTransition extends ITransitionBase {
  yes: IBlock | IBlock[];
  no: IBlock | IBlock[];
};

export function isDecisionTransition(transition: Transition): transition is IDecisionTransition {
  return (transition as IDecisionTransition).yes !== undefined;
};

export type Transition = ITransition | IXORTransition | IDecisionTransition;

export interface IFlowchart {
  label: LName;
  description: LName;
  states: IBlocks;
  flow: Transition[];
};

export interface IFlowcharts {
  [name: string]: IFlowchart;
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
    states,
    flow: [
      {
        from: states.login,
        to: states.showData
      },
      {
        from: states.showData,
        to: states.chooseUserAction
      },
      {
        from: states.chooseUserAction,
        to: [states.addRecord, states.decision, states.workDone]
      },
      {
        from: states.addRecord,
        to: states.showData
      },
      {
        from: states.decision,
        yes: [states.deleteRecord, states.editRecord],
        no: states.showData
      },
      {
        from: states.deleteRecord,
        to: states.showData
      },
      {
        from: states.editRecord,
        to: states.showData
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
    states: {},
    flow: []
  }
};

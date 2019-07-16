import { createStateType, IBusinessProcesses, StateTypes } from "./types";

const stateTypes = {
  logged: createStateType('LOGGED', resolve => (userName: string) => resolve({ userName }) ),
  showData: createStateType('SHOW_DATA', resolve => (queryPhrase: string) => resolve({ queryPhrase })),
  workDone: createStateType('WORK_DONE'),
  queryAndSort:  createStateType('QUERY_AND_SORT'),
  addRecord: createStateType('ADD_RECORD'),
  requestPermissions: createStateType('REQUEST_PERMISSIONS'),
  testCondition: createStateType('TEST_CONDITION'),
  deleteOrEdit: createStateType('DELETE_EDIT_RECORD')
};

const s = stateTypes.showData('Покажи рабочее время текущего пользователя.');

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
    nodes: [
      {
        id: stateTypes.logged.getType()
      },
      {
        id: stateTypes.showData.getType()
      },
      {
        id: stateTypes.workDone.getType()
      },
      {
        id: stateTypes.queryAndSort.getType()
      },
      {
        id: stateTypes.addRecord.getType()
      },
      {
        id: stateTypes.requestPermissions.getType()
      },
      {
        id: stateTypes.testCondition.getType()
      },
      {
        id: stateTypes.deleteOrEdit.getType()
      }
    ],
    flow: [
      {
        fromState: stateTypes.logged.getType(),
        toState: stateTypes.showData.getType()
      },
      {
        fromState: stateTypes.showData.getType(),
        toState: stateTypes.workDone.getType()
      },
      {
        fromState: stateTypes.showData.getType(),
        toState: stateTypes.queryAndSort.getType(),
        returning: true
      },
      {
        fromState: stateTypes.showData.getType(),
        toState: stateTypes.addRecord.getType(),
        returning: true
      },
      {
        fromState: stateTypes.showData.getType(),
        toState: stateTypes.requestPermissions.getType()
      },
      {
        fromState: stateTypes.requestPermissions.getType(),
        toState: stateTypes.testCondition.getType()
      },
      {
        fromState: stateTypes.testCondition.getType(),
        condition: 'Less than 2 hrs?',
        thenState: stateTypes.deleteOrEdit.getType(),
        elseState: stateTypes.showData.getType()
      },
      {
        fromState: stateTypes.deleteOrEdit.getType(),
        toState: stateTypes.showData.getType()
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
    nodes: [],
    flow: []
  }
};

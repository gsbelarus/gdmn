import { createStateType, IBusinessProcesses } from "./types";

const logged = createStateType('LOGGED', resolve => (userName: string) => resolve({ userName }) );
const showData = createStateType('SHOW_DATA', resolve => (queryPhrase: string) => resolve({ queryPhrase }));
const workDone = createStateType('WORK_DONE');
const queryAndSort = createStateType('QUERY_AND_SORT');
const addRecord = createStateType('ADD_RECORD');
const requestPermissions = createStateType('REQUEST_PERMISSIONS');
const testCondition = createStateType('TEST_CONDITION');
const deleteOrEdit = createStateType('DELETE_EDIT_RECORD');

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
        id: logged.getType()
      },
      {
        id: showData.getType()
      },
      {
        id: workDone.getType()
      },
      {
        id: queryAndSort.getType()
      },
      {
        id: addRecord.getType()
      },
      {
        id: requestPermissions.getType()
      },
      {
        id: testCondition.getType()
      },
      {
        id: deleteOrEdit.getType()
      }
    ],
    flow: [
      {
        fromState: logged.getType(),
        toState: showData.getType()
      },
      {
        fromState: showData.getType(),
        toState: workDone.getType()
      },
      {
        fromState: showData.getType(),
        toState: queryAndSort.getType(),
        returning: true
      },
      {
        fromState: showData.getType(),
        toState: addRecord.getType(),
        returning: true
      },
      {
        fromState: showData.getType(),
        toState: requestPermissions.getType()
      },
      {
        fromState: requestPermissions.getType(),
        toState: testCondition.getType()
      },
      {
        fromState: testCondition.getType(),
        condition: 'Less than 2 hrs?',
        thenState: deleteOrEdit.getType(),
        elseState: showData.getType()
      },
      {
        fromState: deleteOrEdit.getType(),
        toState: showData.getType()
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

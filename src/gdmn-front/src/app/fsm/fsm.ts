import { createStateType, IBusinessProcesses } from "./types";

const logged = createStateType('LOGGED', resolve => (userName: string) => resolve({ userName }) );
const showData = createStateType('SHOW_DATA', resolve => (queryPhrase: string) => resolve({ queryPhrase }));
const workDone = createStateType('WORK_DONE');
const queryAndSort = createStateType('QUERY_AND_SORT');
const addRecord = createStateType('ADD_RECORD');

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

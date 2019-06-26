import { createStateType, IBusinessProcesses } from "./types";

const logged = createStateType('LOGGED', resolve => (userName: string) => resolve({ userName }) );
const showData = createStateType('SHOW_DATA', resolve => (queryPhrase: string) => resolve({ queryPhrase }));

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
    flow: [
      {
        fromState: logged.getType(),
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
    flow: []
  }
};

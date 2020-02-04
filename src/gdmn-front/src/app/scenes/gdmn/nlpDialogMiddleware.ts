import { getType, ActionType } from 'typesafe-actions';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';
import { TThunkMiddleware } from '@src/app/store/middlewares';
import { ERTranslatorRU3 } from 'gdmn-nlp-agent';
import { getLName } from 'gdmn-internals';

/*

  1. Получаем на вход очередной текст для обработки.
  2. Проверяем на команды, класс из ERModel и т.п.
  3. Переходим к обработке nlp.
  4. Смотрим на текущую вкладку. Это отображение данных? Там есть translator?
  5. Если нет, то создаем новый транслятор и передаем ему текст для разбора.
  6. Текст нельзя разобрать -- выводим ошибку в nlp диалог.
  7. Текст можно разобрать. Формируем url и IViewData. Записываем туда транслятор.
     Открываем новую вкладку.
  8. Если да (п.4), то берем транслятор из вкладки и передаем в него текст
     для разбора.
  9. Текст нельзя разобрать. Выводим ошибку в диалог.
  10.Текст нельзя разобрать в контексте текущей команды.
     Переходим на п.7. Будем открывать новую вкладку.
  11.Текст можно разобрать. Разбираем и сохраняем новый транслятор,
     что приведет к перерисовке DataView на экране.

  NLPDataView:

  1. В отличие от EntityDataView подразумевается, что IViewTab
     уже существует к моменту рендера этого компонента.
  2. В IViewTab существует транслятор.

  Состояния и переходы подробно описаны в EntityDataView.
  Они остаются в силе, но расширяются следующими состояниями:

  1. Есть erModel, есть translator, но нет rs. Берем из транслятора
     команду и начинаем выполнять запрос к серверу для rs.
  2. Есть erModel, есть rs, транслятор поменялся. Смотрим на entity
     в трансляторе и на entity в рекорд-сете. Если совпадают, то
     выполняем команду на сервере и загружаем новые данные rs.
     Не забываем применить условия master связи, если они были.
  3. Если entity не совпадает, то скидываем rs, мастер связь
     и запускаем загрузку с сервера. По ее окончании, загружаем
     новые setting, исходя из того, что изменилось entity.

*/

export const nlpDialogMiddleware: TThunkMiddleware = ({ getState, dispatch }) => next => (action: ActionType<typeof gdmnActions.nlpProcess>) => {
  if (action.type === getType(gdmnActions.nlpProcess)) {
    const { item: { text }, history } = action.payload;

    const getViewTab = () => getState().gdmnState.viewTabs.find(t => t.url === history.location.pathname);

    // сначала проверим на ввод команд
    switch (text) {
      case '?':
      case 'help': {
        window.open('https://github.com/gsbelarus/gdmn/blob/master/src/gdmn-front/help/commands.md', '_blank');
        dispatch(gdmnActions.nlpAdd([
          { who: 'me', text },
          { who: 'it', text: 'Справка будет открыта в отдельном окне браузера' }
        ]));
        return;
      }

      case 'close': {
        const tab = getViewTab();
        if (tab && tab.canClose) {
          dispatch(gdmnActions.deleteViewTab({
            viewTabURL: history.location.pathname,
            locationPath: history.location.pathname,
            historyPush: history.push
          }));
          dispatch(gdmnActions.nlpAdd([
            { who: 'me', text },
            { who: 'it', text: `Вкладка ${tab.caption} закрыта` }
          ]));
        }
        return;
      }
      case 'sql': {
        history.push(`/spa/gdmn/sql`);
        dispatch(gdmnActions.nlpAdd([
          { who: 'me', text }
        ]));
        return;
      }
      case 'morphology': {
        history.push(`/spa/gdmn/morphology`);
        dispatch(gdmnActions.nlpAdd([
          { who: 'me', text }
        ]));
        return;
      }
      case 'syntax': {
        history.push(`/spa/gdmn/syntax`);
        dispatch(gdmnActions.nlpAdd([
          { who: 'me', text }
        ]));
        return;
      }
      case 'clear': {
        dispatch(gdmnActions.nlpClear());
        return;
      }
    }

    // возможно ввели имя entity -- откроем окно на просмотр данных
    const { erModel } = getState().gdmnState;
    const entity = erModel.entities[ text ];
    if (entity) {
      history.push(`/spa/gdmn/entity/${entity.name}`);
      dispatch(gdmnActions.nlpAdd([
        { who: 'me', text },
        { who: 'it', text: 'Открыта таблица с данными.' }
      ]));
      return;
    }

    // если введено просто слово -- открываем окно морфологии
    if (/^[А-Яа-я]+$/.test(text)) {
      history.push(`/spa/gdmn/morphology/${text}`);
      dispatch(gdmnActions.nlpAdd([
        { who: 'me', text }
      ]));
      return;
    }

    const tab = getViewTab();
    const prevTranslator = tab?.translator;
    let translator = prevTranslator ?? new ERTranslatorRU3({erModel, processUniform: true});
    try {
      translator = translator.processText(text);

      if (prevTranslator?.valid && prevTranslator.command.payload.link.entity === translator.command.payload.link.entity) {
        dispatch(gdmnActions.updateViewTab({
          url: tab!.url,
          viewTab: {
            translator
          }
        }));
      } else {
        const url = '/spa/gdmn/nlp-data-view/' + new Date().getTime().toString();
        dispatch(gdmnActions.addViewTab({
          url,
          caption: getLName(translator.command.payload.link.entity.lName, ['ru']),
          translator,
          canClose: true
        }));
        history.push(url);
      }

      dispatch(gdmnActions.nlpAdd([
        { who: 'me', text }
      ]));
      return;
    }
    catch (e) {
      dispatch(gdmnActions.nlpAdd([
        { who: 'me', text },
        { who: 'it', text: e.message }
      ]));
      return;
    }
  }
  return next(action);
};

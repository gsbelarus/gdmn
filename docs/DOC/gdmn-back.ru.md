#	Запуск сервера

При запуске бэка `index.ts → server.ts → start()`

Выполняет следующие функции:

*	запускает KOA и на нем создает HTTPServer. Необходимо для того, чтобы можно было отправлять статичные файлы, например, `index.html` с фронта.  Т. е. если скомпилировать файлы фронта и поместить их в ...\gdmn-back\public и запускать сервер, то по root адресу будет доступен front.
*	запускает ws-server
*	создает `Stomp Manager`. `Stomp Manager` создает массив для связи стомп-сессий и веб-сокет соединений. (Сами стомп-сессии создаются при подключении юзера через веб-сокет и хранятся, пока есть соединение. Они также кешируются некоторое время после разрыва соединения, чтобы можно было восстановить при восстановлении соединения). `Stomp Manager` также запускает метод `.CreateOrConnect()` из `ADatabase`. Этот метод пытается установить соединение с базой авторизации (метод `.Connect()` из `ADatabase`). Если соединение уже есть, сообщаем об этом, если нет создаем пул соединений (для работы с БД и организацию работы с SQL выражениями через этот пул), если еще не создан, и запускаем метод `._OnCreate()` из `MainApplication`. Если коннект не прошел, запускаем `.Create()`  из `ADatabase`.  В нем создаем базу авторизации, соединение, и, аналогично предыдущему, создаем пул соединений и  запускаем метод `._OnCreate()` из `MainApplication`. В нем создаем схему базы авторизации и ждем подключений пользователя. 

Back готов к работе.

#	Подключение пользователя

*	При подключении пользователя создается сессия и соотноситься с его сокет соединением. 
*	Когда мы первый раз открываем фронт, идет коннект без указания uid приложения, т.е к базе авторизации по умолчанию. Стомп-сессия имеет доступ к базе авторизации, она проверяет все данные и дает пользователю доступ к выполнению команд. Кроме того, происходит подписка на Менеджер задач. 
*	Далее на фронте выдается список доступных приложений, если он есть.  
*	Когда пользователь подключается к выбранному приложению, подключение идет уже через uid приложения ( через Application, потомок ADatabase) и стомп-сессия дает доступ на выполнение  задач через API-функции в выбранном приложении. Авторизация при коннекте к приложению всегда идет через базу авторизациии, все стомп-сессии имеют доступ к базе авторизации для этого.  При коннекте к выбранному приложению происходит дисконнект от базы авторизации. 
*	При выполнении функции ._OnCreate() из Application (если приложение создается) или ._OnConnect() из Application, если выбирается из имеющихся, происходит считывание ERModel в Child-процессе.
*	При вызове задачи она регистрируется в TaskManager, который осуществляет три подписки: для данных, для прогресса и статусов. TaskManager уведомляет об изменениях  другие модули системы.
*	Далее для выполнения задачи берется свободный Connection из пула, потом Application  возвращает задачу в стомп сессию,  там она запускается на выполнение возвращает либо результат выполнения, либо ошибку.

#	Работа apiService на бэке

Для добавления нового обработчика команды требуется произвести следующие шаги:

* В тип `AppAction` добавить имя новой команды.
* В `\gdmn-back\src\apps\base\Application.ts` добавить тип, например:
```ts
export type CheckEntityEmptyCmd = AppCmd<"CHECK_ENTITY_EMPTY", IEntity>;
```
* В `\gdmn-back\src\apps\base\Application.ts`, в класс `Application` добавить метод `push...Cmd`
* В `\gdmn-back\src\apps\base\AppCommandProvider.ts`, в класс `AppCommandProvider` добавить обработчик команды. Например:
```ts
case "CHECK_ENTITY_EMPTY": {
  if (AppCommandProvider._verifyCheckEntityEmptyCmd(command)) {
    return this._application.pushCheckEntityEmptyCmd(session,command);
  }
  throw new Error(`Incorrect ${command.action} command`);
}
```

#	Работа apiService на фронте

Для добавления нового метода %METHOD_NAME% в apiService требуется произвести следующие шаги:

в gdmn-front/packages/gdmn-server-api/src/pub-sub/api.ts:

*	`TTaskActionNames` -- добавить имя нового %NAME_ACTION%
* `AppAction` -- добавить имя нового %NAME_ACTION% 
*	`TTaskActionPayloadTypes` -- добавляем свойство с названием нового Action (TTaskActionNames.%NAME_ACTION%) и значением -- объектом, который будем передавать на сервер. 
*	`TTaskActionResultTypes` -- добавляем новое свойство с типом, который будет возвращаться с сервера.

в gdmn-front/packages/gdmn-server-api/src/pub-sub/commands.ts нужно создать новые типы:
```
export type T%NAME_ACTION%TaskCmd = TTaskCmd<TTaskActionNames.%NAME_ACTION%>;
export type T%NAME_ACTION%TaskCmdResult = TTaskCmdResult<TTaskActionNames%NAME_ACTION%>
```
в gdmn-front/src/app/services/GdmnPubSubApi.ts нужно добавить публичный метод: 
```
public %METHOD_NAME% (payload: TTaskActionPayloadTypes[TTaskActionNames.%NAME_ACTION%]): Promise<T%NAME_ACTION%TaskCmdResult> {
    		return this.runTaskRequestCmd({
      		payload: {
        		action: TTaskActionNames.%NAME_ACTION%,
        		payload
      		}
  	   });
 	 }
```
в данном методе нам требуется в payload передать тип того что мы хотим передать на сервер и указать тип возвращаемого с сервера ответа.
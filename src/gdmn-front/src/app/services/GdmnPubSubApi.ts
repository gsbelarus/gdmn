import {
  IPubSubMessage,
  PubSubClient,
  stringfyValues,
  TPubSubConnectStatus,
  TPubSubMsgPublishStatus,
  TStandardHeaderKey,
  WebStomp
} from '@gdmn/client-core';

import {
  _ISignResponseMeta,
  ICmdResult,
  IGdmnMessageData,
  IGdmnMessageError,
  ITaskProgressMessageData,
  ITaskStatusMessageData,
  TAuthCmd,
  TAuthCmdResult,
  TCreateAppTaskCmdResult,
  TDeleteAccountCmd,
  TDeleteAppTaskCmdResult,
  TDemoTaskCmdResult,
  TFetchQueryTaskCmdResult,
  TFetchSqlQueryTaskCmdResult,
  TGdmnErrorCodes,
  TGdmnPublishMessageMeta,
  TGdmnReceivedErrorMeta,
  TGdmnReceivedMessageMeta,
  TGdmnTopic,
  TGetAppsTaskCmdResult,
  TGetSchemaTaskCmdResult,
  TDefineEntityTaskCmdResult,
  TInterruptTaskCmdResult,
  TPingTaskCmdResult,
  TPrepareQueryTaskCmdResult,
  TPrepareSqlQueryTaskCmdResult,
  TQueryTaskCmdResult,
  TSqlQueryTaskCmdResult,
  TRefreshAuthCmd,
  TRefreshAuthCmdResult,
  TReloadSchemaTaskCmdResult,
  TSignInCmd,
  TSignInCmdResult,
  TSignOutCmd,
  TSignOutCmdResult,
  TSignUpCmd,
  TSignUpCmdResult,
  TTaskActionNames,
  TTaskActionPayloadTypes,
  TTaskCmd,
  TTaskCmdResult,
  TTaskResultMessageData,
  TInsertTaskCmdResult,
  TUpdateTaskCmdResult,
  TDeleteTaskCmdResult,
  TGetAppTemplatesTaskCmdResult,
  TSequenceQueryTaskCmdResult,
  TGetSessionsInfoCmdResult,
  TGetMainSessionsInfoCmdResult,
  TGetNextIdTaskCmdResult,
  TQuerySetTaskCmdResult,
  TAddEntityTaskCmdResult,
  TDeleteEntityTaskCmdResult,
  TQuerySettingTaskCmdResult,
  TEditEntityTaskCmdResult,
  TSqlPrepareTaskCmdResult,
  TSaveSettingTaskCmd,
  TSaveSettingTaskCmdResult
} from "@gdmn/server-api";
import { debugFnType, Versions } from '@stomp/stompjs'; // todo
import ExtendableError from 'es6-error';
import { EMPTY, merge, Observable, Subject, Subscription, throwError } from 'rxjs';
import { catchError, filter, first, map, mergeMap, tap } from 'rxjs/operators';

export class GdmnPubSubError extends ExtendableError {
  public errorData: IGdmnMessageError<TGdmnErrorCodes>;

  constructor(errMessage: IPubSubMessage<TGdmnReceivedErrorMeta>) {
    const errorData: IGdmnMessageError<TGdmnErrorCodes> = {
      code: errMessage.meta && errMessage.meta.code ? errMessage.meta.code : TGdmnErrorCodes.INTERNAL,
      message: errMessage.meta && errMessage.meta.message ? errMessage.meta.message : JSON.stringify(errMessage)
    };

    super(errorData.message);

    this.errorData = errorData;
  }
}

export class GdmnPubSubApi {
  public pubSubClient: PubSubClient;

  public taskActionResultObservable?: Observable<IPubSubMessage<TGdmnReceivedMessageMeta>>; // todo ReplaySubject
  public taskProgressResultObservable?: Observable<IPubSubMessage<TGdmnReceivedMessageMeta>>;
  public taskStatusResultObservable?: Observable<IPubSubMessage<TGdmnReceivedMessageMeta>>;

  private taskActionResultSubscription?: Subscription;
  private taskProgressResultSubscription?: Subscription;
  private taskStatusResultSubscription?: Subscription;

  private reconnectUrlQuery?: string;

  constructor(
    endpointUrl: string,
    debug?: debugFnType,
    onMaxCountAbnormallyReconnect?: (maxAbnormallyReconnectCount: number, context: ThisType<PubSubClient>) => void
  ) {
    // todo authScheme: TAuthScheme

    this.pubSubClient = new PubSubClient(
      new WebStomp({
        // todo: <IPubSubMessage<TGdmnReceivedErrorMeta>>
        brokerURL: endpointUrl,
        webSocketFactory: () => {
          return new WebSocket(
            endpointUrl + (this.reconnectUrlQuery ? `/?${this.reconnectUrlQuery}` : ""),
            Versions.default.protocolVersions()
          );
        },
        heartbeatIncoming: 2000,
        heartbeatOutgoing: 2000,
        reconnectDelay: 5000,
        stompVersions: new Versions([Versions.V1_2]), // todo
        logRawCommunication: true,
        debug
      }),
      5,
      onMaxCountAbnormallyReconnect
    );
  }

  public set onMaxCountAbnormallyReconnect(
    fn: (maxAbnormallyReconnectCount: number, context: ThisType<PubSubClient>) => void
  ) {
    this.pubSubClient.onMaxCountAbnormallyReconnect = fn;
  }

  public get errorMessageObservable(): Subject<IPubSubMessage<TGdmnReceivedErrorMeta>> {
    return <any>this.pubSubClient.errorMessageObservable;
  }

  public async signUp(cmd: TSignUpCmd): Promise<TSignUpCmdResult> {
    return this.sign(cmd);
  }

  public async signIn(cmd: TSignInCmd): Promise<TSignInCmdResult> {
    return this.sign(cmd);
  }

  public async signOut(cmd: TSignOutCmd): Promise<TSignOutCmdResult> {
    this.pubSubClient.disconnect();

    return await this.pubSubClient.connectionDisconnectedObservable
      .pipe(
        map(connectStatus => ({
          payload: null
        })),
        first()
      )
      .toPromise();
  }

  // todo: use
  public async refreshAuth(cmd: TRefreshAuthCmd): Promise<TRefreshAuthCmdResult> {
    return this.sign(cmd);
  }

  public async deleteAccount(cmd: TDeleteAccountCmd): Promise<TAuthCmdResult> {
    return this.auth(cmd, true);
  }

  public interruptTask(payload: TTaskActionPayloadTypes[TTaskActionNames.INTERRUPT]): Promise<TInterruptTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.INTERRUPT,
        payload
      }
    });
  }

  public reloadSchema(payload: TTaskActionPayloadTypes[TTaskActionNames.RELOAD_SCHEMA]): Promise<TReloadSchemaTaskCmdResult> {
    return this.runTaskRequestCmd<TTaskActionNames.RELOAD_SCHEMA>({
      payload: {
        action: TTaskActionNames.RELOAD_SCHEMA,
        payload
      }
    });
  }

  public demo(payload: TTaskActionPayloadTypes[TTaskActionNames.DEMO]): Observable<TDemoTaskCmdResult> {
    return this.runTaskCmd({
      payload: {
        action: TTaskActionNames.DEMO,
        payload
      }
    });
  }

  public ping(payload: TTaskActionPayloadTypes[TTaskActionNames.PING]): Observable<TPingTaskCmdResult> {
    return this.runTaskCmd({
      payload: {
        action: TTaskActionNames.PING,
        payload
      }
    });
  }

  public simplePing(payload: TTaskActionPayloadTypes[TTaskActionNames.PING]): Promise<TPingTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.PING,
        payload
      }
    });
  }

  public getSchema(payload: TTaskActionPayloadTypes[TTaskActionNames.GET_SCHEMA]): Promise<TGetSchemaTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.GET_SCHEMA,
        payload
      }
    });
  }

  public defineEntity(payload: TTaskActionPayloadTypes[TTaskActionNames.DEFINE_ENTITY]): Promise<TDefineEntityTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.DEFINE_ENTITY,
        payload
      }
    });
  }

  public query(payload: TTaskActionPayloadTypes[TTaskActionNames.QUERY]): Promise<TQueryTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.QUERY,
        payload
      }
    });
  }

  public querySet(payload: TTaskActionPayloadTypes[TTaskActionNames.QUERY_SET]): Promise<TQuerySetTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.QUERY_SET,
        payload
      }
    });
  }

  public sqlQuery(payload: TTaskActionPayloadTypes[TTaskActionNames.SQL_QUERY]): Promise<TSqlQueryTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.SQL_QUERY,
        payload
      }
    });
  }

  public prepareQuery(payload: TTaskActionPayloadTypes[TTaskActionNames.PREPARE_QUERY]): Observable<TPrepareQueryTaskCmdResult> {
    return this.runTaskCmd({
      payload: {
        action: TTaskActionNames.PREPARE_QUERY,
        payload
      }
    });
  }

  public prepareSqlQuery(payload: TTaskActionPayloadTypes[TTaskActionNames.PREPARE_SQL_QUERY]): Observable<TPrepareSqlQueryTaskCmdResult> {
    return this.runTaskCmd({
      payload: {
        action: TTaskActionNames.PREPARE_SQL_QUERY,
        payload
      }
    });
  }

  public sqlPrepare(payload: TTaskActionPayloadTypes[TTaskActionNames.SQL_PREPARE]): Observable<TSqlPrepareTaskCmdResult> {
    return this.runTaskCmd({
      payload: {
        action: TTaskActionNames.SQL_PREPARE,
        payload
      }
    });
  }

  public fetchQuery(payload: TTaskActionPayloadTypes[TTaskActionNames.FETCH_QUERY]): Promise<TFetchQueryTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.FETCH_QUERY,
        payload
      }
    });
  }

  public fetchSqlQuery(payload: TTaskActionPayloadTypes[TTaskActionNames.FETCH_SQL_QUERY]): Promise<TFetchSqlQueryTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.FETCH_SQL_QUERY,
        payload
      }
    });
  }

  public insert(payload: TTaskActionPayloadTypes[TTaskActionNames.INSERT]): Promise<TInsertTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.INSERT,
        payload
      }
    });
  }

  public update(payload: TTaskActionPayloadTypes[TTaskActionNames.UPDATE]): Promise<TUpdateTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.UPDATE,
        payload
      }
    });
  }

  public delete(payload: TTaskActionPayloadTypes[TTaskActionNames.DELETE]): Promise<TDeleteTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.DELETE,
        payload
      }
    });
  }

  public createApp(payload: TTaskActionPayloadTypes[TTaskActionNames.CREATE_APP]): Promise<TCreateAppTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.CREATE_APP,
        payload
      }
    });
  }

  public deleteApp(payload: TTaskActionPayloadTypes[TTaskActionNames.DELETE_APP]): Promise<TDeleteAppTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.DELETE_APP,
        payload
      }
    });
  }

  public getApps(): Promise<TGetAppsTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.GET_APPS,
        payload: undefined
      }
    });
  }

  public getAppTemplates(): Promise<TGetAppTemplatesTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.GET_APP_TEMPLATES,
        payload: undefined
      }
    });
  }

  public sequenceQuery(payload: TTaskActionPayloadTypes[TTaskActionNames.SEQUENCE_QUERY]): Promise<TSequenceQueryTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.SEQUENCE_QUERY,
        payload
      }
    });
  }

  public getSessionsInfo(payload: TTaskActionPayloadTypes[TTaskActionNames.GET_SESSIONS_INFO]): Promise<TGetSessionsInfoCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.GET_SESSIONS_INFO,
        payload
      }
    });
  }

  public getMainSessionsInfo(payload: TTaskActionPayloadTypes[TTaskActionNames.GET_MAIN_SESSIONS_INFO]): Promise<TGetMainSessionsInfoCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.GET_MAIN_SESSIONS_INFO,
        payload
      }
    });
  }

  public getNextID(payload: TTaskActionPayloadTypes[TTaskActionNames.GET_NEXT_ID]): Promise<TGetNextIdTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.GET_NEXT_ID,
        payload
      }
    });
  }

  public AddEntity(payload: TTaskActionPayloadTypes[TTaskActionNames.ADD_ENTITY]): Promise<TAddEntityTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.ADD_ENTITY,
        payload
      }
    });
  }

  public deleteEntity(payload: TTaskActionPayloadTypes[TTaskActionNames.DELETE_ENTITY]): Promise<TDeleteEntityTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.DELETE_ENTITY,
        payload
      }
    });
  }

  public editEntity(payload: TTaskActionPayloadTypes[TTaskActionNames.EDIT_ENTITY]): Promise<TEditEntityTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.EDIT_ENTITY,
        payload
      }
    });
  }

  public querySetting(payload: TTaskActionPayloadTypes[TTaskActionNames.QUERY_SETTING]): Promise<TQuerySettingTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.QUERY_SETTING,
        payload
      }
    });
  }

  public saveSetting(payload: TTaskActionPayloadTypes[TTaskActionNames.SAVE_SETTING]): Promise<TSaveSettingTaskCmdResult> {
    return this.runTaskRequestCmd({
      payload: {
        action: TTaskActionNames.SAVE_SETTING,
        payload
      }
    });
  }

  public async auth(cmd: TAuthCmd | TDeleteAccountCmd, reconnect: boolean = false): Promise<TAuthCmdResult> {
    // todo: tmp if !disconnected
    if (
      (this.pubSubClient.connectionStatusObservable.getValue() === TPubSubConnectStatus.CONNECTING ||
        this.pubSubClient.connectionStatusObservable.getValue() === TPubSubConnectStatus.CONNECTED) &&
      !reconnect
    ) {
      // //-//console.log('AUTH');

      this.subTasks();

      return EMPTY.toPromise(); // todo test
    }

    // //-//console.log('AUTH+connect');
    this.reconnectUrlQuery = "";
    this.pubSubClient.connect(stringfyValues(cmd.payload));

    return await this.pubSubClient.connectedMessageObservable
      .pipe(
        tap(connectedMessage => {
          this.reconnectUrlQuery = cmd.payload.session ? `session=${cmd.payload.session}` : ""; // todo
          this.pubSubClient.reconnectMeta.authorization = cmd.payload.authorization;
          this.updateReconnectMeta(connectedMessage);
          this.subTasks();
        }),
        map(connectedMessage => {
          const meta = connectedMessage.meta || {};
          return {
            payload: {
              session: meta.session || ""
            }
          };
        }),
        catchError((errMessage: IPubSubMessage<TGdmnReceivedErrorMeta>) => throwError(new GdmnPubSubError(errMessage))),
        first()
      )
      .toPromise();
  }

  public runTaskCmd<TActionName extends TTaskActionNames>(
    taskCmd: TTaskCmd<TActionName>
  ): Observable<TTaskCmdResult<TActionName>> {
    return <Observable<TTaskCmdResult<TActionName>>>this._runTaskCmd<TActionName>(taskCmd);
  }

  public runTaskRequestCmd<TActionName extends TTaskActionNames>(
    taskCmd: TTaskCmd<TActionName>
  ): Promise<TTaskCmdResult<TActionName>> {
    return <Promise<TTaskCmdResult<TActionName>>>this._runTaskCmd<TActionName>(taskCmd, true);
  }

  private async sign(cmd: TSignUpCmd | TSignInCmd | TRefreshAuthCmd): Promise<ICmdResult<_ISignResponseMeta, null>> {
    this.reconnectUrlQuery = "";
    this.pubSubClient.connect(stringfyValues(cmd.payload));

    return await this.pubSubClient.connectedMessageObservable
      .pipe(
        tap(connectedMessage => {
          this.reconnectUrlQuery =
            connectedMessage.meta && connectedMessage.meta.session ? `session=${connectedMessage.meta.session}` : ""; // todo
          this.updateReconnectMeta(connectedMessage);
        }),
        map(connectedMessage => {
          const meta = connectedMessage.meta || {};
          return {
            payload: {
              "access-token": meta["access-token"] || "",
              "refresh-token": meta["refresh-token"] || "",
              session: meta.session || ""
            }
          };
        }),
        catchError((errMessage: IPubSubMessage<TGdmnReceivedErrorMeta>) => throwError(new GdmnPubSubError(errMessage))),
        first()
      )
      .toPromise();
  }

  private subTasks(): void {
    // todo: test delete
    if (!!this.taskActionResultSubscription) {
      this.taskStatusResultSubscription!.unsubscribe();
      this.taskProgressResultSubscription!.unsubscribe();
      this.taskActionResultSubscription!.unsubscribe();
    }

    this.taskProgressResultObservable = this.pubSubClient.subscribe<IPubSubMessage<TGdmnReceivedMessageMeta>>(
      TGdmnTopic.TASK_PROGRESS
    );
    this.taskStatusResultObservable = this.pubSubClient.subscribe<IPubSubMessage<TGdmnReceivedMessageMeta>>(
      TGdmnTopic.TASK_STATUS
    );
    this.taskActionResultObservable = this.pubSubClient.subscribe<IPubSubMessage<TGdmnReceivedMessageMeta>>(
      TGdmnTopic.TASK,
      {
        ack: "client-individual"
      }
    );

    // //-//console.log('SUBSCRIBE');

    // todo: test delete
    this.taskProgressResultSubscription = this.taskProgressResultObservable!.subscribe(
      value => {
      }
      //-//console.log('[GDMN][PUB-SUB] taskProgressResult: ', value)
    );
    this.taskStatusResultSubscription = this.taskStatusResultObservable!.subscribe(
      value => {
      }
      //-//console.log('[GDMN][PUB-SUB] taskStatusResult: ', value)
    );
    this.taskActionResultSubscription = this.taskActionResultObservable!.subscribe(
      value => {
      }
      //-//console.log('[GDMN][PUB-SUB] taskActionResult: ', value)
    );
  }

  private updateReconnectMeta(connectedMessage: IPubSubMessage) {
    const meta = connectedMessage.meta || {};

    this.pubSubClient.reconnectMeta = {
      authorization: meta["access-token"] || this.pubSubClient.reconnectMeta.authorization || "",
      session: meta.session || this.pubSubClient.reconnectMeta.session || ""
    };
  }

  private _runTaskCmd<TActionName extends TTaskActionNames>(
    taskCmd: TTaskCmd<TActionName>,
    replyMode: boolean = false
  ) {
    const observ = this.pubSubClient
      .publish<IPubSubMessage<TGdmnPublishMessageMeta>>(TGdmnTopic.TASK, {
        meta: {
          action: taskCmd.payload.action,
          [TStandardHeaderKey.CONTENT_TYPE]: "application/json;charset=utf-8", // todo
          ...(replyMode ? {"reply-mode": "1"} : {})
        },
        data: JSON.stringify({payload: taskCmd.payload.payload})
      })
      .pipe(
        filter(msgPublishState => msgPublishState.status === TPubSubMsgPublishStatus.PUBLISHED),
        mergeMap(msgPublishState => {
          const taskKeyFilterOperator = filter<IPubSubMessage<TGdmnReceivedMessageMeta>>(
            message =>
              !!msgPublishState.meta && !!message.meta && message.meta["task-id"] === msgPublishState.meta["task-id"] // todo
          );

          const parseMsgDataMapOperator = map<IPubSubMessage<TGdmnReceivedMessageMeta>, IGdmnMessageData>(message => {
            if (!message.data) throw Error("[GDMN][PUB-SUB] Invalid server response (TaskCmdResult)");
            // parse date as js Date object
            const dateFormat = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
            return JSON.parse(message.data, (key, value) => {
              if (typeof value === "string" && dateFormat.test(value)) {
                return new Date(value);
              }
              return value;
            });
          });

          const meta = {
            taskKey: msgPublishState && msgPublishState.meta ? msgPublishState.meta["task-id"] : undefined
          };

          /*

             <<< MESSAGE
               destination:/task
               action:...
               message-id:msg-0
               ack:client-individual (optional)
               subscription:sub-0
               task-id:task-0
               content-type:application/json;charset=utf-8
               content-length:...

             payload (request payload)
             status
             error
             result (is sent only when the status is SUCCESS)

           */
          const taskActionResult = this.taskActionResultObservable!.pipe(
            taskKeyFilterOperator,
            first(),
            parseMsgDataMapOperator,
            map(resultMsgData => <TTaskResultMessageData<TActionName>>resultMsgData),
            map(resultMsgData => ({
              payload: {
                action: taskCmd.payload.action,
                status: resultMsgData.status,
                result: resultMsgData.result
              },
              error: resultMsgData.error,
              meta
            }))
          );

          if (replyMode) {
            return taskActionResult;
          }

          /*

             <<< MESSAGE
               destination:/task/progress
               action:...
               message-id:msg-0
               subscription:sub-0
               task-id:task-0
               content-type:application/json;charset=utf-8
               content-length:...

             payload (request payload)
             progress

           */
          const taskProgressResult = this.taskProgressResultObservable!.pipe(
            taskKeyFilterOperator,
            parseMsgDataMapOperator,
            map(resultMsgData => <ITaskProgressMessageData<TActionName>>resultMsgData),
            map(progressMsgData => ({
              payload: {
                action: taskCmd.payload.action,
                status: progressMsgData.status,
                progress: progressMsgData.progress
              },
              meta
            }))
          );

          /*
              <<< MESSAGE
                destination:/task/status
                action:...
                message-id:msg-0
                subscription:sub-0
                task-id:task-0
                content-type:application/json;charset=utf-8
                content-length:...

              payload (request payload)
              status

            */
          const taskStatusResult = this.taskStatusResultObservable!.pipe(
            taskKeyFilterOperator,
            parseMsgDataMapOperator,
            map(resultMsgData => <ITaskStatusMessageData<TActionName>>resultMsgData),
            map(statusMsgData => ({
              payload: {
                action: taskCmd.payload.action,
                status: statusMsgData.status
              },
              meta
            }))
          );

          return merge(taskActionResult, taskProgressResult, taskStatusResult);
        })
      );
    return replyMode ? observ.pipe(first()).toPromise() : observ;
  }
}

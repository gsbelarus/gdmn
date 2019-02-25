import { empty, merge, Observable, Subject, Subscription, throwError } from 'rxjs';
import { catchError, filter, first, map, mergeMap, tap } from 'rxjs/operators';
import { debugFnType, Versions } from '@stomp/stompjs'; // todo
import ExtendableError from 'es6-error';

import {
  _ISignResponseMeta,
  ICmdResult,
  IGdmnMessageData,
  IGdmnMessageError,
  ITaskProgressMessageData,
  ITaskStatusMessageData,
  TAuthCmd,
  TAuthCmdResult,
  TCreateAppTaskCmd,
  TCreateAppTaskCmdResult,
  TDeleteAccountCmd,
  TDeleteAppTaskCmd,
  TDeleteAppTaskCmdResult,
  TFetchQueryTaskCmd,
  TFetchQueryTaskCmdResult,
  TGdmnErrorCodes,
  TGdmnPublishMessageMeta,
  TGdmnReceivedErrorMeta,
  TGdmnReceivedMessageMeta,
  TGdmnTopic,
  TGetAppsTaskCmd,
  TGetAppsTaskCmdResult,
  TGetSchemaTaskCmd,
  TGetSchemaTaskCmdResult,
  TInterruptTaskCmd,
  TInterruptTaskCmdResult,
  TPingTaskCmd,
  TPingTaskCmdResult,
  TPrepareQueryTaskCmd,
  TPrepareQueryTaskCmdResult,
  TQueryTaskCmd,
  TQueryTaskCmdResult,
  TRefreshAuthCmd,
  TRefreshAuthCmdResult,
  TReloadSchemaTaskCmd,
  TReloadSchemaTaskCmdResult,
  TSignInCmd,
  TSignInCmdResult,
  TSignOutCmd,
  TSignOutCmdResult,
  TSignUpCmd,
  TSignUpCmdResult,
  TTaskActionNames,
  TTaskActionResultTypes,
  TTaskCmd,
  TTaskCmdResult,
  TTaskResultMessageData
} from '@gdmn/server-api';
import {
  IPubSubMessage,
  PubSubClient,
  stringfyValues,
  TPubSubConnectStatus,
  TPubSubMsgPublishStatus,
  TStandardHeaderKey,
  WebStomp
} from '@gdmn/client-core';

class GdmnPubSubError extends ExtendableError {
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

class GdmnPubSubApi {
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
            endpointUrl + (this.reconnectUrlQuery ? `/?${this.reconnectUrlQuery}` : ''),
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

  public interruptTask(cmd: TInterruptTaskCmd): Promise<TInterruptTaskCmdResult> {
    return this.runTaskRequestCmd<TTaskActionNames.INTERRUPT>(cmd);
  }

  public reloadSchema(cmd: TReloadSchemaTaskCmd): Promise<TReloadSchemaTaskCmdResult> {
    return this.runTaskRequestCmd<TTaskActionNames.RELOAD_SCHEMA>(cmd);
  }

  public ping(cmd: TPingTaskCmd): Observable<TPingTaskCmdResult> {
    return this.runTaskCmd<TTaskActionNames.PING>(cmd);
  }

  public getSchema(cmd: TGetSchemaTaskCmd): Promise<TGetSchemaTaskCmdResult> {
    return this.runTaskRequestCmd<TTaskActionNames.GET_SCHEMA>(cmd);
  }

  public query(cmd: TQueryTaskCmd): Promise<TQueryTaskCmdResult> {
    return this.runTaskRequestCmd<TTaskActionNames.QUERY>(cmd);
  }

  public prepareQuery(cmd: TPrepareQueryTaskCmd): Observable<TPrepareQueryTaskCmdResult> {
    return this.runTaskCmd<TTaskActionNames.PREPARE_QUERY>(cmd);
  }

  public fetchQuery(cmd: TFetchQueryTaskCmd): Promise<TFetchQueryTaskCmdResult> {
    return this.runTaskRequestCmd<TTaskActionNames.FETCH_QUERY>(cmd);
  }

  public createApp(cmd: TCreateAppTaskCmd): Observable<TCreateAppTaskCmdResult> {
    return this.runTaskCmd<TTaskActionNames.CREATE_APP>(cmd);
  }

  public deleteApp(cmd: TDeleteAppTaskCmd): Observable<TDeleteAppTaskCmdResult> {
    return this.runTaskCmd<TTaskActionNames.DELETE_APP>(cmd);
  }

  public getApps(cmd: TGetAppsTaskCmd): Observable<TGetAppsTaskCmdResult> {
    return this.runTaskCmd<TTaskActionNames.GET_APPS>(cmd);
  }

  public get errorMessageObservable(): Subject<IPubSubMessage<TGdmnReceivedErrorMeta>> {
    return <any>this.pubSubClient.errorMessageObservable;
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

      return empty().toPromise(); // todo test
    }

    // //-//console.log('AUTH+connect');
    this.reconnectUrlQuery = '';
    this.pubSubClient.connect(stringfyValues(cmd.payload));

    return await this.pubSubClient.connectedMessageObservable
      .pipe(
        tap(connectedMessage => {
          this.reconnectUrlQuery = cmd.payload.session ? `session=${cmd.payload.session}` : ''; // todo
          this.pubSubClient.reconnectMeta.authorization = cmd.payload.authorization;
          this.updateReconnectMeta(connectedMessage);
          this.subTasks();
        }),
        map(connectedMessage => {
          const meta = connectedMessage.meta || {};
          return {
            payload: {
              session: meta.session || ''
            }
          };
        }),
        catchError((errMessage: IPubSubMessage<TGdmnReceivedErrorMeta>) => throwError(new GdmnPubSubError(errMessage))),
        first()
      )
      .toPromise();
  }

  private async sign(cmd: TSignUpCmd | TSignInCmd | TRefreshAuthCmd): Promise<ICmdResult<_ISignResponseMeta, null>> {
    this.reconnectUrlQuery = '';
    this.pubSubClient.connect(stringfyValues(cmd.payload));

    return await this.pubSubClient.connectedMessageObservable
      .pipe(
        tap(connectedMessage => {
          this.reconnectUrlQuery =
            connectedMessage.meta && connectedMessage.meta.session ? `session=${connectedMessage.meta.session}` : ''; // todo
          this.updateReconnectMeta(connectedMessage);
        }),
        map(connectedMessage => {
          const meta = connectedMessage.meta || {};
          return {
            payload: {
              'access-token': meta['access-token'] || '',
              'refresh-token': meta['refresh-token'] || '',
              session: meta.session || ''
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
        ack: 'client-individual'
      }
    );

    // //-//console.log('SUBSCRIBE');

    // todo: test delete
    this.taskProgressResultSubscription = this.taskProgressResultObservable!.subscribe(
      value => {}
      //-//console.log('[GDMN][PUB-SUB] taskProgressResult: ', value)
    );
    this.taskStatusResultSubscription = this.taskStatusResultObservable!.subscribe(
      value => {}
      //-//console.log('[GDMN][PUB-SUB] taskStatusResult: ', value)
    );
    this.taskActionResultSubscription = this.taskActionResultObservable!.subscribe(
      value => {}
      //-//console.log('[GDMN][PUB-SUB] taskActionResult: ', value)
    );
  }

  private updateReconnectMeta(connectedMessage: IPubSubMessage) {
    const meta = connectedMessage.meta || {};

    this.pubSubClient.reconnectMeta = {
      authorization: meta['access-token'] || this.pubSubClient.reconnectMeta.authorization || '',
      session: meta.session || this.pubSubClient.reconnectMeta.session || ''
    };
  }

  private _runTaskCmd<TActionName extends keyof TTaskActionResultTypes>(
    taskCmd: TTaskCmd<TActionName>,
    replyMode: boolean = false
  ) {
    const observ = this.pubSubClient
      .publish<IPubSubMessage<TGdmnPublishMessageMeta>>(TGdmnTopic.TASK, {
        meta: {
          action: taskCmd.payload.action,
          [TStandardHeaderKey.CONTENT_TYPE]: 'application/json;charset=utf-8', // todo
          ...(replyMode ? { 'reply-mode': '1' } : {})
        },
        data: JSON.stringify({ payload: taskCmd.payload.payload })
      })
      .pipe(
        filter(msgPublishState => msgPublishState.status === TPubSubMsgPublishStatus.PUBLISHED),
        mergeMap(msgPublishState => {
          const taskIdFilterOperator = filter<IPubSubMessage<TGdmnReceivedMessageMeta>>(
            message =>
              !!msgPublishState.meta && !!message.meta && message.meta['task-id'] === msgPublishState.meta['task-id'] // todo
          );

          const parseMsgDataMapOperator = map<IPubSubMessage<TGdmnReceivedMessageMeta>, IGdmnMessageData>(message => {
            if (!message.data) throw Error('[GDMN][PUB-SUB] Invalid server response (TaskCmdResult)');
            return JSON.parse(message.data);
          });

          const meta = {
            taskId: msgPublishState && msgPublishState.meta ? msgPublishState.meta['task-id'] : undefined
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
            taskIdFilterOperator,
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
            taskIdFilterOperator,
            parseMsgDataMapOperator,
            map(resultMsgData => <ITaskProgressMessageData<TActionName>>resultMsgData),
            map(progressMsgData => ({
              payload: {
                action: taskCmd.payload.action,
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
            taskIdFilterOperator,
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

  private runTaskCmd<TActionName extends keyof TTaskActionResultTypes>(
    taskCmd: TTaskCmd<TActionName>
  ): Observable<TTaskCmdResult<TActionName>> {
    return <Observable<TTaskCmdResult<TActionName>>>this._runTaskCmd<TActionName>(taskCmd);
  }

  private runTaskRequestCmd<TActionName extends keyof TTaskActionResultTypes>(
    taskCmd: TTaskCmd<TActionName>
  ): Promise<TTaskCmdResult<TActionName>> {
    return <Promise<TTaskCmdResult<TActionName>>>this._runTaskCmd<TActionName>(taskCmd, true);
  }
}

export { GdmnPubSubApi, GdmnPubSubError };

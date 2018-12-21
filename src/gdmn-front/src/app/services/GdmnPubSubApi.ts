import { empty, merge, Observable, Subject, Subscription, throwError } from 'rxjs';
import { catchError, filter, first, map, mergeMap, tap } from 'rxjs/operators';
import { Versions } from '@stomp/stompjs'; // todo
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
  TGdmnErrorCodes,
  TGdmnPublishMessageMeta,
  TGdmnReceivedErrorMeta,
  TGdmnReceivedMessageMeta,
  TGdmnTopic,
  TGetAppsTaskCmd,
  TGetAppsTaskCmdResult,
  TGetSchemaTaskCmd,
  TGetSchemaTaskCmdResult,
  TPingTaskCmd,
  TPingTaskCmdResult,
  TQueryTaskCmd,
  TQueryTaskCmdResult,
  TRefreshAuthCmd,
  TRefreshAuthCmdResult,
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
  IPubSubMsgPublishState,
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

  constructor(endpointUrl: string) {
    // todo authScheme: TAuthScheme

    this.pubSubClient = new PubSubClient(
      new WebStomp({
        // todo: <IPubSubMessage<TGdmnReceivedErrorMeta>>
        brokerURL: endpointUrl,
        heartbeatIncoming: 2000,
        heartbeatOutgoing: 2000,
        reconnectDelay: 5000,
        stompVersions: new Versions([Versions.V1_2]) // todo
      })
    );
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
        map<TPubSubConnectStatus, TSignOutCmdResult>(connectStatus => ({
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

  public ping(cmd: TPingTaskCmd): Observable<TPingTaskCmdResult> {
    return this.runTaskCmd<TTaskActionNames.PING>(cmd);
  }

  public getSchema(cmd: TGetSchemaTaskCmd): Observable<TGetSchemaTaskCmdResult> {
    return this.runTaskCmd<TTaskActionNames.GET_SCHEMA>(cmd);
  }

  public getData(cmd: TQueryTaskCmd): Observable<TQueryTaskCmdResult> {
    return this.runTaskCmd<TTaskActionNames.QUERY>(cmd);
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
      console.log('AUTH');

      this.subTasks();

      return empty().toPromise(); // todo test
    }

    console.log('AUTH+connect');

    this.pubSubClient.connect(stringfyValues(cmd.payload));

    return await this.pubSubClient.connectedMessageObservable
      .pipe(
        tap(connectedMessage => {
          this.pubSubClient.reconnectMeta.authorization = cmd.payload.authorization;
          this.updateReconnectMeta(connectedMessage);
          this.subTasks();
        }),
        map<IPubSubMessage, TAuthCmdResult>(connectedMessage => {
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
    this.pubSubClient.connect(stringfyValues(cmd.payload));

    return await this.pubSubClient.connectedMessageObservable
      .pipe(
        tap(connectedMessage => {
          this.updateReconnectMeta(connectedMessage);
        }),
        map<IPubSubMessage, ICmdResult<_ISignResponseMeta, null>>(connectedMessage => {
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
    ); // fixme: type ts 3.2
    this.taskStatusResultObservable = this.pubSubClient.subscribe<IPubSubMessage<TGdmnReceivedMessageMeta>>(
      TGdmnTopic.TASK_STATUS
    ); // fixme: type ts 3.2
    this.taskActionResultObservable = this.pubSubClient.subscribe<IPubSubMessage<TGdmnReceivedMessageMeta>>(
      TGdmnTopic.TASK,
      {
        ack: 'client-individual'
      }
    ); // fixme: type ts 3.2

    console.log('SUBSCRIBE');

    // todo: test delete
    this.taskProgressResultSubscription = this.taskProgressResultObservable!.subscribe(value =>
      console.log('taskProgressResult: ', value)
    );
    this.taskStatusResultSubscription = this.taskStatusResultObservable!.subscribe(value =>
      console.log('taskStatusResult: ', value)
    );
    this.taskActionResultSubscription = this.taskActionResultObservable!.subscribe(value =>
      console.log('taskActionResult: ', value)
    );
  }

  private updateReconnectMeta(connectedMessage: IPubSubMessage) {
    const meta = connectedMessage.meta || {};

    this.pubSubClient.reconnectMeta = {
      authorization: meta['access-token'] || this.pubSubClient.reconnectMeta.authorization || '',
      session: meta.session || this.pubSubClient.reconnectMeta.session || ''
    };
  }

  private runTaskCmd<TActionName extends keyof TTaskActionResultTypes>(
    taskCmd: TTaskCmd<TActionName>
  ): Observable<TTaskCmdResult<TActionName>> {
    return this.pubSubClient
      .publish<IPubSubMessage<TGdmnPublishMessageMeta>>(TGdmnTopic.TASK, {
        meta: {
          action: taskCmd.payload.action,
          [TStandardHeaderKey.CONTENT_TYPE]: 'application/json;charset=utf-8' // todo
        },
        data: JSON.stringify({ payload: taskCmd.payload.payload })
      })
      .pipe<IPubSubMsgPublishState, TTaskCmdResult<TActionName>>(
        filter(msgPublishState => msgPublishState.status === TPubSubMsgPublishStatus.PUBLISHED),
        mergeMap<IPubSubMsgPublishState, TTaskCmdResult<TActionName>>(msgPublishState => {
          const taskIdFilterOperator = filter<IPubSubMessage<TGdmnReceivedMessageMeta>>(
            message =>
              !!msgPublishState.meta && !!message.meta && message.meta['task-id'] === msgPublishState.meta['task-id'] // todo
          );

          const parseMsgDataMapOperator = map<IPubSubMessage<TGdmnReceivedMessageMeta>, IGdmnMessageData>(message => {
            if (!message.data) throw Error('Invalid server response (TaskCmdResult)');
            return JSON.parse(message.data);
          });

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
            map<IGdmnMessageData, TTaskResultMessageData<TActionName>>(
              resultMsgData => <TTaskResultMessageData<TActionName>>resultMsgData
            ),
            map<TTaskResultMessageData<TActionName>, TTaskCmdResult<TActionName>>(resultMsgData => ({
              payload: {
                action: taskCmd.payload.action,
                status: resultMsgData.status,
                result: resultMsgData.result
              },
              error: resultMsgData.error
            }))
          );

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
            map<IGdmnMessageData, ITaskProgressMessageData<TActionName>>(
              resultMsgData => <ITaskProgressMessageData<TActionName>>resultMsgData
            ),
            map<ITaskProgressMessageData<TActionName>, TTaskCmdResult<TActionName>>(progressMsgData => ({
              payload: {
                action: taskCmd.payload.action,
                progress: progressMsgData.progress
              }
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
            map<IGdmnMessageData, ITaskStatusMessageData<TActionName>>(
              resultMsgData => <ITaskStatusMessageData<TActionName>>resultMsgData
            ),
            map<ITaskStatusMessageData<TActionName>, TTaskCmdResult<TActionName>>(statusMsgData => ({
              payload: {
                action: taskCmd.payload.action,
                status: statusMsgData.status
              }
            }))
          );

          return merge(taskActionResult, taskProgressResult, taskStatusResult);
        })
      );
  }
}

export { GdmnPubSubApi, GdmnPubSubError };

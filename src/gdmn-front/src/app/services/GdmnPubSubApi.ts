import { empty, merge, Observable, Subject, Subscription, throwError } from 'rxjs';
import { catchError, filter, first, map, mergeMap } from 'rxjs/operators';
import {
  _ISignResponseMeta,
  ICmdResult,
  ITaskProgressMessageData,
  ITaskStatusMessageData,
  TAuthCmd,
  TAuthCmdResult,
  TCreateAppTaskCmd,
  TCreateAppTaskCmdResult,
  TDeleteAccountCmd,
  TDeleteAccountCmdResult,
  TDeleteAppTaskCmd,
  TDeleteAppTaskCmdResult,
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
  TPubSubConnectStatus,
  TPubSubMsgPublishStatus,
  TStandardHeaderKey,
  WebStomp
} from '@gdmn/client-core';

import { Versions } from '@stomp/stompjs';

class GdmnPubSubApi {
  public pubSubClient: PubSubClient;

  private taskActionResultObservable?: Observable<IPubSubMessage<TGdmnReceivedMessageMeta>>; // todo ReplaySubject
  private taskProgressResultObservable?: Observable<IPubSubMessage<TGdmnReceivedMessageMeta>>;
  private taskStatusResultObservable?: Observable<IPubSubMessage<TGdmnReceivedMessageMeta>>;
  private taskActionResultSubscription?: Subscription;
  private taskProgressResultSubscription?: Subscription;
  private taskStatusResultSubscription?: Subscription;

  constructor(endpointUrl: string) {
    // todo authScheme: TAuthScheme

    this.pubSubClient = new PubSubClient(
      new WebStomp({
        brokerURL: endpointUrl,
        // connectHeaders,
        // disconnectHeaders,
        heartbeatIncoming: 2000, // todo 0
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

  public async refreshAuth(cmd: TRefreshAuthCmd): Promise<TRefreshAuthCmdResult> {
    return this.sign(cmd);
  }

  public async deleteAccount(cmd: TDeleteAccountCmd): Promise<TAuthCmdResult> {
    return this.auth(cmd);
  }

  public async auth(cmd: TAuthCmd | TDeleteAccountCmd): Promise<TAuthCmdResult> {
    // todo: tmp
    if (
      ((<any>cmd).payload['delete-user'] !== 1 &&
        this.pubSubClient.connectionStatusObservable.getValue() == TPubSubConnectStatus.CONNECTED) ||
      this.pubSubClient.connectionStatusObservable.getValue() == TPubSubConnectStatus.CONNECTING
    ) {
      console.log('AUTH');

      this.taskActionResultObservable = this.pubSubClient.subscribe<IPubSubMessage<TGdmnReceivedMessageMeta>>(
        TGdmnTopic.TASK,
        {
          ack: 'client-individual'
        }
      );
      this.taskProgressResultObservable = this.pubSubClient.subscribe<IPubSubMessage<TGdmnReceivedMessageMeta>>(
        TGdmnTopic.TASK_PROGRESS
      );

      this.taskStatusResultObservable = this.pubSubClient.subscribe<IPubSubMessage<TGdmnReceivedMessageMeta>>(
        TGdmnTopic.TASK_STATUS
      );

      // setTimeout(()=>{

      console.log('SUBSCRIBE');
      // todo: tmp

      this.taskActionResultSubscription = this.taskActionResultObservable!.subscribe(value =>
        console.log('taskActionResult')
      );

      this.taskProgressResultSubscription = this.taskProgressResultObservable!.subscribe(value =>
        console.log('taskProgressResult')
      );
      this.taskStatusResultSubscription = this.taskStatusResultObservable!.subscribe(value =>
        console.log('taskStatusResult')
      );

      return empty().toPromise();
    }

    console.log('AUTH+connect');
    this.pubSubClient.connect(<any>cmd.payload); // fixme: type

    // todo: fix 'authorization' (if 'session')

    return await this.pubSubClient.connectedMessageObservable
      .pipe(
        map<IPubSubMessage, TAuthCmdResult>(connectedMessage => {
          const meta = connectedMessage.meta || {};

          // todo: tmp
          this.pubSubClient.reconnectMeta = {
            // ...this.pubSubClient.reconnectMeta,
            authorization: cmd.payload.authorization || this.pubSubClient.reconnectMeta['access-token'] || '', // todo ?
            session: meta.session || this.pubSubClient.reconnectMeta.session || ''
          };

          console.log('auth: reconnectMeta', this.pubSubClient.reconnectMeta);

          return {
            payload: {
              session: meta.session || ''
            }
            // error
          };
        }),
        catchError((errMessage: IPubSubMessage<TGdmnReceivedErrorMeta>) => {
          // todo: IGdmnMessageError
          return throwError(errMessage.meta ? new Error(errMessage.meta.message) : errMessage);
        }),
        first()
      )
      .toPromise()
      .then(result => {
        this.taskActionResultObservable = this.pubSubClient.subscribe<IPubSubMessage<TGdmnReceivedMessageMeta>>(
          TGdmnTopic.TASK,
          {
            ack: 'client-individual'
          }
        );
        this.taskProgressResultObservable = this.pubSubClient.subscribe<IPubSubMessage<TGdmnReceivedMessageMeta>>(
          TGdmnTopic.TASK_PROGRESS
        );

        this.taskStatusResultObservable = this.pubSubClient.subscribe<IPubSubMessage<TGdmnReceivedMessageMeta>>(
          TGdmnTopic.TASK_STATUS
        );

        // setTimeout(()=>{

        console.log('SUBSCRIBE');
        // todo: tmp

        this.taskActionResultSubscription = this.taskActionResultObservable!.subscribe(value =>
          console.log('taskActionResult')
        );

        this.taskProgressResultSubscription = this.taskProgressResultObservable!.subscribe(value =>
          console.log('taskProgressResult')
        );
        this.taskStatusResultSubscription = this.taskStatusResultObservable!.subscribe(value =>
          console.log('taskStatusResult')
        );
        // }, 10000);

        return result;
      });
  }

  public async signOut(cmd: TSignOutCmd): Promise<TSignOutCmdResult> {
    // todo tmp
    // this.taskActionResultSubscription!.unsubscribe();
    // this.taskProgressResultSubscription!.unsubscribe();
    // this.taskStatusResultSubscription!.unsubscribe();

    this.pubSubClient.connectionStatusObservable
      .pipe(
        filter(value => value === TPubSubConnectStatus.DISCONNECTING),
        first()
      )
      .subscribe(() => {
        console.log('signOut: DISCONNECTING sub');

        if (!!this.taskActionResultSubscription) {
          this.taskActionResultSubscription!.unsubscribe();
          this.taskProgressResultSubscription!.unsubscribe();
          this.taskStatusResultSubscription!.unsubscribe();
        }
      });

    console.log('cmd.payload', cmd.payload);
    this.pubSubClient.disconnect();

    return await this.pubSubClient.connectionDisconnectedObservable
      .pipe(
        map<TPubSubConnectStatus, TSignOutCmdResult>(connectStatus => ({
          payload: null
        })),
        first()
      )
      .toPromise()
      .then(result => {
        // todo tmp
        // this.taskActionResultObservable = undefined;
        // this.taskProgressResultObservable = undefined;
        // this.taskStatusResultObservable = undefined;

        // this.taskActionResultSubscription!.unsubscribe();
        // this.taskProgressResultSubscription!.unsubscribe();
        // this.taskStatusResultSubscription!.unsubscribe();

        return result;
      });
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

  public get errorMessageObservable(): Subject<IPubSubMessage> {
    return this.pubSubClient.errorMessageObservable;
  }

  private async sign(cmd: TSignUpCmd | TSignInCmd | TRefreshAuthCmd): Promise<ICmdResult<_ISignResponseMeta, null>> {
    // const sessionSubscription = this.pubSubClient.connectedMessageObservable
    //   .pipe(
    //     map<IPubSubMessage, string | undefined>(
    //       connectedMessage => (connectedMessage.meta ? connectedMessage.meta['session'] : undefined) // todo: session key
    //     ),
    //     distinctUntilChanged()
    //   )
    //   .subscribe(session => {
    //     console.log('session: ' + session);
    //
    //     // this.pubSubClient.reconnectMeta = { 'session': session, ...this.pubSubClient.reconnectMeta }; // todo: session key
    //   });

    this.pubSubClient.connect(<any>cmd.payload); // fixme: type

    return await this.pubSubClient.connectedMessageObservable
      .pipe(
        map<IPubSubMessage, ICmdResult<_ISignResponseMeta, null>>(connectedMessage => {
          const meta = connectedMessage.meta || {};

          // todo: tmp
          this.pubSubClient.reconnectMeta = {
            // ...this.pubSubClient.reconnectMeta || {},
            authorization: meta['access-token'] || this.pubSubClient.reconnectMeta['access-token'] || '',
            session: meta.session || this.pubSubClient.reconnectMeta.session || ''
          };

          console.log('sign: reconnectMeta', this.pubSubClient.reconnectMeta);

          return {
            payload: {
              'access-token': meta['access-token'] || '',
              'refresh-token': meta['refresh-token'] || '',
              session: meta.session || ''
            }
            // error
          };
        }),
        catchError((errMessage: IPubSubMessage<TGdmnReceivedErrorMeta>) => {
          // todo: IGdmnMessageError
          return throwError(errMessage.meta ? new Error(errMessage.meta.message) : errMessage);
        }),
        // finalize(() => sessionSubscription.unsubscribe()),
        first()
      )
      .toPromise();
  }

  private runTaskCmd<TActionName extends keyof TTaskActionResultTypes>(
    taskCmd: TTaskCmd<TActionName>
  ): Observable<TTaskCmdResult<TActionName>> {
    return this.pubSubClient
      .publish<IPubSubMessage<TGdmnPublishMessageMeta>>(TGdmnTopic.TASK, {
        // fixme: type
        meta: {
          action: taskCmd.payload.action,
          [TStandardHeaderKey.CONTENT_TYPE]: 'application/json;charset=utf-8' // todo
        },
        data: JSON.stringify({ payload: taskCmd.payload.payload })
      })
      .pipe(
        filter(
          (msgPublishState: IPubSubMsgPublishState) => msgPublishState.status === TPubSubMsgPublishStatus.PUBLISHED
        ),
        mergeMap(msgPublishState => {
          // fixme: type ,TTaskCmdResult<TActionName>
          const taskIdFilterOperator = filter(
            (
              message: IPubSubMessage<Partial<TGdmnReceivedMessageMeta>> // fixme: type
            ) => !!msgPublishState.meta && !!message.meta && message.meta['task-id'] === msgPublishState.meta['task-id']
          );

          const parseMsgDataMapOperator = map((message: any) => {
            // fixme: type  IPubSubMessage<Partial<TGdmnReceivedMessageMeta>>, ITaskStatusMessageData<TActionName>
            return JSON.parse(message.data || '');
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
            parseMsgDataMapOperator,
            map<TTaskResultMessageData<TActionName>, TTaskCmdResult<TActionName>>((resultMsgData: any) => ({
              // fixme: type
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
            map<ITaskProgressMessageData<TActionName>, TTaskCmdResult<TActionName>>((progressMsgData: any) => ({
              // fixme: type
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
            map<ITaskStatusMessageData<TActionName>, TTaskCmdResult<TActionName>>((statusMsgData: any) => ({
              // fixme: type
              payload: {
                action: taskCmd.payload.action,
                status: statusMsgData.status
              }
            }))
          );

          return merge(taskActionResult, taskProgressResult, taskStatusResult);
        })
      );

    // todo publishing status
  }
}

// todo stop sub

export { GdmnPubSubApi };

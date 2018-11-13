import { Observable, throwError } from 'rxjs';
import { catchError, filter, first, last, map, merge, take } from 'rxjs/operators';
import {
  _ISignResponseMeta,
  ICmdResult,
  IGdmnMessageError,
  ITaskProgressMessageData,
  ITaskStatusMessageData,
  TAuthCmd,
  TAuthCmdResult,
  TCreateAppTaskCmd,
  TCreateAppTaskCmdResult,
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
  TPubSubMsgPublishStatus,
  TStandardHeaderKey,
  WebStomp
} from '@gdmn/client-core';

class GdmnPubSubApi {
  public pubSubClient: PubSubClient;

  constructor(endpointUrl: string) {
    // todo authScheme: TAuthScheme

    this.pubSubClient = new PubSubClient(
      new WebStomp({
        brokerURL: endpointUrl,
        // connectHeaders,
        // disconnectHeaders,
        heartbeatIncoming: 0,
        heartbeatOutgoing: 20000,
        reconnectDelay: 5000
        // stompVersions
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

  public async auth(cmd: TAuthCmd): Promise<TAuthCmdResult> {
    this.pubSubClient.connect(<any>cmd.payload); // fixme: type

    return await this.pubSubClient.connectedMessageObservable
      .pipe(
        map<IPubSubMessage, TAuthCmdResult>(connectedMessage => {
          const meta = connectedMessage.meta || {};

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
      .toPromise();
  }

  // todo signout (disconnect)
  // todo stop sub

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

  private async sign(cmd: TSignUpCmd | TSignInCmd | TRefreshAuthCmd): Promise<ICmdResult<_ISignResponseMeta, null>> {
    this.pubSubClient.connect(<any>cmd.payload); // fixme: type

    return await this.pubSubClient.connectedMessageObservable
      .pipe(
        map<IPubSubMessage, ICmdResult<_ISignResponseMeta, null>>(connectedMessage => {
          const meta = connectedMessage.meta || {};

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
        data: JSON.stringify(taskCmd.payload.payload)
      })
      .pipe(
        filter(
          (msgPublishState: IPubSubMsgPublishState) => msgPublishState.status === TPubSubMsgPublishStatus.PUBLISHED
        ),
        map<IPubSubMsgPublishState, any>(msgPublishState => {
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
          const taskActionResult = this.pubSubClient
            .subscribe<IPubSubMessage<TGdmnReceivedMessageMeta>>(TGdmnTopic.TASK)
            .pipe(
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
          const taskProgressResult = this.pubSubClient
            .subscribe<IPubSubMessage<TGdmnReceivedMessageMeta>>(TGdmnTopic.TASK_PROGRESS)
            .pipe(
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
          const taskStatusResult = this.pubSubClient
            .subscribe<IPubSubMessage<TGdmnReceivedMessageMeta>>(TGdmnTopic.TASK_STATUS)
            .pipe(
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

export { GdmnPubSubApi };

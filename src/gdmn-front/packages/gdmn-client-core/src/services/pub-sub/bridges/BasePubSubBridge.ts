import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { IPubSubMessage, IPubSubMessageMeta } from '../PubSubClient';

const enum TPubSubConnectStatus {
  CONNECTED,
  CONNECTING, // todo: set on stomp.beforeconnect
  DISCONNECTING,
  DISCONNECTED
  // todo: RECONNECTING
}

const enum TPubSubMsgPublishStatus {
  PUBLISHING /* sent*/,
  PUBLISHED /* receipted*/
}

interface IPubSubMsgPublishState {
  status: TPubSubMsgPublishStatus;
  meta?: IPubSubMessageMeta;
}

abstract class BasePubSubBridge<
  TErrorMessage extends IPubSubMessage = IPubSubMessage,
  TConnectMeta extends IPubSubMessageMeta = IPubSubMessageMeta,
  TDisconnectMeta extends IPubSubMessageMeta = IPubSubMessageMeta,
  TSubcribeMeta extends IPubSubMessageMeta = IPubSubMessageMeta,
> {
  /* connect status*/
  public connectionStatusObservable: BehaviorSubject<TPubSubConnectStatus> = new BehaviorSubject<TPubSubConnectStatus>(
    TPubSubConnectStatus.DISCONNECTED
  );
  public connectionConnectedObservable: Observable<TPubSubConnectStatus> = this.connectionStatusObservable.pipe(
    filter((currentState: TPubSubConnectStatus) => currentState === TPubSubConnectStatus.CONNECTED)
  );

  public connectedMessageObservable: Subject<IPubSubMessage> = new Subject();
  public errorMessageObservable: Subject<TErrorMessage> = new Subject();

  public abstract set reconnectMeta(meta: IPubSubMessageMeta);
  public abstract get reconnectMeta(): IPubSubMessageMeta;

  public abstract connect(meta?: TConnectMeta): void | never;

  public abstract disconnect(meta?: TDisconnectMeta): void;

  public abstract publish(topic: string, message: IPubSubMessage): Subject<IPubSubMsgPublishState> | never;

  public abstract subscribe<TMessage extends IPubSubMessage = IPubSubMessage>(
    topic: string,
    meta?: TSubcribeMeta
  ): Observable<TMessage> | never;

  public isConnected(): boolean {
    return this.connectionStatusObservable.getValue() === TPubSubConnectStatus.CONNECTED;
  }
}

export { BasePubSubBridge, TPubSubConnectStatus, IPubSubMsgPublishState, TPubSubMsgPublishStatus };

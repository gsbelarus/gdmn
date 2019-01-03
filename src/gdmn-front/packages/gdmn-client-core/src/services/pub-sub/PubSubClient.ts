import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import {
  BasePubSubBridge,
  IPubSubMsgPublishState,
  TPubSubConnectStatus,
  TPubSubMsgPublishStatus
} from './bridges/BasePubSubBridge';
import { debugFnType } from '@stomp/stompjs';

interface IPubSubMessageMeta {
  [key: string]: string | undefined;
}

interface IPubSubMessage<TMeta = IPubSubMessageMeta> {
  meta?: TMeta /* metadata / context / attributes - extra metadata associated by the publisher with the message.  (app-specific headers (like, publish_time) + protocol headers (like, message_id))*/;
  data?: string;
}

interface IQueuedPublishMessage {
  topic: string;
  message: IPubSubMessage;
  publishStateObservable: Subject<IPubSubMsgPublishState>;
}

class PubSubClient {

  private readonly bridge: BasePubSubBridge;
  /* locally queued messages when broker is not connected or message not receipted*/
  private queuedPublishMessages: IQueuedPublishMessage[] = [];

  private readonly maxAbnormallyReconnectCount: number | undefined;
  private abnormallyReconnectCounter: number = 0;

  public onMaxCountAbnormallyReconnect: (maxAbnormallyReconnectCount: number, context: ThisType<PubSubClient>) => void;

  public connectionDisconnectedObservable: Observable<TPubSubConnectStatus>;

  public readonly activateConnection: () => void;
  public readonly deactivateConnection: () => void;
  public readonly connect: (meta?: IPubSubMessageMeta) => void | never;
  public readonly disconnect: (meta?: IPubSubMessageMeta) => void;
  public readonly subscribe: <TMessage extends IPubSubMessage = IPubSubMessage>(
    topic: string,
    meta?: IPubSubMessageMeta
  ) => Observable<TMessage> | never; // fixme: type ts 3.2

  constructor(
    bridge: BasePubSubBridge,
    maxAbnormallyReconnectCount?: number,
    onMaxCountAbnormallyReconnect?: (maxAbnormallyReconnectCount: number, context: ThisType<PubSubClient>) => void
  ) {
    this.bridge = bridge;

    // todo tmp
    this.bridge.connectionStatusObservable.subscribe(value => console.log('connectionStatusObservable: ' + value));

    this.connectionDisconnectedObservable = this.bridge.connectionStatusObservable.pipe(
      filter((currentState: TPubSubConnectStatus) => currentState === TPubSubConnectStatus.DISCONNECTED)
    );
    this.connect = this.bridge.connect.bind(this.bridge);
    this.disconnect = this.bridge.disconnect.bind(this.bridge);
    this.subscribe = this.bridge.subscribe.bind(this.bridge);
    this.activateConnection = this.bridge.activateConnection.bind(this.bridge);
    this.deactivateConnection = this.bridge.deactivateConnection.bind(this.bridge);

    this.bridge.onAbnormallyDeactivate = this.onAbnormallyDeactivate;

    this.bridge.connectionConnectedObservable.subscribe(
      // todo connectedMessage
      () => {
        // console.log('connectedMessage');
        this.queuePublish();
      },
      error => {
        // todo: resubscribe ?
        // console.log('connectedMessage error');
      }
    );
    this.connectionDisconnectedObservable.subscribe(() => {
      this.abnormallyReconnectCounter = 0;
      this.queuedPublishMessages = []; // todo complete
    });

    this.errorMessageObservable.subscribe((errorMessage: IPubSubMessage) => {
      if (!this.bridge.isConnected()) {
        this.connectedMessageObservable.error(errorMessage);
        this.connectedMessageObservable = new Subject();
      }
    });

    this.maxAbnormallyReconnectCount = maxAbnormallyReconnectCount;
    this.onMaxCountAbnormallyReconnect = onMaxCountAbnormallyReconnect || (() => {});
  }

  /*
   * connection was closed abnormally
   */
  private onAbnormallyDeactivate: () => void = () => {
    if (this.maxAbnormallyReconnectCount !== undefined) {
      console.log('onAbnormallyDeactivate');
      if (this.abnormallyReconnectCounter < this.maxAbnormallyReconnectCount) {
        this.abnormallyReconnectCounter++;
      } else {
        console.log('[PUB-SUB] onAbnormallyDeactivate -> onMaxCountAbnormallyReconnect ');
        this.onMaxCountAbnormallyReconnect(this.maxAbnormallyReconnectCount, this);
        this.abnormallyReconnectCounter = 0;
      }
    }
  };

  public publish<TMessage extends IPubSubMessage = IPubSubMessage>(
    topic: string,
    message: TMessage
  ): Subject<IPubSubMsgPublishState> {
    const queuedMessage: IQueuedPublishMessage = { topic, message, publishStateObservable: new Subject() };
    this.queuedPublishMessages.push(queuedMessage);

    this.queuedMessagePublish(queuedMessage);

    return queuedMessage.publishStateObservable;
  }

  public get connectedMessageObservable(): Subject<IPubSubMessage> {
    return this.bridge.connectedMessageObservable;
  }

  public set connectedMessageObservable(v: Subject<IPubSubMessage>) {
    this.bridge.connectedMessageObservable = v;
  }

  /// todo tmp test
  public get connectionStatusObservable(): BehaviorSubject<TPubSubConnectStatus> {
    return this.bridge.connectionStatusObservable;
  }

  public get errorMessageObservable(): Subject<IPubSubMessage> {
    return this.bridge.errorMessageObservable;
  }

  public set reconnectMeta(meta: IPubSubMessageMeta) {
    this.bridge.reconnectMeta = meta;
  }

  public get reconnectMeta(): IPubSubMessageMeta {
    return this.bridge.reconnectMeta;
  }

  public set debug(fn: debugFnType) {
    this.bridge.debug = fn;
  }

  private queuePublish(): void {
    console.log(`[PUB-SUB] Will try sending queued messages...`);
    console.log(this.queuedPublishMessages);

    this.queuedPublishMessages.forEach(queuedMessage => {
      console.log(`[PUB-SUB] Attempting to send...`);
      console.log(queuedMessage);
      this.queuedMessagePublish(queuedMessage);
    });
  }

  private queuedMessagePublish(queuedMessage: IQueuedPublishMessage): void {
    if (!this.bridge.isConnected()) {
      console.log(`[PUB-SUB] Not connected, queueing message...`);
      return;
    }

    this.bridge.publish(queuedMessage.topic, queuedMessage.message).subscribe(publishState => {
      queuedMessage.publishStateObservable.next(publishState);

      if (publishState.status === TPubSubMsgPublishStatus.PUBLISHED) {
        const itemIndex = this.queuedPublishMessages.findIndex(item => item === queuedMessage);
        if (itemIndex !== -1) {
          this.queuedPublishMessages.splice(itemIndex, 1);
        }

        // queuedMessage.publishStatusObservable.complete(); // todo
      }
    });
  }
}

export { PubSubClient, IPubSubMessage, IPubSubMessageMeta };

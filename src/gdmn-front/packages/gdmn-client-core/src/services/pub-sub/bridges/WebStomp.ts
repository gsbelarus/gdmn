import {
  Client,
  Message,
  StompHeaders,
  StompSubscription,
  Versions,
  messageCallbackType,
  frameCallbackType,
  debugFnType,
  closeEventCallbackType
} from '@stomp/stompjs';
import { Observable, Subject, Subscription, Subscriber } from 'rxjs';
import { share } from 'rxjs/operators';

import {
  TDisconnectFrameHeaders,
  TSendFrameHeaders,
  TStompFrameHeaders,
  TSubcribeFrameHeaders
} from '../protocols/stomp-protocol-v1.2';
import {
  BasePubSubBridge,
  IPubSubMsgPublishState,
  TPubSubConnectStatus,
  TPubSubMsgPublishStatus
} from './BasePubSubBridge';
import { IPubSubMessage } from '../PubSubClient';
import { generateGuid } from '../../../utils/helpers';

interface IStompServiceConfig {
  /**
   * See [Client#brokerURL]{@link Client#brokerURL}.
   */
  brokerURL?: string;
  /**
   * See See [Client#stompVersions]{@link Client#stompVersions}.
   */
  stompVersions?: Versions;
  /**
   * See [Client#webSocketFactory]{@link Client#webSocketFactory}.
   */
  webSocketFactory?: () => any;
  /**
   * See [Client#reconnectDelay]{@link Client#reconnectDelay}.
   */
  reconnectDelay?: number;
  /**
   * See [Client#heartbeatIncoming]{@link Client#heartbeatIncoming}.
   */
  heartbeatIncoming?: number;
  /**
   * See [Client#heartbeatOutgoing]{@link Client#heartbeatOutgoing}.
   */
  heartbeatOutgoing?: number;
  /**
   * See [Client#connectHeaders]{@link Client#connectHeaders}.
   */
  connectHeaders?: StompHeaders;
  /**
   * See [Client#disconnectHeaders]{@link Client#disconnectHeaders}.
   */
  disconnectHeaders?: StompHeaders;
  /**
   * See [Client#beforeConnect]{@link Client#beforeConnect}.
   */
  beforeConnect?: () => void;
  /**
   * See [Client#debug]{@link Client#debug}.
   */
  debug?: debugFnType;
}

/*
 feat: auto unsubscribe
 feat: auto resubscribe
 note: явное использование receipt только для StompFrame - PublishMessage
*/
class WebStomp extends BasePubSubBridge<
  Partial<TStompFrameHeaders>,
  Partial<TDisconnectFrameHeaders>,
  Partial<TSubcribeFrameHeaders>
> {
  private client: Client | null = null;
  private readonly clientConfig: IStompServiceConfig;

  constructor(clientConfig: IStompServiceConfig) {
    super();

    this.clientConfig = clientConfig;
  }

  public connect(meta?: Partial<TStompFrameHeaders>): void | never {
    this.disconnect();
    this.initClient();

    // this.client.debug('Connecting...');
    if (!this.client) throw new Error('Connect failed: stomp client not initialized!');

    this.connectionStatusObservable.next(TPubSubConnectStatus.CONNECTING);
    this.client.connectHeaders = <any>meta || this.clientConfig.connectHeaders || {}; // fixme: type
    this.client.activate();
  }

  public disconnect(meta?: Partial<TDisconnectFrameHeaders>): void {
    if (!this.client) {
      // this.client!.debug(`Stomp not initialized, no need to disconnect.`);
      return;
    }
    if (!this.client.connected) {
      // todo || DISCONNECTING
      this.connectionStatusObservable.next(TPubSubConnectStatus.DISCONNECTED);
      return;
    }

    // this.client!.debug('Disconnecting...');
    this.connectionStatusObservable.next(TPubSubConnectStatus.DISCONNECTING);
    this.client.disconnectHeaders = <any>meta || this.clientConfig.disconnectHeaders || {}; // fixme: type
    this.client.deactivate();
  }

  /* if STOMP connection drops and reconnects, it will auto resubscribe */
  public subscribe<TMessage extends IPubSubMessage = IPubSubMessage>(
    topic: string,
    meta: Partial<TSubcribeFrameHeaders> = {}
  ): Observable<TMessage> | never {
    if (!this.client) throw new Error(`Subscribe failed: stomp client not initialized!`);
    // this.client!.debug(`Request to subscribe ${topic}.`);

    if (!meta.ack) meta.ack = 'auto';

    /* observable that we return to caller remains same across all reconnects, so no special handling needed at the message subscriber */
    const messageColdObservable = Observable.create((messageObserver: Subscriber<TMessage>) => {
      /* will be used as part of the closure for unsubscribe*/
      let subscription: StompSubscription;
      let connectionConnectedRxSubscription: Subscription;

      /* since 'state' is a BehaviourSubject, if stomp is already connected, it will immediately trigger */
      connectionConnectedRxSubscription = this.connectionConnectedObservable.subscribe(() => {
        // this.client!.debug(`Will subscribe to ${topic}...`);
        subscription = this.client!.subscribe(
          topic,
          (messageFrame: Message) => {
            messageObserver.next(<any>{
              // fixme: type
              data: messageFrame.body,
              meta: messageFrame.headers
            });

            messageFrame.ack(); // todo headers
          },
          <any>meta // fixme: type
        );
      });

      /* TeardownLogic - will be called when no messageObservable subscribers are left */
      return () => {
        // this.client!.debug(`Stop watching connection state (for ${topic}).`);
        connectionConnectedRxSubscription.unsubscribe();

        if (this.connectionStatusObservable.getValue() !== TPubSubConnectStatus.CONNECTED) {
          // this.client!.debug(`Stomp not connected, no need to unsubscribe from ${topic}.`);
          return;
        }
        // this.client!.debug(`Will unsubscribe from ${topic}...`);
        subscription.unsubscribe(); // todo headers
      };
    });

    /* convert it to hot Observable - otherwise, if the user code subscribes to this observable twice, it will subscribe twice to broker */
    return messageColdObservable.pipe(share());
  }

  public publish(
    topic: string,
    message: IPubSubMessage<Partial<TSendFrameHeaders>>
  ): Subject<IPubSubMsgPublishState> | never {
    if (!this.client) throw new Error(`Publish failed: stomp client not initialized!`);

    const publishStateObservable: Subject<IPubSubMsgPublishState> = new Subject(); // todo default

    if (!message.meta) message.meta = {};
    if (!message.meta.receipt) message.meta.receipt = `publish-${generateGuid()}`; // todo check in queue
    this.client.watchForReceipt(message.meta.receipt, receiptFrame => {
      publishStateObservable.next({ status: TPubSubMsgPublishStatus.PUBLISHED, meta: receiptFrame.headers });

      // publishStatusObservable.complete(); todo
    });

    publishStateObservable.next({
      status: TPubSubMsgPublishStatus.PUBLISHING,
      meta: { receipt: message.meta.receipt } // todo
    });
    this.client.publish({ destination: topic, body: message.data, headers: <any>message.meta }); // fixme: type

    return publishStateObservable;
  }

  private initClient(): void {
    this.connectedMessageObservable = new Subject(); // todo || empty?
    this.errorMessageObservable = new Subject();

    this.client = new Client(this.clientConfig);
    if (!this.clientConfig.debug) this.client.debug = console.log;

    this.client.onWebSocketClose = this.onWebSocketClose;
    this.client.onConnect = this.onConnectedFrame;
    this.client.onDisconnect = this.onDisconnectReceiptFrame;
    this.client.onStompError = this.onErrorFrame;
    this.client.onUnhandledMessage = this.onUnhandledMessageFrame;
    this.client.onUnhandledReceipt = this.onUnhandledReceiptFrame;
  }

  private onWebSocketClose: closeEventCallbackType = (evt: CloseEvent) => {
    if (this.connectionStatusObservable.getValue() === TPubSubConnectStatus.CONNECTED) {
      // todo
      this.connectionStatusObservable.next(TPubSubConnectStatus.CONNECTING); // reconnecting
    }
  };

  private onConnectedFrame: frameCallbackType = connectedFrame => {
    // this.client.debug('Connected.');

    this.connectedMessageObservable.next({ meta: connectedFrame.headers });
    this.connectionStatusObservable.next(TPubSubConnectStatus.CONNECTED);
  };

  private onDisconnectReceiptFrame: frameCallbackType = receiptFrame => {
    this.connectionStatusObservable.next(TPubSubConnectStatus.DISCONNECTED);
  };

  /* не отслеживаем receipt - STOMP broker will close the connection after error frame */
  private onErrorFrame: frameCallbackType = errorFrame => {
    // this.client.debug(`Error: ${errorFrame.body}`);
    this.errorMessageObservable.next({ meta: errorFrame.headers, data: errorFrame.body });

    if (this.client) this.client.forceDisconnect(); // todo ?
    this.disconnect();
    this.connectionStatusObservable.next(TPubSubConnectStatus.DISCONNECTED);
  };

  private onUnhandledMessageFrame: messageCallbackType = messageFrame => {
    // this.unhandledMessageFrameObservable.next(messageFrame);
  };

  private onUnhandledReceiptFrame: frameCallbackType = receiptFrame => {
    // this.unhandledReceiptFrameObservable.next(receiptFrame);
  };
}

export { WebStomp, IStompServiceConfig };

/*

  public unhandledMessageFrameObservable: Subject<Message> = new Subject();
  public unhandledReceiptFrameObservable: Subject<Frame> = new Subject();

  public forceDisconnect() {
    this.client!.forceDisconnect();
  }
  public watchForReceipt(receiptId: string, callback: frameCallbackType) {
    this.client!.watchForReceipt(receiptId, callback);
  }
  public unsubscribe(id: string, headers?: StompHeaders) {
    this.client!.unsubscribe(id, headers);
  }
  public begin(transactionId?: string): Transaction {
    return this.client!.begin(transactionId);
  }
  public commit(transactionId: string) {
    this.client!.commit(transactionId);
  }
  public abort(transactionId: string) {
    this.client!.abort(transactionId);
  }
  public ack(messageId: string, subscriptionId: string, headers?: StompHeaders) {
    this.client!.ack(messageId, subscriptionId, headers);
  }
  public nack(messageId: string, subscriptionId: string, headers?: StompHeaders) {
    this.client!.nack(messageId, subscriptionId, headers)
  }

*/

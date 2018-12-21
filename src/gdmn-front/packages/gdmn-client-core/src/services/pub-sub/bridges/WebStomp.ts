import {
  Client,
  closeEventCallbackType,
  debugFnType,
  frameCallbackType,
  Message,
  messageCallbackType,
  StompHeaders,
  StompSubscription,
  Versions
} from '@stomp/stompjs';
import { Observable, Subject, Subscriber, Subscription } from 'rxjs';
import { filter, first, share } from 'rxjs/operators';

import { generateGuid } from '../../../utils/helpers';
import {
  TDisconnectFrameHeaders,
  TSendFrameHeaders,
  TStompFrameHeaders,
  TSubcribeFrameHeaders
} from '../protocols/stomp-protocol-v1.2';
import { IPubSubMessage, IPubSubMessageMeta } from '../PubSubClient';
import {
  BasePubSubBridge,
  IPubSubMsgPublishState,
  TPubSubConnectStatus,
  TPubSubMsgPublishStatus
} from './BasePubSubBridge';

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
class WebStomp<TErrorMessage extends IPubSubMessage = IPubSubMessage> extends BasePubSubBridge<
  TErrorMessage,
  Partial<TStompFrameHeaders>,
  Partial<TDisconnectFrameHeaders>,
  Partial<TSubcribeFrameHeaders>
> {
  private client: Client | null = null;
  private clientConfig: IStompServiceConfig;

  constructor(clientConfig: IStompServiceConfig) {
    super();

    this.clientConfig = clientConfig;
  }

  public connect(meta?: Partial<TStompFrameHeaders>): void | never {
    this.disconnect();
    this.initClient();

    this.client!.debug('Connecting...');
    if (!this.client) throw new Error('Connect failed: stomp client not initialized!');

    if (this.connectionStatusObservable.getValue() === TPubSubConnectStatus.DISCONNECTING) {
      console.log('connect: DISCONNECTIN');
      this.connectionStatusObservable
        .pipe(
          filter(value => value === TPubSubConnectStatus.DISCONNECTED),
          first()
        )
        .subscribe(() => {
          if (this.client) {
            console.log('connect: DISCONNECTING. DISCONNECTED->CONNECTING->activate');
            this.connectionStatusObservable.next(TPubSubConnectStatus.CONNECTING);
            (<Partial<StompHeaders>>this.client.connectHeaders) = meta || this.clientConfig.connectHeaders || {};
            this.client.activate();
          }
        });
    } else {
      console.log('connect: NOT DISCONNECTING');
      this.connectionStatusObservable.next(TPubSubConnectStatus.CONNECTING);
      (<Partial<StompHeaders>>this.client.connectHeaders) = meta || this.clientConfig.connectHeaders || {};
      this.client.activate();
    }
  }

  public disconnect(meta?: Partial<TDisconnectFrameHeaders>): void {
    if (!this.client) {
      console.log(`Stomp not initialized, no need to disconnect.`);
      return;
    }

    if (this.connectionStatusObservable.getValue() === TPubSubConnectStatus.DISCONNECTED) {
      this.connectionStatusObservable.next(TPubSubConnectStatus.DISCONNECTING);
      this.connectionStatusObservable.next(TPubSubConnectStatus.DISCONNECTED);
      return;
    }

    // if (!this.client.connected) { // todo: ?
    //   // todo || DISCONNECTING
    // if (!this.client.connected) {
    //   this.connectionStatusObservable.next(TPubSubConnectStatus.DISCONNECTED);
    //   return;
    // }

    this.client!.debug('Disconnecting...');
    // this.connectionStatusObservable.next(TPubSubConnectStatus.DISCONNECTING);

    if (meta) (<Partial<StompHeaders>>this.client.disconnectHeaders) = meta;
    this.connectionStatusObservable.next(TPubSubConnectStatus.DISCONNECTING);
    this.client.deactivate();
  }

  /* if STOMP connection drops and reconnects, it will auto resubscribe */
  public subscribe<TMessage extends IPubSubMessage = IPubSubMessage>(
    topic: string,
    meta: Partial<TSubcribeFrameHeaders> = {}
  ): Observable<TMessage> | never {
    if (!this.client) throw new Error(`Subscribe failed: stomp client not initialized!`);
    console.log(`Request to subscribe ${topic}.`);

    if (!meta.ack) meta.ack = 'auto';

    /* observable that we return to caller remains same across all reconnects, so no special handling needed at the message subscriber */
    const messageColdObservable = Observable.create((messageObserver: Subscriber<TMessage>) => {
      /* will be used as part of the closure for unsubscribe*/
      let subscription: StompSubscription | null | undefined;
      let connectionConnectedRxSubscription: Subscription;

      // this.connectionConnectedRxSubscription.subscribe(value => console.log('test'))
      // fixme init client after reconnect
      connectionConnectedRxSubscription = this.connectionConnectedObservable.subscribe(() => {
        // todo test on connected
        if (subscription !== null) {
          console.log(`Will subscribe to ${topic}...`);
          subscription = this.client!.subscribe(
            topic,
            (messageFrame: Message) => {
              messageObserver.next(<TMessage>{
                data: messageFrame.body,
                meta: messageFrame.headers
              });
              if (meta.ack !== 'auto') messageFrame.ack();
            },
            <StompHeaders>meta
          );
        }
      });

      // fixme: todo not sub after disconnect frame
      this.connectionStatusObservable
        .pipe(filter(value => value === TPubSubConnectStatus.DISCONNECTED))
        .subscribe(value => {
          // todo tmp test
          subscription = null;
        });

      /* TeardownLogic - will be called when no messageObservable subscribers are left */
      return () => {
        console.log(`Stop watching connection state (for ${topic}).`);
        connectionConnectedRxSubscription.unsubscribe();

        if (this.connectionStatusObservable.getValue() !== TPubSubConnectStatus.CONNECTED) {
          console.log(`Stomp not connected, no need to unsubscribe from ${topic}.`);
          return;
        }
        if (subscription) {
          console.log(`Will unsubscribe from ${topic}...`);
          subscription.unsubscribe(); // todo headers
        }
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
    this.client.publish({ destination: topic, body: message.data, headers: <StompHeaders>message.meta });

    return publishStateObservable;
  }

  private initClient(): void {
    this.client = new Client(this.clientConfig);
    if (!this.clientConfig.debug) this.client.debug = console.log;

    // if (this.connectedMessageObservable.hasError) {
    //   this.connectedMessageObservable = new Subject();
    // }

    this.client.onWebSocketClose = this.onWebSocketClose;
    this.client.onConnect = this.onConnectedFrame;
    this.client.onDisconnect = this.onDisconnectReceiptFrame;
    this.client.onStompError = this.onErrorFrame;
    this.client.onUnhandledMessage = this.onUnhandledMessageFrame;
    this.client.onUnhandledReceipt = this.onUnhandledReceiptFrame;
  }

  private onWebSocketClose: closeEventCallbackType = (evt: CloseEvent) => {
    console.log('onWebSocketClose');
    // if (this.connectionStatusObservable.getValue() === TPubSubConnectStatus.CONNECTED) {
    //   // todo
    //   this.connectionStatusObservable.next(TPubSubConnectStatus.CONNECTING); // reconnecting
    // }

    if (this.connectionStatusObservable.getValue() === TPubSubConnectStatus.DISCONNECTING) {
      console.log('onWebSocketClose: DISCONNECTING');
      this.connectionStatusObservable.next(TPubSubConnectStatus.DISCONNECTED);
    }
  };

  private onConnectedFrame: frameCallbackType = connectedFrame => {
    this.client!.debug('Connected.');

    this.connectionStatusObservable.next(TPubSubConnectStatus.CONNECTED); // todo before connectedMessage
    this.connectedMessageObservable.next({ meta: connectedFrame.headers });
  };

  private onDisconnectReceiptFrame: frameCallbackType = receiptFrame => {
    console.log('onDisconnectReceiptFrame');
    this.connectionStatusObservable.next(TPubSubConnectStatus.DISCONNECTED);
  };

  /* не отслеживаем receipt - STOMP broker will close the connection after error frame */
  private onErrorFrame: frameCallbackType = errorFrame => {
    this.client!.debug(`ErrorFrame: ${JSON.stringify(errorFrame)}`);
    this.errorMessageObservable.next(<TErrorMessage>{ meta: errorFrame.headers, data: errorFrame.body });

    if (this.client) this.client.forceDisconnect(); // todo ?
    this.disconnect();
    this.connectionStatusObservable.next(TPubSubConnectStatus.DISCONNECTED);

    // todo: tmp
    // this.connectedMessageObservable = new Subject();
    // this.errorMessageObservable = new Subject();
  };

  private onUnhandledMessageFrame: messageCallbackType = messageFrame => {
    this.client!.debug('onUnhandledMessageFrame: ' + messageFrame);
    messageFrame.ack();
    // this.unhandledMessageFrameObservable.next(messageFrame);
  };

  private onUnhandledReceiptFrame: frameCallbackType = receiptFrame => {
    this.client!.debug('onUnhandledReceiptFrame: ' + receiptFrame);
    // this.unhandledReceiptFrameObservable.next(receiptFrame);
  };

  set reconnectMeta(meta: Partial<TStompFrameHeaders>) {
    if (!this.client) return;
    (<Partial<StompHeaders>>this.client.connectHeaders) = meta;
  }

  get reconnectMeta(): Partial<TStompFrameHeaders> {
    return this.client!.connectHeaders;
  }
}

export { WebStomp, IStompServiceConfig };

// public begin(transactionId?: string): Transaction {
//   return this.client!.begin(transactionId);
// }
// public commit(transactionId: string) {
//   this.client!.commit(transactionId);
// }
// public abort(transactionId: string) {
//   this.client!.abort(transactionId);
// }

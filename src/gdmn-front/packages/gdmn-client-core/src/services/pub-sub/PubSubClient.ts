import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import {
  BasePubSubBridge,
  IPubSubMsgPublishState,
  TPubSubConnectStatus,
  TPubSubMsgPublishStatus
} from './bridges/BasePubSubBridge';

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
  private connectionDisconnectedObservable: Observable<TPubSubConnectStatus>;
  /* locally queued messages when broker is not connected or message not receipted*/
  private queuedPublishMessages: IQueuedPublishMessage[] = [];

  public connectedMessageObservable: Subject<IPubSubMessage>;
  public errorMessageObservable: Subject<IPubSubMessage>;
  public readonly connect: (meta?: IPubSubMessageMeta) => void | never; // todo test
  public readonly disconnect: (meta?: IPubSubMessageMeta) => void;
  public readonly subscribe: <TMessage extends IPubSubMessage = IPubSubMessage>(
    topic: string,
    meta?: IPubSubMessageMeta
  ) => Observable<TMessage> | never;

  constructor(bridge: BasePubSubBridge) {
    this.bridge = bridge;

    this.connectionDisconnectedObservable = this.bridge.connectionStatusObservable.pipe(
      filter((currentState: TPubSubConnectStatus) => currentState === TPubSubConnectStatus.DISCONNECTED)
    );
    this.connectedMessageObservable = this.bridge.connectedMessageObservable;
    this.errorMessageObservable = this.bridge.errorMessageObservable;
    this.connect = this.bridge.connect.bind(this.bridge);
    this.disconnect = this.bridge.disconnect.bind(this.bridge);
    this.subscribe = this.bridge.subscribe.bind(this.bridge);

    this.connectedMessageObservable.subscribe(() => {
      this.queuePublish();
    });
    this.connectionDisconnectedObservable.subscribe(() => {
      this.queuedPublishMessages = []; // todo complete
    });

    // todo: tmp
    this.bridge.connectionStatusObservable.subscribe(value => {
      if (value === TPubSubConnectStatus.DISCONNECTING || value === TPubSubConnectStatus.DISCONNECTED) {
        this.connectedMessageObservable = this.bridge.connectedMessageObservable;
        // this.errorMessageObservable = this.bridge.errorMessageObservable;
      }
    });

    this.errorMessageObservable.subscribe((errorMessage: IPubSubMessage) => {
      if (!this.bridge.isConnected()) {
        this.connectedMessageObservable.error(errorMessage); // todo
      }

      // todo: tmp
      this.connectedMessageObservable = this.bridge.connectedMessageObservable;
    });
  }

  public publish<TMessage extends IPubSubMessage = IPubSubMessage>(
    topic: string,
    message: TMessage
  ): Subject<IPubSubMsgPublishState> {
    // todo never
    const queuedMessage: IQueuedPublishMessage = { topic, message, publishStateObservable: new Subject() };
    this.queuedPublishMessages.push(queuedMessage);

    this.queuedMessagePublish(queuedMessage);

    return queuedMessage.publishStateObservable; // todo test
  }

  private queuePublish(): void {
    console.log(`Will try sending queued messages ${this.queuedPublishMessages}...`);

    this.queuedPublishMessages.forEach(queuedMessage => {
      console.log(`Attempting to send ${queuedMessage}...`);
      this.queuedMessagePublish(queuedMessage);
    });
  }

  private queuedMessagePublish(queuedMessage: IQueuedPublishMessage): void {
    if (!this.bridge.isConnected()) {
      console.log(`Not connected, queueing ${queuedMessage}...`);
      return;
    }

    this.bridge
      .publish(queuedMessage.topic, queuedMessage.message) // todo never
      .subscribe(publishState => {
        queuedMessage.publishStateObservable.next(publishState);

        if (publishState.status === TPubSubMsgPublishStatus.PUBLISHED) {
          const itemIndex = this.queuedPublishMessages.findIndex(item => item === queuedMessage); // todo test
          if (itemIndex !== -1) {
            this.queuedPublishMessages.splice(itemIndex, 1); // todo test ref
          }

          // queuedMessage.publishStatusObservable.complete(); // todo
        }
      });
  }
}

export { PubSubClient, IPubSubMessage, IPubSubMessageMeta };

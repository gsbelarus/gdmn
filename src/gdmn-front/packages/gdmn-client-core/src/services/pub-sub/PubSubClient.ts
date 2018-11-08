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

interface IPubSubMessage<TMeta extends IPubSubMessageMeta = IPubSubMessageMeta> {
  meta?: TMeta; // metadata / context / attributes - extra metadata associated by the publisher with the message.  (app-specific headers (like, publish_time) + protocol headers (like, message_id)) // todo Map<string, string>
  data?: string;
}

interface IQueuedPublishMessage {
  topic: string;
  message: IPubSubMessage;
  publishStateObservable: Subject<IPubSubMsgPublishState>;
}

class PubSubClient {
  private readonly bridge: BasePubSubBridge;
  private connectionDisconnectedObservable: Observable<
    TPubSubConnectStatus
  > = this.bridge.connectionStatusObservable.pipe(
    filter((currentState: TPubSubConnectStatus) => currentState === TPubSubConnectStatus.DISCONNECTED)
  );
  private queuedPublishMessages: IQueuedPublishMessage[] = []; // locally queued messages when broker is not connected or message not receipted

  public readonly connectedMessageObservable = this.bridge.connectedMessageObservable;
  public readonly errorMessageObservable = this.bridge.errorMessageObservable;
  public readonly connect = this.bridge.connect; // todo test
  public readonly disconnect = this.bridge.disconnect;
  public readonly subscribe = this.bridge.subscribe;

  constructor(bridge: BasePubSubBridge) {
    this.bridge = bridge;

    this.bridge.connectionConnectedObservable.subscribe(() => {
      this.queuePublish();
    });
    this.connectionDisconnectedObservable.subscribe(() => {
      this.queuedPublishMessages = []; // todo complete
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
    // this.client.debug(`Will try sending queued messages ${this.queuedPublishMessages}...`);

    this.queuedPublishMessages.forEach(queuedMessage => {
      // this.client!.debug(`Attempting to send ${queuedMessage}...`);
      this.queuedMessagePublish(queuedMessage);
    });
  }

  private queuedMessagePublish(queuedMessage: IQueuedPublishMessage): void {
    if (!this.bridge.isConnected()) {
      // this.client.debug(`Not connected, queueing ${message}...`);
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

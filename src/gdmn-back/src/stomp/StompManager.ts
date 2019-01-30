import log4js from 'log4js';
import { createStompServerSession, setLoggingListeners } from 'stomp-protocol';
import WebSocket from 'ws';
import { MainApplication } from '../apps/MainApplication';
import { Constants } from '../Constants';
import { IStompSessionMeta, StompSession } from './StompSession';

export class StompManager {

  private static readonly MAX_LENGTH_MESSAGE = 1000;
  private readonly _logger = log4js.getLogger("STOMP");
  private readonly _mainApplication = new MainApplication();
  private readonly _sessionMeta?: IStompSessionMeta;

  private _sessions = new Map<WebSocket, StompSession>();

  constructor(sessionMeta?: IStompSessionMeta) {
    this._sessionMeta = sessionMeta;
  }

  get mainApplication(): MainApplication {
    return this._mainApplication;
  }

  public add(webSocket: WebSocket): boolean {
    const stomp = createStompServerSession(webSocket, StompSession, {
      heartbeat: {
        incomingPeriod: Constants.SERVER.STOMP.HEARTBEAT.INCOMING,
        outgoingPeriod: Constants.SERVER.STOMP.HEARTBEAT.OUTGOING
      }
    });
    const session = stomp.listener as StompSession;
    session.mainApplication = this._mainApplication;
    session.logger = this._logger;
    session.meta = this._sessionMeta;
    this._sessions.set(webSocket, session);
    return true;
  }

  public delete(webSocket: WebSocket): void {
    const session = this._sessions.get(webSocket);
    if (!session) {
      throw new Error("WebSocket not found");
    }
    this._sessions.delete(webSocket);
  }

  public async create(): Promise<void> {
    const empty = () => {};
    setLoggingListeners({
      error: empty,
      info: empty,
      silly: (message, args) => {
        const receiverDataTemplate = /^StompWebSocketStreamLayer: received data %.$/g;
        if (receiverDataTemplate.test(message) && args !== "\n") {
          // this._logger.info("\n>>> %s", args.length > StompManager.MAX_LENGTH_MESSAGE
          //   ? args.substring(0, StompManager.MAX_LENGTH_MESSAGE - 3) + "..."
          //   : args);
        }
        const sendingDataTemplate = /^StompFrameLayer: sending frame data %.$/g;
        if (sendingDataTemplate.test(message)) {
          // args.startsWith("ERROR")
          //   ? this._logger.warn("\n<<< %s", args.length > StompManager.MAX_LENGTH_MESSAGE
          //   ? args.substring(0, StompManager.MAX_LENGTH_MESSAGE - 3) + "..."
          //   : args)
          //   : this._logger.info("\n<<< %s", args.length > StompManager.MAX_LENGTH_MESSAGE
          //   ? args.substring(0, StompManager.MAX_LENGTH_MESSAGE - 3) + "..."
          //   : args);
        }
      },
      warn: empty,
      debug: empty
    });

    await this._mainApplication.createOrConnect();
  }

  public async destroy(): Promise<void> {
    await this._mainApplication.disconnect();
  }
}

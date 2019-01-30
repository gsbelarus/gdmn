import cluster, {Worker} from "cluster";
import http, {Server as HttpServer} from "http";
import {Server as HttpsServer} from "https";
import Koa from "koa";
import koaBody from "koa-body";
import errorHandler from "koa-error";
import logger from "koa-logger";
import Router from "koa-router";
import send from "koa-send";
import serve from "koa-static";
import cors from "koa2-cors";
import log4js from "log4js";
import path from "path";
import url from "url";
import WebSocket from "ws";
import {Constants} from "./Constants";
import {checkHandledError, ErrorCodes, throwCtx} from "./ErrorCodes";
import {StompManager} from "./stomp/StompManager";
import {StompSession} from "./stomp/StompSession";

interface IServer {
  stompManager: StompManager;
  httpServer?: HttpServer;
  wsHttpServer?: WebSocket.Server;
}

log4js.configure("./config/log4js.json");
const defaultLogger = log4js.getLogger();


async function create(): Promise<IServer> {

  const stompSessionMeta = Constants.SERVER.CLUSTER.ENABLED ? {
    workerPid: process.pid.toString()
  } : undefined;

  const stompManager = new StompManager(stompSessionMeta);
  await stompManager.create();

  const serverApp = new Koa()
    .use(logger())
    .use(serve(Constants.SERVER.PUBLIC_DIR))
    .use(koaBody({multipart: true}))
    .use(cors())
    .use(errorHandler())
    .use(async (ctx, next) => {
      try {
        await next();
      } catch (error) {
        if (checkHandledError(error)) {
          throw error;
        }
        throwCtx(ctx, 500, error, ErrorCodes.INTERNAL);
      }
    });

  serverApp.use(async (ctx, next) => {
    ctx.state.mainApplication = stompManager.mainApplication;
    await next();
  });

  const router = new Router()
  // TODO temp
    .get("/", (ctx) => ctx.redirect("/spa"))
    .get(/\/spa(\/*)?/g, async (ctx) => {
      await send(ctx, "/", { // send(ctx, "/gs/ng/", {
        root: path.resolve(process.cwd(), Constants.SERVER.PUBLIC_DIR),
        index: "index",
        extensions: ["html"]
      });
    });

  serverApp
    .use(router.routes())
    .use(router.allowedMethods())
    .use((ctx) => throwCtx(ctx, 404, "Not found", ErrorCodes.NOT_FOUND));

  const httpServer = createHttpServer(serverApp);
  if (!httpServer) throw new Error("Cluster mode need a http server");

  let wsHttpServer;
  if (!Constants.SERVER.CLUSTER.ENABLED) {
    httpServer.listen(Constants.SERVER.HTTP.PORT, Constants.SERVER.HTTP.HOST);
    wsHttpServer = startWebSocketServer(stompManager, httpServer);
  } else {
    wsHttpServer = startClusterServer(httpServer, () => startWebSocketServer(stompManager));
  }

  return {
    stompManager,
    httpServer,
    wsHttpServer
  };
}

function createHttpServer(serverApp: Koa): HttpServer | undefined {
  let httpServer: HttpServer | undefined;
  if (Constants.SERVER.HTTP.ENABLED) {
    httpServer = http.createServer(serverApp.callback())
      .on("error", serverErrorHandler)
      .on("listening", () => {
        const address = httpServer!.address();
        if (typeof address === "string") {
          defaultLogger.info(`Listening ${httpServer!.address()}`);
        } else {
          defaultLogger.info(`Listening on http://%s:%s;` +
            ` env: %s`, address.address, address.port, process.env.NODE_ENV);
        }
      });
  }
  return httpServer;
}

function startWebSocketServer(stompManager: StompManager,
                              server?: HttpServer | HttpsServer): WebSocket.Server {
  const wsServer = new WebSocket.Server(server ? {
    server
  } : {
    noServer: true,
    perMessageDeflate: false // todo
  });

  return wsServer.on("connection", (webSocket) => {
    defaultLogger.info("WebSocket event: 'connection'");

    if (stompManager.add(webSocket)) {
      webSocket.on("close", () => {
        defaultLogger.info("WebSocket event: 'close'");
        stompManager.delete(webSocket);
      });
    }
  });
}

function startClusterServer(clusterServer: HttpServer | HttpsServer, startWsServer: () => WebSocket.Server): WebSocket.Server | undefined {
  const MASTER_SEND_SOCKET_MSG_TYPE = "cluster:master:send-socket";

  if (cluster.isMaster) {
    // console.log(`Master ${process.pid} is running`);

    const roundRobinIterator = (array: any[]) => {
      let index = 0;
      return () => {
        if (index >= array.length) index = 0;
        return array[index++];
      };
    };

    let getNextWorker = () => ({});

    /* worker undefined - send to next worker */
    const sendSocketToWorker = (socket: any, request: any, head: any, workerIndex: string | null = null) => {
      const worker = <Worker>(workerIndex === null ? getNextWorker() : cluster.workers[workerIndex]);

      console.log("workerId:", worker.id);

      worker.send({type: MASTER_SEND_SOCKET_MSG_TYPE, payload: {request, head}}, socket);
    };

    const createWorker = () => cluster.fork();

    let clusterServerRunning = false;

    clusterServer
      .on("connection", socket => {
        /* net.server pauseOnConnect */
        socket.pause();
      })
      .on("upgrade", (request, socket, head) => {
        request.pause(); // todo ?

        /* choose a worker */

        let workerIndex = null;
        /* url = /?appId=1&userId=2&sessionId=3 */
        const reqSearchParams = new URLSearchParams(url.parse(request.url, true).search);
        if (reqSearchParams.has("session")) {
          try {
            const pidStr = StompSession.parseSessionMessageHeader(reqSearchParams.get("session") || "").meta.workerPid;
            if (pidStr) {
              console.log("->pid: ", pidStr);
              const pid = Number.parseInt(pidStr);
              for (const wid in cluster.workers) {
                if (cluster.workers[wid]!.process.pid === pid) {
                  workerIndex = wid;
                  break;
                }
              }
            }
          } catch (e) {
            // ignore
          }
        }

        sendSocketToWorker(
          socket,
          {
            headers: request.headers,
            method: request.method
          },
          head,
          workerIndex
        );

        request.resume();
      })
      .on("close", () => {
        // console.log('Workers  stop..');
        clusterServerRunning = false;
        for (const wid in cluster.workers) {
          cluster.workers[wid]!.kill(); // todo timeout force stop
        }
        // console.log('Master  ..stopped');
      })
      .listen(Constants.SERVER.HTTP.PORT, Constants.SERVER.HTTP.HOST, () => {
        // console.log('Http server started');

        clusterServerRunning = true;

        new Array(Constants.SERVER.CLUSTER.WORKERS_COUNT).fill(0).forEach(() => createWorker());

        getNextWorker = roundRobinIterator(Object.values(cluster.workers));
      });

    /* graceful shutdown */

    const onExit = () => {
      // console.log('onExit');
      cluster.removeAllListeners("exit"); // todo
    };
    process.on("SIGINT", onExit);
    process.on("SIGTERM", onExit);

    cluster.on("exit", (worker, code, signal) => {
      // console.log(`master<-[${worker.id}]-worker ${worker.process.pid} died`);

      if (clusterServerRunning) {
        createWorker(); // todo setTimeout(() => createWorker(), 1000);
      }
    });

    return;
  }

  /* cluster.isWorker */

  // console.log(`Worker [${cluster.worker.id}] ${process.pid} started`);

  const wss = startWsServer();

  process.on("message", (message, socket) => {
    /* msgs from master */
    if (!message.type || !socket) return;

    if (message.type === MASTER_SEND_SOCKET_MSG_TYPE) {
      // console.log(`[${cluster.worker.id}] on MASTER_SEND_SOCKET_MSG`);

      /* emulate connection event */
      wss.handleUpgrade(message.payload.request, socket, Buffer.from([]), ws => {
        // todo message.payload.head
        wss.emit("connection", ws, message.payload.request);
      });

      /* resume as we already catched connection */
      socket.resume();
    }
  });

  return wss;
}

const creating = create();

process.on("SIGINT", exit);
process.on("SIGTERM", exit);

async function exit(): Promise<void> {
  try {
    const {stompManager, httpServer, wsHttpServer} = await creating;

    if (wsHttpServer) {
      wsHttpServer.clients.forEach((client) => client.removeAllListeners());
      wsHttpServer.removeAllListeners();
      await new Promise((resolve) => wsHttpServer.close(resolve));
      defaultLogger.info("WebSocket server is closed");
    }
    if (httpServer) {
      httpServer.removeAllListeners();
      await new Promise((resolve) => httpServer.close(resolve));
      defaultLogger.info("Http server is closed");
    }
    await stompManager.destroy();
    defaultLogger.info("StompManager is destroyed");
  } catch (error) {
    switch (error.message) {
      case "connection shutdown":
        // ignore
        break;
      default:
        defaultLogger.error(error);
    }
  } finally {
    defaultLogger.info("Shutdown...");
    await logShutdown();
    process.exit();
  }
}

async function serverErrorHandler(error: NodeJS.ErrnoException): Promise<void> {
  if (error.syscall !== "listen") {
    throw error;
  }
  switch (error.code) {
    case "EACCES":
      defaultLogger.error("Port requires elevated privileges");
      await logShutdown();
      process.exit();
      break;
    case "EADDRINUSE":
      defaultLogger.error("Port is already in use");
      await logShutdown();
      process.exit();
      break;
    default:
      throw error;
  }
}

async function logShutdown(): Promise<void> {
  await new Promise((resolve, reject) => log4js.shutdown((error) => error ? reject(error) : resolve()));
}

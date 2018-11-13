import config from "config";
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
import WebSocket from "ws";
import {checkHandledError, ErrorCodes, throwCtx} from "./ErrorCodes";
import {StompManager} from "./stomp/StompManager";

interface IServer {
  stompManager: StompManager;
  httpServer?: HttpServer;
  wsHttpServer?: WebSocket.Server;
}

process.env.NODE_ENV = process.env.NODE_ENV || "development";

log4js.configure("./config/log4js.json");
const defaultLogger = log4js.getLogger();

async function create(): Promise<IServer> {
  const stompManager = new StompManager();
  await stompManager.create();

  const serverApp = new Koa()
    .use(logger())
    .use(serve(config.get("server.publicDir")))
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
      await send(ctx, "/gs/ng/", {
        root: path.resolve(process.cwd(), config.get("server.publicDir")),
        index: "index",
        extensions: ["html"]
      });
    });

  serverApp
    .use(router.routes())
    .use(router.allowedMethods())
    .use((ctx) => throwCtx(ctx, 404, "Not found", ErrorCodes.NOT_FOUND));

  const httpServer = startHttpServer(serverApp);
  const wsHttpServer = startWebSocketServer(stompManager, httpServer);

  return {
    stompManager,
    httpServer,
    wsHttpServer
  };
}

function startWebSocketServer(stompManager: StompManager,
                              server?: HttpServer | HttpsServer): WebSocket.Server | undefined {
  if (server) {
    const wsServer = new WebSocket.Server({server});
    wsServer.on("connection", (webSocket) => {
      defaultLogger.info("WebSocket event: 'connection'");
      if (stompManager.add(webSocket)) {
        webSocket.on("close", () => {
          defaultLogger.info("WebSocket event: 'close'");
          stompManager.delete(webSocket);
        });
      }
    });
    return wsServer;
  }
}

function startHttpServer(serverApp: Koa): HttpServer | undefined {
  let httpServer: HttpServer | undefined;
  if (config.get("server.http.enabled")) {
    httpServer = http.createServer(serverApp.callback());
    httpServer.listen(config.get("server.http.port"), config.get("server.http.host"));
    httpServer.on("error", serverErrorHandler);
    httpServer.on("listening", () => {
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

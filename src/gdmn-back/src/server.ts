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
import {Logger} from "log4js";
import path from "path";
import WebSocket from "ws";

import {Constants} from "./Constants";
import {checkHandledError, ErrorCodes, throwCtx} from "./ErrorCodes";
import {StompManager} from "./stomp/StompManager";
import {IStompSessionMeta} from "./stomp/StompSession";

export interface IServer {
  stompManager?: StompManager;
  httpServer?: HttpServer | HttpsServer;
  wsServer?: WebSocket.Server;
}

export async function createHttpServer(
  defaultLogger: Logger,
  serverErrorHandler: (error: NodeJS.ErrnoException) => Promise<void>
): Promise<HttpServer | never> {
  /* create app */

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

  // serverApp.use(async (ctx, next) => {
  //   ctx.state.mainApplication = stompManager.mainApplication;
  //   await next();
  // });

  /* create router */

  const router = new Router()
  // TODO temp
    .get("/", (ctx) => ctx.redirect("/spa"))
    .get(/\/spa(\/*)?/g, async (ctx) => {
      await send(ctx, "/", {
        // send(ctx, "/gs/ng/", {
        root: path.resolve(process.cwd(), Constants.SERVER.PUBLIC_DIR),
        index: "index",
        extensions: ["html"]
      });
    });

  serverApp
    .use(router.routes())
    .use(router.allowedMethods())
    .use((ctx) => throwCtx(ctx, 404, "Not found", ErrorCodes.NOT_FOUND));

  /* create http server */

  let httpServer: HttpServer | undefined;
  if (Constants.SERVER.HTTP.ENABLED) {
    httpServer = http
      .createServer(serverApp.callback())
      .on("error", serverErrorHandler)
      .on("listening", () => {
        const address = httpServer!.address()!;
        if (typeof address === "string") {
          defaultLogger.info(`Listening ${httpServer!.address()}`);
        } else {
          defaultLogger.info(
            `Listening on http://%s:%s;` + ` env: %s`,
            address.address,
            address.port,
            process.env.NODE_ENV
          );
        }
      });
  }

  if (!httpServer) {
    throw new Error("Cluster mode need a http server");
  }
  return httpServer;
}

export async function startWsServer(
  defaultLogger: Logger,
  server?: HttpServer | HttpsServer,
  stompSessionMeta?: IStompSessionMeta
): Promise<{ stompManager: StompManager; wsServer: WebSocket.Server }> {
  const maxPayload = 1024 * 1024 * 10; // 10 MB

  const stompManager = new StompManager(stompSessionMeta);
  await stompManager.create();

  const wsServer = new WebSocket.Server(
    server
      ? {
        server,
        maxPayload
      }
      : {
        noServer: true,
        perMessageDeflate: false, // todo
        maxPayload
      }
  ).on("connection", (webSocket) => {
    defaultLogger.info("WebSocket event: 'connection'");

    if (stompManager.add(webSocket)) {
      webSocket.on("close", () => {
        defaultLogger.info("WebSocket event: 'close'");
        stompManager.delete(webSocket);
      });
    }
  });

  return {
    stompManager,
    wsServer
  };
}

export async function start(
  defaultLogger: Logger,
  serverErrorHandler: (error: NodeJS.ErrnoException) => Promise<void>
): Promise<IServer> {
  const httpServer = await createHttpServer(defaultLogger, serverErrorHandler);
  httpServer.listen(Constants.SERVER.HTTP.PORT, Constants.SERVER.HTTP.HOST);

  const {stompManager, wsServer} = await startWsServer(
    defaultLogger,
    httpServer
  );

  return {
    stompManager,
    wsServer,
    httpServer
  };
}

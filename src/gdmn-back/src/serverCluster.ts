import cluster, {Worker} from "cluster";
import {Server as HttpServer} from "http";
import {Server as HttpsServer} from "https";
import {Logger} from "log4js";
import url from "url";
import WebSocket from "ws";
import {Constants} from "./Constants";
import {createHttpServer, IServer, startWsServer} from "./server";

import {StompManager} from "./stomp/StompManager";
import {StompSession} from "./stomp/StompSession";

async function createCluster(
  getHttpServer: () => Promise<HttpServer | HttpsServer>,
  getWsServer: () => Promise<{
    stompManager: StompManager;
    wsServer: WebSocket.Server;
  }>,
  parseReqSearchPidParam: (
    reqSearchParams: URLSearchParams
  ) => number | undefined
): Promise<IServer> {
  const MASTER_SEND_SOCKET_MSG_TYPE = "cluster:master:send-socket";

  if (cluster.isMaster) {
    // console.log(`Master ${process.pid} is running`);

    const roundRobinIterator = (array: any[]) => {
      let index = 0;
      return () => {
        if (index >= array.length) {
          index = 0;
        }
        return array[index++];
      };
    };

    let getNextWorker = () => ({});

    /* worker undefined - send to next worker */
    const sendSocketToWorker = (
      socket: any,
      request: any,
      head: any,
      workerIndex: string | null = null
    ) => {
      const worker = (
        (workerIndex === null ? getNextWorker() : cluster.workers[workerIndex])
      ) as Worker;

      console.log("workerId:", worker.id);

      worker.send(
        {type: MASTER_SEND_SOCKET_MSG_TYPE, payload: {request, head}},
        socket
      );
    };

    const createWorker = () => cluster.fork();

    let clusterServerRunning = false;

    const httpServer = await getHttpServer();
    httpServer
      .on("connection", (socket) => {
        /* net.server pauseOnConnect */
        socket.pause();
      })
      .on("upgrade", (request, socket, head) => {
        request.pause(); // todo ?

        /* choose a worker */

        let workerIndex = null;
        /* url = /?appId=1&userId=2&sessionId=3 */
        const init = url.parse(request.url, true).search;

        if (init === null) {
          throw new Error(`Invalid request url ${request.url}`);
        }

        const reqSearchParams = new URLSearchParams(init);

        let pid;
        try {
          pid = parseReqSearchPidParam(reqSearchParams);
        } catch (e) {
          // ignore
        }

        if (pid) {
          console.log("->pid: ", pid);

          for (const wid in cluster.workers) {
            if (cluster.workers[wid]!.process.pid === pid) {
              workerIndex = wid;
              break;
            }
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
        Object.values(cluster.workers)
          .filter((worker) => !!worker)
          .forEach((worker) => worker!.kill()); // todo timeout force stop
        // console.log('Master  ..stopped');
      })
      .listen(Constants.SERVER.HTTP.PORT, Constants.SERVER.HTTP.HOST, () => {
        // console.log('Http server started');

        clusterServerRunning = true;

        new Array(Constants.SERVER.CLUSTER.WORKERS_COUNT)
          .fill(0)
          .forEach(() => createWorker());

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

    return {httpServer};
  }

  /* cluster.isWorker */

  // console.log(`Worker [${cluster.worker.id}] ${process.pid} started`);

  const {stompManager, wsServer} = await getWsServer();

  process.on("message", (message, socket) => {
    /* msgs from master */
    if (!message.type || !socket) {
      return;
    }

    if (message.type === MASTER_SEND_SOCKET_MSG_TYPE) {
      // console.log(`[${cluster.worker.id}] on MASTER_SEND_SOCKET_MSG`);

      /* emulate connection event */
      wsServer.handleUpgrade(
        message.payload.request,
        socket,
        Buffer.from([]),
        (ws) => {
          // todo message.payload.head
          wsServer.emit("connection", ws, message.payload.request);
        }
      );

      /* resume as we already catched connection */
      socket.resume();
    }
  });

  return {stompManager, wsServer};
}

export async function clusterStart(
  defaultLogger: Logger,
  serverErrorHandler: (error: NodeJS.ErrnoException) => Promise<void>
): Promise<IServer> {
  return await createCluster(
    async () => await createHttpServer(defaultLogger, serverErrorHandler),
    async () =>
      await startWsServer(defaultLogger, undefined, {
        workerPid: process.pid.toString()
      }),
    (reqSearchParams: URLSearchParams) => {
      let pidStr;
      if (reqSearchParams.has("session")) {
        pidStr = StompSession.parseSessionMessageHeader(
          reqSearchParams.get("session") || ""
        ).meta.workerPid;
      }

      return pidStr ? Number.parseInt(pidStr, 10) : undefined;
    }
  );
}

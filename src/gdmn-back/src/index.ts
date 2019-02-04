import log4js from "log4js";

import { Constants } from "./Constants";
import { start } from "./server";
import { clusterStart } from "./serverCluster";

log4js.configure("./config/log4js.json");
const defaultLogger = log4js.getLogger();

const creating = Constants.SERVER.CLUSTER.ENABLED
  ? start(defaultLogger, serverErrorHandler)
  : clusterStart(defaultLogger, serverErrorHandler);

process.on("SIGINT", exit);
process.on("SIGTERM", exit);

async function exit(): Promise<void> {
  try {
    const { stompManager, httpServer, wsServer } = await creating;

    if (wsServer) {
      wsServer.clients.forEach(client => client.removeAllListeners());
      wsServer.removeAllListeners();
      await new Promise(resolve => wsServer.close(resolve));
      defaultLogger.info("WebSocket server is closed");
    }
    if (httpServer) {
      httpServer.removeAllListeners();
      await new Promise(resolve => httpServer.close(resolve));
      defaultLogger.info("Http server is closed");
    }
    if (stompManager) {
      await stompManager.destroy();
      defaultLogger.info("StompManager is destroyed");
    }
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
  await new Promise((resolve, reject) =>
    log4js.shutdown(error => (error ? reject(error) : resolve()))
  );
}

import config from "config";
import ms from "ms";
import os from "os";
import path from "path";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

export class Constants {

  public static readonly NAME = "gdmn-back";
  public static readonly VERSION = "1.0.0";

  public static readonly NODE_ENV = process.env.NODE_ENV;

  public static readonly SERVER = {
    CLUSTER: {
      ENABLED: config.get("server.cluster.enabled") as boolean,
      WORKERS_COUNT: (config.get("server.cluster.workersCount") > 0
        ? config.get("server.cluster.workersCount")
        : os.cpus().length) as number
    },
    APP_PROCESS: {
      POOL: {
        MIN: config.get("server.appProcess.pool.min") as number,
        MAX: config.get("server.appProcess.pool.max") as number,
        ACQUIRE_TIMEOUT: ms(config.get("server.appProcess.pool.acquireTimeout") as string),
        IDLE_TIMEOUT: ms(config.get("server.appProcess.pool.acquireTimeout") as string)
      }
    },
    HTTP: {
      ENABLED: config.get("server.http.host") as boolean,
      HOST: (process.env.HTTP_HOST ? process.env.HTTP_HOST : config.get("server.http.host")) as string,
      PORT: (process.env.HTTP_PORT ? process.env.HTTP_PORT : config.get("server.http.port")) as number
    },
    STOMP: {
      HEARTBEAT: {
        INCOMING: ms(config.get("server.stomp.heartbeat.incoming") as string),
        OUTGOING: ms(config.get("server.stomp.heartbeat.outgoing") as string)
      }
    },
    PUBLIC_DIR: (process.env.PUBLIC_DIR ? process.env.PUBLIC_DIR : config.get("server.publicDir")) as string,
    SESSION: {
      TIMEOUT: ms(config.get("server.session.timeout") as string),
      MAX_CONNECTIONS: config.get("server.session.maxConnections") as number
    },
    TASK: {
      TIMEOUT: ms(config.get("server.task.timeout") as string)
    },
    JWT: {
      SECRET: config.get("server.jwt.secret") as string,
      TOKEN: {
        ACCESS: {
          TIMEOUT: ms(config.get("server.jwt.token.access.timeout") as string)
        },
        REFRESH: {
          TIMEOUT: ms(config.get("server.jwt.token.refresh.timeout") as string)
        }
      }
    }
  };

  public static readonly DB = {
    SERVER: config.has("db.server") && config.get("db.server") ? {
      HOST: config.get("db.server.host") as string,
      PORT: config.get("db.server.port") as number
    } : undefined,
    USER: config.get("db.user") as string,
    PASSWORD: config.get("db.password") as string,
    DIR: path.resolve(config.get("db.dir")),
    POOL: {
      MIN: config.get("db.pool.min") as number,
      MAX: config.get("db.pool.max") as number,
      ACQUIRE_TIMEOUT: ms(config.get("db.pool.acquireTimeout") as string),
      IDLE_TIMEOUT: ms(config.get("db.pool.acquireTimeout") as string)
    }
  };
}

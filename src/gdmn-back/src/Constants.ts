import config from "config";
import ms from "ms";
import path from "path";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

export class Constants {

  public static readonly NAME = "gdmn-back";
  public static readonly VERSION = "1.0.0";

  public static readonly NODE_ENV = process.env.NODE_ENV;

  public static readonly SERVER = {
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
      TIMEOUT: ms(config.get("server.session.timeout") as string)
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
    DIR: path.resolve(config.get("db.dir"))
  };
}

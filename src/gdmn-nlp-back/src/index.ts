import {ERBridge} from "gdmn-er-bridge";
import {EntityQuery, ERModel, IEntityQueryResponse} from "gdmn-orm";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";
import cors from "koa2-cors";
import {loadDBDetails} from "./testConfig";

const dbDetail = loadDBDetails()[0];

async function loadERModel(): Promise<ERModel> {
  const connection = dbDetail.driver.newConnection();
  await connection.connect({...dbDetail.connectionOptions, readTransaction: true});
  try {
    await ERBridge.initDatabase(connection);
    return await ERBridge.reloadERModel(connection, connection.readTransaction, new ERModel());
  } finally {
    await connection.disconnect();
  }
}

async function getData(query: EntityQuery): Promise<IEntityQueryResponse> {
  const connection = dbDetail.driver.newConnection();
  await connection.connect({...dbDetail.connectionOptions, readTransaction: true});
  try {
    return await ERBridge.query(connection, connection.readTransaction, query);
  } finally {
    await connection.disconnect();
  }
}

async function getErModelResp(ctx: Koa.Context): Promise<void> {
  try {
    if (ctx.state.ERModel) {
      ctx.body = ctx.state.ERModel.serialize(true);
    }
  } catch (err) {
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      message: ctx.status + ": " + err.message
    };
  }
}

async function getDataResp(ctx: Koa.Context): Promise<void> {
  try {
    console.log(ctx.request.querystring);
    console.log(ctx.request.query.query);
    const query = ctx.request.query.query;
    try {
      const entityQuery = EntityQuery.deserialize(ctx.state.ERModel, query);
      ctx.body = await getData(entityQuery);
      console.log(ctx.body);
    } catch (err) {
      console.log(err.message);
      ctx.status = 400;
      ctx.body = "400: Некорректный запрос";
    }
  } catch {
    ctx.status = 500;
    ctx.body = "500: Ошибка выполнения sql и другие внутренние ошибки";
  }
}

async function init(): Promise<void> {
  const ourERModel = await loadERModel();
  const app = new Koa();
  app.use(bodyParser())
    .use(cors())
    .use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        ctx.status = err.statusCode || err.status || 500;
        ctx.body = {
         message: ctx.status + ": " + err.message
        };
      }
    });

  app.use(async (ctx, next) => {
    ctx.state.ERModel = ourERModel;
    await next();
  });
  const router = new Router();
  router
    .get("/ermodel", getErModelResp)
    .get("/data", getDataResp);

  app
    .use(router.routes())
    .use(router.allowedMethods());

  app.listen(3001);
}

init()
  .then(() => {
    console.log("ok");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

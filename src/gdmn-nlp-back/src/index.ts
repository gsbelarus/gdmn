import Koa from "koa";
import {Factory, IConnectionOptions} from "gdmn-db";
import {ERBridge} from "gdmn-er-bridge";
import {EntityQuery, ERModel, IEntityQueryResponse} from "gdmn-orm";
import Router from 'koa-router';
import bodyParser from "koa-bodyparser";

const driver = Factory.getDriver("firebird");
const options: IConnectionOptions = {
  server: {
    host: "192.168.0.34",
    port: 3054
  },
  username: "SYSDBA",
  password: "masterkey",
  readTransaction: true,
  path: "k:\\bases\\broiler\\GDBASE_2019_01_14.FDB"
};

async function loadERModel(): Promise<ERModel> {
  const connection = driver.newConnection();
  await connection.connect(options);
  try {
    await ERBridge.initDatabase(connection);
    return await ERBridge.reloadERModel(connection, connection.readTransaction, new ERModel());
  } finally {
    await connection.disconnect();
  }
}

async function getData(query: EntityQuery): Promise<IEntityQueryResponse> {
  const connection = driver.newConnection();
  await connection.connect(options);
  try {
    return await ERBridge.query(connection, connection.readTransaction, query);
  } finally {
    await connection.disconnect();
  }
}

async function getErModelResp(ctx: Koa.Context): Promise<void> {
  try {
    if (ctx.state.ERModel){
      ctx.body = ctx.state.ERModel.serialize();
   }
  } catch (err) {
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      message: ctx.status + ": " + err.message
    }
  }      
}

async function getDataResp(ctx: Koa.Context): Promise<void> {
  try {
    console.log(ctx.request.querystring);
    console.log(ctx.request.query.query);
    let query = ctx.request.query.query;
    try{
      const entityQuery = EntityQuery.deserialize(ctx.state.ERModel, query);
      let bodytext = await getData(entityQuery);
      ctx.body = bodytext;
      console.log(ctx.body);
    } catch (err){
      console.log(err.message);
      ctx.status = 400;
      ctx.body = '400: Некорректный запрос'
    } 
  } catch{
    ctx.status = 500;
    ctx.body = '500: Ошибка выполнения sql и другие внутренние ошибки'
  }
}

async function init(): Promise<void> {
  const ourERModel = await loadERModel();
  const app = new Koa();
  app.use(bodyParser());
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.statusCode || err.status || 500;
      ctx.body = {
        message: ctx.status + ": " + err.message
      };
    }
  })

  app.use((ctx, next) => {
    ctx.state.ERModel = ourERModel;
    next();
  });
  const router = new Router();
  router
    .get('/ermodel', getErModelResp)
    .get('/data', getDataResp); 

  app
    .use(router.routes())
    .use(router.allowedMethods());

  app.listen(3000); 
}


init()
  .then(()=>{
    console.log('ok');
  })
  .catch((err)=>{
    console.log(err.message);
  })

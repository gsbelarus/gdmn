const  { Factory } = require("gdmn-db");
const { performance } = require('perf_hooks');

async function test() {

  const poolSize = 20;
  const pool = [];

  for (let i = 0; i < poolSize; i++) {
    const connection = Factory.FBDriver.newConnection();
    await connection.connect({
      server: {
        host: "192.168.0.34",
        port: 3053
      },
      username: "SYSDBA",
      password: "masterkey",
      path: "k:\\bases\\broiler\\GDBASE_2019_01_14.FDB"
    });
    const transaction = await connection.startTransaction();
    pool.push({
      connection,
      transaction
    })
  }

  /*
  const connection = Factory.FBDriver.newConnection();
  await connection.connect({
    server: {
      host: "192.168.0.34",
      port: 3053
    },
    username: "SYSDBA",
    password: "masterkey",
    path: "k:\\bases\\broiler\\GDBASE_2018_01_03.FDB"
  });
  */

  const arr = [];
  const res = [];
  const cnt = 750;
  //const transaction = await connection.startTransaction();
  const startTime = performance.now();

  let k = 0;

  for (let i = 0; i < cnt; i++) {
    arr.push(
      async () => {
        if (++k === poolSize) k = 0;
        const connection = pool[k].connection;
        const transaction = pool[k].transaction;
        const q = await connection.executeQuery(transaction, `SELECT name FROM GD_CONTACT`);
        //for (let j = 0; await q.next() && j < 1000; j++) {}
        if (await q.next()) {
          res.push(q.getString("NAME"));
        }
        return q.close();
      }
    )
  }

  await Promise.all(arr.map( f => f() ));

  /*
  for (let i = 0; i < cnt; i++) {
    arr.push(
      async () => {
        const q = await connection.executeQuery(transaction, `SELECT name FROM GD_CONTACT`);
        for (let j = 0; await q.next() && j < 1000; j++) {}
        res.push(q.getString("NAME"));
        return q.close();
      }
    )
  }

  await Promise.all(arr.map( f => f() ));
  */

  /*
  for (let i = 0; i < cnt; i++) {
    const q = await connection.executeQuery(transaction, `SELECT FIRST 1 name FROM GD_CONTACT`);
    if (await q.next()) {
      res.push(q.getString("NAME"));
    }
    await q.close();
  }
  */

  /*
  for (let i = 0; i < cnt; i++) {
    const q = await connection.executeQuery(transaction, `SELECT name FROM GD_CONTACT`);
    for (let j = 0; await q.next() && j < 1000; j++) {}
    res.push(q.getString("NAME"));
    await q.close();
  }
  */


  const endTime = performance.now();
  //await transaction.commit();
  console.log(res);
  console.log(`${Math.floor(cnt / (endTime - startTime) * 1000)} req/sec`);
  console.log(process.memoryUsage());

  //await connection.disconnect();

  pool.forEach( async c => {
    await c.transaction.commit();
    await c.connection.disconnect();
  });
}

test();

    /*

      /*
      connection.executeQuery(transaction, `SELECT FIRST 1 * FROM GD_CONTACT`)
      .then( async (resultSet: any) => { await resultSet.next(); return resultSet; } )
      .then( (resultSet: any) => { res.push(resultSet.getString("NAME")); return resultSet; } )
      .then( (resultSet: any) => resultSet.close() )


    const resultSet = await connection.executeQuery(transaction, `SELECT FIRST 1 * FROM GD_CONTACT`);
    while (await resultSet.next()) {
      s = resultSet.getString("NAME");
    }
    await resultSet.close();
    */
import {AConnection} from "../AConnection";
import {AConnectionPool} from "../AConnectionPool";
import {ADriver} from "../ADriver";
import {AccessMode, ATransaction} from "../ATransaction";
import {DBSchema} from "../DBSchema";
import {Connection} from "./Connection";
import {Service} from "./Service";
import {RDBReader} from "./utils/RDBReader";

export class Driver extends ADriver {

    public readonly name: string = "firebird";

    public async readDBSchema(connectionPool: AConnectionPool<any>): Promise<DBSchema>;
    public async readDBSchema(connection: AConnection, transaction?: ATransaction): Promise<DBSchema>;
    public async readDBSchema(source: AConnectionPool<any> | AConnection,
                              transaction?: ATransaction): Promise<DBSchema> {
        console.log("Считывание структуры данных...");
        console.time("Считывание структуры данных");
        let result;
        if (source instanceof AConnection) {
            if (transaction) {
                result = await RDBReader.readByConnection(source, transaction);
            } else {
                try {
                    result = await RDBReader.readByConnection(source, source.readTransaction);
                } catch (error) {
                    result = await AConnection.executeTransaction({
                        connection: source,
                        options: {accessMode: AccessMode.READ_ONLY},
                        callback: (newTransaction) => RDBReader.readByConnection(source, newTransaction)
                    });
                }
            }
        } else {
            result = await RDBReader.readConnectionPool(source);
        }
        console.timeEnd("Считывание структуры данных");

        console.log("Разбор структуры данных...");
        console.time("Разбор структуры данных");
        const dbSchema = new DBSchema();
        dbSchema.load(result[0], result[1], result[2]);
        console.timeEnd("Разбор структуры данных");
        return dbSchema;
    }

    public newConnection(): AConnection {
        return new Connection(this);
    }

    public newService(): Service {
        return new Service();
    }
}

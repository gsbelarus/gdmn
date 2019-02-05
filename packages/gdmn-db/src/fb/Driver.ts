import {AConnection} from "../AConnection";
import {ADriver} from "../ADriver";
import {DBStructure} from "../DBStructure";
import {Connection} from "./Connection";
import {DBStructureReader} from "./DBStructureReader";
import {Service} from "./Service";
import {Transaction} from "./Transaction";

export class Driver extends ADriver {

    public readonly name: string = "firebird";

    public async readDBStructure(connection: Connection, transaction: Transaction): Promise<DBStructure> {
        return await DBStructureReader.readStructure(connection, transaction);
    }

    public newConnection(): AConnection {
        return new Connection(this);
    }

    public newService(): Service {
        return new Service();
    }
}

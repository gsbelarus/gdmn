import {
    disposeMaster,
    getDefaultLibraryFilename,
    getMaster,
    Master,
    Provider,
    Status,
    Util
} from "node-firebird-native-api";

export interface IClient {
    master: Master;
    dispatcher: Provider;
    util: Util;
}

export class Client {

    private _client?: IClient;

    get client(): IClient | undefined {
        return this._client;
    }

    public async create(): Promise<void> {
        if (this._client) {
            throw new Error("Client already created");
        }

        const master = getMaster(getDefaultLibraryFilename());
        const dispatcher = master.getDispatcherSync()!;
        const util = master.getUtilInterfaceSync()!;

        this._client = {master, dispatcher, util};
    }

    public async destroy(): Promise<void> {
        if (!this._client) {
            throw new Error("Need created client");
        }

        this._client.dispatcher!.releaseSync();
        if (process.platform !== "darwin") {    // FIXME mac os
            disposeMaster(this._client.master);
        }
        this._client = undefined;
    }

    public async statusAction<T>(action: (status: Status) => Promise<T>): Promise<T> {
        const status = this.client!.master.getStatusSync()!;
        try {
            return await action(status);
        } finally {
            status.disposeSync();
        }
    }

    public statusActionSync<T>(action: (status: Status) => T): T {
        const status = this.client!.master.getStatusSync()!;
        try {
            return action(status);
        } finally {
            status.disposeSync();
        }
    }
}

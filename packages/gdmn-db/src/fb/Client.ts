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
        this._client = {
            master,
            dispatcher: (await master.getDispatcherAsync())!,
            util: (await master.getUtilInterfaceAsync())!
        };
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
        const status = (await this.client!.master.getStatusAsync())!;
        try {
            return await action(status);
        } finally {
            await status.disposeAsync();
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

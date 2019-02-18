export interface IServiceOptions {
    username: string;
    password: string;
    host: string;
    port: number;
}

export interface IRestoreOptions {
    replace?: boolean;
}

// TODO reviewing, refactoring, improving
export abstract class AService {

    public abstract async attach(options: IServiceOptions): Promise<void>;

    public abstract async detach(): Promise<void>;

    public abstract async backupDatabase(dbPath: string, backupPath: string): Promise<void>;

    public abstract async restoreDatabase(dbPath: string, backupPath: string, options?: IRestoreOptions): Promise<void>;
}

export type TExecutor<Subject, Result> = ((subject: Subject) => Result) | ((subject: Subject) => Promise<Result>);

export interface IBaseExecuteOptions<S, R> {
    callback: TExecutor<S, R>;
}

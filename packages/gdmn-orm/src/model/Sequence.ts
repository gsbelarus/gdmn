import {ISequenceAdapter} from "../rdbadapter";
import {IBaseOptions, ISequenceSource} from "../types";

export class Sequence<Adapter = ISequenceAdapter> {

  protected _source?: ISequenceSource;

  private readonly _name: string;
  private readonly _adapter?: Adapter;

  constructor(options: IBaseOptions<Adapter>) {
    this._name = options.name;
    this._adapter = options.adapter;
  }

  get name(): string {
    return this._name;
  }

  get adapter(): Adapter | undefined {
    return this._adapter;
  }

  public async initDataSource(source?: ISequenceSource): Promise<void> {
    this._source = source;
    if (this._source) {
      await this._source.init(this);
    }
  }
}

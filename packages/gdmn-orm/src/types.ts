import {SemCategory} from "gdmn-nlp";
import {Attribute} from "./model/Attribute";
import {Entity} from "./model/Entity";
import {ERModel} from "./model/ERModel";
import {Sequence} from "./model/Sequence";
import {EntityQuery, IQueryResponse} from "./query-models/EntityQuery";

export interface ITName {
  name: string;
  fullName?: string;
}

export interface ILName {
  ru?: ITName;
  by?: ITName;
  en?: ITName;
}

export interface IEnumValue {
  value: string | number;
  lName?: ILName;
}

export type ContextVariables = "CURRENT_TIMESTAMP" | "CURRENT_TIMESTAMP(0)" | "CURRENT_DATE" | "CURRENT_TIME";

export type AttributeTypes = "Entity"
  | "String"
  | "Set"
  | "Parent"
  | "Detail"
  | "Sequence"
  | "Integer"
  | "Numeric"
  | "Float"
  | "Boolean"
  | "Date"
  | "TimeStamp"
  | "Time"
  | "Blob"
  | "Enum";

export interface IBaseOptions<Adapter = any> {
  name: string;
  adapter?: Adapter;

  [name: string]: any;
}

export interface IBaseSemOptions<Adapter = any> extends IBaseOptions<Adapter> {
  lName: ILName;
  semCategories?: SemCategory[];
}

export interface IConnection {
  readonly connected: boolean;

  disconnect(): Promise<void>;
}

export interface ITransaction {
  readonly finished: boolean;

  commit(): Promise<void>;

  rollback(): Promise<void>;
}

export interface IBaseSource<CurType> {
  init(obj: CurType): Promise<CurType>;
}

export interface IBaseCreatableSource<ParentType, CurType> extends IBaseSource<CurType> {
  create<T extends CurType>(parent: ParentType,
                            obj: T,
                            connection: IConnection,
                            transaction?: ITransaction): Promise<T>;

  delete(parent: ParentType, obj: CurType, connection: IConnection, transaction?: ITransaction): Promise<void>;
}

export interface IDataSource extends IBaseSource<ERModel> {
  connect(): Promise<IConnection>;

  startTransaction(connection: IConnection): Promise<ITransaction>;

  query(query: EntityQuery, connection: IConnection, transaction?: ITransaction): Promise<IQueryResponse>;

  getEntitySource(): IEntitySource | undefined;

  getSequenceSource(): ISequenceSource | undefined;
}

export interface ISequenceSource extends IBaseCreatableSource<ERModel, Sequence<any>> {
  // empty
}

export interface IEntitySource extends IBaseCreatableSource<ERModel, Entity> {
  getAttributeSource(): IAttributeSource | undefined;

  addUnique(entity: Entity, attrs: Attribute[], connection: IConnection, transaction?: ITransaction): Promise<void>;

  removeUnique(entity: Entity, attrs: Attribute[], connection: IConnection, transaction?: ITransaction): Promise<void>;
}

export interface IAttributeSource extends IBaseCreatableSource<Entity, Attribute> {
  // empty
}

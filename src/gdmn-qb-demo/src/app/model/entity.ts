export interface IAttribute {
  id?: string;
  name: string;
  type?: string;
  lName?: object;
  required?: boolean;
  semCategories?: string;
  calculated?: boolean;
  sequence?: string;
  minValue?: any;
  maxValue?: any;
  minLength?: number;
  maxLength?: number;
  autoTrim?: boolean;
  defaultValue?: any;
  values?: any[];
  references?: any[];
  precision?: number;
  scale?: number;
  attributes?: any[];
  presLen?: number;
}

export interface IEntity {
  parent?: string;
  id?: string;
  name: string;
  lName?: object;
  isAbstract?: boolean;
  attributes?: IAttribute[];
  semCategories?: string;
}

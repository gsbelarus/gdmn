
export interface IFilterCondition {
  value: string | RegExp;
};

export interface IFilter {
  conditions: IFilterCondition[];
};
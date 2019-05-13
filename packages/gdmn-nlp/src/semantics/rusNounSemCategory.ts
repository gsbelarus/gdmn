import { SemCategory } from "./categories";

export interface IRusNounSemCategory {
  [stem: string]: SemCategory[];
};

export const RusNounSemCategory: IRusNounSemCategory = {
  'минск': [SemCategory.Place],
  'пинск': [SemCategory.Place],
  'организаци': [SemCategory.Organization],
  'школ': [SemCategory.Organization]
};

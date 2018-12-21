import { SemCategory, semCategories2Str } from "./categories";
import { RusNoun } from "../morphology/rusNoun";

export interface IRusNounSemCategory {
  [stem: string]: SemCategory[];
};

export const RusNounSemCategory: IRusNounSemCategory = {
  'минск': [SemCategory.Place],
  'организаци': [SemCategory.Organization]
};
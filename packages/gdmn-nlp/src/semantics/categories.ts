/**
 * Семантические категории мы используем для присвоения
 * некоторого смысла (значения) слову. Некоторые слова
 * в разных контекстах могут иметь разный смысл.
 * Слова с одинаковым смыслом являются синонимами.
 */
export enum SemCategory {
  /**
   * Место расположения объекта в пространстве (географическое).
   */
  ObjectLocation = 0,

  /**
   * Место, город, область, район, страна.
   */
  Place,

  /**
   * Любая организация. Коммерческая, некомерческая,
   * правительственное учреждение, школа, университет и т.п.
   * Юридическое лицо.
   */
  Organization,

  /**
   * Коммерческая организация. Юридическое лицо.
   */
  Company,

  /**
   * Дата
   */
  Date,

  /**
   * Имя, название, наименование.
   */
  Name
};

export enum SemContext {
  Common = 0,
  QueryDB
};

export interface ISemMeaning {
  semCategory: SemCategory;
  semContext?: SemContext;
};

export const semCategoryNames = [
  'objectlocation',
  'place',
  'organization',
  'company',
  'date',
  'name'
];

export function semCategory2Str(cat: SemCategory): string {
  return semCategoryNames[cat];
};

export function str2SemCategory(str: string): SemCategory {
  const idx = semCategoryNames.indexOf(str);

  if (idx === -1) {
    throw new Error(`Unknown category ${str}`);
  }

  return idx;
};

export function semCategories2Str(cat: SemCategory[]): string {
  if (cat.length) {
    return cat.map( c => semCategory2Str(c) ).join(',');
  } else {
    return '';
  }
};

export function str2SemCategories(str: string): SemCategory[] {
  if (str) {
    return str.split(',').map( s => str2SemCategory(s) );
  } else {
    return [];
  }
};

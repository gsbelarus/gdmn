export type Lang = 'ru' | 'by' | 'en';

export interface ITName {
  name: string;
  fullName?: string;
};

export type LName = {
  [lang in Lang]?: ITName;
};

export function getLName(n: LName, langPref: Lang[] = [], getFullName: boolean = false): string {
  for (let i = 0; i < langPref.length; i++) {
    const tn = n[langPref[i]];
    if (tn) {
      return getFullName && tn.fullName ? tn.fullName : tn.name;
    }
  }

  if (!n.en) return '';

  return getFullName && n.en.fullName ? n.en.fullName : n.en.name;
};
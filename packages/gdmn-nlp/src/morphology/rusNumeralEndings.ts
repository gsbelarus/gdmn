import { RusDeclensionNumeralEnding, RusGender, RusCase } from './types';

export const RusNumeralEndings: RusDeclensionNumeralEnding[] =
[
  {
    declension: 'pqs0', 
    endings: [
      // ноль
      {
        ending: 'ь',
        c: RusCase.Nomn,
        singular: true,
      },
      // ноля
      {
        ending: 'я',
        c: RusCase.Gent,
        singular: true,
      },
      // нолю
      {
        ending: 'ю',
        c: RusCase.Datv,
        singular: true,
      },
      // ноль
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        animate: true,
      },
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        animate: false,
      },

      // нолём
      {
        ending: 'ём',
        c: RusCase.Ablt,
        singular: true,
      },
      // ноле
      {
        ending: 'е',
        c: RusCase.Loct,
        singular: true,
      },
    ]
  },
  {
    declension: 'pqs1', 
    endings: [
      // один
      {
        ending: '',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // одного
      {
        ending: 'ого',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // одному
      {
        ending: 'ому',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // одного
      {
        ending: 'ого',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      // один
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // одним
      {
        ending: 'им',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // одном
      {
        ending: 'ом',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // одна
      {
        ending: 'а',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // одной
      {
        ending: 'ой',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // одной
      {
        ending: 'ой',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // одну
      {
        ending: 'у',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      {
        ending: 'у',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },
      // одной
      {
        ending: 'ой',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // одной
      {
        ending: 'ой',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // одно
      {
        ending: 'о',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // одного
      {
        ending: 'ого',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // одному
      {
        ending: 'ому',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // одно
      {
        ending: 'о',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      {
        ending: 'о',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // одним
      {
        ending: 'им',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // одном
      {
        ending: 'ом',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
    ]
  },
  {
    declension: 'pqs2', 
    endings:[
      // два
      {
        ending: 'а',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // двум
      {
        ending: 'ум',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      // два
      {
        ending: 'а',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // двумя
      {
        ending: 'умя',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // две
      {
        ending: 'е',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // двум
      {
        ending: 'ум',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      // две
      {
        ending: 'е',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },
      // двумя
      {
        ending: 'умя',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // два
      {
        ending: 'а',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // двум
      {
        ending: 'ум',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      // два
      {
        ending: 'а',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // двумя
      {
        ending: 'умя',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
    ]
  },
  {
    declension: 'pqs3', 
    endings:[
      // три
      {
        ending: 'и',
        c: RusCase.Nomn,
        singular: true,
      },
      // трёх
      {
        ending: 'ёх',
        c: RusCase.Gent,
        singular: true,
      },
      // трём
      {
        ending: 'ём',
        c: RusCase.Datv,
        singular: true,
      },
      // трёх
      {
        ending: 'ёх',
        c: RusCase.Accs,
        singular: true,
        animate: true,
      },
      // три
      {
        ending: 'и',
        c: RusCase.Accs,
        singular: true,
        animate: false,
      },
      // тремя
      {
        ending: 'емя',
        c: RusCase.Ablt,
        singular: true,
      },
      // трёх
      {
        ending: 'ёх',
        c: RusCase.Loct,
        singular: true,
      },
    ]
  },
  {
    declension: 'pqs4', 
    endings:[
      // четыре
      {
        ending: 'е',
        c: RusCase.Nomn,
        singular: true,
      },
      // четырёх
      {
        ending: 'ёх',
        c: RusCase.Gent,
        singular: true,
      },
      // четырём
      {
        ending: 'ём',
        c: RusCase.Datv,
        singular: true,
      },
      // четырёх
      {
        ending: 'ёх',
        c: RusCase.Accs,
        singular: true,
        animate: true,
      },
      // четыре
      {
        ending: 'е',
        c: RusCase.Accs,
        singular: true,
        animate: false,
      },
      // четырьмя
      {
        ending: 'ьмя',
        c: RusCase.Ablt,
        singular: true,
      },
      // четырёх
      {
        ending: 'ёх',
        c: RusCase.Loct,
        singular: true,
      },
    ]
  },
  {
    declension: 'pqs5-7,9-20,30',
    endings:[
      // пять
      {
        ending: 'ь',
        c: RusCase.Nomn,
        singular: true,
      },
      // пяти
      {
        ending: 'и',
        c: RusCase.Gent,
        singular: true,
      },
      // пяти
      {
        ending: 'и',
        c: RusCase.Datv,
        singular: true,
      },
      // пять
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        animate: true,
      },
      // пять
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        animate: false,
      },
      // пятью
      {
        ending: 'ью',
        c: RusCase.Ablt,
        singular: true,
      },
      // пяти
      {
        ending: 'и',
        c: RusCase.Loct,
        singular: true,
      },
    ]
  },
  {
    declension: 'pqs8', 
    endings:[
      // восемь
      {
        ending: 'ь',
        c: RusCase.Nomn,
        singular: true,
      },
      // восьми
      {
        ending: 'и',
        c: RusCase.Gent,
        singular: true,
      },
      // восьми
      {
        ending: 'и',
        c: RusCase.Datv,
        singular: true,
      },
      // восемь
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        animate: true,
      },
      // восемь
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        animate: false,
      },
      // восьмью
      {
        ending: 'ью',
        c: RusCase.Ablt,
        singular: true,
      },
      // восьми
      {
        ending: 'и',
        c: RusCase.Loct,
        singular: true,
      },
    ]
  },
  {
    declension: 'pqs40', 
    endings:[
      // сорок
      {
        ending: '',
        c: RusCase.Nomn,
        singular: true,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Gent,
        singular: true,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Datv,
        singular: true,
      },
      // сорок
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        animate: true,
      },
      // сорок
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        animate: false,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Ablt,
        singular: true,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Loct,
        singular: true,
      },
    ]
  },
  {
    declension: 'pqs90,100', 
    endings:[
      // девяносто
      {
        ending: 'о',
        c: RusCase.Nomn,
        singular: true,
      },
      // девяноста
      {
        ending: 'а',
        c: RusCase.Gent,
        singular: true,
      },
      // девяноста
      {
        ending: 'а',
        c: RusCase.Datv,
        singular: true,
      },
      // девяносто
      {
        ending: 'о',
        c: RusCase.Accs,
        singular: true,
        animate: true,
      },
      // девяносто
      {
        ending: 'о',
        c: RusCase.Accs,
        singular: true,
        animate: false,
      },
      // девяноста
      {
        ending: 'а',
        c: RusCase.Ablt,
        singular: true,
      },
      // девяноста
      {
        ending: 'а',
        c: RusCase.Loct,
        singular: true,
      },
    ]
  },
  {
    declension: 'pqc50,60,70,80', 
    endings:[
      // десят
      {
        ending: '',
        c: RusCase.Nomn,
        singular: true,
      },
      // десяти
      {
        ending: 'и',
        c: RusCase.Gent,
        singular: true,
      },
      // десяти
      {
        ending: 'и',
        c: RusCase.Datv,
        singular: true,
      },
      // десят
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        animate: true,
      },
      // десят
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        animate: false,
      },
      // десятью
      {
        ending: 'ью',
        c: RusCase.Ablt,
        singular: true,
      },
      // десяти
      {
        ending: 'и',
        c: RusCase.Loct,
        singular: true,
      },
    ]
  },
];
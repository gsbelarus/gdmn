import { RusDeclensionNumeralEnding, RusGender, RusCase } from './types';

export const RusNumeralEndings: RusDeclensionNumeralEnding[] =
[
  {
    declension: 'pqs1', 
    endings: [
      // один
      {
        ending: '',
        c: RusCase.Nomn,
        gender: RusGender.Masc,
      },
      // одного
      {
        ending: 'ого',
        c: RusCase.Gent,
        gender: RusGender.Masc,
      },
      // одному
      {
        ending: 'ому',
        c: RusCase.Datv,
        gender: RusGender.Masc,
      },
      // одного
      {
        ending: 'ого',
        c: RusCase.Accs,
        gender: RusGender.Masc,
        animate: true,
      },
      // один
      {
        ending: '',
        c: RusCase.Accs,
        gender: RusGender.Masc,
        animate: false,
      },
      // одним
      {
        ending: 'им',
        c: RusCase.Ablt,
        gender: RusGender.Masc,
      },
      // одном
      {
        ending: 'ом',
        c: RusCase.Loct,
        gender: RusGender.Masc,
      },
      // одна
      {
        ending: 'а',
        c: RusCase.Nomn,
        gender: RusGender.Femn,
      },
      // одной
      {
        ending: 'ой',
        c: RusCase.Gent,
        gender: RusGender.Femn,
      },
      // одной
      {
        ending: 'ой',
        c: RusCase.Datv,
        gender: RusGender.Femn,
      },
      // одну
      {
        ending: 'у',
        c: RusCase.Accs,
        gender: RusGender.Femn,
        animate: true,
      },
      {
        ending: 'у',
        c: RusCase.Accs,
        gender: RusGender.Femn,
        animate: false,
      },
      // одной
      {
        ending: 'ой',
        c: RusCase.Ablt,
        gender: RusGender.Femn,
      },
      // одной
      {
        ending: 'ой',
        c: RusCase.Loct,
        gender: RusGender.Femn,
      },
      // одно
      {
        ending: 'о',
        c: RusCase.Nomn,
        gender: RusGender.Neut,
      },
      // одного
      {
        ending: 'ого',
        c: RusCase.Gent,
        gender: RusGender.Neut,
      },
      // одному
      {
        ending: 'ому',
        c: RusCase.Datv,
        gender: RusGender.Neut,
      },
      // одно
      {
        ending: 'о',
        c: RusCase.Accs,
        gender: RusGender.Neut,
        animate: true,
      },
      {
        ending: 'о',
        c: RusCase.Accs,
        gender: RusGender.Neut,
        animate: false,
      },
      // одним
      {
        ending: 'им',
        c: RusCase.Ablt,
        gender: RusGender.Neut,
      },
      // одном
      {
        ending: 'ом',
        c: RusCase.Loct,
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
        gender: RusGender.Masc,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Gent,
        gender: RusGender.Masc,
      },
      // двум
      {
        ending: 'ум',
        c: RusCase.Datv,
        gender: RusGender.Masc,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Accs,
        gender: RusGender.Masc,
        animate: true,
      },
      // два
      {
        ending: 'а',
        c: RusCase.Accs,
        gender: RusGender.Masc,
        animate: false,
      },
      // двумя
      {
        ending: 'умя',
        c: RusCase.Ablt,
        gender: RusGender.Masc,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Loct,
        gender: RusGender.Masc,
      },
      // две
      {
        ending: 'е',
        c: RusCase.Nomn,
        gender: RusGender.Femn,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Gent,
        gender: RusGender.Femn,
      },
      // двум
      {
        ending: 'ум',
        c: RusCase.Datv,
        gender: RusGender.Femn,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Accs,
        gender: RusGender.Femn,
        animate: true,
      },
      // две
      {
        ending: 'е',
        c: RusCase.Accs,
        gender: RusGender.Femn,
        animate: false,
      },
      // двумя
      {
        ending: 'умя',
        c: RusCase.Ablt,
        gender: RusGender.Femn,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Loct,
        gender: RusGender.Femn,
      },
      // два
      {
        ending: 'а',
        c: RusCase.Nomn,
        gender: RusGender.Neut,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Gent,
        gender: RusGender.Neut,
      },
      // двум
      {
        ending: 'ум',
        c: RusCase.Datv,
        gender: RusGender.Neut,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Accs,
        gender: RusGender.Neut,
        animate: true,
      },
      // два
      {
        ending: 'а',
        c: RusCase.Accs,
        gender: RusGender.Neut,
        animate: false,
      },
      // двумя
      {
        ending: 'умя',
        c: RusCase.Ablt,
        gender: RusGender.Neut,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Loct,
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
      },
      // трёх
      {
        ending: 'ёх',
        c: RusCase.Gent,
      },
      // трём
      {
        ending: 'ём',
        c: RusCase.Datv,
      },
      // трёх
      {
        ending: 'ёх',
        c: RusCase.Accs,
        animate: true,
      },
      // три
      {
        ending: 'и',
        c: RusCase.Accs,
        animate: false,
      },
      // тремя
      {
        ending: 'емя',
        c: RusCase.Ablt,
      },
      // трёх
      {
        ending: 'ёх',
        c: RusCase.Loct,
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
      },
      // четырёх
      {
        ending: 'ёх',
        c: RusCase.Gent,
      },
      // четырём
      {
        ending: 'ём',
        c: RusCase.Datv,
      },
      // четырёх
      {
        ending: 'ёх',
        c: RusCase.Accs,
        animate: true,
      },
      // четыре
      {
        ending: 'е',
        c: RusCase.Accs,
        animate: false,
      },
      // четырьмя
      {
        ending: 'ьмя',
        c: RusCase.Ablt,
      },
      // четырёх
      {
        ending: 'ёх',
        c: RusCase.Loct,
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
      },
      // пяти
      {
        ending: 'и',
        c: RusCase.Gent,
      },
      // пяти
      {
        ending: 'и',
        c: RusCase.Datv,
      },
      // пять
      {
        ending: 'ь',
        c: RusCase.Accs,
        animate: true,
      },
      // пять
      {
        ending: 'ь',
        c: RusCase.Accs,
        animate: false,
      },
      // пятью
      {
        ending: 'ью',
        c: RusCase.Ablt,
      },
      // пяти
      {
        ending: 'и',
        c: RusCase.Loct,
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
      },
      // восьми
      {
        ending: 'и',
        c: RusCase.Gent,
      },
      // восьми
      {
        ending: 'и',
        c: RusCase.Datv,
      },
      // восемь
      {
        ending: 'ь',
        c: RusCase.Accs,
        animate: true,
      },
      // восемь
      {
        ending: 'ь',
        c: RusCase.Accs,
        animate: false,
      },
      // восьмью
      {
        ending: 'ью',
        c: RusCase.Ablt,
      },
      // восьми
      {
        ending: 'и',
        c: RusCase.Loct,
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
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Gent,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Datv,
      },
      // сорок
      {
        ending: '',
        c: RusCase.Accs,
        animate: true,
      },
      // сорок
      {
        ending: '',
        c: RusCase.Accs,
        animate: false,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Ablt,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Loct,
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
      },
      // девяноста
      {
        ending: 'а',
        c: RusCase.Gent,
      },
      // девяноста
      {
        ending: 'а',
        c: RusCase.Datv,
      },
      // девяносто
      {
        ending: 'о',
        c: RusCase.Accs,
        animate: true,
      },
      // девяносто
      {
        ending: 'о',
        c: RusCase.Accs,
        animate: false,
      },
      // девяноста
      {
        ending: 'а',
        c: RusCase.Ablt,
      },
      // девяноста
      {
        ending: 'а',
        c: RusCase.Loct,
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
      },
      // десяти
      {
        ending: 'и',
        c: RusCase.Gent,
      },
      // десяти
      {
        ending: 'и',
        c: RusCase.Datv,
      },
      // десят
      {
        ending: '',
        c: RusCase.Accs,
        animate: true,
      },
      // десят
      {
        ending: '',
        c: RusCase.Accs,
        animate: false,
      },
      // десятью
      {
        ending: 'ью',
        c: RusCase.Ablt,
      },
      // десяти
      {
        ending: 'и',
        c: RusCase.Loct,
      },
    ]
  },
];
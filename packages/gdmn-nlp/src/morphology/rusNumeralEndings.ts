import { RusDeclensionNumeralZEnding, RusGender, RusCase } from './types';

export const RusNumeralZEndings: RusDeclensionNumeralZEnding[] =
[
  {
    declensionZ: 'pqs', 
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

      // одни
      {
        ending: 'и',
        c: RusCase.Nomn,
        singular: false,
      },
      // одних
      {
        ending: 'их',
        c: RusCase.Gent,
        singular: false,
      },
      // одним
      {
        ending: 'им',
        c: RusCase.Datv,
        singular: false,
      },
      // одних
      {
        ending: 'их',
        c: RusCase.Accs,
        singular: false,
        animate: true,
      },
      // одни
      {
        ending: 'и',
        c: RusCase.Accs,
        singular: false,
        animate: false,
      },
      // одними
      {
        ending: 'ими',
        c: RusCase.Ablt,
        singular: false,
      },
      // одних
      {
        ending: 'их',
        c: RusCase.Loct,
        singular: false,
      },
    ]
  },
  {
    declensionZ: 'pqs1', 
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
      // двум
      {
        ending: 'ум',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // двух
      {
        ending: 'ух',
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
    declensionZ: 'pqs2', 
    endings:[
      // три
      {
        ending: 'и',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // трёх
      {
        ending: 'ёх',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // трём
      {
        ending: 'ём',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // трёх
      {
        ending: 'ёх',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      // три
      {
        ending: 'и',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // тремя
      {
        ending: 'емя',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // трёх
      {
        ending: 'ёх',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // три
      {
        ending: 'и',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // трёх
      {
        ending: 'ёх',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // трём
      {
        ending: 'ём',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // трёх
      {
        ending: 'ёх',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      // три
      {
        ending: 'и',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },
      // тремя
      {
        ending: 'емя',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // трёх
      {
        ending: 'ёх',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // три
      {
        ending: 'и',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // трёх
      {
        ending: 'ёх',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // трём
      {
        ending: 'ём',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // трёх
      {
        ending: 'ёх',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      // три
      {
        ending: 'и',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // тремя
      {
        ending: 'емя',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // трёх
      {
        ending: 'ёх',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
    ]
  },
  {
    declensionZ: 'pqs3', 
    endings:[
      // четыре
      {
        ending: 'е',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // четырёх
      {
        ending: 'ёх',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // четырём
      {
        ending: 'ём',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // четырёх
      {
        ending: 'ёх',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      // четыре
      {
        ending: 'е',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // четырьмя
      {
        ending: 'ьмя',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // четырёх
      {
        ending: 'ёх',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // четыре
      {
        ending: 'е',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // четырёх
      {
        ending: 'ёх',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // четырём
      {
        ending: 'ём',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // четырёх
      {
        ending: 'ёх',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      // четыре
      {
        ending: 'е',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },
      // четырьмя
      {
        ending: 'ьмя',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // четырёх
      {
        ending: 'ёх',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // четыр
      {
        ending: 'е',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // четырёх
      {
        ending: 'ёх',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // четырём
      {
        ending: 'ём',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // четырёх
      {
        ending: 'ёх',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      // четыр
      {
        ending: 'е',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // четырьмя
      {
        ending: 'ьмя',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // четырёх
      {
        ending: 'ёх',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
    ]
  },
  {
    declensionZ: 'pqs4', 
    endings:[
      // пять
      {
        ending: 'ь',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // пяти
      {
        ending: 'и',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // пяти
      {
        ending: 'и',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // пять
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      // пять
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // пятью
      {
        ending: 'ью',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // пяти
      {
        ending: 'и',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // пять
      {
        ending: 'ь',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // пяти
      {
        ending: 'и',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // пяти
      {
        ending: 'и',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // пять
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      // пять
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },
      // пятью
      {
        ending: 'ью',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // пяти
      {
        ending: 'и',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // пять
      {
        ending: 'ь',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // пяти
      {
        ending: 'и',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // пяти
      {
        ending: 'и',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // пять
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      // пять
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // пятью
      {
        ending: 'ью',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // пяти
      {
        ending: 'и',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
    ]
  },
  {
    declensionZ: 'pqs5', 
    endings:[
      // восемь
      {
        ending: 'ь',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // восьми
      {
        ending: 'и',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // восьми
      {
        ending: 'и',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // восемь
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      // восемь
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // восьмью
      {
        ending: 'ью',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // восьми
      {
        ending: 'и',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // восемь
      {
        ending: 'ь',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // восьми
      {
        ending: 'и',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // восьми
      {
        ending: 'и',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // восемь
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      // восемь
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },
      // восьмью
      {
        ending: 'ью',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // восьми
      {
        ending: 'и',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // восемь
      {
        ending: 'ь',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // восьми
      {
        ending: 'и',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // восьми
      {
        ending: 'и',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // восемь
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      // восемь
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // восьмью
      {
        ending: 'ью',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // восьми
      {
        ending: 'и',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
    ]
  },
  {
    declensionZ: 'pqs6', 
    endings: [
      // ноль
      {
        ending: 'ь',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // ноля
      {
        ending: 'я',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // нолю
      {
        ending: 'ю',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // ноль
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // нолём
      {
        ending: 'ём',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // ноле
      {
        ending: 'е',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // ноль
      {
        ending: 'ь',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // ноля
      {
        ending: 'я',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // нолю
      {
        ending: 'ю',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // ноль
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },
      // нолём
      {
        ending: 'ём',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // ноле
      {
        ending: 'е',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // ноль
      {
        ending: 'ь',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // ноля
      {
        ending: 'я',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // нолю
      {
        ending: 'ю',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // ноль
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      {
        ending: 'ь',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // нолём
      {
        ending: 'ём',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // ноле
      {
        ending: 'е',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
      // ноли
      {
        ending: 'и',
        c: RusCase.Nomn,
        singular: false,
      },
      // нолей
      {
        ending: 'ей',
        c: RusCase.Gent,
        singular: false,
      },
      // нолям
      {
        ending: 'ям',
        c: RusCase.Datv,
        singular: false,
      },
      // ноли
      {
        ending: 'и',
        c: RusCase.Accs,
        singular: false,
        animate: true,
      },
      // ноли
      {
        ending: 'и',
        c: RusCase.Accs,
        singular: false,
        animate: false,
      },
      // нолями
      {
        ending: 'ями',
        c: RusCase.Ablt,
        singular: false,
      },
      // нолях
      {
        ending: 'ях',
        c: RusCase.Loct,
        singular: false,
      },
    ]
  },
  {
    declensionZ: 'pqs7', 
    endings:[
      // сорок
      {
        ending: '',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // сорок
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      // сорок
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // сорок
      {
        ending: '',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // сорок
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      // сорок
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // сорок
      {
        ending: '',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // сорок
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      // сорок
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // сорока
      {
        ending: 'а',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
    ]
  },
  {
    declensionZ: 'pqs8', 
    endings:[
      // сто
      {
        ending: 'о',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // сто
      {
        ending: 'о',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      // сто
      {
        ending: 'о',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // сто
      {
        ending: 'о',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // сто
      {
        ending: 'о',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      // сто
      {
        ending: 'о',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // сто
      {
        ending: 'о',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // сто
      {
        ending: 'о',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      // сто
      {
        ending: 'о',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
      // сот
      {
        ending: '',
        c: RusCase.Gent,
        singular: false,
      },
      // стам
      {
        ending: 'ам',
        c: RusCase.Datv,
        singular: false,
      },
      // стами
      {
        ending: 'ами',
        c: RusCase.Ablt,
        singular: false,
      },
      // стах
      {
        ending: 'ах',
        c: RusCase.Loct,
        singular: false,
      },
    ]
  },
  {
    declensionZ: 'pqs9', 
    endings: [
      // тысяча
      {
        ending: 'а',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // тысячи
      {
        ending: 'и',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // тысяче
      {
        ending: 'е',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // тысячу
      {
        ending: 'у',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      {
        ending: 'у',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // тысячей
      {
        ending: 'ей',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // тысяче
      {
        ending: 'е',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // тысяча
      {
        ending: 'а',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // тысячи
      {
        ending: 'и',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // тысяче
      {
        ending: 'е',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // тысячу
      {
        ending: 'у',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      // тысячу
      {
        ending: 'у',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },
      // тысячей
      {
        ending: 'ей',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // тысяче
      {
        ending: 'е',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // тысяча
      {
        ending: 'а',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // тысячи
      {
        ending: 'и',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // тысяче
      {
        ending: 'е',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // тысячу
      {
        ending: 'у',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      {
        ending: 'у',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // тысячей
      {
        ending: 'ей',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // тысяче
      {
        ending: 'е',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
      // тысяч
      {
        ending: 'и',
        c: RusCase.Nomn,
        singular: false,
      },
      // тысяч
      {
        ending: '',
        c: RusCase.Gent,
        singular: false,
      },
      // тысячам
      {
        ending: 'ам',
        c: RusCase.Datv,
        singular: false,
      },
      // тысячи
      {
        ending: 'и',
        c: RusCase.Accs,
        singular: false,
        animate: true,
      },
      // тысячи
      {
        ending: 'и',
        c: RusCase.Accs,
        singular: false,
        animate: false,
      },
      // тысячами
      {
        ending: 'ами',
        c: RusCase.Ablt,
        singular: false,
      },
      // тысячач
      {
        ending: 'ах',
        c: RusCase.Loct,
        singular: false,
      },
    ]
  },
  {
    declensionZ: 'pqs10', 
    endings: [
      // миллион
      {
        ending: '',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // миллиона
      {
        ending: 'а',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // миллиону
      {
        ending: 'у',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // миллион
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // миллионом
      {
        ending: 'ом',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // миллионе
      {
        ending: 'е',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // миллион
      {
        ending: '',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // миллиона
      {
        ending: 'а',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // миллиону
      {
        ending: 'у',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // миллион
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      // миллион
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },
      // миллионом
      {
        ending: 'ом',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // миллионе
      {
        ending: 'е',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // миллион
      {
        ending: '',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // миллиона
      {
        ending: 'а',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // миллиону
      {
        ending: 'у',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // миллион
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // миллионом
      {
        ending: 'ом',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // миллионе
      {
        ending: 'е',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
      // миллионы
      {
        ending: 'ы',
        c: RusCase.Nomn,
        singular: false,
      },
      // миллионов
      {
        ending: 'ов',
        c: RusCase.Gent,
        singular: false,
      },
      // миллионам
      {
        ending: 'ам',
        c: RusCase.Datv,
        singular: false,
      },
      // миллионы
      {
        ending: 'ы',
        c: RusCase.Accs,
        singular: false,
        animate: true,
      },
      {
        ending: 'ы',
        c: RusCase.Accs,
        singular: false,
        animate: false,
      },
      // миллионами
      {
        ending: 'ами',
        c: RusCase.Ablt,
        singular: false,
      },
      // миллионах
      {
        ending: 'ах',
        c: RusCase.Loct,
        singular: false,
      },
    ]
  },
  {
    declensionZ: 'pqc', 
    endings:[
      // десят
      {
        ending: '',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // десяти
      {
        ending: 'и',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // десяти
      {
        ending: 'и',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // десят
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      // десят
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // десятью
      {
        ending: 'ью',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // десяти
      {
        ending: 'и',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // десят
      {
        ending: '',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // десяти
      {
        ending: 'и',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // десяти
      {
        ending: 'и',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // десят
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      // десят
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },
      // десятью
      {
        ending: 'ью',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // десяти
      {
        ending: 'и',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // десят
      {
        ending: '',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // десяти
      {
        ending: 'и',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // десяти
      {
        ending: 'и',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // десят
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      // десят
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // десятью
      {
        ending: 'ью',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // десяти
      {
        ending: 'и',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
    ]
  },
  {
    declensionZ: 'pqc1', 
    endings:[
      // сот
      {
        ending: '',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // сот
      {
        ending: '',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // стам
      {
        ending: 'ам',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // сот
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      // сот
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // стами
      {
        ending: 'ами',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // стах
      {
        ending: 'ах',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // сот
      {
        ending: '',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // сот
      {
        ending: '',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // стам
      {
        ending: 'ам',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // сот
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      // сот
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },
      // стами
      {
        ending: 'ами',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // стах
      {
        ending: 'ах',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // сот
      {
        ending: '',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // сот
      {
        ending: '',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // стам
      {
        ending: 'ам',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // сот
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      // сот
      {
        ending: '',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // стами
      {
        ending: 'ами',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // стах
      {
        ending: 'ах',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
    ]
  },
  {
    declensionZ: 'pqc2', 
    endings:[
      // сти
      {
        ending: 'и',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // сот
      {
        ending: '',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // стам
      {
        ending: 'ам',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // сти
      {
        ending: 'и',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      // сти
      {
        ending: 'и',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // стами
      {
        ending: 'ами',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // стах
      {
        ending: 'ах',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // сти
      {
        ending: 'и',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // сот
      {
        ending: '',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // стам
      {
        ending: 'ам',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // сти
      {
        ending: 'и',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      // сти
      {
        ending: 'и',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },
      // стами
      {
        ending: 'ами',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // стах
      {
        ending: 'ах',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // сти
      {
        ending: 'и',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // сот
      {
        ending: '',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // стам
      {
        ending: 'ам',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // сти
      {
        ending: 'и',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      // сти
      {
        ending: 'и',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // стами
      {
        ending: 'ами',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // стах
      {
        ending: 'ах',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
    ]
  },
  {
    declensionZ: 'pqc3', 
    endings:[
      // ста
      {
        ending: 'а',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // сот
      {
        ending: '',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // стам
      {
        ending: 'ам',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // стами
      {
        ending: 'ами',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // стах
      {
        ending: 'ах',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // сот
      {
        ending: '',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // стам
      {
        ending: 'ам',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },
      // стами
      {
        ending: 'ами',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // стах
      {
        ending: 'ах',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // сот
      {
        ending: '',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // стам
      {
        ending: 'ам',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      // ста
      {
        ending: 'а',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // стами
      {
        ending: 'ами',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // стах
      {
        ending: 'ах',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
    ]
  },
  {
    declensionZ: 'pqc4', 
    endings:[
      // две
      {
        ending: 'е',
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
      // две
      {
        ending: 'е',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      // две
      {
        ending: 'е',
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
      // двум
      {
        ending: 'ум',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // двух
      {
        ending: 'ух',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // две
      {
        ending: 'е',
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
      // две
      {
        ending: 'е',
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
      // две
      {
        ending: 'е',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      // две
      {
        ending: 'е',
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
  // первый (перв)
  {
    declensionZ: '1a',
    endings:
      [
      // перввый
      {
        ending: 'ый',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // первого
      {
        ending: 'ого',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // первому
      {
        ending: 'ому',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // первого
      {
        ending: 'ого',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      // первый
      {
        ending: 'ый',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // первым
      {
        ending: 'ым',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // первом
      {
        ending: 'ом',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // первая
      {
        ending: 'ая',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // первой
      {
        ending: 'ой',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // первой
      {
        ending: 'ой',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // первую
      {
        ending: 'ую',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      // первую
      {
        ending: 'ую',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },      
      // первой
      {
        ending: 'ой',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // первой
      {
        ending: 'ой',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // первое
      {
        ending: 'ое',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // первого
      {
        ending: 'ого',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // первому
      {
        ending: 'ому',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // первое
      {
        ending: 'ое',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      // первое
      {
        ending: 'ое',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // первым
      {
        ending: 'ым',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // первом
      {
        ending: 'ом',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
      // первые
      {
        ending: 'ые',
        c: RusCase.Nomn,
        singular: false,
      },
      // первых
      {
        ending: 'ых',
        c: RusCase.Gent,
        singular: false,
      },
      // первым
      {
        ending: 'ым',
        c: RusCase.Datv,
        singular: false,
      },
      // первых
      {
        ending: 'ых',
        c: RusCase.Accs,
        singular: false,
        animate: true,
      },
      // первые
      {
        ending: 'ые',
        c: RusCase.Accs,
        singular: false,
        animate: false,
      },
      // первыми
      {
        ending: 'ыми',
        c: RusCase.Ablt,
        singular: false,
      },
      // первых
      {
        ending: 'ых',
        c: RusCase.Loct,
        singular: false,
      },
      ]
  },
  // второй (втор)
  {
    declensionZ: '1b',
    endings:
      [
      // второй
      {
        ending: 'ой',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // второго
      {
        ending: 'ого',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // второму
      {
        ending: 'ому',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // второго
      {
        ending: 'ого',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      //второй
      {
        ending: 'ой',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // вторым
      {
        ending: 'ым',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // втором
      {
        ending: 'ом',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // вторая
      {
        ending: 'ая',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // второй
      {
        ending: 'ой',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // второй
      {
        ending: 'ой',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // вторую
      {
        ending: 'ую',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      // вторю
      {
        ending: 'ую',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },
      // второй
      {
        ending: 'ой',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // второй
      {
        ending: 'ой',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // второе
      {
        ending: 'ое',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // второго
      {
        ending: 'ого',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // второму
      {
        ending: 'ому',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // второе
      {
        ending: 'ое',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      // второе
      {
        ending: 'ое',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // вторым
      {
        ending: 'ым',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // втором
      {
        ending: 'ом',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
      // вторые
      {
        ending: 'ые',
        c: RusCase.Nomn,
        singular: false,
      },
      // вторых
      {
        ending: 'ых',
        c: RusCase.Gent,
        singular: false,
      },
      // вторым
      {
        ending: 'ым',
        c: RusCase.Datv,
        singular: false,
      },
      // вторых
      {
        ending: 'ых',
        c: RusCase.Accs,
        singular: false,
        animate: true,
      },
      // вторые
      {
        ending: 'ые',
        c: RusCase.Accs,
        singular: false,
        animate: false,
      },
      // вторыми
      {
        ending: 'ыми',
        c: RusCase.Ablt,
        singular: false,
      },
      // вторых
      {
        ending: 'ых',
        c: RusCase.Loct,
        singular: false,
      },
    ]
  },
  // третий (трет)
  {
    declensionZ: '6*a',
    endings:
      [
      // третий
      {
        ending: 'ий',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Masc,
      },
      // третьего
      {
        ending: 'ьего',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Masc,
      },
      // третьему
      {
        ending: 'ьему',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Masc,
      },
      // третего
      {
        ending: 'его',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: true,
      },
      // третий
      {
        ending: 'ий',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Masc,
        animate: false,
      },
      // третьим
      {
        ending: 'ьим',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Masc,
      },
      // третьем
      {
        ending: 'ьем',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Masc,
      },
      // третье
      {
        ending: 'ье',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Neut,
      },
      // третьего
      {
        ending: 'ьего',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Neut,
      },
      // третьему
      {
        ending: 'ьему',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Neut,
      },
      // третье
      {
        ending: 'ье',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: true,
      },
      // трет
      {
        ending: 'ье',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Neut,
        animate: false,
      },
      // третьим
      {
        ending: 'ьим',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Neut,
      },
      // третьем
      {
        ending: 'ьем',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Neut,
      },
      // третья
      {
        ending: 'ья',
        c: RusCase.Nomn,
        singular: true,
        gender: RusGender.Femn,
      },
      // третьей
      {
        ending: 'ьей',
        c: RusCase.Gent,
        singular: true,
        gender: RusGender.Femn,
      },
      // третьей
      {
        ending: 'ьей',
        c: RusCase.Datv,
        singular: true,
        gender: RusGender.Femn,
      },
      // третью
      {
        ending: 'ью',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: true,
      },
      // третью
      {
        ending: 'ью',
        c: RusCase.Accs,
        singular: true,
        gender: RusGender.Femn,
        animate: false,
      },
      // третьей
      {
        ending: 'ьей',
        c: RusCase.Ablt,
        singular: true,
        gender: RusGender.Femn,
      },
      // третом
      {
        ending: 'ом',
        c: RusCase.Loct,
        singular: true,
        gender: RusGender.Femn,
      },
      // третьи
      {
        ending: 'ьи',
        c: RusCase.Nomn,
        singular: false,
      },
      // третьих
      {
        ending: 'ьих',
        c: RusCase.Gent,
        singular: false,
      },
      // третьим
      {
        ending: 'ьим',
        c: RusCase.Datv,
        singular: false,
      },
      // третьих
      {
        ending: 'ьих',
        c: RusCase.Accs,
        singular: false,
        animate: true,
      },
      // третьи
      {
        ending: 'ьи',
        c: RusCase.Accs,
        singular: false,
        animate: false,
      },
      // третьими
      {
        ending: 'ьими',
        c: RusCase.Ablt,
        singular: false,
      },
      // третьих
      {
        ending: 'ьих',
        c: RusCase.Loct,
        singular: false,
      },
    ]
  },
];
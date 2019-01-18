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
];
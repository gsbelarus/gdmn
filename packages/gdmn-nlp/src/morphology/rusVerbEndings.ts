import { RusConjugationZEnding, RusAspect, Transitivity, RusGender, RusTense, RusMood, Involvement } from './types';

export const RusConjugationZEndings: RusConjugationZEnding[] =
[
  // делать (дела)
  {
    conjZ: '1a',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ть',
    endings: [
      // делаю
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // делаем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // делаешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // делаете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // делает
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // делают
      {
        ending: 'ют',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // делал
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // делала
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // делало
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // делали
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // делай
      {
        ending: 'й',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // делайте
      {
        ending: 'йте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // стачать (стача)
  {
    conjZ: '1aСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ть',
    endings: [
      // стачал
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // стачала
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // стачало
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // стачали
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // стачаю
      {
        ending: 'ю',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // стачаем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // стачаешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // стачаете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // стачает
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // стачают
      {
        ending: 'ют',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // стачаем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // стачаемте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // стачай
      {
        ending: 'й',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // стачайте
      {
        ending: 'йте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // делаться (дела)
  {
    conjZ: '1a-ся',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ть',
    endings: [
      // делаюсь
      {
        ending: 'юсь',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // делаемся
      {
        ending: 'емся',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // делаешься
      {
        ending: 'ешься',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // делаетесь
      {
        ending: 'етесь',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // делается
      {
        ending: 'ется',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // делаются
      {
        ending: 'ются',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // делался
      {
        ending: 'лся',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // делалась
      {
        ending: 'лась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // делалось
      {
        ending: 'лось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // делались
      {
        ending: 'лись',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // делайся
      {
        ending: 'йся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // делайтесь
      {
        ending: 'йтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // примелькаться (примелька)
  {
    conjZ: '1a-сяСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'ть',
    endings: [
      // примелькался
      {
        ending: 'лся',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // примелькалась
      {
        ending: 'лась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // примелькалось
      {
        ending: 'лось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // примелькались
      {
        ending: 'лись',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // примелькаюсь
      {
        ending: 'юсь',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // примелькаемся
      {
        ending: 'емся',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // примелькаешься
      {
        ending: 'ешься',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // примелькаетесь
      {
        ending: 'етесь',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // примелькается
      {
        ending: 'ется',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // примелькаются
      {
        ending: 'ются',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // примелькаемся
      {
        ending: 'емся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // примелькаемтесь
      {
        ending: 'емтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // примелькайся
      {
        ending: 'йся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // примелькайтесь
      {
        ending: 'йтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // продемонстрировать (продемонстрирова,продемонстриру)
  {
    conjZ: '2a',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ть',
    endings: [
      // продемонстрировал
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // продемонстрировала
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // продемонстрировало
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // продемонстрировали
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // продемонстрирую
      {
        ending: 'ю',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // продемонстрируем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // продемонстрируешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // продемонстрируете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // продемонстрирует
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // продемонстрируют
      {
        ending: 'ют',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // продемонстрируем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // продемонстрируемте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // продемонстрируй
      {
        ending: 'й',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // продемонстрируйте
      {
        ending: 'йте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // требовать (требова,требу)
  {
    conjZ: '2a',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ть',
    endings: [
      // требую
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // требуем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // требуешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // требуете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // требует
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // требуют
      {
        ending: 'ют',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // требовал
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // требовала
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // требовало
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // требовали
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // требуй
      {
        ending: 'й',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // требуйте
      {
        ending: 'йте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // отсутствовать
  {
    conjZ: '2a',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ть',
    endings: [
      // прису́тствую
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // прису́тствуем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // прису́тствуешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // прису́тствуете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // прису́тствует
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // прису́тствуют
      {
        ending: 'ют',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // прису́тствовал
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // прису́тствовала
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // прису́тствовало
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // прису́тствовали
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // прису́тствуй
      {
        ending: 'й',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // прису́тствуйте
      {
        ending: 'йте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // жевать (жев,жу)
  {
    conjZ: '2b',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ать',
    endings: [
      // жую
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // жуем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // жуешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // жуете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // жует
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // жуют
      {
        ending: 'ют',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // жевал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // жевала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // жевало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // жевали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // жуй
      {
        ending: 'й',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // жуйте
      {
        ending: 'йте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // придвинуть (придвин)
  {
    conjZ: '3a(2)СВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'уть',
    endings: [
      // придвинул
      {
        ending: 'ул',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // придвинула
      {
        ending: 'ула',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // придвинуло
      {
        ending: 'уло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // придвинули
      {
        ending: 'ули',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // придвину
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // придвинем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // придвинешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // придвинете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // придвинет
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // придвинут
      {
        ending: 'ут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // придвинем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // придвинемте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // придвинь
      {
        ending: 'ь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // придвиньте
      {
        ending: 'ьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // глянуть (глян)
  {
    conjZ: '3a-гСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'уть',
    endings: [
      // глянул
      {
        ending: 'ул',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // глянула
      {
        ending: 'ула',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // глянуло
      {
        ending: 'уло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // глянули
      {
        ending: 'ули',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // гляну
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // глянем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // глянешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // глянете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // глянет
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // глянут
      {
        ending: 'ут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // глянем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // глянемте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // глянь
      {
        ending: 'ь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // гляньте
      {
        ending: 'ьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // гнуть (гн)
  {
    conjZ: '3b',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'уть',
    endings: [
      // гну
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // гнем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // гнешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // гнете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // гнет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // гнут
      {
        ending: 'ут',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // гнул
      {
        ending: 'ул',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // гнула
      {
        ending: 'ула',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // гнуло
      {
        ending: 'уло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // гнули
      {
        ending: 'ули',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // гни
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // гните
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // улепетнуть (улепетн)
  {
    conjZ: '3bСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'уть',
    endings: [
      // улепетнул
      {
        ending: 'ул',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // улепетнула
      {
        ending: 'ула',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // улепетнуло
      {
        ending: 'уло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // улепетнули
      {
        ending: 'ули',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // улепетну
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // улепетнем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // улепетнешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // улепетнете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // улепетнет
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // улепетнут
      {
        ending: 'ут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // улепетнем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // улепетнемте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // улепетни
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // улепетните
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // отчеркнуть (отчеркн)
  {
    conjZ: '3b-еСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'уть',
    endings: [
      // отчеркнул
      {
        ending: 'ул',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // отчеркнула
      {
        ending: 'ула',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // отчеркнуло
      {
        ending: 'уло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // отчеркнули
      {
        ending: 'ули',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // отчеркну
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // отчеркнем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // отчеркнешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // отчеркнете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // отчеркнет
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // отчеркнут
      {
        ending: 'ут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // отчеркнем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // отчеркнемте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // отчеркни
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // отчеркните
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // нагнуться (нагн)
  {
    conjZ: '3b-сяСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'уть',
    endings: [
      // нагнулся
      {
        ending: 'улся',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // нагнулась
      {
        ending: 'улась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // нагнулось
      {
        ending: 'улось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // нагнулись
      {
        ending: 'улись',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // нагнусь
      {
        ending: 'усь',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // нагнемся
      {
        ending: 'емся',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // нагнешься
      {
        ending: 'ешься',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // нагнетесь
      {
        ending: 'етесь',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // нагнется
      {
        ending: 'ется',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // нагнутся
      {
        ending: 'утся',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // нагнемся
      {
        ending: 'емся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // нагнемтесь
      {
        ending: 'емтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // нагнись
      {
        ending: 'ись',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // нагнитесь
      {
        ending: 'итесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // тянуть (тяну,тян)
  {
    conjZ: '3c',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ть',
    endings: [
      // тяну
      {
        ending: '',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // тянем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // тянешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // тянете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // тянет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // тянут
      {
        ending: 'т',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // тянул
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // тянула
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // тянуло
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // тянули
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // тяни
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // тяните
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // стянуть (стян)
  {
    conjZ: '3cСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'уть',
    endings: [
      // стянул
      {
        ending: 'ул',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // стянула
      {
        ending: 'ула',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // стянуло
      {
        ending: 'уло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // стянули
      {
        ending: 'ули',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // стяну
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // стянем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // стянешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // стянете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // стянет
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // стянут
      {
        ending: 'ут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // стянем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // стянемте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // стяни
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // стяните
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // тянуться (тяну,тян)
  {
    conjZ: '3c-ся',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ть',
    endings: [
      // тянусь
      {
        ending: 'сь',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // тянемся
      {
        ending: 'емся',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // тянешься
      {
        ending: 'ешься',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // тянетесь
      {
        ending: 'етесь',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // тянется
      {
        ending: 'ется',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // тянутся
      {
        ending: 'тся',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // тянулся
      {
        ending: 'лся',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // тянулась
      {
        ending: 'лась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // тянулось
      {
        ending: 'лось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // тянулись
      {
        ending: 'лись',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // тянись
      {
        ending: 'ись',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // тянитесь
      {
        ending: 'итесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // киснуть (кис)
  {
    conjZ: '3°a',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'нуть',
    endings: [
      // кисну
      {
        ending: 'ну',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // киснем
      {
        ending: 'нем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // киснешь
      {
        ending: 'нешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // киснете
      {
        ending: 'нете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // киснет
      {
        ending: 'нет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // киснут
      {
        ending: 'нут',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // кис
      {
        ending: '',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // кисла
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // кисло
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // кисли
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // кисни
      {
        ending: 'ни',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // кисните
      {
        ending: 'ните',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // издохнуть (издох)
  {
    conjZ: '3°aСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'нуть',
    endings: [
      // издох
      {
        ending: '',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // издохла
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // издохло
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // издохли
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // издохну
      {
        ending: 'ну',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // издохнем
      {
        ending: 'нем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // издохнешь
      {
        ending: 'нешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // издохнете
      {
        ending: 'нете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // издохнет
      {
        ending: 'нет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // издохнут
      {
        ending: 'нут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // издохнем
      {
        ending: 'нем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // издохнемте
      {
        ending: 'немте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // издохни
      {
        ending: 'ни',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // издохните
      {
        ending: 'ните',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // стынуть (сты)
  {
    conjZ: '3°a((5)(6))-г',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'нуть',
    endings: [
      // стыну
      {
        ending: 'ну',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // стынем
      {
        ending: 'нем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // стынешь
      {
        ending: 'нешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // стынете
      {
        ending: 'нете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // стынет
      {
        ending: 'нет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // стынут
      {
        ending: 'нут',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // стыл
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // стыла
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // стыло
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // стыли
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // стынь
      {
        ending: 'нь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // стыньте
      {
        ending: 'ньте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // уничтожить (уничтож)
  {
    conjZ: '4a',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // уничтожил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // уничтожила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // уничтожило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // уничтожили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // уничтожу
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // уничтожим
      {
        ending: 'им',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // уничтожишь
      {
        ending: 'ишь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // уничтожите
      {
        ending: 'ите',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // уничтожит
      {
        ending: 'ит',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // уничтожат
      {
        ending: 'ат',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // уничтожим
      {
        ending: 'им',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // уничтожимте
      {
        ending: 'имте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // уничтожь
      {
        ending: 'ь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // уничтожьте
      {
        ending: 'ьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // строить (стро)
  {
    conjZ: '4a',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // строю
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // строим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // строишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // строите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // строит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // строят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // строил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // строила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // строило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // строили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // строй
      {
        ending: 'й',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // стройте
      {
        ending: 'йте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // грабить (граб)
  {
    conjZ: '4a-б',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // граблю
      {
        ending: 'лю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // грабим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // грабишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // грабите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // грабит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // грабят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // грабил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // грабила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // грабило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // грабили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // грабь
      {
        ending: 'ь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // грабьте
      {
        ending: 'ьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // молвить (молв)
  {
    conjZ: '4a-б-с',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // молвил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // молвила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // молвило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // молвили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // молвлю
      {
        ending: 'лю',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // молвим
      {
        ending: 'им',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // молвишь
      {
        ending: 'ишь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // молвите
      {
        ending: 'ите',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // молвит
      {
        ending: 'ит',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // молвят
      {
        ending: 'ят',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // молвим
      {
        ending: 'им',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // молвимте
      {
        ending: 'имте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // молви
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // молвите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // вылепить (вылеп)
  {
    conjZ: '4a-б-сСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // вылепил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // вылепила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // вылепило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // вылепили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // вылеплю
      {
        ending: 'лю',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // вылепим
      {
        ending: 'им',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // вылепишь
      {
        ending: 'ишь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // вылепите
      {
        ending: 'ите',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // вылепит
      {
        ending: 'ит',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // вылепят
      {
        ending: 'ят',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // вылепим
      {
        ending: 'им',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // вылепимте
      {
        ending: 'имте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // вылепи
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // вылепите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // балаболить (балабол)
  {
    conjZ: '4a-л',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ить',
    endings: [
      // балаболю
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // балаболим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // балаболишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // балаболите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // балаболит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // балаболят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // балаболил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // балаболила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // балаболило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // балаболили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // балаболь
      {
        ending: 'ь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // балабольте
      {
        ending: 'ьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // бахвалиться (бахвал)
  {
    conjZ: '4a-л-ся',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ить',
    endings: [
      // бахвалюсь
      {
        ending: 'юсь',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // бахвалимся
      {
        ending: 'имся',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // бахвалишься
      {
        ending: 'ишься',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // бахвалитесь
      {
        ending: 'итесь',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // бахвалится
      {
        ending: 'ится',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // бахвалятся
      {
        ending: 'ятся',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // бахвалился
      {
        ending: 'ился',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // бахвалилась
      {
        ending: 'илась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // бахвалилось
      {
        ending: 'илось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // бахвалились
      {
        ending: 'ились',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // бахвалься
      {
        ending: 'ься',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // бахвальтесь
      {
        ending: 'ьтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // смыслить (смысл)
  {
    conjZ: '4a-cc',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ить',
    endings: [
      // смыслю
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // смыслим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // смыслишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // смыслите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // смыслит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // смыслят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // смыслил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // смыслила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // смыслило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // смыслили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // смысли
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // смыслите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // вылепиться (вылеп)
  {
    conjZ: '4a-с-л-сяСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'ить',
    endings: [
      // вылепился
      {
        ending: 'ился',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // вылепилась
      {
        ending: 'илась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // вылепилось
      {
        ending: 'илось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // вылепились
      {
        ending: 'ились',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // вылеплюсь
      {
        ending: 'люсь',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // вылепимся
      {
        ending: 'имся',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // вылепишься
      {
        ending: 'ишься',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // вылепитесь
      {
        ending: 'итесь',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // вылепится
      {
        ending: 'ится',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // вылепятся
      {
        ending: 'ятся',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // вылепимся
      {
        ending: 'имся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // вылепимтесь
      {
        ending: 'имтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // вылепись
      {
        ending: 'ись',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // вылепитесь
      {
        ending: 'итесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // тратить (трат,трач)
  {
    conjZ: '4a-т',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // трачу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // тратим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // тратишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // тратите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // тратит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // тратят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // тратил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // тратила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // тратило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // тратили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // трать
      {
        ending: 'ь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // тратьте
      {
        ending: 'ьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // выразить (выраз,выраж)
  {
    conjZ: '4a-тСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // выразил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // выразила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // выразило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // выразили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // выражу
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // выразим
      {
        ending: 'им',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // выразишь
      {
        ending: 'ишь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // выразите
      {
        ending: 'ите',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // выразит
      {
        ending: 'ит',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // выразят
      {
        ending: 'ят',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // выразим
      {
        ending: 'им',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // выразимте
      {
        ending: 'имте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // вырази
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // выразите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // шкодить (шкод,шкож)
  {
    conjZ: '4a-тX',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ить',
    endings: [
      // шкожу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // шкодим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // шкодишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // шкодите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // шкодит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // шкодят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // шкодил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // шкодила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // шкодило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // шкодили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // шкодь
      {
        ending: 'ь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // шкодьте
      {
        ending: 'ьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // множить (множ)
  {
    conjZ: '4a-ш',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // множу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // множим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // множишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // множите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // множит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // множат
      {
        ending: 'ат',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // множил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // множила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // множило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // множили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // множь
      {
        ending: 'ь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // множьте
      {
        ending: 'ьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // брезжить (брезж)
  {
    conjZ: '4a-ш-с',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ить',
    endings: [
      // брезжу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // брезжим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // брезжишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // брезжите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // брезжит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // брезжат
      {
        ending: 'ат',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // брезжил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // брезжила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // брезжило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // брезжили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // брезжи
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // брезжите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // выкрасить (выкрас,выкраш)
  {
    conjZ: '4a((3))-тСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // выкрасил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // выкрасила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // выкрасило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // выкрасили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // выкрашу
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // выкрасим
      {
        ending: 'им',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // выкрасишь
      {
        ending: 'ишь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // выкрасите
      {
        ending: 'ите',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // выкрасит
      {
        ending: 'ит',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // выкрасят
      {
        ending: 'ят',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // выкрасим
      {
        ending: 'им',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // выкрасимте
      {
        ending: 'имте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // выкрась
      {
        ending: 'ь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // выкрасьте
      {
        ending: 'ьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // плющить (плющ)
  {
    conjZ: '4a((3))-ш',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // плющу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // плющим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // плющишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // плющите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // плющит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // плющат
      {
        ending: 'ат',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // плющил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // плющила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // плющило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // плющили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // плющи
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // плющите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // расплющить (расплющ)
  {
    conjZ: '4a((3))-шСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // расплющил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // расплющила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // расплющило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // расплющили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // расплющу
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // расплющим
      {
        ending: 'им',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // расплющишь
      {
        ending: 'ишь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // расплющите
      {
        ending: 'ите',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // расплющит
      {
        ending: 'ит',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // расплющат
      {
        ending: 'ат',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // расплющим
      {
        ending: 'им',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // расплющимте
      {
        ending: 'имте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // расплющи
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // расплющьте
      {
        ending: 'ьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // удалить (удал)
  {
    conjZ: '4b',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // удалил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // удалила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // удалило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // удалили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // удалю
      {
        ending: 'ю',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // удалим
      {
        ending: 'им',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // удалишь
      {
        ending: 'ишь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // удалите
      {
        ending: 'ите',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // удалит
      {
        ending: 'ит',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // удалят
      {
        ending: 'ят',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // удалим
      {
        ending: 'им',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // удалимте
      {
        ending: 'имте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // удали
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // удалите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // смолить (смол)
  {
    conjZ: '4b',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // смолю
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // смолим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // смолишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // смолите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // смолит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // смолят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // смолил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // смолила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // смолило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // смолили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // смоли
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // смолите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // крушить (круш)
  {
    conjZ: '4b-ш',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // крушу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // крушим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // крушишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // крушите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // крушит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // крушат
      {
        ending: 'ат',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // крушил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // крушила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // крушило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // крушили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // круши
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // крушите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // томить (том)
  {
    conjZ: '4b-б',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // томлю
      {
        ending: 'лю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // томим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // томишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // томите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // томит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // томят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // томил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // томила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // томило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // томили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // томи
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // томите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // щадить (щад,щаж)
  {
    conjZ: '4b-т',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // щажу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // щадим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // щадишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // щадите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // щадит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // щадят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // щадил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // щадила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // щадило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // щадили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // щади
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // щадите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // присоединиться (присоедин)
  {
    conjZ: '4b-сяСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'ить',
    endings: [
      // присоединился
      {
        ending: 'ился',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // присоединилась
      {
        ending: 'илась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // присоединилось
      {
        ending: 'илось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // присоединились
      {
        ending: 'ились',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // присоединюсь
      {
        ending: 'юсь',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // присоединимся
      {
        ending: 'имся',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // присоединишься
      {
        ending: 'ишься',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // присоединитесь
      {
        ending: 'итесь',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // присоединится
      {
        ending: 'ится',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // присоединятся
      {
        ending: 'ятся',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // присоединимся
      {
        ending: 'имся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // присоединимтесь
      {
        ending: 'имтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // присоединись
      {
        ending: 'ись',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // присоединитесь
      {
        ending: 'итесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // хоронить (хорон)
  {
    conjZ: '4c',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // хороню
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // хороним
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // хоронишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // хороните
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // хоронит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // хоронят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // хоронил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // хоронила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // хоронило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // хоронили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // хорони
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // хороните
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // валить (вал)
  {
    conjZ: '4c(4)',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // валю
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // валим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // валишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // валите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // валит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // валят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // валил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // валила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // валило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // валили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // вали
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // валите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // любить (люб)
  {
    conjZ: '4c(4)-б',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // люблю
      {
        ending: 'лю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // любим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // любишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // любите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // любит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // любят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // любил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // любила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // любило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // любили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // люби
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // любите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // точить (точ)
  {
    conjZ: '4c-ш',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // точу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // точим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // точишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // точите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // точит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // точат
      {
        ending: 'ат',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // точил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // точила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // точило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // точили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // точи
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // точите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // насторожиться (насторож)
  {
    conjZ: '4c-ш-сяСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'ить',
    endings: [
      // насторожился
      {
        ending: 'ился',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // насторожилась
      {
        ending: 'илась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // насторожилось
      {
        ending: 'илось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // насторожились
      {
        ending: 'ились',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // насторожусь
      {
        ending: 'усь',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // насторожимся
      {
        ending: 'имся',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // насторожишься
      {
        ending: 'ишься',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // насторожитесь
      {
        ending: 'итесь',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // насторожится
      {
        ending: 'ится',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // насторожатся
      {
        ending: 'атся',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // насторожимся
      {
        ending: 'имся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // насторожимтесь
      {
        ending: 'имтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // насторожись
      {
        ending: 'ись',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // насторожитесь
      {
        ending: 'итесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // ловить (лов)
  {
    conjZ: '4c-б',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // ловлю
      {
        ending: 'лю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // ловим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // ловишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // ловите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // ловит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // ловят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // ловил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // ловила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // ловило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // ловили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // лови
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // ловите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // уловить (улов)
  {
    conjZ: '4c-бСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // уловил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // уловила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // уловило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // уловили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // уловлю
      {
        ending: 'лю',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // уловим
      {
        ending: 'им',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // уловишь
      {
        ending: 'ишь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // уловите
      {
        ending: 'ите',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // уловит
      {
        ending: 'ит',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // уловят
      {
        ending: 'ят',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // уловим
      {
        ending: 'им',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // уловимте
      {
        ending: 'имте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // улови
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // уловите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // просить (прос,проc,прош)
  {
    conjZ: '4c-т',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // прошу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // просим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // просишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // просите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // просит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // просят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // просил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // просила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // просило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // просили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // проси
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // просите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // катиться (кат,кач)
  {
    conjZ: '4c-т-ся',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ить',
    endings: [
      // качусь
      {
        ending: 'усь',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // катимся
      {
        ending: 'имся',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // катишься
      {
        ending: 'ишься',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // катитесь
      {
        ending: 'итесь',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // катится
      {
        ending: 'ится',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // катятся
      {
        ending: 'ятся',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // катился
      {
        ending: 'ился',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // катилась
      {
        ending: 'илась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // катилось
      {
        ending: 'илось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // катились
      {
        ending: 'ились',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // катись
      {
        ending: 'ись',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // катитесь
      {
        ending: 'итесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // засветить (засвече,засвет,засвеч)
  {
    conjZ: '4c-тСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // засветил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // засветила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // засветило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // засветили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // засвечу
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // засветим
      {
        ending: 'им',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // засветишь
      {
        ending: 'ишь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // засветите
      {
        ending: 'ите',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // засветит
      {
        ending: 'ит',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // засветят
      {
        ending: 'ят',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // засветим
      {
        ending: 'им',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // засветимте
      {
        ending: 'имте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // засвети
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // засветите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // взмолиться (взмол)
  {
    conjZ: '4c-сяСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'ить',
    endings: [
      // взмолился
      {
        ending: 'ился',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // взмолилась
      {
        ending: 'илась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // взмолилось
      {
        ending: 'илось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // взмолились
      {
        ending: 'ились',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // взмолюсь
      {
        ending: 'юсь',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // взмолимся
      {
        ending: 'имся',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // взмолишься
      {
        ending: 'ишься',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // взмолитесь
      {
        ending: 'итесь',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // взмолится
      {
        ending: 'ится',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // взмолятся
      {
        ending: 'ятся',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // взмолимся
      {
        ending: 'имся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // взмолимтесь
      {
        ending: 'имтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // взмолись
      {
        ending: 'ись',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // взмолитесь
      {
        ending: 'итесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // видеться (вид,виж)
  {
    conjZ: '5a-д-ся',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'еть',
    endings: [
      // вижусь
      {
        ending: 'усь',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // видимся
      {
        ending: 'имся',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // видишься
      {
        ending: 'ишься',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // видитесь
      {
        ending: 'итесь',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // видится
      {
        ending: 'ится',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // видятся
      {
        ending: 'ятся',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // виделся
      {
        ending: 'елся',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // виделась
      {
        ending: 'елась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // виделось
      {
        ending: 'елось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // виделись
      {
        ending: 'елись',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // видься
      {
        ending: 'ься',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // видьтесь
      {
        ending: 'ьтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // видеть (вид,виж)
  {
    conjZ: '5a-т',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'еть',
    endings: [
      // вижу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // видим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // видишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // видите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // видит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // видят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // видел
      {
        ending: 'ел',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // видела
      {
        ending: 'ела',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // видело
      {
        ending: 'ело',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // видели
      {
        ending: 'ели',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // видь
      {
        ending: 'ь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // видьте
      {
        ending: 'ьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // слышать (слыш)
  {
    conjZ: '5a-ш',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ать',
    endings: [
      // слышу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // слышим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // слышишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // слышите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // слышит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // слышат
      {
        ending: 'ат',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // слышал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // слышала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // слышало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // слышали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // слышь
      {
        ending: 'ь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // слышьте
      {
        ending: 'ьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // стоять (сто)
  {
    conjZ: '5b',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ять',
    endings: [
      // стою
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // стоим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // стоишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // стоите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // стоит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // стоят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // стоял
      {
        ending: 'ял',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // стояла
      {
        ending: 'яла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // стояло
      {
        ending: 'яло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // стояли
      {
        ending: 'яли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // стой
      {
        ending: 'й',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // стойте
      {
        ending: 'йте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // кричать (крич)
  {
    conjZ: '5b-ш',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ать',
    endings: [
      // кричу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // кричим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // кричишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // кричите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // кричит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // кричат
      {
        ending: 'ат',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // кричал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // кричала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // кричало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // кричали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // кричи
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // кричите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // мчаться (мч)
  {
    conjZ: '5b-ш-ся',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ать',
    endings: [
      // мчусь
      {
        ending: 'усь',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // мчимся
      {
        ending: 'имся',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // мчишься
      {
        ending: 'ишься',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // мчитесь
      {
        ending: 'итесь',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // мчится
      {
        ending: 'ится',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // мчатся
      {
        ending: 'атся',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // мчался
      {
        ending: 'ался',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // мчалась
      {
        ending: 'алась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // мчалось
      {
        ending: 'алось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // мчались
      {
        ending: 'ались',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // мчись
      {
        ending: 'ись',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // мчитесь
      {
        ending: 'итесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // бежать (беж,бег)
  {
    conjZ: '5b-ж',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ать',
    endings: [
      // бегу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // бежим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // бежишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // бежите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // бежит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // бегут
      {
        ending: 'ут',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // бежал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // бежала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // бежало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // бежали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // бежим
      {
        ending: 'им',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // беги
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // бегите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // пыхтеть (пыхт,пыхч)
  {
    conjZ: '5b-т',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'еть',
    endings: [
      // пыхчу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // пыхтим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // пыхтишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // пыхтите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // пыхтит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // пыхтят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // пыхтел
      {
        ending: 'ел',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // пыхтела
      {
        ending: 'ела',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // пыхтело
      {
        ending: 'ело',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // пыхтели
      {
        ending: 'ели',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // пыхти
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // пыхтите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // глядеться (гляд,гляж)
  {
    conjZ: '5b-т-ся',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'еть',
    endings: [
      // гляжусь
      {
        ending: 'усь',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // глядимся
      {
        ending: 'имся',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // глядишься
      {
        ending: 'ишься',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // глядитесь
      {
        ending: 'итесь',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // глядится
      {
        ending: 'ится',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // глядятся
      {
        ending: 'ятся',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // гляделся
      {
        ending: 'елся',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // гляделась
      {
        ending: 'елась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // гляделось
      {
        ending: 'елось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // гляделись
      {
        ending: 'елись',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // глядись
      {
        ending: 'ись',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // глядитесь
      {
        ending: 'итесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // просвистеть (просвист,просвищ)
  {
    conjZ: '5b-тСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'еть',
    endings: [
      // просвистел
      {
        ending: 'ел',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // просвистела
      {
        ending: 'ела',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // просвистело
      {
        ending: 'ело',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // просвистели
      {
        ending: 'ели',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // просвищу
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // просвистим
      {
        ending: 'им',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // просвистишь
      {
        ending: 'ишь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // просвистите
      {
        ending: 'ите',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // просвистит
      {
        ending: 'ит',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // просвистят
      {
        ending: 'ят',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // просвисти
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // просвистите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // вглядеться (вгляд,вгляж)
  {
    conjZ: '5b-т-сяСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'еть',
    endings: [
      // вгляделся
      {
        ending: 'елся',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // вгляделась
      {
        ending: 'елась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // вгляделось
      {
        ending: 'елось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // вгляделись
      {
        ending: 'елись',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // вгляжусь
      {
        ending: 'усь',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // вглядимся
      {
        ending: 'имся',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // вглядишься
      {
        ending: 'ишься',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // вглядитесь
      {
        ending: 'итесь',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // вглядится
      {
        ending: 'ится',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // вглядятся
      {
        ending: 'ятся',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // вглядимся
      {
        ending: 'имся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // вглядимтесь
      {
        ending: 'имтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // вглядись
      {
        ending: 'ись',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // вглядитесь
      {
        ending: 'итесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // бояться (бо)
  {
    conjZ: '5b-ся',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ять',
    endings: [
      // боюсь
      {
        ending: 'юсь',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // боимся
      {
        ending: 'имся',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // боишься
      {
        ending: 'ишься',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // боитесь
      {
        ending: 'итесь',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // боится
      {
        ending: 'ится',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // боятся
      {
        ending: 'ятся',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // боялся
      {
        ending: 'ялся',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // боялась
      {
        ending: 'ялась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // боялось
      {
        ending: 'ялось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // боялись
      {
        ending: 'ялись',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // бойся
      {
        ending: 'йся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // бойтесь
      {
        ending: 'йтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // спать (спл,сп)
  {
    conjZ: '5b/c',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ать',
    endings: [
      // сплю
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // спим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // спишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // спите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // спит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // спят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // спал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // спала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // спало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // спали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // спи
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // спите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // спаться (сп)
  {
    conjZ: '5b/c"-ся',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ать',
    endings: [
      // спалось
      {
        ending: 'алось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // спится
      {
        ending: 'ится',
        tense: RusTense.Pres,
        singular: true,
        mood: RusMood.Indc
      },
    ]
  },
  // держать (держ)
  {
    conjZ: '5c',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ать',
    endings: [
      // держу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // держим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // держишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // держите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // держит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // держат
      {
        ending: 'ат',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // держал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // держала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // держало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // держали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // держи
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // держите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // смотреть (смотр)
  {
    conjZ: '5c-е',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'еть',
    endings: [
      // смотрю
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // смотрим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // смотришь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // смотрите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // смотрит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // смотрят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // смотрел
      {
        ending: 'ел',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // смотрела
      {
        ending: 'ела',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // смотрело
      {
        ending: 'ело',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // смотрели
      {
        ending: 'ели',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // смотри
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // смотрите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // вертеть (верт,верч)
  {
    conjZ: '5c-т',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'еть',
    endings: [
      // верчу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // вертим
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // вертишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // вертите
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // вертит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // вертят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // вертел
      {
        ending: 'ел',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // вертела
      {
        ending: 'ела',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // вертело
      {
        ending: 'ело',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // вертели
      {
        ending: 'ели',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // верти
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // вертите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // гнать (гон,гн)
  {
    conjZ: '5c/c',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ать',
    endings: [
      // гоню
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // гоним
      {
        ending: 'им',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // гонишь
      {
        ending: 'ишь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // гоните
      {
        ending: 'ите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // гонит
      {
        ending: 'ит',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // гонят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // гнал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // гнала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // гнало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // гнали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // гони
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // гоните
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // сеять (се)
  {
    conjZ: '6a',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ять',
    endings: [
      // сею
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // сеем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // сеешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // сеете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // сеет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // сеют
      {
        ending: 'ют',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // сеял
      {
        ending: 'ял',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // сеяла
      {
        ending: 'яла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // сеяло
      {
        ending: 'яло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // сеяли
      {
        ending: 'яли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // сей
      {
        ending: 'й',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // сейте
      {
        ending: 'йте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // глаголать (глагол)
  {
    conjZ: '6a-н',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ать',
    endings: [
      // глаголю
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // глаголем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // глаголешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // глаголете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // глаголет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // глаголют
      {
        ending: 'ют',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // глаголал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // глаголала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // глаголало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // глаголали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // глаголь
      {
        ending: 'ь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // глагольте
      {
        ending: 'ьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // колебать (колеб)
  {
    conjZ: '6a-б',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ать',
    endings: [
      // колеблю
      {
        ending: 'лю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // колеблем
      {
        ending: 'лем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // колеблешь
      {
        ending: 'лешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // колеблете
      {
        ending: 'лете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // колеблет
      {
        ending: 'лет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // колеблют
      {
        ending: 'лют',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // колебал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // колебала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // колебало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // колебали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // колебли
      {
        ending: 'ли',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // колеблите
      {
        ending: 'лите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // сыпать (сып)
  {
    conjZ: '6a^',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ать',
    endings: [
      // сыплю
      {
        ending: 'лю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // сыпем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // сыпешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // сыпете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // сыпет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // сыпят
      {
        ending: 'ят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // сыпал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // сыпала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // сыпало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // сыпали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // сыпь
      {
        ending: 'ь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // сыпьте
      {
        ending: 'ьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // прятать (прят,пряч)
  {
    conjZ: '6a-т',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ать',
    endings: [
      // прячу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // прячем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // прячешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // прячете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // прячет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // прячут
      {
        ending: 'ут',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // прятал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // прятала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // прятало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // прятали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // прячь
      {
        ending: 'ь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // прячьте
      {
        ending: 'ьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // высказать (высказ,выскаж)
  {
    conjZ: '6a-т-иСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ать',
    endings: [
      // высказал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // высказала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // высказало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // высказали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // выскажу
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // выскажем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // выскажешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // выскажете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // выскажет
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // выскажут
      {
        ending: 'ут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // выскажем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // выскажемте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // выскажи
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // выскажите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // вопиять (вопи)
  {
    conjZ: '6b',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ять',
    endings: [
      // вопию
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // вопием
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // вопиешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // вопиете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // вопиет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // вопиют
      {
        ending: 'ют',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // вопиял
      {
        ending: 'ял',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // вопияла
      {
        ending: 'яла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // вопияло
      {
        ending: 'яло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // вопияли
      {
        ending: 'яли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
    ]
  },
  // смеяться (сме)
  {
    conjZ: '6b-ся',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ять',
    endings: [
      // смеюсь
      {
        ending: 'юсь',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // смеемся
      {
        ending: 'емся',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // смеешься
      {
        ending: 'ешься',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // смеетесь
      {
        ending: 'етесь',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // смеется
      {
        ending: 'ется',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // смеются
      {
        ending: 'ются',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // смеялся
      {
        ending: 'ялся',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // смеялась
      {
        ending: 'ялась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // смеялось
      {
        ending: 'ялось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // смеялись
      {
        ending: 'ялись',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // смейся
      {
        ending: 'йся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // смейтесь
      {
        ending: 'йтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // ржать (рж)
  {
    conjZ: '6b-ш',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ать',
    endings: [
      // ржу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // ржем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // ржешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // ржете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // ржет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // ржут
      {
        ending: 'ут',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // ржал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // ржала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // ржало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // ржали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // ржи
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // ржите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // слать (сл,шл)
  {
    conjZ: '6b^',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ать',
    endings: [
      // шлю
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // шлем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // шлешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // шлете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // шлет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // шлют
      {
        ending: 'ют',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // слал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // слала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // слало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // слали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // шли
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // шлите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // сосать (сос)
  {
    conjZ: '6°b',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ать',
    endings: [
      // сосу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // сосем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // сосешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // сосете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // сосет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // сосут
      {
        ending: 'ут',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // сосал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // сосала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // сосало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // сосали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // соси
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // сосите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // казать (каз,каж)
  {
    conjZ: '6c',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ать',
    endings: [
      // кажу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // кажем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // кажешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // кажете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // кажет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // кажут
      {
        ending: 'ут',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // казал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // казала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // казало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // казали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // кажи
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // кажите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // показать (показ,покаж)
  {
    conjZ: '6c',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ать',
    endings: [
      // показал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // показала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // показало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // показали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // покажу
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // покажем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // покажешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // покажете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // покажет
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // покажут
      {
        ending: 'ут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // покажем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // покажемте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // покажи
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // покажите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // оказать (оказ,окаж)
  {
    conjZ: '6cСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ать',
    endings: [
      // оказал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // оказала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // оказало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // оказали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // окажу
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // окажем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // окажешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // окажете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // окажет
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // окажут
      {
        ending: 'ут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // окажем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // окажемте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // окажи
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // окажите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // сказаться (сказ,скаж)
  {
    conjZ: '6c-сяСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'ать',
    endings: [
      // сказался
      {
        ending: 'ался',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // сказалась
      {
        ending: 'алась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // сказалось
      {
        ending: 'алось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // сказались
      {
        ending: 'ались',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // скажусь
      {
        ending: 'усь',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // скажемся
      {
        ending: 'емся',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // скажешься
      {
        ending: 'ешься',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // скажетесь
      {
        ending: 'етесь',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // скажется
      {
        ending: 'ется',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // скажутся
      {
        ending: 'утся',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // скажемся
      {
        ending: 'емся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // скажемтесь
      {
        ending: 'емтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // скажись
      {
        ending: 'ись',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // скажитесь
      {
        ending: 'итесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // лепетать (лепет,лепеч)
  {
    conjZ: '6cX',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ать',
    endings: [
      // лепечу
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // лепечем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // лепечешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // лепечете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // лепечет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // лепечут
      {
        ending: 'ут',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // лепетал
      {
        ending: 'ал',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // лепетала
      {
        ending: 'ала',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // лепетало
      {
        ending: 'ало',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // лепетали
      {
        ending: 'али',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // лепечи
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // лепечите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // вывести (выве)
  {
    conjZ: '7a(9)-дСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'сти',
    endings: [
      // вывел
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // вывела
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // вывело
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // вывели
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // выведу
      {
        ending: 'ду',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // выведем
      {
        ending: 'дем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // выведешь
      {
        ending: 'дешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // выведете
      {
        ending: 'дете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // выведет
      {
        ending: 'дет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // выведут
      {
        ending: 'дут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // выведем
      {
        ending: 'дем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // выведемте
      {
        ending: 'демте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // выведи
      {
        ending: 'ди',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // выведите
      {
        ending: 'дите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // вытереть (вытер,вытр)
  {
    conjZ: '9aСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'еть',
    endings: [
      // вытер
      {
        ending: '',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // вытерла
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // вытерло
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // вытерли
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // вытру
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // вытрем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // вытрешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // вытрете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // вытрет
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // вытрут
      {
        ending: 'ут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // вытрем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // вытремте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // вытри
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // вытрите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // тереть (тер,тр)
  {
    conjZ: '9b',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'еть',
    endings: [
      // тру
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // трем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // трешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // трете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // трет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // трут
      {
        ending: 'ут',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // тер
      {
        ending: '',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // терла
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // терло
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // терли
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // три
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // трите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // натереть (натер,натр)
  {
    conjZ: '9bСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'еть',
    endings: [
      // натер
      {
        ending: '',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // натерла
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // натерло
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // натерли
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // натру
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // натрем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // натрешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // натрете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // натрет
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // натрут
      {
        ending: 'ут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // натрем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // натремте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // натри
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // натрите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // тереться (тер,тр)
  {
    conjZ: '9b-ся',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'еть',
    endings: [
      // трусь
      {
        ending: 'усь',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // тремся
      {
        ending: 'емся',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // трешься
      {
        ending: 'ешься',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // третесь
      {
        ending: 'етесь',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // трется
      {
        ending: 'ется',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // трутся
      {
        ending: 'утся',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // терся
      {
        ending: 'ся',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // терлась
      {
        ending: 'лась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // терлось
      {
        ending: 'лось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // терлись
      {
        ending: 'лись',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // трись
      {
        ending: 'ись',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // тритесь
      {
        ending: 'итесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // стереть (стер,сотр)
  {
    conjZ: '9*bСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'еть',
    endings: [
      // стер
      {
        ending: '',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // стерла
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // стерло
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // стерли
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // сотру
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // сотрем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // сотрешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // сотрете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // сотрет
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // сотрут
      {
        ending: 'ут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // сотрем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // сотремте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // сотри
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // сотрите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // колоть (кол)
  {
    conjZ: '10c',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'оть',
    endings: [
      // колю
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // колем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // колешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // колете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // колет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // колют
      {
        ending: 'ют',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // колол
      {
        ending: 'ол',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // колола
      {
        ending: 'ола',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // кололо
      {
        ending: 'оло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // кололи
      {
        ending: 'оли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // коли
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // колите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // бороться (бор)
  {
    conjZ: '10c-ся',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'оть',
    endings: [
      // борюсь
      {
        ending: 'юсь',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // боремся
      {
        ending: 'емся',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // борешься
      {
        ending: 'ешься',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // боретесь
      {
        ending: 'етесь',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // борется
      {
        ending: 'ется',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // борются
      {
        ending: 'ются',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // боролся
      {
        ending: 'олся',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // боролась
      {
        ending: 'олась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // боролось
      {
        ending: 'олось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // боролись
      {
        ending: 'олись',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // борись
      {
        ending: 'ись',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // боритесь
      {
        ending: 'итесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // шить (ш)
  {
    conjZ: '11b',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // шью
      {
        ending: 'ью',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // шьем
      {
        ending: 'ьем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // шьешь
      {
        ending: 'ьешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // шьете
      {
        ending: 'ьете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // шьет
      {
        ending: 'ьет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // шьют
      {
        ending: 'ьют',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // шил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // шила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // шило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // шили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // шей
      {
        ending: 'ей',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // шейте
      {
        ending: 'ейте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // забить (заб)
  {
    conjZ: '11bСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ить',
    endings: [
      // забил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // забила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // забило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // забили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // забью
      {
        ending: 'ью',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // забьем
      {
        ending: 'ьем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // забьешь
      {
        ending: 'ьешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // забьете
      {
        ending: 'ьете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // забьет
      {
        ending: 'ьет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // забьют
      {
        ending: 'ьют',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // забьем
      {
        ending: 'ьем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // забьемте
      {
        ending: 'ьемте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // забей
      {
        ending: 'ей',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // забейте
      {
        ending: 'ейте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // спиться (соп,сп)
  {
    conjZ: '11*b/c"-сяСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'ить',
    endings: [
      // спился
      {
        ending: 'ился',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // спилась
      {
        ending: 'илась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // спилось
      {
        ending: 'илось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // спились
      {
        ending: 'ились',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // сопьюсь
      {
        ending: 'ьюсь',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // сопьемся
      {
        ending: 'ьемся',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // сопьешься
      {
        ending: 'ьешься',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // сопьетесь
      {
        ending: 'ьетесь',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // сопьется
      {
        ending: 'ьется',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // сопьются
      {
        ending: 'ьются',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // сопьемся
      {
        ending: 'ьемся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // сопьемтесь
      {
        ending: 'ьемтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // спейся
      {
        ending: 'ейся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // спейтесь
      {
        ending: 'ейтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // рыть (ры,ро)
  {
    conjZ: '12a',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ть',
    endings: [
      // рою
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // роем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // роешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // роете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // роет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // роют
      {
        ending: 'ют',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // рыл
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // рыла
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // рыло
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // рыли
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // рой
      {
        ending: 'й',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // ройте
      {
        ending: 'йте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // выть (вы,во)
  {
    conjZ: '12a-ы',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ть',
    endings: [
      // вою
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // воем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // воешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // воете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // воет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // воют
      {
        ending: 'ют',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // выл
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // выла
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // выло
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // выли
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // вой
      {
        ending: 'й',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // войте
      {
        ending: 'йте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // петь (п)
  {
    conjZ: '12b',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'еть',
    endings: [
      // пою
      {
        ending: 'ою',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // поем
      {
        ending: 'оем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // поешь
      {
        ending: 'оешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // поете
      {
        ending: 'оете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // поет
      {
        ending: 'оет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // поют
      {
        ending: 'оют',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // пел
      {
        ending: 'ел',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // пела
      {
        ending: 'ела',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // пело
      {
        ending: 'ело',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // пели
      {
        ending: 'ели',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // пой
      {
        ending: 'ой',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // пойте
      {
        ending: 'ойте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // спеть (сп)
  {
    conjZ: '12bСВ',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'еть',
    endings: [
      // спею
      {
        ending: 'ею',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // спеем
      {
        ending: 'еем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // спеешь
      {
        ending: 'еешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // спеете
      {
        ending: 'еете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // спеет
      {
        ending: 'еет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // спеют
      {
        ending: 'еют',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // спел
      {
        ending: 'ел',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // спела
      {
        ending: 'ела',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // спело
      {
        ending: 'ело',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // спели
      {
        ending: 'ели',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // спей
      {
        ending: 'ей',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // спейте
      {
        ending: 'ейте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // гнить (гн)
  {
    conjZ: '12b/c',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ить',
    endings: [
      // гнию
      {
        ending: 'ию',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // гнием
      {
        ending: 'ием',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // гниешь
      {
        ending: 'иешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // гниете
      {
        ending: 'иете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // гниет
      {
        ending: 'иет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // гниют
      {
        ending: 'иют',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // гнил
      {
        ending: 'ил',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // гнила
      {
        ending: 'ила',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // гнило
      {
        ending: 'ило',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // гнили
      {
        ending: 'или',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
    ]
  },
  // выдавать (выдава,выда)
  {
    conjZ: '13b',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ть',
    endings: [
      // выдаю
      {
        ending: 'ю',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // выдаем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // выдаешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // выдаете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // выдает
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // выдают
      {
        ending: 'ют',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // выдавал
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // выдавала
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // выдавало
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // выдавали
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // выдавай
      {
        ending: 'й',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // выдавайте
      {
        ending: 'йте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // сдаваться (сдава,сда)
  {
    conjZ: '13b-ся',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ть',
    endings: [
      // сдаюсь
      {
        ending: 'юсь',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // сдаемся
      {
        ending: 'емся',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // сдаешься
      {
        ending: 'ешься',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // сдаетесь
      {
        ending: 'етесь',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // сдается
      {
        ending: 'ется',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // сдаются
      {
        ending: 'ются',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // сдавался
      {
        ending: 'лся',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // сдавалась
      {
        ending: 'лась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // сдавалось
      {
        ending: 'лось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // сдавались
      {
        ending: 'лись',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // сдавайся
      {
        ending: 'йся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // сдавайтесь
      {
        ending: 'йтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // мять (мя,мн)
  {
    conjZ: '14b',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'ть',
    endings: [
      // мну
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // мнем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // мнешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // мнете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // мнет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // мнут
      {
        ending: 'ут',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // мял
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // мяла
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // мяло
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // мяли
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // мни
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // мните
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // мяться (мя,мн)
  {
    conjZ: '14b-ся',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ть',
    endings: [
      // мнусь
      {
        ending: 'усь',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // мнемся
      {
        ending: 'емся',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // мнешься
      {
        ending: 'ешься',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // мнетесь
      {
        ending: 'етесь',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // мнется
      {
        ending: 'ется',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // мнутся
      {
        ending: 'утся',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // мялся
      {
        ending: 'лся',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // мялась
      {
        ending: 'лась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // мялось
      {
        ending: 'лось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // мялись
      {
        ending: 'лись',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // мнись
      {
        ending: 'ись',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // мнитесь
      {
        ending: 'итесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // помять (помя,помн)
  {
    conjZ: '14bСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ть',
    endings: [
      // помял
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // помяла
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // помяло
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // помяли
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // помну
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // помнем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // помнешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // помнете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // помнет
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // помнут
      {
        ending: 'ут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // помнем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // помнемте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // помни
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // помните
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // помяться (помя,помн)
  {
    conjZ: '14b-сяСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'ть',
    endings: [
      // помялся
      {
        ending: 'лся',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // помялась
      {
        ending: 'лась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // помялось
      {
        ending: 'лось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // помялись
      {
        ending: 'лись',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // помнусь
      {
        ending: 'усь',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // помнемся
      {
        ending: 'емся',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // помнешься
      {
        ending: 'ешься',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // помнетесь
      {
        ending: 'етесь',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // помнется
      {
        ending: 'ется',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // помнутся
      {
        ending: 'утся',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // помнемся
      {
        ending: 'емся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // помнемтесь
      {
        ending: 'емтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // помнись
      {
        ending: 'ись',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // помнитесь
      {
        ending: 'итесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // сжать (сожм,сжа)
  {
    conjZ: '14*bСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ть',
    endings: [
      // сжал
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // сжала
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // сжало
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // сжали
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // сожму
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // сожмем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // сожмешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // сожмете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // сожмет
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // сожмут
      {
        ending: 'ут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // сожмем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // сожмемте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // сожми
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // сожмите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // сжаться (сожм,сжа)
  {
    conjZ: '14*b-сяСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'ть',
    endings: [
      // сжался
      {
        ending: 'лся',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // сжалась
      {
        ending: 'лась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // сжалось
      {
        ending: 'лось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // сжались
      {
        ending: 'лись',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // сожмусь
      {
        ending: 'усь',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // сожмемся
      {
        ending: 'емся',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // сожмешься
      {
        ending: 'ешься',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // сожметесь
      {
        ending: 'етесь',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // сожмется
      {
        ending: 'ется',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // сожмутся
      {
        ending: 'утся',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // сожмемся
      {
        ending: 'емся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // сожмемтесь
      {
        ending: 'емтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // сожмись
      {
        ending: 'ись',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // сожмитесь
      {
        ending: 'итесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // донять (дон,дой)
  {
    conjZ: '14b/cСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ять',
    endings: [
      // донял
      {
        ending: 'ял',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // доняла
      {
        ending: 'яла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // доняло
      {
        ending: 'яло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // доняли
      {
        ending: 'яли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // дойму
      {
        ending: 'му',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // доймем
      {
        ending: 'мем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // доймешь
      {
        ending: 'мешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // доймете
      {
        ending: 'мете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // доймет
      {
        ending: 'мет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // доймут
      {
        ending: 'мут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // доймем
      {
        ending: 'мем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // доймемте
      {
        ending: 'мемте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // дойми
      {
        ending: 'ми',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // доймите
      {
        ending: 'мите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // снять (сним,сня,сн)
  {
    conjZ: '14cСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ть',
    endings: [
      // снял
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // сняла
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // сняло
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // сняли
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // сниму
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // снимем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // снимешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // снимете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // снимет
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // снимут
      {
        ending: 'ут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // снимем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // снимемте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // сними
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // снимите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // принять (приня,прин,прим)
  {
    conjZ: '14c(1)СВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ть',
    endings: [
      // принял
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // приняла
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // приняло
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // приняли
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // приму
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // примем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // примешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // примете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // примет
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // примут
      {
        ending: 'ут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // примем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // примемте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // прими
      {
        ending: 'и',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // примите
      {
        ending: 'ите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // одеть (оде)
  {
    conjZ: '15aСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ть',
    endings: [
      // одел
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // одела
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // одело
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // одели
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // одену
      {
        ending: 'ну',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // оденем
      {
        ending: 'нем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // оденешь
      {
        ending: 'нешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // оденете
      {
        ending: 'нете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // оденет
      {
        ending: 'нет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // оденут
      {
        ending: 'нут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // оденем
      {
        ending: 'нем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // оденемте
      {
        ending: 'немте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // одень
      {
        ending: 'нь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // оденьте
      {
        ending: 'ньте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // одеться (оде)
  {
    conjZ: '15a-сяСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'ть',
    endings: [
      // оделся
      {
        ending: 'лся',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // оделась
      {
        ending: 'лась',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // оделось
      {
        ending: 'лось',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // оделись
      {
        ending: 'лись',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // оденусь
      {
        ending: 'нусь',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // оденемся
      {
        ending: 'немся',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // оденешься
      {
        ending: 'нешься',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // оденетесь
      {
        ending: 'нетесь',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // оденется
      {
        ending: 'нется',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // оденутся
      {
        ending: 'нутся',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // оденемся
      {
        ending: 'немся',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // оденемтесь
      {
        ending: 'немтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // оденься
      {
        ending: 'нься',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // оденьтесь
      {
        ending: 'ньтесь',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // жить (жи)
  {
    conjZ: '16b/c',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ть',
    endings: [
      // живу
      {
        ending: 'ву',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // живем
      {
        ending: 'вем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // живешь
      {
        ending: 'вешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // живете
      {
        ending: 'вете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // живет
      {
        ending: 'вет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // живут
      {
        ending: 'вут',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // жил
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // жила
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // жило
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // жили
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // живи
      {
        ending: 'ви',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // живите
      {
        ending: 'вите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // выбыть (выбуд,выбы)
  {
    conjZ: '^a-бытьСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'ть',
    endings: [
      // выбыл
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // выбыла
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // выбыло
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // выбыли
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // выбуду
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // выбудем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // выбудешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // выбудете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // выбудет
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // выбудут
      {
        ending: 'ут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // выбудем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // выбудемте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // выбудь
      {
        ending: 'ь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // выбудьте
      {
        ending: 'ьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // ехать (езжай,еха,ед)
  {
    conjZ: '^a-ех',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ть',
    endings: [
      // еду
      {
        ending: 'у',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // едем
      {
        ending: 'ем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // едешь
      {
        ending: 'ешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // едете
      {
        ending: 'ете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // едет
      {
        ending: 'ет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // едут
      {
        ending: 'ут',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // ехал
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // ехала
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // ехало
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // ехали
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // едем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // едемте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // езжай
      {
        ending: '',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // езжайте
      {
        ending: 'те',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // поехать (поезжай,поеха,поед)
  {
    conjZ: '^a-ехСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'ть',
    endings: [
      // поехал
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // поехала
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // поехало
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // поехали
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // поеду
      {
        ending: 'у',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // поедем
      {
        ending: 'ем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // поедешь
      {
        ending: 'ешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // поедете
      {
        ending: 'ете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // поедет
      {
        ending: 'ет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // поедут
      {
        ending: 'ут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // поедем
      {
        ending: 'ем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // поедемте
      {
        ending: 'емте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // поезжай
      {
        ending: '',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // поезжайте
      {
        ending: 'те',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // есть (е)
  {
    conjZ: '^b',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    suffix: 'сть',
    endings: [
      // ем
      {
        ending: 'м',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // едим
      {
        ending: 'дим',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // ешь
      {
        ending: 'шь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // едите
      {
        ending: 'дите',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // ест
      {
        ending: 'ст',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // едят
      {
        ending: 'дят',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // ел
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // ела
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // ело
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // ели
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // ешь
      {
        ending: 'шь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // ешьте
      {
        ending: 'шьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // идти (и,ш)
  {
    conjZ: '^b/b(9)',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'дти',
    endings: [
      // иду
      {
        ending: 'ду',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // идем
      {
        ending: 'дем',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // идешь
      {
        ending: 'дешь',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // идете
      {
        ending: 'дете',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // идет
      {
        ending: 'дет',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // идут
      {
        ending: 'дут',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // шел
      {
        ending: 'ел',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // шла
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // шло
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // шли
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // идем
      {
        ending: 'дем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // идемте
      {
        ending: 'демте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // иди
      {
        ending: 'ди',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // идите
      {
        ending: 'дите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // пойти (пой,пош)
  {
    conjZ: '^b/b(9)СВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    suffix: 'ти',
    endings: [
      // пошел
      {
        ending: 'ел',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // пошла
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // пошло
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // пошли
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // пойду
      {
        ending: 'ду',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // пойдем
      {
        ending: 'дем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // пойдешь
      {
        ending: 'дешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // пойдете
      {
        ending: 'дете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // пойдет
      {
        ending: 'дет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // пойдут
      {
        ending: 'дут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // пойдем
      {
        ending: 'дем',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // пойдемте
      {
        ending: 'демте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // пойди
      {
        ending: 'ди',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // пойдите
      {
        ending: 'дите',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // дать (да)
  {
    conjZ: '^b/cСВ',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    suffix: 'ть',
    endings: [
      // дал
      {
        ending: 'л',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // дала
      {
        ending: 'ла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // дало
      {
        ending: 'ло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // дали
      {
        ending: 'ли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // дам
      {
        ending: 'м',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // дадим
      {
        ending: 'дим',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // дашь
      {
        ending: 'шь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // дадите
      {
        ending: 'дите',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // даст
      {
        ending: 'ст',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // дадут
      {
        ending: 'дут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // дадим
      {
        ending: 'дим',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // дадимте
      {
        ending: 'димте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Incl
      },
      // дай
      {
        ending: 'й',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // дайте
      {
        ending: 'йте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
  // быть (б)
  {
    conjZ: 'Δa/c',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    suffix: 'ыть',
    endings: [
      // есть
      {
        ending: '',
        tense: RusTense.Pres,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // есть
      {
        ending: '',
        tense: RusTense.Pres,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // есть
      {
        ending: '',
        tense: RusTense.Pres,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // есть
      {
        ending: '',
        tense: RusTense.Pres,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // есть
      {
        ending: '',
        tense: RusTense.Pres,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // есть
      {
        ending: '',
        tense: RusTense.Pres,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // был
      {
        ending: 'ыл',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Masc,
        mood: RusMood.Indc
      },
      // была
      {
        ending: 'ыла',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Femn,
        mood: RusMood.Indc
      },
      // было
      {
        ending: 'ыло',
        tense: RusTense.Past,
        singular: true,
        gender: RusGender.Neut,
        mood: RusMood.Indc
      },
      // были
      {
        ending: 'ыли',
        tense: RusTense.Past,
        singular: false,
        mood: RusMood.Indc
      },
      // буду
      {
        ending: 'уду',
        tense: RusTense.Futr,
        singular: true,
        person: 1,
        mood: RusMood.Indc
      },
      // будем
      {
        ending: 'удем',
        tense: RusTense.Futr,
        singular: false,
        person: 1,
        mood: RusMood.Indc
      },
      // будешь
      {
        ending: 'удешь',
        tense: RusTense.Futr,
        singular: true,
        person: 2,
        mood: RusMood.Indc
      },
      // будете
      {
        ending: 'удете',
        tense: RusTense.Futr,
        singular: false,
        person: 2,
        mood: RusMood.Indc
      },
      // будет
      {
        ending: 'удет',
        tense: RusTense.Futr,
        singular: true,
        person: 3,
        mood: RusMood.Indc
      },
      // будут
      {
        ending: 'удут',
        tense: RusTense.Futr,
        singular: false,
        person: 3,
        mood: RusMood.Indc
      },
      // будь
      {
        ending: 'удь',
        singular: true,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
      // будьте
      {
        ending: 'удьте',
        singular: false,
        mood: RusMood.Impr,
        involvement: Involvement.Excl
      },
    ]
  },
];
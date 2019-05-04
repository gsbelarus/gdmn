import { RusAspect, Transitivity, RusVerbInterface } from './types';

export const rusVerbs: RusVerbInterface[] = [
  /**
   * глаголы ниже добавлены вручную.
   */

  /**
   * глаголы ниже взяты из проекта wiktionary из демо данных для
   * спряжений по Зализняку.
   */
  // делать
  {
    stem: 'дела',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '1a'
  },
  // включать
  {
    stem: 'включа',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '1a'
  },
  // стачать
  {
    stem: 'стача',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '1aСВ'
  },
  // делаться
  {
    stem: 'дела',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '1a-ся'
  },
  // примелькаться
  {
    stem: 'примелька',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '1a-сяСВ'
  },
  // продемонстрировать
  {
    stem: 'продемонстрирова',
    stem1: 'продемонстриру',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '2a'
  },
  // требовать
  {
    stem: 'требова',
    stem1: 'требу',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '2a'
  },
  // сортировать
  {
    stem: 'сортирова',
    stem1: 'сортиру',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '2a'
  },
  // отсортировать
  {
    stem: 'отсортирова',
    stem1: 'отсортиру',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '2a'
  },
  // отсутствовать
  {
    stem: 'отсутствова',
    stem1: 'отсутству',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '2a'
  },
  // присутствовать
  {
    stem: 'присутствова',
    stem1: 'присутству',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '2a'
  },
  // жевать
  {
    stem: 'жев',
    stem1: 'жу',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '2b'
  },
  // придвинуть
  {
    stem: 'придвин',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '3a(2)СВ'
  },
  // глянуть
  {
    stem: 'глян',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '3a-гСВ'
  },
  // гнуть
  {
    stem: 'гн',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '3b'
  },
  // улепетнуть
  {
    stem: 'улепетн',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '3bСВ'
  },
  // отчеркнуть
  {
    stem: 'отчеркн',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '3b-еСВ'
  },
  // нагнуться
  {
    stem: 'нагн',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '3b-сяСВ'
  },
  // тянуть
  {
    stem: 'тяну',
    stem1: 'тян',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '3c'
  },
  // стянуть
  {
    stem: 'стян',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '3cСВ'
  },
  // тянуться
  {
    stem: 'тяну',
    stem1: 'тян',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '3c-ся'
  },
  // киснуть
  {
    stem: 'кис',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '3°a'
  },
  // издохнуть
  {
    stem: 'издох',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '3°aСВ'
  },
  // стынуть
  {
    stem: 'сты',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '3°a((5)(6))-г'
  },
  // уничтожить
  {
    stem: 'уничтож',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '4a'
  },
  // строить
  {
    stem: 'стро',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '4a'
  },
  // грабить
  {
    stem: 'граб',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '4a-б'
  },
  // молвить
  {
    stem: 'молв',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '4a-б-с'
  },
  // вылепить
  {
    stem: 'вылеп',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '4a-б-сСВ'
  },
  // балаболить
  {
    stem: 'балабол',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '4a-л'
  },
  // бахвалиться
  {
    stem: 'бахвал',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '4a-л-ся'
  },
  // смыслить
  {
    stem: 'смысл',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '4a-cc'
  },
  // вылепиться
  {
    stem: 'вылеп',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '4a-с-л-сяСВ'
  },
  // тратить
  {
    stem: 'трат',
    stem1: 'трач',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '4a-т'
  },
  // выразить
  {
    stem: 'выраз',
    stem1: 'выраж',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '4a-тСВ'
  },
  // шкодить
  {
    stem: 'шкод',
    stem1: 'шкож',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '4a-тX'
  },
  // множить
  {
    stem: 'множ',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '4a-ш'
  },
  // брезжить
  {
    stem: 'брезж',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '4a-ш-с'
  },
  // выкрасить
  {
    stem: 'выкрас',
    stem1: 'выкраш',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '4a((3))-тСВ'
  },
  // плющить
  {
    stem: 'плющ',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '4a((3))-ш'
  },
  // расплющить
  {
    stem: 'расплющ',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '4a((3))-шСВ'
  },
  // удалить
  {
    stem: 'удал',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '4b'
  },
  // смолить
  {
    stem: 'смол',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '4b'
  },
  // крушить
  {
    stem: 'круш',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '4b-ш'
  },
  // томить
  {
    stem: 'том',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '4b-б'
  },
  // щадить
  {
    stem: 'щад',
    stem1: 'щаж',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '4b-т'
  },
  // присоединиться
  {
    stem: 'присоедин',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '4b-сяСВ'
  },
  // хоронить
  {
    stem: 'хорон',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '4c'
  },
  // валить
  {
    stem: 'вал',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '4c(4)'
  },
  // любить
  {
    stem: 'люб',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '4c(4)-б'
  },
  // точить
  {
    stem: 'точ',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '4c-ш'
  },
  // насторожиться
  {
    stem: 'насторож',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '4c-ш-сяСВ'
  },
  // ловить
  {
    stem: 'лов',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '4c-б'
  },
  // уловить
  {
    stem: 'улов',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '4c-бСВ'
  },
  // просить
  {
    stem: 'прос',
    stem1: 'проc',
    stem2: 'прош',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '4c-т'
  },
  // катиться
  {
    stem: 'кат',
    stem1: 'кач',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '4c-т-ся'
  },
  // засветить
  {
    stem: 'засвет',
    stem1: 'засвеч',
    stem2: 'засвече',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '4c-тСВ'
  },
  // взмолиться
  {
    stem: 'взмол',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '4c-сяСВ'
  },
  // видеться
  {
    stem: 'вид',
    stem1: 'виж',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '5a-д-ся'
  },
  // видеть
  {
    stem: 'вид',
    stem1: 'виж',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '5a-т'
  },
  // слышать
  {
    stem: 'слыш',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '5a-ш'
  },
  // стоять
  {
    stem: 'сто',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '5b'
  },
  // кричать
  {
    stem: 'крич',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '5b-ш'
  },
  // мчаться
  {
    stem: 'мч',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '5b-ш-ся'
  },
  // бежать
  {
    stem: 'беж',
    stem1: 'бег',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '5b-ж'
  },
  // пыхтеть
  {
    stem: 'пыхт',
    stem1: 'пыхч',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '5b-т'
  },
  // глядеться
  {
    stem: 'гляд',
    stem1: 'гляж',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '5b-т-ся'
  },
  // просвистеть
  {
    stem: 'просвист',
    stem1: 'просвищ',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '5b-тСВ'
  },
  // вглядеться
  {
    stem: 'вгляд',
    stem1: 'вгляж',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '5b-т-сяСВ'
  },
  // бояться
  {
    stem: 'бо',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '5b-ся'
  },
  // спать
  {
    stem: 'сп',
    stem1: 'спл',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '5b/c'
  },
  // держать
  {
    stem: 'держ',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '5c'
  },
  // содержать
  {
    stem: 'содерж',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '5c'
  },
  // смотреть
  {
    stem: 'смотр',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '5c-е'
  },
  // вертеть
  {
    stem: 'верт',
    stem1: 'верч',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '5c-т'
  },
  // гнать
  {
    stem: 'гн',
    stem1: 'гон',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '5c/c'
  },
  // сеять
  {
    stem: 'се',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '6a'
  },
  // глаголать
  {
    stem: 'глагол',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '6a-н'
  },
  // колебать
  {
    stem: 'колеб',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '6a-б'
  },
  // сыпать
  {
    stem: 'сып',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '6a^'
  },
  // прятать
  {
    stem: 'прят',
    stem1: 'пряч',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '6a-т'
  },
  // высказать
  {
    stem: 'высказ',
    stem1: 'выскаж',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '6a-т-иСВ'
  },
  // вопиять
  {
    stem: 'вопи',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '6b'
  },
  // смеяться
  {
    stem: 'сме',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '6b-ся'
  },
  // ржать
  {
    stem: 'рж',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '6b-ш'
  },
  // слать
  {
    stem: 'сл',
    stem1: 'шл',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '6b^'
  },
  // сосать
  {
    stem: 'сос',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '6°b'
  },
  // казать
  {
    stem: 'каз',
    stem1: 'каж',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '6c'
  },
  // показать
  {
    stem: 'показ',
    stem1: 'покаж',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '6c'
  },
  // оказать
  {
    stem: 'оказ',
    stem1: 'окаж',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '6cСВ'
  },
  // сказаться
  {
    stem: 'сказ',
    stem1: 'скаж',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '6c-сяСВ'
  },
  // лепетать
  {
    stem: 'лепет',
    stem1: 'лепеч',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '6cX'
  },
  // вывести
  {
    stem: 'выве',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '7a(9)-дСВ'
  },
  // вытереть
  {
    stem: 'вытер',
    stem1: 'вытр',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '9aСВ'
  },
  // тереть
  {
    stem: 'тер',
    stem1: 'тр',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '9b'
  },
  // натереть
  {
    stem: 'натер',
    stem1: 'натр',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '9bСВ'
  },
  // тереться
  {
    stem: 'тер',
    stem1: 'тр',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '9b-ся'
  },
  // стереть
  {
    stem: 'стер',
    stem1: 'сотр',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '9*bСВ'
  },
  // колоть
  {
    stem: 'кол',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '10c'
  },
  // бороться
  {
    stem: 'бор',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '10c-ся'
  },
  // шить
  {
    stem: 'ш',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '11b'
  },
  // забить
  {
    stem: 'заб',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '11bСВ'
  },
  // спиться
  {
    stem: 'сп',
    stem1: 'соп',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '11*b/c"-сяСВ'
  },
  // рыть
  {
    stem: 'ры',
    stem1: 'ро',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '12a'
  },
  // выть
  {
    stem: 'вы',
    stem1: 'во',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '12a-ы'
  },
  // петь
  {
    stem: 'п',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '12b'
  },
  // спеть
  {
    stem: 'сп',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '12bСВ'
  },
  // гнить
  {
    stem: 'гн',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '12b/c'
  },
  // выдавать
  {
    stem: 'выдава',
    stem1: 'выда',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '13b'
  },
  // сдаваться
  {
    stem: 'сдава',
    stem1: 'сда',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '13b-ся'
  },
  // мять
  {
    stem: 'мя',
    stem1: 'мн',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '14b'
  },
  // мяться
  {
    stem: 'мя',
    stem1: 'мн',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '14b-ся'
  },
  // помять
  {
    stem: 'помя',
    stem1: 'помн',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '14bСВ'
  },
  // помяться
  {
    stem: 'помя',
    stem1: 'помн',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '14b-сяСВ'
  },
  // сжать
  {
    stem: 'сжа',
    stem1: 'сожм',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '14*bСВ'
  },
  // сжаться
  {
    stem: 'сжа',
    stem1: 'сожм',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '14*b-сяСВ'
  },
  // донять
  {
    stem: 'дон',
    stem1: 'дой',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '14b/cСВ'
  },
  // снять
  {
    stem: 'сня',
    stem1: 'сн',
    stem2: 'сним',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '14cСВ'
  },
  // принять
  {
    stem: 'прин',
    stem1: 'прим',
    stem2: 'приня',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '14c(1)СВ'
  },
  // одеть
  {
    stem: 'оде',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '15aСВ'
  },
  // одеться
  {
    stem: 'оде',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '15a-сяСВ'
  },
  // жить
  {
    stem: 'жи',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '16b/c'
  },
  // выбыть
  {
    stem: 'выбы',
    stem1: 'выбуд',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '^a-бытьСВ'
  },
  // ехать
  {
    stem: 'еха',
    stem1: 'ед',
    stem2: 'езжай',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '^a-ех'
  },
  // поехать
  {
    stem: 'поеха',
    stem1: 'поед',
    stem2: 'поезжай',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '^a-ехСВ'
  },
  // есть
  {
    stem: 'е',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Tran,
    conjZ: '^b'
  },
  // идти
  {
    stem: 'и',
    stem1: 'ш',
    stem2: '',
    aspect: RusAspect.Impf,
    transitivity: Transitivity.Intr,
    conjZ: '^b/b(9)'
  },
  // пойти
  {
    stem: 'пой',
    stem1: 'пош',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Intr,
    conjZ: '^b/b(9)СВ'
  },
  // дать
  {
    stem: 'да',
    stem1: '',
    stem2: '',
    aspect: RusAspect.Perf,
    transitivity: Transitivity.Tran,
    conjZ: '^b/cСВ'
  },
];
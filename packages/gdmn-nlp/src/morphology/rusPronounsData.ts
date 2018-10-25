import { RusPronounData, PronounType, RusGender } from './types';

export const rusPronouns: RusPronounData[] = [
  {
    pronounType: PronounType.Personal,
    person: 1,
    singular: true,
    words: ['я', 'меня' , 'мне', 'меня', 'мной', 'мне']
  },
  {
    pronounType: PronounType.Personal,
    person: 1,
    singular: false,
    words: ['мы', 'нас' , 'нам', 'нас', 'нами', 'нас']
  },
  {
    pronounType: PronounType.Personal,
    person: 2,
    singular: true,
    words: ['ты', 'тебя' , 'тебе', 'тебя', 'тобой', 'тебе']
  },
  {
    pronounType: PronounType.Personal,
    person: 2,
    singular: false,
    words: ['вы', 'вас' , 'вам', 'вас', 'вами', 'вас']
  },
  {
    pronounType: PronounType.Personal,
    person: 3,
    singular: true,
    gender: RusGender.Masc,
    words: ['он', 'него' , 'нему', 'него', 'ним', 'нём']
  },
  {
    pronounType: PronounType.Personal,
    person: 3,
    singular: true,
    gender: RusGender.Femn,
    words: ['она', 'неё' , 'ней', 'неё', 'нею', 'ней']
  },
  {
    pronounType: PronounType.Personal,
    person: 3,
    singular: true,
    gender: RusGender.Neut,
    words: ['оно', 'него' , 'нему', 'него', 'ним', 'нём']
  },
  {
    pronounType: PronounType.Personal,
    person: 3,
    singular: false,
    words: ['они', 'них' , 'ним', 'них', 'ними', 'ним']
  },
  {
    pronounType: PronounType.Reflexive,
    noNomn: true,
    words: ['себя', 'себя' , 'себе', 'себя', 'собой', 'себе']
  },
  /*
  {
    pronounType: PronounType.Definitive,
    singular: false,
    words: ['все', 'всех' , 'всем', 'всех', 'всеми', 'всех']
  },
  */
];

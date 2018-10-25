/** Parse word from open corpora dictionary and returns morphological signs */

import { RusAspect, Transitivity, RusTense, RusGender, RusMood, Involvement, PartOfSpeech, RusPersons } from '../types';

export interface ParsedWord {
  word: string;
  pos: PartOfSpeech | undefined;
  aspect: RusAspect | undefined;
  transitivity: Transitivity | undefined;
  tense: RusTense | undefined;
  singular: boolean | undefined;
  gender: RusGender | undefined;
  person: RusPersons | undefined;
  mood: RusMood | undefined;
  involvement: Involvement | undefined;
}

export function parseWord(line: string): ParsedWord {
  const arr = line.replace(/\s/g, ',').replace(/,,/g, ',').split(',');

  var pos: PartOfSpeech | undefined;
  let aspect: RusAspect | undefined;
  let transitivity: Transitivity | undefined;
  let tense: RusTense | undefined;
  let singular: boolean | undefined;
  let gender: RusGender | undefined;
  let person: RusPersons | undefined;
  let mood: RusMood | undefined;
  let involvement: Involvement | undefined;

  for (let i = 2; i < arr.length; i++) {
    switch (arr[i]) {
      case 'VERB':
        pos = 'VERB';
        break;
      case 'perf':
        aspect = RusAspect.Perf;
        break;
      case 'impf':
        aspect = RusAspect.Impf;
        break;
      case 'tran':
        transitivity = Transitivity.Tran;
        break;
      case 'intr':
        transitivity = Transitivity.Intr;
        break;
      case 'past':
        tense = RusTense.Past;
        break;
      case 'pres':
        tense = RusTense.Pres;
        break;
      case 'futr':
        tense = RusTense.Futr;
        break;
      case 'sing':
        singular = true;
        break;
      case 'plur':
        singular = false;
        break;
      case 'masc':
        gender = RusGender.Masc;
        break;
      case 'femn':
        gender = RusGender.Femn;
        break;
      case 'neut':
        gender = RusGender.Neut;
        break;
      case 'indc':
        mood = RusMood.Indc;
        break;
      case 'impr':
        mood = RusMood.Impr;
        break;
      case 'excl':
        involvement = Involvement.Excl;
        break;
      case '1per':
        person = 1;
        break;
      case '2per':
        person = 2;
        break;
      case '3per':
        person = 3;
        break;
      default:
        throw 'Unknown morphology sign';
    }
  }

  return (
    {
      word: arr[0],
      pos,
      aspect,
      transitivity,
      tense,
      singular,
      gender,
      person,
      mood,
      involvement
    }
  );
}

import { RusAdjective } from "./rusAdjective";
import { RusPronoun } from "./rusPronoun";
import { RusPreposition } from "./rusPreposition";
import { RusConjunction } from "./rusConjunction";
import { RusVerb } from "./rusVerb";
import { RusNoun } from "./rusNoun";
import {RusAdverb} from "./rusAdverb";
import { RusNumeral } from "./rusNumeral";
import { RusParticle } from './rusParticle';

export type RusWord = RusVerb | RusNoun | RusAdjective | RusPronoun | RusPreposition | RusParticle | RusConjunction | RusAdverb | RusNumeral;
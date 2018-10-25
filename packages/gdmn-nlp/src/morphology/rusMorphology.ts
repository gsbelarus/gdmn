import { RusAdjective } from "./rusAdjective";
import { RusPronoun } from "./rusPronoun";
import { RusPreposition } from "./rusPreposition";
import { RusConjunction } from "./rusConjunction";
import { RusVerb } from "./rusVerb";
import { RusNoun } from "./rusNoun";
import {RusAdverb} from "./rusAdverb";

export type RusWord = RusVerb | RusNoun | RusAdjective | RusPronoun | RusPreposition | RusConjunction | RusAdverb;
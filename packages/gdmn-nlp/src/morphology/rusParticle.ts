import { Word, ParticleLexeme, Particle } from './morphology';
import { ParticleType, ShortParticleTypeNames, RusParticleTypeNames } from './types';

export const rusParticles  = [
  {
    particleType: ParticleType.Pointing,
    words: ['вот', 'вон', 'это']
  },
  {
    particleType: ParticleType.Specifying,
    words: ['как раз', 'почти', 'точно', 'ровно']
  },
  {
    particleType: ParticleType.Amplifying,
    words: ['даже', 'ведь', 'всё', 'и', 'ни', 'же', 'просто', 'именно', 'уж', 'ещё']
  },
  {
    particleType: ParticleType.ExcretoryRestrictive,
    words: ['только', 'лишь']//, 'хотя бы'
  },
  {
    particleType: ParticleType.ModalWilled,
    words: ['да', 'дай', 'пусть', 'ну', 'ну-ка']
  },
  {
    particleType: ParticleType.Affirmative,
    words: ['да', 'точно', 'так']
  },
  {
    particleType: ParticleType.Negative,
    words: ['нет', 'не', 'ни', 'нету']//, 'вовсе не', 'далеко не', 'отнюдь не'
  },
  {
    particleType: ParticleType.Interrogative,
    words: ['разве', 'неужели', 'ли', 'в', 'на']
  },
  {
    particleType: ParticleType.Comparative,
    words: ['словно', 'точно', 'будто', 'как', 'вроде']//, 'как будто', 'будто бы', 'как бы'
  },
  {
    particleType: ParticleType.Emotive,
    words: ['что за', 'как', 'вот как', 'ишь']//, 'если б'
  },
  {
    particleType: ParticleType.Shaping,
    words: ['б', 'бы', 'пусть', 'пускай', 'да', 'давай', 'давайте']
  }
];

export class RusParticleLexeme extends ParticleLexeme {
  readonly particleType: ParticleType;

  constructor (particle: string, particleType: ParticleType) {
    super (particle);
    this.particleType = particleType;
  }

  public analyze(word: string, result: (w: Word<RusParticleLexeme>) => void): void {
    if (this.stem === word) {
      result(new RusParticle(word, this));
    }
  }

  public getWordForm(): RusParticle {
    return new RusParticle(this.stem, this);
  }

  public getWordForms(): RusParticle[] {
    return [new RusParticle(this.stem, this)];
  }
}

export const RusParticleLexemes = rusParticles.reduce(
  (prev, p) => {
    p.words.forEach( w => prev.push(new RusParticleLexeme(w, p.particleType)) );
    return prev;
  },
  [] as RusParticleLexeme[]
);

export class RusParticle extends Particle<RusParticleLexeme> {
  getDisplayText (): string {
    return this.word + '; частица; ' +
    RusParticleTypeNames[this.lexeme.particleType];
  }

  static getSignature(particleType: ParticleType): string {
    return `PART${ShortParticleTypeNames[particleType]}`;
  }

  getSignature (): string {
    return RusParticle.getSignature(this.lexeme.particleType);
  }
}

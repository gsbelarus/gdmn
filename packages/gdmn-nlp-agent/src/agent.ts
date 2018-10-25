import {morphAnalyzer, Noun, NounLexeme, SemContext, hasMeaning, RusVerb, RusPrepositionLexeme, PrepositionType, SemCategory, RusNounLexeme, RusCase, RusAdjectiveLexeme, RusAdjectiveCategory, RusPhrase, RusImperativeVP, RusANP} from "gdmn-nlp";
import {Attribute, Entity, ERModel, EntityAttribute} from "gdmn-orm";

export type Action = 'SHOW' | 'DELETE';

export enum Determiner {
  All = 0
};

export type Operator = 'EQ' | 'HASROOT';

export interface IAttrCondition {
  attr: Attribute;
  op: Operator;
  value: string;
}

export interface ICommandObject {
  determiner: Determiner;
  entity: Entity;
  conditions: IAttrCondition[];
}

export interface ICommand {
  action: Action;
  objects?: ICommandObject[]
}

export class ERTranslatorRU {

  readonly erModel: ERModel;
  readonly neMap: Map<NounLexeme, Entity[]>;

  constructor(erModel: ERModel) {
    this.erModel = erModel;
    this.neMap = new Map<NounLexeme, Entity[]>();

    Object.entries(this.erModel.entities).forEach( ([, e]) =>
      e.lName.ru && e.lName.ru.name.split(",").forEach(n =>
        morphAnalyzer(n.trim()).forEach(w => {
          if (w instanceof Noun) {
            const entities = this.neMap.get(w.lexeme);
            if (!entities) {
              this.neMap.set(w.lexeme, [e]);
            } else {
              if (!entities.find(f => f === e)) {
                entities.push(e);
              }
            }
          }
        })
      )
    );
  }

  public process(phrase: RusPhrase): ICommand {
    if (phrase instanceof RusImperativeVP) {
      return this.processImperativeVP(phrase as RusImperativeVP);
    } else {
      throw new Error(`Unsupported phrase type`);
    }
  }

  public processImperativeVP(imperativeVP: RusImperativeVP): ICommand {

    const command = ((v: RusVerb): ICommand => {
      if (hasMeaning(SemContext.QueryDB, 'показать', v)) {
        return {action: 'SHOW'};
      }
      if (hasMeaning(SemContext.QueryDB, 'удалить', v)) {
        return {action: 'DELETE'};
      }
      throw new Error(`Unknown verb ${v.word}`);
    })(imperativeVP.imperativeVerb);

    if (!imperativeVP.imperativeNP) {
      return command;
    }

    const np = imperativeVP.imperativeNP;
    const determiner = Determiner.All;

    const object = (() => {
      if (np.noun instanceof RusANP) {
        return (np.noun as RusANP).noun;
      } else {
        return np.noun;
      }
    })();

    const entities = this.neMap.get(object.lexeme);

    if (!entities) {
      throw new Error(`Can't find entities for noun ${object.word}`);
    }

    command.objects = [];

    entities.forEach( entity => {
      command.objects!.push({ determiner, entity, conditions: [] })
    });

    if (np.noun instanceof RusANP) {
      const adjective = (np.noun as RusANP).adjf;

      if ((adjective.lexeme as RusAdjectiveLexeme).category === RusAdjectiveCategory.Rel) {
        const nounLexeme = (adjective.lexeme as RusAdjectiveLexeme).getNounLexeme();

        if (nounLexeme && nounLexeme.semCategories.find( sc => sc === SemCategory.Place)) {
          command.objects.forEach( co => {
            const locationAttr = co.entity.attributesBySemCategory(SemCategory.ObjectLocation);

            if (locationAttr.length) {
              const attr = locationAttr[0];
              let op: Operator;

              if (attr instanceof EntityAttribute && (attr as EntityAttribute).entities[0].isTree) {
                op = 'HASROOT';
              } else {
                op = 'EQ';
              }

              co.conditions.push(
                {
                  attr,
                  op,
                  value: nounLexeme.getWordForm({ c: RusCase.Nomn, singular: true }).word
                }
              );
            }
          });
        }
      }
    }

    if (np.pp) {
      command.objects.forEach( co => {
        const pl = np.pp!.prep.lexeme as RusPrepositionLexeme;
        if (pl.prepositionType === PrepositionType.Place) {
          const locationAttr = co.entity.attributesBySemCategory(SemCategory.ObjectLocation);

          if (locationAttr.length) {
            const attr = locationAttr[0];
            let op: Operator;

            if (attr instanceof EntityAttribute && (attr as EntityAttribute).entities[0].isTree) {
              op = 'HASROOT';
            } else {
              op = 'EQ';
            }

            co.conditions.push(
              {
                attr,
                op,
                value: (np.pp!.noun.lexeme as RusNounLexeme).getWordForm({ c: RusCase.Nomn, singular: true }).word
              }
            );
          }
        }
      });
    }

    return command;
  }
}

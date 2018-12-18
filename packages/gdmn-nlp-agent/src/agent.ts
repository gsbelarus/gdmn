import { morphAnalyzer, Noun, NounLexeme, SemContext, hasMeaning, RusVerb, SemCategory, RusCase, RusAdjectiveLexeme, RusAdjectiveCategory, RusPhrase, RusImperativeVP, RusANP, RusPP, RusPrepositionLexeme, PrepositionType } from "gdmn-nlp";
import { Entity, ERModel, EntityLink, EntityQueryField, ScalarAttribute, EntityQuery, EntityQueryOptions, IEntityQueryWhereValue } from "gdmn-orm";
import { ICommand, Action} from "./command";
import accepts = require("accepts");

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

  public process(phrase: RusPhrase): ICommand[] {
    if (phrase instanceof RusImperativeVP) {
      return this.processImperativeVP(phrase as RusImperativeVP);
    } else {
      throw new Error(`Unsupported phrase type`);
    }
  }

  public processImperativeVP(imperativeVP: RusImperativeVP): ICommand[] {
    const action = ((v: RusVerb): Action => {
      if (hasMeaning(SemContext.QueryDB, 'показать', v)) {
        return 'QUERY';
      }
      if (hasMeaning(SemContext.QueryDB, 'удалить', v)) {
        return 'DELETE';
      }
      throw new Error(`Unknown verb ${v.word}`);
    })(imperativeVP.imperativeVerb);

    if (!imperativeVP.imperativeNP) {
      throw new Error("teasd");
    }

    const np = imperativeVP.imperativeNP;

    const objectPP = (() => {
      if (np.pp instanceof RusPP) {
        return (np.pp as RusPP).noun;
      } else {
        return undefined;
      }
    })();

    const objectANP = (() => {
      if (np.noun instanceof RusANP) {
        return (np.noun as RusANP).noun;
      } else {
        return np.noun;
      }
    })();


    const entities = this.neMap.get(objectANP.lexeme);

    if (!entities) {
      throw new Error(`Can't find entities for noun ${objectANP.word}`);
    }

    const commands = entities.map(entity => {
      const fields = Object.values(entity.attributes)
      .filter(attr => attr instanceof ScalarAttribute)
      .map(attr => new EntityQueryField(attr));

      let options;
      const equals: IEntityQueryWhereValue[] = [];
      if (np.noun instanceof RusANP) {
        const adjective = (np.noun as RusANP).adjf;
        if ((adjective.lexeme as RusAdjectiveLexeme).category === RusAdjectiveCategory.Rel) {
          const nounLexeme = (adjective.lexeme as RusAdjectiveLexeme).getNounLexeme();
          if (nounLexeme && nounLexeme.semCategories.find( sc => sc === SemCategory.Place)) {
            const locationAttr = entity.attributesBySemCategory(SemCategory.ObjectLocation);
            const attr = locationAttr[0];
            const words = nounLexeme.getWordForm({ c: RusCase.Nomn, singular: true }).word;
            equals.push({
              alias:"alias",
              attribute: attr,
              value: words
            });
          } else {
            throw new Error(`Can't find semantic category place for noun ${objectANP.word}`);
          }
        }
      }

      if (np.pp instanceof RusPP) {
        const preposition = (np.pp as RusPP).prep;
        if ((preposition.lexeme as RusPrepositionLexeme).prepositionType === PrepositionType.Place) {
          const nounLexeme = (np.pp as RusPP).noun.lexeme;
          if (nounLexeme && nounLexeme.semCategories.find( sc => sc === SemCategory.Place)) {
            const locationAttr1 = entity.attributesBySemCategory(SemCategory.ObjectLocation);
            const attr1 = locationAttr1[0];
            const words1 = nounLexeme.getWordForm({ c: RusCase.Nomn, singular: true }).word;
            equals.push({
              alias:"alias",
              attribute: attr1,
              value: words1
            });
          }
        }
      }
      options = new EntityQueryOptions(undefined, undefined, [{equals}]);

      const entityLink = new EntityLink(entity, "alias", fields);
      return {
        action,
        payload: new EntityQuery(entityLink, options)
      };
    })
    return commands;
  }
}

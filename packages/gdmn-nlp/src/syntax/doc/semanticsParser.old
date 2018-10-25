
import { tokenize } from '../morphology/token';
import { morphAnalyzer } from '../morphology/morphAnalyzer';
import { Word } from '../morphology/morphology';
import { grammar } from './grammar';
import { Phrase, PP, NP, ANP, VP } from './semantics';

export type SetParsedText = {
  readonly parsedText: string[];
  readonly phrase?: Phrase;
};

const jison = require('jison');

const parser = new jison.Parser(grammar);

function recurs(words: Word[][], curr: Word[], cmbn: Word[][]): void {
  if (curr.length >= words.length - 1) {
    words[words.length - 1].forEach( w => cmbn.push([...curr, w]) );
  } else {
    words[curr.length].forEach( w => recurs(words, [...curr, w], cmbn) );
  }
}

export function parseSemantics(text: string): SetParsedText {
  const words = tokenize(text).reduce(
    (p, t) => {
      if (t.kind === 'word') {
        p.push(morphAnalyzer(t.tkn));
      }
      return p;
    },
    [] as Word[][]);

  const cmbn: Word[][] = [];

  if (words.length) {
    recurs(words, [], cmbn);
  }

  const errors: string[] = [];
  const match = cmbn.find( s => {
    parser.lexer = {
      curr: 0,
      yytext: undefined,
      lex: function () {
        if (this.curr < s.length) {
          this.yytext = s[this.curr];
          return s[this.curr++].getSignature();
        } else {
          return null;
        }
      },
      // tslint:disable-next-line:no-empty
      setInput: function (str: string) { }
    };

    parser.yy = {
      stack: [] as Phrase[],

      node: function(kind: string, tokens: Word[], appendStack: number | undefined): Phrase {
        let stackTokens: Phrase[] = [];

        if (appendStack && appendStack > 0) {
          stackTokens = this.stack.splice(-appendStack);
        }

        switch (kind) {
          case 'NP':
          this.push(new NP([...tokens, ...stackTokens]));
          break;

          case 'VP':
          this.push(new VP([...tokens, ...stackTokens]));
          break;

          case 'ANP':
          this.push(new ANP(tokens));
          break;

          case 'PP':
          if (tokens.length === 2) {
            this.push(new PP(tokens));
          } else {
            this.push(new PP([tokens[0], new NP(tokens.slice(1))]));
          }
          break;

          default:
          throw 'Unknown phrase type';
        }

        return this.stack[this.stack.length - 1];
      },

      push: function(w: Phrase): void {
        w.simplify();
        this.stack.push(w);
      }
    };

    try {
      parser.parse();
      return parser.yy.stack.length === 1;
    } catch (e) {
      errors.push(e.toString());
      return false;
    }
  });

  if (match) {
    return {
      parsedText: [match.reduce( (x, y) => x + ' ' + y.getSignature(), '' )],
      phrase: parser.yy.stack.pop()
    };
  }

  return {
    parsedText: errors
  };
}
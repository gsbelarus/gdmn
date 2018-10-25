var fs = require('fs');
var rawFile = fs.readFileSync('./data-all.txt', 'utf-8').replace(/ё/g, 'е');

const verbs = rawFile.replace(/́/g, '').split('{{ШаблонДемо').reduce( (p, s, idx) => {
  if (s) {
    const rg = /\s*\|имя=гл ru (.+)\s(?:\|основа[ ]?=[ ]?(.+)\s){1}(?:\|основа1[ ]?=[ ]?(.+)\s)?(?:\|основа2[ ]?=[ ]?(.+)\s)?(?:\|основа3[ ]?=[ ]?(.+)\s)?(?:\|основа4[ ]?=[ ]?(.+)\s)?(?:\|основа5[ ]?=[ ]?(.+)\s)?\|слова[ ]?=[ ]?(?:\[\[([^\]]+){1}\]\](?:[ ]*\([^)]+\))?[, ]{0,2}){1}(?:\[\[([^\]]+){1}\]\](?:[ ]*\([^)]+\))?[, ]{0,2})?(?:\[\[([^\]]+){1}\]\](?:[ ]*\([^)]+\))?[, ]{0,2})?(?:\[\[([^\]]+){1}\]\](?:[ ]*\([^)]+\))?[, ]{0,2})?(?:\[\[([^\]]+){1}\]\](?:[ ]*\([^)]+\))?[, ]{0,2})?(?:\[\[([^\]]+){1}\]\](?:[ ]*\([^)]+\))?[, ]{0,2})?(?:\[\[([^\]]+){1}\]\](?:[ ]*\([^)]+\))?[, ]{0,2})?(?:\[\[([^\]]+){1}\]\](?:[ ]*\([^)]+\))?[, ]{0,2})?\s\}\}/g;
    const groups = rg.exec(s);
    if (groups) {
      const t = [];
      while (t.length < 7) {
        t.push(groups[t.length + 1] ? groups[t.length + 1] : '');
      }
      t.push(groups.filter( (g, idx) => idx >= 8 && idx <= 10 ).find( w => w && w.startsWith(t[1]) ));
      p.push(t);
    }
  }
  return p;
}, [])

fs.writeFileSync('./conjugation-all.txt', verbs.reduce(
    (p, v) => {
      return p + v[0] + ';' + v[7] + '\n';
    },
    ''
  )
);

fs.writeFileSync('./rusverbslist.txt', verbs.reduce(
    (p, v) => {
      return p + v[7] + ',';
    },
    ''
  )
);

fs.writeFileSync('./rusconjugation.txt', verbs.reduce( (p, v, idx) => verbs.find( (x, xidx) => x[0] === v[0] && xidx < idx ) ? p : [...p, v], [] )
  .reduce(
    (p, v, idx) => {
      let d = v[0].replace('\'', '\\\'');
      return p + '\'' + d + '\'' + ''.padEnd(14 - d.length) + '|' + ((idx + 1) % 6 === 0 ? '\n' : '')
    },
    ''
  )
);

function findBlock(q, skip = 0) {
  for (let i = q.length - 1; i >= 0; i--) {
    const numExp = /^\d+$/;
    if (q[i].length && numExp.test(q[i][0])) {
      if (!skip) {
        return i;
      } else {
        skip = skip - 1;
      }
    }
  }
  return -1;
}

const lineByLine = require('n-readlines');
const liner = new lineByLine('../dict.opcorpora.txt');

const queue = [];

while (line = liner.next()) {
  if (queue.length > 100) {
    queue.splice(0, 1);
  }

  const l = line.toString().replace(/Ё/g, 'Е').replace('\t', ',').replace('\n', '').replace(/\s/g, ',').split(',').map( w => w.trim() );
  queue.push(l);

  if (l.length > 1 && l[1] === 'INFN') {
    const exclusions= ['Litr', 'Infr', 'gen2', 'loc2', 'V-ie', 'V-sh', 'V-ej', 'V-bi', 'V-be', 'V-ey', 'V-oy', 'Coun', 'Dist', 'Abbr', 'Arch'];
    const verb = verbs.find( (v) => v[7] === l[0].toLowerCase() && typeof v[10] === 'undefined' );

    if (verb) {
      const prev = findBlock(queue, 1);
      if (prev > -1) {
        console.log(l);

        verb[8] = l[2] === 'impf' ? 'RusAspect.Impf' : 'RusAspect.Perf';
        verb[9] = l[3] === 'tran' ? 'Transitivity.Tran' : 'Transitivity.Intr';

        verb[10] = []
        let i = prev + 1;
        while ((i < queue.length) && queue[i][0]) {
          const last = queue[i].length - 1;
          let spec = queue[i][last];
          if (!exclusions.find( (e) => e === spec )) {
            var aspect = 'undefined';
            var transitivity = 'undefined';
            var tense = undefined;
            var singular = 'undefined';
            var gender = undefined;
            var person = undefined;
            var mood = 'undefined';
            var involvement = undefined;

            queue[i].forEach( (s, idx) => {
              if (idx >= 2) {
                switch (s) {
                  case 'perf':
                    aspect = 'RusAspect.Perf';
                    break;
                  case 'impf':
                    aspect = 'RusAspect.Impf';
                    break;
                  case 'tran':
                    transitivity = 'Transitivity.Tran';
                    break;
                  case 'intr':
                    transitivity = 'Transitivity.Intr';
                    break;
                  case 'past':
                    tense = 'RusTense.Past';
                    break;
                  case 'pres':
                    tense = 'RusTense.Pres';
                    break;
                  case 'futr':
                    tense = 'RusTense.Futr';
                    break;
                  case 'sing':
                    singular = 'true';
                    break;
                  case 'plur':
                    singular = 'false';
                    break;
                  case 'masc':
                    gender = 'RusGender.Masc';
                    break;
                  case 'femn':
                    gender = 'RusGender.Femn';
                    break;
                  case 'neut':
                    gender = 'RusGender.Neut';
                    break;
                  case 'indc':
                    mood = 'RusMood.Indc';
                    break;
                  case 'impr':
                    mood = 'RusMood.Impr';
                    break;
                  case 'incl':
                    involvement = 'Involvement.Incl';
                    break;
                  case 'excl':
                    involvement = 'Involvement.Excl';
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
                  case 'Arch':
                    break;
                  case 'Impe':
                    break;
                  default:
                    throw 'Unknown morphology sign ' + queue[i][0] + ' ' + s;
                }
              }
            });

            const morphSigns = [];

            //morphSigns.push('aspect: ' + aspect);
            //morphSigns.push('transitivity: ' + transitivity);
            if (tense) {
              morphSigns.push('tense: ' + tense);
            }
            morphSigns.push('singular: ' + singular);
            if (gender) {
              morphSigns.push('gender: ' + gender);
            }
            if (person) {
              morphSigns.push('person: ' + person);
            }
            morphSigns.push('mood: ' + mood);
            if (involvement) {
              morphSigns.push('involvement: ' + involvement);
            }

            const ending = queue[i][0].toLowerCase();
            verb[10].push({ending, morphSigns});
          }
          i++;
        }
      }
    }
  }
}

fs.writeFileSync('./rusverb.txt', verbs.reduce( (p, l) => {
    const c = l[0].replace('\'', '\\\'');
    const stems = l.filter( (v, idx) => idx > 0 && idx < 7 ).filter( (v, idx, self) => self.indexOf(v) === idx ); // основы в исходных данных могут повторяться. отсеиваем повторы
    if (typeof l[8] !== 'undefined' && l[10].length > 2) {
      let s =
        ''.padEnd(2) + '// ' + l[7] + '\n' +
        ''.padEnd(2) + '{\n' +
        ''.padEnd(4) + 'stem: \'' + stems[0] + '\',\n' +
        ''.padEnd(4) + 'stem1: \'' + (stems[1] ? stems[1] : '') + '\',\n' +
        ''.padEnd(4) + 'stem2: \'' + (stems[2] ? stems[2] : '') + '\',\n' +
        ''.padEnd(4) + 'aspect: ' + l[8] + ',\n' +
        ''.padEnd(4) + 'transitivity: ' + l[9] + ',\n' +
        ''.padEnd(4) + 'conjZ: \'' + c + '\'\n' +
        ''.padEnd(2) + '},\n';
      return p + s;
    }
    return p;
  }, '')
);

const duplicates = [];

fs.writeFileSync('./rusconjend.txt', verbs.reduce( (p, l) => {
    // более длинные должны идти вначале
    const verbSuffixes = ['нуть', 'сть', 'сти', 'дти', 'ать', 'ить', 'уть', 'еть', 'ыть', 'ять', 'оть', 'ть', 'чь', 'ти'];
    const c = l[0].replace('\'', '\\\'');
    // основы в исходных данных могут повторяться. отсеиваем повторы
    // и сортируем по длине. от длинных к коротким
    const stems = l.filter( (v, idx) => idx > 0 && idx < 7 )
      .filter( (v, idx, self) => self.indexOf(v) === idx && v )
      .sort( (a, b) => b.length - a.length );
    let temp = undefined;
    if (l[10]) {
      temp = l[10].reduce( (p, e) => {
        return (
          p +
          ''.padEnd(6) + '// ' + e.ending + '\n' +
          // ''.padEnd(6) + '// ' + stems.join() + '\n' +
          ''.padEnd(6) + '{' + '\n' +
          ''.padEnd(8) + 'ending: \'' +
            stems.reduce ( (p, s) => typeof p !== 'undefined' ? p : (e.ending.startsWith(s) ? e.ending.substring(s.length) : undefined), undefined) +
            '\',\n' +
          ''.padEnd(8) + e.morphSigns.join(',\n        ')  + '\n' +
          ''.padEnd(6) + '},\n');
      }, '');
    }
    const suffix = verbSuffixes.filter( (sfx) => stems.find( (st) => l[7] === st + sfx || l[7] === st + sfx + 'ся') )
      .sort( (a, b) => a.length - b.length )[0];

    const verbSignature = c + l[8] + l[9] + suffix;

    if (duplicates.find( s => s === verbSignature)) {
      return p;
    }

    duplicates.push(verbSignature);

    let s =
      ''.padEnd(2) + '// ' + l[7] + ' (' + stems.join() + ')\n' +
      ''.padEnd(2) + '{\n' +
      ''.padEnd(4) + 'conjZ: \'' + c + '\',\n' +
      ''.padEnd(4) + 'aspect: ' + l[8] + ',\n' +
      ''.padEnd(4) + 'transitivity: ' + l[9] + ',\n' +
      ''.padEnd(4) + 'suffix: \'' + suffix + '\',\n' +
      ''.padEnd(4) + 'endings: [' + '\n' +
      ''.padEnd(0) + temp +
      ''.padEnd(4) + ']' + '\n' +
      ''.padEnd(2) + '},\n';
    return p + (temp ? s : '');
  }, '')
);

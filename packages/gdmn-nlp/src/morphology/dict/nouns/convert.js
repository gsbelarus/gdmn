// @ts-nocheck

/**************************************************************************
*
*
*
*  data file must have unix line endings (LF)
*
*
*
*****************************************************************************/

var fs = require('fs');
var rawFile = fs.readFileSync('./data-all.txt', 'utf-8').replace(/ё/g, 'е');

const rusNounSemCategory = {
  'минск': '[{ semCategory: SemCategory.Place }]',
  'пинск': '[{ semCategory: SemCategory.Place }]',
  'организаци': '[{ semCategory: SemCategory.Organization }]',
  'школ': '[{ semCategory: SemCategory.Organization }]',
  'им': '[{ semCategory: SemCategory.Name }]',
  'назван': '[{ semCategory: SemCategory.Name }]',
  'наименован': '[{ semCategory: SemCategory.Name }]',
  'товар': '[{ semCategory: SemCategory.Good }]',
  'тмц': '[{ semCategory: SemCategory.Good }]'
};

// здесь будем хранить топонимы
// в таком виде:
// { 'МИНСК': true, 'ПИНСК': true }
const geox = {};

const nouns = rawFile.replace(/́/g, '').split('{{ШаблонДемо').reduce( (p, s, idx) => {
    if (s) {
      const rg = /\s*\|имя=сущ ru ([mfn]{1}) (\w+) (.+)\s+.+основа=(.+)(?:\s+.+основа1=(.+))?(?:\s+.+основа2=(.+))?\s.+(?:\s.*)?слова=(?:(?:\[\[)?([^\]]+)(?:\]\])?,?\s?){1}(?:\[\[([^\]]+)\]\],?\s?)?(?:\[\[([^\]]+)\]\],?\s?)?(?:\[\[([^\]]+)\]\],?\s?)?(?:\([^\]]+\))?\s+\}\}/g;
      const groups = rg.exec(s);
      if (groups) {
        const t = [];
        t.push(groups[1]);
        t.push(groups[2]);
        t.push(groups[3]);
        t.push('');
        t.push(groups[7].startsWith(groups[4]) ? groups[7] : (groups[8] && groups[8].startsWith(groups[4]) ? groups[8] : (groups[9] && groups[9].startsWith(groups[4]) ? groups[9] : groups[4])));
        t.push(groups[4]);
        if (groups[5] && t[t.length - 1] !== groups[5]) t.push(groups[5]);
        if (groups[6] && t[t.length - 1] !== groups[6]) t.push(groups[6]);
        while (t.length < 8) t.push('');
        p.push(t);
      } else {
        const rg_m=/\|имя=сущ ru ([mfn]{1}) (\w+) (.+)\s+\|основа=(.+)\s+(?:\|основа1=(.+)\s+)?(?:\|основа2=(.+)\s+)?\}\}\s+([^*:]+)(?: типа:)?\s+\* \[\[([^\]]+)\]\]\s*(?:\* \[\[([^\]]+)\]\]\s*)?(?:\* \[\[([^\]]+)\]\]\s*)?/g;
        const groups_m = rg_m.exec(s);
        if (groups_m) {
          const t_m = [];
          t_m.push(groups_m[1]);
          t_m.push(groups_m[2]);
          t_m.push(groups_m[3]);
          t_m.push(groups_m[7]);
          t_m.push(groups_m[8].startsWith(groups_m[4]) ? groups_m[8] : (groups_m[9] && groups_m[9].startsWith(groups_m[4]) ? groups_m[9] : groups_m[4]));
          t_m.push(groups_m[4]);
          if (groups_m[5] && t_m[t_m.length - 1] !== groups_m[5]) t_m.push(groups_m[5]);
          if (groups_m[6] && t_m[t_m.length - 1] !== groups_m[6]) t_m.push(groups_m[6]);
          while (t_m.length < 8) t_m.push('');
            p.push(t_m);
        } else {
          console.log('Нераспознанный шаблон:');
          console.log(s);
        }
      }
    }
    return p;
  }, [])

const lineByLine = require('n-readlines');

const splitNounString = (s) => {
  let l = s.split(',');
  if (l.length && l[0].slice(-4) === 'NOUN') {
    return l[0].substr(0, l[0].length - 5).replace(/Ё/g, 'Е');
  } else {
    return undefined;
  }
}

const exclusions= ['Litr', 'Infr', 'gen2', 'loc2', 'V-ie', 'V-sh', 'V-ej', 'V-bi', 'V-be', 'V-ey', 'V-oy', 'Coun', 'Dist', 'Abbr', 'Arch'];

const liner = new lineByLine('../dict.opcorpora.txt');
while (line = liner.next()) {
  if (isNaN(parseInt(line.toString(), 10))) continue;

  let prevCase = '';
  let nounBlock = [];

  while ((line = liner.next()) && splitNounString(line.toString())) {
    let spec = line.toString().slice(-4);
    if (exclusions.find( (e) => e === spec )) continue;
    const thisCase = spec.substring(0, 3);
    if (thisCase !== prevCase) nounBlock.push(line.toString());
    prevCase = thisCase;
  }

  if (nounBlock.length !== 12 && nounBlock.length !== 6) continue;

  let w = splitNounString(nounBlock[0]);
  let n = nouns.find( e => e[4].toUpperCase() === w && e.length <= 8 );

  if (!n) continue;

  // МИНСК	NOUN,inan,masc,Geox sing,nomn
  if (nounBlock[0].includes('Geox')) {
    geox[w] = true;
  }

  nounBlock.forEach( (nounLine) => {
    w = splitNounString(nounLine);
    const stem = n.filter( (s, idx) => idx > 4 && idx < 8 && s )
      .sort( (a, b) => b.length - a.length )
      .find( (s) => w.startsWith(s.toUpperCase()) );
    if (stem) {
      n.push(w.substr(stem.length, 64).toLowerCase());
    } else {
      n.push('');
    }
  })
}

/*
fs.writeFileSync('./declension-all.txt', nouns.reduce( (p, l) => p + l.reduce( (s, i) => s + (i ? i : '') + ';', '') + '\n', ''));
*/

fs.writeFileSync('./rusnoun.txt', nouns.reduce(
    (p, l) => {
      let d = l[2].replace('\'', '\\\'');
      let decl;
      if ((l[0] === 'm' || l[0] === 'f') && (l[4].endsWith('а') || l[4].endsWith('я'))) {
        decl = 1;
      } else if (l[0] === 'f' && l[4].endsWith('ь')) {
        decl = 3;
      } else {
        decl = 2;
      }
      const semMeanings = rusNounSemCategory[l[5]];
      let s =
        ''.padEnd(2) + '{\n' +
        ''.padEnd(4) + 'stem: \'' + l[5] + '\',\n' +
        ''.padEnd(4) + 'stem1: \'' + (l[6] ? l[6] : '') + '\',\n' +
        ''.padEnd(4) + 'stem2: \'' + (l[7] ? l[7] : '') + '\',\n' +
        ''.padEnd(4) + 'animate: ' + (l[1] === 'a' ? 'true' : 'false') + ',\n' +
        ''.padEnd(4) + 'gender: ' + (l[0] === 'm' ? 'RusGender.Masc' : (l[0] === 'f' ? 'RusGender.Femn' : 'RusGender.Neut')) + ',\n' +
        ''.padEnd(4) + 'declension: ' + decl + ',\n' +
        ''.padEnd(4) + 'declensionZ: \'' + d + '\',\n' +
        (semMeanings ? ''.padEnd(4) + 'semMeanings: ' + semMeanings + ',\n' : '') +
        (geox[l[4].toUpperCase()] ? ''.padEnd(4) + 'label: NounLabel.Geox,\n' : '') +
        ''.padEnd(2) + '},\n';
    return p + s;
    },
    ''
  )
);

const declZ = nouns.reduce(
  (p, l) => {
    if (p.findIndex( (v) => v === l[2] ) === -1) return [...p, l[2]]
      else return p;
  },
  []
);

fs.writeFileSync('./rusdecl.txt', declZ.reduce(
    (p, l, idx) => {
      let d = l.replace('\'', '\\\'');
      return p + '\'' + d + '\'' + ''.padEnd(9 - d.length) + '|' + ((idx + 1) % 8 === 0 ? '\n' : '')
    },
    ''
  )
);

const done = [];

fs.writeFileSync('./rusdeclend.txt', nouns.reduce(
    (p, l) => {
      let d = l[2].replace('\'', '\\\'');

      const signature = l[1] +  l[0] + d;

      if (done.find( s => s === signature)) {
        return p;
      }

      done.push(signature);

      let s =
        ''.padEnd(2) + '{\n' +
        ''.padEnd(4) + 'animate: ' + (l[1] === 'a' ? 'true' : 'false') + ',\n' +
        ''.padEnd(4) + 'gender: ' + (l[0] === 'm' ? 'RusGender.Masc' : (l[0] === 'f' ? 'RusGender.Femn' : 'RusGender.Neut')) + ',\n' +
        ''.padEnd(4) + 'declensionZ: \'' + d + '\',\n' +
        ''.padEnd(4) + 'singular: [' + l.reduce( (ep, e, ei) => ei > 7 && ei < 13 ? ep + '\'' + e + '\', ' : (ei === 13 ? ep + '\'' + e + '\'' : ep ), '') + '],\n' +
        ''.padEnd(4) + 'plural: [' + l.reduce( (ep, e, ei) => ei > 13 && ei < 19 ? ep + '\'' + e + '\', ' : (ei === 19 ? ep + '\'' + e + '\'' : ep ), '') + ']\n' +
        ''.padEnd(2) + '},\n';
      return p + s;
    },
    ''
  )
);

/*
fs.writeFileSync('./rusnounslist.txt', nouns.reduce(
  (p, n) => {
    return p + n[4] + ',';
  },
  ''
)
);
*/
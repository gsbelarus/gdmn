// @ts-nocheck

/*
  data file must have unix line endings (LF)
*/

var fs = require('fs');
var rawFile = fs.readFileSync('./data-all.txt', 'utf-8').replace(/ё/g, 'е');

const adjs = rawFile.replace(/́/g, '').split('{{ШаблонДемо').reduce( (p, s, idx) => {
  if (s) {
    const rg = /\s*\|имя=прил ru (.+)\s(?:\|основа[ ]?=[ ]?(.+)\s){1}(?:\|основа1[ ]?=[ ]?(.+)\s)?(?:\|основа2[ ]?=[ ]?(.+)\s)?(?:\|основа3[ ]?=[ ]?(.+)\s)?(?:\|основа4[ ]?=[ ]?(.+)\s)?(?:\|основа5[ ]?=[ ]?(.+)\s)?\|слова[ ]?=[ ]?(?:\[\[([^\]]+){1}\]\](?:[ ]*\([^)]+\))?[, ]{0,2}){1}(?:\[\[([^\]]+){1}\]\](?:[ ]*\([^)]+\))?[, ]{0,2})?(?:\[\[([^\]]+){1}\]\](?:[ ]*\([^)]+\))?[, ]{0,2})?(?:\[\[([^\]]+){1}\]\](?:[ ]*\([^)]+\))?[, ]{0,2})?(?:\[\[([^\]]+){1}\]\](?:[ ]*\([^)]+\))?[, ]{0,2})?\s\}\}/g;
    const groups = rg.exec(s);
    if (groups) {
      const t = [];
      while (t.length < 7) {
        t.push(groups[t.length + 1] ? groups[t.length + 1] : '');
      }
      t.push(groups.filter( (g, idx) => idx >= 8 && idx <= 10 ).find( w => w && w.startsWith(t[1]) ));
      p.push(t);
      console.log(t[7]);
    }
  }
  return p;
}, []);

const lineByLine = require('n-readlines');

const splitAdjfString = (s) => {
  let l = s.replace(/\s+/g, ',').split(',').map( s => s.trim() );
  if (l.length && l.find( e => e === 'ADJF' )) {
    return l[0].replace(/Ё/g, 'Е').trim();
  } else {
    return undefined;
  }
};

const exclusions= ['Litr', 'Infr', 'gen2', 'loc2', 'V-ie', 'V-sh', 'V-ej', 'V-bi', 'V-be', 'V-ey', 'V-oy', 'Coun', 'Dist', 'Abbr', 'Arch'];

const liner = new lineByLine('../dict.opcorpora.txt');
while (line = liner.next()) {
  if (isNaN(parseInt(line.toString(), 10))) continue;

  let adjfBlock = [];

  while ((line = liner.next()) && splitAdjfString(line.toString())) {
    let spec = line.toString().slice(-4);
    if (exclusions.find( (e) => e === spec )) continue;
    adjfBlock.push(line.toString());
  }

  if (!adjfBlock.length) continue;

  let w = splitAdjfString(adjfBlock[0]);
  let n = adjs.find( (e) => e[7].toUpperCase() === w && e.length <= 8 );

  if (!n) continue;

  console.log(w);

  n[8] = [];

  adjfBlock.forEach( (adjfLine) => {
    w = splitAdjfString(adjfLine);
    const stem = n.filter( (s, idx) => idx > 0 && idx < 7 && s )
      .sort( (a, b) => b.length - a.length )
      .find( (s) => w.startsWith(s.toUpperCase()) );
    if (stem) {
      n[8].push({ w, ending: w.substr(stem.length, 64).toLowerCase(), morphSigns: adjfLine.replace(/\s+/g, ',').split(',').map( s => s.trim() ) });
    }
  })
}

fs.writeFileSync('./rusdeclend.txt', adjs.reduce( (p, l, idx) => {
  if (adjs.find( (a, idx2) => idx2 < idx && a[0] === l[0] )) {
    return p;
  }

  const d = l[0].replace('\'', '\\\'');
  // основы в исходных данных могут повторяться. отсеиваем повторы
  // и сортируем по длине. от длинных к коротким
  const stems = l.filter( (v, idx) => idx > 0 && idx < 7 )
    .filter( (v, idx, self) => self.indexOf(v) === idx && v )
    .sort( (a, b) => b.length - a.length );
  let temp = undefined;
  if (l[8]) {
    temp = l[8].reduce( (p, e) => {
      const singular = e.morphSigns.find( s => s === 'sing' ) ? 'true' : 'false';
      let gender;
      if (singular === 'true') {
        gender = ''.padEnd(8) + 'gender: ' +
          (e.morphSigns.find( s => s === 'masc' ) ? 'RusGender.Masc' : (e.morphSigns.find( s => s === 'femn' ) ? 'RusGender.Femn' : 'RusGender.Neut')) + ',\n';
      } else {
        gender = '';
      }
      let c = '';
      if (e.morphSigns.find( s => s === 'nomn' )) c = 'RusCase.Nomn';
      if (e.morphSigns.find( s => s === 'gent' )) c = 'RusCase.Gent';
      if (e.morphSigns.find( s => s === 'datv' )) c = 'RusCase.Datv';
      if (e.morphSigns.find( s => s === 'accs' )) c = 'RusCase.Accs';
      if (e.morphSigns.find( s => s === 'ablt' )) c = 'RusCase.Ablt';
      if (e.morphSigns.find( s => s === 'loct' )) c = 'RusCase.Loct';
      let anim = '';
      if (e.morphSigns.find( s => s === 'anim' )) anim = ''.padEnd(8) + 'animate: true,\n';
      if (e.morphSigns.find( s => s === 'inan' )) anim = ''.padEnd(8) + 'animate: false,\n';
      return (
        p +
        ''.padEnd(6) + '// ' + e.w.toLowerCase() + '\n' +
        ''.padEnd(6) + '{' + '\n' +
        ''.padEnd(8) + 'ending: \'' + e.ending + '\',\n' +
        ''.padEnd(8) + 'c: '  + c + ',\n' +
        ''.padEnd(8) + 'singular: '  + singular + ',\n' +
        gender +
        anim +
        ''.padEnd(6) + '},\n');
    }, '');
  }

  const s =
    ''.padEnd(2) + '// ' + l[7] + ' (' + stems.join(',') + ')\n' +
    ''.padEnd(2) + '{\n' +
    ''.padEnd(4) + 'declensionZ: \'' + d + '\',\n' +
    ''.padEnd(4) + 'endings: ' + '\n' +
    ''.padEnd(6) + '[' + '\n' +
    (temp ? temp : '') +
    ''.padEnd(6) + ']' + '\n' +
    ''.padEnd(2) + '},\n';

  return p + s;
}, ''));

fs.writeFileSync('./rusadjf.txt', adjs.reduce( (p, l) => {
  const d = l[0].replace('\'', '\\\'');
  const stems = l.filter( (v, idx) => idx > 0 && idx < 7 ).filter( (v, idx, self) => self.indexOf(v) === idx ); // основы в исходных данных могут повторяться. отсеиваем повторы
  if (typeof l[8] !== 'undefined' && l[8].length > 0) {
    let category = 'RusAdjectiveCategory.Rel';
    if (l[8][0].morphSigns.find( s => s === 'Qual' )) category = 'RusAdjectiveCategory.Qual';
    if (l[8][0].morphSigns.find( s => s === 'Poss' )) category = 'RusAdjectiveCategory.Poss';
    if (l[8][0].morphSigns.find( s => s.startsWith('Apro') )) category = 'RusAdjectiveCategory.Pron';
    let s =
      ''.padEnd(2) + '// ' + l[7] + '\n' +
      ''.padEnd(2) + '{\n' +
      ''.padEnd(4) + 'stem: \'' + stems[0] + '\',\n' +
      ''.padEnd(4) + 'stem1: \'' + (stems[1] ? stems[1] : '') + '\',\n' +
      ''.padEnd(4) + 'stem2: \'' + (stems[2] ? stems[2] : '') + '\',\n' +
      ''.padEnd(4) + 'category: ' + category + ',\n' +
      ''.padEnd(4) + 'declensionZ: \'' + d + '\'\n' +
      ''.padEnd(2) + '},\n';
    return p + s;
  }
  return p;
}, '')
);

fs.writeFileSync('./decladj-all.txt', adjs.reduce(
    (p, v) => {
      return p + v[0] + ';' + v[7] + '\n';
    },
    ''
  )
);

fs.writeFileSync('./rusadjslist.txt', adjs.reduce(
    (p, v) => {
      return p + v[7] + ',';
    },
    ''
  )
);

let counter = 0;

fs.writeFileSync('./rusdecladjs.txt', adjs.reduce(
    (p, v, idx) => {
      if (adjs.find( (a, idx2) => idx2 < idx && a[0] === v[0] )) {
        return p;
      }

      let d = v[0].replace('\'', '\\\'');
      counter = counter + 1;
      return p + '\'' + d + '\'' + ''.padEnd(10 - d.length) + '|' + (counter % 6 === 0 ? '\n' : '')
    },
    ''
  )
);

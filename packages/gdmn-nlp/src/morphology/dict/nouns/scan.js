const lineByLine = require('n-readlines');

const nouns = [];
const readerNouns = new lineByLine('./noun-m.txt');
var line;
while (line = readerNouns.next()) {
  nouns.push(line.toString().toUpperCase().split(';'));
}

const splitNounString = (s) => {
  let l = s.split(',');
  if (l.length && l[0].slice(-4) === 'NOUN') {
    return l[0].substr(0, l[0].length - 5).replace(/Ё/g, 'Е');
  } else {
    return undefined;
  }
}

const exclusions= ['Litr', 'Infr', 'gen2', 'loc2', 'V-ie', 'V-sh', 'V-ej', 'V-bi', 'V-be', 'V-ey', 'V-oy'];

const liner = new lineByLine('./dict.opcorpora.txt');
while (line = liner.next()) {
  if (!isNaN(parseInt(line.toString(), 10)) && (line = liner.next())) {
    let w, n;
    if ((w = splitNounString(line.toString())) && (n = nouns.find( (e) => e[0] === w && e.length <= 4 ))) {
      for (let j = 0; j < 12 && line && w; j++) {
        let spec = line.toString().slice(-4);
        if (exclusions.find( (e) => e === spec )) {
          j--;
        } else {
          let stem = n.find( (s, idx) => idx > 0 && idx < 4 && s && w.startsWith(s) );
          if (stem) {
            n.push(w.substr(stem.length, 64));
          } else {
            n.push('-');
          }
        }
        if(line = liner.next()) {
          w = splitNounString(line.toString());
        }
      }
    }
  }
}

const newNouns = nouns.reduce( (p, n) => p + n.join(';') + ';'.repeat(n.length < 16 ? 16 - n.length : 0) + '\n', '');

var fs = require('fs');
fs.writeFileSync('./test.txt', newNouns);

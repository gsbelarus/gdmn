export function isRusConsonant(s: string, idx: 'first' | 'last' | 'whole' = 'whole'): boolean {
  const RusConsonants = 'БВГДЖЗЙКЛМНПРСТФХЦЧШЩ';
  switch (idx) {
    case 'whole':
      return RusConsonants.indexOf(s.toUpperCase()) !== -1;
    case 'last':
      return RusConsonants.indexOf(s.slice(-1).toUpperCase()) !== -1;
    default:
      return RusConsonants.indexOf(s.slice(0, 1).toUpperCase()) !== -1;
  }
}
// node test.js : checks Levenshtein.gs against hand-verified values
const fs = require('fs'), vm = require('vm');
const c = {}; vm.createContext(c);
vm.runInContext(fs.readFileSync(__dirname + '/Levenshtein.gs', 'utf8'), c);
let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  if (!ok) console.log('FAIL', name, JSON.stringify(got), '!=', JSON.stringify(want));
};
const r3 = x => Math.round(x * 1000) / 1000;
eq('kitten', c.LEVENSHTEIN('kitten', 'sitting'), 3);
eq('john', c.LEVENSHTEIN('John Smith', 'Jon Smith'), 1);
eq('acme case+dot', c.LEVENSHTEIN('Acme Pty Ltd', 'ACME Pty. Ltd'), 1);
eq('same', c.LEVENSHTEIN('Initech', 'Initech'), 0);
eq('globex', c.LEVENSHTEIN('Globex', 'Globex Corporation'), 12);
eq('empty', c.LEVENSHTEIN('', 'abc'), 3);
eq('accent', c.LEVENSHTEIN('José', 'Jose'), 1);
eq('number', c.LEVENSHTEIN(123, 124), 1);
eq('sim kitten', r3(c.SIMILARITY('kitten', 'sitting')), 0.571);
eq('sim john', r3(c.SIMILARITY('John Smith', 'Jon Smith')), 0.9);
eq('sim both empty', c.SIMILARITY('', ''), 1);
eq('range', c.LEVENSHTEIN([['kitten'], ['Initech'], ['']], [['sitting'], ['Initech'], ['']]), [[3], [0], ['']]);
eq('range vs scalar', c.LEVENSHTEIN([['abc'], ['abd']], 'abc'), [[0], [1]]);
let threw = false; try { c.LEVENSHTEIN([['a'], ['b']], [['a']]); } catch (e) { threw = true; }
eq('size mismatch throws', threw, true);
const list = [['Initech'], ['Umbrella Corp'], ['Acme Pty Ltd'], ['Globex Corporation'], ['']];
const bm = c.BESTMATCH([['Acme Pty. Ltd.'], ['Globex Corp'], ['Inytech'], ['']], list);
eq('best names', bm.map(r => r[0]), ['Acme Pty Ltd', 'Globex Corporation', 'Initech', '']);
eq('best scores', bm.map(r => r[1] === '' ? '' : r3(r[1])), [0.857, 0.611, 0.857, '']);
eq('best scalar', c.BESTMATCH('Inytech', list)[0][0], 'Initech');
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

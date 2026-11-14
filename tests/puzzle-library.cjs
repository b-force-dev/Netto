// Draai met node tests/puzzle-library.cjs; geen browser of netwerk nodig.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const core = fs.readFileSync(path.join(root, 'js/core.js'), 'utf8');
let language = 'en';
const context = vm.createContext({window:{NettoI18n:{locale:()=>language}}, selectedDifficulty:'easy',
  readStatsStorage:()=>({}), getSavedLibraryPlays:()=>({}), libraryPuzzles:[],
  LIBRARY_DIFFICULTY_LABEL:{easy:'Easy'}, statsCopy:(nl,en)=>language==='nl'?nl:en});
function sourceSlice(source, start, end) {
  const a=source.indexOf(start), b=source.indexOf(end,a);
  assert.ok(a>=0 && b>a, 'Missing source boundaries'); return source.slice(a,b);
}
vm.runInContext(sourceSlice(core,'  function parseFormattedNumber','  function removeToastAfter'), context);
for (const [lang,examples] of [
  ['en', [['1500',1500],['1,000',1000],['1.25',1.25],['1.5k',NaN],['2m',NaN],['1,2',NaN]]],
  ['nl', [['1500',1500],['1.000',1000],['1,25',1.25],['1.234,5',1234.5],['1,5k',NaN],['1.2',NaN]]]
]) {
  language=lang;
  for(const [text,expected] of examples) assert.equal(context.parseFormattedNumber(text),expected,lang+': '+text);
  for(const text of ['', '12abc', '1k2', '1..2', 'Infinity', '-2']) assert.ok(Number.isNaN(context.parseFormattedNumber(text)),text);
}
const library = fs.readFileSync(path.join(root,'js/library.js'),'utf8');
vm.runInContext(sourceSlice(library,'const LIBRARY_VIEW_KEY','function openLibraryPuzzle'),context);
context.libraryPuzzles=[{id:'a',difficulty:'easy'},{id:'b',difficulty:'easy'},{id:'c',difficulty:'hard'}];
const plays={a:{factor:1},library_b:{factor:2}};
const summary=context.libraryLevelSummary('easy',plays);
assert.equal(summary.total,2); assert.equal(summary.played,2); assert.equal(summary.average,1.5); assert.equal(summary.accuracy,75);
assert.equal(context.nextUnplayedLibraryPuzzle('a',plays).id,'c');
assert.equal(context.libraryFactorOf(null),null); assert.equal(context.libraryFactorOf({factor:'bad'}),null);
console.log('Localized numbers, strict validation, legacy progress, per-level accuracy and next puzzle passed.');

vm.runInContext(sourceSlice(core,'  function numbersMatch','  function showEquationNotice'),context);
assert.equal(context.numbersMatch(0.1+0.2,0.3),true);
assert.equal(context.numbersMatch(9007199254740990,9007199254740991),false);
assert.equal(context.validWholeAnswers([1.5,2,3]),true);
assert.equal(context.validWholeAnswers([0,2,3]),false);

// Regressies: oude ingebakken foto's, lokale Commons-miniaturen en credits.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const context = { window: {}, URL, document: { baseURI: 'http://localhost:8873/' } };
vm.createContext(context);
for (const file of ['data/netto_fotos.js', 'data/netto_frontend_puzzles.js', 'js/photo-credits.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context);
}
const photo = {url:'fotos/assets/example.jpg', pagina:'https://commons.wikimedia.org/wiki/File:Example.jpg', maker:'Example', licentie:'CC BY 4.0'};
context.window.NETTO_FOTOS.Test = photo;
context.puzzle = {q1_label:'Test', photo:{...photo, url:'https://example.com/old.jpg', vraag:1}};
assert.equal(vm.runInContext('geldigePuzzelfoto(puzzle).url', context), photo.url);
delete context.window.NETTO_FOTOS.Test;
assert.equal(vm.runInContext('geldigePuzzelfoto(puzzle)', context), null);
const credits = vm.runInContext('verzamelFotocredits()', context);
const pages = new Set(credits.map(f => f.pagina));
for (const [question, f] of Object.entries(context.window.NETTO_FOTOS)) {
  assert.ok(pages.has(f.pagina), 'Ontbrekende credit: ' + question);
  if (f.url.startsWith('fotos/assets/')) assert.ok(fs.existsSync(f.url), f.url);
}
const overrides = JSON.parse(fs.readFileSync('fotos/publieke_fotos.json', 'utf8'));
for (const [q, f] of Object.entries(overrides)) {
  if (f === null) assert.equal(context.window.NETTO_FOTOS[q], undefined, q);
  else assert.equal(context.window.NETTO_FOTOS[q].url, f.url, q);
}
console.log('Actuele fotobank, afkeuringen, lokale bestanden en volledige credits geslaagd.');

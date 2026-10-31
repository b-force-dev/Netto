// One-time conversion. Private content stays in an ignored local folder and is
// uploaded to Supabase, never bundled or included in a public seed migration.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const c = {window:{}};
const dataFile = path.join(root,'data/netto_frontend_puzzles.js');
vm.runInNewContext(fs.readFileSync(dataFile,'utf8'),c);
vm.runInNewContext(fs.readFileSync(path.join(root,'data/netto_fotos.js'),'utf8'),c);
const data=c.window.NETTO_REBUILT_PUZZLES;
const privateDir=path.join(root,'.private');
fs.mkdirSync(privateDir,{recursive:true});
const backup=path.join(privateDir,'daily-content-backup.json');
if (data.daily.length && !fs.existsSync(backup)) fs.writeFileSync(backup,JSON.stringify(data,null,2));
const saved=JSON.parse(fs.readFileSync(backup,'utf8'));
for (const file of ['netto_bronnen.js','netto_bronnen_en.js','netto_translations_en.js','netto_race_pool.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(root,'data',file),'utf8'),c);
}
const entries=Object.entries(saved.daily_review).map(([label,details])=>{
  const puzzle=saved.daily.find(p=>[1,2,3].some(i=>p['q'+i+'_label']===label));
  const index=puzzle?[1,2,3].find(i=>puzzle['q'+i+'_label']===label):null;
  let photo=c.window.NETTO_FOTOS[details.original||label];
  if (puzzle?.photo?.vraag===index) photo=puzzle.photo;
  if (/lifeboats.*Titanic/i.test(label)) photo={
    url:'fotos/assets/media-011-rms-titanic-3-jpg.jpg',
    pagina:'https://commons.wikimedia.org/wiki/File:RMS_Titanic_3.jpg',
    maker:'Francis Godolphin Osbourne Stuart',licentie:'Public domain'};
  return {label,details:{...details,category:puzzle?.categories?.[index-1],photo}};
});
fs.writeFileSync(path.join(privateDir,'daily-metadata.json'),JSON.stringify(entries));
const normalize=text=>String(text||'').toLowerCase().replace(/\b(about|approximately|roughly)\b/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const dailyLabels=new Set(entries.flatMap(({label,details})=>[normalize(label),normalize(details.original)]));
const dailyIds=new Set(saved.daily.flatMap(p=>p.question_ids||[]));
const sourceTexts=new Set(entries.flatMap(({details})=>[details.uitleg,details.uitleg_en]).filter(Boolean));
for (const [label,details] of Object.entries(c.window.NETTO_BRONNEN)) {
  if (dailyLabels.has(normalize(label))) {
    if (details.uitleg) sourceTexts.add(details.uitleg);
    delete c.window.NETTO_BRONNEN[label];
  }
}
for (const text of sourceTexts) {
  delete c.window.NETTO_BRONNEN_EN[text];
  delete c.window.NETTO_TRANSLATIONS_EN[text];
}
const before=c.window.NETTO_RACE_POOL.length;
c.window.NETTO_RACE_POOL=c.window.NETTO_RACE_POOL.filter(p=>
  !(p.question_ids||[]).some(id=>dailyIds.has(id)) &&
  ![p.q1_label,p.q2_label,p.q3_label].some(label=>dailyLabels.has(normalize(label))));
for (const [file,name] of [['netto_bronnen.js','NETTO_BRONNEN'],['netto_bronnen_en.js','NETTO_BRONNEN_EN'],
  ['netto_translations_en.js','NETTO_TRANSLATIONS_EN'],['netto_race_pool.js','NETTO_RACE_POOL']]) {
  fs.writeFileSync(path.join(root,'data',file),'window.'+name+' = '+JSON.stringify(c.window[name])+';\n');
}
data.daily=[];
data.daily_review={};
fs.writeFileSync(dataFile,'window.NETTO_REBUILT_PUZZLES = '+JSON.stringify(data)+';\n');
console.log('Public Daily data removed; private editorial backup preserved. Removed '+(before-c.window.NETTO_RACE_POOL.length)+' overlapping race combinations.');

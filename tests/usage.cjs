const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('js/usage.js', 'utf8');
function browser(options = {}) {
  const calls = [], storage = new Map(), listeners = {};
  const window = { addEventListener:(name, cb) => { listeners[name] = cb; },
    matchMedia:() => ({matches:true}),
    nettoUsageClient:{rpc:(name, args) => { calls.push({name,args}); return Promise.resolve(options.error ? {error:true} : {}); }} };
  const context = { window, navigator:{onLine:true,...options.navigator},
    location:{protocol:'https:',hostname:options.host || 'game.example'},
    document:{readyState:'loading',referrer:'https://search.example/private?q=secret',addEventListener:() => {}},
    localStorage:{getItem:key => storage.get(key) || null, setItem:(key,value) => {
      if (options.storageBlocked) throw Error('blocked'); storage.set(key,value);
    }}, crypto:{randomUUID:() => '32b204ee-420d-45c3-a364-a236c930ba91'},
    URL, Intl, Date, Promise, setTimeout:fn => fn() };
  vm.runInNewContext(source, context);
  return {calls,window,listeners,storage};
}
(async () => {
  for (const options of [{host:'localhost'},{host:'127.0.0.1'},{host:'[::1]'},
    {navigator:{doNotTrack:'1'}},{navigator:{globalPrivacyControl:true}},
    {navigator:{onLine:false}},{storageBlocked:true}]) {
    const b = browser(options); b.window.nettoTrack('visit');
    assert.equal(b.calls.length,0);
  }
  const b = browser();
  b.window.nettoTrack('daily_finish',{mode:'daily',once:'today',answer:'never sent'});
  b.window.nettoTrack('daily_finish',{mode:'daily',once:'today'});
  b.window.nettoTrack('visit');
  assert.equal(b.calls.length,2);
  assert.equal(b.calls[0].args.p_referrer,'search.example');
  assert.equal(b.calls[0].args.p_device,'mobile');
  assert.equal(b.calls[0].args.p_language,'en', 'A first visit uses English');
  const dutch = browser(); dutch.storage.set('netto_language', 'nl');
  dutch.window.nettoTrack('visit');
  assert.equal(dutch.calls[0].args.p_language, 'nl');
  assert.equal(b.calls[0].args.p_visitor_id,b.calls[1].args.p_visitor_id);
  assert(!JSON.stringify(b.calls).includes('secret'));
  assert(!JSON.stringify(b.calls).includes('answer'));
  b.window.nettoTrack('unknown'); assert.equal(b.calls.length,2);
  const early = browser(); const client = early.window.nettoUsageClient;
  early.window.nettoUsageClient = null;
  early.window.nettoTrack('daily_start',{mode:'daily'});
  early.window.nettoUsageClient = client;
  early.listeners.load();
  assert.deepEqual(early.calls.map(c => c.args.p_event),['visit','daily_start']);
  const offline = browser({error:true}); offline.window.nettoTrack('visit');
  await new Promise(resolve => setImmediate(resolve));
  offline.window.nettoTrack('visit'); assert.equal(offline.calls.length,1);
  console.log('Usage privacy, identity, deduplication, startup and failure checks passed.');
  // Sluit expliciet af: een open handle hield de test anders minutenlang vast.
  process.exit(0);
})().catch(error => { console.error(error); process.exit(1); });

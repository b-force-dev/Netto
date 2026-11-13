// Verbindingsregressies: dubbele joins, late callbacks en herstel na load/fouten.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../js/race.js'), 'utf8');
const channels = [], timers = new Map();
let nextTimer = 0, onLoad, removes = 0;
const client = {
  channel() {
    const channel = {on() {return this;}, subscribe(callback) {this.callback=callback;return this;}};
    channels.push(channel); return channel;
  },
  async removeChannel(channel) {removes++; channel.callback('CLOSED');}
};
const context = vm.createContext({
  document:{readyState:'loading'}, supabaseClient:null, RACE_CLIENT_ID:'test',
  nettoWhenOnline:callback=>{onLoad=callback;}, publishOpenRaceEntry(){}, renderNettoOpenGames(){},
  setTimeout(callback,ms){const id=++nextTimer;timers.set(id,{callback,ms});return id;},
  clearTimeout(id){timers.delete(id);}
});
vm.runInContext('let raceLobbyChannel=null,raceLobbyReady=false,raceLobbyFout=false,raceLobbyPublishedSignature="";'+source.slice(source.indexOf('  let raceLobbyRetryTimer'),source.indexOf('  function openRaceEntries()')),context);
const run = code => vm.runInContext(code,context);
const flush = async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
(async()=>{
  run('ensureRaceLobby();ensureRaceLobby()');
  assert.equal(channels.length,0); assert.equal(typeof onLoad,'function');
  context.supabaseClient=client; onLoad();
  run('ensureRaceLobby();ensureRaceLobby()');
  assert.equal(channels.length,1); assert.equal(removes,0);
  channels[0].callback('CHANNEL_ERROR'); await flush();
  assert.equal(removes,1); assert.equal(timers.size,1);
  assert.equal([...timers.values()][0].ms,1000);
  run('retryRaceLobby()'); assert.equal(channels.length,2);
  channels[0].callback('SUBSCRIBED'); assert.equal(run('raceLobbyReady'),false);
  channels[1].callback('TIMED_OUT'); await flush();
  assert.equal([...timers.values()][0].ms,2000);
  run('retryRaceLobby()'); channels[2].callback('SUBSCRIBED');
  assert.equal(run('raceLobbyReady'),true); assert.equal(run('raceLobbyFout'),false);
  assert.equal(run('raceLobbyRetryAttempt'),0);
  console.log('PASS: loadherstel, één join, oude callbacks genegeerd, geen CLOSED-recursie, backoff en handmatige retry.');
})().catch(error=>{console.error(error);process.exitCode=1;});

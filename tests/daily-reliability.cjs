const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const core = fs.readFileSync(require('node:path').join(__dirname, '../js/core.js'), 'utf8');
function source(name) {
  let start = core.indexOf('  function ' + name + '(');
  if (start < 0) start = core.indexOf('  async function ' + name + '(');
  const end = core.indexOf('\n  }', start + 1) + 4;
  assert.ok(start >= 0 && end > start, name);
  return core.slice(start, end);
}
let plays = {
  '2026-10-29': {factor:2, playedAt:'2026-10-31T09:00:00Z'}, // archive
  '2026-10-30': {factor:1.2, playedAt:'2026-10-30T20:00:00Z'},
  '2026-10-31': {factor:1.1, playedAt:'2026-10-31T10:00:00Z'},
  '2026-10-28': {factor:1.5}, // no evidence of on-time play
};
const c = vm.createContext({Intl,Date,Map,Set,Number, TODAY_STR:'2026-10-31',
  DAILY_PUZZLES:[], getLocalPlays:()=>plays,
  localStorage:{getItem:()=>null,setItem(){}},
  window:{},document:{getElementById:()=>null},
  STATS_MAX_STREAK_KEY:'test-streak',STATS_BUCKETS:[{},{},{},{},{}],
});
for (const name of ['nettoDagSleutel','isStatsDateKey','statsDateSerial','statsDateKeyFromSerial',
  'safeStatsInteger','isOnTimeDailyPlay','getDailyStatsEntries','statsTrailingStreak',
  'statsLongestStreak','statsBucketIndex','getDailyStatsSnapshot','getLocalStreak','getPlayedDailyDates']) {
  vm.runInContext(source(name), c);
}
assert.equal(c.getLocalStreak(),2);
assert.equal(c.getDailyStatsSnapshot().bestStreak,2);
assert.equal(c.getDailyStatsEntries().length,4,'archive results remain in statistics');
assert.deepEqual([...c.getPlayedDailyDates()],['2026-10-30','2026-10-31']);
assert.equal(c.isOnTimeDailyPlay('2026-10-31',{playedAt:'invalid'}),false);
assert.equal(c.isOnTimeDailyPlay('2026-07-01',{playedAt:'2026-06-30T23:30:00Z'}),true,'BST boundary');
assert.equal(c.isOnTimeDailyPlay('2026-10-31',{playedAt:'2026-11-01T00:01:00Z'}),false);
delete plays['2026-10-31'];
assert.equal(c.getLocalStreak(),1,'yesterday remains active');
plays={'2026-10-30':{factor:1,playedAt:'2026-10-31T10:00:00Z'}};
assert.equal(c.getLocalStreak(),0,'archive cannot create a streak');
assert.ok(!core.includes('How people guessed') && !core.includes('const demos ='));
assert.match(core, /finally\s*\{\s*refreshLeaderboardAfterDailySync\(\);/);
console.log('Daily reliability checks passed: archive exclusion, London dates, retained statistics, demo removal.');

(async () => {
  let calls = 0;
  const list = {innerHTML:'',setAttribute(){},appendChild(){}};
  Object.assign(c, {dailySyncAfgerond:false,leaderboardRequestId:0,
    leaderboardSelectedDate:'2026-10-31',currentLbTab:'today',currentUser:null,
    statsCopy:(nl,en)=>en,werkLeaderboardDagkopBij(){},leaderboardUitnodiging(){},
    supabaseClient:{rpc:async()=>{calls++;return {data:[],error:null};}},
    document:{getElementById:()=>list,createElement:()=>({})},console,
  });
  vm.runInContext(source('renderLeaderboard'),c);
  await c.renderLeaderboard();
  assert.equal(calls,0,'no RPC or unavailable error during pending sync');
  c.dailySyncAfgerond=true;
  await c.renderLeaderboard();
  assert.equal(calls,1,'board can load as soon as sync completes');
  let uploaded=[];
  plays={
    '2026-10-30':{factor:1,playedAt:'2026-10-31T10:00:00Z'},
    '2026-10-31':{factor:1.2,playedAt:'2026-10-31T10:00:00Z',g1:1,g2:2,g3:3},
  };
  Object.assign(c,{currentUser:{id:'test-user'},dailyEditionReady:true,
    syncPlayToCloud:async date=>{uploaded.push({puzzle_date:date});}});
  vm.runInContext(source('stuurLokaleScoresOp'),c);
  await c.stuurLokaleScoresOp();
  assert.equal(uploaded.length,1);
  assert.equal(uploaded[0].puzzle_date,'2026-10-31');
  console.log('Pending leaderboard sync and archive-upload exclusion passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});

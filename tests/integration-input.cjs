// Verify the Daily boundary before any equation check or server request.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const core = fs.readFileSync('js/core.js', 'utf8');
const race = fs.readFileSync('js/race.js', 'utf8');
const handlers = [];
const keys = vm.createContext({
  document: { getElementById: () => ({ addEventListener: (_, fn) => handlers.push(fn) }) },
  bindWholeNumberInput: () => {}, updateDailyDerivedInput: () => {}
});
vm.runInContext(core.slice(core.indexOf('  function initInputs()'), core.indexOf('  function scoreVraag')), keys);
vm.runInContext(race.slice(race.indexOf('  function nettoNumberKeydown'), race.indexOf('  function raceDurationText')), keys);
keys.initInputs();
for (const key of ['.', ',', 'k', 'm', 'b', 'g']) {
  const event = { key, preventDefault: () => assert.fail(`Blocked typed ${key}`) };
  handlers.forEach(handler => handler(event));
  keys.nettoNumberKeydown(event, {}, () => assert.fail('Unexpected submit'));
}
let locale = 'en', values, notices = [];
const context = vm.createContext({
  window: { NettoI18n: { locale: () => locale } },
  dailySubmissionBusy: false,
  document: { getElementById: id => ({ value: values[Number(id.slice(1)) - 1] }) },
  statsCopy: (nl, en) => locale === 'nl' ? nl : en,
  showNoticeToast: message => notices.push(message),
  isEquationRequired: () => { throw new Error('accepted-input'); }
});
vm.runInContext(core.slice(core.indexOf('  function parseFormattedNumber'), core.indexOf('  function removeToastAfter')), context);
vm.runInContext(core.slice(core.indexOf('  async function checkAnswers'), core.indexOf('  function PUZZEL_ECHT')), context);
(async () => {
  for (const lang of ['en', 'nl']) {
    locale = lang;
    for (const invalid of [lang === 'en' ? '1.25' : '1,25', 'garbage', '0', '-1', '9007199254740992']) {
      values = [invalid, '2', '3']; notices = [];
      await context.checkAnswers();
      assert.equal(notices.length, 1, `${lang}: ${invalid} must stop before the server`);
      assert.match(notices[0], lang === 'en' ? /whole number/ : /heel getal/);
    }
    for (const valid of ['1500', lang === 'en' ? '1,500' : '1.500', lang === 'en' ? '1.5k' : '1,5k']) {
      values = [valid, '2', '3'];
      await assert.rejects(context.checkAnswers(), /accepted-input/);
    }
  }
  console.log('Daily rejects decimals and unsafe input before submission; localized integer shorthand passes.');
})().catch(error => { console.error(error); process.exitCode = 1; });

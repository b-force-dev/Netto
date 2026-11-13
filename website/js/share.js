// Netto frontend module: resultaten delen.
// Eén plek voor alle deelacties. Elke modus bouwt zijn eigen tekst (spoilervrij,
// in de taal van de speler); het versturen gebeurt overal hetzelfde:
//   1. op telefoon/tablet het deelmenu van het systeem (navigator.share),
//   2. anders het klembord, met een melding,
//   3. als laatste een prompt waaruit je zelf kunt kopiëren.
// Een gesloten deelmenu (AbortError) is geen fout en blijft stil.
// Loaded as a classic script so the existing shared global scope stays intact.
(() => {
  const copy = (nl, en) => (typeof statsCopy === 'function' ? statsCopy(nl, en) : en);

  // ===== Links =====
  // De hoofdmap van het spel, ook vanaf een routepagina als /daily/26-11-12/.
  // Lokaal heeft een vriend niets aan localhost: dan het gepubliceerde adres.
  function siteRoot() {
    try {
      const here = new URL(window.location.href);
      const local = here.protocol === 'file:' || ['localhost', '127.0.0.1', '0.0.0.0', '[::1]'].includes(here.hostname);
      if (local) return GEPUBLICEERD;
      const base = window.NettoRoutes?.base;
      return base ? base.origin + base.pathname : speelAdres();
    } catch (_) {
      return GEPUBLICEERD;
    }
  }
  // route 'daily/26-11-12' -> https://…/daily/26-11-12/
  function link(route) { return siteRoot() + (route ? route.replace(/^\/+|\/+$/g, '') + '/' : ''); }
  function dailyLink(date) { return link('daily/' + String(date).slice(2)); }

  // ===== Tekstbouwstenen =====
  const accuracy = factor => Math.max(0, Math.min(100, Math.round(100 / Math.max(1, factor))));
  // Zelfde kleuren als de uitslag in het spel: groen (≤1,15×) tot rood (>2,5×).
  const square = factor => (factor <= 1.15 ? '🟩' : factor <= 1.5 ? '🟨' : factor <= 2.5 ? '🟧' : '🟥');
  const squares = factors => factors.map(square).join('');
  const hook = () => copy('Verslaat jij dit?', 'Can you beat that?');
  const lines = parts => parts.filter(Boolean).join('\n');

  // ===== Versturen =====
  function preferNative() {
    if (typeof navigator.share !== 'function') return false;
    try {
      if (window.matchMedia?.('(pointer: coarse)').matches) return true;
    } catch (_) { /* oude browser */ }
    const ua = navigator.userAgent || '';
    return /Android|iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
    } catch (_) { /* val terug op execCommand */ }
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch (_) { return false; }
  }

  let busy = false;
  // Geeft 'shared' | 'copied' | 'prompt' | 'cancelled' | 'busy' terug.
  async function deliver(text, options = {}) {
    if (busy || !text) return 'busy';
    busy = true;
    try {
      let triedNative = false;
      if (preferNative()) {
        triedNative = true;
        try { await navigator.share({ title: 'Netto', text }); return 'shared'; }
        catch (error) { if (error?.name === 'AbortError') return 'cancelled'; }
      }
      if (await copyToClipboard(text)) {
        showNoticeToast(options.copiedMessage || copy('Plak het in je groepsapp en daag je vrienden uit.', 'Paste it in your group chat and challenge your friends.'),
          '📋', copy('Gekopieerd!', 'Copied!'));
        return 'copied';
      }
      if (!triedNative && typeof navigator.share === 'function') {
        try { await navigator.share({ title: 'Netto', text }); return 'shared'; }
        catch (error) { if (error?.name === 'AbortError') return 'cancelled'; }
      }
      prompt(copy('Kopieer jouw uitslag:', 'Copy your result:'), text);
      return 'prompt';
    } finally { busy = false; }
  }

  // ===== Daily =====
  function dailyText() {
    const plays = getLocalPlays();
    const key = getActivePuzzleKey();
    const play = plays[key] || plays[TODAY_STR];
    if (!play || !PUZZLE_DATA) return '';
    const echt = PUZZEL_ECHT();
    const factors = [scoreVraag(play.g1, echt.a1), scoreVraag(play.g2, echt.a2), scoreVraag(play.g3, echt.a3)];
    const row = squares(dailyQuestionOrder().map(i => factors[i]));
    const streak = PUZZLE_DATA.date === TODAY_STR ? getLocalStreak() : 0;
    const streakLine = streak > 0
      ? '🔥 ' + (copy(`${streak} ${streak === 1 ? 'dag' : 'dagen'} op rij`, `${streak}-day streak`)) : '';
    return lines([
      `Netto #${PUZZLE_DATA.number} · ${accuracy(play.factor)}% 🎯`,
      row,
      streakLine,
      hook(),
      PUZZLE_DATA.date ? dailyLink(PUZZLE_DATA.date) : link('daily')
    ]);
  }

  // ===== Library =====
  function libraryText() {
    const puzzle = libraryActivePuzzle;
    if (!puzzle) return '';
    let play;
    try { play = (JSON.parse(localStorage.getItem('netto_library_plays')) || {})[puzzle.id]; } catch (_) { /* geen speelgeschiedenis */ }
    if (!play) return '';
    const answers = [puzzle.q1_answer, puzzle.q2_answer, puzzle.q3_answer];
    const factors = answers.map((answer, i) => scoreVraag(play.guesses[i], answer));
    const special = puzzle.id === OPENAEC_SPECIAL_ID;
    return lines([
      special ? `Netto · OpenAEC Special · ${accuracy(play.factor)}% 🎯`
        : `Netto ${copy('Puzzel', 'Puzzle')} #${puzzle.number} · ${accuracy(play.factor)}% 🎯`,
      squares(factors),
      hook(),
      link(special ? 'openaec' : 'puzzles/' + puzzle.number)
    ]);
  }

  // ===== Find the Connection =====
  function connectionText(puzzle, result) {
    if (!puzzle || !result) return '';
    const factors = result.answers.map((answer, i) => scoreVraag(result.guesses[i], answer));
    return lines([
      `Netto Connection #${puzzle.number} 🔗`,
      (result.connectionCorrect ? '✅ ' + copy('Verband gevonden', 'Connection found') : '❌ ' + copy('Verband gemist', 'Connection missed'))
        + ` · ${accuracy(result.factor)}%`,
      squares(factors),
      copy('Vind jij het verband?', 'Can you find the connection?'),
      link('connections/' + puzzle.number)
    ]);
  }

  // ===== Puzzle Race =====
  let lastRace = null;
  function raceText() {
    const race = lastRace;
    if (!race || !race.attempted) return '';
    const minutes = Math.round(race.seconds / 60);
    const what = race.tolerance === 1
      ? copy(`${race.correct} puzzels exact goed`, `${race.correct} ${race.correct === 1 ? 'puzzle' : 'puzzles'} exactly right`)
      : copy(`${race.correct} puzzels binnen ${race.tolerance.toFixed(2)}×`, `${race.correct} ${race.correct === 1 ? 'puzzle' : 'puzzles'} within ${race.tolerance.toFixed(2)}×`);
    return lines([
      `Netto Race ⏱️ ${minutes} min`,
      `${what}${race.longest > 1 ? ` · 🔥 ${copy('reeks van', 'streak of')} ${race.longest}` : ''}`,
      copy('Ik daag je uit: haal jij meer?', 'I challenge you: can you score more?'),
      link('race')
    ]);
  }

  // ===== Live Rounds =====
  function liveText(state, myId) {
    if (!state?.players?.length) return '';
    const best = Math.max(...state.players.map(player => player.points));
    const me = state.players.find(player => player.id === myId);
    const won = !!me && best > 0 && me.points === best;
    const points = me ? me.points : best;
    const pts = copy(points === 1 ? 'punt' : 'punten', points === 1 ? 'point' : 'points');
    const rounds = copy(`${state.rounds} ${state.rounds === 1 ? 'ronde' : 'rondes'}`, `${state.rounds} ${state.rounds === 1 ? 'round' : 'rounds'}`);
    const players = copy(`${state.players.length} spelers`, `${state.players.length} players`);
    return lines([
      won ? '🏆 ' + copy('Ik won een potje Netto Live Rounds!', 'I won a game of Netto Live Rounds!')
        : '⚡ ' + copy('Netto Live Rounds gespeeld', 'Played Netto Live Rounds'),
      `${points} ${pts} · ${rounds} · ${players}`,
      copy('Doe mee met de volgende ronde 👇', 'Join the next game 👇'),
      link('live-rounds')
    ]);
  }

  // ===== Knop =====
  const ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
  function button(label, getText, className = '') {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = ('netto-share-button ' + className).trim();
    element.innerHTML = ICON + '<span></span>';
    element.lastChild.textContent = label;
    element.addEventListener('click', () => { deliver(getText()); });
    return element;
  }

  // Modi die hun resultaat in vaste HTML tonen, krijgen één knop in een eigen slot.
  function mount(slotId, host, before, element) {
    let slot = document.getElementById(slotId);
    if (slot) slot.remove();
    slot = document.createElement('div');
    slot.id = slotId;
    slot.className = 'netto-share-slot';
    slot.append(element);
    if (before && before.parentNode === host) host.insertBefore(slot, before); else host.append(slot);
  }

  function mountRace(data) {
    lastRace = data;
    const host = document.getElementById('raceResults');
    if (!host) return;
    document.getElementById('raceShareSlot')?.remove();
    if (!data.attempted) return;
    // Direct onder de score, vóór de (lange) review.
    mount('raceShareSlot', host, host.querySelector('.race-review-heading'),
      button(copy('Daag een vriend uit', 'Challenge a friend'), raceText, 'is-primary'));
  }

  function mountLive(state, myId) {
    const host = document.getElementById('liveFinished');
    if (!host || !state) return;
    mount('liveShareSlot', host, null, button(copy('Deel de eindstand', 'Share the result'), () => liveText(state, myId), 'is-primary'));
  }

  window.NettoShare = Object.freeze({
    deliver, link, dailyLink, siteRoot, button, square, squares, accuracy,
    daily: () => deliver(dailyText()),
    dailyText, libraryText, connectionText, raceText, liveText,
    libraryButton: () => button(copy('Deel resultaat', 'Share result'), libraryText),
    connectionButton: (puzzle, result) => button(copy('Deel resultaat', 'Share result'), () => connectionText(puzzle, result)),
    mountRace, mountLive
  });
})();

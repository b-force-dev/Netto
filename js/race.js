// Netto frontend module.
// Loaded as a classic script so the existing shared global scope stays intact.

// ===== PUZZEL RACE — zoveel mogelijk puzzels exact oplossen =====
  const RACE_TOTAL_SECONDS = 300;
  const RACE_DURATIONS = {
    bullet: 180,
    snel: 300,
    blitz: 600
  };
  const RACE_DURATION_META = {
    bullet: { label: '3 minuten', name: 'Bullet', emoji: '⚡' },
    snel: { label: '5 minuten', name: 'Snel', emoji: '⏱️' },
    blitz: { label: '10 minuten', name: 'Blitz', emoji: '🚀' }
  };

  // Hoe dicht je bij het antwoord moet zitten om een punt te pakken. De factor
  // is het aantal keren dat je ernaast zat: 1,00 betekent precies goed, 1,25 dat
  // je binnen een kwart van de waarde bleef. De race telt de drie vragen samen
  // en middelt hun factor, dus een misser op een vraag kun je met twee goede
  // deels goedmaken.
  const RACE_TOLERANTIES = {
    perfect: 1.00, netjes: 1.25, ruim: 1.50, grof: 2.00, breed: 3.00
  };
  const RACE_TOLERANTIE_META = {
    perfect: { label: '1,00×', name: 'Perfect', uitleg: 'Exact goed, niets ernaast' },
    netjes: { label: '1,25×', name: 'Netjes', uitleg: 'Een kwart ernaast mag' },
    ruim: { label: '1,50×', name: 'Ruim', uitleg: 'Anderhalf keer ernaast mag' },
    grof: { label: '2,00×', name: 'Grof', uitleg: 'Factor twee, orde van grootte' },
    breed: { label: '3,00×', name: 'Breed', uitleg: 'Gemiddelde afwijking tot factor drie' }
  };
  const RACE_TOLERANTIE_VOLGORDE = ['perfect', 'netjes', 'ruim', 'grof', 'breed'];
  const RACE_TOLERANTIE_STANDAARD = 'perfect';
  const RACE_LEVEL_ORDER = { 'easy': 0, 'intermediate': 1, 'hard': 2, 'extremely-hard': 3 };
  const RACE_LEVEL_LABEL = { 'easy': 'Easy', 'intermediate': 'Intermediate', 'hard': 'Hard', 'extremely-hard': 'Extremely Hard' };
  const RACE_MODE_CONFIG_KEY = 'netto_race_mode_config';
  let raceQueue = [];
  let raceState = null;
  let raceMode = 'solo';
  let raceOnlineVisibility = 'open'; // aan/uit-schakelaar in de online-tab
  let raceLobbyChannel = null;
  let raceLobbyReady = false;
  let raceLobbyPublishedSignature = '';
  function renderNettoOpenGames() {
    renderOpenGames();
    window.NettoLive?.renderOpenGames();
  }
  // Of de laatste poging tot verbinden mislukte. Zonder dit is een kapotte
  // lobby niet te onderscheiden van een lobby waar niemand in zit.
  let raceLobbyFout = false;
  let raceAutoStartTimer = null;
  let raceAutoStartInterval = null;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'\"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '\"': '&quot;' }[character]));
  }

  // ===== Gedeeld door Puzzel Race en Live Rondes: naam, uitnodiging, invoer =====
  const NETTO_GUEST_NAME_KEY = 'netto_guest_name';
  function nettoGuestName() {
    try { return (localStorage.getItem(NETTO_GUEST_NAME_KEY) || '').trim().slice(0, 20); } catch (_) { return ''; }
  }

  // Wacht tot de Supabase-client bestaat. Die wordt pas bij 'load' gemaakt;
  // een uitnodigingslink of hervatting vóór dat moment zou anders "geen verbinding" melden.
  function nettoWhenOnline(callback) {
    if (typeof supabaseClient !== 'undefined' && supabaseClient) { callback(); return; }
    if (document.readyState === 'complete') { setTimeout(callback, 0); return; }
    window.addEventListener('load', () => setTimeout(callback, 0), { once: true });
  }

  // Eén link die in WhatsApp werkt: hij opent de juiste modus met de code al ingevuld.
  function nettoInviteUrl(mode, code) {
    const base = window.NettoRoutes?.base || new URL('./', location.href);
    const url = new URL(mode === 'live' ? 'live-rounds/' : 'race/online/', base);
    url.searchParams.set('join', String(code).toUpperCase());
    return url.href;
  }

  async function nettoShareInvite(mode, code) {
    if (!code) return;
    const url = nettoInviteUrl(mode, code);
    const text = mode === 'live'
      ? statsCopy(`Doe mee met mijn Netto Live Rondes! Code ${code}`, `Join my Netto Live Rounds! Code ${code}`)
      : statsCopy(`Race tegen me in Netto! Code ${code}`, `Race me in Netto! Code ${code}`);
    return window.NettoShare?.deliver(`${text} ${url}`, {
      copiedMessage: statsCopy('Plak de link in WhatsApp of een ander chatbericht.', 'Paste the link into WhatsApp or any chat.')
    });
  }

  // Vraagt een naam voor spelen zonder account. Geeft de naam of null terug.
  function nettoAskPlayerName({ title, text, allowGuest = true } = {}) {
    return new Promise(resolve => {
      document.getElementById('nettoNameDialog')?.remove();
      const dialog = document.createElement('dialog');
      dialog.id = 'nettoNameDialog';
      dialog.className = 'netto-name-dialog';
      dialog.setAttribute('aria-labelledby', 'nettoNameDialogTitle');
      dialog.innerHTML = `<form method="dialog" class="netto-name-form">
        <h2 id="nettoNameDialogTitle"></h2><p class="netto-name-text"></p>
        ${allowGuest ? `<label for="nettoNameInput"></label><input id="nettoNameInput" type="text" maxlength="20" autocomplete="nickname" enterkeyhint="go" required>` : ''}
        <div class="netto-name-actions">${allowGuest ? '<button type="submit" class="hero-cta" value="guest"></button>' : ''}
          <button type="button" class="btn-check" data-name-action="login"></button>
          <button type="button" class="live-text-button" data-name-action="cancel"></button></div></form>`;
      dialog.querySelector('h2').textContent = title || statsCopy('Hoe heet je?', 'What is your name?');
      dialog.querySelector('.netto-name-text').textContent = text || statsCopy('Je tegenstander ziet deze naam. Een account is niet nodig.', 'Your opponent sees this name. No account needed.');
      const input = dialog.querySelector('input');
      if (input) {
        dialog.querySelector('label').textContent = statsCopy('Jouw naam', 'Your name');
        input.placeholder = statsCopy('Bijv. Sam', 'E.g. Sam');
        input.value = nettoGuestName();
        dialog.querySelector('[type="submit"]').textContent = statsCopy('Meedoen →', 'Join →');
      }
      dialog.querySelector('[data-name-action="login"]').textContent = allowGuest ? statsCopy('Inloggen met account', 'Sign in with an account') : statsCopy('Inloggen of account maken', 'Sign in or create an account');
      dialog.querySelector('[data-name-action="cancel"]').textContent = statsCopy('Annuleren', 'Cancel');
      let result = null;
      dialog.querySelector('form').addEventListener('submit', event => {
        const name = (input?.value || '').replace(/\s+/g, ' ').trim().slice(0, 20);
        if (!name) { event.preventDefault(); input?.focus(); return; }
        try { localStorage.setItem(NETTO_GUEST_NAME_KEY, name); } catch (_) {}
        result = name;
      });
      dialog.querySelector('[data-name-action="login"]').addEventListener('click', () => { result = null; dialog.close(); openAuthModal(); });
      dialog.querySelector('[data-name-action="cancel"]').addEventListener('click', () => { result = null; dialog.close(); });
      dialog.addEventListener('close', () => { dialog.remove(); resolve(result); });
      document.body.appendChild(dialog);
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
      setTimeout(() => input ? input.focus() : dialog.querySelector('button')?.focus(), 30);
    });
  }

  // Enter levert in zodra alle drie de antwoorden er staan (ook een automatisch
  // berekend antwoord). Anders springt de focus naar het volgende lege vak; een
  // berekend vak overslaan voorkomt dat de focus het weer wist.
  function nettoAnswerEnter(prefix, index, submit) {
    const inputs = [0, 1, 2].map(i => document.getElementById(`${prefix}Answer${i}`));
    if (inputs.some(input => !input)) return;
    const filled = inputs.map(input => { const value = parseFormattedNumber(input.value); return Number.isSafeInteger(value) && value > 0; });
    if (filled.every(Boolean)) { submit(); return; }
    for (const step of [1, 2]) {
      const next = (index + step) % 3;
      if (!filled[next] && !inputs[next].disabled) { inputs[next].focus(); return; }
    }
    submit();
  }

  // Enter navigeert; normale tekens volgen dezelfde parser als geplakte invoer.
  function nettoNumberKeydown(event, input, onEnter) {
    if (event.key === 'Enter') { event.preventDefault(); if (!event.repeat) onEnter(); return; }
    // Laat de volledige invoer staan; de gedeelde parser valideert bij inleveren.
  }

  function raceDurationText(seconds) {
    const total = Math.max(0, Number(seconds) || RACE_TOTAL_SECONDS);
    const minutes = Math.floor(total / 60);
    return `${minutes}:00`;
  }

  const RACE_THEMES = {
    all: null,
    nature: ['Dieren', 'Biologie & gezondheid', 'Milieu en duurzaamheid'],
    science: ['Technologie', 'Scheikunde', 'Natuurkunde', 'Wiskunde', 'Sterrenkunde & ruimte'],
    culture: ['Kunst en cultuur', 'Boeken en literatuur', 'Films en series', 'Muziek', 'Geschiedenis'],
    sport: ['Sport', 'Spellen en speelgoed']
  };
  function selectRaceTheme(key) {
    saveRaceModeConfig('solo', {themeKey: RACE_THEMES[key] !== undefined ? key : 'all'});
    renderRaceBest();
  }
  function buildRaceQueue(seed, themeKey = 'all') {
    // Elke run gebruikt een willekeurige, gededupliceerde volgorde. In een
    // duel komt de seed van de host, zodat beide spelers gelijk lopen.
    let source;
    if (window.NETTO_RACE_POOL && window.NETTO_RACE_POOL.length > 0) {
      source = window.NETTO_RACE_POOL;
    } else {
      source = REBUILT_DATA.race || [];
    }
    const themes = RACE_THEMES[themeKey];
    const list = source.filter(p => !themes || p.categories?.some(category => themes.includes(category))).map(normalizeLibraryPuzzle);
    const rng = mulberry32(seed ?? (Date.now() ^ (Math.random() * 0xffffffff)));
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    const seen = new Set();
    const unique = list.filter(p => {
      const key = p.calculation || `${p.q1_answer}${p.operator}${p.q2_answer}=${p.q3_answer}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // Eerlijke opbouw: eerst een paar makkelijke puzzels om in te komen, dan
    // steeds moeilijker. Binnen elk niveau blijft de (gedeelde) volgorde willekeurig.
    const ramp = [['easy', 5], ['intermediate', 7], ['hard', 10], ['extremely-hard', 12]];
    const used = new Set();
    const ordered = [];
    ramp.forEach(([level, count]) => {
      unique.filter(p => p.difficulty === level && !used.has(p)).slice(0, count).forEach(p => { used.add(p); ordered.push(p); });
    });
    return ordered.concat(unique.filter(p => !used.has(p)));
  }

  function newRaceSeed() {
    return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  }

  // Kleine deterministische PRNG (Mulberry32) voor gedeelde duel-queues.
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getRaceModeConfig(mode) {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(RACE_MODE_CONFIG_KEY) || '{}'); } catch (_) {}
    const config = saved[mode] || {};
    return {
      themeKey: RACE_THEMES[config.themeKey] !== undefined ? config.themeKey : 'all',
      durationKey: RACE_DURATIONS[config.durationKey] ? config.durationKey : 'snel',
      toleranceKey: RACE_TOLERANTIES[config.toleranceKey]
        ? config.toleranceKey : RACE_TOLERANTIE_STANDAARD
    };
  }

  function saveRaceModeConfig(mode, patch) {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(RACE_MODE_CONFIG_KEY) || '{}'); } catch (_) {}
    saved[mode] = { ...getRaceModeConfig(mode), ...patch };
    localStorage.setItem(RACE_MODE_CONFIG_KEY, JSON.stringify(saved));
  }

  function raceTolerantieMeta(key) {
    return RACE_TOLERANTIE_META[key] || RACE_TOLERANTIE_META[RACE_TOLERANTIE_STANDAARD];
  }

  function raceDurationMeta(key) {
    return RACE_DURATION_META[key] || RACE_DURATION_META.snel;
  }

  function ensureRaceLobby() {
    if (!supabaseClient) return;
    if (raceLobbyChannel) {
      // Kanaal bestaat al: zorg dat het daadwerkelijk gesubscribed is (de
      // lobby-listing vertrouwt op raceLobbyReady) en publish opnieuw — de
      // sessie kan inmiddels een open host zijn geworden.
      if (!raceLobbyReady) {
        try { supabaseClient.removeChannel(raceLobbyChannel); } catch (_) {}
        raceLobbyChannel = null;
      } else {
        publishOpenRaceEntry();
        return;
      }
    }
    raceLobbyChannel = supabaseClient.channel('netto-race-lobby-v1', {
      config: { presence: { key: RACE_CLIENT_ID } }
    });
    raceLobbyChannel
      .on('presence', { event: 'sync' }, () => { raceLobbyReady = true; publishOpenRaceEntry(); renderNettoOpenGames(); })
      .on('presence', { event: 'join' }, renderNettoOpenGames)
      .on('presence', { event: 'leave' }, renderNettoOpenGames)
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          raceLobbyReady = true;
          raceLobbyFout = false;
          raceLobbyPublishedSignature = '';
          publishOpenRaceEntry();
          renderNettoOpenGames();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // Kanaal kapot: volledig resetten zodat de volgende ensure het opnieuw probeert.
          raceLobbyReady = false;
          raceLobbyChannel = null;
          // En het opnieuw tekenen, anders blijft er "Nog geen open games"
          // staan terwijl er in werkelijkheid geen verbinding is.
          raceLobbyFout = true;
          renderNettoOpenGames();
        }
      });
  }
  function openRaceEntries() {
    if (!raceLobbyChannel) return [];
    const entries = [];
    Object.values(raceLobbyChannel.presenceState() || {}).forEach(metas => {
      metas.forEach(meta => {
        if (meta && meta.kind === 'open-race' && meta.status === 'waiting' && meta.roomCode && meta.client_id !== RACE_CLIENT_ID) {
          entries.push(meta);
        }
      });
    });
    const seen = new Set();
    return entries
      .filter(entry => {
        if (Date.now() - Number(entry.createdAt || 0) > 10 * 60 * 1000 || seen.has(entry.roomCode)) return false;
        seen.add(entry.roomCode);
        return true;
      })
      .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
  }

  function renderOpenGames() {
    const list = document.getElementById('raceOpenGamesList');
    if (!list) return;
    const games = openRaceEntries();
    if (!games.length) {
      // Leeg en kapot zagen er hetzelfde uit: "Nog geen open games" stond er
      // ook als de verbinding was weggevallen of er helemaal geen server was.
      // Je bleef dan wachten op spelers die je nooit te zien zou krijgen.
      const melding = !supabaseClient
        ? 'Geen verbinding met de server, dus open games zijn nu niet te zien. Solo spelen kan wel.'
        : raceLobbyFout
          ? 'De verbinding met de lobby is weggevallen. Ververs om het opnieuw te proberen.'
          : 'Maak een game aan — andere spelers kunnen hier aansluiten.';
      list.innerHTML = '';
      const div = document.createElement('div');
      div.className = 'race-open-games-empty';
      const title = document.createElement('strong');
      title.textContent = !supabaseClient || raceLobbyFout
        ? statsCopy('Even geen verbinding', 'Connection interrupted')
        : statsCopy('Nog geen open games', 'No open games yet');
      const description = document.createElement('span');
      description.textContent = melding;
      div.append(title, description);
      list.appendChild(div);
      return;
    }
    list.innerHTML = games.map(game => {
      const duration = raceDurationMeta(game.durationKey);
      return `<button class="race-open-game" type="button" onclick="joinOpenRaceGame('${escapeHtml(game.roomCode)}','${escapeHtml(game.durationKey)}')"><span class="race-open-game-player">${escapeHtml(game.name || 'Speler')}</span><span class="race-open-game-details"><b>${duration.emoji} ${escapeHtml(duration.label)}</b></span><span class="race-open-game-join">Join →</span></button>`;
    }).join('');
  }

  function publishOpenRaceEntry(status = 'waiting') {
    const session = raceDuelSession;
    const liveEntry = window.NettoLive?.lobbyEntry();
    if (liveEntry && raceLobbyReady && raceLobbyChannel) {
      const signature = JSON.stringify(liveEntry);
      if (signature !== raceLobbyPublishedSignature) {
        raceLobbyPublishedSignature = signature;
        Promise.resolve(raceLobbyChannel.track(liveEntry)).catch(() => { raceLobbyPublishedSignature = ''; });
      }
      return;
    }
    if (!raceLobbyReady || !raceLobbyChannel || !session || session.visibility !== 'open' || session.role !== 'host' || session.started) return;
    try {
      const entry = {
        kind: 'open-race',
        status,
        roomCode: session.code,
        name: raceDisplayName(),
        durationKey: session.durationKey || getRaceModeConfig('online').durationKey,
        toleranceKey: session.toleranceKey || getRaceModeConfig('online').toleranceKey,
        createdAt: session.createdAt || Date.now(),
        client_id: RACE_CLIENT_ID
      };
      const signature = JSON.stringify(entry);
      if (signature !== raceLobbyPublishedSignature) {
        raceLobbyPublishedSignature = signature;
        Promise.resolve(raceLobbyChannel.track(entry)).catch(() => { raceLobbyPublishedSignature = ''; });
      }
    } catch (_) {}
    renderOpenGames();
  }

  function unpublishOpenRaceEntry() {
    raceLobbyPublishedSignature = '';
    if (!raceLobbyChannel || !raceLobbyReady) return;
    try { raceLobbyChannel.untrack(); } catch (_) {}
    renderOpenGames();
  }

  function clearOpenRaceAutoStart() {
    if (raceAutoStartTimer) clearTimeout(raceAutoStartTimer);
    if (raceAutoStartInterval) clearInterval(raceAutoStartInterval);
    raceAutoStartTimer = null;
    raceAutoStartInterval = null;
    if (raceDuelSession) raceDuelSession.autoStartDeadline = null;
  }

  function scheduleOpenRaceAutoStart() {
    const session = raceDuelSession;
    if (!session || session.role !== 'host' || session.visibility !== 'open' || !session.opponentPresent || session.started || raceState || raceAutoStartTimer) return;
    session.autoStartDeadline = Date.now() + 20000;
    const tick = () => {
      if (!raceDuelSession || raceDuelSession !== session || raceState || !session.opponentPresent) {
        clearOpenRaceAutoStart();
        return;
      }
      const seconds = Math.max(0, Math.ceil((session.autoStartDeadline - Date.now()) / 1000));
      setRaceDuelStatus(statsCopy(`${session.opponentName} is er · het duel start over ${seconds}s`, `${session.opponentName} is here · the duel starts in ${seconds}s`));
      if (seconds <= 0) {
        clearOpenRaceAutoStart();
        startDuelRace();
      }
    };
    tick();
    raceAutoStartInterval = setInterval(tick, 1000);
    raceAutoStartTimer = setTimeout(() => { clearOpenRaceAutoStart(); startDuelRace(); }, 20000);
  }

  function renderRaceRoomSettings() {
    const el = document.getElementById('raceRoomSettings');
    if (!el || !raceDuelSession) return;
    const duration = raceDurationMeta(raceDuelSession.durationKey);
    const tol = raceTolerantieMeta(raceDuelSession.toleranceKey);
    el.textContent = `${duration.emoji} ${duration.label} · 🎯 ${tol.label} ${tol.name}`;
  }

  function openSettings() {
    closeMenu();
    updateConfettiToggle();
    updateAutoCalcToggle();
    updateEquationRequirementToggle();
    if (typeof werkLeaderboardToggleBij === 'function') werkLeaderboardToggleBij();
    applyTheme();
    showScreen('settings');
    document.getElementById('settingsScreen').classList.add('active');
  }

  function closeSettings() {
    document.getElementById('settingsScreen').classList.remove('active');
    showScreen('home');
  }



  function renderRaceDurationOptions(mode) {
    const container = document.getElementById(`race${mode[0].toUpperCase() + mode.slice(1)}Durations`);
    if (!container) return;
    const config = getRaceModeConfig(mode);
    container.querySelectorAll('[data-duration]').forEach(button => {
      button.classList.toggle('active', button.dataset.duration === config.durationKey);
      button.setAttribute('aria-pressed', button.dataset.duration === config.durationKey ? 'true' : 'false');
    });
  }

  function renderRaceTolerantieOptions(mode) {
    const container = document.getElementById(
      `race${mode[0].toUpperCase() + mode.slice(1)}Tolerances`);
    if (!container) return;
    const config = getRaceModeConfig(mode);
    const schuif = container.querySelector('input[type="range"]');
    const index = RACE_TOLERANTIE_VOLGORDE.indexOf(config.toleranceKey);
    const meta = raceTolerantieMeta(config.toleranceKey);
    if (schuif) {
      schuif.value = String(index);
      schuif.setAttribute('aria-valuetext', window.NettoI18n?.t(meta.label + ' ' + meta.name) || meta.label + ' ' + meta.name);
      schuif.style.setProperty('--speling-voortgang', (index * 25) + '%');
    }
    container.querySelectorAll('[data-tolerance]').forEach(label => {
      label.classList.toggle('active', label.dataset.tolerance === config.toleranceKey);
      label.setAttribute('aria-pressed', String(label.dataset.tolerance === config.toleranceKey));
    });
    const uitleg = document.getElementById(
      `race${mode[0].toUpperCase() + mode.slice(1)}ToleranceNote`);
    if (uitleg) {
      const factor = RACE_TOLERANTIES[config.toleranceKey].toLocaleString(nettoNumberLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      uitleg.textContent = statsCopy(`Een puzzel telt bij een gemiddelde factor van maximaal ${factor}×.`, `A puzzle counts with an average factor of ${factor}× or lower.`);
    }
  }

  function selectRaceTolerantie(mode, key) {
    if (!RACE_TOLERANTIES[key]) return;
    saveRaceModeConfig(mode, { toleranceKey: key });
    renderRaceTolerantieOptions(mode);
    if (mode === 'solo') renderRaceBest();
  }

  function renderRaceModeControls() {
    ['solo', 'online'].forEach(mode => {
      renderRaceDurationOptions(mode);
      renderRaceTolerantieOptions(mode);
    });
  }

  function switchRaceMode(mode) {
    if (!['solo', 'online'].includes(mode)) mode = 'solo';
    raceMode = mode;
    document.querySelectorAll('.race-mode-tab').forEach(button => {
      const active = button.id === `raceMode${mode[0].toUpperCase() + mode.slice(1)}Tab`;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.tabIndex = active ? 0 : -1;
    });
    document.getElementById('raceSoloSetup').style.display = mode === 'solo' ? 'block' : 'none';
    document.getElementById('raceOnlineSetup').style.display = mode === 'online' ? 'block' : 'none';
    document.getElementById('raceSetupPlayerCount').textContent = mode === 'online' ? statsCopy('2 spelers', '2 players') : statsCopy('1 speler', '1 player');
    document.querySelector('#raceStart .race-mode-tabs').hidden = false;
    renderRaceModeControls();
    if (mode === 'online') {
      ensureRaceLobby();
      refreshOpenGames();
    }
  }

  function selectRaceDuration(mode, durationKey) {
    if (!RACE_DURATIONS[durationKey]) return;
    saveRaceModeConfig(mode, { durationKey });
    renderRaceDurationOptions(mode);
    if (mode === 'solo') renderRaceBest();
  }

  function selectOnlineVisibility(visibility) {
    const open = visibility === 'open';
    const checkbox = document.getElementById('raceVisibilityCheckbox');
    if (checkbox) checkbox.checked = open;
    toggleOnlineVisibility(open);
  }

  // Aan/uit-schakelaar in de online-tab: AAN = open game (zichtbaar in de lijst
  // met open games), UIT = closed game (persoonlijke code, start nooit automatisch).
  function toggleOnlineVisibility(open) {
    const isOpen = open !== false && open !== 'closed';
    raceOnlineVisibility = isOpen ? 'open' : 'closed';
    const checkbox = document.getElementById('raceVisibilityCheckbox');
    if (checkbox) checkbox.checked = isOpen;
    const title = document.getElementById('raceVisibilityTitle');
    const sub = document.getElementById('raceVisibilitySub');
    if (title) title.textContent = isOpen ? 'Open game' : 'Closed game';
    if (sub) sub.textContent = isOpen
      ? statsCopy('Zichtbaar voor iedereen. Start 20 seconden nadat iemand meedoet.','Visible to everyone. Starts 20 seconds after someone joins.')
      : statsCopy('Alleen met jouw code. Jij start zodra iedereen klaar is.','Only with your code. You start when everyone is ready.');
    const openControls = document.getElementById('raceOpenControls');
    const closedControls = document.getElementById('raceClosedControls');
    if (openControls) openControls.style.display = isOpen ? 'block' : 'none';
    if (closedControls) closedControls.style.display = isOpen ? 'none' : 'block';
  }

  function refreshOpenGames() {
    ensureRaceLobby();
    renderOpenGames();
  }
  function createOpenRaceGame() {
    const config = getRaceModeConfig('online');
    createRaceRoom('open', config);
  }

  // ===== Solo-race: aftellen, klok op tijdstempels, hervatten en records =====
  const RACE_RUN_KEY = 'netto_race_run';
  const RACE_ROOM_KEY = 'netto_race_room';
  const RACE_BEST_KEY = 'netto_race_best_v2';
  const RACE_COUNTDOWN_MS = 3000;
  let raceResumeChecked = false;
  let raceEndTimer = null;
  let raceLastSubmitAt = 0;

  function raceFactorText(value) {
    return Number(value).toLocaleString(nettoNumberLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '×';
  }

  function raceSettingLabel(durationKey, toleranceKey) {
    const minutes = Math.round((RACE_DURATIONS[durationKey] || RACE_TOTAL_SECONDS) / 60);
    return `${statsCopy(`${minutes} min`, `${minutes} min`)} · ${raceFactorText(RACE_TOLERANTIES[toleranceKey] || 1)}`;
  }

  function readRaceStore(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); } catch (_) { return null; }
  }
  function writeRaceStore(storage, key, value) {
    try { if (value == null) storage.removeItem(key); else storage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }

  // Records gelden per tempo en speling: 10 minuten met 3,00× is geen eerlijke
  // vergelijking met 3 minuten exact.
  function readRaceBest(durationKey, toleranceKey, themeKey = 'all') {
    const saved = readRaceStore(localStorage, RACE_BEST_KEY) || {};
    const key = `${durationKey}:${toleranceKey}${themeKey === 'all' ? '' : ':' + themeKey}`;
    if (Number.isFinite(Number(saved[key]))) return Number(saved[key]);
    // Het oude record kende geen instellingen; het hoort bij de standaard.
    if (key === `snel:${RACE_TOLERANTIE_STANDAARD}`) {
      try { return Number(localStorage.getItem('netto_race_best') || 0) || 0; } catch (_) { return 0; }
    }
    return 0;
  }
  function writeRaceBest(durationKey, toleranceKey, value, themeKey = 'all') {
    const saved = readRaceStore(localStorage, RACE_BEST_KEY) || {};
    saved[`${durationKey}:${toleranceKey}${themeKey === 'all' ? '' : ':' + themeKey}`] = value;
    writeRaceStore(localStorage, RACE_BEST_KEY, saved);
  }
  function renderRaceBest() {
    const bestEl = document.getElementById('raceBest');
    if (!bestEl) return;
    const config = getRaceModeConfig('solo');
    const best = readRaceBest(config.durationKey, config.toleranceKey, config.themeKey);
    const setting = raceSettingLabel(config.durationKey, config.toleranceKey);
    bestEl.textContent = best > 0
      ? statsCopy(`Jouw record (${setting}): ${best} goed`, `Your best (${setting}): ${best} correct`)
      : statsCopy(`Nog geen record voor ${setting}. Zet de eerste!`, `No record yet for ${setting}. Set the first one!`);
  }

  // Een lopende race overleeft een refresh: de wachtrij volgt uit de seed, de
  // klok uit tijdstempels. Alleen deze tab (sessionStorage) kan hem hervatten.
  function saveRaceRun() {
    if (!raceState) return;
    const session = raceState.isDuel ? raceDuelSession : null;
    writeRaceStore(sessionStorage, RACE_RUN_KEY, {
      v: 1, themeKey: raceState.themeKey, seed: raceState.seed, durationKey: raceState.durationKey, toleranceKey: raceState.toleranceKey,
      startsAt: raceState.startsAt, endsAt: raceState.endsAt,
      results: raceState.results.map(r => ({ g: r.guesses, f: r.factor, e: r.exact, r: r.raak })),
      duel: session ? {
        code: session.code, role: session.role, visibility: session.visibility, createdAt: session.createdAt,
        joinedAt: session.joinedAt, opponentId: session.opponentId, opponentName: session.opponentName,
        opponentCorrect: session.opponent ? session.opponent.correct : 0, started: true
      } : null
    });
  }
  function clearRaceRun() { writeRaceStore(sessionStorage, RACE_RUN_KEY, null); }

  function resumeRaceRun(run) {
    const restore = Array.isArray(run.results) ? run.results : [];
    if (run.duel) {
      connectRaceRoom(run.duel.code, run.duel.role, { ...run.duel, durationKey: run.durationKey, toleranceKey: run.toleranceKey });
      const session = raceDuelSession;
      if (!session) return;
      session.opponentId = run.duel.opponentId || null;
      session.opponentName = run.duel.opponentName || null;
      session.started = true;
      session.opponent = { correct: Number(run.duel.opponentCorrect) || 0, attempted: 0, finished: false };
    }
    startRaceCore(Boolean(run.duel), { resumed: true, seed: run.seed, durationKey: run.durationKey, toleranceKey: run.toleranceKey,
      themeKey: run.themeKey, startsAt: run.startsAt, endsAt: run.endsAt, restore });
    if (raceState && Date.now() >= raceState.endsAt) finishRace(true);
  }

  function openPuzzleRace() {
    closeMenu();
    // Alleen de eerste keer na het laden hervatten; daarna is een oude run verlaten.
    const firstOpen = !raceResumeChecked;
    raceResumeChecked = true;
    let run = firstOpen ? readRaceStore(sessionStorage, RACE_RUN_KEY) : null;
    const room = firstOpen && !run ? readRaceStore(sessionStorage, RACE_ROOM_KEY) : null;
    // Een run die al ruim voorbij is, heeft geen zin meer om te tonen.
    if (run && (!Number.isFinite(run.endsAt) || Date.now() - run.endsAt > 120000)) run = null;
    leaveRaceRoom();
    stopRaceTimer();
    raceState = null;
    showScreen('race');
    document.getElementById('raceScreen').classList.add('active');
    document.getElementById('raceScreen').scrollTop = 0;
    document.getElementById('raceStart').style.display = 'block';
    document.getElementById('racePlay').style.display = 'none';
    document.getElementById('raceResults').style.display = 'none';
    resetRaceDuelUi();
    renderRaceModeControls();
    const theme = document.getElementById('raceSoloTheme');
    if (theme) theme.value = getRaceModeConfig('solo').themeKey;
    switchRaceMode('solo');
    toggleOnlineVisibility(raceOnlineVisibility === 'open');
    renderRaceBest();
    if (run) resumeRaceRun(run);
    else if (room && /^[A-Z2-9]{6}$/.test(room.code || '')) {
      // Terug in de wachtkamer na een refresh, met dezelfde rol.
      switchRaceMode('online');
      connectRaceRoom(room.code, room.role === 'host' ? 'host' : 'guest', room);
    }
  }

  function closePuzzleRace() {
    stopRaceTimer();
    raceState = null;
    leaveRaceRoom();
    document.getElementById('raceScreen').classList.remove('active');
    showScreen('home');
  }

  function startPuzzleRace() {
    const config = getRaceModeConfig('solo');
    leaveRaceRoom();
    startRaceCore(false, config);
  }

  // "Nog een race" op het eindscherm: dezelfde instellingen, meteen opnieuw.
  // In een duel wordt het een revanche in dezelfde room.
  function raceAgain() {
    if (raceDuelSession) { requestRaceRematch(); return; }
    startPuzzleRace();
  }

  function startDuelRace() {
    const session = raceDuelSession;
    if (!session || session.role !== 'host') return;
    if (!session.opponentPresent) {
      setRaceDuelStatus(statsCopy('Je tegenstander is er nog niet.', 'Your opponent is not here yet.'));
      return;
    }
    clearOpenRaceAutoStart();
    startRaceCore(true);
  }

  function startRaceCore(isDuel, options = {}) {
    stopRaceTimer();
    const session = isDuel ? raceDuelSession : null;
    const durationKey = RACE_DURATIONS[options.durationKey] ? options.durationKey : (session && session.durationKey) || 'snel';
    const toleranceKey = RACE_TOLERANTIES[options.toleranceKey] ? options.toleranceKey
      : (session && session.toleranceKey) || getRaceModeConfig(isDuel ? 'online' : 'solo').toleranceKey;
    const totalSeconds = RACE_DURATIONS[durationKey] || RACE_TOTAL_SECONDS;
    const seed = Number.isFinite(Number(options.seed)) && options.seed !== null ? Number(options.seed) >>> 0 : newRaceSeed();
    const countdownMs = Number.isFinite(options.countdownMs) ? Math.max(0, Math.min(RACE_COUNTDOWN_MS, options.countdownMs)) : RACE_COUNTDOWN_MS;
    const startsAt = Number(options.startsAt) || Date.now() + countdownMs;
    const playMs = Number.isFinite(options.remainingMs) ? Math.max(0, Math.min(totalSeconds * 1000, options.remainingMs)) : totalSeconds * 1000;
    const endsAt = Number(options.endsAt) || startsAt + playMs;
    if (session) {
      session.seed = seed;
      session.durationKey = durationKey;
      session.toleranceKey = toleranceKey;
      session.started = true;
      if (!options.resumed) {
        session.myCorrect = null;
        session.wantsRematch = false;
        session.opponentLeft = false;
        session.opponent = { correct: 0, attempted: 0, finished: false, wantsRematch: false };
      }
      clearRaceGoneTimer();
      if (session.role === 'host' && !options.resumed) {
        unpublishOpenRaceEntry();
        broadcastRaceEvent(session.code, 'start', { seed, durationKey, toleranceKey, countdownMs, startedAt: Date.now() });
      }
    }
    const themeKey = !isDuel && RACE_THEMES[options.themeKey] !== undefined ? options.themeKey : 'all';
    raceQueue = buildRaceQueue(seed, themeKey);
    if (!raceQueue.length) {
      showNoticeToast(statsCopy('Er zijn nog geen race-puzzels geladen.', 'There are no race puzzles loaded yet.'), '🏁', statsCopy('Geen puzzels', 'No puzzles'));
      return;
    }
    raceState = { index: 0, results: [], correct: 0, streak: 0, longestStreak: 0, remaining: totalSeconds, totalSeconds, durationKey, toleranceKey, themeKey,
      tolerantie: RACE_TOLERANTIES[toleranceKey] || 1.0, timerId: null, progress: 0, startsAt, endsAt, seed, isDuel: Boolean(session), live: false };
    const inDuel = Boolean(session);
    window.nettoTrack?.('race_start', { mode:'race' });

    const oppEl = document.getElementById('raceOpponentHistory');
    if (oppEl) { oppEl.innerHTML = ''; oppEl.style.display = inDuel ? 'flex' : 'none'; }
    const oppLabel = document.getElementById('raceOpponentLabel');
    if (oppLabel) oppLabel.style.display = inDuel ? 'block' : 'none';
    document.getElementById('raceStart').style.display = 'none';
    document.getElementById('raceResults').style.display = 'none';
    document.getElementById('racePlay').style.display = 'block';
    document.getElementById('raceHistory').innerHTML = '';
    document.getElementById('raceDuelVerdict').style.display = 'none';
    const feedback = document.getElementById('raceFeedback');
    feedback.textContent = '';
    feedback.className = 'race-feedback';
    (options.restore || []).forEach((saved, i) => {
      const puzzle = raceQueue[i];
      if (!puzzle || !Array.isArray(saved.g)) return;
      const raak = Boolean(saved.r);
      raceState.results.push({ puzzle, guesses: saved.g, factor: Number(saved.f), exact: Boolean(saved.e), raak });
      raceState.correct += raak ? 1 : 0;
      raceState.streak = raak ? raceState.streak + 1 : 0;
      raceState.longestStreak = Math.max(raceState.longestStreak, raceState.streak);
      pushRaceChip(raak);
    });
    raceState.index = raceState.results.length;
    if (inDuel) updateOpponentScoreline();
    if (session) trackRacePresence();
    const label = document.getElementById('raceCountdownLabel');
    if (label) label.textContent = inDuel
      ? statsCopy(`Duel tegen ${session.opponentName || 'je tegenstander'}`, `Duel against ${session.opponentName || 'your opponent'}`)
      : statsCopy('Maak je klaar…', 'Get ready…');
    renderRacePuzzle();
    startRaceTimer();
    saveRaceRun();
  }

  function stopRaceTimer() {
    if (raceState && raceState.timerId) { cancelAnimationFrame(raceState.timerId); raceState.timerId = null; }
    if (raceEndTimer) { clearTimeout(raceEndTimer); raceEndTimer = null; }
  }

  function setRaceInputsEnabled(enabled) {
    document.querySelectorAll('#raceQuestionList input').forEach(input => { input.disabled = !enabled; });
    const button = document.getElementById('raceSubmitButton');
    if (button) button.disabled = !enabled;
  }

  function updateRaceCountdown(seconds) {
    const box = document.getElementById('raceCountdown');
    const number = document.getElementById('raceCountdownNumber');
    if (!box || !number) return;
    if (seconds > 0) {
      box.hidden = false;
      box.classList.remove('is-go');
      if (number.textContent !== String(seconds)) number.textContent = String(seconds);
    } else if (!box.hidden && !box.classList.contains('is-go')) {
      box.classList.add('is-go');
      number.textContent = statsCopy('Start!', 'Go!');
      setTimeout(() => { box.hidden = true; box.classList.remove('is-go'); }, 650);
    }
  }

  function focusFirstEmptyRaceInput() {
    const input = [0, 1, 2].map(i => document.getElementById(`raceAnswer${i}`)).find(item => item && !item.value);
    if (input) input.focus({ preventScroll: true });
  }

  function startRaceTimer() {
    stopRaceTimer();
    const state = raceState;
    const el = document.getElementById('raceTimer');
    const clock = document.getElementById('raceClock');
    if (!state || !el || !clock) return;
    const fill = document.getElementById('raceProgressFill');
    const durationMs = state.totalSeconds * 1000;
    let displayedSecond = -1;
    // requestAnimationFrame staat stil in een achtergrondtab. Deze timeout rondt
    // de race toch op tijd af, zodat een tegenstander niet op jou blijft wachten.
    const scheduleEnd = () => {
      raceEndTimer = setTimeout(() => {
        if (raceState !== state) return;
        if (Date.now() >= state.endsAt) finishRace(true); else scheduleEnd();
      }, Math.max(50, state.endsAt - Date.now()));
    };
    scheduleEnd();

    const render = () => {
      if (raceState !== state) return;
      const now = Date.now();
      const counting = now < state.startsAt;
      updateRaceCountdown(counting ? Math.ceil((state.startsAt - now) / 1000) : 0);
      if (counting && state.live) { state.live = false; setRaceInputsEnabled(false); }
      if (!counting && !state.live) {
        state.live = true;
        setRaceInputsEnabled(true);
        focusFirstEmptyRaceInput();
      }
      const remainingMs = Math.max(0, state.endsAt - Math.max(now, state.startsAt));
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      state.remaining = remainingSeconds;
      state.progress = Math.min(1, Math.max(0, 1 - (remainingMs / durationMs)));

      if (fill) fill.style.transform = `scaleX(${state.progress})`;
      if (remainingSeconds !== displayedSecond) {
        displayedSecond = remainingSeconds;
        const m = Math.floor(remainingSeconds / 60), s = remainingSeconds % 60;
        el.textContent = `${m}:${String(s).padStart(2, '0')}`;
        clock.classList.toggle('warn', remainingSeconds <= 60 && remainingSeconds > 10);
        clock.classList.toggle('crit', remainingSeconds <= 10);
      }

      if (now >= state.endsAt) {
        state.timerId = null;
        finishRace(true);
        return;
      }
      state.timerId = requestAnimationFrame(render);
    };
    render();
  }

  function renderRacePuzzle() {
    const p = raceQueue[raceState.index];
    if (!p) { finishRace(false); return; }
    document.getElementById('raceLevelLabel').textContent = RACE_LEVEL_LABEL[p.difficulty] || 'Puzzel';
    // De balk loopt over de tijd, niet over een puzzelnummer.
    document.getElementById('raceProgressLabel').textContent = statsCopy(`Puzzel ${raceState.index + 1}`, `Puzzle ${raceState.index + 1}`);
    document.getElementById('raceCorrectCount').textContent = raceState.correct;
    document.getElementById('raceStreakCount').textContent = raceState.streak;
    document.getElementById('raceProgressFill').style.transform = `scaleX(${raceState.progress || 0})`;
    const listEl = document.getElementById('raceQuestionList');
    const autoCalcNote = localStorage.getItem('netto_auto_calc_note_seen') === 'true' ? '' : `<div class="auto-calc-note" role="status" aria-live="polite">↳ ${statsCopy('Antwoorden worden automatisch berekend als de berekening klopt.', 'Answers are calculated automatically when the equation works out.')}</div>`;
    if (autoCalcNote) localStorage.setItem('netto_auto_calc_note_seen', 'true');
    listEl.innerHTML = [[p.q1_label, p.q1_answer], [p.q2_label, p.q2_answer], [p.q3_label, p.q3_answer]].map((q, i) =>
      `<div class="q-block"><div class="q-label">${q[0] || 'Vraag niet beschikbaar'}</div><div class="input-wrapper"><input type="text" class="daily-style-input" id="raceAnswer${i}" name="netto-race-${i}" inputmode="numeric" enterkeyhint="${i < 2 ? 'next' : 'go'}" placeholder="Jouw schatting" autocomplete="off" autocorrect="off" spellcheck="false" data-lpignore="true"></div></div>${i < 2 ? `<div class="connector"><div class="connector-line"></div><div class="connector-badge ${i === 1 ? 'eq' : ''}">${i === 0 ? (p.operator || '×') : '='}</div><div class="connector-line"></div></div>` : ''}`).join('') + autoCalcNote;
    // De race gebruikt dezelfde eenheden en toegankelijke vraaglabels als vrij spelen.
    werkVraagDetailsBij(p, [...listEl.querySelectorAll(':scope > .q-block')], false);
    renderPuzzelfoto(listEl, p);
    [0, 1, 2].forEach(i => autoCalculatedInputs.delete(`raceAnswer${i}`));
    bindRaceInputs(p.operator || '×');
    setRaceInputsEnabled(raceState.live);
    if (raceState.live) focusFirstEmptyRaceInput();
  }

  function bindRaceInputs(operator) {
    [0, 1, 2].forEach(index => {
      const input = document.getElementById(`raceAnswer${index}`);
      if (!input) return;
      input.addEventListener('keydown', event => nettoNumberKeydown(event, input, () => nettoAnswerEnter('race', index, submitPuzzleRace)));
    });
    bindDerivedInputs('race', operator);
  }

  function submitPuzzleRace() {
    if (!raceState) return;
    const now = Date.now();
    if (now < raceState.startsAt) return;
    if (now >= raceState.endsAt) { finishRace(true); return; }
    // Een dubbele klik of een ingedrukt gehouden Enter levert niet twee keer in.
    if (now - raceLastSubmitAt < 400) return;
    const p = raceQueue[raceState.index];
    if (!p) { finishRace(false); return; }
    const answers = [p.q1_answer, p.q2_answer, p.q3_answer];
    // Vrij spelen accepteert ook positieve decimalen, net als de Library.
    const guesses = [0, 1, 2].map(i => parseFormattedNumber(document.getElementById(`raceAnswer${i}`).value));
    if (!validWholeAnswers(guesses)) {
      showNoticeToast(
        statsCopy('Vul alle drie de vragen in met een getal groter dan 0.', 'Enter a number greater than 0 for all three questions.'),
        '✏️', statsCopy('Antwoorden ontbreken', 'Complete your answers'));
      return;
    }
    if (isEquationRequired() && !validWholeEquation(guesses, p.operator || '×')) { showEquationNotice(); return; }
    raceLastSubmitAt = now;
    const factor = answers.reduce((sum, a, i) => sum + scoreVraag(guesses[i], a), 0) / 3;
    const exact = guesses[0] === answers[0] && guesses[1] === answers[1] && guesses[2] === answers[2];
    // Een punt valt binnen de gekozen speling. Bij 1,00 komt dat neer op exact
    // goed; de kleine marge vangt alleen afrondingsruis van het delen door drie.
    const grens = raceState.tolerantie;
    const raak = factor <= grens + 0.0001;
    if (exact) { launchConfetti(); showExactRaceNotice(); }
    raceState.results.push({ puzzle: p, guesses, factor, exact, raak });
    raceState.correct += raak ? 1 : 0;
    raceState.streak = raak ? raceState.streak + 1 : 0;
    raceState.longestStreak = Math.max(raceState.longestStreak, raceState.streak);
    pushRaceChip(raak);
    if (raceDuelSession && raceState.isDuel) {
      broadcastRaceEvent(raceDuelSession.code, 'result', { exact: raak, factor, correct: raceState.correct, attempted: raceState.results.length, seed: raceState.seed });
    }
    // Directe feedback: wat het was, en hoe ver je ernaast zat.
    const fb = document.getElementById('raceFeedback');
    const real = `${fmt(answers[0])} ${p.operator || '×'} ${fmt(answers[1])} = ${fmt(answers[2])}`;
    const streak = raceState.streak >= 3 ? ` · 🔥 ${raceState.streak}` : '';
    fb.textContent = exact
      ? statsCopy(`✓ Exact goed!${streak}`, `✓ Exactly right!${streak}`)
      : raak
        ? statsCopy(`✓ Binnen de marge (${raceFactorText(factor)}) · het was ${real}${streak}`, `✓ Within tolerance (${raceFactorText(factor)}) · it was ${real}${streak}`)
        : statsCopy(`✗ ${raceFactorText(factor)} ernaast · het was ${real}`, `✗ ${raceFactorText(factor)} off · it was ${real}`);
    fb.className = 'race-feedback';
    void fb.offsetWidth; // herstart de korte animatie
    fb.className = 'race-feedback ' + (raak ? 'is-good' : 'is-bad');
    raceState.index += 1;
    saveRaceRun();
    if (raceState.index >= raceQueue.length) { finishRace(false); return; }
    renderRacePuzzle();
  }

  function pushRaceChip(exact) {
    const el = document.getElementById('raceHistory');
    if (!el) return;
    const chip = document.createElement('span');
    chip.className = `race-chip ${exact ? 'good' : 'bad'}`;
    chip.textContent = exact ? '✓' : '✕';
    el.appendChild(chip);
    el.scrollLeft = el.scrollWidth;
  }

  function finishRace(byTime) {
    if (!raceState) return;
    stopRaceTimer();
    updateRaceCountdown(0);
    const state = raceState;
    const attempted = state.results.length;
    if (!state.statsSaved) {
      window.nettoTrack?.('race_finish', { mode:'race' });

      const saved = readStatsStorage('netto_race_stats', []);
      const history = Array.isArray(saved) ? saved : [];
      // Een momentopname blijft bruikbaar als de puzzelcatalogus later verandert.
      history.push(...state.results.map(result => ({ factor: result.factor, exact: result.exact,
        guesses: result.guesses, answers: [result.puzzle.q1_answer, result.puzzle.q2_answer, result.puzzle.q3_answer],
        operators: [result.puzzle.operator], categories: result.puzzle.categories || [], completedAt: new Date().toISOString() })));
      writeRaceStore(localStorage, 'netto_race_stats', history);
      state.statsSaved = true;
    }
    const correct = state.correct;
    const longest = state.longestStreak;
    const best = readRaceBest(state.durationKey, state.toleranceKey, state.themeKey);
    const isRecord = correct > best;
    if (isRecord) writeRaceBest(state.durationKey, state.toleranceKey, correct, state.themeKey);
    const you = statsCopy('jij', 'you');
    const real = statsCopy('echt', 'actual');
    const review = state.results.map((r, i) => `
      <div class="race-review-item ${r.raak ? 'good' : 'bad'}">
        <div class="race-review-head"><b>#${i + 1}</b><span class="race-review-op">${r.puzzle.operator}</span><span class="race-review-verdict">${r.exact ? '✓ exact' : `${r.raak ? '✓' : '✗'} ${raceFactorText(r.factor)}`}</span></div>
        <div class="race-review-calc">${r.puzzle.calculation || ''}</div>
        <div class="race-review-answers">${[[r.puzzle.q1_label, r.puzzle.q1_answer, r.guesses[0]], [r.puzzle.q2_label, r.puzzle.q2_answer, r.guesses[1]], [r.puzzle.q3_label, r.puzzle.q3_answer, r.guesses[2]]].map(row => `<div class="race-review-row"><span>${row[0]}</span><b class="${Number(row[2]) === Number(row[1]) ? 'ok' : 'no'}">${you}: ${fmt(row[2])} · ${real}: ${fmt(row[1])}</b></div>`).join('')}</div>
      </div>`).join('') || `<div class="race-review-empty">${statsCopy('Geen puzzels ingediend. Zet meteen een nieuwe race in!', 'No puzzles submitted. Start a new race right away!')}</div>`;
    document.getElementById('raceFinalScore').textContent = correct;
    document.getElementById('raceFinalScoreLabel').textContent = state.tolerantie === 1
      ? statsCopy('puzzels exact goed', 'puzzles exactly right')
      : statsCopy('puzzels binnen de marge', 'puzzles within tolerance');
    const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
    const stat = (value, label) => `<span class="race-summary-stat"><strong>${value}</strong><span>${label}</span></span>`;
    const meta = stat(attempted, statsCopy('Gespeeld', 'Played'))
      + stat(`${accuracy}%`, statsCopy('Nauwkeurigheid', 'Accuracy'))
      + stat(longest, statsCopy('Langste reeks', 'Best streak'))
      + stat(Math.max(best, correct), statsCopy('Jouw record', 'Personal best'))
      + `<span class="race-summary-note">${raceSettingLabel(state.durationKey, state.toleranceKey)}${byTime ? '' : ` · ${statsCopy('alle puzzels gespeeld', 'all puzzles played')}`}</span>`
      + (isRecord && correct > 0 ? `<span class="race-summary-record">🏆 ${best > 0
        ? statsCopy(`Nieuw persoonlijk record! Vorige: ${best}`, `New personal best! Previous: ${best}`)
        : statsCopy('Eerste record gezet!', 'First record set!')}</span>` : '');
    document.getElementById('raceResultsMeta').innerHTML = meta;
    document.getElementById('raceReviewList').innerHTML = review;
    window.NettoShare?.mountRace({ correct, attempted, longest, tolerance: raceState.tolerantie, seconds: raceState.totalSeconds });
    document.getElementById('racePlay').style.display = 'none';
    document.getElementById('raceResults').style.display = 'block';
    const again = document.getElementById('raceAgainButton');
    if (again) again.textContent = state.isDuel && raceDuelSession ? statsCopy('Revanche →', 'Rematch →') : statsCopy('Nog een race →', 'Race again →');
    if (isRecord && correct > 0) launchConfetti();
    raceState = null;
    clearRaceRun();
    if (state.isDuel && raceDuelSession) {
      raceDuelSession.myCorrect = correct;
      raceDuelSession.myAttempted = attempted;
      broadcastRaceEvent(raceDuelSession.code, 'finish', { correct, attempted, seed: state.seed });
      trackRacePresence();
      tryShowDuelVerdict();
      // Is de eindstand van de ander na een paar seconden nog niet binnen, vraag hem dan op.
      const session = raceDuelSession;
      setTimeout(() => {
        if (raceDuelSession === session && session.opponent && !session.opponent.finished) sendRaceHello();
      }, 4000);
      if (!session.opponentPresent) scheduleRaceGoneVerdict();
    } else {
      document.getElementById('raceDuelVerdict').style.display = 'none';
    }
    document.getElementById('raceScreen').scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // ===== PUZZEL RACE DUEL — live 1v1 via Supabase Realtime =====
  // Presence ontdekt de tegenstander (betrouwbaar, ook als de ene eerder join't);
  // broadcast-events versturen start, per-puzzel resultaat en de finish.
  let raceDuelSession = null;
  // Per tab vast, zodat je na een refresh dezelfde speler blijft in je duel.
  const RACE_CLIENT_ID = (() => {
    const fresh = 'c_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    try {
      const saved = sessionStorage.getItem('netto_race_client');
      if (saved && /^c_[a-z0-9]+$/.test(saved)) return saved;
      sessionStorage.setItem('netto_race_client', fresh);
    } catch (_) {}
    return fresh;
  })();

  function raceDisplayName() {
    // core.js bewaart de gebruikersnaam als currentUser.username; user_metadata
    // bestaat alleen op het ruwe Supabase-object.
    if (!currentUser) return nettoGuestName() || statsCopy('Speler', 'Player');
    return currentUser.username || (currentUser.user_metadata && currentUser.user_metadata.username)
      || (currentUser.email ? currentUser.email.split('@')[0] : statsCopy('Speler', 'Player'));
  }

  // Een duel loopt volledig via Realtime, dus een account is niet nodig: een
  // naam is genoeg. Zo kan een vriend direct vanuit een gedeelde link meedoen.
  async function ensureRacePlayer() {
    if (currentUser || nettoGuestName()) return true;
    return Boolean(await nettoAskPlayerName({
      title: statsCopy('Hoe heet je?', 'What is your name?'),
      text: statsCopy('Je tegenstander ziet deze naam. Je hebt geen account nodig om te racen.', 'Your opponent sees this name. You do not need an account to race.')
    }));
  }

  function generateRaceRoomCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    return code;
  }

  function raceChannelName(code, mode = 'race') { return `netto-race:${mode === 'live' ? 'live:' : ''}${String(code).toUpperCase()}`; }

  // Beide online spelmodi gebruiken dezelfde Supabase-verbinding en kanaalconfiguratie.
  function nettoRoomChannel(code, mode = 'race', client = supabaseClient) {
    return client.channel(raceChannelName(code, mode), {
      config: { broadcast: { self: false }, presence: { key: RACE_CLIENT_ID } }
    });
  }

  async function createRaceRoom(visibility = 'closed', config = null) {
    if (!(await ensureRacePlayer())) return;
    const selected = config || getRaceModeConfig('online');
    leaveRaceRoom();
    connectRaceRoom(generateRaceRoomCode(), 'host', {
      visibility,
      durationKey: selected.durationKey,
      toleranceKey: selected.toleranceKey
    });
  }

  function createClosedRaceGame() {
    createRaceRoom('closed', getRaceModeConfig('online'));
  }

  function raceCodeFrom(value) {
    return String(value || '').replace(/[\s-]/g, '').toUpperCase();
  }

  async function joinRaceRoom(inputId = 'raceOnlineJoinCode') {
    const raw = raceCodeFrom(document.getElementById(inputId)?.value);
    if (!/^[A-Z2-9]{6}$/.test(raw)) {
      showNoticeToast(statsCopy('Vul een geldige room-code in (6 tekens).', 'Enter a valid 6-character room code.'), '⚠️', statsCopy('Ongeldige code', 'Invalid code'));
      return;
    }
    await joinRaceRoomCode(raw);
  }

  async function joinRaceRoomCode(code, config = {}) {
    if (!(await ensureRacePlayer())) return false;
    leaveRaceRoom();
    switchRaceMode('online');
    connectRaceRoom(raceCodeFrom(code), 'guest', { visibility: 'closed', ...config });
    return true;
  }

  function joinOpenRaceGame(code, durationKey) {
    joinRaceRoomCode(code, { visibility: 'open', durationKey });
  }

  // Wordt aangeroepen vanuit een gedeelde link: /race/online/?join=CODE
  function handleRaceInvite(code) {
    if (!/^[A-Z2-9]{6}$/.test(code)) return;
    if (raceDuelSession && raceDuelSession.code === code) return;
    if (!document.getElementById('raceScreen')?.classList.contains('active')) openPuzzleRace();
    switchRaceMode('online');
    const input = document.getElementById('raceOnlineJoinCode');
    if (input) input.value = code;
    joinRaceRoomCode(code);
  }

  function raceRoomSnapshot(session) {
    writeRaceStore(sessionStorage, RACE_ROOM_KEY, session ? {
      code: session.code, role: session.role, visibility: session.visibility, durationKey: session.durationKey,
      toleranceKey: session.toleranceKey, createdAt: session.createdAt, joinedAt: session.joinedAt
    } : null);
  }

  function connectRaceRoom(code, role, config = {}) {
    const durationKey = RACE_DURATIONS[config.durationKey] ? config.durationKey : null;
    const toleranceKey = RACE_TOLERANTIES[config.toleranceKey] ? config.toleranceKey : null;
    const session = {
      code: String(code).toUpperCase(),
      role,
      visibility: config.visibility === 'open' ? 'open' : 'closed',
      durationKey,
      toleranceKey,
      createdAt: Number(config.createdAt) || Date.now(),
      joinedAt: Number(config.joinedAt) || Date.now(),
      channel: null,
      subscribed: false,
      opponentId: null,
      opponentName: null,
      opponentPresent: false,
      everSawOpponent: false,
      opponentLeft: false,
      opponent: null,
      myCorrect: null,
      seed: null,
      started: Boolean(config.started),
      wantsRematch: false
    };
    raceDuelSession = session;
    raceRoomSnapshot(session);
    showRaceDuelRoom(session.code);
    renderDuelPlayers();
    renderRaceRoomSettings();
    renderDuelRoomState();
    // Een gast die geen host vindt, krijgt na een paar seconden uitleg in plaats van eindeloos "wachten".
    session.lonelyTimer = setTimeout(() => { if (raceDuelSession === session) { session.lonelyChecked = true; renderDuelRoomState(); } }, 7000);
    nettoWhenOnline(() => openRaceChannel(session));
  }

  function openRaceChannel(session) {
    if (raceDuelSession !== session || session.channel) return;
    if (!supabaseClient) {
      setRaceDuelStatus(statsCopy('Geen verbinding met de server. Controleer je internet en probeer het opnieuw.', 'Could not reach the server. Check your connection and try again.'));
      return;
    }
    if (session.visibility === 'open') ensureRaceLobby();
    const channel = nettoRoomChannel(session.code);
    session.channel = channel;
    const on = event => ({ payload }) => { if (raceDuelSession === session) handleRaceEvent(event, payload || {}); };
    channel
      .on('presence', { event: 'sync' }, () => { if (raceDuelSession === session) handleRacePresence(channel); })
      .on('broadcast', { event: 'start' }, on('start'))
      .on('broadcast', { event: 'result' }, on('result'))
      .on('broadcast', { event: 'progress' }, on('progress'))
      .on('broadcast', { event: 'finish' }, on('finish'))
      .on('broadcast', { event: 'leave' }, on('leave'))
      .on('broadcast', { event: 'hello' }, on('hello'))
      .on('broadcast', { event: 'rematch' }, on('rematch'))
      .subscribe(status => {
        if (raceDuelSession !== session) return;
        if (status === 'SUBSCRIBED') {
          // Ook na een herverbinding: opnieuw aanmelden en de stand opvragen.
          session.subscribed = true;
          session.connectionLost = false;
          trackRacePresence();
          sendRaceHello();
          if (session.myCorrect != null) broadcastRaceEvent(session.code, 'finish', { correct: session.myCorrect, attempted: session.myAttempted || 0, seed: session.seed });
          renderDuelRoomState();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          session.subscribed = false;
          session.connectionLost = true;
          renderDuelRoomState();
        }
      });
  }

  function racePhase() {
    const session = raceDuelSession;
    if (raceState && raceState.isDuel) return 'playing';
    if (session && session.myCorrect != null) return 'finished';
    return 'lobby';
  }

  function trackRacePresence() {
    const session = raceDuelSession;
    if (!session || !session.channel || !session.subscribed) return;
    try {
      Promise.resolve(session.channel.track({
        client_id: RACE_CLIENT_ID,
        name: raceDisplayName(),
        role: session.role,
        visibility: session.visibility,
        durationKey: session.durationKey,
        toleranceKey: session.toleranceKey,
        createdAt: session.createdAt,
        joinedAt: session.joinedAt,
        phase: racePhase(),
        seed: session.seed
      })).catch(() => {});
    } catch (_) {}
  }

  function sendRaceHello() {
    const session = raceDuelSession;
    if (!session) return;
    broadcastRaceEvent(session.code, 'hello', { seed: session.seed, phase: racePhase(), wantsRematch: session.wantsRematch });
  }

  function handleRacePresence(channel) {
    const session = raceDuelSession;
    if (!session) return;
    const byId = new Map();
    Object.values(channel.presenceState() || {}).forEach(metas => metas.forEach(meta => {
      if (meta && meta.client_id && meta.client_id !== RACE_CLIENT_ID) byId.set(meta.client_id, meta);
    }));
    const others = [...byId.values()];
    const joined = (a, b) => (Number(a.joinedAt) || 0) - (Number(b.joinedAt) || 0) || String(a.client_id).localeCompare(String(b.client_id));
    let opponent = null;
    if (session.role === 'guest') {
      // Een duel is 1 tegen 1. Kwam er al een andere gast eerder binnen, dan is de room vol.
      const earlier = others.filter(meta => meta.role === 'guest' && joined(meta, { joinedAt: session.joinedAt, client_id: RACE_CLIENT_ID }) < 0);
      if (earlier.length && !session.started) {
        leaveRaceRoom();
        showNoticeToast(
          statsCopy('Deze room is vol: een duel is 1 tegen 1. Vraag om een nieuwe code, of speel met meer mensen in Live Rondes.', 'This room is full: a duel is one against one. Ask for a new code, or play with more people in Live Rounds.'),
          '🚪', statsCopy('Room vol', 'Room full'), { duration: 7000 });
        return;
      }
      opponent = others.find(meta => meta.role === 'host') || null;
    } else {
      const guests = others.filter(meta => meta.role === 'guest').sort(joined);
      // Tijdens een wedstrijd telt alleen de eigen tegenstander; daarna mag een nieuwe gast aanschuiven.
      opponent = guests.find(meta => meta.client_id === session.opponentId)
        || (raceState && raceState.isDuel ? null : guests[0]) || null;
    }
    const wasPresent = session.opponentPresent;
    if (opponent) {
      const isNew = session.opponentId !== opponent.client_id;
      session.opponentId = opponent.client_id;
      session.opponentName = String(opponent.name || statsCopy('Tegenstander', 'Opponent')).slice(0, 24);
      session.opponentPresent = true;
      session.everSawOpponent = true;
      session.opponentLeft = false;
      clearRaceGoneTimer();
      // De gast neemt de instellingen van de host over, zolang er niet gespeeld wordt.
      if (session.role === 'guest' && !raceState) {
        if (RACE_DURATIONS[opponent.durationKey]) session.durationKey = opponent.durationKey;
        if (RACE_TOLERANTIES[opponent.toleranceKey]) session.toleranceKey = opponent.toleranceKey;
        renderRaceRoomSettings();
      }
      if (!session.opponent) session.opponent = { correct: 0, attempted: 0, finished: false };
      if (isNew && !raceState) showNoticeToast(
        statsCopy(`${session.opponentName} is in de room!`, `${session.opponentName} joined the room!`),
        '🎮', statsCopy('Speler gevonden', 'Player joined'));
      // De host speelt al (bijvoorbeeld een gemist startsignaal): vraag de start opnieuw op.
      if (session.role === 'guest' && opponent.phase === 'playing' && !raceState && Number(opponent.seed) !== Number(session.seed)) sendRaceHello();
      if (session.role === 'host' && session.visibility === 'open' && !session.started) scheduleOpenRaceAutoStart();
    } else {
      session.opponentPresent = false;
      clearOpenRaceAutoStart();
    }
    renderDuelPlayers();
    renderDuelRoomState();
    if (raceState && raceState.isDuel) updateOpponentScoreline();
    if (wasPresent && !session.opponentPresent) scheduleRaceGoneVerdict();
  }

  // Valt de tegenstander weg (tab dicht, netwerk), dan wacht het eindscherm nog
  // even en toont daarna een uitslag in plaats van eeuwig te blijven wachten.
  function clearRaceGoneTimer() {
    if (raceDuelSession && raceDuelSession.goneTimer) { clearTimeout(raceDuelSession.goneTimer); raceDuelSession.goneTimer = null; }
  }
  function scheduleRaceGoneVerdict(delay = 15000) {
    const session = raceDuelSession;
    if (!session || session.goneTimer) return;
    session.goneTimer = setTimeout(() => {
      session.goneTimer = null;
      if (raceDuelSession !== session || session.opponentPresent) return;
      session.opponentLeft = true;
      if (raceState && raceState.isDuel) updateOpponentScoreline();
      tryShowDuelVerdict();
      renderDuelRoomState();
    }, delay);
  }

  function handleRaceEvent(event, payload) {
    const session = raceDuelSession;
    if (!session) return;
    if (payload.to && payload.to !== RACE_CLIENT_ID) return;
    // Alleen berichten van de eigen tegenstander tellen; een derde in de room wordt genegeerd.
    if (payload.from && session.opponentId && payload.from !== session.opponentId && event !== 'hello') return;
    const sameMatch = payload.seed == null || session.seed == null || Number(payload.seed) === Number(session.seed);
    if (event === 'start') {
      if (session.role !== 'guest' || !Number.isFinite(Number(payload.seed))) return;
      const seed = Number(payload.seed) >>> 0;
      if (raceState && raceState.isDuel && raceState.seed === seed) return;
      if (raceState && !raceState.isDuel) return;
      if (payload.from && !session.opponentId) session.opponentId = payload.from;
      startRaceCore(true, {
        seed,
        durationKey: payload.durationKey,
        toleranceKey: payload.toleranceKey,
        countdownMs: Number.isFinite(Number(payload.countdownMs)) ? Number(payload.countdownMs) : RACE_COUNTDOWN_MS,
        remainingMs: Number.isFinite(Number(payload.remainingMs)) ? Number(payload.remainingMs) : undefined
      });
    } else if (event === 'result' || event === 'progress') {
      if (!sameMatch) return;
      if (!session.opponent) session.opponent = { correct: 0, attempted: 0, finished: false };
      if (event === 'result') pushOpponentChip(Boolean(payload.exact));
      if (Number.isFinite(Number(payload.correct))) session.opponent.correct = Number(payload.correct);
      else if (payload.exact) session.opponent.correct += 1;
      if (Number.isFinite(Number(payload.attempted))) session.opponent.attempted = Number(payload.attempted);
      updateOpponentScoreline();
    } else if (event === 'finish') {
      if (!sameMatch) return;
      if (!session.opponent) session.opponent = { correct: 0, attempted: 0 };
      session.opponent.correct = Number(payload.correct) || 0;
      session.opponent.attempted = Number(payload.attempted) || 0;
      session.opponent.finished = true;
      updateOpponentScoreline();
      tryShowDuelVerdict();
    } else if (event === 'leave') {
      session.opponentPresent = false;
      session.opponentLeft = true;
      if (session.opponent) session.opponent.wantsRematch = false;
      clearOpenRaceAutoStart();
      if (raceState && raceState.isDuel) updateOpponentScoreline();
      tryShowDuelVerdict();
      renderDuelPlayers();
      renderDuelRoomState();
    } else if (event === 'hello') {
      answerRaceHello(payload);
    } else if (event === 'rematch') {
      if (!session.opponent) session.opponent = { correct: 0, attempted: 0, finished: false };
      session.opponent.wantsRematch = true;
      if (session.role === 'host' && session.wantsRematch && session.opponentPresent && !raceState) { startDuelRace(); return; }
      renderDuelRoomState();
      if (!session.wantsRematch && !raceState) {
        showNoticeToast(
          statsCopy(`${session.opponentName || 'Je tegenstander'} wil een revanche!`, `${session.opponentName || 'Your opponent'} wants a rematch!`),
          '🔁', statsCopy('Revanche?', 'Rematch?'),
          { id: 'raceRematchNotice', duration: 10000, actionLabel: statsCopy('Revanche', 'Rematch'), onAction: requestRaceRematch });
      }
    }
  }

  // Antwoord op 'hello': een (her)verbonden tegenstander krijgt zo de start,
  // de tussenstand of de eindstand die hij misschien gemist heeft.
  function answerRaceHello(payload) {
    const session = raceDuelSession;
    if (!session || !payload.from) return;
    const to = payload.from;
    if (session.role === 'host' && raceState && raceState.isDuel && Number(payload.seed) !== raceState.seed && payload.phase !== 'playing') {
      if (session.opponentId && session.opponentId !== to) return;
      const now = Date.now();
      broadcastRaceEvent(session.code, 'start', {
        to, seed: raceState.seed, durationKey: raceState.durationKey, toleranceKey: raceState.toleranceKey,
        countdownMs: Math.max(0, raceState.startsAt - now),
        remainingMs: Math.max(0, raceState.endsAt - Math.max(now, raceState.startsAt))
      });
      return;
    }
    if (raceState && raceState.isDuel) {
      broadcastRaceEvent(session.code, 'progress', { to, seed: raceState.seed, correct: raceState.correct, attempted: raceState.results.length });
    } else if (session.myCorrect != null) {
      broadcastRaceEvent(session.code, 'finish', { to, seed: session.seed, correct: session.myCorrect, attempted: session.myAttempted || 0 });
    }
    if (session.wantsRematch) broadcastRaceEvent(session.code, 'rematch', { to });
  }

  function broadcastRaceEvent(code, event, payload) {
    const session = raceDuelSession;
    if (!session || session.code !== code || !session.channel) return;
    try {
      Promise.resolve(session.channel.send({ type: 'broadcast', event, payload: { ...payload, from: RACE_CLIENT_ID } })).catch(() => {});
    } catch (_) {}
  }

  function requestRaceRematch() {
    const session = raceDuelSession;
    if (!session) { startPuzzleRace(); return; }
    document.getElementById('raceRematchNotice')?.remove();
    session.wantsRematch = true;
    broadcastRaceEvent(session.code, 'rematch', {});
    // Terug naar de room: daar ziet iedereen wie er klaar is voor de volgende ronde.
    document.getElementById('raceResults').style.display = 'none';
    document.getElementById('racePlay').style.display = 'none';
    document.getElementById('raceStart').style.display = 'block';
    showRaceDuelRoom(session.code);
    renderDuelPlayers();
    renderRaceRoomSettings();
    if (session.role === 'host' && session.opponentPresent && session.opponent && session.opponent.wantsRematch) { startDuelRace(); return; }
    renderDuelRoomState();
    document.getElementById('raceScreen').scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function shareRaceInvite() {
    if (raceDuelSession) nettoShareInvite('race', raceDuelSession.code);
  }

  function pushOpponentChip(exact) {
    const el = document.getElementById('raceOpponentHistory');
    if (!el) return;
    el.style.display = 'flex';
    const chip = document.createElement('span');
    chip.className = `race-chip ${exact ? 'good' : 'bad'}`;
    chip.textContent = exact ? '✓' : '✕';
    el.appendChild(chip);
    el.scrollLeft = el.scrollWidth;
  }

  function updateOpponentScoreline() {
    const label = document.getElementById('raceOpponentLabel');
    if (!label || !raceDuelSession) return;
    const session = raceDuelSession;
    label.style.display = 'block';
    const correct = session.opponent ? session.opponent.correct : 0;
    const name = session.opponentName || statsCopy('Tegenstander', 'Opponent');
    const suffix = session.opponent && session.opponent.finished ? ` · ${statsCopy('klaar', 'finished')}`
      : session.opponentLeft ? ` · ${statsCopy('weg', 'left')}`
        : !session.opponentPresent ? ` · ${statsCopy('verbinding kwijt…', 'connection lost…')}` : '';
    label.textContent = `${name} · ${correct} ${statsCopy('goed', 'correct')}${suffix}`;
  }

  function tryShowDuelVerdict() {
    const session = raceDuelSession;
    if (!session || session.myCorrect == null) return;
    if (document.getElementById('raceResults').style.display !== 'block') return;
    const v = document.getElementById('raceDuelVerdict');
    const me = session.myCorrect;
    const opp = session.opponent ? session.opponent.correct : 0;
    const name = escapeHtml(session.opponentName || statsCopy('je tegenstander', 'your opponent'));
    v.style.display = 'block';
    if (!session.opponent || !session.opponent.finished) {
      if (session.opponentLeft) {
        v.className = 'race-duel-verdict left';
        v.innerHTML = statsCopy(`🚪 <b>${name} is gestopt</b> Jij haalde ${me}, ${name} stond op ${opp}.`, `🚪 <b>${name} left the duel</b> You scored ${me}; ${name} was on ${opp}.`);
      } else {
        v.className = 'race-duel-verdict waiting';
        v.innerHTML = statsCopy(`⏳ <b>Wachten op ${name}…</b> Tussenstand ${me} – ${opp}`, `⏳ <b>Waiting for ${name}…</b> Current score ${me} – ${opp}`);
      }
      return;
    }
    if (me > opp) { v.className = 'race-duel-verdict win'; v.innerHTML = statsCopy(`🏆 <b>Jij wint!</b> ${me} – ${opp} tegen ${name}`, `🏆 <b>You win!</b> ${me} – ${opp} against ${name}`); }
    else if (me < opp) { v.className = 'race-duel-verdict lose'; v.innerHTML = statsCopy(`💪 <b>${name} wint</b> ${opp} – ${me}. Revanche?`, `💪 <b>${name} wins</b> ${opp} – ${me}. Rematch?`); }
    else { v.className = 'race-duel-verdict tie'; v.innerHTML = statsCopy(`🤝 <b>Gelijkspel</b> ${me} – ${opp} tegen ${name}`, `🤝 <b>Draw</b> ${me} – ${opp} against ${name}`); }
  }

  function showRaceDuelRoom(code) {
    document.querySelector('#raceStart .race-mode-tabs').hidden = true;
    const setup = document.getElementById('raceDuelSetup');
    const room = document.getElementById('raceDuelRoom');
    if (setup) setup.style.display = 'none';
    // Verberg de mode-panels zodra er een room actief is.
    ['raceSoloSetup', 'raceOnlineSetup'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    if (room) room.style.display = 'block';
    const isRoomOpen = raceDuelSession && raceDuelSession.visibility === 'open' && raceDuelSession.role === 'host' && !raceDuelSession.started;
    const note = document.getElementById('raceOpenRoomNote');
    if (note) note.style.display = isRoomOpen ? 'block' : 'none';
    const codeEl = document.getElementById('raceRoomCode');
    if (codeEl) codeEl.textContent = code;
    const link = document.getElementById('raceInviteLink');
    if (link) link.value = nettoInviteUrl('race', code);
    const startBtn = document.getElementById('raceDuelStartBtn');
    if (startBtn) startBtn.style.display = 'none';
  }

  function resetRaceDuelUi() {
    const setup = document.getElementById('raceDuelSetup');
    const room = document.getElementById('raceDuelRoom');
    if (setup) setup.style.display = 'block';
    if (room) room.style.display = 'none';
    const joinInput = document.getElementById('raceOnlineJoinCode');
    if (joinInput) joinInput.value = '';
    const verdict = document.getElementById('raceDuelVerdict');
    if (verdict) verdict.style.display = 'none';
    const oppEl = document.getElementById('raceOpponentHistory');
    if (oppEl) { oppEl.style.display = 'none'; oppEl.innerHTML = ''; }
    const oppLabel = document.getElementById('raceOpponentLabel');
    if (oppLabel) oppLabel.style.display = 'none';
  }

  function setRaceDuelStatus(text) {
    const el = document.getElementById('raceDuelStatus');
    if (el && el.textContent !== text) el.textContent = text;
  }

  // Eén plek die de wachtkamer uitlegt: wie is er, op wie wacht je, wat nu.
  function renderDuelRoomState() {
    const session = raceDuelSession;
    if (!session) return;
    const name = session.opponentName || statsCopy('je tegenstander', 'your opponent');
    const startBtn = document.getElementById('raceDuelStartBtn');
    const canStart = session.role === 'host' && session.opponentPresent && !raceState;
    if (startBtn) {
      startBtn.style.display = canStart ? 'block' : 'none';
      startBtn.textContent = session.started ? statsCopy('Start revanche →', 'Start rematch →') : statsCopy('Start duel →', 'Start duel →');
    }
    let text;
    if (session.connectionLost) text = statsCopy('Verbinding weg. We proberen het opnieuw…', 'Connection lost. Reconnecting…');
    else if (!session.subscribed) text = statsCopy('Verbinden…', 'Connecting…');
    else if (session.role === 'host') {
      if (session.opponentPresent) {
        if (session.autoStartDeadline) return; // de aftelling van een open game toont zichzelf
        text = session.started
          ? (session.opponent && session.opponent.wantsRematch
            ? statsCopy(`${name} wil een revanche. Start wanneer je wilt.`, `${name} wants a rematch. Start whenever you like.`)
            : statsCopy(`Wachten tot ${name} ook revanche kiest… of start meteen.`, `Waiting for ${name} to choose rematch… or start right away.`))
          : statsCopy(`${name} is er! Start het duel wanneer je wilt.`, `${name} is here! Start the duel whenever you like.`);
      } else if (session.everSawOpponent) {
        text = statsCopy(`${name} is weg. Wacht even of deel de link opnieuw.`, `${name} has left. Wait a moment or share the link again.`);
      } else {
        text = session.visibility === 'open'
          ? statsCopy('Je game staat open. Wachten op een speler… Je kunt ook de link delen.', 'Your game is open. Waiting for a player… You can also share the link.')
          : statsCopy('Deel de link of code. Het duel start zodra je tegenstander er is en jij op Start drukt.', 'Share the link or code. The duel starts once your opponent is here and you press Start.');
      }
    } else if (session.opponentPresent) {
      text = session.wantsRematch
        ? statsCopy(`Je wilt een revanche. Wachten tot ${name} start…`, `You want a rematch. Waiting for ${name} to start…`)
        : statsCopy(`Verbonden met ${name}. Wachten tot de host start…`, `Connected to ${name}. Waiting for the host to start…`);
    } else if (session.everSawOpponent) {
      text = statsCopy(`${name} (host) is weg. Wacht even of ga terug.`, `${name} (host) has left. Wait a moment or go back.`);
    } else if (session.lonelyChecked) {
      text = statsCopy(`Nog niemand in room ${session.code}. Klopt de code? De maker moet de room open hebben staan.`, `Nobody in room ${session.code} yet. Is the code right? The creator must keep the room open.`);
    } else {
      text = statsCopy('Room zoeken…', 'Looking for the room…');
    }
    setRaceDuelStatus(text);
  }

  function renderDuelPlayers() {
    const el = document.getElementById('raceDuelPlayers');
    if (!el || !raceDuelSession) return;
    const session = raceDuelSession;
    const opp = session.opponentName && session.opponentPresent
      ? `<b>${escapeHtml(session.opponentName)}</b>`
      : `<b class="is-waiting"><i>${statsCopy('wachten…', 'waiting…')}</i></b>`;
    const html = `<div class="race-duel-player"><span>${statsCopy('jij', 'you')}</span><b>${escapeHtml(raceDisplayName())}</b></div><div class="race-duel-player"><span>${statsCopy('tegen', 'versus')}</span>${opp}</div>`;
    if (el.innerHTML !== html) el.innerHTML = html;
  }

  function copyRaceRoomCode() {
    if (!raceDuelSession) return;
    const code = raceDuelSession.code;
    const done = () => showNoticeToast(statsCopy(`Room-code ${code} gekopieerd.`, `Room code ${code} copied.`), '📋', statsCopy('Gekopieerd', 'Copied'));
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done).catch(() => showNoticeToast(code, '📋', statsCopy('Kopieer deze code', 'Copy this code')));
    else showNoticeToast(code, '📋', statsCopy('Kopieer deze code', 'Copy this code'));
  }

  function leaveRaceRoom() {
    const session = raceDuelSession;
    if (session) {
      clearTimeout(session.lonelyTimer);
      clearTimeout(session.goneTimer);
      clearOpenRaceAutoStart();
      if (session.channel && supabaseClient) {
        // Het vertrekbericht gaat over dezelfde websocket vóór het afmelden de deur uit.
        try { broadcastRaceEvent(session.code, 'leave', {}); } catch (_) {}
        try { supabaseClient.removeChannel(session.channel); } catch (_) {}
      }
      if (session.role === 'host' && session.visibility === 'open') unpublishOpenRaceEntry();
    }
    raceDuelSession = null;
    raceRoomSnapshot(null);
    if (raceState && raceState.isDuel) { stopRaceTimer(); raceState = null; }
    if (!raceState) clearRaceRun();
    const room = document.getElementById('raceDuelRoom');
    if (room) room.style.display = 'none';
    // Toon weer het mode-paneel dat actief was (tabs + instellingen).
    const startEl = document.getElementById('raceStart');
    if (startEl && startEl.style.display !== 'none') switchRaceMode(raceMode);
  }

  // Leave-knop in de wachtkamer: ook terug naar de instellingen.
  function cancelRaceRoom() {
    leaveRaceRoom();
    document.getElementById('raceResults').style.display = 'none';
    document.getElementById('racePlay').style.display = 'none';
    document.getElementById('raceStart').style.display = 'block';
    resetRaceDuelUi();
    switchRaceMode('online');
  }

  // Tabs zijn ook volledig bedienbaar met pijltjestoetsen, Home en End.
  document.addEventListener('DOMContentLoaded', () => {
    const tabs = Array.from(document.querySelectorAll('#raceStart .race-mode-tab'));
    tabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
      if (event.ctrlKey || event.metaKey || event.altKey || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      switchRaceMode(next === 0 ? 'solo' : 'online');
      tabs[next].focus();
    }));
  });

  // Uitnodigingslink: /race/online/?join=CODE of /live-rounds/?join=CODE.
  // Pas na 'load' afhandelen: dan bestaan de route én de Supabase-client.
  function handleNettoInviteLink() {
    let url;
    try { url = new URL(location.href); } catch (_) { return; }
    const raw = url.searchParams.get('join') || url.searchParams.get('room');
    if (!raw) return;
    // Uit de adresbalk halen, zodat een refresh niet opnieuw een uitnodiging opent.
    url.searchParams.delete('join');
    url.searchParams.delete('room');
    history.replaceState(history.state, '', url);
    const code = raceCodeFrom(raw);
    if (!/^[A-Z2-9]{6}$/.test(code)) {
      showNoticeToast(statsCopy('Deze uitnodiging bevat geen geldige code.', 'This invite does not contain a valid code.'), '⚠️', statsCopy('Ongeldige link', 'Invalid link'));
      return;
    }
    if (url.pathname.includes('live-rounds')) window.NettoLive?.handleInvite(code);
    else handleRaceInvite(code);
  }
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('load', () => setTimeout(handleNettoInviteLink, 0));
  }

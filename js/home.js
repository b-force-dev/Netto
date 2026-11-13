// De home als landingpagina. Een nieuwe bezoeker krijgt de uitleg met een
// voorbeeld dat zichzelf één keer invult; wie al gespeeld heeft krijgt in
// plaats daarvan zijn streak en een knop om verder te gaan. Alle cijfers komen
// uit wat er werkelijk in het spel en in de browser van de speler staat.
(function () {
  const screen = document.getElementById('screen-home');
  if (!screen) return;
  const el = id => document.getElementById(id);
  const copy = (nl, en) => (typeof statsCopy === 'function' ? statsCopy(nl, en) : nl);
  const veilig = (lees, terugval) => { try { return lees(); } catch (_) { return terugval; } };

  // ---- Voorbeeld: 8 × 11 = 88, vakje voor vakje ----
  const demo = el('homeDemo');
  const replay = el('homeDemoReplay');
  const rustig = window.matchMedia('(prefers-reduced-motion: reduce)');
  let demoTimers = [];

  function stopDemo() {
    demoTimers.forEach(clearTimeout);
    demoTimers = [];
    if (!demo) return;
    demo.classList.remove('is-playing');
    demo.querySelectorAll('.lp-demo-card').forEach(card => card.classList.remove('is-pending', 'is-fresh'));
  }

  function playDemo() {
    if (!demo) return;
    stopDemo();
    const cards = Array.from(demo.querySelectorAll('.lp-demo-card'));
    demo.classList.add('is-playing');
    cards.forEach(card => card.classList.add('is-pending'));
    [800, 1600, 2700].forEach((wacht, index) => {
      demoTimers.push(setTimeout(() => {
        const card = cards[index];
        if (!card) return;
        card.classList.remove('is-pending');
        card.classList.add('is-fresh');
        if (index === cards.length - 1) {
          demo.classList.remove('is-playing');
          if (replay) replay.hidden = false;
        }
      }, wacht));
    });
  }

  if (replay) replay.addEventListener('click', playDemo);

  // ---- Wat weet deze browser al van de speler? ----
  function spelerstand() {
    const dailies = veilig(() => getDailyStatsEntries(), []);
    const libraryPlays = veilig(() => getSavedLibraryPlays(), {});
    const gespeeldePuzzels = veilig(() => libraryPuzzles.filter(p => libraryPlays[p.id] || libraryPlays['library_' + p.id]).length, 0);
    const verbanden = veilig(() => connectionProgress().results.length, 0);
    const races = veilig(() => {
      const opgeslagen = JSON.parse(localStorage.getItem('netto_race_stats') || '[]');
      return Array.isArray(opgeslagen) ? opgeslagen.length : 0;
    }, 0);
    return {
      dailies,
      gespeeldePuzzels,
      verbanden,
      terugkerend: dailies.length + gespeeldePuzzels + verbanden + races > 0,
      streak: veilig(() => getLocalStreak(), 0),
      vandaag: veilig(() => dailies.find(entry => entry.date === TODAY_STR), null),
      dailyStaatKlaar: veilig(() => PUZZLE_DATA.date === TODAY_STR, false)
    };
  }

  function statistiek(lijst, waarde, label) {
    const item = document.createElement('li');
    const getal = document.createElement('b');
    getal.textContent = waarde;
    item.append(getal, document.createTextNode(label));
    lijst.append(item);
  }

  function verderKnop(lijst, titel, uitleg, actie) {
    const knop = document.createElement('button');
    knop.type = 'button';
    knop.className = 'lp-continue-item';
    const naam = document.createElement('b');
    naam.textContent = titel;
    const detail = document.createElement('small');
    detail.textContent = uitleg;
    const pijl = document.createElement('i');
    pijl.setAttribute('aria-hidden', 'true');
    pijl.textContent = '→';
    knop.append(naam, pijl, detail);
    knop.addEventListener('click', actie);
    lijst.append(knop);
  }

  function renderWelkom(stand) {
    const procent = stand.vandaag ? Math.round(stand.vandaag.accuracy) : null;
    el('homeWelcomeTitle').textContent = stand.vandaag
      ? copy(`Vandaag: ${procent}% nauwkeurig.`, `Today: ${procent}% accurate.`)
      : stand.dailyStaatKlaar
        ? copy('Je Daily staat klaar.', 'Your Daily is ready.')
        : copy('Welkom terug.', 'Welcome back.');
    el('homeWelcomeLede').textContent = stand.vandaag
      ? copy('Morgen staat er een nieuwe Daily klaar. Tot dan kun je hiernaast verder spelen.', 'A new Daily arrives tomorrow. Until then, pick up where you left off.')
      : stand.streak > 0 && stand.dailyStaatKlaar
        ? copy(`Speel vandaag en je streak van ${stand.streak} ${stand.streak === 1 ? 'dag' : 'dagen'} loopt door.`, `Play today to keep your ${stand.streak}-day streak going.`)
        : copy('Drie nieuwe vragen, één som.', 'Three new questions, one equation.');

    const cijfers = el('homeWelcomeStats');
    cijfers.replaceChildren();
    statistiek(cijfers, '🔥 ' + stand.streak, copy(stand.streak === 1 ? 'dag streak' : 'dagen streak', stand.streak === 1 ? 'day streak' : 'day streak'));
    if (stand.dailies.length) {
      statistiek(cijfers, String(stand.dailies.length), copy(stand.dailies.length === 1 ? 'Daily gespeeld' : 'Daily’s gespeeld', stand.dailies.length === 1 ? 'Daily played' : 'Dailies played'));
      const gemiddeld = Math.round(stand.dailies.reduce((som, entry) => som + entry.accuracy, 0) / stand.dailies.length);
      statistiek(cijfers, gemiddeld + '%', copy('gemiddeld', 'average'));
    }

    el('homeCtaLabel').textContent = stand.vandaag
      ? copy('Bekijk je uitslag', 'View your result')
      : copy('Speel de Daily', 'Play today’s Daily');

    const lijst = el('homeContinueList');
    lijst.replaceChildren();
    const volgende = veilig(() => findNextIncompleteLibraryPuzzle(), null);
    if (volgende) {
      const niveau = veilig(() => LIBRARY_DIFFICULTY_LABEL[volgende.difficulty], '') || '';
      verderKnop(lijst, copy('Puzzels', 'Puzzles'),
        copy(`Verder met puzzel #${volgende.number}`, `Continue with puzzle #${volgende.number}`) + (niveau ? ' · ' + niveau : ''),
        () => startNextPuzzle());
    } else {
      verderKnop(lijst, copy('Puzzels', 'Puzzles'), copy('Alles gespeeld. Speel je favorieten opnieuw.', 'All played. Replay your favourites.'), () => openPuzzles());
    }
    const aantalVerbanden = veilig(() => (REBUILT_DATA.connection || libraryPuzzles).filter(cleanConnection).length, 0);
    verderKnop(lijst, 'Find the Connection',
      aantalVerbanden
        ? copy(`${Math.min(stand.verbanden, aantalVerbanden)} van ${aantalVerbanden} gespeeld`, `${Math.min(stand.verbanden, aantalVerbanden)} of ${aantalVerbanden} played`)
        : copy('Zoek de som achter drie vragen.', 'Find the equation behind three questions.'),
      () => startNextConnection());
    if (stand.vandaag) {
      verderKnop(lijst, 'Leaderboard', copy('Bekijk wie vandaag het dichtst bij zat.', 'See who came closest today.'), () => openLeaderboardModal());
    } else {
      verderKnop(lijst, copy('Puzzel Race', 'Puzzle Race'), copy('Zoveel mogelijk puzzels in 3, 5 of 10 minuten.', 'As many puzzles as you can in 3, 5 or 10 minutes.'), () => openPuzzleRace());
    }
  }

  // ---- Echte cijfers over de inhoud ----
  function renderCijfers() {
    const blok = el('homeFacts');
    if (!blok) return;
    const dailies = veilig(() => getArchiveDates().length, 0);
    const puzzels = veilig(() => libraryPuzzles.length, 0);
    const verbanden = veilig(() => (REBUILT_DATA.connection || libraryPuzzles).filter(cleanConnection).length, 0);
    if (!dailies || !puzzels || !verbanden) { blok.hidden = true; return; }
    el('homeFactDailies').textContent = dailies;
    el('homeFactPuzzles').textContent = puzzels;
    el('homeFactConnections').textContent = verbanden;
    blok.hidden = false;
  }

  let demoGespeeld = false;
  function render() {
    const stand = spelerstand();
    screen.classList.toggle('is-returning', stand.terugkerend);
    // "Vandaag" klopt alleen als de getoonde Daily ook echt die van vandaag is.
    const vandaagWoord = el('homeTodayWord');
    if (vandaagWoord) vandaagWoord.hidden = !stand.dailyStaatKlaar;
    el('homeWelcome').hidden = !stand.terugkerend;
    el('homeContinue').hidden = !stand.terugkerend;
    if (stand.terugkerend) {
      stopDemo();
      renderWelkom(stand);
    } else {
      el('homeCtaLabel').textContent = copy('Speel de Daily', 'Play today’s Daily');
      if (!demoGespeeld && !rustig.matches && screen.classList.contains('active')) {
        demoGespeeld = true;
        playDemo();
      }
    }
    renderCijfers();
  }

  // ---- Thema-knop in de voettekst volgt de instelling ----
  const themaKnop = el('homeThemeToggle');
  function toonThema() {
    if (themaKnop) themaKnop.setAttribute('aria-checked', String(document.documentElement.dataset.theme === 'dark'));
  }
  new MutationObserver(toonThema).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Opnieuw tekenen als de speler terugkomt op de home (na een puzzel is de
  // stand veranderd) en als de Daily van de server binnen is.
  new MutationObserver(() => { if (screen.classList.contains('active')) render(); })
    .observe(screen, { attributes: true, attributeFilter: ['class'] });
  const meta = el('heroDateMeta');
  if (meta) new MutationObserver(render).observe(meta, { childList: true, characterData: true, subtree: true });

  function start() { toonThema(); render(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
  // core.js start het spel bij DOMContentLoaded of load; daarna klopt de stand zeker.
  window.addEventListener('load', () => setTimeout(start, 0));
})();

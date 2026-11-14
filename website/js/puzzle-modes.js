// Netto frontend module.
// Loaded as a classic script so the existing shared global scope stays intact.

  // ===== Generieke puzzle-view (werkt voor 'library' én 'catalogus' prefix) =====
  function werkPuzzelNavigatieBij(prefix, ingeleverd) {
    const navigatie = document.querySelector('#' + prefix + 'PuzzleView .library-actions');
    if (!navigatie) return;
    const bibliotheek = prefix === 'library';
    if (bibliotheek && libraryActivePuzzle?.id === OPENAEC_SPECIAL_ID) {
      const hoofdactie = document.createElement('button');
      hoofdactie.type = 'button';
      hoofdactie.className = 'puzzel-hoofdactie' + (ingeleverd ? ' puzzel-verder' : '');
      hoofdactie.textContent = ingeleverd ? 'Speel meer puzzels →' : 'Controleer mijn score';
      hoofdactie.onclick = ingeleverd ? () => openPuzzles() : () => submitPuzzleView(prefix);
      navigatie.replaceChildren(hoofdactie);
      if (ingeleverd) navigatie.append(NettoShare.libraryButton());
      return;
    }
    if (bibliotheek) { werkBibliotheekNavigatieBij(navigatie, ingeleverd); return; }
    const reeks = bibliotheek ? libraryPuzzles.filter(p => p.difficulty === selectedDifficulty) : catalogusPuzzleList;
    const index = bibliotheek ? libraryIndex : catalogusPuzzleIndex;
    const verplaats = stap => bibliotheek ? libraryMove(stap) : catalogusPuzzleMove(stap);
    const laatste = index >= reeks.length - 1;
    const hoofdactie = document.createElement('button');
    hoofdactie.type = 'button';
    hoofdactie.className = 'puzzel-hoofdactie' + (ingeleverd ? ' puzzel-verder' : '');
    hoofdactie.textContent = ingeleverd
      ? laatste ? statsCopy('Afronden →', 'Finish →') : statsCopy('Volgende puzzel →', 'Next puzzle →')
      : statsCopy('Controleer mijn score', 'Check my score');
    hoofdactie.onclick = ingeleverd
      ? laatste ? () => bibliotheek ? openPuzzles() : openCatalogusLibrary() : () => verplaats(1)
      : () => submitPuzzleView(prefix);
    navigatie.replaceChildren(hoofdactie);
    if (ingeleverd) navigatie.append(NettoShare.libraryButton());
    if (!ingeleverd) {
      const overslaan = document.createElement('button');
      overslaan.type = 'button';
      overslaan.textContent = statsCopy('Overslaan →', 'Skip puzzle →');
      // Overslaan navigeert alleen: het levert geen antwoord of score in.
      overslaan.onclick = laatste ? () => bibliotheek ? openPuzzles() : openCatalogusLibrary() : () => verplaats(1);
      navigatie.append(overslaan);
    }
  }

  // Na een resultaat meteen door naar de volgende puzzel die je nog niet
  // speelde, zonder eerst terug naar de lijst te hoeven.
  function werkBibliotheekNavigatieBij(navigatie, ingeleverd) {
    const huidige = libraryActivePuzzle;
    const volgende = nextUnplayedLibraryPuzzle(huidige?.id);
    const knop = (tekst, actie, klasse = '') => {
      const button = document.createElement('button');
      button.type = 'button';
      if (klasse) button.className = klasse;
      button.textContent = tekst;
      button.onclick = actie;
      return button;
    };
    const naarOverzicht = () => openPuzzles();
    const naarVolgende = () => openLibraryPuzzle(volgende);
    const volgendeTekst = volgende
      ? statsCopy('Volgende puzzel', 'Next puzzle') + ' · #' + volgende.number + (volgende.difficulty !== huidige?.difficulty ? ' ' + libraryLevelName(volgende.difficulty) : '') + ' →'
      : statsCopy('Alle puzzels gespeeld · naar het overzicht', 'All puzzles played · back to overview');
    if (ingeleverd) {
      navigatie.replaceChildren(
        knop(volgendeTekst, volgende ? naarVolgende : naarOverzicht, 'puzzel-hoofdactie puzzel-verder'),
        knop(statsCopy('Alle puzzels', 'All puzzles'), naarOverzicht));
      const niveau = huidige?.difficulty || selectedDifficulty;
      const rest = libraryLevelSummary(niveau);
      const voortgang = document.createElement('p');
      voortgang.className = 'library-next-progress';
      voortgang.textContent = rest.played >= rest.total
        ? statsCopy(libraryLevelName(niveau) + ' is helemaal gespeeld 🎉', libraryLevelName(niveau) + ' completed 🎉')
        : statsCopy('Nog ' + (rest.total - rest.played) + ' van ' + rest.total + ' te spelen in ' + libraryLevelName(niveau) + '.',
                    (rest.total - rest.played) + ' of ' + rest.total + ' left in ' + libraryLevelName(niveau) + '.');
      navigatie.append(NettoShare.libraryButton(), voortgang);
      return;
    }
    navigatie.replaceChildren(knop(statsCopy('Controleer mijn score', 'Check my score'), () => submitPuzzleView('library'), 'puzzel-hoofdactie'));
    // Overslaan navigeert alleen: het levert geen antwoord of score in.
    navigatie.append(knop(statsCopy('Overslaan →', 'Skip puzzle →'), volgende ? naarVolgende : naarOverzicht));
  }

  // Enter gaat naar het volgende lege veld en levert in als alles is
  // ingevuld, net als in de Daily.
  function bindPuzzleEnterFlow(prefix) {
    const ids = [0, 1, 2].map(i => prefix + 'Answer' + i);
    ids.forEach((id, index) => {
      document.getElementById(id)?.addEventListener('keydown', event => {
        if (event.key !== 'Enter' || event.isComposing) return;
        event.preventDefault();
        const inputs = ids.map(other => document.getElementById(other));
        const leeg = inputs.slice(index + 1).concat(inputs.slice(0, index)).find(input => input && !input.value);
        if (leeg) leeg.focus();
        else submitPuzzleView(prefix);
      });
    });
  }

  // Een puzzel die je al speelde, speel je opnieuw als oefenronde: je kent de
  // antwoorden dan al, dus de eerste score blijft staan.
  function libraryEerdereScore(p) {
    if (!p || p.id === OPENAEC_SPECIAL_ID) return null;
    const play = libraryPlayFor(p);
    return libraryFactorOf(play) !== null ? play : null;
  }

  function renderPuzzleView(prefix, p, progressLabel, moveAction) {
    const listEl = document.getElementById(prefix + 'QuestionList');
    if (!listEl || !p) return;
    window.nettoTrack?.('puzzle_start', { mode:prefix === 'library' ? 'library' : 'catalogus', once:p.id });
    const progress = document.getElementById(prefix + 'Progress');
    if (prefix === 'library') {
      const badge = document.createElement('button');
      badge.type = 'button';
      badge.className = 'puzzle-index-badge';
      badge.onclick = openPuzzles;
      const naam = progressLabel.replace('Puzzel', statsCopy('Puzzel', 'Puzzle'));
      const sterren = { easy: 1, intermediate: 2, hard: 3, 'extremely-hard': 5 }[selectedDifficulty] || 1;
      const niveau = LIBRARY_DIFFICULTY_LABEL[selectedDifficulty] || LIBRARY_DIFFICULTY_LABEL.easy;
      badge.setAttribute('aria-label', naam + '. ' + statsCopy('Terug naar alle puzzels', 'Back to all puzzles'));
      const pijl = document.createElement('span');
      pijl.className = 'puzzle-badge-arrow';
      pijl.setAttribute('aria-hidden', 'true');
      pijl.textContent = '←';
      const titel = document.createElement('span');
      titel.textContent = naam;
      const niveauSterren = document.createElement('span');
      niveauSterren.className = 'puzzle-difficulty-stars';
      niveauSterren.setAttribute('aria-hidden', 'true');
      niveauSterren.textContent = '★'.repeat(sterren);
      const moeilijkheid = document.createElement('span');
      moeilijkheid.className = 'puzzle-difficulty';
      const niveauNaam = document.createElement('span');
      niveauNaam.textContent = niveau;
      moeilijkheid.append(niveauSterren, niveauNaam);
      badge.append(pijl, titel);
      progress.replaceChildren(badge, moeilijkheid);
    } else progress.textContent = progressLabel;
    document.getElementById(prefix + 'Equation').style.display = 'none';
    const autoCalcNote = localStorage.getItem('netto_auto_calc_note_seen') === 'true' ? '' : `<div class="auto-calc-note" role="status" aria-live="polite">↳ ${statsCopy('Antwoorden worden automatisch berekend als de berekening klopt.', 'Answers are calculated automatically when the equation matches.')}</div>`;
    listEl.innerHTML = [[p.q1_label,p.q1_answer],[p.q2_label,p.q2_answer],[p.q3_label,p.q3_answer]].map((q,i) => `<div class="q-block"><label class="q-label" for="${prefix}Answer${i}">${q[0] || statsCopy('Vraag niet beschikbaar', 'Question unavailable')}</label><div class="input-wrapper"><input type="text" class="library-answer-input daily-style-input" id="${prefix}Answer${i}" name="netto-schatting-${i}" inputmode="numeric" pattern="[0-9]*" enterkeyhint="${i < 2 ? 'next' : 'done'}" placeholder="${statsCopy('Jouw schatting', 'Your estimate')}" autocomplete="off" autocorrect="off" spellcheck="false" data-lpignore="true"></div></div>${i < 2 ? `<div class="connector"><div class="connector-line"></div><div class="connector-badge ${i === 1 ? 'eq' : ''}">${i === 0 ? (p.operator || '×') : '='}</div><div class="connector-line"></div></div>` : ''}`).join('') + autoCalcNote;
    if (autoCalcNote) localStorage.setItem('netto_auto_calc_note_seen', 'true');
    if (prefix === 'library') libraryActivePuzzle = p; else catalogusActivePuzzle = p;
    renderPuzzelfoto(listEl, p);
    bindDerivedInputs(prefix, p.operator || '×');
    bindPuzzleEnterFlow(prefix);
    const draftKey = 'netto_puzzle_draft_' + prefix + '_' + p.id;
    const draft = readStatsStorage(draftKey, []);
    [0,1,2].forEach(i => {
      const input = document.getElementById(prefix + 'Answer' + i);
      if (typeof draft[i] === 'string') input.value = draft[i];
      input.addEventListener('input', () => {
        localStorage.setItem(draftKey, JSON.stringify([0,1,2].map(j => document.getElementById(prefix + 'Answer' + j).value)));
      });
    });
    if (prefix === 'library') {
      const eerder = libraryEerdereScore(p);
      if (eerder) {
        const banner = document.createElement('p');
        banner.className = 'library-replay-note';
        const factor = libraryFactorOf(eerder);
        banner.textContent = statsCopy(
          'Al gespeeld: ' + formatLibraryFactor(factor) + ' (' + libraryRating(factor) + '). Dit is een oefenronde; je eerste score blijft staan.',
          'Already played: ' + formatLibraryFactor(factor) + ' (' + libraryRating(factor) + '). This is a practice round; your first score stays.');
        listEl.prepend(banner);
      }
    }
    werkPuzzelNavigatieBij(prefix, false);
  }

  function submitPuzzleView(prefix, auto = false) {
    const active = prefix === 'library' ? libraryActivePuzzle : catalogusActivePuzzle;
    if (!active) return;
    const inputs = [0,1,2].map(i => document.getElementById(`${prefix}Answer${i}`));
    if (inputs.some(input => !input)) return;
    const guesses = inputs.map(input => parseFormattedNumber(input.value));
    if (!validWholeAnswers(guesses)) {
      showNoticeToast(
        statsCopy('Vul alle drie de vragen in met een getal groter dan 0.', 'Enter a number greater than 0 for all three questions.'),
        '✏️', statsCopy('Antwoorden ontbreken', 'Complete your answers'));
      return;
    }
    if (isEquationRequired() && !validWholeEquation(guesses, active.operator || '×')) { showEquationNotice(); return; }
    const answers = [active.q1_answer,active.q2_answer,active.q3_answer];
    const factor = answers.reduce((sum,a,i) => sum + scoreVraag(guesses[i],a),0) / 3;
    if (guesses.every((guess, i) => isSpotOnAnswer(guess, answers[i]))) launchConfetti();
    const eerder = prefix === 'library' ? libraryEerdereScore(active) : null;
    if (!eerder) {
      const plays = getSavedLibraryPlays(); plays[active.id] = { factor, guesses, completedAt:new Date().toISOString() }; localStorage.setItem('netto_library_plays',JSON.stringify(plays));
    }
    localStorage.removeItem('netto_puzzle_draft_' + prefix + '_' + active.id);
    updateContinuePuzzleButton();
    window.nettoTrack?.('puzzle_finish', { mode:prefix === 'library' ? 'library' : 'catalogus', once:active.id });
    renderPuzzleReview(prefix, active, guesses, answers, factor, eerder);
    werkPuzzelNavigatieBij(prefix, true);
    if (!eerder) syncLibraryPlay(active, guesses[0], guesses[1], guesses[2], factor);
    if (prefix === 'library') renderLibraryCards(); else renderCatalogusPuzzles();
    // De reveal geeft de focus terug aan wat vóór het openen focus had; de
    // inleverknop bestaat dan niet meer, dus eerst naar de volgende actie.
    document.querySelector('#' + prefix + 'PuzzleView .puzzel-hoofdactie')?.focus({ preventScroll: true });
    const verder = document.querySelector('#' + prefix + 'PuzzleView .puzzel-hoofdactie');
    if (prefix === 'library') showAnswerReveal({
      questions: [active.q1_label, active.q2_label, active.q3_label],
      guesses, answers, operator: active.operator || '×', factor,
      // Na de onthulling meteen door; de nabespreking blijft één tik verder.
      onNext: verder ? () => verder.click() : null,
      nextLabel: verder?.textContent
    });
  }

  function renderPuzzleReview(prefix, puzzle, guesses, answers, factor, eerder = null) {
    const list = document.getElementById(prefix + 'QuestionList');
    list.replaceChildren();
    const summary = document.createElement('section');
    summary.className = 'puzzle-review-summary';
    summary.setAttribute('role', 'status');
    summary.setAttribute('aria-live', 'polite');
    summary.setAttribute('aria-label', statsCopy('Puzzelresultaat', 'Puzzle result'));
    const label = document.createElement('span');
    label.textContent = statsCopy('Gemiddelde factor', 'Average factor');
    const score = document.createElement('strong');
    score.textContent = formatLibraryFactor(factor);
    const detail = document.createElement('span');
    const oud = eerder ? libraryFactorOf(eerder) : null;
    detail.textContent = oud !== null
      ? statsCopy('Oefenronde. Je score blijft ' + formatLibraryFactor(oud) + '.', 'Practice round. Your score stays ' + formatLibraryFactor(oud) + '.')
      : libraryRating(factor) + ' · ' + statsCopy('Dichter bij 1,00× is beter.', 'Closer to 1.00× is better.');
    summary.append(label, score, detail);
    list.appendChild(summary);
    answers.forEach((answer, index) => {
      const card = document.createElement('article');
      card.className = 'library-question puzzle-review-question';
      const header = document.createElement('div');
      header.className = 'puzzle-review-heading';
      const number = document.createElement('span');
      number.textContent = statsCopy('Vraag ', 'Question ') + (index + 1);
      const verdict = document.createElement('span');
      const exact = isSpotOnAnswer(guesses[index], answer);
      verdict.className = 'puzzle-review-verdict' + (exact ? ' is-exact' : '');
      verdict.textContent = exact ? statsCopy('✓ Exact goed', '✓ Exactly right')
        : formatLibraryFactor(scoreVraag(guesses[index], answer)) + ' ' + (guesses[index] < answer
          ? statsCopy('te laag', 'too low') : statsCopy('te hoog', 'too high'));
      header.append(number, verdict);
      const question = document.createElement('h3');
      const original = puzzle['q' + (index + 1) + '_label'];
      question.textContent = window.NettoI18n?.t(original) || original;
      const comparison = document.createElement('dl');
      comparison.className = 'puzzle-review-comparison';
      [
        [statsCopy('Jouw schatting', 'Your estimate'), guesses[index]],
        [statsCopy('Juiste antwoord', 'Actual answer'), answer]
      ].forEach(([caption, value]) => {
        const column = document.createElement('div');
        const term = document.createElement('dt');
        term.textContent = caption;
        const valueElement = document.createElement('dd');
        valueElement.textContent = fmt(value);
        column.append(term, valueElement);
        comparison.appendChild(column);
      });
      card.append(header, question, comparison);
      list.appendChild(card);
    });
    werkVraagDetailsBij(puzzle, [...list.querySelectorAll('.puzzle-review-question')], true);
  }

  function openDailyPuzzles() {
    closeMenu(); openLibraryScreen('daily');
  }

  function openPuzzles() {
    closeMenu(); openLibraryScreen('library');
  }

  // OpenAEC-special: een losse, deelbare puzzel (route /openaec/) die bewust
  // buiten de gewone puzzelreeks, de Daily en de race blijft. Alleen Nederlands.
  // Peildatum 1 november 2026 (staat in de kop, niet in de vragen); alle drie
  // de getallen zijn op GitHub na te gaan via de publicatie- en aanmaakdatums.
  // Opnieuw gecontroleerd op 2 november 2026: 97, 74 en 23 kloppen.
  const OPENAEC_SPECIAL_ID = 'openaec-special-20261101';
  const OPENAEC_SPECIAL_PUZZLE = Object.freeze({
    id: OPENAEC_SPECIAL_ID,
    number: 'OpenAEC',
    name: 'OpenAEC Special',
    operator: '−',
    q1_label: 'Hoeveel releases heeft Open CAD Studio op GitHub gepubliceerd?',
    q1_answer: 97,
    q2_label: 'Hoeveel openbare repositories heeft de OpenAEC Foundation op GitHub?',
    q2_answer: 74,
    q3_label: 'Hoeveel releases heeft Open Calc Studio op GitHub gepubliceerd?',
    q3_answer: 23,
    calculation: '97 − 74 = 23',
    categories: ['Open-source software', 'Software releases', 'GitHub'],
    difficulty: 'hard',
  });

  // Bronpanelen ("Waar komt dit vandaan?") in de review en de reveal lezen
  // NETTO_BRONNEN op vraagtekst, net als bij de gewone puzzels.
  const OPENAEC_BRONNEN = {
    [OPENAEC_SPECIAL_PUZZLE.q1_label]: {
      bron: 'https://github.com/HakanSeven12/OpenCADStudio/releases',
      uitleg: 'Op 1 november 2026 stonden er 97 releases van Open CAD Studio op GitHub; de nieuwste was v2026.44.',
    },
    [OPENAEC_SPECIAL_PUZZLE.q2_label]: {
      bron: 'https://github.com/orgs/OpenAEC-Foundation/repositories',
      uitleg: 'Op 1 november 2026 had de OpenAEC Foundation 74 openbare repositories op GitHub, inclusief 3 forks en 1 gearchiveerde repository.',
    },
    [OPENAEC_SPECIAL_PUZZLE.q3_label]: {
      bron: 'https://github.com/OpenAEC-Foundation/open-calc-studio/releases',
      uitleg: 'Open Calc Studio had op 1 november 2026 23 releases gepubliceerd; de laatste was v0.13.0 van 12 september 2026.',
    },
  };

  const OPENAEC_LOGO = {
    bestand: 'fotos/assets/openaec-logo.svg',
    pagina: 'https://open-aec.com/',
    maker: 'OpenAEC Foundation',
    licentie: 'logo',
    vraag: 2,
  };

  function openAecBronlink() {
    const link = document.createElement('a');
    link.href = OPENAEC_LOGO.pagina;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'open-aec.com ↗';
    return link;
  }

  // Zelfde opbouw als renderPuzzelfoto (photo-credits.js), alleen met het
  // logo van OpenAEC in plaats van een Wikimedia-foto. Het logo hoort bij
  // vraag 2 (de OpenAEC Foundation) en staat dus bij het middelste blok.
  function addOpenAecPuzzleImage() {
    const list = document.getElementById('libraryQuestionList');
    const block = list?.querySelectorAll('.q-block')[OPENAEC_LOGO.vraag - 1];
    if (!list || !block) return;
    list.querySelectorAll('.puzzelfoto').forEach(el => el.remove());
    list.classList.add('puzzelfoto-lijst');
    const figure = document.createElement('figure');
    figure.className = 'puzzelfoto puzzelfoto-logo';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'daily-photo';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'puzzelFotoDialog');
    const image = document.createElement('img');
    image.src = new URL(OPENAEC_LOGO.bestand, document.baseURI).href;
    image.alt = 'Logo van de OpenAEC Foundation';
    image.width = 132;
    image.height = 104;
    image.decoding = 'async';
    image.onerror = () => { figure.style.visibility = 'hidden'; };
    const caption = document.createElement('span');
    caption.textContent = 'Bij vraag ' + OPENAEC_LOGO.vraag + ' ↗';
    button.append(image, caption);
    const credit = document.createElement('figcaption');
    credit.className = 'daily-photo-credit';
    credit.setAttribute('data-i18n-skip', '');
    credit.append(document.createTextNode(OPENAEC_LOGO.maker + ' · ' + OPENAEC_LOGO.licentie + ' · '), openAecBronlink());
    button.addEventListener('click', () => {
      const dialog = document.getElementById('puzzelFotoDialog');
      if (!dialog) return;
      const enlarged = dialog.querySelector('img');
      enlarged.src = image.src;
      enlarged.alt = image.alt;
      dialog.querySelector('p').replaceChildren(
        document.createTextNode(OPENAEC_LOGO.maker + ' · ' + OPENAEC_LOGO.licentie + ' · '), openAecBronlink());
      dialog.showModal();
    });
    figure.append(button, credit);
    block.prepend(figure);
  }

  function openOpenAecPuzzle() {
    closeMenu();
    openLibraryScreen('library');
    const view = document.getElementById('libraryPuzzleView');
    if (!view) return;
    setLibraryBrowseVisible(false);
    ['libraryStats', 'libraryDifficulties', 'libraryCardGrid', 'dailyPuzzleList'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.style.display = 'none';
    });
    document.getElementById('libraryPageKicker').textContent = 'NETTO × OPENAEC';
    document.getElementById('libraryTitle').textContent = 'OpenAEC Special';
    document.getElementById('librarySubtitle').textContent = 'Drie feiten over open-source bouwsoftware. Eén som.';

    window.NETTO_BRONNEN = Object.assign(window.NETTO_BRONNEN || {}, OPENAEC_BRONNEN);
    view.style.display = 'block';
    selectedDifficulty = OPENAEC_SPECIAL_PUZZLE.difficulty;
    renderPuzzleView('library', OPENAEC_SPECIAL_PUZZLE, 'OpenAEC Special · 1 november 2026');
    addOpenAecPuzzleImage();
  }

  // SLAPEND, MET OPZET.
  // openLibrary() wordt nergens aangeroepen: er staat geen knop voor in het
  // menu en ook niet op de startpagina. Dat is niet per ongeluk zo gegroeid en
  // ook niet iets dat kapot is — het is een keuze van de eigenaar (10 sept):
  // de catalogus voegt voor dit spel te weinig toe om er een ingang voor te
  // maken, maar de code blijft staan.
  //
  // Het scherm werkt gewoon: 279 puzzels en 837 vragen, doorzoekbaar op
  // operator, categorie en niveau, en de puzzels zijn speelbaar met score.
  // Wil je hem terug, dan is dat één regel in index.html:
  //   <button class="sidebar-item" onclick="openLibrary()">…</button>
  //
  // Let op bij opruimen: hieraan hangt het hele catalogus-blok (dit bestand,
  // #catalogusScreen in index.html, en de .catalogus-* regels in de css).
  function openLibrary() {
    closeMenu(); openCatalogusLibrary();
  }

  // ===== LIBRARY (eigen pagina: doorzoekbare catalogus) =====
  let catalogusView = 'puzzles';            // 'puzzels' | 'vragen'
  let allCatalogusPuzzles = [];             // library + daily puzzles met bron-label
  let catalogusPuzzleList = [];             // actuele gefilterde lijst
  let catalogusPuzzleIndex = 0;
  let catalogusActivePuzzle = null;
  let allCatalogusVragen = [];              // alle losse vragen

  function openCatalogusLibrary() {
    closeMenu();
    buildCatalogusData(); // altijd opnieuw: libraryPuzzles kan door Supabase-merge zijn bijgewerkt
    document.getElementById('catalogusPuzzleView').style.display = 'none';
    renderCatalogusStats();
    populateCatalogusFilters();
    setCatalogusView(catalogusView, null);
    showScreen('catalogus');
    document.getElementById('catalogusScreen').classList.add('active');
  }

  function closeCatalogusScreen() {
    document.getElementById('catalogusScreen').classList.remove('active');
    showScreen('home');
  }

  function buildCatalogusData() {
    // Alle puzzels: 100 library + alle daily's, elk met bron-label en stabiele id.
    allCatalogusPuzzles = [
      ...libraryPuzzles.map(p => ({ ...p, source: 'Puzzels' })),
    ];
    // Alle losse vragen (3 per puzzel).
    allCatalogusVragen = [];
    allCatalogusPuzzles.forEach((p, pi) => {
      [p.q1_label, p.q2_label, p.q3_label].forEach((label, qi) => {
        allCatalogusVragen.push({
          id: `${p.id}-q${qi + 1}`,
          label: label || 'Vraag niet beschikbaar',
          answer: [p.q1_answer, p.q2_answer, p.q3_answer][qi],
          category: (p.categories && p.categories[0]) || 'Algemeen',
          operator: p.operator || '×',
          source: p.source || 'Puzzels',
          puzzleName: p.name || `Puzzel ${pi + 1}`,
        });
      });
    });
  }

  function renderCatalogusStats() {
    const plays = JSON.parse(localStorage.getItem('netto_library_plays') || '{}');
    const played = allCatalogusPuzzles.filter(p => plays[p.id]).length;
    document.getElementById('catalogusStats').innerHTML = `<div class="library-stat"><b>${allCatalogusPuzzles.length}</b><span>Puzzels</span></div><div class="library-stat"><b>${allCatalogusVragen.length}</b><span>Vragen</span></div><div class="library-stat"><b>${played}</b><span>Gespeeld door jou</span></div>`;
  }

  function populateCatalogusFilters() {
    const catSelect = document.getElementById('catalogusCategory');
    const vragenSelect = document.getElementById('vragenCategory');
    if (!catSelect || !vragenSelect) return;
    const categories = [...new Set(allCatalogusPuzzles.flatMap(p => (p.categories || []).filter(Boolean)))].sort((a,b) => a.localeCompare(b));
    const options = '<option value="">Alle categorieën</option>' + categories.map(c => `<option value="${c.replace(/"/g, '&quot;')}">${c}</option>`).join('');
    catSelect.innerHTML = options;
    vragenSelect.innerHTML = options;
  }

  function setCatalogusView(view, button) {
    catalogusView = view;
    document.querySelectorAll('#catalogusViewToggle button').forEach((b, i) => b.classList.toggle('active', (['puzzles','vragen'][i]) === view));
    document.getElementById('catalogusPuzzlesView').style.display = view === 'puzzles' ? 'block' : 'none';
    document.getElementById('catalogusVragenView').style.display = view === 'vragen' ? 'block' : 'none';
    document.getElementById('catalogusPuzzleView').style.display = 'none';
    if (view === 'puzzles') renderCatalogusPuzzles(); else renderCatalogusVragen();
  }

  function renderCatalogusPuzzles() {
    const search = (document.getElementById('catalogusSearch')?.value || '').trim().toLowerCase();
    const operator = document.getElementById('catalogusOperator')?.value || '';
    const difficulty = document.getElementById('catalogusDifficulty')?.value || '';
    const category = document.getElementById('catalogusCategory')?.value || '';
    catalogusPuzzleList = allCatalogusPuzzles.filter(p => (!operator || p.operator === operator) && (!difficulty || p.difficulty === difficulty) && (!category || (p.categories || []).includes(category)) && (!search || [p.name,p.q1_label,p.q2_label,p.q3_label].join(' ').toLowerCase().includes(search)));
    document.getElementById('catalogusPuzzleCount').textContent = `${catalogusPuzzleList.length} puzzel${catalogusPuzzleList.length === 1 ? '' : 's'} gevonden`;
    const plays = JSON.parse(localStorage.getItem('netto_library_plays') || '{}');
    document.getElementById('catalogusPuzzleGrid').innerHTML = catalogusPuzzleList.map((p, i) => {
      const play = plays[p.id];
      const color = play ? scoreColor(play.factor) : '';
      const label = play ? `Score ${play.factor.toFixed(2)}×` : 'Open puzzle →';
      return `<article class="library-flip-card" role="button" tabindex="0" onclick="playCatalogusPuzzle('${p.id}')" onkeydown="if(event.key==='Enter'||event.key===' ') { event.preventDefault(); playCatalogusPuzzle('${p.id}'); }"><div class="library-flip-card-inner"><div class="library-flip-front ${play ? 'played' : ''}" style="${play ? `background:${color};` : ''}"><strong>#${i + 1}</strong><span>${label}</span><span class="catalogus-source-badge">${p.source || 'Puzzels'}</span></div></div></article>`;
    }).join('') || '<div class="catalogus-lock">Geen puzzels gevonden.</div>';
  }

  function renderCatalogusVragen() {
    const search = (document.getElementById('vragenSearch')?.value || '').trim().toLowerCase();
    const category = document.getElementById('vragenCategory')?.value || '';
    const vragen = allCatalogusVragen.filter(v => (!category || v.category === category) && (!search || (v.label + ' ' + v.puzzleName).toLowerCase().includes(search)));
    document.getElementById('vragenCount').textContent = `${vragen.length} vraag${vragen.length === 1 ? '' : 'en'} gevonden · klik op een kaart voor het antwoord`;
    document.getElementById('vragenGrid').innerHTML = vragen.map((v, i) => `<article class="library-flip-card" role="button" tabindex="0" data-vraag="${i}" onclick="toggleVraagCard(this)" onkeydown="if(event.key==='Enter'||event.key===' ') { event.preventDefault(); toggleVraagCard(this); }"><div class="library-flip-card-inner"><div class="vraag-flip-front"><div class="vraag-tekst">${v.label}</div><div class="vraag-meta"><span class="vraag-categorie">${v.category}</span><span>${v.operator}</span></div></div><div class="vraag-flip-back"><div><div class="vraag-bron">${v.puzzleName} · ${v.source}</div><div class="vraag-tekst" style="color:#fff;">${v.label}</div></div><div class="vraag-antwoord">${fmt(v.answer)}</div></div></div></article>`).join('');
  }

  function toggleVraagCard(cardEl) { cardEl.classList.toggle('revealed'); }

  function playCatalogusPuzzle(id) {
    const index = catalogusPuzzleList.findIndex(p => p.id === id);
    if (index < 0) return;
    catalogusPuzzleIndex = index;
    document.getElementById('catalogusPuzzlesView').style.display = 'none';
    document.getElementById('catalogusVragenView').style.display = 'none';
    document.getElementById('catalogusPuzzleView').style.display = 'block';
    renderCatalogusPuzzleView();
  }

  function catalogusPuzzleMove(direction) {
    const next = Math.max(0, Math.min(catalogusPuzzleList.length - 1, catalogusPuzzleIndex + direction));
    catalogusPuzzleIndex = next;
    renderCatalogusPuzzleView();
  }

  function openLibraryScreen(mode) {
    libraryMode = mode;
    document.getElementById('libraryStats').style.display = 'grid';
    document.getElementById('dailyDateControls').style.display = mode === 'daily' ? 'flex' : 'none';
    document.getElementById('aboutPanel').style.display = 'none';
    document.getElementById('howPanel').style.display = 'none';
    showScreen('library');
    document.getElementById('libraryScreen').classList.add('active');
    const isLibrary = mode === 'library';
    document.getElementById('libraryDifficulties').style.display = isLibrary ? 'grid' : 'none';
    document.getElementById('libraryCardGrid').style.display = isLibrary ? 'grid' : 'none';
    setLibraryBrowseVisible(isLibrary);
    document.getElementById('libraryPuzzleView').style.display = 'none';
    document.getElementById('dailyPuzzleList').style.display = isLibrary ? 'none' : 'block';
    document.getElementById('libraryPageKicker').textContent = isLibrary ? 'NETTO · PUZZELS' : 'NETTO · DAILY ARCHIVE';
    document.getElementById('libraryTitle').textContent = isLibrary ? 'Puzzels' : 'Daily Archive';
    document.getElementById('librarySubtitle').textContent = isLibrary ? 'Kies een moeilijkheid en speel alle puzzels.' : 'Elke dagpuzzel sinds dag één. Speel ze opnieuw.';
    renderLibraryStats();
    if (mode === 'daily') renderDailyArchive();
    else {
      renderLibraryCards(); loadLibraryFromSupabase();
      // Terug uit een puzzel: zet de focus op de kaart waar je vandaan kwam.
      const vorige = libraryActivePuzzle?.id && document.querySelector('#libraryCardGrid [data-puzzle-id="' + libraryActivePuzzle.id + '"]');
      if (vorige) requestAnimationFrame(() => { vorige.focus({ preventScroll: true }); vorige.scrollIntoView({ block: 'center' }); });
    }
  }
  function openAbout() { closeMenu(); showScreen('library'); document.getElementById('libraryScreen').classList.add('active'); document.getElementById('libraryPageKicker').textContent='NETTO · OVER'; document.getElementById('libraryTitle').textContent='Over Netto'; document.getElementById('librarySubtitle').textContent='Het idee achter het spel.'; document.getElementById('libraryDifficulties').style.display='none'; document.getElementById('dailyPuzzleList').style.display='none'; document.getElementById('libraryPuzzleView').style.display='none'; document.getElementById('libraryStats').style.display='none'; document.getElementById('dailyDateControls').style.display='none'; document.getElementById('howPanel').style.display='none'; setLibraryBrowseVisible(false); document.getElementById('aboutPanel').style.display='block'; }
  function openHowItWorks() { closeMenu(); showScreen('library'); document.getElementById('libraryScreen').classList.add('active'); document.getElementById('libraryPageKicker').textContent='NETTO · UITLEG'; document.getElementById('libraryTitle').textContent='Hoe werkt het?'; document.getElementById('librarySubtitle').textContent='Drie schattingen. Eén formule. De laagste factor wint.'; document.getElementById('libraryDifficulties').style.display='none'; document.getElementById('dailyPuzzleList').style.display='none'; document.getElementById('libraryPuzzleView').style.display='none'; document.getElementById('libraryStats').style.display='none'; document.getElementById('dailyDateControls').style.display='none'; document.getElementById('aboutPanel').style.display='none'; setLibraryBrowseVisible(false); document.getElementById('howPanel').style.display='block'; }
  function closeLibraryScreen() { document.getElementById('libraryScreen').classList.remove('active'); showScreen('home'); }
  function closeLibrary() { closeLibraryScreen(); }

  // ===== BREINKRAKERS — 4 vragen in één formule: A op1 B op2 C = D, van links naar rechts =====
  // Find the Connection staat in find-connection.js; oude vier-vragenvoortgang blijft bewaard.

// Netto frontend module.
// Loaded as a classic script so the existing shared global scope stays intact.

// ===== Puzzels-overzicht: voortgang, filters en "ga verder" =====
// Alles leest uit de bestaande opslag (netto_library_plays); het formaat
// daarvan verandert niet, want de statistiekenpagina leest het ook.
const LIBRARY_VIEW_KEY = 'netto_library_view';
const LIBRARY_LAST_KEY = 'netto_library_last_open';
const LIBRARY_LEVELS = ['easy', 'intermediate', 'hard', 'extremely-hard'];
const LIBRARY_STATUS_FILTERS = ['all', 'todo', 'done'];
const LIBRARY_OPERATOR_FILTERS = ['', '+', '−', '×', '÷'];
const LIBRARY_SORTS = ['number', 'todo-first', 'best', 'worst'];

function readLibraryView() {
  const saved = readStatsStorage(LIBRARY_VIEW_KEY, {});
  return {
    difficulty: LIBRARY_LEVELS.includes(saved.difficulty) ? saved.difficulty : 'easy',
    status: LIBRARY_STATUS_FILTERS.includes(saved.status) ? saved.status : 'all',
    operator: LIBRARY_OPERATOR_FILTERS.includes(saved.operator) ? saved.operator : '',
    category: typeof saved.category === 'string' ? saved.category : '',
    sort: LIBRARY_SORTS.includes(saved.sort) ? saved.sort : 'number'
  };
}
let libraryView = readLibraryView();
// Het laatst gekozen niveau blijft staan na verversen of terugkomen.
selectedDifficulty = libraryView.difficulty;

function saveLibraryView(patch) {
  libraryView = { ...libraryView, ...patch };
  try { localStorage.setItem(LIBRARY_VIEW_KEY, JSON.stringify(libraryView)); } catch (_) {}
}

function getLibrarySet(level) { return libraryPuzzles.filter(p => p.difficulty === level); }
function libraryPlayOf(plays, p) { return [plays[p.id], plays['library_' + p.id]].find(play => libraryFactorOf(play) !== null) || null; }
function libraryPlayFor(p) { return libraryPlayOf(getSavedLibraryPlays(), p); }
function libraryFactorOf(play) {
  const factor = Number(play?.factor);
  return Number.isFinite(factor) && factor >= 1 ? factor : null;
}
function formatLibraryFactor(factor) {
  return factor.toLocaleString(nettoNumberLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '×';
}

// Zelfde grenzen als de uitleg op "Hoe werkt het?"; tekst naast kleur, zodat
// kleur nooit het enige signaal is.
function libraryRating(factor) {
  if (factor <= 1.0005) return statsCopy('Exact', 'Exact');
  if (factor <= 1.15) return statsCopy('Zeer dichtbij', 'Very close');
  if (factor <= 1.5) return statsCopy('Goede schatting', 'Good estimate');
  if (factor <= 2.5) return statsCopy('Ruime schatting', 'Rough estimate');
  return statsCopy('Ruim ernaast', 'Way off');
}

function libraryLevelSummary(level, plays = getSavedLibraryPlays()) {
  const set = getLibrarySet(level);
  const factors = set.map(p => libraryFactorOf(libraryPlayOf(plays, p))).filter(f => f !== null);
  return {
    total: set.length,
    played: factors.length,
    accuracy: factors.length ? Math.round(factors.reduce((sum, f) => sum + 100 / f, 0) / factors.length) : null,
    average: factors.length ? factors.reduce((sum, f) => sum + f, 0) / factors.length : null
  };
}

function libraryLevelName(level) { return window.NettoI18n?.locale() === 'nl' ? ({easy:'Makkelijk', intermediate:'Gemiddeld', hard:'Moeilijk', 'extremely-hard':'Zeer moeilijk'}[level] || 'Makkelijk') : (LIBRARY_DIFFICULTY_LABEL[level] || LIBRARY_DIFFICULTY_LABEL.easy); }

// Volgende ongespeelde puzzel ná de huidige: eerst verder in hetzelfde niveau,
// dan de niveaus erna, en pas daarna wat eerder in de lijst is overgeslagen.
function nextUnplayedLibraryPuzzle(fromId = null, plays = getSavedLibraryPlays()) {
  const ordered = LIBRARY_LEVELS.flatMap(level => getLibrarySet(level));
  if (!ordered.length) return null;
  const start = Math.max(0, ordered.findIndex(p => p.id === fromId) + 1);
  for (let step = 0; step < ordered.length; step++) {
    const candidate = ordered[(start + step) % ordered.length];
    if (candidate.id !== fromId && !libraryPlayOf(plays, candidate)) return candidate;
  }
  return null;
}

// "Ga verder": de puzzel die je opende maar niet afmaakte, anders de eerste
// ongespeelde in het gekozen niveau, anders de eerste ongespeelde daarna.
function libraryContinueTarget(plays = getSavedLibraryPlays()) {
  let lastId = null;
  try { lastId = localStorage.getItem(LIBRARY_LAST_KEY); } catch (_) {}
  const last = libraryPuzzles.find(p => p.id === lastId);
  if (last && !libraryPlayOf(plays, last)) return { puzzle: last, resume: true };
  const inLevel = getLibrarySet(selectedDifficulty).find(p => !libraryPlayOf(plays, p));
  if (inLevel) return { puzzle: inLevel, resume: false };
  const elsewhere = nextUnplayedLibraryPuzzle(null, plays);
  return elsewhere ? { puzzle: elsewhere, resume: false } : null;
}

function randomUnplayedLibraryPuzzle(plays = getSavedLibraryPlays()) {
  const inLevel = getLibrarySet(selectedDifficulty).filter(p => !libraryPlayOf(plays, p));
  const pool = inLevel.length ? inLevel : libraryPuzzles.filter(p => !libraryPlayOf(plays, p));
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

function openLibraryPuzzle(puzzle) {
  if (!puzzle) return;
  if (puzzle.difficulty !== selectedDifficulty) {
    selectedDifficulty = puzzle.difficulty;
    saveLibraryView({ difficulty: puzzle.difficulty });
  }
  if (!document.getElementById('libraryScreen')?.classList.contains('active') || libraryMode !== 'library') openPuzzles();
  playLibraryCard(puzzle.id);
}

function playRandomLibraryPuzzle() { openLibraryPuzzle(randomUnplayedLibraryPuzzle()); }
function continueLibrary() { openLibraryPuzzle(libraryContinueTarget()?.puzzle); }

function renderLibraryStats() {
  const stats = document.getElementById('libraryStats');
  if (!stats) return;
  stats.replaceChildren();
  const add = (value, label) => {
    const item = document.createElement('div');
    item.className = 'library-stat';
    const strong = document.createElement('b');
    strong.textContent = value;
    const caption = document.createElement('span');
    caption.textContent = label;
    item.append(strong, caption);
    stats.append(item);
  };
  if (libraryMode === 'daily') {
    const plays = getLocalPlays();
    const released = DAILY_PUZZLES.filter(p => p.date && p.date <= TODAY_STR);
    const done = released.filter(p => plays[p.date]).length;
    add(done + '/' + released.length, statsCopy('Daily’s gespeeld', 'Dailies played'));
    add(String(Math.max(0, released.length - done)), statsCopy('Nog te spelen', 'Still to play'));
    stats.style.gridTemplateColumns = 'repeat(2,1fr)';
    return;
  }
  const plays = getSavedLibraryPlays();
  const level = libraryLevelSummary(selectedDifficulty, plays);
  const allPlayed = libraryPuzzles.filter(p => libraryFactorOf(libraryPlayOf(plays, p)) !== null).length;
  add(level.played + '/' + level.total, libraryLevelName(selectedDifficulty) + ' · ' + statsCopy('gespeeld', 'played'));
  add(level.accuracy === null ? '—' : level.accuracy + '% · ' + formatLibraryFactor(level.average), statsCopy('Gemiddelde nauwkeurigheid', 'Average accuracy'));
  add(allPlayed + '/' + libraryPuzzles.length, statsCopy('Alle niveaus', 'All levels'));
  stats.style.gridTemplateColumns = 'repeat(3,1fr)';
}

function renderLibraryLevels() {
  const plays = getSavedLibraryPlays();
  document.querySelectorAll('#libraryDifficulties button').forEach((button, index) => {
    const level = LIBRARY_LEVELS[index];
    if (!level) return;
    const summary = libraryLevelSummary(level, plays);
    const active = level === selectedDifficulty;
    const name = document.createElement('b');
    name.textContent = libraryLevelName(level);
    const count = document.createElement('span');
    count.textContent = summary.total
      ? summary.played + '/' + summary.total + ' ' + statsCopy('gespeeld', 'played')
      : statsCopy('Geen puzzels', 'No puzzles');
    const bar = document.createElement('i');
    bar.className = 'library-level-bar';
    bar.setAttribute('aria-hidden', 'true');
    bar.style.setProperty('--level-progress', (summary.total ? Math.round(summary.played / summary.total * 100) : 0) + '%');
    const accuracy = document.createElement('small');
    accuracy.textContent = summary.accuracy === null ? '—' : summary.accuracy + '% ' + statsCopy('nauwkeurig', 'accuracy');
    button.replaceChildren(name, count, accuracy, bar);
    button.type = 'button';
    button.disabled = !summary.total;
    button.classList.toggle('active', active);
    button.classList.toggle('is-complete', summary.total > 0 && summary.played === summary.total);
    button.setAttribute('aria-pressed', String(active));
  });
}

function selectLibraryDifficulty(level, button) {
  if (!LIBRARY_LEVELS.includes(level)) return;
  selectedDifficulty = level;
  saveLibraryView({ difficulty: level });
  renderLibraryCards();
  button?.focus({ preventScroll: true });
}

function setLibraryFilter(key, value) {
  saveLibraryView({ [key]: value });
  renderLibraryCards();
}

// De bedieningselementen worden één keer gebouwd en daarna alleen bijgewerkt,
// zodat de focus niet verspringt wanneer je een filter kiest.
function ensureLibraryBrowse() {
  let browse = document.getElementById('libraryBrowse');
  if (browse) return browse;
  browse = document.createElement('section');
  browse.id = 'libraryBrowse';
  browse.className = 'library-browse';
  browse.setAttribute('aria-label', statsCopy('Puzzels kiezen', 'Choose a puzzle'));

  const actions = document.createElement('div');
  actions.className = 'library-quick-actions';
  const resume = document.createElement('button');
  resume.type = 'button';
  resume.id = 'libraryContinue';
  resume.className = 'library-continue';
  resume.addEventListener('click', continueLibrary);
  const random = document.createElement('button');
  random.type = 'button';
  random.id = 'libraryRandom';
  random.className = 'library-random';
  random.addEventListener('click', playRandomLibraryPuzzle);
  actions.append(resume, random);

  const filters = document.createElement('div');
  filters.className = 'library-filters';
  const chipGroup = (key, options, label) => {
    const group = document.createElement('div');
    group.className = 'library-chip-group';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', label);
    group.dataset.filter = key;
    options.forEach(([value, text, aria]) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'library-chip';
      chip.dataset.value = value;
      chip.textContent = text;
      if (aria) chip.setAttribute('aria-label', aria);
      chip.addEventListener('click', () => setLibraryFilter(key, value));
      group.append(chip);
    });
    return group;
  };
  filters.append(
    chipGroup('status', [
      ['all', statsCopy('Alle', 'All')],
      ['todo', statsCopy('Nog te spelen', 'To play')],
      ['done', statsCopy('Gespeeld', 'Played')]
    ], statsCopy('Toon puzzels', 'Show puzzles')),
    chipGroup('operator', [
      ['', statsCopy('Alle tekens', 'All signs')],
      ['+', '+', statsCopy('Optellen', 'Addition')],
      ['−', '−', statsCopy('Aftrekken', 'Subtraction')],
      ['×', '×', statsCopy('Vermenigvuldigen', 'Multiplication')],
      ['÷', '÷', statsCopy('Delen', 'Division')]
    ], statsCopy('Rekenteken', 'Operator'))
  );
  const sortLabel = document.createElement('label');
  sortLabel.className = 'library-sort';
  const sortText = document.createElement('span');
  sortText.textContent = statsCopy('Sorteer', 'Sort');
  const sort = document.createElement('select');
  sort.id = 'librarySort';
  [
    ['number', statsCopy('Op nummer', 'By number')],
    ['todo-first', statsCopy('Nog te spelen eerst', 'Unplayed first')],
    ['best', statsCopy('Beste score eerst', 'Best score first')],
    ['worst', statsCopy('Laagste score eerst', 'Lowest score first')]
  ].forEach(([value, text]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    sort.append(option);
  });
  sort.addEventListener('change', () => setLibraryFilter('sort', sort.value));
  sortLabel.append(sortText, sort);
  const categoryLabel = document.createElement('label');
  categoryLabel.className = 'library-sort';
  categoryLabel.append(document.createTextNode(statsCopy('Onderwerp ', 'Topic ')));
  const category = document.createElement('select');
  category.id = 'libraryCategory';
  const categories = [...new Set(libraryPuzzles.flatMap(p => p.categories || []).filter(Boolean))].sort();
  ['', ...categories].forEach(value => {
    const option = document.createElement('option'); option.value = value;
    option.textContent = value ? (window.NettoI18n?.t(value) || value) : statsCopy('Alle onderwerpen', 'All topics');
    category.append(option);
  });
  category.addEventListener('change', () => { saveLibraryView({category: category.value}); renderLibraryCards(); });
  categoryLabel.append(category);
  filters.append(categoryLabel, sortLabel);

  const count = document.createElement('p');
  count.id = 'libraryResultCount';
  count.className = 'library-result-count';
  count.setAttribute('role', 'status');
  count.setAttribute('aria-live', 'polite');

  browse.append(actions, filters, count);
  document.getElementById('libraryCardGrid').before(browse);
  return browse;
}

function updateLibraryBrowse(shown, total) {
  const browse = ensureLibraryBrowse();
  browse.querySelectorAll('.library-chip-group').forEach(group => {
    const current = libraryView[group.dataset.filter];
    group.querySelectorAll('.library-chip').forEach(chip => {
      chip.setAttribute('aria-pressed', String(chip.dataset.value === current));
    });
  });
  browse.querySelector('#librarySort').value = libraryView.sort;
  browse.querySelector('#libraryCategory').value = libraryView.category;
  const plays = getSavedLibraryPlays();
  const target = libraryContinueTarget(plays);
  const resume = browse.querySelector('#libraryContinue');
  const random = browse.querySelector('#libraryRandom');
  resume.hidden = !target;
  random.hidden = !target;
  if (target) {
    const number = statsCopy('Puzzel ', 'Puzzle ') + target.puzzle.number;
    const where = target.puzzle.difficulty === selectedDifficulty ? '' : ' · ' + libraryLevelName(target.puzzle.difficulty);
    resume.replaceChildren();
    const title = document.createElement('b');
    title.textContent = target.resume ? statsCopy('Ga verder', 'Continue') : statsCopy('Speel de volgende', 'Play the next one');
    const detail = document.createElement('span');
    detail.textContent = number + where + ' →';
    resume.append(title, detail);
    resume.setAttribute('aria-label', title.textContent + ': ' + number + where);
    random.replaceChildren();
    const randomTitle = document.createElement('b');
    randomTitle.textContent = statsCopy('Verras me', 'Surprise me');
    const randomDetail = document.createElement('span');
    randomDetail.textContent = statsCopy('Willekeurige ongespeelde puzzel', 'Random unplayed puzzle');
    random.append(randomTitle, randomDetail);
  }
  const all = libraryPuzzles.length && libraryPuzzles.every(p => libraryPlayOf(plays, p));
  browse.querySelector('#libraryResultCount').textContent = all
    ? statsCopy('Je hebt alle ' + libraryPuzzles.length + ' puzzels gespeeld. Speel ze gerust opnieuw als oefening.', 'You played all ' + libraryPuzzles.length + ' puzzles. Replay any of them for practice.')
    : shown === total
      ? statsCopy(total + ' puzzels in ' + libraryLevelName(selectedDifficulty), total + ' puzzles in ' + libraryLevelName(selectedDifficulty))
      : statsCopy(shown + ' van ' + total + ' puzzels', shown + ' of ' + total + ' puzzles');
}

function libraryCardFor(p, plays) {
  const play = libraryPlayOf(plays, p);
  const factor = libraryFactorOf(play);
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'library-flip-card is-open library-card-button';
  card.dataset.puzzleId = p.id;
  const inner = document.createElement('span');
  inner.className = 'library-flip-card-inner';
  const front = document.createElement('span');
  front.className = 'library-flip-front' + (factor !== null ? ' played' : '');
  if (factor !== null) front.style.setProperty('--score-accent', scoreColor(factor));
  const top = document.createElement('span');
  top.className = 'library-card-top';
  const number = document.createElement('strong');
  number.textContent = '#' + p.number;
  const operator = document.createElement('span');
  operator.className = 'library-card-operator';
  operator.textContent = p.operator || '×';
  operator.setAttribute('aria-hidden', 'true');
  top.append(number, operator);
  // Alleen het onderwerp, nooit vraagtekst of antwoorden: geen spoilers.
  const topic = document.createElement('span');
  topic.className = 'library-card-topic';
  const firstCategory = (p.categories || []).find(Boolean) || '';
  topic.textContent = firstCategory ? (window.NettoI18n?.t(firstCategory) || firstCategory) : '';
  const status = document.createElement('span');
  status.className = 'library-card-status';
  status.textContent = factor !== null
    ? '✓ ' + formatLibraryFactor(factor) + ' · ' + libraryRating(factor)
    : statsCopy('Speel →', 'Play →');
  front.append(top, topic, status);
  inner.append(front);
  card.append(inner);
  const label = statsCopy('Puzzel ', 'Puzzle ') + p.number + ', ' + (topic.textContent ? topic.textContent + ', ' : '')
    + (factor !== null
      ? statsCopy('gespeeld, factor ', 'played, factor ') + formatLibraryFactor(factor) + ', ' + libraryRating(factor)
      : statsCopy('nog niet gespeeld', 'not played yet'));
  card.setAttribute('aria-label', label);
  card.addEventListener('click', () => playLibraryCard(p.id));
  return card;
}

function renderLibraryCards() {
  const grid = document.getElementById('libraryCardGrid');
  if (!grid) return;
  const plays = getSavedLibraryPlays();
  const level = getLibrarySet(selectedDifficulty);
  const factorOf = p => libraryFactorOf(libraryPlayOf(plays, p));
  let shown = level.filter(p => (libraryView.status === 'all'
      || (libraryView.status === 'done') === (factorOf(p) !== null))
    && (!libraryView.category || (p.categories || []).includes(libraryView.category))
    && (!libraryView.operator || (p.operator || '×') === libraryView.operator));
  const byNumber = (a, b) => (Number(a.number) || 0) - (Number(b.number) || 0);
  shown = shown.slice().sort((a, b) => {
    const fa = factorOf(a), fb = factorOf(b);
    if (libraryView.sort === 'todo-first' && (fa === null) !== (fb === null)) return fa === null ? -1 : 1;
    if ((libraryView.sort === 'best' || libraryView.sort === 'worst') && (fa === null) !== (fb === null)) return fa === null ? 1 : -1;
    if (libraryView.sort === 'best' && fa !== fb) return fa - fb;
    if (libraryView.sort === 'worst' && fa !== fb) return fb - fa;
    return byNumber(a, b);
  });
  const fragment = document.createDocumentFragment();
  shown.forEach(p => fragment.append(libraryCardFor(p, plays)));
  if (!shown.length) {
    const empty = document.createElement('div');
    empty.className = 'library-empty';
    const text = document.createElement('p');
    text.textContent = statsCopy('Geen puzzels die bij deze filters passen.', 'No puzzles match these filters.');
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.textContent = statsCopy('Filters wissen', 'Clear filters');
    reset.addEventListener('click', () => {
      saveLibraryView({ status: 'all', operator: '', category: '' });
      renderLibraryCards();
      document.querySelector('#libraryBrowse .library-chip')?.focus();
    });
    empty.append(text, reset);
    fragment.append(empty);
  }
  grid.replaceChildren(fragment);
  renderLibraryLevels();
  renderLibraryStats();
  if (libraryMode === 'library') updateLibraryBrowse(shown.length, level.length);
}

function setLibraryBrowseVisible(visible) {
  const browse = visible ? ensureLibraryBrowse() : document.getElementById('libraryBrowse');
  if (browse) browse.hidden = !visible;
}

function playLibraryCard(id) {
  const set = getLibrarySet(selectedDifficulty);
  const index = set.findIndex(p => p.id === id);
  if (index < 0) return;
  libraryIndex = index;
  try { localStorage.setItem(LIBRARY_LAST_KEY, id); } catch (_) {}
  if (libraryView.difficulty !== selectedDifficulty) saveLibraryView({ difficulty: selectedDifficulty });
  document.getElementById('libraryCardGrid').style.display = 'none';
  document.getElementById('libraryDifficulties').style.display = 'none';
  setLibraryBrowseVisible(false);
  document.getElementById('libraryPuzzleView').style.display = 'block';
  renderLibraryPuzzle();
}

function showLibraryAnswers(index) {
  const p = libraryPuzzles[index]; if (!p) return;
  showNoticeToast(`${p.q1_label} — ${fmt(p.q1_answer)} · ${p.q2_label} — ${fmt(p.q2_answer)} · ${p.q3_label} — ${fmt(p.q3_answer)}`, '📝', statsCopy('Antwoorden', 'Answers'));
}

// Zolang de dagpuzzels nog van de server komen, is een leeg archief geen
// eindstation: toon dat het laadt en teken opnieuw zodra de sync klaar is.
let dailyArchiveWait = null;
function renderDailyArchive() {
  const list = document.getElementById('dailyPuzzleList');
  const plays = getLocalPlays(); list.replaceChildren();
  const selectedMonth = archiveMonth.month;
  const selectedYear = archiveMonth.year;
  const monthNav = document.getElementById('activeArchiveMonth');
  if (monthNav) monthNav.textContent = monthLabel(selectedMonth);
  const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2,'0')}`;
  const bounds = getArchiveBounds();
  const nextButton = document.getElementById('nextMonthBtn');
  if (nextButton) nextButton.disabled = monthKey >= bounds.last;
  const previousButton = document.getElementById('previousMonthBtn');
  if (previousButton) previousButton.disabled = monthKey <= bounds.first;
  const monthPuzzles = DAILY_PUZZLES.filter(p => p.date && p.date.startsWith(monthKey) && p.date <= TODAY_STR)
    .sort((a,b) => String(b.date).localeCompare(String(a.date)));
  if (!monthPuzzles.length) {
    const empty = document.createElement('p');
    empty.className = 'daily-archive-empty';
    empty.setAttribute('role', 'status');
    const loading = typeof dailySyncAfgerond !== 'undefined' && !dailySyncAfgerond;
    empty.textContent = loading
      ? statsCopy('Het archief wordt geladen…', 'Loading the archive…')
      : DAILY_PUZZLES.length
        ? statsCopy('Geen dagpuzzels in deze maand.', 'No dailies in this month.')
        : statsCopy('Het archief is nu niet bereikbaar. Speel intussen de Puzzels; die werken ook offline.', 'The archive is unavailable right now. Play the Puzzles meanwhile; they work offline too.');
    list.append(empty);
    if (!DAILY_PUZZLES.length && !loading) {
      const fallback = document.createElement('button');
      fallback.type = 'button';
      fallback.className = 'daily-archive-fallback';
      fallback.textContent = statsCopy('Naar de Puzzels →', 'Go to Puzzles →');
      fallback.addEventListener('click', () => openPuzzles());
      list.append(fallback);
    }
    if (loading && !dailyArchiveWait) {
      dailyArchiveWait = setInterval(() => {
        if (!dailySyncAfgerond) return;
        clearInterval(dailyArchiveWait);
        dailyArchiveWait = null;
        // De nieuwste maand pas nu bepalen: vóór de sync was het archief leeg.
        const saved = localStorage.getItem('netto_archive_month') || '';
        const bounds = getArchiveBounds();
        const latest = (saved >= bounds.first && saved <= bounds.last ? saved : bounds.last).split('-').map(Number);
        archiveMonth = { year: latest[0], month: latest[1] };
        if (libraryMode === 'daily' && document.getElementById('libraryScreen')?.classList.contains('active')) {
          renderLibraryStats();
          renderDailyArchive();
        }
      }, 400);
    }
    return;
  }
  monthPuzzles.forEach((p, idx) => {
    const puzzleDate = new Date(`${p.date}T00:00:00`);
    const play = plays[p.date];
    const factor = libraryFactorOf(play);
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'daily-archive-row' + (factor !== null ? ' is-complete' : '');
    const dateLabel = new Intl.DateTimeFormat(nettoNumberLocale(), { day:'numeric', month:'long' }).format(puzzleDate);
    const number = document.createElement('span');
    number.className = 'archive-number';
    number.textContent = String(p.number || idx + 1).padStart(3,'0');
    const text = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'archive-name';
    name.textContent = p.name || `Daily #${p.number || idx + 1}`;
    const date = document.createElement('div');
    date.className = 'archive-date';
    date.textContent = dateLabel;
    text.append(name, date);
    const score = document.createElement('span');
    score.className = 'archive-score';
    score.style.color = factor !== null ? scoreColor(factor) : '';
    score.textContent = factor !== null ? formatLibraryFactor(factor) : '—';
    const status = document.createElement('span');
    status.className = 'archive-status' + (factor !== null ? ' complete' : '');
    status.textContent = factor !== null ? statsCopy('Gespeeld ✓', 'Played ✓') : statsCopy('Speel →', 'Play →');
    row.append(number, text, score, status);
    row.setAttribute('aria-label', name.textContent + ', ' + dateLabel + ', ' + (factor !== null
      ? statsCopy('gespeeld, factor ', 'played, factor ') + formatLibraryFactor(factor)
      : statsCopy('nog niet gespeeld', 'not played yet')));
    row.onclick = () => { dailyArchivePuzzleView = true; activePuzzleIndex = DAILY_PUZZLES.indexOf(p); PUZZLE_DATA = p; loadActivePuzzle(); closeLibraryScreen(); showScreen('puzzle'); };
    list.appendChild(row);
  });
}

  // Dynamische scorekleur: vloeiende gradient groen (1.00) -> geel (~1.5) -> rood (2.0+).
  function scoreColor(factor) {
    const f = Math.max(1, Number(factor) || 1);
    const H_GREEN = 145, H_YELLOW = 48, H_RED = 0;
    let h;
    if (f <= 1) h = H_GREEN;
    else if (f <= 1.5) h = H_GREEN + (H_YELLOW - H_GREEN) * ((f - 1) / 0.5);
    else if (f <= 2) h = H_YELLOW + (H_RED - H_YELLOW) * ((f - 1.5) / 0.5);
    else h = H_RED;
    return `hsl(${Math.round(h)}, 74%, 45%)`;
  }

  function getPuzzleDifficulty(p) {
    const max = Math.max(Number(p.a1), Number(p.a2), Number(p.a3));
    if (max <= 100 && ['+','−'].includes(p.operator)) return 'easy';
    if (max <= 1000 && ['+','−','×'].includes(p.operator)) return 'intermediate';
    if (max <= 100000) return 'hard';
    return 'extremely-hard';
  }

  function loadLibraryFromSupabase() {
    // De lokaal ingebedde, nieuw gegenereerde set is de volledige bron.
    // Geen merge met de oude Supabase-tabel: zo komen oude puzzels niet terug.
    const localPuzzles = [...(REBUILT_DATA.library || []), ...(REBUILT_DATA.reserve || [])].map((p, i) => ({ ...normalizeLibraryPuzzle(p), id: p.id || `local-${i + 1}`, difficulty: p.difficulty || getPuzzleDifficulty(p) }));
    const uniquePuzzles = new Map(localPuzzles.map(p => [p.id, p]));
    libraryPuzzles = [...uniquePuzzles.values()];
    renderLibraryCards();
    renderDifficultyCounts(Object.fromEntries(['easy','intermediate','hard','extremely-hard'].map(d => [d, libraryPuzzles.filter(p => p.difficulty === d).length])));
  }

  // De tellingen per niveau staan in renderLibraryLevels, samen met de voortgang.
  function renderDifficultyCounts() { renderLibraryLevels(); }

  function selectDifficulty(level) {
    selectedDifficulty = level;
    libraryIndex = 0;
    const set = libraryPuzzles.filter(p => p.difficulty === level);
    if (!set.length) {
      showNoticeToast(statsCopy('Deze difficulty bevat nog geen geladen puzzels.', 'There are no loaded puzzles at this difficulty yet.'), '🧩', statsCopy('Geen puzzels', 'No puzzles'));
      return;
    }
    document.getElementById('libraryDifficulties').style.display = 'none'; document.getElementById('dailyPuzzleList').style.display = 'none'; document.getElementById('libraryCardGrid').style.display = 'none'; document.getElementById('libraryPuzzleView').style.display = 'block'; renderLibraryPuzzle();
  }

  // Wat te doen als er geen puzzel te tonen is.
  //
  // Hier stond alleen "if (!p) return;". De aanroeper had het scherm dan al op
  // zichtbaar gezet, dus je kreeg de vorige puzzel te zien alsof er niets was
  // gebeurd — of een leeg vlak. Beide liegen: de een toont een puzzel die je
  // niet hebt gekozen, de ander zegt niets.
  //
  // Dit gebeurt niet bij gewoon doorklikken (libraryMove klemt de index), maar
  // wel als de lijst leeg is of als een index blijft staan nadat de puzzelset
  // is vernieuwd vanuit de databank.
  function toonGeenPuzzel(prefix, melding) {
    const lijst = document.getElementById(prefix + 'QuestionList');
    const som = document.getElementById(prefix + 'Equation');
    const voortgang = document.getElementById(prefix + 'Progress');
    const klok = document.getElementById(prefix + 'Timer');
    if (som) som.textContent = '';
    if (voortgang) voortgang.innerHTML = '';
    if (klok) klok.textContent = '';
    if (!lijst) return;
    lijst.innerHTML = '';
    const blok = document.createElement('div');
    blok.className = 'geen-puzzel';
    blok.textContent = melding;
    lijst.appendChild(blok);
  }

  function renderLibraryPuzzle() {
    // Begin bij de vraag, ook als de speler ver door de catalogus was gescrold.
    requestAnimationFrame(() => document.getElementById('libraryPuzzleView').scrollIntoView({ block: 'start' }));
    const p = libraryPuzzles.filter(x => x.difficulty === selectedDifficulty)[libraryIndex];
    if (!p) {
      toonGeenPuzzel('library', statsCopy(
        'Deze puzzel is er niet meer. Ga terug naar het overzicht en kies een andere.',
        'This puzzle is no longer available. Go back to the overview and pick another.'));
      return;
    }
    renderPuzzleView('library', p, `Puzzel ${libraryPuzzleNumber(selectedDifficulty, libraryIndex)}`);
  }

  function renderCatalogusPuzzleView() {
    const p = catalogusPuzzleList[catalogusPuzzleIndex];
    if (!p) {
      toonGeenPuzzel('catalogus', statsCopy(
        'Deze puzzel is er niet meer. Ga terug naar het overzicht en kies een andere.',
        'This puzzle is no longer available. Go back to the overview and pick another.'));
      return;
    }
    catalogusActivePuzzle = p;
    renderPuzzleView('catalogus', p, `Library · ${p.source === 'Daily Archive' ? 'daily' : 'puzzel'} ${catalogusPuzzleIndex + 1}`);
  }

  function submitLibraryPuzzle(auto = false) { submitPuzzleView('library', auto); }
  function submitCatalogusPuzzle(auto = false) { submitPuzzleView('catalogus', auto); }

  function jumpToLibraryPuzzle(index) { libraryIndex = index; renderLibraryPuzzle(); }

  function renderLibraryProgressBlocks() {
    const set = libraryPuzzles.filter(p => p.difficulty === selectedDifficulty).slice(0,25);
    const plays = JSON.parse(localStorage.getItem('netto_library_plays') || '{}');
  }

  function libraryMove(direction) {    const set = libraryPuzzles.filter(p => p.difficulty === selectedDifficulty); const next = Math.max(0, Math.min(set.length - 1, libraryIndex + direction)); libraryIndex = next; renderLibraryPuzzle(); }

  function openArchiveModal() { openDailyPuzzles(); }
  function closeArchiveModal() { closeLibrary(); }

  function renderArchiveList() {
    const list = document.getElementById('archiveList');
    list.innerHTML = '';

    const plays = getLocalPlays();

    PUZZLE_ARCHIVE.forEach((p, idx) => {
      const pKey = `puzzle_${p.number || activePuzzleIndex + 1}`;
      const play = plays[pKey] || (idx === 0 ? plays[TODAY_STR] : null);
      
      const div = document.createElement('div');
      div.className = `lb-row ${idx === activePuzzleIndex ? 'me' : ''}`;
      div.style.cursor = 'pointer';
      div.onclick = () => selectPuzzle(idx);

      let statusBadge = `<span style="color:#6B7280; font-size:12px;">Nog niet gespeeld →</span>`;
      if (play) {
        statusBadge = `<span style="color:var(--green); font-weight:700; font-size:12px;">✅ Factor ${play.factor.toFixed(2)}×</span>`;
      }

      div.innerHTML = `
        <div class="lb-left">
          <span class="lb-rank">#${p.number.toString().padStart(2, '0')}</span>
          <div>
            <div class="lb-name">${p.name || `Puzzel #${p.number}`}</div>
            <div style="font-size:11px; color:#4C519C;">${p.operator === '×' ? 'Vermenigvuldiging (×)' : 'Optelling (+)'}</div>
          </div>
        </div>
        ${statusBadge}
      `;
      list.appendChild(div);
    });
  }

  function selectPuzzle(index) {
    dailyArchivePuzzleView = false;
    activePuzzleIndex = index;
    PUZZLE_DATA = DAILY_PUZZLES[index] || PUZZLE_ARCHIVE[index];
    closeArchiveModal();
    loadActivePuzzle();
    showScreen('puzzle');
  }

  function loadActivePuzzle() {
    document.getElementById('dailyScoreSyncStatus')?.remove();
    document.getElementById('q1-label').textContent = window.NettoI18n?.t(PUZZLE_DATA.q1_label) || PUZZLE_DATA.q1_label;
    document.getElementById('q2-label').textContent = window.NettoI18n?.t(PUZZLE_DATA.q2_label) || PUZZLE_DATA.q2_label;
    document.getElementById('q3-label').textContent = window.NettoI18n?.t(PUZZLE_DATA.q3_label) || PUZZLE_DATA.q3_label;
    document.getElementById('operatorBadge').textContent = PUZZLE_DATA.operator || '×';
    document.getElementById('puzzleEyebrow').textContent = `Netto · ${puzzleNr(PUZZLE_DATA.number)}`;

    // Reset velden en uitslag
    ['g1', 'g2', 'g3'].forEach(id => {
      const input = document.getElementById(id);
      input.value = '';
      input.placeholder = 'Jouw antwoord';
      input.dataset.autoCalculated = 'false';
      input.classList.remove('auto-calculated');
      input.disabled = false;
    });
    autoCalculatedInputs.clear();
    resetDailyReviewView();
    document.getElementById('alreadyPlayedBanner').classList.remove('show');
    document.getElementById('btnCheck').style.display = 'block';
    document.getElementById('btnCheck').disabled = false;

    checkExistingPlay();
  }

  function goHome() {
    dailyArchivePuzzleView = false;
    resetDailyReviewView();
    showScreen('home');
    closeMenu();
  }

  // Het leaderboard is een eigen pagina geworden in plaats van een pop-up; het
  // hoort bij "Competitie" in de navigatie en heeft meer ruimte nodig dan een
  // modal biedt. De oude naam blijft bestaan omdat er vanaf meerdere plekken
  // naar verwezen wordt.
  function openLeaderboardModal() {
    closeMenu();
    // Kijken mag zonder account. Codex zette hier een inlogmuur (X-001) omdat
    // het scorebord accountgebonden is, maar dat gaat over MEEDOEN, niet over
    // KIJKEN. De knop op het resultatenscherm liep er ook op stuk: die opende
    // het inlogscherm in plaats van het bord.
    //
    // Meedoen vraagt nog steeds een account — daarvoor staat onderaan de lijst
    // een uitnodiging als je uitgelogd bent. Insturen en duelleren blijven wel
    // achter een login, want die schrijven iets weg onder jouw naam.
    resetLeaderboardDag();
    showScreen('leaderboard');
    renderLeaderboard();
  }

  function closeLeaderboardModal() {
    goHome();
  }

  function openAuthModal() {
    closeMenu();
    if (currentUser) {
      document.getElementById('authLoggedInView').style.display = 'block';
      document.getElementById('authFormView').style.display = 'none';
    } else {
      document.getElementById('authLoggedInView').style.display = 'none';
      document.getElementById('authForgotView').style.display = 'none';
      document.getElementById('authFormView').style.display = 'block';
    }
    clearAuthError();
    document.getElementById('modalAuth').classList.add('active');
  }

  function closeAuthModal() {
    document.getElementById('modalAuth').classList.remove('active');
  }

  function closeModalOnBg(e, modalId) {
    if (e.target.id !== modalId) return;
    if (modalId === 'modalStats') {
      closeStatsModal();
      return;
    }
    document.getElementById(modalId).classList.remove('active');
  }

  // Expliciet binden aan window zodat inline onclick ALTIJD werkt
  window.toggleMenu = toggleMenu;
  window.showForgotPassword = showForgotPassword;
  window.backToAuthForm = backToAuthForm;
  window.handleForgotPassword = handleForgotPassword;
  window.closeMenu = closeMenu;
  window.showScreen = showScreen;
  window.goHome = goHome;
  window.openArchiveModal = openArchiveModal;
  window.closeArchiveModal = closeArchiveModal;
  window.selectPuzzle = selectPuzzle;
  window.openLeaderboardModal = openLeaderboardModal;
  window.closeLeaderboardModal = closeLeaderboardModal;
  window.openAuthModal = openAuthModal;
  window.closeAuthModal = closeAuthModal;
  window.closeModalOnBg = closeModalOnBg;
  window.openStatsModal = openStatsModal;
  window.closeStatsModal = closeStatsModal;
  window.openStatsStreakCalendar = openStatsStreakCalendar;
  window.shareStats = shareStats;
  window.checkAnswers = checkAnswers;
  window.shareScore = shareScore;
  window.toggleAuthMode = toggleAuthMode;
  window.handleAuthSubmit = handleAuthSubmit;
  window.handleLogout = handleLogout;
  window.switchLbTab = switchLbTab;
  window.veranderLeaderboardDag = veranderLeaderboardDag;
  window.changeArchiveMonth = changeArchiveMonth;
  window.showDailyResults = showDailyResults;
  window.showDailyQuestions = showDailyQuestions;
  window.startNextPuzzle = startNextPuzzle;
  window.openDailyPuzzles = openDailyPuzzles;
  window.openPuzzles = openPuzzles;
  window.openCatalogusLibrary = openCatalogusLibrary;
  window.closeCatalogusScreen = closeCatalogusScreen;
  window.setCatalogusView = setCatalogusView;
  window.renderCatalogusPuzzles = renderCatalogusPuzzles;
  window.renderCatalogusVragen = renderCatalogusVragen;
  window.playCatalogusPuzzle = playCatalogusPuzzle;
  window.catalogusPuzzleMove = catalogusPuzzleMove;
  window.submitCatalogusPuzzle = submitCatalogusPuzzle;
  window.toggleVraagCard = toggleVraagCard;
  window.selectDifficulty = selectDifficulty;
  window.selectLibraryDifficulty = selectLibraryDifficulty;
  window.playLibraryCard = playLibraryCard;
  window.continueLibrary = continueLibrary;
  window.playRandomLibraryPuzzle = playRandomLibraryPuzzle;
  window.setLibraryFilter = setLibraryFilter;
  window.jumpToLibraryPuzzle = jumpToLibraryPuzzle;
  window.libraryMove = libraryMove;
  window.submitLibraryPuzzle = submitLibraryPuzzle;
  window.showLibraryAnswers = showLibraryAnswers;
  window.changeArchiveMonth = changeArchiveMonth;
  window.openPuzzleRace = openPuzzleRace;
  window.closePuzzleRace = closePuzzleRace;
  window.startPuzzleRace = startPuzzleRace;
  window.submitPuzzleRace = submitPuzzleRace;
  window.createRaceRoom = createRaceRoom;
  window.joinRaceRoom = joinRaceRoom;
  window.leaveRaceRoom = leaveRaceRoom;
  window.copyRaceRoomCode = copyRaceRoomCode;
  window.startDuelRace = startDuelRace;
  window.openBreinkrakers = openBreinkrakers;
  window.closeBreinkrakers = closeBreinkrakers;
  window.startBreinkrakers = startBreinkrakers;
  window.submitBreinkrakers = submitBreinkrakers;
  window.openConnection = openConnection;
  window.openSettings = openSettings;
  window.openHowItWorks = openHowItWorks;
  window.closeSettings = closeSettings;
  window.switchRaceMode = switchRaceMode;
  window.selectRaceDuration = selectRaceDuration;
  window.selectOnlineVisibility = selectOnlineVisibility;
  window.toggleOnlineVisibility = toggleOnlineVisibility;
  window.createOpenRaceGame = createOpenRaceGame;
  window.createClosedRaceGame = createClosedRaceGame;
  window.refreshOpenGames = refreshOpenGames;
  window.joinOpenRaceGame = joinOpenRaceGame;
  window.selectRaceTolerantie = selectRaceTolerantie;
  window.toggleAutoCalc = toggleAutoCalc;
  window.toggleEquationRequirement = toggleEquationRequirement;
  window.toggleLeaderboardZichtbaar = toggleLeaderboardZichtbaar;
  window.toggleTheme = toggleTheme;
  window.applyTheme = applyTheme;

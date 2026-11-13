// Drie bestaande vragen, zonder de oorspronkelijke volgorde of operator prijs te geven.
// Een nieuwe inhoudsreeks krijgt eigen voortgang; oude resultaten blijven bewaard.
const CONNECTION_PROGRESS_KEY = window.NETTO_REBUILT_PUZZLES?.connection_edition
  ? 'netto_connection_progress_' + window.NETTO_REBUILT_PUZZLES.connection_edition
  : 'netto_connection_progress';
const connectionOperators = ['+', '−', '×', '÷'];
let connectionPool = [];
let connectionState = null;
let connectionPicked = null;

// Gehele getallen vergelijken met BigInt voorkomt afrondingsfouten en overloop.
function connectionEquation(values, operator) {
  if (values.length !== 3 || !values.every(v => Number.isSafeInteger(v) && v > 0)) return false;
  const [a, b, c] = values.map(BigInt);
  if (operator === '+') return a + b === c;
  if (operator === '−') return a - b === c;
  if (operator === '×') return a * b === c;
  if (operator === '÷') return b !== 0n && a === b * c;
  return false;
}

function validConnections(answers) {
  const orders = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  return orders.flatMap(order => connectionOperators
    .filter(operator => connectionEquation(order.map(i => answers[i]), operator))
    .map(operator => ({ order, operator })));
}

function connectionAnswers(puzzle) {
  return [puzzle.q1_answer, puzzle.q2_answer, puzzle.q3_answer];
}

function cleanConnection(puzzle) {
  const answers = connectionAnswers(puzzle);
  if (new Set(answers).size !== 3) return false;
  const valid = validConnections(answers);
  // Inverse bewerkingen horen bij één familie; een toevallig tweede verband niet.
  const families = new Set(valid.map(v => ['+', '−'].includes(v.operator) ? 'sum' : 'product'));
  return families.size === 1 && [1, 2, 3].every(i => Boolean(puzzle['q' + i + '_label']));
}

function shuffledConnectionOrder(random = Math.random) {
  const order = [0, 1, 2];
  for (let i = 2; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  // Toon nooit per ongeluk de opgeslagen volgorde als beginopstelling.
  if (order.every((value, i) => value === i)) return [1, 2, 0];
  return order;
}

function connectionProgress() {
  const saved = readStatsStorage(CONNECTION_PROGRESS_KEY, {});
  return { results: Array.isArray(saved.results) ? saved.results : [] };
}

function openConnection() {
  closeMenu();
  showScreen('breinkrakers');
  renderConnectionStart();
}

function connectionResultFor(id, results = connectionProgress().results) {
  return results.find(result => result.id === id) || null;
}

// Volgende ongespeelde puzzel ná de gegeven positie; daarna vooraan verder.
function nextUnplayedConnection(fromIndex = -1) {
  const gespeeld = new Set(connectionProgress().results.map(result => result.id));
  for (let step = 1; step <= connectionPool.length; step++) {
    const index = (fromIndex + step) % connectionPool.length;
    if (index !== fromIndex && !gespeeld.has(connectionPool[index].id)) return index;
  }
  return -1;
}

function startNextConnection() {
  openConnection();
  const volgende = nextUnplayedConnection(-1);
  // Als alles gespeeld is, blijft het overzicht beschikbaar om opnieuw te spelen.
  if (volgende >= 0) startConnection(volgende);
}

function startRandomConnection() {
  if (!connectionPool.length) openConnection();
  const gespeeld = new Set(connectionProgress().results.map(result => result.id));
  const open = connectionPool.map((puzzle, index) => gespeeld.has(puzzle.id) ? -1 : index).filter(index => index >= 0);
  if (!open.length) { openConnection(); return; }
  startConnection(open[Math.floor(Math.random() * open.length)]);
}

// Overslaan en "volgende" springen over wat je al speelde heen.
function skipConnection() {
  const volgende = nextUnplayedConnection(connectionState ? connectionState.index : -1);
  if (volgende >= 0) startConnection(volgende); else renderConnectionStart();
}

function setConnectionText(id, nl, en) {
  const element = document.getElementById(id);
  if (element) element.textContent = statsCopy(nl, en);
}

function renderConnectionStart() {
  connectionPool = (REBUILT_DATA.connection || libraryPuzzles).filter(cleanConnection);
  connectionState = null;
  const screen = document.getElementById('breinkrakersScreen');
  screen.classList.remove('is-playing');
  screen.scrollTop = 0;
  document.getElementById('bkStart').style.display = 'block';
  document.getElementById('bkPlay').style.display = 'none';
  const results = connectionProgress().results.filter(r => connectionPool.some(p => p.id === r.id));
  const found = results.filter(r => r.connectionCorrect).length;
  setConnectionText('bkSubtitle',
    'Drie vragen, één verborgen som. Zet ze in de goede volgorde, kies het rekenteken en schat de antwoorden.',
    'Three questions, one hidden equation. Put them in the right order, pick the operator and estimate the answers.');
  setConnectionText('bkPlayedLabel', 'Gespeeld', 'Played');
  setConnectionText('bkExactLabel', 'Verbanden gevonden', 'Connections found');
  setConnectionText('bkAverageLabel', 'Gemiddelde factor', 'Average factor');
  document.getElementById('bkStats')?.setAttribute('aria-label', statsCopy('Voortgang Find the Connection', 'Find the Connection progress'));
  document.getElementById('bkPlayedCount').textContent = results.length + '/' + connectionPool.length;
  document.getElementById('bkExactCount').textContent = found + '/' + results.length;
  document.getElementById('bkAverageScore').textContent = results.length
    ? (results.reduce((sum, r) => sum + r.factor, 0) / results.length).toFixed(2) + '×' : '—';
  const open = connectionPool.length - results.length;
  document.getElementById('bkProgress').textContent = !connectionPool.length
    ? statsCopy('Er zijn nog geen geschikte puzzels beschikbaar.', 'No suitable puzzles are available yet.')
    : open > 0
      ? statsCopy('Nog ' + open + ' van ' + connectionPool.length + ' te spelen. Gespeelde puzzels kun je opnieuw doen als oefening.',
                  open + ' of ' + connectionPool.length + ' left to play. Played puzzles can be replayed for practice.')
      : statsCopy('Alle ' + connectionPool.length + ' gespeeld 🎉 Kies er een om te oefenen.', 'All ' + connectionPool.length + ' played 🎉 Pick one to practise.');
  const volgende = nextUnplayedConnection(-1);
  const continueButton = document.getElementById('bkContinue');
  const randomButton = document.getElementById('bkRandom');
  if (continueButton) {
    continueButton.hidden = volgende < 0;
    continueButton.textContent = volgende >= 0
      ? statsCopy(results.length ? 'Speel de volgende · #' : 'Begin bij #', results.length ? 'Play the next one · #' : 'Start with #') + connectionPool[volgende].number + ' →'
      : '';
  }
  if (randomButton) {
    randomButton.hidden = open < 2;
    randomButton.textContent = statsCopy('Verras me', 'Surprise me');
    randomButton.setAttribute('aria-label', statsCopy('Willekeurige ongespeelde puzzel', 'Random unplayed puzzle'));
  }
  const grid = document.getElementById('bkCardGrid');
  grid.replaceChildren();
  connectionPool.forEach((puzzle, index) => {
    const result = results.find(r => r.id === puzzle.id);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'connection-catalog-card' + (result ? ' has-played' : '');
    const number = document.createElement('strong');
    number.textContent = '#' + puzzle.number;
    const label = document.createElement('span');
    if (result) {
      label.className = result.connectionCorrect ? 'status-correct' : 'status-incorrect';
      label.textContent = (result.connectionCorrect ? '✓ ' : '≠ ') + result.factor.toFixed(2) + '×';
    } else {
      label.textContent = statsCopy('Speel →', 'Play →');
    }
    button.append(number, label);
    // Symbool en kleur zeggen hetzelfde als deze tekst; kleur is nooit het enige signaal.
    button.setAttribute('aria-label', statsCopy('Puzzel ', 'Puzzle ') + puzzle.number + ', ' + (result
      ? (result.connectionCorrect ? statsCopy('verband gevonden', 'connection found') : statsCopy('verband niet gevonden', 'connection not found'))
        + ', ' + statsCopy('factor ', 'factor ') + result.factor.toFixed(2) + '×'
      : statsCopy('nog niet gespeeld', 'not played yet')));
    button.onclick = () => startConnection(index);
    grid.append(button);
  });
}

function operatorName(symbol) {
  if (symbol === '+') return statsCopy('Plus (optellen)', 'Plus (addition)');
  if (symbol === '−') return statsCopy('Min (aftrekken)', 'Minus (subtraction)');
  if (symbol === '×') return statsCopy('Keer (vermenigvuldigen)', 'Multiply');
  if (symbol === '÷') return statsCopy('Delen door (delen)', 'Divide');
  return symbol;
}

function renderConnectionOperatorConnector() {
  const connector = document.createElement('div');
  connector.className = 'connector connection-connector connection-operator-connector';
  const lineLeft = document.createElement('div');
  lineLeft.className = 'connector-line';
  const select = document.createElement('select');
  select.className = 'connector-badge connection-operator-select';
  select.setAttribute('aria-label', statsCopy('Kies het rekenkundige teken', 'Choose the mathematical operator'));
  const prompt = document.createElement('option');
  prompt.value = '';
  prompt.textContent = '?';
  prompt.disabled = true;
  select.append(prompt);
  connectionOperators.forEach(symbol => {
    const option = document.createElement('option');
    option.value = symbol;
    option.textContent = symbol;
    option.setAttribute('aria-label', operatorName(symbol));
    select.append(option);
  });
  select.value = connectionState?.operator || '';
  select.addEventListener('change', () => setConnectionOperator(select.value));
  const lineRight = document.createElement('div');
  lineRight.className = 'connector-line';
  connector.append(lineLeft, select, lineRight);
  return connector;
}

function setConnectionOperator(symbol) {
  if (!connectionState || connectionState.submitted || !connectionOperators.includes(symbol)) return;
  connectionState.operator = symbol;
  const select = document.querySelector('.connection-operator-select');
  if (select) select.value = symbol;
  updateConnectionLiveFormula();
}

function renderConnectionEqualsConnector() {
  const connector = document.createElement('div');
  connector.className = 'connector connection-connector connection-equals-connector';
  const lineLeft = document.createElement('div');
  lineLeft.className = 'connector-line';
  const badge = document.createElement('div');
  badge.className = 'connector-badge eq';
  badge.textContent = '=';
  badge.setAttribute('aria-label', statsCopy('Is gelijk aan', 'Equals'));
  const lineRight = document.createElement('div');
  lineRight.className = 'connector-line';
  connector.append(lineLeft, badge, lineRight);
  return connector;
}

function updateConnectionLiveFormula() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('connectionLiveFormula');
  if (!container || !connectionState) return;
  if (connectionState.submitted) {
    container.hidden = true;
    return;
  }
  const guesses = connectionState.order.map(i => {
    const input = document.getElementById('connectionAnswer' + i);
    const val = input ? input.value.trim() : '';
    return val ? parseFormattedNumber(val) : null;
  });
  const op = connectionState.operator;
  // De drie kaarten tonen de formule al; pas bij een complete poging is extra feedback nuttig.
  container.hidden = !op || !guesses.every(value => Number.isSafeInteger(value) && value > 0);
  if (container.hidden) { container.textContent = ''; return; }
  const klopt = connectionEquation(guesses, op);
  container.classList.toggle('is-valid', klopt);
  container.classList.toggle('is-invalid', !klopt);
  container.textContent = klopt
    ? statsCopy('✓ De som klopt', '✓ Equation matches')
    : statsCopy('≠ De som klopt niet', '≠ Equation does not match');
}

function handleConnectionGlobalKeydown(event) {
  if (typeof document === 'undefined' || !connectionState || connectionState.submitted) return;
  const bkScreen = document.getElementById('breinkrakersScreen');
  if (!bkScreen || bkScreen.style.display === 'none' || !bkScreen.classList.contains('is-playing')) return;
  
  const key = event.key;
  let targetOp = null;
  if (key === '+' || key === 'Add') targetOp = '+';
  else if (key === '-' || key === 'Subtract' || key === '−') targetOp = '−';
  else if (key === '*' || key === 'Multiply' || key === '×') targetOp = '×';
  else if ((key === 'x' || key === 'X') && (!event.target || event.target.tagName !== 'INPUT')) targetOp = '×';
  else if (key === '/' || key === 'Divide' || key === ':' || key === '÷') targetOp = '÷';
  
  if (targetOp) {
    setConnectionOperator(targetOp);
    if (event.target && event.target.tagName === 'INPUT') {
      event.preventDefault();
    }
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (!window._connectionKeyHandlerBound) {
    window.addEventListener('keydown', handleConnectionGlobalKeydown);
    window._connectionKeyHandlerBound = true;
  }
}

function startConnection(index = 0) {
  const puzzle = connectionPool[index];
  if (!puzzle) { renderConnectionStart(); return; }
  connectionState = { puzzle, index, order: shuffledConnectionOrder(), operator: null, submitted: false };
  connectionPicked = null;
  const screen = document.getElementById('breinkrakersScreen');
  screen.classList.add('is-playing');
  screen.scrollTop = 0;
  document.getElementById('bkStart').style.display = 'none';
  document.getElementById('bkPlay').style.display = 'flex';
  const puzzelknop = document.getElementById('bkPuzzleLabel');
  puzzelknop.parentElement.setAttribute('aria-label', statsCopy('Puzzel ', 'Puzzle ') + puzzle.number);
  puzzelknop.textContent = '← ' + statsCopy('Puzzel ', 'Puzzle ') + puzzle.number;
  puzzelknop.setAttribute('aria-label', statsCopy('Terug naar alle verbanden vanaf puzzel ', 'Back to all connections from puzzle ') + puzzle.number);
  document.getElementById('bkCounter').textContent = (index + 1) + ' / ' + connectionPool.length;
  document.getElementById('bkFeedback').textContent = '';
  document.getElementById('connectionAnnouncement').textContent = '';
  const skip = document.getElementById('connectionSkip');
  skip.hidden = false;
  skip.textContent = statsCopy('Overslaan →', 'Skip puzzle →');
  // Na een eerdere inzending stond de formule op display:none en kwam nooit terug.
  const liveFormula = document.getElementById('connectionLiveFormula');
  if (liveFormula) liveFormula.style.removeProperty('display');
  renderConnectionRule(connectionResultFor(puzzle.id));
  const submit = document.getElementById('bkSubmitButton');
  submit.textContent = statsCopy('Controleer mijn verband', 'Check my connection');
  const list = document.getElementById('bkQuestionList');
  list.replaceChildren();
  const cards = [0, 1, 2].map(i => {
    const card = document.createElement('div');
    card.className = 'q-block connection-question';
    card.dataset.question = i;
    const position = document.createElement('span');
    position.className = 'connection-position';
    const handle = document.createElement('button');
    handle.type = 'button'; handle.className = 'connection-drag-handle';
    handle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg>';
    handle.setAttribute('aria-label', statsCopy('Verplaats deze vraag', 'Move this question'));
    handle.setAttribute('aria-pressed', 'false');
    handle.setAttribute('aria-description', statsCopy('Gebruik de pijltjestoetsen om te verplaatsen, of tik twee grepen aan om te wisselen.', 'Use the arrow keys to move, or tap two handles to swap.'));
    bindConnectionDrag(handle, card, i);
    const question = document.createElement('label');
    question.className = 'q-label'; question.htmlFor = 'connectionAnswer' + i;
    const original = puzzle['q' + (i + 1) + '_label'];
    question.textContent = window.NettoI18n?.t(original) || original;
    const wrapper = document.createElement('div'); wrapper.className = 'input-wrapper';
    const input = document.createElement('input');
    input.id = 'connectionAnswer' + i; input.type = 'text'; input.inputMode = 'numeric';
    input.className = 'library-answer-input daily-style-input';
    input.placeholder = statsCopy('Jouw schatting', 'Your estimate'); input.autocomplete = 'off';
    // Geen verborgen operator aan de autocalculator geven: die zou het verband verklappen.
    bindWholeNumberInput(input, () => {
      updateConnectionLiveFormula();
    });
    input.addEventListener('input', () => {
      updateConnectionLiveFormula();
    });
    input.addEventListener('keydown', event => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      const next = connectionState.order[connectionState.order.indexOf(i) + 1];
      if (next !== undefined) document.getElementById('connectionAnswer' + next).focus();
      else submitConnection();
    });
    const heading = document.createElement('div'); heading.className = 'connection-question-heading';
    heading.append(question, handle);
    wrapper.append(input); card.append(position, heading, wrapper);
    
    // Tikken op een kaart wanneer een andere is geselecteerd zorgt direct voor een wissel
    card.addEventListener('click', event => {
      if (event.target.closest('input') || event.target.closest('.connection-drag-handle')) return;
      if (connectionPicked !== null) {
        selectConnectionCard(i);
      }
    });
    return card;
  });
  werkVraagDetailsBij(puzzle, cards, false);
  cards.forEach(card => list.append(card));
  
  const opConnector = renderConnectionOperatorConnector();
  list.append(opConnector);
  
  const eqConnector = renderConnectionEqualsConnector();
  list.append(eqConnector);
  
  layoutConnection();
  updateConnectionLiveFormula();
}

// De spelregel staat op het moment dat hij ertoe doet: boven de drie kaarten.
function renderConnectionRule(previous) {
  const rule = document.getElementById('connectionRule');
  if (!rule) return;
  rule.hidden = false;
  rule.replaceChildren();
  const formula = document.createElement('strong');
  formula.textContent = statsCopy('positie 1  ?  positie 2  =  uitkomst', 'position 1  ?  position 2  =  result');
  rule.append(
    document.createTextNode(statsCopy('Sleep de vragen in de goede volgorde en kies het teken: ', 'Drag the questions into the right order and choose the sign: ')),
    formula,
    document.createTextNode(statsCopy('. Alle antwoorden zijn hele getallen. Je scoort op het verband én op hoe dicht je schattingen zitten.',
      '. Every answer is a whole number. You score on the connection and on how close your estimates are.')));
  if (previous) {
    const note = document.createElement('span');
    note.className = 'connection-replay-note';
    note.textContent = ' ' + statsCopy('Al gespeeld (' + previous.factor.toFixed(2) + '×): dit is een oefenronde, je eerste score blijft staan.',
      'Already played (' + previous.factor.toFixed(2) + '×): this is a practice round, your first score stays.');
    rule.append(note);
  }
}

function layoutConnection() {
  const list = document.getElementById('bkQuestionList');
  if (!connectionState) return;
  const cards = connectionState.order.map(i => list.querySelector('[data-question="' + i + '"]'));
  cards.forEach((card, index) => {
    if (!card) return;
    const isResult = index === 2;
    const pos = card.querySelector('.connection-position');
    if (pos) pos.textContent = isResult
      ? statsCopy('Uitkomst', 'Result')
      : statsCopy('Positie ', 'Position ') + (index + 1);
    card.querySelector('.connection-drag-handle')?.setAttribute('aria-label',
      statsCopy('Verplaats vraag op positie ', 'Move question at position ') + (index + 1));
  });
  const opConnector = list.querySelector('.connection-operator-connector');
  const eqConnector = list.querySelector('.connection-equals-connector');
  if (opConnector && eqConnector && cards[0] && cards[1] && cards[2]) {
    list.replaceChildren(cards[0], opConnector, cards[1], eqConnector, cards[2]);
  }
  updateConnectionLiveFormula();
}

function moveConnection(question, direction) {
  if (!connectionState || connectionState.submitted) return;
  const order = connectionState.order;
  const index = order.indexOf(question), target = index + direction;
  if (target < 0 || target > 2) return;
  [order[index], order[target]] = [order[target], order[index]];
  layoutConnection();
  const card = document.querySelector('#bkQuestionList [data-question="' + question + '"]');
  card?.querySelector('.connection-drag-handle')?.focus({ preventScroll: true });
  // Verplaatsingen blijven hoorbaar voor schermlezers, zonder een extra tekstregel.
  const feedback = document.getElementById('connectionAnnouncement');
  if (feedback) {
    feedback.textContent = statsCopy('Vraag verplaatst naar positie ', 'Question moved to position ') + (target + 1) + '.';
  }
}

function selectConnectionCard(question) {
  if (!connectionState || connectionState.submitted) return;
  const prevPicked = connectionPicked;
  if (connectionPicked !== null && connectionPicked !== question) {
    const from = connectionState.order.indexOf(connectionPicked);
    const to = connectionState.order.indexOf(question);
    moveConnection(connectionPicked, to - from);
    connectionPicked = null;
  } else {
    connectionPicked = connectionPicked === question ? null : question;
  }
  const feedback = document.getElementById('connectionAnnouncement');
  if (feedback) {
    if (connectionPicked !== null) {
      const pos = connectionState.order.indexOf(connectionPicked) + 1;
      feedback.textContent = statsCopy(
        `Vraag op positie ${pos} geselecteerd. Tik op een andere vraag om te wisselen.`,
        `Question at position ${pos} selected. Tap another question to swap.`
      );
    } else if (prevPicked !== null) {
      feedback.textContent = '';
    }
  }
  document.querySelectorAll('#bkQuestionList .connection-question').forEach(card => {
    const qNum = Number(card.dataset.question);
    const picked = qNum === connectionPicked;
    card.classList.toggle('is-picked', picked);
    card.classList.toggle('is-swap-target', connectionPicked !== null && !picked);
    card.querySelector('.connection-drag-handle')?.setAttribute('aria-pressed', String(picked));
  });
}

// Eén pointerpad voor muis, pen en aanraking. Tijdens het slepen blijven de echte
// invoervelden op hun plek in de DOM; pas bij loslaten wisselen we de kaarten.
function bindConnectionDrag(handle, card, question) {
  let drag = null, suppressClick = false;
  const screen = document.getElementById('breinkrakersScreen');
  handle.addEventListener('click', () => {
    if (suppressClick) { suppressClick = false; return; }
    selectConnectionCard(question);
  });
  handle.addEventListener('keydown', event => {
    if (event.key === 'Escape') { finish(false); connectionPicked = question; selectConnectionCard(question); }
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    moveConnection(question, event.key === 'ArrowUp' ? -1 : 1);
  });
  function frame() {
    if (!drag || !handle.isConnected) { finish(false); return; }
    if (drag.moved) {
      const bounds = screen.getBoundingClientRect();
      const top = Math.max(bounds.top, 72), bottom = Math.min(bounds.bottom, innerHeight);
      if (drag.y < top + 70) screen.scrollTop -= 9;
      else if (drag.y > bottom - 70) screen.scrollTop += 9;
      card.style.transform = 'translateY(' + (drag.y - drag.startY + screen.scrollTop - drag.scrollTop) + 'px)';
      const listBounds = card.parentElement.getBoundingClientRect();
      let distance = Infinity;
      drag.target = null;
      document.querySelectorAll('#bkQuestionList .connection-question').forEach(other => {
        other.classList.remove('is-drop-target');
        const rect = other.getBoundingClientRect();
        const centre = other === card ? drag.centre - (screen.scrollTop - drag.scrollTop) : rect.top + rect.height / 2;
        const delta = Math.abs(drag.y - centre);
        if (drag.x >= listBounds.left - 30 && drag.x <= listBounds.right + 30 && delta < distance) {
          distance = delta; drag.target = other;
        }
      });
      if (drag.target && drag.target !== card) drag.target.classList.add('is-drop-target');
    }
    drag.frame = requestAnimationFrame(frame);
  }
  function finish(commit) {
    if (!drag) return;
    const current = drag;
    drag = null;
    cancelAnimationFrame(current.frame);
    suppressClick = current.moved;
    // De eventuele klik direct na pointerup hoort niet nog een kaart te selecteren.
    setTimeout(() => { suppressClick = false; }, 0);
    if (handle.hasPointerCapture(current.id)) handle.releasePointerCapture(current.id);
    card.style.removeProperty('transform');
    card.classList.remove('is-dragging');
    document.querySelectorAll('#bkQuestionList .is-drop-target').forEach(el => el.classList.remove('is-drop-target'));
    if (commit && current.moved && current.target && current.target !== card) {
      const from = connectionState.order.indexOf(question);
      const to = connectionState.order.indexOf(Number(current.target.dataset.question));
      moveConnection(question, to - from);
    }
  }
  handle.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary || connectionState?.submitted) return;
    const rect = card.getBoundingClientRect();
    drag = { id: event.pointerId, startY: event.clientY, y: event.clientY, x: event.clientX, scrollTop: screen.scrollTop, centre: rect.top + rect.height / 2, moved: false };
    handle.setPointerCapture(event.pointerId);
    drag.frame = requestAnimationFrame(frame);
  });
  handle.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    drag.y = event.clientY; drag.x = event.clientX;
    if (Math.abs(drag.y - drag.startY) > 5) {
      if (!drag.moved && connectionPicked !== null) {
        const picked = connectionPicked;
        selectConnectionCard(picked);
      }
      drag.moved = true;
      card.classList.add('is-dragging');
    }
  });
  handle.addEventListener('pointerup', () => finish(true));
  handle.addEventListener('pointercancel', () => finish(false));
  handle.addEventListener('lostpointercapture', () => finish(false));
}

function submitConnection() {
  const state = connectionState;
  if (!state) return;
  if (state.submitted) { skipConnection(); return; }
  const guesses = [0, 1, 2].map(i => parseFormattedNumber(document.getElementById('connectionAnswer' + i).value));
  const feedback = document.getElementById('bkFeedback');
  if (!validWholeAnswers(guesses)) {
    feedback.textContent = statsCopy('Vul drie positieve gehele getallen in.', 'Enter a positive whole number for each question.'); return;
  }
  if (!state.operator) {
    feedback.textContent = statsCopy('Kies eerst een operator.', 'Choose an operator first.'); return;
  }
  if (isEquationRequired() && !connectionEquation(state.order.map(i => guesses[i]), state.operator)) { showEquationNotice(); return; }
  const answers = connectionAnswers(state.puzzle);
  const correct = connectionEquation(state.order.map(i => answers[i]), state.operator);
  const factor = answers.reduce((sum, answer, i) => sum + scoreVraag(guesses[i], answer), 0) / 3;
  const progress = connectionProgress();
  const previous = connectionResultFor(state.puzzle.id, progress.results);
  const result = { id: state.puzzle.id, factor, connectionCorrect: correct, exact: correct && guesses.every((g, i) => isSpotOnAnswer(g, answers[i])),
    guesses: state.order.map(i => guesses[i]), answers: state.order.map(i => answers[i]), order: [...state.order],
    categories: state.order.map(i => state.puzzle.categories?.[i] || ''), operators: [state.operator], completedAt: new Date().toISOString() };
  // Een herhaling is een oefenronde: de eerste poging blijft de score.
  if (!previous) {
    progress.results = progress.results.concat(result);
    localStorage.setItem(CONNECTION_PROGRESS_KEY, JSON.stringify(progress));
  }
  state.submitted = true;
  const rule = document.getElementById('connectionRule');
  if (rule) rule.hidden = true;
  // De normale review wordt hergebruikt, in de door de speler gekozen volgorde.
  const ordered = { categories: result.categories };
  state.order.forEach((i, position) => { ordered['q' + (position + 1) + '_label'] = state.puzzle['q' + (i + 1) + '_label']; });
  renderPuzzleReview('bk', ordered, result.guesses, result.answers, factor);
  const connection = document.createElement('section'); connection.className = 'connection-verdict';
  connection.classList.toggle('is-correct', correct);
  const title = document.createElement('h2'); title.textContent = correct ? statsCopy('✓ Verband gevonden!', '✓ Connection found!') : statsCopy('✗ Verband niet gevonden', '✗ Connection not found');
  const equation = document.createElement('p');
  equation.textContent = (correct ? '' : statsCopy('Jouw verband: ', 'Your connection: '))
    + fmt(result.answers[0]) + ' ' + state.operator + ' ' + fmt(result.answers[1]) + (correct ? ' = ' : ' ≠ ') + fmt(result.answers[2]);
  connection.append(title, equation);
  let solutionText = '';
  if (!correct) {
    const solution = validConnections(answers)[0];
    const [a, b, c] = solution.order.map(i => fmt(answers[i]));
    solutionText = a + ' ' + solution.operator + ' ' + b + ' = ' + c;
    const reveal = document.createElement('p');
    reveal.textContent = statsCopy('Het verband: ', 'The connection: ') + solutionText;
    connection.append(reveal);
  }
  const detail = document.createElement('p');
  detail.className = 'connection-verdict-detail';
  detail.textContent = previous
    ? statsCopy('Oefenronde: factor ' + factor.toFixed(2) + '×. Je score blijft ' + previous.factor.toFixed(2) + '×.',
                'Practice round: factor ' + factor.toFixed(2) + '×. Your score stays ' + previous.factor.toFixed(2) + '×.')
    : correct
      ? statsCopy('De drie echte antwoorden vormen precies deze som.', 'The three real answers form exactly this equation.')
      : statsCopy('Je schattingen tellen nog steeds mee in je factor.', 'Your estimates still count towards your factor.');
  connection.append(detail);
  connection.tabIndex = -1;
  connection.setAttribute('aria-labelledby', 'connectionVerdictTitle');
  title.id = 'connectionVerdictTitle';
  document.getElementById('bkQuestionList').prepend(connection);
  feedback.textContent = '';
  document.getElementById('connectionAnnouncement').textContent = (correct
    ? statsCopy('Verband gevonden. ', 'Connection found. ') + equation.textContent
    : statsCopy('Verband niet gevonden. Het verband is ', 'Connection not found. The connection is ') + solutionText)
    + '. ' + statsCopy('Gemiddelde factor ', 'Average factor ') + factor.toFixed(2) + '×.';
  document.getElementById('connectionSkip').hidden = true;
  const liveFormula = document.getElementById('connectionLiveFormula');
  if (liveFormula) liveFormula.style.display = 'none';
  const volgende = nextUnplayedConnection(state.index);
  document.getElementById('bkSubmitButton').textContent = volgende >= 0
    ? statsCopy('Volgende puzzel · #', 'Next puzzle · #') + connectionPool[volgende].number + ' →'
    : statsCopy('Alles gespeeld · naar het overzicht', 'All played · back to overview');
  if (result.exact || (correct && !previous)) launchConfetti();
  document.getElementById('breinkrakersScreen').scrollTop = 0;
  connection.focus({ preventScroll: true });
}

// Oude routes en integraties blijven werken, zonder de oude vier-vragenmodus te laden.
function openBreinkrakers() { openConnection(); }
function closeBreinkrakers() { showScreen('home'); }
function renderBreinkrakersStart() { renderConnectionStart(); }
function startBreinkrakers(index) { startConnection(index); }
function submitBreinkrakers() { submitConnection(); }

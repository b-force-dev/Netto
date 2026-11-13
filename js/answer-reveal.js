// Shared reveal for submitted Daily and regular puzzles. Scores are saved by
// the calling mode before this presentation starts.
//
// Two presentations share one builder:
// - mountAnswerReveal(container, opts): inline, part of the results screen
//   (Daily), so reveal and results read as one continuous screen.
// - showAnswerReveal(opts): modal overlay (library puzzles).
//
// Each question card shows the player's answer next to the real one, a small
// closeness scale (log axis: twice too high sits as far from the middle as
// half too low) and a verdict. Below the cards the three real answers form
// the equation, with the player's own equation underneath.
(() => {
  const copy = (nl, en) => (typeof statsCopy === 'function' ? statsCopy(nl, en) : en);
  const numberLocale = () => (typeof nettoNumberLocale === 'function' ? nettoNumberLocale() : 'en-GB');
  const format = value => (typeof fmt === 'function' ? fmt(value) : Number(value).toLocaleString('en-GB'));
  const exactMatch = (guess, actual) => (typeof isSpotOnAnswer === 'function'
    ? isSpotOnAnswer(guess, actual) : guess === actual);
  const factorOf = (guess, actual) => (typeof scoreVraag === 'function'
    ? scoreVraag(guess, actual) : Math.max(guess / actual, actual / guess));
  const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const translated = text => window.NettoI18n?.t(text) || text;

  // "1.37×" in English, "1,37×" in Dutch; big misses lose their decimals.
  function factorText(factor) {
    const value = Number(factor);
    if (!Number.isFinite(value)) return '';
    const digits = value >= 100 ? 0 : value >= 10 ? 1 : 2;
    return value.toLocaleString(numberLocale(), { minimumFractionDigits:digits, maximumFractionDigits:digits }) + '×';
  }

  // Same steps as the coloured squares in a shared score.
  function toneFor(guess, actual) {
    if (exactMatch(guess, actual)) return 'exact';
    const factor = factorOf(guess, actual);
    return factor <= 1.15 ? 'great' : factor <= 1.5 ? 'good' : factor <= 2.5 ? 'fair' : 'far';
  }

  // A year reads as 1953, not 1,953.
  const yearQuestion = question => /\b(welk jaar|what year|which year)\b/i.test(String(question || '') + ' ' + translated(String(question || '')));
  function formatValue(value, question) {
    const number = Number(value);
    if (Number.isInteger(number) && number >= 1000 && number <= 2200 && yearQuestion(question)) return String(number);
    return format(number);
  }

  function verdictText(guess, actual) {
    if (exactMatch(guess, actual)) return copy('Precies goed', 'Spot on');
    const factor = factorOf(guess, actual);
    const direction = guess < actual ? copy('te laag', 'too low') : copy('te hoog', 'too high');
    // "1.00× too low" says nothing: name the small difference instead.
    if (factor < 1.005) return copy('Maar ', 'Just ') + format(Math.abs(guess - actual)) + ' ' + direction;
    return factorText(factor) + ' ' + direction;
  }

  // Position on the scale: the middle is exact, the ends are 8× off.
  const METER_SPAN = 3; // log2(8)
  function meterPoint(guess, actual) {
    const exponent = Math.log2(guess / actual);
    if (!Number.isFinite(exponent)) return { position:0, clipped:true, high:false };
    return {
      position: 50 + Math.max(-1, Math.min(1, exponent / METER_SPAN)) * 50,
      clipped: Math.abs(exponent) > METER_SPAN,
      high: exponent > 0
    };
  }

  function calculate(a, b, operator) {
    switch (operator) {
      case '+': return a + b;
      case '−': case '-': return a - b;
      case '×': case '*': case 'x': return a * b;
      case '÷': case '/': return b === 0 ? NaN : a / b;
      default: return NaN;
    }
  }
  const sameNumber = (a, b) => Number.isFinite(a) && Number.isFinite(b)
    && Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b), 1);

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // "21 × 93 = 1,953" with the same operator badges as between the cards.
  function equationParts(values, operator) {
    const parts = [];
    values.forEach((value, index) => {
      if (index) parts.push(element('i', index === values.length - 1 ? 'is-equals' : '', index === values.length - 1 ? '=' : operator));
      parts.push(element('b', '', value));
    });
    return parts;
  }

  // Builds the question cards and drives the sequential reveal. Calls
  // onComplete once every answer is shown (immediately when instant).
  function buildReveal({ questions, guesses, answers, operator, units = [], photo = null }, list, { instant, onComplete, onStep }) {
    const numbers = [];
    questions.forEach((question, index) => {
      if (index) {
        const connector = document.createElement('div');
        connector.className = 'answer-reveal-connector';
        const badge = document.createElement('span');
        badge.textContent = index === questions.length - 1 ? '=' : operator;
        connector.append(badge);
        list.append(connector);
      }
      const card = document.createElement('article');
      card.className = 'answer-reveal-question';
      const head = element('div', 'answer-reveal-head');
      const title = document.createElement('h2');
      title.textContent = translated(question);
      head.append(title);
      if (photo && photo.index === index && photo.src) {
        // Vaste maat, dus niets verspringt; laadt de foto niet, dan verdwijnt het vakje.
        const thumb = element('button', 'answer-reveal-photo');
        thumb.type = 'button';
        thumb.setAttribute('aria-label', copy('Vergroot de foto bij deze vraag', 'Enlarge the photo for this question'));
        const image = document.createElement('img');
        image.src = photo.src;
        image.alt = '';
        image.decoding = 'async';
        image.addEventListener('error', () => { thumb.style.visibility = 'hidden'; thumb.disabled = true; });
        thumb.append(image);
        thumb.addEventListener('click', event => { event.stopPropagation(); photo.open?.(); });
        head.append(thumb);
        card.classList.add('has-photo');
      }
      const values = document.createElement('div');
      values.className = 'answer-reveal-values';
      // Alleen compacte maateenheden (m, km², kg, %). Telwoorden en "jaar"
      // voegen niets toe aan een getal en zijn niet altijd vertaald.
      const unit = /^(%|°[CF]|[a-zµ]{1,3}[²³]?(\/[a-z]{1,2})?)$/i.test(String(units[index] || '')) ? String(units[index]) : '';
      const withUnit = strong => {
        if (!unit) return;
        const small = element('small', '', unit);
        small.setAttribute('data-i18n-skip', '');
        strong.append(small);
      };
      const guess = document.createElement('div');
      const guessLabel = document.createElement('span');
      guessLabel.textContent = copy('Jouw antwoord', 'Your answer');
      const guessValue = document.createElement('strong');
      guessValue.append(element('span', 'answer-reveal-number', formatValue(guesses[index], question)));
      withUnit(guessValue);
      guess.append(guessLabel, guessValue);
      const actual = document.createElement('div');
      actual.className = 'answer-reveal-actual';
      const actualLabel = document.createElement('span');
      actualLabel.textContent = copy('Juiste antwoord', 'Actual answer');
      const actualValue = document.createElement('strong');
      actualValue.setAttribute('aria-hidden', 'true');
      const number = element('span', 'answer-reveal-number', '?');
      actualValue.append(number);
      const reserve = element('span', 'answer-reveal-reserve', formatValue(answers[index], question));
      actualValue.append(reserve);
      withUnit(actualValue);
      const announcement = document.createElement('span');
      announcement.className = 'answer-reveal-announcement';
      announcement.setAttribute('aria-live', 'polite');
      actual.append(actualLabel, actualValue, announcement);
      values.append(guess, actual);

      // Closeness scale: middle = the real answer, the dot = the player's.
      const meter = element('div', 'answer-reveal-meter');
      meter.setAttribute('aria-hidden', 'true');
      const track = element('div', 'answer-reveal-track');
      for (const step of [-2, -1, 1, 2]) {
        const tick = element('i', 'answer-reveal-tick');
        tick.style.left = (50 + step / METER_SPAN * 50) + '%';
        track.append(tick);
      }
      const fill = element('i', 'answer-reveal-fill');
      const dot = element('i', 'answer-reveal-dot');
      track.append(fill, element('i', 'answer-reveal-centre'), dot);
      meter.append(element('span', 'answer-reveal-end', '÷8'), track, element('span', 'answer-reveal-end', '×8'));

      const foot = element('div', 'answer-reveal-foot');
      const verdict = document.createElement('p');
      verdict.className = 'answer-reveal-verdict';
      foot.append(verdict);
      card.append(head, values, meter, foot);
      list.append(card);
      numbers.push({ card, number, announcement, verdict, fill, dot, question });
    });

    // The pay-off: the real answers form the equation, the player's own
    // numbers stand right below it. Present from the start, so nothing shifts.
    let payoff = null;
    let spoken = null;
    const slots = [];
    if (questions.length === 3 && operator) {
      payoff = element('div', 'answer-reveal-payoff');
      payoff.append(element('span', 'answer-reveal-payoff-label', copy('De som', 'The equation')));
      const truth = element('p', 'answer-reveal-equation');
      truth.setAttribute('aria-hidden', 'true');
      truth.append(...equationParts(['?', '?', '?'], operator));
      slots.push(...truth.querySelectorAll('b'));
      slots.forEach((slot, index) => {
        slot.style.minWidth = 'min(' + (formatValue(answers[index], questions[index]).length * .64) + 'em, 100%)';
      });
      const yours = element('p', 'answer-reveal-yours');
      const validEquation = sameNumber(calculate(guesses[0], guesses[1], operator), guesses[2]);
      const allExact = guesses.every((guess, index) => exactMatch(guess, answers[index]));
      yours.append(element('span', '', copy('Jij', 'You')),
        ...equationParts(guesses.map((guess, index) => formatValue(guess, questions[index])), operator));
      // Zonder kloppende som (instelling uit) staat er eerlijk een ≠.
      if (!validEquation) {
        yours.querySelector('.is-equals').textContent = '≠';
        const computed = calculate(guesses[0], guesses[1], operator);
        if (Number.isFinite(computed)) yours.append(element('span', 'answer-reveal-computed',
          copy('Berekend: ', 'Calculated: ') + format(computed)));
      }
      if (allExact) yours.append(element('em', '', '✓'));
      spoken = element('span', 'answer-reveal-announcement');
      spoken.setAttribute('aria-live', 'polite');
      payoff.append(truth, yours, spoken);
      list.after(payoff);
    }
    const landPayoff = announce => {
      if (!payoff) return;
      payoff.classList.add('is-landed');
      if (!announce) return;
      const shown = answers.map((answer, index) => formatValue(answer, questions[index]));
      spoken.textContent = copy('De som: ', 'The equation: ') + shown[0] + ' ' + operator + ' ' + shown[1] + ' = ' + shown[2];
    };

    let stopped = false;
    let completed = false;
    const timers = new Set();
    const later = (fn, ms) => {
      const timer = setTimeout(() => { timers.delete(timer); if (!stopped) fn(); }, ms);
      timers.add(timer);
    };
    const settle = (index, announce) => {
      const { card, number, announcement, verdict, fill, dot, question } = numbers[index];
      const shown = formatValue(answers[index], question);
      number.textContent = shown;
      card.classList.remove('is-revealing');
      card.classList.add('is-revealed');
      card.dataset.tone = toneFor(guesses[index], answers[index]);
      const point = meterPoint(guesses[index], answers[index]);
      dot.style.left = point.position + '%';
      fill.style.left = Math.min(50, point.position) + '%';
      fill.style.width = Math.abs(point.position - 50) + '%';
      if (point.clipped) card.classList.add(point.high ? 'is-off-high' : 'is-off-low');
      if (exactMatch(guesses[index], answers[index])) card.classList.add('is-exact');
      verdict.textContent = verdictText(guesses[index], answers[index]);
      if (slots[index]) { slots[index].textContent = shown; slots[index].classList.add('is-known'); }
      if (announce) announcement.textContent = copy('Vraag ', 'Question ') + (index + 1) + ': '
        + copy('juiste antwoord ', 'actual answer ') + shown + '. ' + verdict.textContent + '.';
    };
    const complete = () => {
      if (completed) return;
      completed = true;
      onComplete?.(numbers.map(item => item.card));
    };
    // Jump straight to the end state (skip button, tap, Escape/Enter/Space).
    const finish = () => {
      if (completed) return;
      stopped = true;
      timers.forEach(clearTimeout);
      numbers.forEach((_, index) => settle(index, false));
      landPayoff(false);
      complete();
    };
    const stop = () => { stopped = true; timers.forEach(clearTimeout); };

    if (instant) {
      numbers.forEach((_, index) => settle(index, false));
      landPayoff(false);
      complete();
      return { finish, stop, isComplete: () => true };
    }

    const motion = !reducedMotion();
    const reveal = index => {
      if (index === answers.length) {
        // Eerst valt de som op zijn plek, dan pas volgt de score.
        later(() => { if (payoff) onStep?.(payoff); landPayoff(true); later(complete, motion ? 700 : 150); }, motion ? 100 : 0);
        return;
      }
      const { card, number, question } = numbers[index];
      card.classList.add('is-revealing');
      onStep?.(card);
      // Same shape as the real answer (separators included), so nothing shifts.
      const shown = formatValue(answers[index], question);
      const places = [...shown].map((char, at) => (/\d/.test(char) ? at : -1)).filter(at => at >= 0);
      const spinFor = motion ? 520 : 0;
      // The digits lock from right to left: the size of the number stays a
      // secret until the very last one.
      const lockEvery = motion ? Math.min(130, 480 / Math.max(1, places.length)) : 0;
      const started = performance.now();
      const spin = () => {
        const elapsed = performance.now() - started;
        const locked = elapsed < spinFor ? 0 : Math.floor((elapsed - spinFor) / Math.max(1, lockEvery)) + 1;
        if (!motion || locked >= places.length) {
          settle(index, true);
          later(() => reveal(index + 1), motion ? 560 : 150);
          return;
        }
        const chars = [...shown];
        places.slice(0, places.length - locked).forEach(at => { chars[at] = String(Math.floor(Math.random() * 10)); });
        number.textContent = chars.join('');
        later(spin, 60);
      };
      spin();
    };
    later(() => reveal(0), motion ? 450 : 100);
    return { finish, stop, isComplete: () => completed };
  }

  // After the reveal each card can open its explanation and source in place.
  // At most one card is open; the whole card is a click target for the mouse,
  // the toggle button is the keyboard/screen-reader control.
  let detailCounter = 0;
  function makeExpandable(cards, details) {
    const readyAt = performance.now() + 350; // a late "skip" tap must not open a card
    const entries = cards.map((card, index) => {
      const panel = document.createElement('div');
      panel.className = 'answer-reveal-detail';
      panel.id = 'answerRevealDetail' + (++detailCounter);
      panel.hidden = true;
      const content = details[index];
      if (content) panel.append(content);
      else {
        const empty = document.createElement('p');
        empty.className = 'answer-reveal-detail-empty';
        empty.textContent = copy('Voor deze vraag is geen broninformatie beschikbaar.', 'No source information is available for this question.');
        panel.append(empty);
      }
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'answer-reveal-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', panel.id);
      const label = document.createElement('span');
      label.textContent = copy('Uitleg & bron', 'Explanation & source');
      const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      chevron.setAttribute('class', 'answer-reveal-chevron');
      chevron.setAttribute('viewBox', '0 0 12 12');
      chevron.setAttribute('width', '12');
      chevron.setAttribute('height', '12');
      chevron.setAttribute('aria-hidden', 'true');
      chevron.innerHTML = '<path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';
      toggle.append(label, chevron);
      card.querySelector('.answer-reveal-foot').append(toggle);
      card.append(panel);
      card.classList.add('is-expandable');
      return { card, toggle, panel };
    });
    const setOpen = (target, open) => {
      entries.forEach(entry => {
        const isOpen = entry === target && open;
        entry.panel.hidden = !isOpen;
        entry.toggle.setAttribute('aria-expanded', String(isOpen));
        entry.card.classList.toggle('is-open', isOpen);
      });
    };
    entries.forEach(entry => {
      entry.toggle.addEventListener('click', event => {
        event.stopPropagation();
        setOpen(entry, entry.toggle.getAttribute('aria-expanded') !== 'true');
      });
      entry.card.addEventListener('click', event => {
        // Links and the open panel itself stay clickable without toggling.
        if (event.target.closest('a, button, .answer-reveal-detail')) return;
        if (window.getSelection?.().toString()) return;
        if (performance.now() < readyAt) return;
        setOpen(entry, entry.toggle.getAttribute('aria-expanded') !== 'true');
      });
    });
    return entries.map(entry => entry.toggle);
  }

  let cancelInline = () => {};
  window.cancelInlineAnswerReveal = () => cancelInline();
  // Inline reveal inside a results container. While revealing, the container
  // gets .is-answer-revealing so the rest of the results can wait below.
  window.mountAnswerReveal = function (container, opts) {
    cancelInline();
    // Bij een stille herteken (bv. cloudsync) blijft een open kaart open.
    const previous = container.querySelector(':scope > .answer-reveal-inline');
    const openIndex = previous ? [...previous.querySelectorAll('.answer-reveal-question')].findIndex(card => card.classList.contains('is-open')) : -1;
    previous?.remove();
    const section = document.createElement('section');
    section.className = 'answer-reveal-inline' + (opts.instant ? ' is-instant' : '');
    section.setAttribute('aria-label', copy('Jouw antwoorden', 'Your answers'));
    const header = document.createElement('header');
    header.className = 'answer-reveal-header';
    const heading = document.createElement('h2');
    header.append(heading);
    const list = document.createElement('div');
    list.className = 'answer-reveal-questions';
    const skip = document.createElement('button');
    skip.type = 'button';
    skip.className = 'answer-reveal-skip';
    skip.textContent = copy('Sla over →', 'Skip →');
    header.append(skip);
    const legend = element('p', 'answer-reveal-legend', copy('Midden = juist · stip = jouw schatting', 'Centre = actual · dot = your estimate'));
    section.append(header, legend, list);
    container.prepend(section);
    const bar = () => document.querySelector('.topbar')?.offsetHeight || 0;
    const scrollBy = top => window.scrollTo({ top: window.scrollY + top, behavior: reducedMotion() ? 'auto' : 'smooth' });
    // Past de reveal niet onder de paginakop, schuif hem dan net onder de
    // vaste balk, zodat alle drie de vragen tegelijk in beeld zijn.
    if (!opts.instant) requestAnimationFrame(() => {
      const box = section.getBoundingClientRect();
      if (box.bottom <= window.innerHeight) return;
      scrollBy(box.top - bar() - 12);
    });

    // Wie zelf scrolt of overslaat, houdt de regie: dan schuift er niets meer.
    let handsOff = false;
    const touched = () => { handsOff = true; };
    const skipKeys = event => {
      if (!['Escape', 'Enter', ' '].includes(event.key) || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.target.closest?.('input, textarea, select, [contenteditable]')) return;
      // Enter/spatie op een andere knop of link hoort bij die knop.
      if (event.key !== 'Escape' && event.target !== skip && event.target.closest?.('button, a, [role="button"]')) return;
      event.preventDefault();
      handsOff = true;
      controller.finish();
    };
    const skipTap = event => {
      if (event.target.closest('a')) return;
      handsOff = true;
      controller.finish();
    };
    const release = () => {
      document.removeEventListener('keydown', skipKeys);
      section.removeEventListener('click', skipTap);
      window.removeEventListener('wheel', touched);
      window.removeEventListener('touchmove', touched);
    };
    const done = cards => {
      heading.textContent = copy('Je antwoorden.', 'Your answers.');
      container.classList.remove('is-answer-revealing');
      section.classList.add('is-complete');
      const skipHadFocus = document.activeElement === skip;
      skip.remove();
      release();
      const toggles = makeExpandable(cards, opts.details || []);
      if (opts.instant && openIndex >= 0) toggles[openIndex]?.click();
      if (skipHadFocus) toggles[0]?.focus({ preventScroll:true });
      // De score in één oogopslag, ook als het scorepaneel nog onder de vouw staat.
      const rest = section.nextElementSibling;
      if (Number.isFinite(opts.factor) && opts.factor >= 1 && rest) {
        const pill = element('button', 'answer-reveal-score-pill');
        pill.type = 'button';
        pill.append(element('span', '', copy('Nauwkeurigheid', 'Accuracy')), element('strong', '', Math.round(100 / opts.factor) + '%'));
        pill.addEventListener('click', event => {
          event.stopPropagation();
          rest.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block:'start' });
        });
        header.append(pill);
      }
      // Na een uitgekeken reveal schuift de score in beeld; de som blijft erboven staan.
      if (!opts.instant && !handsOff && rest) requestAnimationFrame(() => {
        const box = rest.getBoundingClientRect();
        if (box.bottom + 16 <= window.innerHeight) return;
        const anchor = section.querySelector('.answer-reveal-payoff') || section;
        const room = anchor.getBoundingClientRect().top - bar() - 12;
        const wanted = Math.min(box.bottom + 16 - window.innerHeight, room);
        if (wanted > 8) scrollBy(wanted);
      });
      opts.onDone?.();
    };
    heading.textContent = opts.instant ? copy('Je antwoorden.', 'Your answers.')
      : copy('De onthulling.', 'The reveal.');
    if (!opts.instant) {
      container.classList.add('is-answer-revealing');
      document.addEventListener('keydown', skipKeys);
      section.addEventListener('click', skipTap);
      window.addEventListener('wheel', touched, { passive:true });
      window.addEventListener('touchmove', touched, { passive:true });
    }
    // Kleine schermen: wat aan de beurt is schuift in beeld, tenzij de speler zelf scrolt.
    const follow = target => {
      if (handsOff) return;
      const box = target.getBoundingClientRect();
      const below = box.bottom + 12 - window.innerHeight;
      if (below > 0) scrollBy(Math.min(below, box.top - bar() - 12));
    };
    const controller = buildReveal(opts, list, { instant: opts.instant, onComplete: done, onStep: follow });
    cancelInline = () => {
      controller.stop();
      release();
      container.classList.remove('is-answer-revealing');
    };
    return controller;
  };

  let cancelCurrent = () => {};
  window.showAnswerReveal = function (opts) {
    cancelCurrent();
    const previousFocus = document.activeElement;
    const overlay = document.createElement('dialog');
    overlay.className = 'answer-reveal';
    overlay.setAttribute('aria-label', copy('Jouw puzzelresultaat', 'Your puzzle results'));
    const shell = document.createElement('div');
    shell.className = 'answer-reveal-sheet';
    const header = document.createElement('header');
    header.className = 'answer-reveal-header';
    const eyebrow = document.createElement('span');
    eyebrow.textContent = copy('NETTO · DE ONTHULLING', 'NETTO · THE REVEAL');
    const heading = document.createElement('h1');
    heading.textContent = copy('Tijd om de antwoorden te verbinden.', 'Let’s connect the answers.');
    header.append(eyebrow, heading);
    const list = document.createElement('div');
    list.className = 'answer-reveal-questions';
    const footer = document.createElement('footer');
    footer.className = 'answer-reveal-footer';
    const score = document.createElement('div');
    score.className = 'answer-reveal-score';
    score.setAttribute('aria-live', 'polite');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = copy('Sla over →', 'Skip →');
    footer.append(score, button);
    const legend = element('p', 'answer-reveal-legend', copy('Midden = juist · stip = jouw schatting', 'Centre = actual · dot = your estimate'));
    shell.append(header, legend, list, footer);
    overlay.append(shell);
    document.body.append(overlay);
    overlay.showModal();
    // Lock scrolling without letting the page width jump when the
    // scrollbar disappears.
    const oldOverflow = document.body.style.overflow;
    const oldPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = scrollbar + 'px';

    const close = () => {
      controller.stop();
      overlay.close();
      overlay.remove();
      document.body.style.overflow = oldOverflow;
      document.body.style.paddingRight = oldPadding;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll:true });
    };
    const done = () => {
      score.replaceChildren();
      const label = document.createElement('span');
      label.textContent = copy('JOUW GEMIDDELDE FACTOR', 'YOUR AVERAGE FACTOR');
      const value = document.createElement('strong');
      value.textContent = factorText(opts.factor);
      const note = document.createElement('p');
      note.textContent = opts.factor === 1
        ? copy('Perfect. Elk antwoord precies goed.', 'Perfect. Every answer exactly right.')
        : copy('Dichter bij ' + factorText(1) + ' is beter. ' + factorText(1) + ' betekent dat elk antwoord exact is.',
          'Closer to ' + factorText(1) + ' is better. ' + factorText(1) + ' means every answer is exact.');
      score.append(label, value, note);
      button.textContent = copy('Bekijk antwoorden & bronnen →', 'Review answers & sources →');
      shell.classList.add('is-complete');
    };
    const controller = buildReveal(opts, list, { instant:false, onComplete: done });
    cancelCurrent = close;
    overlay.addEventListener('keydown', event => {
      if (controller.isComplete() || !['Enter', ' '].includes(event.key) || event.target.closest('button, a, input')) return;
      event.preventDefault();
      controller.finish();
    });
    overlay.addEventListener('cancel', event => {
      event.preventDefault();
      if (controller.isComplete()) close(); else controller.finish();
    });
    button.addEventListener('click', () => {
      if (controller.isComplete()) close(); else controller.finish();
    });
    // Tikken op de antwoorden slaat de animatie over, net als bij de Daily.
    list.addEventListener('click', () => controller.finish());
  };

  // Gedeeld met het scorepaneel, zodat getallen overal hetzelfde ogen.
  window.NettoReveal = { factorText, toneFor };
})();

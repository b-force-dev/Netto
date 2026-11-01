// Shared reveal for submitted Daily and regular puzzles. Scores are saved by
// the calling mode before this presentation starts.
//
// Two presentations share one builder:
// - mountAnswerReveal(container, opts): inline, part of the results screen
//   (Daily), so reveal and results read as one continuous screen.
// - showAnswerReveal(opts): modal overlay (library puzzles).
(() => {
  const copy = (nl, en) => (typeof statsCopy === 'function' ? statsCopy(nl, en) : en);
  const format = value => (typeof fmt === 'function' ? fmt(value) : Number(value).toLocaleString('en-GB'));
  const exactMatch = (guess, actual) => (typeof isSpotOnAnswer === 'function'
    ? isSpotOnAnswer(guess, actual) : guess === actual);
  const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  function verdictText(guess, actual) {
    if (exactMatch(guess, actual)) return copy('Precies goed', 'Spot on');
    const factor = typeof scoreVraag === 'function' ? scoreVraag(guess, actual) : Math.max(guess / actual, actual / guess);
    return factor.toFixed(2) + '× ' + (guess < actual ? copy('te laag', 'too low') : copy('te hoog', 'too high'));
  }

  // Builds the question cards and drives the sequential reveal. Calls
  // onComplete once every answer is shown (immediately when instant).
  function buildReveal({ questions, guesses, answers, operator }, list, { instant, onComplete }) {
    const numbers = [];
    questions.forEach((question, index) => {
      if (index) {
        const connector = document.createElement('div');
        connector.className = 'answer-reveal-connector';
        const badge = document.createElement('span');
        badge.textContent = index === 1 ? operator : '=';
        connector.append(badge);
        list.append(connector);
      }
      const card = document.createElement('article');
      card.className = 'answer-reveal-question';
      const title = document.createElement('h2');
      title.textContent = window.NettoI18n?.t(question) || question;
      const values = document.createElement('div');
      values.className = 'answer-reveal-values';
      const guess = document.createElement('div');
      const guessLabel = document.createElement('span');
      guessLabel.textContent = copy('Jouw antwoord', 'Your answer');
      const guessValue = document.createElement('strong');
      guessValue.textContent = format(guesses[index]);
      guess.append(guessLabel, guessValue);
      const actual = document.createElement('div');
      actual.className = 'answer-reveal-actual';
      const actualLabel = document.createElement('span');
      actualLabel.textContent = copy('Juiste antwoord', 'Actual answer');
      const number = document.createElement('strong');
      number.setAttribute('aria-hidden', 'true');
      number.textContent = '?';
      const announcement = document.createElement('span');
      announcement.className = 'answer-reveal-announcement';
      announcement.setAttribute('aria-live', 'polite');
      actual.append(actualLabel, number, announcement);
      const verdict = document.createElement('p');
      verdict.className = 'answer-reveal-verdict';
      values.append(guess, actual);
      card.append(title, values, verdict);
      list.append(card);
      numbers.push({ card, number, announcement, verdict });
    });

    let stopped = false;
    let completed = false;
    const timers = new Set();
    const later = (fn, ms) => {
      const timer = setTimeout(() => { timers.delete(timer); if (!stopped) fn(); }, ms);
      timers.add(timer);
    };
    const settle = (index, announce) => {
      const { card, number, announcement, verdict } = numbers[index];
      number.textContent = format(answers[index]);
      card.classList.remove('is-revealing');
      card.classList.add('is-revealed');
      if (exactMatch(guesses[index], answers[index])) card.classList.add('is-exact');
      verdict.textContent = verdictText(guesses[index], answers[index]);
      if (announce) announcement.textContent = copy('Vraag ', 'Question ') + (index + 1) + ': '
        + copy('juiste antwoord ', 'actual answer ') + format(answers[index]);
    };
    const complete = () => {
      if (completed) return;
      completed = true;
      onComplete?.(numbers.map(item => item.card));
    };
    // Jump straight to the end state (skip button, Escape, click).
    const finish = () => {
      if (completed) return;
      stopped = true;
      timers.forEach(clearTimeout);
      numbers.forEach((_, index) => settle(index, false));
      complete();
    };
    const stop = () => { stopped = true; timers.forEach(clearTimeout); };

    if (instant) {
      numbers.forEach((_, index) => settle(index, false));
      complete();
      return { finish, stop, isComplete: () => true };
    }

    const motion = !reducedMotion();
    const reveal = index => {
      if (index === answers.length) { complete(); return; }
      const { card, number } = numbers[index];
      card.classList.add('is-revealing');
      const started = performance.now();
      const duration = motion ? 900 : 0;
      // Keep the digit count stable so the answer never shifts the layout.
      const digits = String(answers[index]).replace(/\D/g, '').length || 1;
      const spin = () => {
        if (performance.now() - started >= duration) {
          settle(index, true);
          later(() => reveal(index + 1), motion ? 400 : 150);
          return;
        }
        number.textContent = Array.from({ length:digits }, () => Math.floor(Math.random() * 10)).join('');
        later(spin, 65);
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
      const foot = document.createElement('div');
      foot.className = 'answer-reveal-foot';
      const verdict = card.querySelector('.answer-reveal-verdict');
      if (verdict) foot.append(verdict);
      foot.append(toggle);
      card.append(foot, panel);
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
    section.append(header, list);
    container.prepend(section);
    // Past de reveal niet onder de paginakop, schuif hem dan net onder de
    // vaste balk, zodat alle drie de vragen tegelijk in beeld zijn.
    if (!opts.instant) requestAnimationFrame(() => {
      const box = section.getBoundingClientRect();
      if (box.bottom <= window.innerHeight) return;
      const bar = document.querySelector('.topbar')?.offsetHeight || 0;
      window.scrollTo({ top: window.scrollY + box.top - bar - 12, behavior: reducedMotion() ? 'auto' : 'smooth' });
    });

    const onKey = event => { if (event.key === 'Escape') { event.preventDefault(); controller.finish(); } };
    const done = cards => {
      heading.textContent = copy('Je antwoorden.', 'Your answers.');
      container.classList.remove('is-answer-revealing');
      section.classList.add('is-complete');
      const skipHadFocus = document.activeElement === skip;
      skip.remove();
      document.removeEventListener('keydown', onKey);
      const toggles = makeExpandable(cards, opts.details || []);
      if (opts.instant && openIndex >= 0) toggles[openIndex]?.click();
      if (skipHadFocus) toggles[0]?.focus({ preventScroll:true });
      opts.onDone?.();
    };
    heading.textContent = opts.instant ? copy('Je antwoorden.', 'Your answers.')
      : copy('Tijd om de antwoorden te verbinden.', 'Let’s connect the answers.');
    if (!opts.instant) {
      container.classList.add('is-answer-revealing');
      document.addEventListener('keydown', onKey);
    }
    const controller = buildReveal(opts, list, { instant: opts.instant, onComplete: done });
    skip.addEventListener('click', () => controller.finish());
    cancelInline = () => {
      controller.stop();
      document.removeEventListener('keydown', onKey);
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
    eyebrow.textContent = 'NETTO · THE REVEAL';
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
    shell.append(header, list, footer);
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
      value.textContent = opts.factor.toFixed(2) + '×';
      const note = document.createElement('p');
      note.textContent = opts.factor === 1
        ? copy('Perfect. Elk antwoord precies goed.', 'Perfect. Every answer exactly right.')
        : copy('Dichter bij 1.00× is beter. 1.00× betekent dat elk antwoord exact is.', 'Closer to 1.00× is better. 1.00× means every answer is exact.');
      score.append(label, value, note);
      button.textContent = copy('Bekijk antwoorden & bronnen →', 'Review answers & sources →');
      shell.classList.add('is-complete');
    };
    const controller = buildReveal(opts, list, { instant:false, onComplete: done });
    cancelCurrent = close;
    overlay.addEventListener('cancel', event => {
      event.preventDefault();
      if (controller.isComplete()) close(); else controller.finish();
    });
    button.addEventListener('click', () => {
      if (controller.isComplete()) close(); else controller.finish();
    });
  };
})();

// Shared reveal for submitted Daily and regular puzzles. Scores are saved by
// the calling mode before this presentation starts.
(() => {
  let cancelCurrent = () => {};
  window.showAnswerReveal = function ({ questions, guesses, answers, operator, factor }) {
    cancelCurrent();
    const previousFocus = document.activeElement;
    const overlay = document.createElement('dialog');
    overlay.className = 'answer-reveal';
    overlay.setAttribute('aria-label', 'Your puzzle results');
    const shell = document.createElement('div');
    shell.className = 'answer-reveal-sheet';
    shell.innerHTML = '<header class="answer-reveal-header"><span>NETTO · THE REVEAL</span><h1>Let’s connect the answers.</h1></header><div class="answer-reveal-questions"></div><footer class="answer-reveal-footer"><div class="answer-reveal-score" aria-live="polite"></div><button type="button" disabled>Revealing answers…</button></footer>';
    overlay.append(shell);
    const list = shell.querySelector('.answer-reveal-questions');
    const format = value => Number(value).toLocaleString('en-GB');
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
      guess.innerHTML = '<span>Your answer</span><strong></strong>';
      guess.querySelector('strong').textContent = format(guesses[index]);
      const actual = document.createElement('div');
      actual.className = 'answer-reveal-actual';
      actual.innerHTML = '<span>Actual answer</span><strong aria-hidden="true">?</strong><span class="answer-reveal-announcement" aria-live="polite"></span>';
      numbers.push({ card, number:actual.querySelector('strong'), announcement:actual.querySelector('.answer-reveal-announcement') });
      values.append(guess, actual);
      card.append(title, values);
      list.append(card);
    });
    document.body.append(overlay);
    overlay.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    let stopped = false;
    const timers = new Set();
    const later = (fn, ms) => {
      const timer = setTimeout(() => { timers.delete(timer); if (!stopped) fn(); }, ms);
      timers.add(timer);
    };
    const close = () => {
      stopped = true;
      timers.forEach(clearTimeout);
      overlay.close();
      overlay.remove();
      document.body.style.overflow = oldOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll:true });
    };
    cancelCurrent = close;
    let finished = false;
    overlay.addEventListener('cancel', event => {
      if (!finished) event.preventDefault();
      else { event.preventDefault(); close(); }
    });
    const button = shell.querySelector('button');
    button.addEventListener('click', close);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reveal = index => {
      if (index === answers.length) {
        finished = true;
        const score = shell.querySelector('.answer-reveal-score');
        score.innerHTML = '<span>YOUR AVERAGE FACTOR</span><strong></strong><p></p>';
        score.querySelector('strong').textContent = factor.toFixed(2) + '×';
        score.querySelector('p').textContent = factor === 1 ? 'Perfect. Every answer exactly right.' : 'Closer to 1.00× is better. 1.00× means every answer is exact.';
        button.disabled = false;
        button.textContent = 'Review answers & sources →';
        shell.classList.add('is-complete');
        return;
      }
      const { card, number, announcement } = numbers[index];
      card.classList.add('is-revealing');
      const started = performance.now();
      const duration = reducedMotion ? 0 : 900;
      const spin = () => {
        if (performance.now() - started >= duration) {
          number.textContent = format(answers[index]);
          card.classList.remove('is-revealing');
          card.classList.add('is-revealed');
          if (guesses[index] === answers[index]) card.classList.add('is-exact');
          announcement.textContent = 'Question ' + (index + 1) + ': actual answer ' + format(answers[index]);
          later(() => reveal(index + 1), reducedMotion ? 150 : 400);
          return;
        }
        // Keep the digit count stable so the answer never shifts the layout.
        const digits = String(answers[index]).replace(/\D/g, '').length;
        number.textContent = Array.from({ length:digits }, () => Math.floor(Math.random() * 10)).join('');
        later(spin, 65);
      };
      spin();
    };
    later(() => reveal(0), reducedMotion ? 100 : 450);
  };
})();

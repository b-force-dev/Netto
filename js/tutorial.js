// Local practice only: no Daily state, scores, requests or service-worker changes.
(() => {
  'use strict';
  const ROOT = new URL('../', document.currentScript.src);
  const SEEN = 'netto_tutorial_seen_v1';
  const copy = (en, nl) => window.NettoI18n?.locale() === 'nl' ? nl : en;
  // Same internationally familiar example as the home page and how-to-play.
  const answers = [8, 11, 88];
  const factorText = value => value.toLocaleString(window.NettoI18n?.locale() === 'nl' ? 'nl-NL' : 'en-GB', { minimumFractionDigits:2, maximumFractionDigits:2 });
  const questions = () => [copy('Legs on a spider?', 'Poten van een spin?'),
    copy('Players on a football team on the pitch?', 'Spelers van een voetbalteam op het veld?'), copy('Keys on a standard piano?', 'Toetsen van een standaardpiano?')];
  let dialog, content, step, guesses, corrected, opener, chip;
  const el = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const button = (text, fn, className = '') => {
    const node = el('button', text, className);
    node.type = 'button'; node.onclick = fn;
    return node;
  };
  function remember() { try { localStorage.setItem(SEEN, '1'); } catch (_) {} }
  function close() {
    remember(); dialog.close(); chip?.remove();
    document.body.classList.remove('tutorial-open');
    if (opener?.isConnected && opener.getClientRects().length) opener.focus();
    else document.getElementById('btnStartPuzzle')?.focus();
  }
  function viewport() {
    if (!dialog?.open) return;
    const vv = window.visualViewport;
    dialog.style.setProperty('--tour-height', (vv?.height || window.innerHeight) + 'px');
    dialog.style.setProperty('--tour-top', (vv?.offsetTop || 0) + 'px');
    if (dialog.contains(document.activeElement)) document.activeElement.scrollIntoView({ block:'nearest' });
  }
  function render() {
    content.replaceChildren();
    dialog.querySelector('.tutorial-progress').textContent = copy('Practice', 'Oefening') + ' · ' + (step + 1) + ' / 3';
    const title = el('h2', [copy('Three questions. One equation.', 'Drie vragen. Eén som.'),
      copy('Let the connection help.', 'Laat het verband helpen.'), copy('You’ve got it!', 'Je hebt het door!')][step]);
    title.id = 'tutorialTitle'; title.tabIndex = -1;
    content.append(title);
    if (step === 0) {
      content.append(el('p', copy('Try three quick guesses. No pressure — this is just practice.', 'Doe drie snelle schattingen. Dit is alleen een oefening.')));
      const form = el('form');
      questions().forEach((question, i) => {
        const block = el('div', '', 'q-block tutorial-question');
        const label = el('label', String.fromCharCode(65 + i) + ' · ' + question, 'q-label');
        label.htmlFor = 'tutorialGuess' + i;
        const wrapper = el('div', '', 'input-wrapper');
        const input = el('input'); input.id = label.htmlFor;
        input.type = 'text'; input.inputMode = 'numeric'; input.autocomplete = 'off';
        input.spellcheck = false; input.required = true;
        input.setAttribute('enterkeyhint', i < 2 ? 'next' : 'go');
        input.setAttribute('aria-describedby', 'tutorialError');
        input.placeholder = copy('Your estimate', 'Jouw schatting');
        bindWholeNumberInput(input, () => input.setCustomValidity(''));
        input.addEventListener('keydown', event => {
          if (event.key === 'Enter' && i < 2) {
            event.preventDefault(); form.querySelectorAll('input')[i + 1].focus();
          }
        });
        wrapper.append(input); block.append(label, wrapper); form.append(block);
      });
      const error = el('p', '', 'tutorial-error'); error.id = 'tutorialError'; error.setAttribute('role', 'alert');
      form.append(error);
      const next = el('button', copy('Find the connection →', 'Ontdek het verband →'), 'tutorial-primary'); next.type = 'submit';
      form.append(next);
      form.onsubmit = event => {
        event.preventDefault();
        const inputs = [...form.querySelectorAll('input')];
        // Same locale-aware parser as the Daily, with k/m shorthand. Reject malformed grouping.
        guesses = inputs.map(input => parseFormattedNumber(input.value.trim()));
        const invalid = inputs.findIndex((input, i) => !Number.isSafeInteger(guesses[i]) || guesses[i] <= 0);
        if (invalid >= 0) {
          error.textContent = copy('Enter a positive whole number for each guess.', 'Vul voor elke schatting een positief heel getal in.');
          inputs[invalid].focus(); return;
        }
        document.activeElement.blur(); step = 1; render();
      };
      content.append(form);
    } else if (step === 1) {
      content.append(el('p', copy('A spider has 8 legs. A football team has 11 players on the pitch. In this puzzle, A × B = C. What does that tell you about the piano?',
        'Een spin heeft 8 poten. Een voetbalteam heeft 11 spelers op het veld. In deze puzzel geldt A × B = C. Wat zegt dat over de piano?')));
      content.append(el('div', '8 × 11 = ' + (corrected ? '88' : '?'), 'tutorial-equation'));
      content.append(el('p', copy('Your piano guess: ', 'Jouw schatting voor de piano: ') + fmt(guesses[2]) + (corrected ? ' → 88' : '')));
      if (!corrected) content.append(button(copy('Use the connection: 8 × 11', 'Gebruik het verband: 8 × 11'), () => {
        corrected = true; render();
      }, 'tutorial-primary'));
      else {
        const status = el('p', copy('88 keys! Two answers you trust can improve the third.', '88 toetsen! Met twee zekere antwoorden verbeter je het derde.'), 'tutorial-insight');
        status.setAttribute('role', 'status'); content.append(status);
        content.append(button(copy('Reveal my practice score →', 'Bekijk mijn oefenscore →'), () => {
          step = 2; render(); remember(); window.nettoTrack?.('tutorial_done');
        }, 'tutorial-primary'));
      }
    } else {
      content.append(el('div', '8 × 11 = 88', 'tutorial-equation'));
      const before = guesses.reduce((sum, g, i) => sum + scoreVraag(g, answers[i]), 0) / 3;
      content.append(el('p', copy('Your first guesses: ', 'Je eerste schattingen: ') + guesses.map(fmt).join(' · ')));
      content.append(el('p', copy('Average factor: ', 'Gemiddelde factor: ') + factorText(before) + '× → ' + factorText(1) + '×', 'tutorial-insight'));
      content.append(el('p', copy('1.00× is perfect; 2× means you were a factor of two off.', '1,00× is perfect; 2× betekent dat je er een factor twee naast zat.')));
      content.append(el('p', copy('We used the two known answers and the connection to get all three right. In the Daily, find the clues yourself.',
        'Met twee bekende antwoorden en het verband hadden we alles goed. In de Daily zoek je zelf de aanwijzingen.')));
      content.append(button(copy('Play today’s Daily', 'Speel de Daily van vandaag'), () => {
        close(); window.NettoRoutes.openToday();
      }, 'tutorial-primary'));
      const sources = el('a', copy('Practice facts: piano keys', 'Oefenfeiten: pianotoetsen'));
      sources.href = 'https://www.yamaha.com/en/musical_instrument_guide/piano/trivia/trivia007.html';
      sources.target = '_blank'; sources.rel = 'noopener'; sources.className = 'tutorial-source'; content.append(sources);
    }
    title.focus({ preventScroll:true }); content.scrollTop = 0; viewport();
  }
  function open() {
    if (dialog.open) return;
    opener = document.activeElement; step = 0; guesses = []; corrected = false;
    if (typeof closeMenu === 'function') closeMenu();
    document.body.classList.add('tutorial-open'); dialog.showModal(); render();
  }
  function firstVisit() {
    try {
      if (localStorage.getItem(SEEN)) return false;
      for (const key of Object.keys(localStorage)) {
        if (/^netto_(plays(?:_|$)|library_plays|race_stats|race_best|connection_progress)/.test(key)) {
          const saved = JSON.parse(localStorage.getItem(key));
          if (saved && (typeof saved === 'number' ? saved > 0 : Object.keys(saved).length > 0)) return false;
        }
      }
      return true;
    } catch (_) { return false; }
  }
  // Capture the original address before routes.js rewrites legacy links.
  const arrival = new URL(location.href);
  const path = arrival.pathname.slice(ROOT.pathname.length).replace(/^\/+|\/+$/g, '');
  const linked = !['', 'index.html'].includes(path) || !!arrival.hash ||
    [...arrival.searchParams.keys()].some(key => !['sw', 'landing', 'utm_source', 'utm_medium', 'utm_campaign'].includes(key));
  function init() {
    dialog = el('dialog', '', 'tutorial-dialog');
    dialog.setAttribute('aria-labelledby', 'tutorialTitle');
    const header = el('div', '', 'tutorial-header');
    header.append(el('span', '', 'tutorial-progress'), button(copy('Skip tour', 'Tour overslaan'), close));
    content = el('div', '', 'tutorial-content'); dialog.append(header, content); document.body.append(dialog);
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const nodes = [...dialog.querySelectorAll('button,input,a[href]')].filter(node => !node.disabled && node.getClientRects().length);
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement.tabIndex === -1)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    window.visualViewport?.addEventListener('resize', viewport);
    window.visualViewport?.addEventListener('scroll', viewport);
    window.addEventListener('resize', viewport);
    dialog.addEventListener('focusin', () => requestAnimationFrame(viewport));
    document.querySelector('[data-tutorial-start]')?.addEventListener('click', open);
    window.NettoTutorial = Object.freeze({ open });
    if (!firstVisit()) return;
    // Een nieuwe bezoeker ziet eerst de startpagina met het voorbeeld. De tour
    // is een uitnodiging, geen venster dat die pagina meteen bedekt.
    {
      chip = el('div', '', 'tutorial-chip');
      chip.append(button(copy('New here? 30-second tour', 'Nieuw hier? Tour van 30 seconden'), open),
        button('×', () => { remember(); chip.remove(); }));
      chip.lastChild.setAttribute('aria-label', copy('Dismiss tour invitation', 'Touruitnodiging sluiten'));
      document.body.append(chip);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

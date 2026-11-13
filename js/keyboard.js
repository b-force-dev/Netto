// Toetsenbordgedrag voor het menu en het inlogvenster: Esc sluit, Tab blijft
// binnen wat open staat, en de focus gaat terug naar waar hij vandaan kwam.
// Het statistiekenvenster regelt dit zelf al in core.js.
(function () {
  const sidebar = document.getElementById('sidebar');
  const menuKnop = document.getElementById('hamburgerBtn');
  const auth = document.getElementById('modalAuth');
  const calculator = document.getElementById('calculator');
  const focusbaar = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]';
  const zichtbaar = element => element.getClientRects().length > 0;
  const stops = container => Array.from(container.querySelectorAll(focusbaar)).filter(zichtbaar);

  function menuOpen() { return Boolean(sidebar?.classList.contains('open')); }
  function authOpen() { return Boolean(auth?.classList.contains('active')); }

  // ---- Menu: aria-expanded, focus erin bij openen en terug bij sluiten ----
  if (sidebar && menuKnop) {
    menuKnop.setAttribute('aria-controls', 'sidebar');
    menuKnop.setAttribute('aria-expanded', 'false');
    let wasOpen = false;
    new MutationObserver(() => {
      const open = menuOpen();
      if (open === wasOpen) return;
      wasOpen = open;
      menuKnop.setAttribute('aria-expanded', String(open));
      if (open) {
        // Wachten tot het paneel zichtbaar is; een verborgen knop pakt geen focus.
        requestAnimationFrame(() => sidebar.querySelector('.sidebar-close')?.focus());
      } else if (sidebar.contains(document.activeElement)) {
        menuKnop.focus();
      }
    }).observe(sidebar, { attributes: true, attributeFilter: ['class'] });
  }

  // ---- Inlogvenster: dialoogrol, focus op het eerste veld, focus terug ----
  if (auth) {
    const venster = auth.querySelector('.modal');
    if (venster) {
      venster.setAttribute('role', 'dialog');
      venster.setAttribute('aria-modal', 'true');
      venster.setAttribute('aria-labelledby', 'authTitle');
    }
    let wasOpen = false;
    let terugNaar = null;
    new MutationObserver(() => {
      const open = authOpen();
      if (open === wasOpen) return;
      wasOpen = open;
      if (open) {
        const title = auth.querySelector('#authFormView')?.style.display === 'none'
          ? auth.querySelector('#authLoggedInView .modal-title')
          : auth.querySelector('#authForgotView')?.style.display !== 'none'
            ? auth.querySelector('#authForgotView .modal-title')
            : auth.querySelector('#authTitle');
        if (title) {
          if (!title.id) title.id = 'authVisibleTitle';
          venster?.setAttribute('aria-labelledby', title.id);
        }
        terugNaar = document.activeElement;
        requestAnimationFrame(() => {
          const eerste = stops(auth).find(element => element.matches('input')) || stops(auth)[0];
          eerste?.focus();
        });
      } else if (terugNaar && document.contains(terugNaar) && zichtbaar(terugNaar)) {
        terugNaar.focus();
        terugNaar = null;
      }
    }).observe(auth, { attributes: true, attributeFilter: ['class'] });
  }

  function houdBinnen(event, container) {
    const lijst = stops(container);
    if (!lijst.length) return;
    const eerste = lijst[0];
    const laatste = lijst[lijst.length - 1];
    if (!container.contains(document.activeElement)) { event.preventDefault(); eerste.focus(); }
    else if (event.shiftKey && document.activeElement === eerste) { event.preventDefault(); laatste.focus(); }
    else if (!event.shiftKey && document.activeElement === laatste) { event.preventDefault(); eerste.focus(); }
  }

  document.addEventListener('keydown', event => {
    // Library inputs are generated without a form; mirror Daily's Enter flow.
    const answer = event.target.closest?.('input[id^="libraryAnswer"], input[id^="catalogusAnswer"]');
    if (event.key === 'Enter' && answer && !event.defaultPrevented && !event.isComposing) {
      const prefix = answer.id.startsWith('library') ? 'library' : 'catalogus';
      const inputs = Array.from(document.querySelectorAll('#' + prefix + 'QuestionList input'))
        .filter(input => !input.disabled && !input.readOnly && zichtbaar(input));
      const index = inputs.indexOf(answer);
      if (index < 0) return;
      event.preventDefault();
      if (index < inputs.length - 1) inputs[index + 1].focus();
      else submitPuzzleView(prefix);
      return;
    }
    if (event.key === 'Tab') {
      if (authOpen()) houdBinnen(event, auth);
      else if (menuOpen()) houdBinnen(event, sidebar);
      return;
    }
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    // Een open <dialog> (foto) sluit de browser zelf al.
    if (document.querySelector('dialog[open]')) return;
    if (document.getElementById('modalStats')?.classList.contains('active')) return;
    if (authOpen()) { closeAuthModal(); return; }
    if (menuOpen()) { closeMenu(); return; }
    if (calculator?.classList.contains('open') && typeof toggleCalculator === 'function') toggleCalculator(false);
  });
})();

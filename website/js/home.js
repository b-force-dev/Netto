// De home: de Daily-kaart, twee snelle tegels en de andere spelvormen.
// Dit script koppelt de gewone links aan de schermen, laat de knop van de
// Daily weten of er vandaag al gespeeld is en houdt de themaknop bij.
(function () {
  const screen = document.getElementById('screen-home');
  if (!screen) return;
  const routes = {
    puzzles: () => startNextPuzzle(), connection: () => startNextConnection(),
    race: () => openPuzzleRace(), live: () => openLiveRounds(), archive: () => openDailyPuzzles()
  };
  screen.querySelectorAll('a[data-home-mode]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      routes[link.dataset.homeMode]?.();
    });
  });
  const el = id => document.getElementById(id);
  const copy = (nl, en) => (typeof statsCopy === 'function' ? statsCopy(nl, en) : en);
  const veilig = (lees, terugval) => { try { return lees(); } catch (_) { return terugval; } };

  function render() {
    const label = el('homeCtaLabel');
    if (!label) return;
    const vandaagGespeeld = veilig(() => getDailyStatsEntries().some(entry => entry.date === TODAY_STR), false);
    label.textContent = vandaagGespeeld
      ? copy('Bekijk je uitslag', 'View your result')
      : copy('Speel de Daily', 'Play today’s Daily');
  }

  const themaKnop = el('homeThemeToggle');
  function toonThema() {
    if (themaKnop) themaKnop.setAttribute('aria-checked', String(document.documentElement.dataset.theme === 'dark'));
  }
  new MutationObserver(toonThema).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Opnieuw tekenen als de speler terugkomt op de home en als de Daily binnen is.
  new MutationObserver(() => { if (screen.classList.contains('active')) render(); })
    .observe(screen, { attributes: true, attributeFilter: ['class'] });
  const meta = el('heroDateMeta');
  if (meta) new MutationObserver(render).observe(meta, { childList: true, characterData: true, subtree: true });

  function start() { toonThema(); render(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
  window.addEventListener('load', () => setTimeout(start, 0));
})();

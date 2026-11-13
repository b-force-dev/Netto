// Installeerbare app en terugkeerhaakjes: service worker registreren, een
// vriendelijke installatiehint en een herinnering in de agenda.
//
// Alles hier is optioneel: zonder service worker, zonder localStorage of zonder
// beforeinstallprompt blijft het spel gewoon werken. Er is bewust geen
// web-push; daar is geen server voor.
(function () {
  'use strict';

  const ROOT = new URL('../', document.currentScript?.src || location.href);

  const KEYS = {
    installDismissed: 'netto_pwa_install_dismissed',
    installed: 'netto_pwa_installed',
    reminder: 'netto_pwa_reminder',
    reminderDismissed: 'netto_pwa_reminder_dismissed'
  };
  const THEME_COLORS = { light: '#252FB6', dark: '#1E2A5A' }; // = --bg-main per thema
  const DEFAULT_REMINDER_TIME = '09:00';

  // De spelinterface is standaard Engels; Nederlands alleen op expliciete keuze.
  const copy = (dutch, english) => (window.NettoI18n?.locale?.() === 'nl' ? dutch : english);

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (error) { return null; }
  }
  function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (error) { /* privémodus: dan onthouden we het niet */ }
  }

  // ===== 1. Service worker =====
  function isLocalHost() {
    const host = location.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host.endsWith('.localhost');
  }

  async function removeWorker() {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(registration => registration.unregister()));
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('netto-')).map(name => caches.delete(name)));
  }

  function registerWorker() {
    if (!('serviceWorker' in navigator)) return;
    const flag = new URLSearchParams(location.search).get('sw');
    // ?sw=0 is de handmatige noodrem: haal worker en caches weg op dit apparaat.
    if (flag === '0') { removeWorker().catch(() => {}); return; }
    // Lokaal ontwikkelen zonder worker, tenzij je er expliciet om vraagt (?sw=1).
    if (isLocalHost() && flag !== '1') return;
    const start = () => navigator.serviceWorker
      .register(new URL('sw.js', ROOT))
      .catch(error => console.warn('[Netto] Service worker niet geregistreerd:', error));
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
  }

  // ===== 2. Themakleur van de browser/statusbalk =====
  function syncThemeColor() {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.append(meta);
    }
    const dark = document.documentElement.dataset.theme === 'dark';
    meta.content = dark ? THEME_COLORS.dark : THEME_COLORS.light;
  }

  // ===== 3. Installeren =====
  let installPrompt = null;

  function isStandalone() {
    return window.matchMedia?.('(display-mode: standalone)').matches
      || window.matchMedia?.('(display-mode: fullscreen)').matches
      || navigator.standalone === true;
  }
  function isIos() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  function isInAppBrowser() {
    return /FBAN|FBAV|Instagram|Line\/|MicroMessenger|Snapchat|Twitter|GSA\//.test(navigator.userAgent);
  }
  function isMobile() {
    return isIos() || /Android|Mobile/i.test(navigator.userAgent);
  }
  function canInstall() {
    if (isStandalone() || storageGet(KEYS.installed) || storageGet(KEYS.installDismissed)) return false;
    return Boolean(installPrompt) || (isIos() && !isInAppBrowser());
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); // zelf bepalen wanneer; niet bij het eerste bezoek
    installPrompt = event;
    render();
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    storageSet(KEYS.installed, '1');
    render();
  });

  async function runInstall() {
    const prompt = installPrompt;
    if (!prompt) return;
    installPrompt = null; // een prompt kan maar één keer worden gebruikt
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      // Geaccepteerd: appinstalled doet de rest. Geweigerd: niet blijven zeuren.
      if (choice?.outcome !== 'accepted') storageSet(KEYS.installDismissed, '1');
    } catch (error) { /* browser weigerde de prompt; de hint verdwijnt gewoon */ }
    render();
  }

  // ===== 4. Agendaherinnering =====
  function pad(number) { return String(number).padStart(2, '0'); }

  function localStamp(date) {
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
      + `T${pad(date.getHours())}${pad(date.getMinutes())}00`;
  }

  function validTime(value) {
    return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  }

  // De eerste herinnering valt morgen: de Daily van vandaag heeft de speler al af.
  function reminderWindow(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hours, minutes);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hours, minutes + 15);
    return { start, end };
  }

  function reminderTexts() {
    return {
      title: copy('Netto · de Daily van vandaag', 'Netto · today’s Daily'),
      details: copy('Je dagelijkse schattingspuzzel staat klaar.', 'Your daily estimation puzzle is waiting.')
    };
  }

  function dailyUrl() { return new URL('daily/', ROOT).href; }

  // Regels langer dan 75 tekens worden volgens RFC 5545 gevouwen; we kappen op
  // 60 om ruimte te houden voor tekens van meerdere bytes.
  function fold(line) {
    const parts = [];
    for (let index = 0; index < line.length; index += 60) parts.push(line.slice(index, index + 60));
    return parts.join('\r\n ');
  }
  function escapeText(value) {
    return String(value).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }

  // Zwevende lokale tijd (geen Z, geen TZID): de herinnering volgt de speler,
  // ook bij reizen en zomertijd. RRULE herhaalt hem elke dag.
  function buildReminderIcs(time) {
    const { start, end } = reminderWindow(time);
    const { title, details } = reminderTexts();
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Netto//Daily reminder//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:netto-daily-reminder@${location.hostname || 'netto'}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${localStamp(start)}`,
      `DTEND:${localStamp(end)}`,
      'RRULE:FREQ=DAILY',
      `SUMMARY:${escapeText(title)}`,
      `DESCRIPTION:${escapeText(`${details} ${dailyUrl()}`)}`,
      `URL:${dailyUrl()}`,
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(title)}`,
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    return lines.map(fold).join('\r\n') + '\r\n';
  }

  function googleCalendarUrl(time) {
    const { start, end } = reminderWindow(time);
    const { title, details } = reminderTexts();
    const query = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      details: `${details} ${dailyUrl()}`,
      dates: `${localStamp(start)}/${localStamp(end)}`,
      recur: 'RRULE:FREQ=DAILY'
    });
    // Zonder zone leest Google de tijd in de tijdzone van het agenda-account;
    // we geven die van het apparaat mee zodat 09:00 ook 09:00 blijft.
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (zone) query.set('ctz', zone);
    } catch (error) { /* geen tijdzone beschikbaar */ }
    return `https://calendar.google.com/calendar/render?${query}`;
  }

  function downloadReminder(time) {
    const blob = new Blob([buildReminderIcs(time)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'netto-daily-reminder.ics';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  function savedReminder() {
    try {
      const value = JSON.parse(storageGet(KEYS.reminder) || 'null');
      return validTime(value?.time) ? value : null;
    } catch (error) { return null; }
  }

  // ===== 5. Weergave onder het Daily-resultaat =====
  let container = null;
  let announcement = '';
  let editingReminder = false;
  let pendingTime = null;

  // Alleen het resultaat van de Daily van vandaag heeft een countdown (core.js);
  // archiefpuzzels niet. Dat is precies het moment waarop de speler klaar is.
  function todaysResultVisible() {
    const results = document.getElementById('results');
    return Boolean(results?.classList.contains('show') && document.getElementById('dailyCountdown'));
  }

  function mount() {
    const footer = document.querySelector('#results .daily-result-footer');
    if (!footer) return null;
    if (!container) {
      container = document.createElement('section');
      container.id = 'nettoPwaReturn';
      container.className = 'pwa-return';
      container.setAttribute('aria-label', copy('Kom morgen terug', 'Come back tomorrow'));
    }
    if (container.parentNode !== footer.parentNode || container.previousElementSibling !== footer) footer.after(container);
    return container;
  }

  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([name, value]) => {
      if (name === 'class') node.className = value;
      else if (name === 'text') node.textContent = value;
      else if (name.startsWith('on')) node.addEventListener(name.slice(2), value);
      else node.setAttribute(name, value);
    });
    children.flat().forEach(child => { if (child) node.append(child); });
    return node;
  }

  function localReleaseTime() {
    if (typeof londonMidnightTarget !== 'function') return '';
    try {
      return londonMidnightTarget().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) { return ''; }
  }

  function reminderCard() {
    if (storageGet(KEYS.reminderDismissed)) return null;
    const saved = savedReminder();
    const release = localReleaseTime();

    if (saved && !editingReminder) {
      return el('div', { class: 'pwa-card pwa-reminder is-set' },
        el('div', { class: 'pwa-copy' },
          el('strong', { text: copy(`Herinnering elke dag om ${saved.time}`, `Daily reminder at ${saved.time}`) }),
          el('p', { text: copy('Open het .ics-bestand om hem in je agenda te zetten.', 'Open the .ics file to add it to your calendar.') })),
        el('div', { class: 'pwa-actions' },
          el('button', {
            type: 'button', class: 'pwa-btn', text: copy('Wijzig', 'Change'),
            onclick: () => { editingReminder = true; pendingTime = saved.time; render(); container.querySelector('input')?.focus(); }
          })));
    }

    // Eerst één rustige regel; tijd en agendaknoppen komen pas na een klik.
    if (!saved && !editingReminder) {
      return el('div', { class: 'pwa-card pwa-reminder is-compact' },
        el('div', { class: 'pwa-copy' },
          el('strong', { text: copy('Morgen weer een nieuwe Daily', 'A new Daily tomorrow') })),
        el('div', { class: 'pwa-actions' },
          el('button', {
            type: 'button', class: 'pwa-btn', text: copy('Herinner mij', 'Remind me'),
            onclick: () => { editingReminder = true; render(); container.querySelector('input')?.focus(); }
          })),
        el('button', {
          type: 'button', class: 'pwa-dismiss', 'aria-label': copy('Niet meer tonen', 'Don’t show again'), text: '×',
          onclick: () => { storageSet(KEYS.reminderDismissed, '1'); render(); }
        }));
    }

    const time = validTime(pendingTime) ? pendingTime : (saved?.time || DEFAULT_REMINDER_TIME);
    const input = el('input', {
      type: 'time', class: 'pwa-time', value: time, required: '',
      'aria-label': copy('Tijd van de herinnering', 'Reminder time')
    });
    const google = el('a', {
      class: 'pwa-btn', target: '_blank', rel: 'noopener noreferrer',
      href: googleCalendarUrl(time), text: copy('Google Agenda', 'Google Calendar')
    });
    const current = () => (validTime(input.value) ? input.value : time);
    input.addEventListener('input', () => {
      pendingTime = input.value;
      if (validTime(input.value)) google.href = googleCalendarUrl(input.value);
    });
    google.addEventListener('click', () => {
      storageSet(KEYS.reminder, JSON.stringify({ time: current(), at: Date.now() }));
    });

    return el('div', { class: 'pwa-card pwa-reminder' },
      el('div', { class: 'pwa-copy' },
        el('strong', { text: copy('Mis de Daily van morgen niet', 'Don’t miss tomorrow’s Daily') }),
        el('p', {
          text: release
            ? copy(`Elke dag een nieuwe puzzel, om middernacht Londense tijd (${release} jouw tijd). Zet een herinnering in je agenda.`,
                   `A new puzzle every day at midnight London time (${release} your time). Add a reminder to your calendar.`)
            : copy('Elke dag een nieuwe puzzel, om middernacht Londense tijd. Zet een herinnering in je agenda.',
                   'A new puzzle every day at midnight London time. Add a reminder to your calendar.')
        })),
      el('div', { class: 'pwa-actions' },
        el('label', { class: 'pwa-time-label' }, el('span', { text: copy('Om', 'At') }), input),
        el('button', {
          type: 'button', class: 'pwa-btn is-primary', text: copy('Voeg toe aan agenda', 'Add to calendar'),
          onclick: () => {
            const chosen = current();
            storageSet(KEYS.reminder, JSON.stringify({ time: chosen, at: Date.now() }));
            downloadReminder(chosen);
            editingReminder = false;
            pendingTime = null;
            announcement = copy(`Herinnering voor ${chosen} gedownload.`, `Reminder for ${chosen} downloaded.`);
            render();
            container.querySelector('.pwa-reminder .pwa-btn')?.focus();
          }
        }),
        google),
      saved ? null : el('button', {
        type: 'button', class: 'pwa-dismiss', 'aria-label': copy('Niet meer tonen', 'Don’t show again'), text: '×',
        onclick: () => { storageSet(KEYS.reminderDismissed, '1'); render(); }
      }));
  }

  const SHARE_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3M8 7l4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';

  function installCard() {
    if (!canInstall()) return null;
    const mobile = isMobile();
    const title = mobile
      ? copy('Zet Netto op je beginscherm', 'Add Netto to your home screen')
      : copy('Installeer Netto als app', 'Install Netto as an app');

    const body = el('div', { class: 'pwa-copy' }, el('strong', { text: title }));
    let actions = null;

    if (installPrompt) {
      body.append(el('p', { text: copy('Eén tik vanaf je beginscherm, ook zonder browserbalk.', 'One tap from your home screen, no browser bar.') }));
      actions = el('div', { class: 'pwa-actions' },
        el('button', { type: 'button', class: 'pwa-btn is-primary', text: copy('Installeren', 'Install'), onclick: runInstall }));
    } else {
      // iOS kent geen installatieprompt; de gebruiker moet zelf via Delen.
      const steps = el('p', { class: 'pwa-steps' });
      steps.innerHTML = copy(
        `Tik op ${SHARE_ICON} <b>Deel</b> en kies <b>Zet op beginscherm</b>.`,
        `Tap ${SHARE_ICON} <b>Share</b>, then choose <b>Add to Home Screen</b>.`
      );
      body.append(steps);
    }

    return el('div', { class: 'pwa-card pwa-install' }, body, actions,
      el('button', {
        type: 'button', class: 'pwa-dismiss', 'aria-label': copy('Sluiten', 'Dismiss'), text: '×',
        onclick: () => { storageSet(KEYS.installDismissed, '1'); render(); }
      }));
  }

  function render() {
    if (!todaysResultVisible()) {
      container?.remove();
      return;
    }
    const target = mount();
    if (!target) return;
    // Eén blok tegelijk: eerst de herinnering, en pas als die geregeld of
    // weggeklikt is de installatietip.
    const volgorde = savedReminder() ? [installCard(), reminderCard()] : [reminderCard(), installCard()];
    const cards = volgorde.filter(Boolean).slice(0, 1);
    target.replaceChildren(...cards, el('p', { class: 'pwa-live', role: 'status', 'aria-live': 'polite', text: announcement }));
    target.hidden = cards.length === 0;
    announcement = '';
  }

  function observe() {
    const countdown = document.getElementById('dailyResultCountdown');
    const results = document.getElementById('results');
    const refresh = () => queueMicrotask(render);
    if (countdown) new MutationObserver(refresh).observe(countdown, { childList: true });
    if (results) new MutationObserver(refresh).observe(results, { attributes: true, attributeFilter: ['class'] });
    render();
  }

  // ===== Start =====
  registerWorker();
  syncThemeColor();
  new MutationObserver(syncThemeColor).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observe);
  else observe();

  window.NettoPwa = Object.freeze({ buildReminderIcs, googleCalendarUrl, canInstall, isStandalone, render });
})();

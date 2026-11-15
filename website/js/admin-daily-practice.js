// Alleen het admin-dashboard laadt deze module; toegang wordt door de RPC gecontroleerd.
window.NettoAdminDailyPractice = (() => {
  let client, rows = [], generation = 0, initialized = false;
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  const format = value => Number(value).toLocaleString('nl-NL', { maximumFractionDigits: 3 });
  const message = text => { $('dailyPracticeMessage').textContent = text; };

  function clear() {
    generation++;
    rows = [];
    $('dailyPracticeSelect').innerHTML = '';
    $('dailyPracticeSelect').disabled = true;
    $('dailyPracticeGame').innerHTML = '';
    message('');
  }

  function renderGame() {
    const row = rows.find(r => r.id === $('dailyPracticeSelect').value);
    const game = $('dailyPracticeGame');
    game.innerHTML = '';
    if (!row) return;
    const answers = [row.true_answer_1, row.true_answer_2, row.true_answer_3].map(Number);
    if (answers.some(n => !Number.isFinite(n) || n <= 0)) {
      message('Deze Daily mist geldige antwoorden en kan nog niet worden geoefend.');
      return;
    }
    message('Oefenbeurt: er wordt niets opgeslagen.');
    const questions = [row.question_1, row.question_2, row.question_3 || `Wat is de uitkomst van antwoord 1 ${row.operator || ''} antwoord 2?`];
    game.innerHTML = `<p><b>${escape(row.scheduled_date)}</b> · ${escape(row.daily_edition || '')}</p>
      <form id="dailyPracticeForm"><ol>${questions.map((q, i) => `<li>
        <label for="dailyPracticeGuess${i}">${escape(q)}</label>
        <input id="dailyPracticeGuess${i}" type="number" inputmode="numeric" min="1" max="9007199254740991" step="1" required>
      </li>`).join('')}</ol><button class="review-btn accept" type="submit">Controleer antwoorden</button></form>
      <div id="dailyPracticeResult" role="status"></div>`;
    if (row.image_path) {
      const image = document.createElement('img');
      image.className = 'daily-practice-photo';
      // Alleen relatieve paden en HTTP(S)-afbeeldingen.
      try {
        const url = new URL(row.image_path, window.location.href);
        if (['https:', 'http:'].includes(url.protocol)) {
          image.src = url.href;
          image.alt = row.image_alt || '';
          game.prepend(image);
          if (row.image_credit) {
            const credit = document.createElement('p');
            credit.className = 'muted-dark';
            credit.textContent = row.image_credit;
            image.after(credit);
          }
        }
      } catch (_) { /* De vragen blijven speelbaar bij een ongeldig fotopad. */ }
    }
    $('dailyPracticeForm').addEventListener('submit', event => {
      event.preventDefault();
      const guesses = answers.map((_, i) => Number($(`dailyPracticeGuess${i}`).value));
      if (guesses.some(n => !Number.isSafeInteger(n) || n <= 0)) return;
      const factor = guesses.reduce((sum, guess, i) => sum + Math.max(guess / answers[i], answers[i] / guess), 0) / 3;
      $('dailyPracticeResult').innerHTML = `<p><b>Factor: ${format(factor)}×</b></p><ol>${answers.map((answer, i) =>
        `<li>Jouw schatting: ${format(guesses[i])} · Antwoord: <b>${format(answer)}</b></li>`).join('')}</ol><p>Oefenbeurt voltooid. Je officiële resultaten zijn niet gewijzigd.</p>`;
    });
  }

  async function load() {
    clear();
    const request = generation;
    message('Planning laden…');
    const loaded = [];
    try {
      // Pagineren voorkomt dat de API-limiet een deel van de planning verbergt.
      for (let offset = 0; ; offset += 200) {
        const { data, error } = await client.rpc('netto_admin_daily_all').range(offset, offset + 199);
        if (request !== generation) return;
        if (error) throw error;
        loaded.push(...(data || []));
        if (!data || data.length < 200) break;
      }
      rows = loaded.filter(r => r.status === 'scheduled' && r.scheduled_date)
        .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date) || a.id.localeCompare(b.id));
      const select = $('dailyPracticeSelect');
      select.innerHTML = '<option value="">Kies een Daily…</option>' + rows.map(r =>
        `<option value="${escape(r.id)}">${escape(r.scheduled_date)} · ${escape(r.daily_edition || 'Daily')}</option>`).join('');
      select.disabled = !rows.length;
      message(rows.length ? `${rows.length} geplande Dailies beschikbaar om te oefenen.` : 'Geen geplande Dailies gevonden.');
    } catch (error) {
      if (request === generation) message('Planning niet beschikbaar: ' + error.message);
    }
  }

  return { init(authenticatedClient) {
    client = authenticatedClient;
    if (!initialized) {
      initialized = true;
      $('dailyPracticeSelect').addEventListener('change', renderGame);
      $('dailyPracticeReload').addEventListener('click', load);
      client.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') clear(); });
    }
    return load();
  } };
})();

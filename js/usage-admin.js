// Receives the existing authenticated admin client; never creates another session.
window.NettoUsageAdmin = {
  async load(client) {
    let section = document.getElementById('usagePanel');
    if (!section) {
      section = document.createElement('section');
      section.id = 'usagePanel';
      section.className = 'panel';
      document.getElementById('composerPanel').before(section);
    }
    section.replaceChildren();
    const heading = document.createElement('h2');
    heading.textContent = 'Bezoekers';
    const note = document.createElement('p');
    note.className = 'muted-dark';
    note.textContent = 'Laatste 30 dagen (Londense daggrens). Uniek per browsercode, geen personen. D1/D7: terug op exact dag 1/7 na eerste bezoek; — betekent nog niet meetbaar. Starts/finishes zijn spelacties; delen telt deelpogingen. DNT/GPC en lokale bezoeken ontbreken.';
    section.append(heading, note);
    try {
      const { data, error } = await client.rpc('netto_admin_usage');
      if (error) throw error;
      const table = document.createElement('table');
      const header = document.createElement('tr');
      ['Dag','Uniek','Nieuw','Terug','Start / klaar per modus','Delen','Uitleg','Install','D1','D7'].forEach(label => {
        const cell = document.createElement('th'); cell.scope = 'col'; cell.textContent = label; header.append(cell);
      });
      const head = document.createElement('thead'); head.append(header); table.append(head);
      const body = document.createElement('tbody');
      const retention = (n, total) => n == null ? '—' : `${n}/${total}`;
      for (const day of data.days) {
        const row = document.createElement('tr');
        const modes = data.modes.filter(m => m.day === day.day)
          .map(m => `${m.mode}: ${m.started} / ${m.finished}`).join('; ') || '—';
        [day.day,day.visitors,day.new_visitors,day.returning_visitors,modes,
          day.shares,day.tutorials,day.installs,retention(day.d1,day.new_visitors),
          retention(day.d7,day.new_visitors)].forEach(value => {
          const cell = document.createElement('td'); cell.textContent = value; row.append(cell);
        });
        body.append(row);
      }
      table.append(body);
      const scroll = document.createElement('div'); scroll.style.overflowX = 'auto'; scroll.append(table);
      const refs = document.createElement('p');
      refs.textContent = 'Herkomst (unieke browsers, 30 dagen): ' + (data.referrers.map(r =>
        `${r.referrer_host || 'direct / onbekend'}: ${r.visitors}`).join('; ') || 'nog geen bezoeken');
      section.append(scroll, refs);
    } catch (_) {
      const message = document.createElement('p');
      message.textContent = 'Bezoekersmeting niet beschikbaar. Controleer of supabase/usage_events.sql is uitgevoerd en je account adminrechten heeft.';
      section.append(message);
    }
  }
};

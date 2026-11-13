// First-party, best-effort usage counts. No cookies, URLs, account IDs or answers.
(() => {
  let disabled = false;
  let identity;
  const seen = new Set();
  const pending = [];
  const allowed = new Set(['visit','daily_start','daily_finish','puzzle_start',
    'puzzle_finish','race_start','race_finish','share','tutorial_done','install']);
  function optedOut() {
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1'
      || window.doNotTrack === '1' || navigator.msDoNotTrack === '1';
  }
  window.nettoTrack = (event, props = {}) => {
    try {
      if (disabled || optedOut() || !allowed.has(event)
        || !/^https?:$/.test(location.protocol)
        || /^(localhost|127(?:\.\d+){3}|\[?::1\]?|.*\.localhost)$/i.test(location.hostname)) return;
      const client = window.nettoUsageClient;
      if (navigator.onLine === false) return;
      if (!client) {
        if (document.readyState !== 'complete' && pending.length < 20) pending.push([event, props]);
        return;
      }
      const day = new Intl.DateTimeFormat('en-CA', { timeZone:'Europe/London',
        year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
      if (!identity) {
        const key = 'netto_usage_visitor';
        const stored = JSON.parse(localStorage.getItem(key) || 'null');
        identity = stored && /^[0-9a-f-]{36}$/i.test(stored.id) && typeof stored.day === 'string'
          ? stored : { id:crypto.randomUUID(), day };
        localStorage.setItem(key, JSON.stringify(identity));
      }
      const dedup = props.once ? day + ':' + event + ':' + props.mode + ':' + props.once : null;
      if (dedup && seen.has(dedup)) return;
      if (dedup) seen.add(dedup);
      let host = '';
      try {
        const ref = new URL(document.referrer);
        // Exclude own navigation and non-DNS hosts; never send path/query/port.
        if (ref.hostname !== location.hostname && /^[a-z0-9.-]+$/i.test(ref.hostname)) host = ref.hostname.toLowerCase();
      } catch (_) {}
      const request = client.rpc('netto_track', {
        p_event:event, p_visitor_id:identity.id, p_mode:props.mode || '',
        p_language:localStorage.getItem('netto_language') === 'en' ? 'en' : 'nl',
        p_device:window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop',
        p_referrer:host, p_first_visit:identity.day === day, p_kind:props.kind || ''
      });
      // An unavailable endpoint disables tracking for this page. Never retry gameplay.
      Promise.resolve(request).then(result => { if (result.error) disabled = true; })
        .catch(() => { disabled = true; });
    } catch (_) { disabled = true; }
  };
  // core.js creates the shared client in its own load listener.
  window.addEventListener('load', () => setTimeout(() => {
    window.nettoTrack('visit');
    pending.splice(0).forEach(([event, props]) => window.nettoTrack(event, props));
  }, 0));
  window.addEventListener('appinstalled', () => window.nettoTrack('install'));
  document.addEventListener('click', event => {
    if (event.target.closest?.('#howPanel .how-next button')) {
      window.nettoTrack('tutorial_done', { once:'how' });
    }
  });
})();

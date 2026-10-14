// Demo build only (injected by build.py --demo): 10 minutes of play per day.
// Time only runs while the page is visible; the allowance refills at local midnight.
(() => {
  const LIMIT = 10 * 60;
  const KEY = 'camino_demo';
  const ARCADE = 'https://simonallmer.com/arcade';
  const ABOUT = 'https://simonallmer.com/aboutarcade';

  const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  let state = { day: today(), used: 0 };
  function load() {
    if (state.day !== today()) state = { day: today(), used: 0 };
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (raw?.day === state.day) state.used = Math.max(state.used, +raw.used || 0);
    } catch { /* private mode: the allowance lives for the session */ }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } }
  const left = () => Math.max(0, LIMIT - state.used);
  const clock = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const timer = document.createElement('button');
  timer.className = 'demo-timer';
  timer.title = 'Demo — about the Arcade subscription';
  timer.innerHTML = '<b>DEMO</b><span></span>';
  const sheet = document.createElement('div');
  sheet.className = 'demo-sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  document.body.append(timer, sheet);

  function show(ended) {
    sheet.classList.toggle('ended', ended);
    sheet.innerHTML = ended
      ? `<div class="demo-card">
          <p class="kicker">Demo</p>
          <h2>Your daily demo time has ended.</h2>
          <p>Continue playing and unlock all features with an Arcade Subscription.</p>
          <div class="demo-actions">
            <a class="demo-primary" href="${ARCADE}" target="_blank" rel="noopener">Subscribe</a>
            <a class="demo-quiet" href="${ABOUT}" target="_blank" rel="noopener">Learn more</a>
          </div>
        </div>`
      : `<div class="demo-card">
          <p class="kicker">Arcade Subscription</p>
          <h2>Ten minutes a day.</h2>
          <p>This is the demo of Casino Camino. Access unlimited play with an Arcade Subscription.</p>
          <div class="demo-actions">
            <a class="demo-primary" href="${ABOUT}" target="_blank" rel="noopener">Learn more</a>
            <button class="demo-quiet" data-close>Close</button>
          </div>
        </div>`;
    sheet.classList.add('on');
  }
  const ended = () => sheet.classList.contains('ended');
  function hide() { if (!ended()) sheet.classList.remove('on'); }

  timer.addEventListener('click', () => { if (!ended()) show(false); });
  sheet.addEventListener('click', e => { if (e.target === sheet || e.target.closest('[data-close]')) hide(); });
  // once time is up, the venue underneath takes no more input
  addEventListener('keydown', e => {
    if (!sheet.classList.contains('on')) return;
    if (e.key === 'Escape') hide();
    if (ended()) e.stopImmediatePropagation();
  }, true);
  for (const type of ['wheel', 'touchstart', 'touchend', 'pointerdown']) {
    addEventListener(type, e => { if (ended()) e.stopImmediatePropagation(); }, { capture: true, passive: true });
  }

  function render() {
    const s = left();
    timer.querySelector('span').textContent = s ? clock(s) : 'Ended';
    timer.classList.toggle('low', s > 0 && s <= 60);
    if (!s && !ended()) show(true);
    if (s && ended()) { sheet.classList.remove('on', 'ended'); }
  }

  load();
  render();
  setInterval(() => {
    load();
    if (document.visibilityState === 'visible' && left() > 0) { state.used++; save(); }
    render();
  }, 1000);
})();

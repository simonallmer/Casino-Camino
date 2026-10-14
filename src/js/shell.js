// The shared frame of a table: header, four seats, the croupier's line, rules and the count.
// Each game fills the centre and decides what the buttons do.

export const SEAT_ORDER = ['valeska', 'calloway', 'shen', 'you'];
export const YOU = { id: 'you', name: 'You', short: 'You', mono: '★', title: 'Guest of the house', color: '#efe3c4' };

export function createShell(root, { name, rules }) {
  root.innerHTML = `
    <div class="tbl">
      <header class="tbl-top">
        <button class="link" data-act="leave">← Return to the floor</button>
        <div class="tbl-title"><span class="tbl-name">${name}</span><span class="tbl-meta"></span></div>
        <button class="link" data-act="rules">How it plays</button>
      </header>
      <div class="tbl-stage">
        ${SEAT_ORDER.map(id => `<div class="seat seat-${id}" data-id="${id}"></div>`).join('')}
        <div class="table-center"></div>
      </div>
      <footer class="tbl-console">
        <div class="console-extra"></div>
        <p class="croupier" aria-live="polite"></p>
        <div class="tbl-actions"></div>
      </footer>
      <div class="tbl-sheet sheet-rules" hidden><div class="sheet-card">${rules}<button class="btn" data-act="close-sheet">Back to the table</button></div></div>
      <div class="tbl-sheet sheet-result" hidden><div class="sheet-card"></div></div>
    </div>`;
  const $ = s => root.querySelector(s);
  const tbl = $('.tbl'), line = $('.croupier'), actions = $('.tbl-actions');
  const handlers = {};

  tbl.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    if (act === 'rules') { $('.sheet-rules').hidden = false; return; }
    if (act === 'close-sheet') { $('.sheet-rules').hidden = true; return; }
    handlers[act]?.(el, e);
  });

  return {
    $,
    center: $('.table-center'),
    extra: $('.console-extra'),
    on(act, fn) { handlers[act] = fn; },
    meta(text) { $('.tbl-meta').textContent = text; },
    say(text) { line.textContent = text; line.classList.remove('in'); void line.offsetWidth; line.classList.add('in'); },
    actions(html) { actions.innerHTML = html; },
    seats(players, { current, status = () => '', pips = () => 0 } = {}) {
      for (const p of players) {
        const seat = $(`.seat-${p.id}`);
        const isCurrent = current === p.id;
        seat.className = `seat seat-${p.id}${isCurrent ? ' current' : ''}${p.active === false ? ' out' : ''}`;
        seat.innerHTML = `
          <span class="seat-chip" style="--c:${p.color}">${p.mono}</span>
          <div class="seat-who"><div class="seat-name">${p.name}</div><div class="seat-title">${p.title}</div></div>
          <div class="seat-stack"><span>${p.cash}</span><small>chips</small></div>
          <div class="seat-status">${p.active === false ? 'Out' : status(p)}<span class="seat-bets">${'<i></i>'.repeat(pips(p))}</span></div>`;
      }
    },
    pulse(id) { const s = $(`.seat-${id}`); s?.classList.remove('paid'); void s?.offsetWidth; s?.classList.add('paid'); },
    result({ kicker, head, net, ranking, again }) {
      const sheet = $('.sheet-result');
      sheet.querySelector('.sheet-card').innerHTML = `
        <p class="kicker">${kicker}</p>
        <h2>${head}</h2>
        <p class="net ${net >= 0 ? 'up' : 'down'}">${net >= 0 ? '+' : '−'}${Math.abs(net)} <small>chips tonight</small></p>
        <ol class="ranking">${ranking.map(p => `<li><span class="seat-chip" style="--c:${p.color}">${p.mono}</span><span>${p.name}</span><b>${p.value ?? p.cash}</b></li>`).join('')}</ol>
        <div class="sheet-actions">
          ${again ? '<button class="btn" data-act="again">Deal another game</button>' : '<p class="muted">Your purse is too light for another game until dawn.</p>'}
          <button class="btn ghost" data-act="leave">Return to the floor</button>
        </div>`;
      sheet.hidden = false;
    },
  };
}

export const sleep = ms => new Promise(r => setTimeout(r, ms));

// Two clicks to leave mid-game, so nobody walks away from a pot by accident.
export function confirmLeave(el, warning) {
  if (el.dataset.armed) return true;
  el.dataset.armed = '1';
  const label = el.textContent;
  el.textContent = warning;
  setTimeout(() => { delete el.dataset.armed; el.textContent = label; }, 4000);
  return false;
}

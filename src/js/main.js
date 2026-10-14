import { createVenue } from './venue.js';
import { purse, nextDawn, DAILY_STAKE, checkDawn } from './wallet.js';
import { openFortuna, MIN_STAKE } from './fortuna/table.js';
import { openFrontier, FRONTIER_STAKE } from './frontier/table.js';
import { openRicochet, RICOCHET_STAKE } from './ricochet/table.js';

const TABLES = {
  fortuna: { open: openFortuna, min: MIN_STAKE, label: 'Fortuna', blurb: 'Twelve arms, three rings, two dice. Chips from 5.' },
  ricochet: { open: openRicochet, min: RICOCHET_STAKE, label: 'Ricochet', blurb: `A painted wheel, six covered tiles, one ball. Buy-in ${RICOCHET_STAKE}.` },
  frontier: { open: openFrontier, min: FRONTIER_STAKE, label: 'Frontier', blurb: `Five rounds of cards, alliances and nerve. Buy-in ${FRONTIER_STAKE}.` },
};
import { loadQuotes, drawLine } from './assets.js';

const $ = s => document.querySelector(s);
const card = $('.stop-card'), rail = $('.promenade'), hint = $('.walk-hint'), layer = $('.table-layer'), tag = $('.hover-tag'), recital = $('.recital'), toastEl = $('.toast');

// ── theme: day and night follow the guest's clock unless they flip it
const autoNight = () => { const h = new Date().getHours(); return h < 7 || h >= 19; };
let night = (() => { try { const v = sessionStorage.getItem('camino_theme'); return v ? v === 'night' : autoNight(); } catch { return autoNight(); } })();
document.documentElement.dataset.theme = night ? 'night' : 'day';

let venue;
try {
  venue = await createVenue($('#venue'), { night, wash: $('.wash'), onHover: showTag, onActivate: activate });
} catch (err) {
  console.error(err);
  card.innerHTML = '<p class="kicker">Casino Camino</p><h1>The venue could not draw itself.</h1><p>It needs an internet connection the first time, to fetch its drawing tools. Check the connection and reload.</p>';
  card.classList.remove('away');
  throw err;
}
window.camino = { venue, purse }; // handy from the dev console

$('.theme-toggle').addEventListener('click', async () => {
  night = !night;
  try { sessionStorage.setItem('camino_theme', night ? 'night' : 'day'); } catch { /* ignore */ }
  document.body.classList.add('dimming');
  await new Promise(r => setTimeout(r, 320));
  document.documentElement.dataset.theme = night ? 'night' : 'day';
  venue.setTheme(night);
  document.body.classList.remove('dimming');
});

// ── purse
const fmtIn = ms => { const m = Math.max(1, Math.round(ms / 60000)); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`; };
function renderPurse() { $('.purse-val').textContent = purse.balance; }
purse.subscribe(() => { renderPurse(); if (stop === 2 || stop === 3) renderCard(); });
renderPurse();
setInterval(() => { if (checkDawn()) renderCard(); }, 60e3);

// ── touching the drawing
function showTag(info, x, y) {
  if (!info || seated) { tag.classList.remove('on'); return; }
  tag.innerHTML = `<b>${info.label}</b><span>${info.hint}</span>`;
  tag.style.transform = `translate(${Math.min(x + 18, innerWidth - tag.offsetWidth - 12)}px, ${Math.max(12, y - 54)}px)`;
  tag.classList.add('on');
}

let toastTimer;
function toast(text) {
  toastEl.textContent = text;
  toastEl.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('on'), 4200);
}


function activate(name) {
  tag.classList.remove('on');
  switch (name) {
    case 'portico': go(2); break;
    case 'concierge': stop === 2 ? renderCard() : go(2); break;
    case 'fortuna': case 'ricochet': case 'frontier': stop === 3 ? sit(name) : go(3); break;
    case 'theater': go(4); break;
    case 'lifts': loadQuotes().then(q => toast(drawLine(q, 'The hotel lifts'))); break;
    case 'fountain':
      if (purse.balance < 1) { toast('Your purse is empty. You wish anyway, for free.'); break; }
      purse.set(purse.balance - 1);
      purse.record('A wish at the fountain', -1);
      loadQuotes().then(q => toast(`You toss a chip in. ${drawLine(q, 'The fountain')}`));
      break;
    case 'merchant': recite(); break;
  }
}

// Mr. Thistlewood holds forth, one line at a time
async function recite() {
  const q = await loadQuotes();
  recital.innerHTML = `
    <button class="link recital-close" aria-label="Close">Close</button>
    <p class="kicker">Mr. Thistlewood, merchant of Bristol</p>
    <blockquote>“${drawLine(q, 'Mr. Jeremiah Thistlewood')}”</blockquote>
    <p class="aside">${drawLine(q, 'Thistlewood, stage directions')}</p>
    <div class="recital-end"><button class="btn ghost" data-encore>Another</button></div>`;
  recital.classList.remove('on'); void recital.offsetWidth;
  recital.classList.add('on');
  document.body.classList.add('reciting');
}
function hush() { recital.classList.remove('on'); document.body.classList.remove('reciting'); }
recital.addEventListener('click', e => {
  if (e.target.closest('.recital-close')) hush();
  if (e.target.closest('[data-encore]')) recite();
});

// ── the five stops of the camino
const STOPS = [
  {
    label: 'Arrival',
    render: () => `
      <p class="kicker">I · Arrival</p>
      <h1 class="display">Casino Camino</h1>
      <p>As wonder faded into functional monotony, the Casino remains a sanctuary of magic. A theater where destiny pivots on a heartbeat and the clock yields to the glow of a sleepless ensemble.</p>
      <div class="actions"><button class="btn" data-go="1">Walk in</button></div>`,
  },
  {
    label: 'Court',
    render: () => `
      <p class="kicker">II · The Fountain Court</p>
      <h1>Welcome, traveller.</h1>
      <p>The gardens, the hall, the tables and the theater all lie under one roof, and the camino leads through each of them. Stay as long as you like.</p>
      <div class="actions"><button class="btn" data-go="2">Through the doors</button></div>`,
  },
  {
    label: 'Hall',
    render: () => {
      const broke = purse.balance < MIN_STAKE;
      const ledger = purse.ledger.slice(0, 4).map(e => {
        const d = new Date(e.t);
        return `<li><span>${e.label}</span><b class="${e.amount > 0 ? 'up' : e.amount < 0 ? 'down' : ''}">${e.amount > 0 ? '+' : e.amount < 0 ? '−' : ''}${Math.abs(e.amount)}</b><time>${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></li>`;
      }).join('');
      return `
        <p class="kicker">III · The Grand Hall · Concierge</p>
        <h1>Good ${greeting()}.</h1>
        <div class="purse-big"><span>${purse.balance}</span><small>chips in your purse</small></div>
        <p>${broke
          ? `The tables are closed to you until dawn, in ${fmtIn(nextDawn() - Date.now())}. The hall, the gardens and the theater stay open.`
          : `Each dawn the house tops your purse up to ${DAILY_STAKE}. Anything you win above that is yours to keep. What you lose stays lost until morning.`}</p>
        ${ledger ? `<ul class="ledger">${ledger}</ul>` : ''}
        <div class="actions"><button class="btn" data-go="3">To the casino floor</button></div>`;
    },
  },
  {
    label: 'Casino',
    render: () => {
      return `
        <p class="kicker">IV · The Casino Floor</p>
        <h1>Three tables tonight.</h1>
        <ul class="tables">
          ${Object.entries(TABLES).map(([key, t]) => `
          <li>
            <div><h3>${t.label}</h3><p>${t.blurb}</p></div>
            ${purse.balance < t.min ? '<span class="muted">Opens at dawn</span>' : `<button class="btn" data-sit="${key}">Take a seat</button>`}
          </li>`).join('')}
        </ul>`;
    },
  },
  {
    label: 'Theater',
    render: () => `
      <p class="kicker">V · The Theater</p>
      <h1>Dark tonight.</h1>
      <p>The first season is still in rehearsal. When the marquee lights up, this is where the shows will be.</p>
      <div class="actions"><button class="btn ghost" data-go="3">Back to the tables</button></div>`,
  },
];

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'evening' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
}

rail.innerHTML = `<span class="rail-line"></span>` + STOPS.map((s, i) => `<button data-go="${i}"><i></i><span>${s.label}</span></button>`).join('');

let stop = 0, moving = false, seated = false;

function renderCard() {
  card.innerHTML = STOPS[stop].render();
  rail.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', i === stop));
}

async function go(i) {
  if (seated || i < 0 || i >= STOPS.length || (i === stop && !moving)) return;
  moving = true;
  stop = i;
  hush();
  card.classList.add('away');
  hint.classList.add('away');
  rail.querySelectorAll('button').forEach((b, k) => b.classList.toggle('active', k === i));
  await venue.goToStop(i);
  renderCard();
  card.classList.remove('away');
  moving = false;
}

// ── input: wheel, touch, keys, clicks
let wheelAcc = 0, wheelLock = 0;
addEventListener('wheel', e => {
  if (seated || e.target.closest('.stop-card, .recital')) return;
  const now = performance.now();
  if (moving || now < wheelLock) return;
  wheelAcc += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  if (Math.abs(wheelAcc) > 60) { go(stop + Math.sign(wheelAcc)); wheelAcc = 0; wheelLock = now + 900; }
}, { passive: true });

let touch = null;
addEventListener('touchstart', e => { touch = e.touches[0]; }, { passive: true });
addEventListener('touchend', e => {
  if (!touch || seated || e.target.closest('.stop-card, .promenade, .recital')) return;
  const t = e.changedTouches[0], dx = t.clientX - touch.clientX, dy = t.clientY - touch.clientY;
  if (Math.max(Math.abs(dx), Math.abs(dy)) > 50) go(stop + (Math.abs(dy) > Math.abs(dx) ? (dy < 0 ? 1 : -1) : (dx < 0 ? 1 : -1)));
  touch = null;
});

addEventListener('keydown', e => {
  if (seated || e.target.closest('input, textarea')) return;
  if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); go(stop + 1); }
  if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(stop - 1); }
});

document.addEventListener('click', e => {
  const goBtn = e.target.closest('[data-go]');
  if (goBtn) go(+goBtn.dataset.go);
  const seat = e.target.closest('[data-sit]');
  if (seat) sit(seat.dataset.sit);
});

// ── the Fortuna table
async function sit(name = 'fortuna') {
  const table = TABLES[name];
  if (seated) return;
  if (purse.balance < table.min) { toast('Your purse is too light for this table. It fills again at dawn.'); return; }
  seated = true;
  hush();
  tag.classList.remove('on');
  document.body.classList.add('seated');
  await venue.flyToTable(name);
  layer.classList.add('open');
  layer.setAttribute('aria-hidden', 'false');
  table.open(layer, { purse, onLeave: stand });
  setTimeout(() => venue.setPaused(true), 700);
}

async function stand() {
  venue.setPaused(false);
  layer.classList.remove('open');
  layer.setAttribute('aria-hidden', 'true');
  setTimeout(() => { if (!layer.classList.contains('open')) layer.innerHTML = ''; }, 700);
  await venue.returnToStop(3);
  seated = false;
  document.body.classList.remove('seated');
  renderCard();
}

// ── arrival: a long glide on the first visit, a short one after
let visited = false;
try { visited = localStorage.getItem('camino_visited') === '1'; localStorage.setItem('camino_visited', '1'); } catch { /* ignore */ }
card.classList.add('away');
document.body.classList.add('ready');
const skip = () => { if (stop === 0 && moving) venue.goToStop(0, 0.5); };
addEventListener('pointerdown', skip, { once: true });
moving = true;
venue.goToStop(0, visited ? 2.4 : 7).then(() => {
  // if the guest already walked on during the glide, their own trip shows the card
  if (stop !== 0) return;
  moving = false;
  renderCard();
  card.classList.remove('away');
});

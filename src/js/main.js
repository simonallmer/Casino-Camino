import { createVenue } from './venue.js';
import { purse, nextDawn, DAILY_STAKE, checkDawn } from './wallet.js';
import { openFortuna, MIN_STAKE } from './fortuna/table.js';
import { openFrontier, FRONTIER_STAKE } from './frontier/table.js';
import { openRicochet, RICOCHET_STAKE } from './ricochet/table.js';
import { loadQuotes, drawLine } from './assets.js';
import { openGlobe } from './coins/globe.js';
import { openCoins } from './coins/gallery.js';
import { openJournals, openArtwork } from './resort-views.js';
import { GUESTS } from './guests.js';

const TABLES = {
  fortuna: { open: openFortuna, min: MIN_STAKE, label: 'Fortuna', blurb: 'Twelve arms, three rings, two dice. Chips from 5.' },
  ricochet: { open: openRicochet, min: RICOCHET_STAKE, label: 'Ricochet', blurb: `A painted wheel, six covered tiles, one ball. Buy-in ${RICOCHET_STAKE}.` },
  frontier: { open: openFrontier, min: FRONTIER_STAKE, label: 'Frontier', blurb: `Five rounds of cards, alliances and nerve. Buy-in ${FRONTIER_STAKE}.` },
};

// the stops of the resort (the same order as STOP_IDS in venue.js)
const S = { garden: 0, court: 1, concierge: 2, coins: 3, casino: 4, theater: 5, gallery: 6, lobby: 7, reading: 8, room: 9, sky: 10 };
// scrolling walks on through the wing you are in
const SEQ = { centre: [S.garden, S.court, S.concierge, S.coins, S.casino, S.theater], west: [S.garden, S.court, S.gallery, S.theater], east: [S.garden, S.court, S.lobby, S.reading, S.theater], hotel: [S.lobby, S.room, S.sky] };
const WING_OF = { [S.concierge]: 'centre', [S.coins]: 'centre', [S.casino]: 'centre', [S.gallery]: 'west', [S.lobby]: 'east', [S.reading]: 'east', [S.room]: 'hotel', [S.sky]: 'hotel' };

const $ = s => document.querySelector(s);
const card = $('.stop-card'), plan = $('.promenade'), hint = $('.walk-hint'), layer = $('.table-layer'), tag = $('.hover-tag'), recital = $('.recital'), toastEl = $('.toast');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── theme: night by default, until the guest flips it (or wakes on the sofa)
let night = (() => { try { const v = sessionStorage.getItem('camino_theme'); return v ? v === 'night' : true; } catch { return true; } })();
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

function setNight(n) {
  night = n;
  try { sessionStorage.setItem('camino_theme', night ? 'night' : 'day'); } catch { /* ignore */ }
  document.documentElement.dataset.theme = night ? 'night' : 'day';
  venue.setTheme(night);
}
$('.theme-toggle').addEventListener('click', async () => {
  document.body.classList.add('dimming');
  await sleep(320);
  setNight(!night);
  document.body.classList.remove('dimming');
});

// ── purse
const fmtIn = ms => { const m = Math.max(1, Math.round(ms / 60000)); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`; };
function renderPurse() { $('.purse-val').textContent = purse.balance; }
purse.subscribe(() => { renderPurse(); if (stop === S.concierge || stop === S.casino) renderCard(); });
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
  if (name.startsWith('art-')) { const i = +name.slice(4); stop === S.gallery ? visit('art', i) : go(S.gallery); return; }
  // the guests' conversations are still being written: for now, a gesture
  if (name.startsWith('guest-')) { stop === S.lobby ? toast(GUESTS[+name.slice(6)].line) : go(S.lobby); return; }
  switch (name) {
    case 'portico': go(S.concierge); break;
    case 'concierge': stop === S.concierge ? talk('concierge', 0) : go(S.concierge); break;
    case 'keeper': stop === S.coins ? talk('keeper', talking === 'keeper' && talkAt >= 0 ? talkAt : 0) : go(S.coins); break;
    case 'globe': stop === S.coins ? visit('globe') : go(S.coins); break;
    case 'coin': stop === S.coins ? visit('coins') : go(S.coins); break;
    case 'fortuna': case 'ricochet': case 'frontier': stop === S.casino ? sit(name) : go(S.casino); break;
    case 'theater': go(S.theater); break;
    case 'lifts': stop === S.lobby ? go(S.room) : go(S.lobby); break;
    case 'terrace': go(S.sky); break;
    case 'skygarden': if (stop !== S.sky) { toast('The sky garden is on the roof. The lifts in the resort go up.'); go(S.sky); } break;
    case 'sofa': stop === S.reading ? rest() : go(S.reading); break;
    case 'journals': stop === S.reading ? visit('journals') : go(S.reading); break;
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

// ── people who speak only when spoken to: the stop card becomes their side of the conversation
const VOICES = {
  keeper: {
    who: 'Miss Sterling · Keeper of the Coin', leave: '← Leave her be',
    lines: [
      { say: 'Inside these walls we play with chips. Out there, the whole world is the casino, and this is its chip.', aside: 'She holds a coin up to the light: silver, with a star of gold.' },
      { say: 'One hundred thousand coins, ever. One for every hundred thousand people on Earth. Not one more.' },
      { say: 'The mint runs a test in 2027. From the first of January 2028 it strikes about eight a day, on a fixed public schedule, until the last coin in 2060.', aside: 'No drops. No surprises.' },
      { say: 'Nine coins, and you read them in two glances. Silver is one digit, gold is two, black is three. Then the star: green for a one, blue for a two, red for a five.', aside: 'A blue star on gold is twenty. A red star on black, five hundred.', show: 'coins' },
      { say: 'Look at the star. Inside it sits a tiny chip that holds the coin’s own serial number. Tap the coin with your phone and it checks in.', show: 'coins' },
      { say: 'Every tap adds a stop to that coin’s travel log, and the globe shows where the coins are. By country only: never where a coin, or its holder, is exactly.', show: 'globe' },
      { say: 'So play with them, trade them, pass them on. A currency for the world’s casino: never sold as an investment, never cashed out.', aside: 'She sets the coin back on its stand.' },
    ],
    end: '<button class="btn" data-visit="coins">The coins</button><button class="btn" data-visit="globe">The globe</button>',
  },
  // placeholder lines until his own are written
  concierge: {
    who: 'Monsieur Bellamy · Concierge', leave: '← Thank him',
    lines: [
      { say: 'Good {greeting}, and welcome to the Casino Camino. Bellamy, at your service. Whatever you need, you need only ask.', aside: 'He bows, very slightly.' },
      { say: 'Every game in this house was made for it, and is played nowhere else in the world. Fortuna, Ricochet, Frontier: one of a kind, each of them.' },
      { say: 'At the desk ahead, Miss Sterling keeps the house’s coins. There will only ever be a hundred thousand of them, so do let her tell you about them.' },
      { say: 'To your left, the gallery. To your right, the resort, the reading room and the lifts. Every corridor ends at the theater.', aside: 'He points each way with an open hand.' },
      { say: 'And your purse, should you need it, I keep right here.' },
    ],
    end: '<button class="btn" data-go="3">To the coin desk</button><button class="btn ghost" data-talk="-1">My purse</button>',
  },
};
const SHOW = { coins: 'Show me the coins', globe: 'Show me the globe' };
let talking = null, talkAt = -1;
function talk(who, i) { talking = i < 0 ? null : who; talkAt = i; renderCard(); }
function conversation() {
  const v = VOICES[talking], line = v.lines[talkAt], last = talkAt === v.lines.length - 1;
  return `
    <p class="kicker">${v.who}</p>
    <blockquote class="says">“${line.say.replace('{greeting}', greeting())}”</blockquote>
    ${line.aside ? `<p class="aside">${line.aside}</p>` : ''}
    <div class="talk-nav">
      <span class="talk-count">${talkAt + 1} / ${v.lines.length}</span>
      ${talkAt > 0 ? `<button class="link" data-talk="${talkAt - 1}">← Back</button>` : `<button class="link" data-talk="-1">${v.leave}</button>`}
    </div>
    <div class="actions wrap">
      ${last
        ? `${v.end}<button class="btn ghost" data-talk="0">From the top</button>`
        : `<button class="btn" data-talk="${talkAt + 1}">Go on</button>${line.show ? `<button class="btn ghost" data-visit="${line.show}">${SHOW[line.show]}</button>` : ''}`}
    </div>`;
}

// ── what the card says at each stop
const STOPS = [
  {
    label: 'Garden',
    render: () => `
      <p class="kicker">The Garden</p>
      <h1 class="display">Casino Camino</h1>
      <p>As wonder faded into functional monotony, the Casino remains a sanctuary of magic. A theater where destiny pivots on a heartbeat and the clock yields to the glow of a sleepless ensemble.</p>
      <div class="actions"><button class="btn" data-go="${S.court}">Into the court</button></div>`,
  },
  {
    label: 'Court',
    render: () => `
      <p class="kicker">The Fountain Court</p>
      <h1>Welcome, traveller.</h1>
      <p>Three doors open from the court: the gallery to the left, the casino ahead, the resort to the right. Every corridor ends at the theater.</p>
      <div class="actions wrap"><button class="btn ghost" data-go="${S.gallery}">Gallery</button><button class="btn" data-go="${S.concierge}">Casino</button><button class="btn ghost" data-go="${S.lobby}">Resort</button></div>`,
  },
  {
    label: 'Concierge',
    render: () => {
      const broke = purse.balance < MIN_STAKE;
      const ledger = purse.ledger.slice(0, 4).map(e => {
        const d = new Date(e.t);
        return `<li><span>${e.label}</span><b class="${e.amount > 0 ? 'up' : e.amount < 0 ? 'down' : ''}">${e.amount > 0 ? '+' : e.amount < 0 ? '−' : ''}${Math.abs(e.amount)}</b><time>${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></li>`;
      }).join('');
      return `
        <p class="kicker">The Concierge</p>
        <h1>Good ${greeting()}.</h1>
        <div class="purse-big"><span>${purse.balance}</span><small>chips in your purse</small></div>
        <p>${broke
          ? `The tables are closed to you until dawn, in ${fmtIn(nextDawn() - Date.now())}. The gallery, the resort and the theater stay open.`
          : `Each dawn the house tops your purse up to ${DAILY_STAKE}. Anything you win above that is yours to keep. What you lose stays lost until morning.`}</p>
        ${ledger ? `<ul class="ledger">${ledger}</ul>` : ''}
        <p class="nudge">Touch Monsieur Bellamy, behind the desk, to speak with him.</p>
        <div class="actions"><button class="btn" data-go="${S.casino}">To the casino floor</button></div>`;
    },
  },
  {
    label: 'Coins',
    render: () => `
      <p class="kicker">The Coin Desk</p>
      <h1>The world is the casino.</h1>
      <p>At the door to the tables, Miss Vivienne Sterling keeps the house’s other currency: nine coins made to travel the world.</p>
      <div class="actions"><button class="btn" data-talk="0">Hear her out</button></div>
      <div class="actions wrap"><button class="btn ghost" data-visit="coins">The coins</button><button class="btn ghost" data-visit="globe">The globe</button></div>`,
  },
  {
    label: 'Casino',
    render: () => `
      <p class="kicker">The Casino Floor</p>
      <h1>Three tables tonight.</h1>
      <ul class="tables">
        ${Object.entries(TABLES).map(([key, t]) => `
        <li>
          <div><h3>${t.label}</h3><p>${t.blurb}</p></div>
          ${purse.balance < t.min ? '<span class="muted">Opens at dawn</span>' : `<button class="btn" data-sit="${key}">Take a seat</button>`}
        </li>`).join('')}
      </ul>`,
  },
  {
    label: 'Theater',
    render: () => `
      <p class="kicker">The Theater</p>
      <h1>Dark tonight.</h1>
      <p>Every wing of the house ends here. The first season is still in rehearsal; when the marquee lights up, this is where the shows will be.</p>
      <div class="actions wrap"><button class="btn ghost" data-go="${S.gallery}">Gallery</button><button class="btn ghost" data-go="${S.casino}">Casino</button><button class="btn ghost" data-go="${S.reading}">Resort</button></div>`,
  },
  {
    label: 'Gallery',
    render: () => `
      <p class="kicker">The Gallery · West Wing</p>
      <h1>On loan to the house.</h1>
      <p>Works by artists of our time hang down the west wing. Touch a frame to bring it into colour, then look closer.</p>
      <p class="nudge">The first works are still being hung: for now, the house has painted its own placeholders.</p>
      <div class="actions wrap"><button class="btn" data-look="${venue.galleryView === 'west' ? 'east' : 'west'}">${venue.galleryView === 'west' ? 'Turn to the east wall' : 'Turn to the west wall'}</button><button class="btn ghost" data-visit="art" data-i="${venue.galleryView === 'west' ? 0 : 1}">Look closer</button><button class="btn ghost" data-go="${S.theater}">On to the theater</button></div>`,
  },
  {
    label: 'Lobby',
    render: () => `
      <p class="kicker">The Resort · East Wing</p>
      <h1>The Grand Hotel.</h1>
      <p>Three brass lifts climb the tower to the rooms, and to a garden on the roof between the towers.</p>
      <div class="actions wrap"><button class="btn" data-go="${S.room}">Take the lift up</button><button class="btn ghost" data-go="${S.reading}">The reading room</button></div>`,
  },
  {
    label: 'Reading',
    render: () => `
      <p class="kicker">The Reading Room</p>
      <h1>The Allmer Journals.</h1>
      <p>Simon Allmer World, Cosmographia, Society Review, the Chronicles and the Enterpriser, on the rack by the wall. Or rest on the sofa a while: the light turns while you sleep.</p>
      <div class="actions wrap"><button class="btn" data-visit="journals">Browse the journals</button><button class="btn ghost" data-rest>Rest on the sofa</button></div>`,
  },
  {
    label: 'Room',
    render: () => `
      <p class="kicker">The Hotel · Top Floor</p>
      <h1>A room with a view.</h1>
      <p>Out of the window, the town climbs its hills and the harbour opens to the sea. The door beside you leads out onto the roof.</p>
      <div class="actions wrap"><button class="btn" data-go="${S.sky}">Out to the sky garden</button><button class="btn ghost" data-go="${S.lobby}">Down to the lobby</button></div>`,
  },
  {
    label: 'Sky garden',
    render: () => {
      const sea = venue.skyView === 'sea';
      return `
        <p class="kicker">The Sky Garden</p>
        <h1>Above it all.</h1>
        <p>A garden on the roof of the house, between the two towers. Its rill runs to the edge and falls on either side of the suits.</p>
        <div class="actions wrap"><button class="btn" data-look="${sea ? 'avenue' : 'sea'}">${sea ? 'Down the avenue' : 'Look out to sea'}</button><button class="btn ghost" data-go="${S.room}">Back inside</button><button class="btn ghost" data-go="${S.lobby}">Down to the lobby</button></div>`;
    },
  },
];

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'evening' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
}

// ── the plan: the ground floor in miniature, every room a place to go
const PLAN = [
  { s: S.theater, x: 4, y: 4, w: 212, h: 26, label: 'Theater' },
  { s: S.gallery, x: 4, y: 36, w: 60, h: 84, label: 'Gallery' },
  { s: S.casino, x: 70, y: 36, w: 80, h: 34, label: 'Casino' },
  { s: S.coins, x: 70, y: 74, w: 80, h: 21, label: 'Coins' },
  { s: S.concierge, x: 70, y: 99, w: 80, h: 21, label: 'Concierge' },
  { s: S.reading, x: 156, y: 36, w: 60, h: 40, label: 'Reading' },
  { s: S.lobby, x: 156, y: 80, w: 60, h: 40, label: 'Lobby' },
  { s: S.court, x: 4, y: 126, w: 212, h: 20, label: 'Court' },
  { s: S.garden, x: 4, y: 150, w: 212, h: 18, label: 'Garden' },
];
plan.innerHTML = `
  <button class="plan-toggle" aria-expanded="false"><span class="plan-here"></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM4 10h16M10 10v9M15 5v5"/></svg></button>
  <div class="plan-body">
    <svg class="plan-map" viewBox="0 0 220 172" role="img" aria-label="Plan of the ground floor">
      ${PLAN.map(r => `<g class="room" data-go="${r.s}" tabindex="0" role="button" aria-label="${r.label}"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="2"/><text x="${r.x + r.w / 2}" y="${r.y + r.h / 2}">${r.label}</text></g>`).join('')}
    </svg>
    <div class="plan-up"><button data-go="${S.room}">Room</button><button data-go="${S.sky}">↑ Sky garden</button></div>
  </div>`;
const planToggle = plan.querySelector('.plan-toggle');
planToggle.addEventListener('click', () => { const open = plan.classList.toggle('open'); planToggle.setAttribute('aria-expanded', open); });
plan.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.room')) { e.preventDefault(); go(+e.target.dataset.go); } });

let stop = 0, moving = false, seated = false, wing = 'centre';

function markPlan(i) {
  plan.querySelectorAll('[data-go]').forEach(b => b.classList.toggle('active', +b.dataset.go === i));
  plan.querySelector('.plan-here').textContent = STOPS[i].label;
}
function renderCard() {
  card.innerHTML = talking && ((talking === 'keeper' && stop === S.coins) || (talking === 'concierge' && stop === S.concierge)) ? conversation() : STOPS[stop].render();
  document.body.classList.toggle('at-arrival', stop === S.garden);
  markPlan(stop);
}

async function go(i) {
  if (seated || touring || venue.riding || i < 0 || i >= STOPS.length || (i === stop && !moving)) return;
  moving = true;
  stop = i;
  if (WING_OF[i]) wing = WING_OF[i];
  talking = null; talkAt = -1;
  document.body.classList.remove('at-arrival');
  plan.classList.remove('open');
  hush();
  card.classList.add('away');
  hint.classList.add('away');
  markPlan(i);
  await venue.goToStop(i);
  if (stop !== i) return; // the guest already chose somewhere else
  renderCard();
  card.classList.remove('away');
  moving = false;
}
function step(dir) {
  const seq = SEQ[wing], k = seq.indexOf(stop);
  const next = k < 0 ? SEQ.centre[Math.max(0, SEQ.centre.indexOf(stop) + dir)] : seq[k + dir];
  if (next !== undefined) go(next);
}

// ── input: wheel, touch, keys, clicks
let wheelAcc = 0, wheelLock = 0;
addEventListener('wheel', e => {
  if (seated || e.target.closest('.stop-card, .recital, .promenade')) return;
  const now = performance.now();
  if (moving || now < wheelLock) return;
  wheelAcc += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  if (Math.abs(wheelAcc) > 60) { step(Math.sign(wheelAcc)); wheelAcc = 0; wheelLock = now + 900; }
}, { passive: true });

let touch = null;
addEventListener('touchstart', e => { touch = e.touches[0]; }, { passive: true });
addEventListener('touchend', e => {
  if (!touch || seated || e.target.closest('.stop-card, .promenade, .recital')) return;
  const t = e.changedTouches[0], dx = t.clientX - touch.clientX, dy = t.clientY - touch.clientY;
  if (Math.max(Math.abs(dx), Math.abs(dy)) > 50) step(Math.abs(dy) > Math.abs(dx) ? (dy < 0 ? 1 : -1) : (dx < 0 ? 1 : -1));
  touch = null;
});

addEventListener('keydown', e => {
  if (seated || moving || e.target.closest('input, textarea')) return;
  if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); step(1); }
  if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); step(-1); }
});

document.addEventListener('click', e => {
  const goBtn = e.target.closest('[data-go]');
  if (goBtn) go(+goBtn.dataset.go);
  const seat = e.target.closest('[data-sit]');
  if (seat) sit(seat.dataset.sit);
  const t = e.target.closest('[data-talk]');
  if (t) talk(stop === S.concierge ? 'concierge' : 'keeper', +t.dataset.talk);
  const v = e.target.closest('[data-visit]');
  if (v) visit(v.dataset.visit, +(v.dataset.i ?? 0));
  if (e.target.closest('[data-rest]')) rest();
  const look = e.target.closest('[data-look]');
  if (look) venue.lookOut(look.dataset.look).then(renderCard);
});

// ── the long walk: a tiny star beside the wordmark, for those who know it is there.
// The text steps aside and the camera glides through every room, resting in each while it comes to colour.
let touring = false;
const tourBtn = document.createElement('button');
tourBtn.className = 'tour-btn';
tourBtn.setAttribute('aria-label', 'The long walk');
tourBtn.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M 50 12 L 61 31 L 83 31 L 72 50 L 83 69 L 61 69 L 50 88 L 39 69 L 17 69 L 28 50 L 17 31 L 39 31 Z"/></svg>';
$('.wordmark').append(tourBtn);
const cine = Object.assign(document.createElement('div'), { className: 'cine' });
cine.setAttribute('aria-hidden', 'true');
document.body.append(cine);

tourBtn.addEventListener('click', async e => {
  e.stopPropagation();
  if (touring || seated || moving || stop !== S.garden) return;
  touring = moving = true;
  hush(); tag.classList.remove('on');
  card.classList.add('away'); hint.classList.add('away');
  document.body.classList.add('touring');
  tourBtn.blur();
  await venue.tour();
  document.body.classList.remove('touring');
  touring = moving = false;
  stop = S.garden; renderCard(); card.classList.remove('away');
});
// any touch, click or key ends it
const endTour = e => { if (!touring) return; e.preventDefault?.(); e.stopPropagation(); venue.endTour(); };
addEventListener('pointerdown', endTour, true);
addEventListener('keydown', endTour, true);

// ── the tables
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
  table.open(layer, { purse, onLeave: () => stand(S.casino) });
  setTimeout(() => venue.setPaused(true), 700);
}

// ── up close: the globe and the coins at the desk, the journal rack, a work in the gallery
const VIEWS = {
  globe: { at: S.coins, fly: () => venue.flyToDesk('globe'), open: (l, o) => openGlobe(l, o) },
  coins: { at: S.coins, fly: () => venue.flyToDesk('coins'), open: (l, o) => openCoins(l, o) },
  journals: { at: S.reading, fly: () => venue.flyToRack(), open: (l, o) => openJournals(l, o) },
  art: { at: S.gallery, fly: i => venue.flyToArt(i), open: (l, o, i) => openArtwork(l, { ...o, i }) },
};
async function visit(name, arg) {
  const v = VIEWS[name];
  if (seated || moving || stop !== v.at) return;
  seated = true;
  hush();
  tag.classList.remove('on');
  document.body.classList.add('seated');
  await v.fly(arg);
  layer.classList.add('open');
  layer.setAttribute('aria-hidden', 'false');
  const opts = { night, onLeave: () => stand(v.at) };
  // the gallery: next and previous step along the wall without leaving
  if (name === 'art') opts.onNav = n => openArtwork(layer, { i: n, onLeave: opts.onLeave, onNav: opts.onNav });
  v.open(layer, opts, arg);
  setTimeout(() => venue.setPaused(true), 700);
}

async function stand(to) {
  venue.setPaused(false);
  layer.classList.remove('open');
  layer.setAttribute('aria-hidden', 'true');
  setTimeout(() => { if (!layer.classList.contains('open')) layer.innerHTML = ''; }, 700);
  await venue.returnToStop(to);
  stop = to;
  seated = false;
  document.body.classList.remove('seated');
  renderCard();
}

// ── the sofa: sit, doze, and wake to the other light
async function rest() {
  if (seated || moving || stop !== S.reading) return;
  seated = moving = true;
  hush(); tag.classList.remove('on');
  card.classList.add('away');
  document.body.classList.add('seated');
  await venue.sitDown();
  await sleep(400);
  await venue.fade(1, 1300);
  setNight(!night);
  await sleep(700);
  await venue.fade(0, 1300);
  toast(night ? 'You doze off. When you open your eyes, the lamps are lit.' : 'You doze off. When you wake, it is morning.');
  await sleep(600);
  await venue.returnToStop(S.reading);
  seated = moving = false;
  document.body.classList.remove('seated');
  renderCard();
  card.classList.remove('away');
}

// ── arrival: a long glide on the first visit, a short one after
let visited = false;
try { visited = localStorage.getItem('camino_visited') === '1'; localStorage.setItem('camino_visited', '1'); } catch { /* ignore */ }
card.classList.add('away');
document.body.classList.add('ready');
markPlan(S.garden);
const skip = () => { if (stop === S.garden && moving) venue.goToStop(S.garden, 0.5); };
addEventListener('pointerdown', skip, { once: true });
moving = true;
venue.goToStop(S.garden, visited ? 2.4 : 7).then(() => {
  // if the guest already walked on during the glide, their own trip shows the card
  if (stop !== S.garden) return;
  moving = false;
  renderCard();
  card.classList.remove('away');
});

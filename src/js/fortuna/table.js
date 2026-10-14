// The Fortuna table: one guest (you) and three house characters on a felt star.

import { Fortuna, GUESTS, NUMBERS, chooseMove } from './engine.js';
import { chipFaceURL, PALETTES } from '../chip.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const ROMAN = ['I', 'II', 'III'];
const RING = ['outer ring', 'middle ring', 'inner ring'];
const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
const R_NODE = 424, R_SLOT = [338, 252, 166], R_ARM = [104, 390];
const PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
const YOU = { id: 'you', name: 'You', short: 'You', mono: '★', title: 'Guest of the house', color: '#efe3c4' };
export const MIN_STAKE = 5;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const angle = i => (i * 30 - 90) * Math.PI / 180;
const at = (i, r) => [Math.cos(angle(i)) * r, Math.sin(angle(i)) * r];
const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent?.appendChild(e);
  return e;
};

export function openFortuna(root, { purse, onLeave }) {
  let alive = true;
  let waitYou = null;      // resolver while it's your turn to bet
  let waitRoll = null;     // resolver while the dice wait for you
  let recorded = false;
  let starter = null;
  const startCash = purse.balance;

  const game = new Fortuna([{ ...YOU, cash: purse.balance }, ...GUESTS.map(g => ({ ...g, cash: 100 }))]);
  const me = () => game.player('you');
  const seatOrder = ['valeska', 'calloway', 'shen', 'you'];

  root.innerHTML = `
    <div class="tbl">
      <header class="tbl-top">
        <button class="link" data-act="leave">← Return to the floor</button>
        <div class="tbl-title"><span class="tbl-name">Fortuna</span><span class="tbl-meta"></span></div>
        <button class="link" data-act="rules">How it plays</button>
      </header>
      <div class="tbl-stage">
        ${seatOrder.map(id => `<div class="seat seat-${id}" data-id="${id}"></div>`).join('')}
        <div class="board-wrap"></div>
      </div>
      <footer class="tbl-console">
        <p class="croupier" aria-live="polite"></p>
        <div class="tbl-actions"></div>
      </footer>
      <div class="tbl-sheet sheet-rules" hidden>
        <div class="sheet-card">
          <p class="kicker">Fortuna · the rules of the house</p>
          <h2>Twelve arms, three rings, two dice.</h2>
          <ol>
            <li>The game runs three rounds, one ring each, moving inward. A chip costs <b>5</b>, then <b>10</b>, then <b>20</b>.</li>
            <li>On your turn, put a chip on any open number or stand. Each number takes one chip per round.</li>
            <li>Bet at least once every round. If you stand without a bet, you leave the game.</li>
            <li>When everyone stands, the house puts a chip on every number still open.</li>
            <li>Two dice are rolled. The first die, the second die and their sum each claim a number. A claimed number pays a third of the pot to whoever owns it.</li>
            <li>A number that has been hit stays out for the rest of the game. If a die lands on one, it <i>reflects</i>: a 3 that finds 3 out moves to 6, then 9, until it lands or leaves the board. A sum that is already out pays nothing.</li>
          </ol>
          <button class="btn" data-act="close-sheet">Back to the table</button>
        </div>
      </div>
      <div class="tbl-sheet sheet-result" hidden><div class="sheet-card"></div></div>
    </div>`;

  const $ = s => root.querySelector(s);
  const lineEl = $('.croupier'), actions = $('.tbl-actions'), meta = $('.tbl-meta');
  const say = (text) => { lineEl.textContent = text; lineEl.classList.remove('in'); void lineEl.offsetWidth; lineEl.classList.add('in'); };

  // ── board
  const svg = el('svg', { viewBox: '-500 -500 1000 1000', class: 'board', role: 'group', 'aria-label': 'Fortuna board' }, $('.board-wrap'));
  el('circle', { r: 488, class: 'felt' }, svg);
  el('circle', { r: 474, class: 'rail' }, svg);
  el('circle', { r: 466, class: 'rail fine' }, svg);
  const guides = R_SLOT.map(r => el('circle', { r, class: 'guide' }, svg));
  const arms = {};
  NUMBERS.forEach((n, i) => {
    const g = el('g', { class: 'arm', 'data-n': n, tabindex: 0, role: 'button', 'aria-label': `Bet on ${n}` }, svg);
    const [x0, y0] = at(i, R_ARM[0]), [x1, y1] = at(i, R_ARM[1]);
    const [hx, hy] = at(i, R_NODE + 30);
    el('line', { x1: x0, y1: y0, x2: hx, y2: hy, class: 'hit-area' }, g);
    el('line', { x1: x0, y1: y0, x2: x1, y2: y1, class: 'spoke' }, g);
    const slots = R_SLOT.map(r => { const [x, y] = at(i, r); return el('circle', { cx: x, cy: y, r: 27, class: 'slot' }, g); });
    const [nx, ny] = at(i, R_NODE);
    const node = el('circle', { cx: nx, cy: ny, r: 34, class: 'node' }, g);
    const label = el('text', { x: nx, y: ny + 12, class: 'num' }, g);
    label.textContent = n;
    const chips = el('g', {}, g);
    arms[n] = { g, slots, node, chips, i };
    g.addEventListener('click', () => tryBet(n));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tryBet(n); } });
  });
  // centre medallion: pot, then dice
  el('circle', { r: 92, class: 'medallion' }, svg);
  el('circle', { r: 84, class: 'rail fine' }, svg);
  const potG = el('g', { class: 'pot' }, svg);
  const potLabel = el('text', { y: -18, class: 'pot-label' }, potG); potLabel.textContent = 'POT';
  const potVal = el('text', { y: 36, class: 'pot-val' }, potG);
  const diceG = el('g', { class: 'dice', style: 'display:none' }, svg);
  const dice = [-30, 30].map(x => {
    const g = el('g', {}, el('g', { transform: `translate(${x} -14)` }, diceG));
    el('rect', { x: -24, y: -24, width: 48, height: 48, rx: 9, class: 'die' }, g);
    return { g, pips: el('g', {}, g) };
  });
  const sumText = el('text', { y: 50, class: 'sum' }, diceG);

  function drawDie(d, v) {
    d.pips.innerHTML = '';
    PIPS[v].forEach(([x, y]) => el('circle', { cx: x * 12, cy: y * 12, r: 4.6, class: 'pip' }, d.pips));
  }

  // ── seats
  function renderSeats(highlight) {
    game.players.forEach(p => {
      const seat = $(`.seat-${p.id}`);
      const current = highlight ? highlight === p.id : game.current === p.id && game.phase === 'betting';
      let status = '';
      if (!p.active) status = 'Out';
      else if (game.phase === 'betting' && game.passed.includes(p.id)) status = 'Stands';
      else if (current) status = p.id === 'you' ? 'Your move' : 'Thinking…';
      const bets = '<i></i>'.repeat(p.betsThisRound);
      seat.className = `seat seat-${p.id}${current ? ' current' : ''}${p.active ? '' : ' out'}`;
      seat.innerHTML = `
        <span class="seat-chip" style="--c:${p.color}">${p.mono}</span>
        <div class="seat-who"><div class="seat-name"><span class="full">${p.name}</span><span class="short">${p.short ?? p.name}</span></div><div class="seat-title">${p.title}</div></div>
        <div class="seat-stack"><span>${p.cash}</span><small>chips</small></div>
        <div class="seat-status">${status}<span class="seat-bets">${bets}</span></div>`;
    });
  }

  function renderBoard() {
    const myTurn = game.phase === 'betting' && game.current === 'you';
    meta.textContent = `Round ${ROMAN[game.round - 1]} · ${RING[game.ring]} · ${game.bet} a chip`;
    guides.forEach((g, k) => g.classList.toggle('current', k === game.ring));
    NUMBERS.forEach(n => {
      const a = arms[n], out = game.eliminated.includes(n), owner = game.owner(n);
      a.g.classList.toggle('out', out);
      a.g.classList.toggle('open', myTurn && !out && owner === null && me().cash >= game.bet);
      a.slots.forEach((s, k) => s.classList.toggle('cur', k === game.ring));
      const key = owner ? `${owner}-${game.round}` : '';
      if (a.chips.dataset.key !== key) {
        a.chips.dataset.key = key;
        a.chips.innerHTML = '';
        if (owner) {
          const [x, y] = at(a.i, R_SLOT[game.ring]);
          const pos = el('g', { transform: `translate(${x} ${y})` }, a.chips);
          const c = el('g', { class: 'chip chip-in' }, pos);
          el('image', { href: faces[owner], x: -26, y: -26, width: 52, height: 52 }, c);
          el('circle', { r: 26, class: 'chip-rim' }, c);
        }
      }
    });
    potVal.textContent = game.pot;
  }

  const render = (highlight) => { renderBoard(); renderSeats(highlight); };

  function setActions(html) { actions.innerHTML = html; }

  // ── your inputs
  function tryBet(n) {
    if (!waitYou) return;
    const r = game.placeBet('you', n);
    if (!r.ok) { say(r.reason); return; }
    purse.set(me().cash);
    say(`You take ${n}.`);
    const done = waitYou; waitYou = null; done();
  }

  function stand() {
    if (!waitYou) return;
    const r = game.pass('you');
    say(r.eliminated ? 'You stand without a bet and leave the game. You can watch the rest from your seat.' : 'You stand.');
    const done = waitYou; waitYou = null; done();
  }

  $('.tbl').addEventListener('click', e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (!act) return;
    if (act === 'stand') stand();
    if (act === 'roll' && waitRoll) { const r = waitRoll; waitRoll = null; r(); }
    if (act === 'rules') $('.sheet-rules').hidden = false;
    if (act === 'close-sheet') $('.sheet-rules').hidden = true;
    if (act === 'again') restart();
    if (act === 'leave') leave(e.target.closest('[data-act]'));
  });

  function leave(btn) {
    const midGame = game.phase !== 'over' && !recorded;
    if (midGame && !btn.dataset.armed && game.players.some(p => p.id === 'you' && p.totalBet > 0)) {
      btn.dataset.armed = '1';
      btn.textContent = 'Leave now? Your chips on the felt stay with the house';
      setTimeout(() => { if (alive) { delete btn.dataset.armed; btn.textContent = '← Return to the floor'; } }, 4000);
      return;
    }
    settle();
    alive = false;
    onLeave();
  }

  function settle() {
    if (recorded) return;
    recorded = true;
    const net = me().cash - startCash;
    if (me().totalBet > 0) purse.record(`Fortuna · ${net >= 0 ? 'won' : 'lost'} at the table`, net);
  }

  function restart() {
    settle();
    alive = false;
    root.innerHTML = '';
    openFortuna(root, { purse, onLeave });
  }

  // ── the game loop
  async function turnOf(id) {
    render();
    if (id === 'you') {
      const first = me().betsThisRound === 0;
      setActions(`<button class="btn ghost" data-act="stand">${first ? 'Stand without a bet' : 'Stand'}</button>`);
      if (first) say(me().cash >= game.bet ? `Your move. Put a ${game.bet}-chip bet on any open number. You need at least one bet this round.` : `You don't have the ${game.bet} chips to bet. You'll have to stand.`);
      else say(`Your move. Another ${game.bet}-chip bet, or stand.`);
      await new Promise(r => { waitYou = r; });
      setActions('');
      return;
    }
    await sleep(700 + Math.random() * 500);
    if (!alive) return;
    const p = game.player(id), n = chooseMove(game, id);
    if (n !== null) { game.placeBet(id, n); say(`${p.name} takes ${n}.`); }
    else { const r = game.pass(id); say(r.eliminated ? `${p.name} stands without a bet and leaves the game.` : `${p.name} stands.`); }
  }

  async function chooseStarter() {
    const active = game.players.filter(p => p.active);
    if (starter === null) {
      say('The croupier picks who opens.');
      for (let k = 0; k < 14; k++) { render(active[k % active.length].id); await sleep(70 + k * 6); if (!alive) return; }
      starter = game.randomStarter();
    } else {
      const i = game.players.findIndex(p => p.id === starter);
      for (let k = 1; k <= game.players.length; k++) {
        const p = game.players[(i + k) % game.players.length];
        if (p.active) { starter = p.id; break; }
      }
    }
  }

  async function play() {
    while (alive && game.phase !== 'over') {
      await chooseStarter(); if (!alive) return;
      game.startRound(starter);
      say(`Round ${ROMAN[game.round - 1]}, the ${RING[game.ring]}. ${game.player(starter).name === 'You' ? 'You open' : `${game.player(starter).name} opens`}.`);
      await sleep(900);
      while (alive && game.phase === 'betting') await turnOf(game.current);
      if (!alive) return;

      const filled = game.fillHouse();
      render();
      say(`No more bets. The house takes the ${filled.length} open number${filled.length === 1 ? '' : 's'}. The pot is ${game.pot}.`);
      await sleep(1500); if (!alive) return;

      if (me().active) {
        setActions('<button class="btn" data-act="roll">Roll the dice</button>');
        await new Promise(r => { waitRoll = r; });
        setActions('');
      } else await sleep(600);
      if (!alive) return;
      await roll(); if (!alive) return;

      const { over, liquidated } = game.endRound();
      liquidated.forEach(id => say(`${game.player(id).name} is out of chips.`));
      render();
      if (over) return showResult();
      await sleep(1200);
    }
  }

  async function tumble(k, value) {
    const d = dice[k];
    d.g.classList.add('rolling');
    for (let i = 0; i < 14; i++) { drawDie(d, 1 + Math.floor(Math.random() * 6)); await sleep(40 + i * 7); }
    drawDie(d, value);
    d.g.classList.remove('rolling');
    d.g.classList.add('landed');
  }

  async function flash(n, cls, ms) {
    const a = arms[n]; if (!a) return;
    a.g.classList.add(cls); await sleep(ms); a.g.classList.remove(cls);
  }

  function floatGain(n, amount) {
    const a = arms[n], [x, y] = at(a.i, R_NODE - 70);
    const t = el('text', { x, y, class: 'gain' }, svg); t.textContent = `+${amount}`;
    setTimeout(() => t.remove(), 1600);
  }

  async function announce(label, res) {
    for (let k = 0; k < res.path.length - 1; k++) {
      say(`${label}: ${WORDS[res.path[k]]} is already out, so it reflects to ${res.path[k + 1] <= 12 ? WORDS[res.path[k + 1]] : 'the edge'}…`);
      await flash(res.path[k], 'flash', 650); if (!alive) return;
    }
    if (res.target === null) {
      if (res.taken) say(`The sum is ${WORDS[res.value].toLowerCase()}, which is already out. Nothing pays.`);
      else say(`${label}: ${WORDS[res.value]} reflects off the edge of the board. Nothing pays.`);
      await sleep(1200); return;
    }
    render();
    arms[res.target].g.classList.add('hit');
    if (res.owner === 'house') say(`${label}: ${WORDS[res.target]}. The house collects ${res.share}.`);
    else {
      const p = game.player(res.owner);
      say(`${label}: ${WORDS[res.target]} pays ${p.id === 'you' ? 'you' : p.name} ${res.share}.`);
      floatGain(res.target, res.share);
      if (p.id === 'you') purse.set(me().cash);
      renderSeats();
      $(`.seat-${p.id}`).classList.add('paid');
    }
    await sleep(1500);
    arms[res.target].g.classList.remove('hit');
  }

  async function roll() {
    potG.style.display = 'none'; diceG.style.display = '';
    sumText.textContent = '';
    dice.forEach(d => { d.g.classList.remove('landed'); d.pips.innerHTML = ''; });
    const d1 = game.rollDie();
    say('First die…');
    await tumble(0, d1); if (!alive) return;
    await announce('First die', game.resolveDie(d1)); if (!alive) return;
    const d2 = game.rollDie();
    say('Second die…');
    await tumble(1, d2); if (!alive) return;
    await announce('Second die', game.resolveDie(d2)); if (!alive) return;
    sumText.textContent = `= ${d1 + d2}`;
    await announce('The sum', game.resolveSum(d1 + d2)); if (!alive) return;
    root.querySelectorAll('.seat.paid').forEach(s => s.classList.remove('paid'));
    potG.style.display = ''; diceG.style.display = 'none';
  }

  function showResult() {
    settle();
    const net = me().cash - startCash;
    const ranked = [...game.players].sort((a, b) => b.cash - a.cash);
    const head = net > 0 ? 'The house salutes you.' : net < 0 ? 'The house thanks you for playing.' : 'You leave the felt even.';
    const sheet = $('.sheet-result');
    sheet.querySelector('.sheet-card').innerHTML = `
      <p class="kicker">Fortuna · the count</p>
      <h2>${head}</h2>
      <p class="net ${net >= 0 ? 'up' : 'down'}">${net >= 0 ? '+' : '−'}${Math.abs(net)} <small>chips tonight</small></p>
      <ol class="ranking">${ranked.map(p => `<li><span class="seat-chip" style="--c:${p.color}">${p.mono}</span><span>${p.name}</span><b>${p.cash}</b></li>`).join('')}</ol>
      <div class="sheet-actions">
        ${purse.balance >= MIN_STAKE ? '<button class="btn" data-act="again">Deal another game</button>' : '<p class="muted">Your purse is empty until dawn.</p>'}
        <button class="btn ghost" data-act="leave">Return to the floor</button>
      </div>`;
    sheet.hidden = false;
    say('The game is over.');
  }

  // every guest's chips carry the house design in their own colour
  const faces = {};
  const shade = (hex, k) => '#' + hex.slice(1).match(/../g).map(h => Math.round(parseInt(h, 16) * k).toString(16).padStart(2, '0')).join('');
  const paletteFor = p => (p.id === 'you' ? PALETTES.ivory : { base: p.color, ring: shade(p.color, 0.7), inlay: '#efe3c4', gold: '#d6b066', engrave: '#f3d9a4' });
  Promise.all([
    ...game.players.map(async p => { faces[p.id] = await chipFaceURL(paletteFor(p), p.id === 'you' ? '★' : p.mono); }),
    chipFaceURL(PALETTES.night, 'logo').then(u => { faces.house = u; }),
  ]).finally(() => { if (!alive) return; render(); play(); });

  return { close() { settle(); alive = false; } };
}

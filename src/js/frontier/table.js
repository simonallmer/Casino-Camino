// The Frontier table (Rules V4): five rounds of nerve, alliances and the last chip.

import { Frontier, bestPlay, readHand, describe, chooseFrontierMove, chooseDiscards, RANK_NAME, TABLE_CARDS } from './engine.js';
import { GUESTS } from '../fortuna/engine.js';
import { createShell, confirmLeave, sleep, YOU } from '../shell.js';
import { cardURL } from '../assets.js';
import { chipFaceURL, PALETTES } from '../chip.js';

export const FRONTIER_STAKE = 10;
const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
const SUIT_WORD = { spades: 'Spades', clubs: 'Clubs', hearts: 'Hearts', diamonds: 'Diamonds', stars: 'Stars' };

const RULES = `
  <p class="kicker">Frontier · the rules of the house (V4)</p>
  <h2>Five rounds. Five cards in reach. The strongest hand takes the pot.</h2>
  <ol>
    <li>Everyone sits down with <b>${FRONTIER_STAKE}</b> chips. Each round you hold one more card (1 → 5) and the face-up <b>Table Cards</b> shrink (4 → 0), so hand and table always make five. The last round is played from your hand alone. Table Cards serve every player at once.</li>
    <li><b>Betting</b> starts left of the dealer: open with at least 1, then call, raise (by at least 1) or fold. Folding before you have bet costs 1. Betting goes round until everyone still in has put in the same. Nobody may bet more than the poorest player held when the round began.</li>
    <li>At the <b>showdown</b> you play any of your own cards plus any Table Cards (Table Cards alone are allowed). A combination is two or more cards sharing a trait; a card that doesn't fit breaks it.</li>
    <li><b>Which hand wins:</b> a combination with more cards › fewer › none. Then <i>Symbol Run › Same Value › Same Symbol › Run</i>. Then <i>One Color › One Color + Black › Red + Blue</i>. Then the higher total (Cypher = 10). Without a combination, go straight to colour. A single card counts only its value.</li>
    <li>Played cards and Table Cards are discarded; cards you didn't play stay in your hand. Then you may discard any of them face up. The deal moves one seat on.</li>
    <li>The Cypher links 9 and 1 in a run. After round five, whoever holds more than they brought has won the difference.</li>
  </ol>`;

export function openFrontier(root, { purse, onLeave }) {
  let alive = true, settled = false;
  purse.set(purse.balance - FRONTIER_STAKE);
  const game = new Frontier([YOU, ...GUESTS].map(p => ({ ...p })), { stake: FRONTIER_STAKE });
  const me = () => game.player('you');
  const shell = createShell(root, { name: 'Frontier', rules: RULES });
  let mode = null;            // 'bet' | 'play' | 'discard' while waiting on you
  let resolveYou = null, selected = new Set(), raiseTo = 0, reveal = null;

  shell.center.innerHTML = `
    <div class="ft-felt">
      ${['valeska', 'calloway', 'shen'].map(id => `<div class="ft-play ft-${id}"></div>`).join('')}
      <div class="ft-middle">
        <div class="ft-table"><div class="ft-table-cards"></div><small>Table Cards</small></div>
        <div class="ft-pot"><span>0</span><small>Pot</small></div>
      </div>
    </div>`;
  const felt = shell.center.querySelector('.ft-felt');
  chipFaceURL(PALETTES.camino, 'logo').then(u => felt.style.setProperty('--back', `url(${u})`));

  const cardHTML = (c, { cls = '', pickable = false } = {}) =>
    `<button class="card ${cls}" ${pickable ? `data-act="pick" data-id="${c.id}"` : 'tabindex="-1"'} style="background-image:url('${cardURL(c.suit, c.rank)}')" aria-label="${RANK_NAME(c.rank)} of ${SUIT_WORD[c.suit]}"></button>`;

  function statusOf(p) {
    const tags = [];
    if (game.dealer === p.id) tags.push('Dealer');
    if (p.folded) tags.push('Folded');
    else if (game.phase === 'betting' && game.current === p.id) tags.push(p.id === 'you' ? 'Your move' : 'Thinking…');
    else if (p.bet) tags.push(`In for ${p.bet}`);
    return tags.join(' · ');
  }

  function pool() { return [...me().hand, ...game.table]; }
  function chosen() { return pool().filter(c => selected.has(c.id)); }

  function render() {
    shell.meta(`Round ${ROMAN[Math.max(0, game.round - 1)]} of V · limit ${game.limit || '—'}`);
    shell.seats(game.players, { current: game.phase === 'betting' ? game.current : null, status: statusOf });
    felt.querySelector('.ft-pot span').textContent = game.pot;
    felt.querySelector('.ft-table-cards').innerHTML = game.table.map(c =>
      cardHTML(c, { cls: selected.has(c.id) && mode === 'play' ? 'picked' : '', pickable: mode === 'play' })).join('');

    for (const id of ['valeska', 'calloway', 'shen']) {
      const p = game.player(id), spot = felt.querySelector(`.ft-${id}`);
      if (!p.active) { spot.innerHTML = ''; continue; }
      if (reveal && reveal.shown.includes(id)) {
        spot.innerHTML = `<div class="ft-cards">${p.play.cards.map(c => cardHTML(c, { cls: 'mini' })).join('')}</div><p class="ft-note ${reveal.winners.includes(id) ? 'win' : ''}">${describe(p.play.hand)}</p>`;
      } else if (p.folded) spot.innerHTML = '<p class="ft-note">Folded</p>';
      else spot.innerHTML = `<div class="ft-cards">${'<div class="card back mini"></div>'.repeat(p.hand.length)}</div>`;
    }
    renderHand();
  }

  function renderHand() {
    const mine = me();
    if (!mine.active) { shell.extra.innerHTML = '<p class="ft-note">You are out of chips at this table.</p>'; return; }
    if (reveal && reveal.shown.includes('you')) {
      shell.extra.innerHTML = `<div class="ft-hand">${mine.play.cards.map(c => cardHTML(c, { cls: 'picked' })).join('')}</div><p class="ft-note ${reveal.winners.includes('you') ? 'win' : ''}">${describe(mine.play.hand)}</p>`;
      return;
    }
    const cards = mine.hand.map(c => cardHTML(c, {
      cls: selected.has(c.id) ? (mode === 'discard' ? 'swap' : 'picked') : '',
      pickable: mode === 'play' || mode === 'discard',
    })).join('');
    let read = '';
    if (mode === 'play') read = chosen().length ? describe(readHand(chosen())) : 'Choose your cards and any Table Cards';
    else if (mode === 'discard') read = mine.hand.length ? 'Choose cards to discard face up, or keep them all' : 'No cards left in hand';
    else if (game.phase === 'betting' && !mine.folded) read = `Best you can show: ${describe(bestPlay(mine.hand, game.table).hand)}`;
    shell.extra.innerHTML = `<div class="ft-hand">${cards}</div><p class="ft-read">${read}</p>`;
  }

  function renderActions() {
    if (mode === 'bet') {
      const o = game.options('you');
      raiseTo = Math.min(Math.max(raiseTo, o.minRaise), o.maxRaise);
      const parts = [`<button class="btn ghost" data-act="fold">${o.foldCost ? 'Fold · pay 1' : 'Fold'}</button>`];
      if (!o.opening) parts.push(`<button class="btn" data-act="call">Call ${o.toCall}</button>`);
      if (o.canRaise) {
        parts.push(`<span class="stepper"><button class="btn ghost" data-act="less" aria-label="Less">−</button><b>${raiseTo}</b><button class="btn ghost" data-act="more" aria-label="More">+</button></span>`);
        parts.push(`<button class="btn" data-act="raise">${o.opening ? `Open with ${raiseTo}` : `Raise to ${raiseTo}`}</button>`);
      }
      shell.actions(parts.join(''));
    } else if (mode === 'play') {
      shell.actions(`<button class="btn ghost" data-act="suggest">Suggest</button><button class="btn" data-act="show" ${chosen().length ? '' : 'disabled'}>Show these cards</button>`);
    } else if (mode === 'discard') {
      const n = me().hand.filter(c => selected.has(c.id)).length;
      shell.actions(`<button class="btn ghost" data-act="keep">Keep my cards</button><button class="btn" data-act="toss" ${n ? '' : 'disabled'}>Discard ${n || ''}</button>`);
    } else shell.actions('');
  }

  function waitFor(m) {
    mode = m; selected.clear();
    render(); renderActions();
    return new Promise(r => { resolveYou = r; });
  }
  function done(value) { const r = resolveYou; resolveYou = null; mode = null; selected.clear(); renderActions(); r?.(value); }

  shell.on('pick', el => {
    const id = el.dataset.id;
    selected.has(id) ? selected.delete(id) : selected.add(id);
    render(); renderActions();
  });
  shell.on('less', () => { raiseTo--; renderActions(); });
  shell.on('more', () => { raiseTo++; renderActions(); });
  const bet = action => { const r = game.act('you', { action, to: raiseTo }); if (!r.ok) shell.say(r.reason); else done(); };
  shell.on('fold', () => bet('fold'));
  shell.on('call', () => bet('call'));
  shell.on('raise', () => bet('raise'));
  shell.on('suggest', () => { selected = new Set(bestPlay(me().hand, game.table).cards.map(c => c.id)); render(); renderActions(); });
  shell.on('show', () => { const cards = chosen(); if (cards.length) done(cards); });
  shell.on('keep', () => done([]));
  shell.on('toss', () => done(me().hand.filter(c => selected.has(c.id))));
  shell.on('again', () => { settle(); alive = false; openFrontier(root, { purse, onLeave }); });
  shell.on('leave', el => {
    if (game.phase !== 'over' && !settled && !confirmLeave(el, 'Leave now? You keep your stack; chips bet this round stay in the pot')) return;
    settle(); alive = false; onLeave();
  });

  function settle() {
    if (settled) return;
    settled = true;
    const stack = me().active ? me().cash : 0;
    purse.set(purse.balance + stack);
    const net = stack - FRONTIER_STAKE;
    purse.record(`Frontier · ${net >= 0 ? 'won' : 'lost'} at the table`, net);
  }

  const nameOf = id => (id === 'you' ? 'You' : game.player(id).name);
  const verb = (id, v) => (id === 'you' ? v : `${v}s`);

  async function play() {
    while (alive && game.phase !== 'over') {
      game.startRound();
      reveal = null;
      render();
      const opener = game.order[0];
      const tc = TABLE_CARDS[game.round - 1];
      shell.say(`Round ${ROMAN[game.round - 1]}. ${tc ? `${tc} Table Card${tc > 1 ? 's' : ''}` : 'No Table Cards'}, ${game.round} in hand. ${nameOf(game.dealer)} ${game.dealer === 'you' ? 'deal' : 'deals'}; ${nameOf(opener)} ${verb(opener, 'open')}.`);
      await sleep(1500); if (!alive) return;

      // ── betting, round and round until everyone still in is even
      while (alive && game.phase === 'betting') {
        const id = game.current, p = game.player(id), before = game.currentBet;
        render();
        if (id === 'you') {
          const o = game.options('you');
          raiseTo = o.opening ? 1 : o.minRaise;
          shell.say(o.opening ? 'Your move. Open with at least 1, or fold for 1.' : `Your move. ${o.toCall} to call.`);
          await waitFor('bet');
        } else {
          await sleep(800 + Math.random() * 600); if (!alive) return;
          const m = chooseFrontierMove(game, id, p.style);
          if (!game.act(id, m).ok) game.act(id, { action: game.options(id).opening ? 'raise' : 'call', to: 1 });
        }
        if (!alive) return;
        if (p.folded) shell.say(`${nameOf(id)} ${verb(id, 'fold')}${before === 0 && p.bet ? ', paying 1' : ''}.`);
        else if (before === 0) shell.say(`${nameOf(id)} ${verb(id, 'open')} with ${p.bet}.`);
        else if (game.currentBet > before) shell.say(`${nameOf(id)} ${verb(id, 'raise')} to ${game.currentBet}.`);
        else shell.say(`${nameOf(id)} ${verb(id, 'call')} ${p.bet}.`);
        render();
        await sleep(id === 'you' ? 400 : 800);
      }
      if (!alive) return;

      // ── showdown: everyone still in shows a play
      const still = game.inRound();
      if (still.length > 1) {
        for (const p of still) if (p.id !== 'you') game.choose(p.id, bestPlay(p.hand, game.table).cards);
        if (still.includes(me())) {
          shell.say('Showdown. Choose the cards you play: any of your own, plus any Table Cards.');
          const cards = await waitFor('play'); if (!alive) return;
          game.choose('you', cards);
        }
      }
      const res = game.showdown();
      reveal = { winners: res.winners, shown: res.uncontested ? [] : still.map(p => p.id) };
      render();
      const names = res.winners.map(nameOf);
      if (res.uncontested) shell.say(`${names[0]} ${verb(res.winners[0], 'take')} the pot of ${res.pot}. Everyone else folded.`);
      else if (res.winners.length > 1) shell.say(`A tie. ${names.join(' and ')} split the pot of ${res.pot}.`);
      else shell.say(`${names[0]} ${verb(res.winners[0], 'take')} the pot of ${res.pot}.`);
      res.winners.forEach(id => shell.pulse(id));
      await sleep(2400); if (!alive) return;

      // ── refill: discard any hand cards face up
      if (game.round < game.maxRounds) {
        for (const p of game.live) if (p.id !== 'you') {
          const toss = chooseDiscards(game, p.id, p.style);
          game.refill(p.id, toss);
        }
        if (me().active && me().hand.length) {
          reveal = null;
          shell.say('Your unplayed cards stay with you. Discard any you don\'t want, face up.');
          const toss = await waitFor('discard'); if (!alive) return;
          game.refill('you', toss);
          if (toss.length) shell.say(`You discard ${toss.length} card${toss.length > 1 ? 's' : ''}.`);
        }
      }
      const out = game.endRound();
      out.forEach(id => shell.say(`${nameOf(id)} ${id === 'you' ? 'are' : 'is'} out of chips.`));
      if (game.phase === 'over' || !me().active) { await sleep(1600); if (alive) finish(); return; }
      await sleep(900);
    }
  }

  function finish() {
    settle();
    const stack = me().active ? me().cash : 0, net = stack - FRONTIER_STAKE;
    shell.say('The fifth round is played. The table counts its chips.');
    shell.result({
      kicker: 'Frontier · the count',
      head: net > 0 ? 'You leave richer than you came.' : net < 0 ? 'The frontier took its share.' : 'You leave the table even.',
      net, ranking: [...game.players].sort((a, b) => b.cash - a.cash),
      again: purse.balance >= FRONTIER_STAKE,
    });
  }

  render();
  play();
  return { close() { settle(); alive = false; } };
}

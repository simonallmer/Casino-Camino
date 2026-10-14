// Frontier — pure rules, no DOM. Rules V4 (Simon Allmer, Laurin Grumiller).
// Five rounds. Your own cards (1→5) plus shared face-up Table Cards (4→0): five always in reach.
// Bet until everyone still in has put in the same; the strongest hand takes the pot.

export const SUITS = ['spades', 'clubs', 'hearts', 'diamonds', 'stars'];
const COLOR = { spades: 'blue', clubs: 'blue', hearts: 'red', diamonds: 'red', stars: 'black' };
export const RANK_NAME = r => (r === 10 ? 'Cypher' : String(r));
export const TABLE_CARDS = [4, 3, 2, 1, 0];   // hand + table always make five

export function newDeck() {
  const deck = [];
  for (const suit of SUITS) for (let rank = 1; rank <= 10; rank++) deck.push({ id: `${suit}-${rank}`, suit, rank });
  return deck;
}

export function shuffle(arr, rng = Math.random) {
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}

// ── hand strength (Section 5)
export const TYPE_NAME = ['No Combination', 'Run', 'Same Symbol', 'Same Value', 'Symbol Run'];
export const COLOR_NAME = ['Red + Blue', 'One Color + Black', 'One Color'];

function isRun(ranks) {
  // consecutive values; the Cypher (10) links 9 and 1
  const set = new Set(ranks);
  if (ranks.length < 2 || set.size !== ranks.length) return false;
  for (let start = 1; start <= 10; start++) {
    let ok = true;
    for (let k = 0; k < ranks.length && ok; k++) ok = set.has(((start - 1 + k) % 10) + 1);
    if (ok) return true;
  }
  return false;
}

export function readHand(cards) {
  const n = cards.length, ranks = cards.map(c => c.rank);
  const total = ranks.reduce((a, b) => a + b, 0);
  let type = 0;
  if (n >= 2) {
    const oneSymbol = cards.every(c => c.suit === cards[0].suit);
    const run = isRun(ranks);
    if (run && oneSymbol) type = 4;
    else if (ranks.every(r => r === ranks[0])) type = 3;
    else if (oneSymbol) type = 2;
    else if (run) type = 1;
  }
  // a single card counts only its value
  let color = 0;
  if (n >= 2) {
    const colors = new Set(cards.map(c => COLOR[c.suit]));
    if (colors.size === 1) color = 2;
    else if (colors.has('red') && colors.has('blue')) color = 0;
    else color = 1;
  }
  return { n, type, color, total, combo: type > 0 };
}

// > 0 when a is stronger: size, type, color, total — first difference decides.
export function compareHands(a, b) {
  if (a.combo !== b.combo) return a.combo ? 1 : -1;
  if (a.combo) {
    if (a.n !== b.n) return a.n - b.n;
    if (a.type !== b.type) return a.type - b.type;
  }
  if (a.color !== b.color) return a.color - b.color;
  return a.total - b.total;
}

export function describe(h) {
  if (!h) return '';
  if (h.n === 1) return `A single card · ${h.total}`;
  return `${h.combo ? `${TYPE_NAME[h.type]} of ${h.n}` : `No Combination, ${h.n} cards`} · ${COLOR_NAME[h.color]} · total ${h.total}`;
}

// The strongest play from your hand plus the Table Cards; on a tie, keep more of your own cards.
export function bestPlay(hand, table) {
  const pool = [...hand, ...table];
  let best = null;
  for (let mask = 1; mask < 1 << pool.length; mask++) {
    const cards = pool.filter((_, i) => mask & (1 << i));
    const h = readHand(cards);
    const own = cards.filter(c => hand.includes(c)).length;
    if (!best) { best = { cards, hand: h, own }; continue; }
    const c = compareHands(h, best.hand);
    if (c > 0 || (c === 0 && own < best.own)) best = { cards, hand: h, own };
  }
  return best;
}

// ── the table
export class Frontier {
  constructor(players, { stake = 10, rounds = 5, rng = Math.random } = {}) {
    this.players = players.map(p => ({ ...p, cash: stake, hand: [], active: true, folded: false, bet: 0, acted: false, play: null }));
    this.rng = rng;
    this.maxRounds = rounds;
    this.round = 0;
    this.deck = shuffle(newDeck(), rng);
    this.discard = [];
    this.table = [];
    this.pot = 0;
    this.currentBet = 0;
    this.limit = 0;
    this.dealer = null;
    this.order = [];      // seat ids from the dealer's left
    this.turn = 0;
    this.phase = 'idle';  // betting | showdown | refill | between | over
  }

  player(id) { return this.players.find(p => p.id === id); }
  get live() { return this.players.filter(p => p.active); }
  get current() { return this.order[this.turn] ?? null; }
  get handSize() { return this.round; }
  inRound() { return this.order.map(id => this.player(id)).filter(p => !p.folded); }

  draw() {
    if (!this.deck.length) { this.deck = shuffle(this.discard, this.rng); this.discard = []; }
    return this.deck.pop();
  }

  startRound() {
    this.round++;
    const live = this.live;
    // the deal passes one seat clockwise each round
    if (this.dealer === null) this.dealer = live[Math.floor(this.rng() * live.length)].id;
    else this.dealer = this.nextLive(this.dealer);
    const d = this.players.findIndex(p => p.id === this.dealer);
    this.order = [];
    for (let k = 1; k <= this.players.length; k++) {
      const p = this.players[(d + k) % this.players.length];
      if (p.active) this.order.push(p.id);
    }
    this.table = Array.from({ length: TABLE_CARDS[this.round - 1] }, () => this.draw());
    for (const p of live) while (p.hand.length < this.handSize) p.hand.push(this.draw());
    for (const p of live) Object.assign(p, { folded: false, bet: 0, acted: false, play: null, raises: 0 });
    this.limit = Math.min(...live.map(p => p.cash));
    this.pot = 0;
    this.currentBet = 0;
    this.turn = 0;
    this.phase = 'betting';
  }

  nextLive(id) {
    const i = this.players.findIndex(p => p.id === id);
    for (let k = 1; k <= this.players.length; k++) {
      const p = this.players[(i + k) % this.players.length];
      if (p.active) return p.id;
    }
    return id;
  }

  options(id) {
    const p = this.player(id);
    return {
      opening: this.currentBet === 0,
      toCall: this.currentBet - p.bet,
      callTo: this.currentBet,
      minRaise: this.currentBet + 1,
      maxRaise: this.limit,
      canRaise: this.limit >= this.currentBet + 1,
      foldCost: p.bet === 0 ? 1 : 0,
    };
  }

  pay(p, amount) { p.cash -= amount; p.bet += amount; this.pot += amount; }

  // action: 'fold' | 'call' | 'raise' (to a total of `to`); opening is a raise from 0
  act(id, { action, to = 0 } = {}) {
    if (this.phase !== 'betting' || this.current !== id) return { ok: false, reason: 'Not your turn.' };
    const p = this.player(id), o = this.options(id);
    if (action === 'fold') {
      if (o.foldCost) this.pay(p, Math.min(1, p.cash));
      p.folded = true;
    } else if (action === 'call') {
      if (o.opening) return { ok: false, reason: 'Open with at least 1.' };
      this.pay(p, o.toCall);
    } else if (action === 'raise') {
      if (to < o.minRaise) return { ok: false, reason: `Bet at least ${o.minRaise}.` };
      if (to > this.limit) return { ok: false, reason: `Nobody may bet more than ${this.limit} this round.` };
      this.pay(p, to - p.bet);
      this.currentBet = to;
      // a raise reopens the betting for everyone else still in
      for (const q of this.inRound()) if (q !== p) q.acted = false;
    } else return { ok: false, reason: 'Unknown action.' };
    p.acted = true;
    this.advance();
    return { ok: true };
  }

  advance() {
    const still = this.inRound();
    if (still.length <= 1) { this.phase = 'showdown'; return; }
    if (still.every(p => p.acted && p.bet === this.currentBet)) { this.phase = 'showdown'; return; }
    for (let k = 1; k <= this.order.length; k++) {
      const t = (this.turn + k) % this.order.length;
      const p = this.player(this.order[t]);
      if (!p.folded && (!p.acted || p.bet !== this.currentBet)) { this.turn = t; return; }
    }
    this.phase = 'showdown';
  }

  // cards: the play chosen from own hand + Table Cards (may be Table Cards only)
  choose(id, cards) {
    const p = this.player(id);
    const legal = cards.length && cards.every(c => p.hand.includes(c) || this.table.includes(c));
    p.play = legal ? { cards, hand: readHand(cards) } : bestPlay(p.hand, this.table);
  }

  showdown() {
    const still = this.inRound();
    let winners = [];
    if (still.length === 1) winners = still;
    else for (const p of still) {
      if (!p.play) this.choose(p.id, []);
      if (!winners.length) { winners = [p]; continue; }
      const c = compareHands(p.play.hand, winners[0].play.hand);
      if (c > 0) winners = [p]; else if (c === 0) winners.push(p);
    }
    // ties split; the odd unit goes to the tied player nearest the dealer's left
    winners.sort((a, b) => this.order.indexOf(a.id) - this.order.indexOf(b.id));
    const share = Math.floor(this.pot / winners.length);
    let odd = this.pot - share * winners.length;
    for (const w of winners) { w.cash += share + (odd-- > 0 ? 1 : 0); }
    const result = { winners: winners.map(w => w.id), pot: this.pot, uncontested: still.length === 1 };
    // played cards and Table Cards go to the discard pile; unplayed cards stay in hand
    for (const p of still) if (p.play) for (const c of p.play.cards) {
      const i = p.hand.indexOf(c);
      if (i >= 0) { p.hand.splice(i, 1); this.discard.push(c); }
    }
    this.discard.push(...this.table);
    this.phase = 'refill';
    return result;
  }

  // after the showdown each player may discard any hand cards face up
  refill(id, cards) {
    const p = this.player(id);
    for (const c of cards) {
      const i = p.hand.indexOf(c);
      if (i >= 0) { p.hand.splice(i, 1); this.discard.push(c); }
    }
  }

  endRound() {
    this.deck = shuffle([...this.deck, ...this.discard], this.rng);
    this.discard = [];
    this.table = [];
    const out = [];
    for (const p of this.live) if (p.cash <= 0) { p.active = false; out.push(p.id); this.deck.push(...p.hand); p.hand = []; }
    this.phase = this.round >= this.maxRounds || this.live.length <= 1 ? 'over' : 'between';
    return out;
  }
}

// ── house characters
// How often this play beats a random opposing hand of the same size, with the same Table Cards.
export function strength(game, play, samples = 60) {
  const seen = new Set([...play.cards, ...game.table].map(c => c.id));
  const unseen = newDeck().filter(c => !seen.has(c.id));
  let wins = 0;
  for (let s = 0; s < samples; s++) {
    const opp = bestPlay(shuffle([...unseen], game.rng).slice(0, game.handSize), game.table);
    if (compareHands(play.hand, opp.hand) >= 0) wins++;
  }
  return wins / samples;
}

export function chooseFrontierMove(game, id, style) {
  const me = game.player(id);
  const play = bestPlay(me.hand, game.table);
  const rivals = game.inRound().length - 1;
  const p = strength(game, play) ** Math.max(1, rivals * 0.8);
  const o = game.options(id);
  const tilt = { countess: -0.08, cowboy: 0.12, calculator: 0 }[style] ?? 0;
  const conf = p + tilt + (game.rng() - 0.5) * 0.12;
  const raisesSoFar = me.raises ?? 0;

  if (o.opening) {
    if (conf < 0.15 && style !== 'cowboy') return { action: 'fold' };
    const want = Math.round(o.maxRaise * (conf > 0.6 ? 0.5 : conf > 0.4 ? 0.3 : 0.15) * (style === 'cowboy' ? 1.5 : 1));
    return { action: 'raise', to: Math.min(o.maxRaise, Math.max(1, want)) };
  }
  const ev = conf * (game.pot + o.toCall) - o.toCall;
  if (ev < -0.5 && !(style === 'cowboy' && game.rng() < 0.3)) return { action: 'fold' };
  if (o.canRaise && raisesSoFar < 2 && conf > (style === 'cowboy' ? 0.45 : 0.65)) {
    me.raises = raisesSoFar + 1;
    return { action: 'raise', to: Math.min(o.maxRaise, game.currentBet + Math.max(1, Math.round(o.maxRaise * 0.25))) };
  }
  return { action: 'call' };
}

// After the showdown: keep cards that work together, let go of the strays.
export function chooseDiscards(game, id, style) {
  const me = game.player(id);
  if (me.hand.length < 2) return [];
  const core = bestPlay(me.hand, []).cards;
  const keepOdds = { countess: 0.6, cowboy: 0.3, calculator: 0 }[style] ?? 0.4;
  return me.hand.filter(c => !core.includes(c) && game.rng() > keepOdds);
}

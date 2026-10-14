// Fortuna — pure rules, no DOM.
// Ported from the classic table (fortuna.html): 12 arms, 3 rings, 3 rounds,
// one bet per arm per round, house fills the rest, two dice + sum, reflections.

export const NUMBERS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export class Fortuna {
  constructor(players, { base = 5, rounds = 3, rng = Math.random } = {}) {
    this.players = players.map(p => ({ ...p, active: true, betsThisRound: 0, totalBet: 0, totalWon: 0 }));
    this.base = base;
    this.maxRounds = rounds;
    this.rng = rng;
    this.round = 1;
    this.pot = 0;
    this.board = {};        // num -> [ring0Owner, ring1Owner, ring2Owner]
    this.eliminated = [];   // numbers that have been hit; permanent for the game
    this.phase = 'idle';    // idle | betting | filling | rolling | between | over
    this.passed = [];
    this.order = [];
    this.current = null;
  }

  get ring() { return this.round - 1; }
  get bet() { return this.base * 2 ** (this.round - 1); }
  get available() { return NUMBERS.filter(n => !this.eliminated.includes(n)); }
  player(id) { return this.players.find(p => p.id === id); }
  owner(num, ring = this.ring) { return this.board[num]?.[ring] ?? null; }

  randomStarter() {
    const active = this.players.filter(p => p.active);
    return active[Math.floor(this.rng() * active.length)].id;
  }

  startRound(starterId) {
    this.phase = 'betting';
    this.passed = [];
    this.players.forEach(p => { p.betsThisRound = 0; });
    const i = this.players.findIndex(p => p.id === starterId);
    this.order = this.players.map((_, k) => this.players[(i + k) % this.players.length].id);
    this.current = null;
    const first = this.order.find(id => this.player(id).active);
    if (first === undefined) this.phase = 'filling';
    else this.current = first;
  }

  canBet(id, num) {
    if (this.phase !== 'betting' || this.current !== id) return 'Not your turn.';
    if (this.eliminated.includes(num)) return `${num} is already out.`;
    if (this.owner(num) !== null) return `${num} is taken this round.`;
    if (this.player(id).cash < this.bet) return 'Not enough chips.';
    return null;
  }

  placeBet(id, num) {
    const reason = this.canBet(id, num);
    if (reason) return { ok: false, reason };
    if (!this.board[num]) this.board[num] = [null, null, null];
    const p = this.player(id);
    this.board[num][this.ring] = id;
    p.cash -= this.bet;
    p.betsThisRound++;
    p.totalBet += this.bet;
    this.pot += this.bet;
    this.advance();
    return { ok: true };
  }

  // Standing without a single bet this round removes you from the game ("must engage").
  pass(id) {
    if (this.phase !== 'betting' || this.current !== id) return { ok: false };
    const p = this.player(id);
    const eliminated = p.betsThisRound === 0;
    if (eliminated) p.active = false;
    this.passed.push(id);
    this.advance();
    return { ok: true, eliminated };
  }

  advance() {
    const at = this.order.indexOf(this.current);
    for (let k = 1; k <= this.order.length; k++) {
      const id = this.order[(at + k) % this.order.length];
      const p = this.player(id);
      if (p.active && !this.passed.includes(id)) { this.current = id; return; }
    }
    this.current = null;
    this.phase = 'filling';
  }

  fillHouse() {
    const filled = [];
    for (const n of this.available) {
      if (!this.board[n]) this.board[n] = [null, null, null];
      if (this.board[n][this.ring] === null) {
        this.board[n][this.ring] = 'house';
        this.pot += this.bet;
        filled.push(n);
      }
    }
    this.phase = 'rolling';
    return filled;
  }

  // A die value that is already out reflects forward by its own value until it lands or leaves the board.
  reflect(value) {
    const path = [value];
    let cur = value;
    while (this.eliminated.includes(cur)) {
      cur += value;
      if (cur > 12) return { target: null, path };
      path.push(cur);
    }
    return { target: cur, path };
  }

  hit(num) {
    this.eliminated.push(num);
    const owner = this.owner(num);
    const share = Math.floor(this.pot / 3);
    if (owner && owner !== 'house') {
      const p = this.player(owner);
      p.cash += share;
      p.totalWon += share;
    }
    return { owner, share };
  }

  rollDie() { return 1 + Math.floor(this.rng() * 6); }

  // Resolve one step of the roll. kind: 'die1' | 'die2' | 'sum'
  resolveDie(value) {
    const { target, path } = this.reflect(value);
    if (target === null) return { value, path, target: null };
    return { value, path, target, ...this.hit(target) };
  }

  resolveSum(sum) {
    if (this.eliminated.includes(sum)) return { value: sum, path: [sum], target: null, taken: true };
    return { value: sum, path: [sum], target: sum, ...this.hit(sum) };
  }

  endRound() {
    const liquidated = [];
    this.players.forEach(p => {
      if (p.active && p.cash <= 0) { p.active = false; liquidated.push(p.id); }
    });
    const anyActive = this.players.some(p => p.active);
    if (this.round >= this.maxRounds || this.eliminated.length >= 12 || !anyActive) {
      this.phase = 'over';
      return { over: true, liquidated };
    }
    this.round++;
    this.pot = 0;
    this.board = {};
    this.phase = 'between';
    return { over: false, liquidated };
  }
}

// ── House characters ─────────────────────────────────────────────

// Exact probability that `num` is hit during the coming roll, given what is already out.
export function hitProbability(eliminated, num) {
  let hits = 0;
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) {
    const out = new Set(eliminated);
    const land = v => { let c = v; while (out.has(c)) { c += v; if (c > 12) return null; } return c; };
    const t1 = land(a); if (t1 !== null) out.add(t1);
    const t2 = land(b); if (t2 !== null) out.add(t2);
    const t3 = out.has(a + b) ? null : a + b;
    if (t1 === num || t2 === num || t3 === num) hits++;
  }
  return hits / 36;
}

export const GUESTS = [
  { id: 'valeska', name: 'Countess Valeska', short: 'Valeska', mono: 'V', title: 'Old money, one bet, always seven', color: '#7a2a33', style: 'countess' },
  { id: 'calloway', name: 'Dutch Calloway', short: 'Calloway', mono: 'C', title: 'Oil man from Tulsa, plays big', color: '#b07a2a', style: 'cowboy' },
  { id: 'shen', name: 'Madame Shen', short: 'Shen', mono: 'S', title: 'Runs a fleet in Macau, does the math', color: '#2e4a6a', style: 'calculator' },
];

// Returns a number to bet on, or null to stand.
export function chooseMove(game, id) {
  const p = game.player(id);
  const open = game.available.filter(n => game.owner(n) === null);
  if (!open.length || p.cash < game.bet) return null;
  const must = p.betsThisRound === 0;
  const style = GUESTS.find(g => g.id === id)?.style;
  const byOdds = open
    .map(n => ({ n, p: hitProbability(game.eliminated, n) }))
    .sort((a, b) => b.p - a.p);

  if (style === 'countess') {
    if (!must) return null;
    return open.includes(7) ? 7 : byOdds[0].n;
  }
  if (style === 'cowboy') {
    if (!must && (p.betsThisRound >= 4 || game.rng() > 0.62)) return null;
    const big = open.filter(n => n >= 6);
    const pool = big.length ? big : open;
    return pool[Math.floor(game.rng() * pool.length)];
  }
  // calculator: bet while the expected share beats the stake (pot ≈ open arms × bet, split in three)
  const threshold = 3 / game.available.length;
  const good = byOdds.filter(o => o.p > threshold);
  if (must) return (good[0] || byOdds[0]).n;
  if (p.betsThisRound >= 3 || !good.length) return null;
  return good[0].n;
}

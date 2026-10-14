// Ricochet — pure rules, no DOM. Ported from the classic room (ricochet.html).
// Everyone buys in. On your turn the wheel spins; its six tiles show their faces for a moment,
// then turn face down. Drop the ball: a gap or a skull eliminates you, coins grow the pot,
// trinkets help. Last guest standing takes the pot, or challenges the house for three more spins.

export const BUY_IN = 5;
const TAU = Math.PI * 2;

export const TILES = {
  coin: { label: 'Coin', note: 'Safe. The bank adds to the pot.' },
  jackpot: { label: 'Jackpot', note: 'Safe. The bank adds double.' },
  skull: { label: 'Skull', note: 'Eliminated.' },
  heart: { label: 'Heart', note: 'An extra life, spent on the next fall.' },
  hourglass: { label: 'Hourglass', note: 'Your next spin turns at the slowest speed.' },
  glass: { label: 'Glass', note: 'True sight: you see through the covers from now on.' },
  ice: { label: 'Ice', note: 'Your tiles stay a round wider, for good.' },
};

export class Ricochet {
  constructor(players, { rng = Math.random } = {}) {
    this.players = players.map(p => ({ ...p, alive: true, inventory: [] }));
    this.rng = rng;
    this.pot = BUY_IN * players.length;
    this.round = 1;
    this.turn = 0;           // index into players
    this.phase = 'turn';     // turn | solo-choice | solo | over
    this.soloLeft = 0;
    this.winner = null;
  }

  get current() { return this.players[this.turn]; }
  get alive() { return this.players.filter(p => p.alive); }
  has(p, item) { return p.inventory.includes(item); }
  use(p, item) { p.inventory.splice(p.inventory.indexOf(item), 1); }

  reward(kind) { const base = 2 ** (this.round - 1); return kind === 'jackpot' ? base * 2 : base; }

  // The wheel for the current player's spin.
  spin() {
    const p = this.current;
    const neutral = this.round === 1 && this.phase === 'turn';
    let deaths = 0;
    if (!neutral) deaths = Math.min(3, Math.max(1, Math.floor(this.round / 3)));
    const types = Array(deaths).fill('skull');
    while (types.length < 6) {
      const r = this.rng();
      types.push(neutral ? 'coin'
        : r < 0.08 ? 'heart' : r < 0.16 ? 'hourglass' : r < 0.26 ? 'glass' : r < 0.36 ? 'ice'
          : r < 0.46 ? 'jackpot' : r < 0.58 ? 'skull' : 'coin');
    }
    for (let i = types.length - 1; i > 0; i--) { const j = Math.floor(this.rng() * (i + 1)); [types[i], types[j]] = [types[j], types[i]]; }

    const ice = p.inventory.filter(x => x === 'ice').length;
    const fill = Math.max(0.2, 0.7 - Math.max(0, this.round - ice) * 0.05);
    const slice = TAU / 6;
    const zones = types.map((type, i) => ({ type, start: i * slice, end: i * slice + slice * fill }));

    let speed = 3 + this.round * 0.3;          // radians per second
    let slowed = false;
    if (this.has(p, 'hourglass')) { this.use(p, 'hourglass'); speed = 3; slowed = true; }
    return { zones, speed, slowed, wider: ice, trueSight: this.has(p, 'glass') };
  }

  // Which tile (or gap) sits under the ball for a given wheel rotation.
  static under(zones, rotation) {
    let a = (Math.PI * 1.5 - rotation) % TAU;
    if (a < 0) a += TAU;
    return zones.find(z => a >= z.start && a <= z.end) ?? null;
  }

  resolve(zone) {
    const p = this.current;
    if (!zone || zone.type === 'skull') {
      if (this.has(p, 'heart')) { this.use(p, 'heart'); return { kind: 'saved', cause: zone ? 'skull' : 'gap' }; }
      p.alive = false;
      return { kind: 'dead', cause: zone ? 'skull' : 'gap' };
    }
    if (zone.type === 'coin' || zone.type === 'jackpot') {
      const amount = this.reward(zone.type);
      this.pot += amount;
      return { kind: zone.type, amount };
    }
    p.inventory.push(zone.type);
    return { kind: 'item', item: zone.type };
  }

  // Leaving before your spin: 25% of the pot, the house keeps the rest of your claim.
  leave() {
    const p = this.current;
    if (this.phase === 'solo') { const all = this.pot; this.claim(); return all; }
    const share = Math.floor(this.pot * 0.25);
    this.pot -= share;
    p.alive = false;
    p.cashOut = share;
    return share;
  }

  claim() {
    const p = this.alive[0];
    p.cashOut = (p.cashOut ?? 0) + this.pot;
    this.winner = p.id;
    this.pot = 0;
    this.phase = 'over';
  }

  challenge() { this.phase = 'solo'; this.soloLeft = 3; this.turn = this.players.indexOf(this.alive[0]); }

  // Move on after a spin (or a departure). Returns what happened to the table.
  advance() {
    const alive = this.alive;
    if (!alive.length) { this.phase = 'over'; return 'house'; }
    if (this.phase === 'solo') {
      if (!this.current.alive) { this.phase = 'over'; return 'house'; }
      this.soloLeft--; this.round++;
      if (this.soloLeft <= 0) { this.claim(); return 'won'; }
      return 'solo';
    }
    if (alive.length === 1) { this.phase = 'solo-choice'; this.turn = this.players.indexOf(alive[0]); return 'last'; }
    // a round ends when the turn wraps past the end of the table
    const before = this.turn;
    do { this.turn = (this.turn + 1) % this.players.length; } while (!this.players[this.turn].alive);
    if (this.turn <= before) this.round++;
    return 'next';
  }
}

// ── house characters
const AIM = { countess: 0.05, cowboy: 0.22, calculator: 0.07 };   // how far off their timing runs (s)

// When a guest drops the ball: aim for the best tile they saw before the covers came down.
export function planDrop(spin, rotationAt1s, style, rng = Math.random) {
  const rank = { jackpot: 5, coin: 4, heart: 4.5, glass: 3, ice: 3, hourglass: 2, skull: -9 };
  const best = [...spin.zones].sort((a, b) => (rank[b.type] ?? 0) - (rank[a.type] ?? 0))[0];
  const mid = (best.start + best.end) / 2;
  // rotation needed so that `mid` sits under the ball, at least 0.8 s after the covers fall
  let target = Math.PI * 1.5 - mid;
  const earliest = rotationAt1s + spin.speed * 0.8;
  while (target < earliest) target += TAU;
  const t = 1 + (target - rotationAt1s) / spin.speed;
  const noise = (rng() + rng() + rng() - 1.5) * (AIM[style] ?? 0.12);
  return Math.max(1.05, t + noise);
}

export function wantsToLeave(game, style, rng = Math.random) {
  if (game.phase !== 'turn' || game.round < 3) return false;
  const odds = { countess: game.pot >= 25 ? 0.35 : 0.05, cowboy: 0, calculator: game.round >= 5 && game.pot >= 30 ? 0.45 : 0.04 }[style] ?? 0;
  return rng() < odds;
}

export function soloChoice(game, style) {
  if (style === 'cowboy') return 'challenge';
  if (style === 'calculator') return game.pot >= 20 ? 'claim' : 'challenge';
  return game.pot >= 15 ? 'claim' : 'challenge';
}

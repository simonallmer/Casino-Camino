// The guest's purse. The house tops it up to the daily stake at dawn (06:00 local).
// Winnings above the stake are kept; losses stand until the next dawn.

const KEY = 'camino_purse_v1';
export const DAILY_STAKE = 100;
export const DAWN_HOUR = 6;

const listeners = new Set();

// The "casino day" starts at dawn, so 03:00 still belongs to yesterday.
function casinoDay(d = new Date()) {
  const shifted = new Date(d.getTime() - DAWN_HOUR * 3600e3);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}-${String(shifted.getDate()).padStart(2, '0')}`;
}

export function nextDawn(d = new Date()) {
  const n = new Date(d);
  n.setHours(DAWN_HOUR, 0, 0, 0);
  if (n <= d) n.setDate(n.getDate() + 1);
  return n;
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (raw && typeof raw.balance === 'number') return raw;
  } catch { /* fresh purse */ }
  return { balance: 0, day: null, ledger: [] };
}

let state = load();

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode: purse lives for the session */ }
  listeners.forEach(fn => fn(state));
}

function record(label, amount) {
  state.ledger.unshift({ t: Date.now(), label, amount });
  state.ledger = state.ledger.slice(0, 40);
}

export function checkDawn() {
  const today = casinoDay();
  if (state.day === today) return false;
  const credit = Math.max(0, DAILY_STAKE - state.balance);
  state.balance += credit;
  state.day = today;
  record(credit ? 'Credit from the house at dawn' : 'Dawn — purse already above the stake', credit);
  save();
  return true;
}

export const purse = {
  get balance() { return state.balance; },
  get ledger() { return state.ledger; },
  set(balance) { state.balance = Math.max(0, Math.round(balance)); save(); },
  record(label, amount) { record(label, amount); save(); },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
};

checkDawn();

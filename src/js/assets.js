// Assets come embedded in the built index.html (so it opens straight from disk),
// or are fetched from the repository when running the sources through a server.

const EMBED = window.__CAMINO_ASSETS || null;
let ROOT = null;
try { ROOT = new URL('../../', import.meta.url); } catch { /* opened from a snapshot: only embedded assets */ }

export async function assetText(path) {
  if (EMBED?.[path]) return EMBED[path];
  return (await fetch(new URL(encodeURI(path), ROOT))).text();
}

export async function assetBinary(path) {
  if (EMBED?.[path]) {
    const bin = atob(EMBED[path]), out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out.buffer;
  }
  return (await fetch(new URL(encodeURI(path), ROOT))).arrayBuffer();
}

export const SUIT_NAMES = ['spades', 'hearts', 'clubs', 'diamonds', 'star'];

let suitsPromise = null;
// The five American Playing Cards suits as Path2D in a 100×100 box.
export function loadSuits() {
  suitsPromise ??= Promise.all(SUIT_NAMES.map(async name => {
    const txt = await assetText(`American_Playing_Cards_Symbols/${name}.svg`);
    const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
    const p = new Path2D();
    doc.querySelectorAll('path').forEach(el => p.addPath(new Path2D(el.getAttribute('d'))));
    doc.querySelectorAll('circle').forEach(el => {
      const c = new Path2D();
      c.arc(+el.getAttribute('cx'), +el.getAttribute('cy'), +el.getAttribute('r'), 0, Math.PI * 2);
      p.addPath(c);
    });
    return [name, p];
  })).then(Object.fromEntries);
  return suitsPromise;
}

let quotesPromise = null;
// quotes.txt → { 'Section name': ['line', …] }
export function loadQuotes() {
  quotesPromise ??= assetText('quotes.txt').then(txt => {
    const out = {};
    let section = null;
    for (const raw of txt.split('\n')) {
      const line = raw.trim();
      if (line.startsWith('## ')) { section = line.slice(3).trim(); out[section] = []; }
      else if (line && !line.startsWith('#') && section) out[section].push(line);
    }
    return out;
  });
  return quotesPromise;
}

// Draws from a section without repeating until every line has been used.
const bags = {};
export function drawLine(quotes, section) {
  const all = quotes[section] || [];
  if (!all.length) return '';
  if (!bags[section]?.length) bags[section] = [...all].sort(() => Math.random() - 0.5);
  return bags[section].pop();
}

// Card art (American Playing Cards), suit in spades|clubs|hearts|diamonds|stars, rank 1–10 (10 = Cypher).
export function cardURL(suit, rank) {
  const path = `assets/cards/${suit}_${rank}.jpg`;
  if (EMBED?.[path]) return `data:image/jpeg;base64,${EMBED[path]}`;
  return ROOT ? new URL(encodeURI(path), ROOT).href : '';
}

// Any binary asset as a URL: embedded in the built page, or fetched from the repository.
const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };
export function assetURL(path) {
  if (EMBED?.[path]) return `data:${MIME[path.split('.').pop().toLowerCase()] || 'application/octet-stream'};base64,${EMBED[path]}`;
  return ROOT ? new URL(encodeURI(path), ROOT).href : '';
}

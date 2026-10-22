// What hangs on the walls and lies on the racks of the resort:
// the Allmer Journals in the reading room, and the works in the gallery.
// Covers come from the Kiosk; a journal whose cover is still coming gets a plain title cover.
// Gallery works are placeholders, painted in code, until real works are hung: give one an `image`
// (a path under assets/) and its own picture takes the placeholder's place.

import { assetURL } from './assets.js';

export const JOURNALS = [
  { id: 'world', name: 'Simon Allmer World', line: 'A visual diary from The Artist’s dangerous travels.', url: 'https://simonallmer.com/world', soon: true },
  { id: 'cosmographia', name: 'Cosmographia', line: 'The Universal Lexicon.', url: 'https://simonallmer.com/cosmographia', soon: true },
  { id: 'society-review', name: 'Society Review', line: 'Thought-provoking commentary on contemporary culture, politics and the economy.', url: 'https://simonallmer.com/societyreview', cover: 'assets/journals/society-review.jpg' },
  { id: 'chronicle', name: 'Chronicle: Years of Change', line: 'An odyssey through the defining moments of world history.', url: 'https://simonallmer.com/chronicle', cover: 'assets/journals/chronicle.jpg' },
  { id: 'american-chronicle', name: 'American Chronicle', line: 'The American volume of the Chronicle.', url: 'https://simonallmer.com/americanchronicle', cover: 'assets/journals/american-chronicle.jpg' },
  { id: 'enterpriser', name: 'Enterpriser', line: 'Insights and tools for those who build the future.', url: 'https://simonallmer.com/enterpriser', cover: 'assets/journals/enterpriser.jpg' },
];
export const JOURNAL_ASSETS = JOURNALS.map(j => j.cover).filter(Boolean);

const loadImage = src => new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = src; });

// A journal's cover as a canvas, 3:4. A cover still to come is set in the house's standard way:
// the imprint at the top, the title in the middle, "coming soon" at the foot.
export async function journalCover(j, W = 600) {
  const H = Math.round(W * 4 / 3), c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  if (j.cover) {
    const img = await loadImage(assetURL(j.cover));
    const s = Math.max(W / img.width, H / img.height);
    ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
    return c;
  }
  await document.fonts?.load('700 40px "Cinzel Decorative"').catch(() => {});
  ctx.fillStyle = '#16140f'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#c9a35a'; ctx.lineWidth = W * 0.005;
  ctx.strokeRect(W * 0.06, W * 0.06, W * 0.88, H - W * 0.12);
  ctx.fillStyle = '#efe3c4'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `500 ${W * 0.034}px Jost, sans-serif`;
  ctx.fillText('A L L M E R   J O U R N A L S', W / 2, H * 0.13);
  // the title, on as many lines as it needs
  const words = j.name.toUpperCase().split(' '), lines = [];
  ctx.font = `700 ${W * 0.1}px "Cinzel Decorative", serif`;
  for (const w of words) {
    const last = lines[lines.length - 1];
    if (last && ctx.measureText(`${last} ${w}`).width < W * 0.78) lines[lines.length - 1] = `${last} ${w}`; else lines.push(w);
  }
  // shrink a long word until it sits inside the frame
  const widest = Math.max(...lines.map(l => ctx.measureText(l).width));
  if (widest > W * 0.76) ctx.font = `700 ${W * 0.1 * (W * 0.76) / widest}px "Cinzel Decorative", serif`;
  lines.forEach((l, i) => ctx.fillText(l, W / 2, H * 0.5 + (i - (lines.length - 1) / 2) * W * 0.13));
  ctx.fillStyle = '#c9a35a'; ctx.fillRect(W * 0.44, H * 0.5 + lines.length * W * 0.075, W * 0.12, W * 0.004);
  ctx.font = `500 ${W * 0.03}px Jost, sans-serif`;
  ctx.fillText('C O M I N G   S O O N', W / 2, H * 0.87);
  return c;
}

// ── the gallery: works on loan to the house (for now, placeholders painted here)
export const ARTWORKS = [
  { title: 'Sea at Dusk', medium: 'Oil on canvas', w: 6, h: 4.2, paint: dusk },
  { title: 'Five Suits', medium: 'Gouache and gold leaf', w: 4, h: 5, paint: suits },
  { title: 'Night Harbour', medium: 'Oil on board', w: 6, h: 3.6, paint: harbour },
  { title: 'Study in Red and Green', medium: 'Acrylic on linen', w: 4.2, h: 5.4, paint: fields },
  { title: 'The Long Walk', medium: 'Ink and wash', w: 5.6, h: 4, paint: arches },
  { title: 'Fountain', medium: 'Watercolour', w: 4, h: 4, paint: fountain },
  { title: 'Mistral', medium: 'Oil on canvas', w: 6, h: 4, paint: mistral },
  { title: 'Portrait in Gold', medium: 'Tempera on panel', w: 3.8, h: 5.2, paint: portrait },
].map(a => ({ ...a, artist: 'Artist to be announced', placeholder: true }));

// A work as a canvas; `long` is the pixel size of its longer side.
export async function artworkCanvas(a, long = 900) {
  const W = Math.round(a.w >= a.h ? long : long * a.w / a.h), H = Math.round(a.h >= a.w ? long : long * a.h / a.w);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  if (a.image) {
    const img = await loadImage(assetURL(a.image));
    const s = Math.max(W / img.width, H / img.height);
    ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
  } else {
    let seed = [...a.title].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 2147483647, 7);
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    a.paint(ctx, W, H, rand);
    // brush texture over everything
    for (let i = 0; i < 1400; i++) {
      ctx.globalAlpha = 0.05; ctx.fillStyle = rand() < 0.5 ? '#000' : '#fff';
      ctx.fillRect(rand() * W, rand() * H, 2 + rand() * 18, 1 + rand() * 2);
    }
    ctx.globalAlpha = 1;
  }
  return c;
}

function dusk(ctx, W, H, rand) {
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
  sky.addColorStop(0, '#2c2a4a'); sky.addColorStop(0.6, '#c9655a'); sky.addColorStop(1, '#f2b36b');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.6);
  ctx.fillStyle = '#f7d79a'; ctx.beginPath(); ctx.arc(W * 0.62, H * 0.56, H * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1f3550'; ctx.fillRect(0, H * 0.6, W, H * 0.4);
  for (let i = 0; i < 90; i++) {
    const y = H * 0.62 + rand() * H * 0.38, x = rand() * W;
    ctx.fillStyle = rand() < 0.4 ? '#f2b36b' : '#3d5a78'; ctx.globalAlpha = 0.7;
    ctx.fillRect(x, y, 20 + rand() * 80, 2);
  }
  ctx.globalAlpha = 1;
}
function suits(ctx, W, H, rand) {
  ctx.fillStyle = '#1c2a3a'; ctx.fillRect(0, 0, W, H);
  const cols = ['#d6b066', '#7d1f24', '#efe3c4', '#245848', '#d6b066'];
  for (let k = 0; k < 5; k++) {
    const x = W * (0.2 + (k % 3) * 0.3), y = H * (0.25 + Math.floor(k / 3) * 0.45) + (k > 2 ? 0 : 0);
    ctx.fillStyle = cols[k]; ctx.beginPath();
    for (let i = 0; i < 12; i++) { const r = i % 2 ? W * 0.05 : W * 0.11, a = -Math.PI / 2 + (i * Math.PI) / 6; ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); }
    ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = '#d6b066'; ctx.lineWidth = 4; ctx.strokeRect(W * 0.05, H * 0.04, W * 0.9, H * 0.92);
}
function harbour(ctx, W, H, rand) {
  ctx.fillStyle = '#0d1a2b'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#16263a'; ctx.beginPath(); ctx.moveTo(0, H * 0.55);
  for (let x = 0; x <= W; x += W / 12) ctx.lineTo(x, H * (0.3 + rand() * 0.2));
  ctx.lineTo(W, H * 0.6); ctx.lineTo(0, H * 0.6); ctx.fill();
  for (let i = 0; i < 160; i++) { ctx.fillStyle = rand() < 0.7 ? '#f6c56f' : '#fff4d6'; ctx.fillRect(rand() * W, H * (0.32 + rand() * 0.27), 3, 3); }
  for (let i = 0; i < 70; i++) { ctx.fillStyle = '#f6c56f'; ctx.globalAlpha = 0.35; ctx.fillRect(rand() * W, H * (0.62 + rand() * 0.36), 10 + rand() * 40, 2); }
  ctx.globalAlpha = 1;
}
function fields(ctx, W, H) {
  ctx.fillStyle = '#3a1418'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#b3262f'; ctx.fillRect(W * 0.08, H * 0.06, W * 0.84, H * 0.48);
  ctx.fillStyle = '#1e6b4a'; ctx.fillRect(W * 0.08, H * 0.6, W * 0.84, H * 0.34);
}
function arches(ctx, W, H) {
  ctx.fillStyle = '#efe7d6'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#2b251d'; ctx.lineWidth = 3;
  for (let k = 0; k < 7; k++) {
    const s = 1 - k * 0.13, w = W * 0.5 * s, h = H * 0.8 * s, x = W / 2, y = H * 0.9 - k * H * 0.05;
    ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - h + w / 2); ctx.arc(x, y - h + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w / 2, y); ctx.stroke();
  }
  ctx.fillStyle = '#c99a3b'; ctx.globalAlpha = 0.35; ctx.fillRect(W * 0.46, H * 0.3, W * 0.08, H * 0.6); ctx.globalAlpha = 1;
}
function fountain(ctx, W, H) {
  ctx.fillStyle = '#e8eef0'; ctx.fillRect(0, 0, W, H);
  for (let r = W * 0.45; r > 6; r -= W * 0.04) { ctx.strokeStyle = r % 3 > 1.5 ? '#2f6fb0' : '#86b4c2'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2); ctx.stroke(); }
}
function mistral(ctx, W, H, rand) {
  ctx.fillStyle = '#d9c9a3'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) {
    ctx.strokeStyle = ['#7b8f6a', '#3f5a6b', '#b8913f', '#efe7d6'][i % 4]; ctx.lineWidth = 3 + rand() * 6; ctx.globalAlpha = 0.7;
    const y = rand() * H; ctx.beginPath(); ctx.moveTo(-20, y);
    ctx.bezierCurveTo(W * 0.3, y - 80 * rand(), W * 0.6, y + 80 * rand(), W + 20, y - 40 + 80 * rand()); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function portrait(ctx, W, H) {
  ctx.fillStyle = '#2a1f14'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * 0.4, 10, W / 2, H * 0.4, W * 0.5);
  g.addColorStop(0, '#f0cf7a'); g.addColorStop(1, '#8a6420');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(W / 2, H * 0.4, W * 0.2, H * 0.17, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(W / 2, H * 0.86, W * 0.36, H * 0.26, 0, Math.PI, 0); ctx.fill();
}

// ── The Horse in Motion, after Muybridge (1878): the first photographs to show a galloping horse
// with all four hooves off the ground. Drawn here as a strip of frames, sepia, on his numbered backdrop.
// The lift shows one frame at a time, chosen by its height, so the horse runs only while you ride.
export const HORSE_FRAMES = 12;
// style 'plate': sepia photographic plates; 'ink': white silhouettes on clear, to be tinted with the house's ink
export function horseInMotion(fw = 320, fh = 240, style = 'plate') {
  const ink = style === 'ink', BODY = ink ? '#fff' : '#2e2116', FAR = ink ? 'rgba(255,255,255,0.5)' : '#5c4630';
  const n = HORSE_FRAMES, c = document.createElement('canvas'); c.width = fw * n; c.height = fh;
  const ctx = c.getContext('2d');
  // each leg: where it hangs from the body, when its stride starts, and which way its lower joint folds
  const LEGS = [
    { x: 104, off: 0.08, fold: 1, far: true }, { x: 112, off: 0.0, fold: 1, far: false },     // hind
    { x: 184, off: 0.53, fold: -1, far: true }, { x: 192, off: 0.45, fold: -1, far: false },  // fore
  ];
  const STANCE = 0.32, UP = 40, LOW = 44, GROUND = 196;
  for (let f = 0; f < n; f++) {
    const t = f / n;
    ctx.save(); ctx.translate(f * fw, 0); ctx.scale(fw / 320, fh / 240);
    // the plate: sepia, a vignette, the numbered lines of the backdrop (in ink, just the ground)
    if (ink) { ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(10, GROUND + 6, 300, 2); }
    else {
    ctx.fillStyle = '#e8dbbf'; ctx.fillRect(0, 0, 320, 240);
    const vg = ctx.createRadialGradient(160, 120, 60, 160, 120, 200);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(70,45,20,0.35)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, 320, 240);
    ctx.strokeStyle = 'rgba(70,50,30,0.35)'; ctx.lineWidth = 1;
    for (let x = 20; x < 320; x += 24) { ctx.beginPath(); ctx.moveTo(x, 18); ctx.lineTo(x, GROUND); ctx.stroke(); }
    ctx.fillStyle = 'rgba(70,50,30,0.55)'; ctx.font = '9px Jost, sans-serif'; ctx.textAlign = 'center';
    for (let x = 20, k = 1; x < 320; x += 24, k++) ctx.fillText(String(k), x, 14);
    ctx.fillStyle = 'rgba(70,50,30,0.3)'; ctx.fillRect(0, GROUND, 320, 240 - GROUND);
    }
    // the legs: on the ground they sweep back straight; in the air they fold and swing forward
    const legAt = L => {
      const p = (t + L.off) % 1;
      if (p < STANCE) { const s = p / STANCE; return { a: 0.42 - s * 0.95, bend: 0.12 }; }
      const s = (p - STANCE) / (1 - STANCE);
      return { a: -0.53 + s * 0.95 + Math.sin(s * Math.PI) * 0.25, bend: 0.25 + Math.sin(s * Math.PI) * 1.25 };
    };
    // the body rides highest when every hoof is up
    const air = LEGS.every(L => (t + L.off) % 1 >= STANCE);
    const lift = 4 * Math.sin(t * Math.PI * 4) + (air ? 6 : 0);
    const by = GROUND - UP - LOW - 17 - lift;
    const leg = (L, col) => {
      const { a, bend } = legAt(L), hx = L.x, hy = by + 22;
      const kx = hx + Math.sin(a) * UP, ky = hy + Math.cos(a) * UP;
      const b = a + L.fold * bend, fx = kx + Math.sin(b) * LOW, fy = ky + Math.cos(b) * LOW;
      ctx.strokeStyle = col; ctx.lineCap = 'round';
      ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.stroke();
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
      ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + 4, fy + 3); ctx.stroke();
    };
    LEGS.filter(L => L.far).forEach(L => leg(L, FAR));
    ctx.fillStyle = BODY;
    // body, neck and head, tail streaming
    ctx.beginPath(); ctx.ellipse(150, by + 6, 64, 25, -0.04, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(186, by - 6); ctx.quadraticCurveTo(214, by - 34, 236, by - 48); ctx.lineTo(250, by - 34);
    ctx.quadraticCurveTo(226, by - 10, 212, by + 14); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(232, by - 52); ctx.quadraticCurveTo(262, by - 46, 278, by - 26); ctx.lineTo(270, by - 18);
    ctx.quadraticCurveTo(252, by - 26, 238, by - 30); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(236, by - 50); ctx.lineTo(240, by - 62); ctx.lineTo(244, by - 50); ctx.fill();
    ctx.strokeStyle = BODY; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(90, by - 4); ctx.quadraticCurveTo(66, by + 2 + Math.sin(t * Math.PI * 2) * 6, 50, by + 18); ctx.stroke();
    // the jockey, crouched
    ctx.fillStyle = BODY;
    ctx.beginPath(); ctx.ellipse(162, by - 24, 9, 16, 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(176, by - 40, 6, 0, Math.PI * 2); ctx.fill();
    LEGS.filter(L => !L.far).forEach(L => leg(L, BODY));
    // the plate's edge and its number
    if (!ink) {
    ctx.strokeStyle = 'rgba(40,28,16,0.8)'; ctx.lineWidth = 6; ctx.strokeRect(3, 3, 314, 234);
    ctx.fillStyle = 'rgba(40,28,16,0.85)'; ctx.font = '600 13px Jost, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(String(f + 1), 306, 228);
    }
    ctx.restore();
  }
  return c;
}

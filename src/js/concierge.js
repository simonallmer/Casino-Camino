// Monsieur Auguste Bellamy, concierge of the Casino Camino (the name is a placeholder).
// Tailcoat, dove-grey waistcoat, the golden crossed keys of his trade on both lapels,
// one hand held out in welcome. A paper figure like the others: ink until touched.

import { paperFigure, P, ell, circ } from './figure.js';

const SKIN = '#efc39f', HAIR = '#2a211c', COAT = '#1d1b22', VEST = '#8c8a86', SHIRT = '#f6f2ea', GOLD = '#d6b066';

// a key, its bow at the top, standing on (0, 0) and turned by deg
function key(cx, cy, deg) {
  const k = new Path2D();
  k.addPath(circ(0, -15, 6));
  k.rect(-1.6, -10, 3.2, 26);
  k.rect(1.6, 9, 5, 2.6);
  k.rect(1.6, 13.4, 4, 2.6);
  const p = new Path2D();
  p.addPath(k, new DOMMatrix().translate(cx, cy).rotate(deg));
  return p;
}
const crossedKeys = (x, y) => { const p = new Path2D(); p.addPath(key(x, y, -32)); p.addPath(key(x, y, 32)); return p; };

function figure() {
  return [
    // tails and trousers, mostly behind the desk
    { color: COAT, shade: true, path: P('M 190 620 L 410 620 L 426 1080 L 330 1084 L 300 860 L 270 1084 L 174 1080 Z') },
    { color: '#2e2622', path: P('M 200 1078 L 286 1080 Q 290 1110 278 1124 L 190 1126 Q 176 1120 184 1104 Z') },
    { color: '#2e2622', path: P('M 314 1080 L 400 1078 L 416 1104 Q 424 1120 410 1126 L 322 1124 Q 310 1110 314 1080 Z') },
    // ears, neck, wing collar
    { color: SKIN, path: ell(246, 246, 10, 15) },
    { color: SKIN, path: ell(354, 246, 10, 15) },
    { color: SKIN, path: P('M 276 280 L 324 280 L 326 334 L 274 334 Z') },
    // the welcoming arm, held out to the side, palm up
    { color: COAT, shade: true, path: P('M 206 352 Q 166 380 150 440 Q 140 478 112 500 L 134 532 Q 176 506 190 470 Q 206 426 236 400 Z') },
    { color: SHIRT, path: P('M 104 494 L 128 486 L 142 520 L 118 530 Z') },
    { color: SKIN, path: P('M 84 512 Q 96 492 120 496 Q 138 504 132 522 Q 116 536 92 530 Q 76 526 84 512 Z') },
    // shirt, waistcoat, coat
    { color: SHIRT, path: P('M 268 326 L 332 326 L 320 476 L 280 476 Z') },
    { color: VEST, path: P('M 252 350 L 282 476 L 318 476 L 348 350 L 354 626 Q 300 640 246 626 Z') },
    { color: COAT, shade: true, path: P('M 198 350 Q 236 330 264 334 L 290 520 L 262 640 L 184 640 Q 186 470 198 350 Z') },
    { color: COAT, shade: true, path: P('M 402 350 Q 364 330 336 334 L 310 520 L 338 640 L 416 640 Q 414 470 402 350 Z') },
    // the other arm, resting toward the desk
    { color: COAT, shade: true, path: P('M 398 352 Q 434 380 438 470 L 440 610 L 396 614 Q 394 500 384 420 Z') },
    { color: SHIRT, path: P('M 394 600 L 442 596 L 444 624 L 394 628 Z') },
    { color: SKIN, path: ell(418, 650, 24, 22) },
    // bow tie and the keys of his trade
    { color: COAT, path: P('M 300 334 L 272 320 Q 264 334 272 348 Z M 300 334 L 328 320 Q 336 334 328 348 Z') },
    { color: COAT, path: circ(300, 334, 6) },
    { color: GOLD, path: crossedKeys(242, 410) },
    { color: GOLD, path: crossedKeys(358, 410) },
    // head
    { color: SKIN, path: ell(300, 236, 52, 64) },
    { color: '#e6a58f', path: circ(268, 262, 11), noInk: true },
    { color: '#e6a58f', path: circ(332, 262, 11), noInk: true },
    { color: HAIR, path: P('M 246 222 Q 242 160 300 150 Q 358 160 354 222 Q 344 188 300 184 Q 258 188 246 222 Z') },
    { color: '#a39d93', path: ell(251, 222, 7, 14), noInk: true },
    { color: '#a39d93', path: ell(349, 222, 7, 14), noInk: true },
    { color: HAIR, path: P('M 268 280 Q 300 266 332 280 Q 318 292 300 286 Q 282 292 268 280 Z') },
  ];
}

const DETAILS = [
  'M 270 214 Q 282 206 294 212', 'M 306 212 Q 318 206 330 214',   // brows
  'M 300 240 Q 295 258 303 264',                                  // nose
  'M 284 298 Q 300 306 316 298',                                  // a courteous smile
  'M 282 314 Q 300 322 318 314',                                  // chin
  'M 286 334 L 278 352', 'M 314 334 L 322 352',                    // wing collar
  'M 300 860 L 300 1080',                                         // trouser crease
  'M 255 166 Q 280 158 300 162', 'M 300 162 Q 322 158 345 168',    // combed hair
];

export function createConcierge() {
  return paperFigure({
    parts: figure(), details: DETAILS, seed: 1906, height: 7.3,
    extra: ic => {
      ic.fillStyle = '#fff';
      for (const x of [284, 316]) { ic.beginPath(); ic.ellipse(x, 234, 4.5, 5, 0, 0, Math.PI * 2); ic.fill(); }
      for (let y = 500; y < 620; y += 30) { ic.beginPath(); ic.arc(300, y, 5, 0, Math.PI * 2); ic.stroke(); }
    },
  });
}

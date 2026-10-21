// Miss Vivienne Sterling, Keeper of the Coin. She stands at the coin desk by the entrance to the
// casino floor, in a cashier's green visor, holding one of the coins up to the light.
// A paper figure like Mr. Thistlewood: ink until touched, then painted.

import { paperFigure, P, ell, circ } from './figure.js';

// the coin's six-pointed star, with a ball at every tip
export function sheriffStar(cx, cy, R, ball) {
  const p = new Path2D();
  for (let k = 0; k < 12; k++) {
    const r = k % 2 ? R * 0.54 : R, a = -Math.PI / 2 + (k * Math.PI) / 6;
    k ? p.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : p.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  p.closePath();
  for (let k = 0; k < 6; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / 3;
    p.addPath(circ(cx + Math.cos(a) * (R + ball * 0.4), cy + Math.sin(a) * (R + ball * 0.4), ball));
  }
  return p;
}

const SKIN = '#efc39f', HAIR = '#2a1d17', BLOUSE = '#f6f1e6', VEST = '#1f4a3d', SKIRT = '#1c2a3a';
const RED = '#7d1f24', GOLD = '#d6b066', SILVER = '#cdd2d8';

function figure() {
  return [
    // the bob, behind everything above the shoulders
    { color: HAIR, path: P('M 224 304 Q 202 200 244 148 Q 300 104 356 148 Q 398 200 376 304 Q 362 322 344 308 L 256 308 Q 238 322 224 304 Z') },
    { color: SKIN, path: P('M 280 268 L 320 268 L 322 342 L 278 342 Z') },
    // skirt and shoes (mostly behind the desk)
    { color: SKIRT, shade: true, path: P('M 232 592 L 368 592 Q 400 840 414 1084 L 186 1084 Q 200 840 232 592 Z') },
    { color: '#2e2622', path: P('M 226 1080 L 278 1080 Q 282 1110 270 1124 L 206 1126 Q 192 1120 200 1106 Z') },
    { color: '#2e2622', path: P('M 322 1080 L 374 1080 L 400 1106 Q 408 1120 394 1126 L 330 1124 Q 318 1110 322 1080 Z') },
    // the arm at her side
    { color: BLOUSE, path: P('M 216 344 Q 180 360 172 422 Q 164 500 170 592 L 214 596 Q 210 500 224 422 Z') },
    { color: RED, path: P('M 174 444 Q 196 452 220 444 L 218 466 Q 196 474 172 466 Z') },
    { color: SKIN, path: ell(192, 620, 22, 27) },
    // blouse, waistcoat, sash
    { color: BLOUSE, path: P('M 238 330 Q 300 352 362 330 L 392 350 Q 398 470 374 600 L 226 600 Q 202 470 208 350 Z') },
    { color: VEST, shade: true, path: P('M 240 338 L 296 474 L 296 606 L 226 606 Q 212 480 214 362 Z') },
    { color: VEST, shade: true, path: P('M 360 338 L 304 474 L 304 606 L 374 606 Q 388 480 386 362 Z') },
    { color: GOLD, path: P('M 224 588 L 376 588 L 378 612 L 222 612 Z') },
    { color: RED, path: P('M 300 346 L 266 328 Q 256 346 266 364 Z M 300 346 L 334 328 Q 344 346 334 364 Z') },
    { color: RED, path: circ(300, 346, 8) },
    // the house badge: the coin's own star
    { color: GOLD, path: sheriffStar(254, 428, 22, 4.5) },
    // the arm raised, showing a coin
    { color: BLOUSE, path: P('M 376 340 Q 432 358 454 428 Q 464 470 442 484 Q 414 488 404 458 Q 394 412 370 398 Z') },
    { color: RED, path: P('M 402 392 Q 424 380 446 400 L 438 420 Q 418 404 396 414 Z') },
    { color: BLOUSE, path: P('M 420 474 Q 468 462 488 400 L 498 326 L 456 322 Q 452 390 418 432 Z') },
    { color: SILVER, path: circ(478, 256, 31) },
    { color: GOLD, path: sheriffStar(478, 256, 15, 3) },
    { color: SKIN, path: ell(477, 302, 19, 23) },
    // face
    { color: SKIN, path: ell(300, 232, 50, 62) },
    { color: '#e59a8a', path: circ(270, 258, 12), noInk: true },
    { color: '#e59a8a', path: circ(330, 258, 12), noInk: true },
    { color: '#a8343a', path: P('M 284 273 Q 300 264 316 273 Q 300 286 284 273 Z') },
    { color: GOLD, path: circ(250, 276, 6) },
    { color: GOLD, path: circ(350, 276, 6) },
    // fringe, and the cashier's green eyeshade over it
    { color: HAIR, path: P('M 250 202 Q 262 162 300 158 Q 346 160 352 206 Q 326 186 296 192 Q 270 190 250 202 Z') },
    { color: '#2f7a5b', path: P('M 236 196 Q 300 166 364 196 Q 386 214 372 228 Q 300 198 228 228 Q 214 214 236 196 Z') },
  ];
}

const DETAILS = [
  'M 274 238 Q 282 231 292 238', 'M 308 238 Q 318 231 326 238',   // lids
  'M 300 242 Q 295 255 302 259',                                  // nose
  'M 284 273 Q 300 278 316 273',                                  // lips parted in a half smile
  'M 280 336 L 290 354', 'M 320 336 L 310 354',                    // collar points
  'M 270 640 Q 262 860 250 1078', 'M 330 640 Q 338 860 350 1078', 'M 300 652 L 300 1078', // skirt pleats
  'M 248 168 Q 236 190 238 214', 'M 352 168 Q 364 190 362 214',   // finger waves in the bob
  'M 230 250 Q 238 270 232 296', 'M 370 250 Q 362 270 368 296',
];

export function createKeeper() {
  return paperFigure({
    parts: figure(), details: DETAILS, seed: 2028, height: 7.3,
    extra: ic => {
      // her eyes, the waistcoat buttons and the rim of the coin she holds
      ic.fillStyle = '#fff';
      for (const x of [283, 317]) { ic.beginPath(); ic.ellipse(x, 239, 4.5, 5, 0, 0, Math.PI * 2); ic.fill(); }
      for (let y = 500; y < 590; y += 28) { ic.beginPath(); ic.arc(300, y, 5, 0, Math.PI * 2); ic.stroke(); }
      ic.lineWidth = 2; ic.beginPath(); ic.arc(478, 256, 24, 0, Math.PI * 2); ic.stroke();
    },
  });
}

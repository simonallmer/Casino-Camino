// Guests in the resort lobby: paper figures like the house's own people. Names are placeholders,
// and so are their lines until their conversations are written.

import { paperFigure, P, ell, circ } from './figure.js';

const GOLD = '#d6b066', PEARL = '#f3efe6';

// Ms. Amara Okafor: an emerald evening gown, gold at her ears and throat, a clutch in one hand
function amara() {
  const SKIN = '#6e4532', HAIR = '#1c1410', GOWN = '#1f6b4f';
  return {
    parts: [
      { color: HAIR, path: circ(300, 142, 38) },
      { color: SKIN, path: P('M 282 272 L 318 272 L 320 330 L 280 330 Z') },
      { color: GOWN, shade: true, path: P('M 236 344 Q 300 332 364 344 L 370 604 Q 418 880 444 1132 L 156 1132 Q 182 880 230 604 Z') },
      { color: SKIN, path: P('M 226 330 Q 300 316 374 330 L 376 354 Q 300 346 224 354 Z') },
      { color: SKIN, path: P('M 232 340 Q 204 362 198 444 Q 194 520 202 580 L 226 578 Q 222 500 238 424 Z') },
      { color: GOLD, path: P('M 188 572 L 238 568 L 242 602 L 190 606 Z') },
      { color: SKIN, path: P('M 368 340 Q 398 362 404 430 Q 408 484 382 522 L 362 510 Q 380 470 374 422 Z') },
      { color: GOWN, path: P('M 232 600 Q 300 620 368 600 L 366 640 Q 300 656 234 640 Z') },
      { color: SKIN, path: ell(300, 230, 47, 60) },
      { color: HAIR, path: P('M 252 214 Q 256 168 300 164 Q 344 168 348 214 Q 330 190 300 192 Q 270 190 252 214 Z') },
      { color: '#7a2a2a', path: P('M 284 270 Q 300 262 316 270 Q 300 282 284 270 Z') },
      { color: GOLD, path: circ(252, 262, 7) }, { color: GOLD, path: circ(348, 262, 7) },
      { color: GOLD, path: P('M 270 318 Q 300 340 330 318 L 332 324 Q 300 348 268 324 Z') },
    ],
    details: ['M 274 232 Q 284 226 294 232', 'M 306 232 Q 316 226 326 232', 'M 300 236 Q 296 252 302 256', 'M 284 270 Q 300 274 316 270', 'M 300 660 Q 290 900 280 1128', 'M 330 660 Q 350 900 372 1128'],
    eyes: [[284, 236], [316, 236]],
  };
}

// Mr. Kenji Watanabe: a white dinner jacket, a black tie, a glass of champagne raised
function kenji() {
  const SKIN = '#e6c29a', HAIR = '#16120f', JACKET = '#f1ebde', BLACK = '#1d1b22';
  return {
    parts: [
      { color: BLACK, shade: true, path: P('M 236 600 L 364 600 L 380 1080 L 312 1084 L 300 820 L 288 1084 L 220 1080 Z') },
      { color: '#2e2622', path: P('M 214 1078 L 290 1080 Q 292 1110 280 1124 L 200 1126 Q 188 1118 196 1104 Z') },
      { color: '#2e2622', path: P('M 310 1080 L 386 1078 L 404 1104 Q 412 1118 400 1126 L 320 1124 Q 308 1110 310 1080 Z') },
      { color: SKIN, path: P('M 280 270 L 320 270 L 322 334 L 278 334 Z') },
      { color: '#ffffff', path: P('M 266 330 L 334 330 L 320 470 L 280 470 Z') },
      { color: JACKET, path: P('M 204 350 Q 240 330 266 334 L 292 520 L 266 640 L 194 636 Q 194 470 204 350 Z') },
      { color: JACKET, path: P('M 396 350 Q 360 330 334 334 L 308 520 L 334 640 L 406 636 Q 406 470 396 350 Z') },
      { color: BLACK, path: P('M 266 334 L 292 520 L 280 470 Z M 334 334 L 308 520 L 320 470 Z') },
      { color: JACKET, path: P('M 204 352 Q 170 380 166 460 Q 162 540 172 600 L 214 602 Q 210 520 220 440 Z') },
      { color: SKIN, path: ell(192, 624, 21, 25) },
      // the arm raising the glass
      { color: JACKET, path: P('M 392 350 Q 446 370 458 440 Q 462 480 438 488 Q 414 488 408 460 Q 400 420 380 404 Z') },
      { color: JACKET, path: P('M 420 470 Q 466 456 478 396 L 484 340 L 446 336 Q 446 396 418 432 Z') },
      { color: SKIN, path: ell(466, 326, 18, 22) },
      { color: '#efd889', path: P('M 456 248 L 476 248 L 472 292 L 460 292 Z') },
      { color: BLACK, path: P('M 300 336 L 272 322 Q 264 336 272 350 Z M 300 336 L 328 322 Q 336 336 328 350 Z') },
      { color: SKIN, path: ell(300, 230, 48, 60) },
      { color: HAIR, path: P('M 250 222 Q 246 164 300 156 Q 356 164 352 224 Q 336 180 296 186 Q 262 192 250 222 Z') },
    ],
    details: [
      'M 272 214 Q 284 208 294 214', 'M 306 214 Q 318 208 328 214', 'M 300 238 Q 296 254 302 258', 'M 286 280 Q 300 290 316 280',
      'M 466 292 L 466 318', 'M 456 248 L 476 248',
    ],
    eyes: [[284, 232], [316, 232]],
    extra: ic => { ic.lineWidth = 2.2; for (const x of [284, 316]) { ic.beginPath(); ic.arc(x, 232, 13, 0, Math.PI * 2); ic.stroke(); } ic.beginPath(); ic.moveTo(297, 232); ic.lineTo(303, 232); ic.stroke(); },
  };
}

// Ms. Mei Lin: a tailored navy suit, pearls, a fan of cards in her hand
function mei() {
  const SKIN = '#ecc6a2', HAIR = '#141010', SUIT = '#1f2c4a';
  return {
    parts: [
      { color: HAIR, path: P('M 236 296 Q 222 196 256 156 Q 300 126 344 156 Q 378 196 364 296 Q 350 310 336 300 L 264 300 Q 250 310 236 296 Z') },
      { color: SKIN, path: P('M 282 270 L 318 270 L 320 334 L 280 334 Z') },
      { color: SUIT, shade: true, path: P('M 238 600 L 362 600 Q 380 760 386 860 L 214 860 Q 220 760 238 600 Z') },
      { color: SKIN, path: P('M 236 858 L 282 858 Q 286 980 276 1100 L 242 1100 Q 234 980 236 858 Z') },
      { color: SKIN, path: P('M 318 858 L 364 858 Q 366 980 358 1100 L 324 1100 Q 314 980 318 858 Z') },
      { color: '#2e2622', path: P('M 232 1096 L 280 1096 Q 284 1120 272 1130 L 214 1130 Q 206 1120 232 1096 Z') },
      { color: '#2e2622', path: P('M 320 1096 L 368 1096 Q 394 1120 386 1130 L 328 1130 Q 316 1120 320 1096 Z') },
      { color: PEARL, path: P('M 270 330 L 330 330 L 316 420 L 284 420 Z') },
      { color: SUIT, shade: true, path: P('M 210 348 Q 244 330 270 334 L 296 520 L 272 620 L 204 618 Q 202 470 210 348 Z') },
      { color: SUIT, shade: true, path: P('M 390 348 Q 356 330 330 334 L 304 520 L 328 620 L 396 618 Q 398 470 390 348 Z') },
      { color: SUIT, shade: true, path: P('M 210 352 Q 178 380 174 460 Q 170 540 178 596 L 216 598 Q 212 520 224 440 Z') },
      { color: SKIN, path: ell(196, 620, 19, 23) },
      // the hand fanning out its cards
      { color: SUIT, shade: true, path: P('M 386 352 Q 430 380 436 450 Q 438 490 412 500 L 392 480 Q 408 448 396 410 Z') },
      { color: SKIN, path: ell(408, 500, 18, 16) },
      { color: '#f6f2ea', path: P('M 392 494 L 380 440 L 398 434 L 408 488 Z') },
      { color: '#f6f2ea', path: P('M 400 492 L 404 436 L 422 438 L 414 492 Z') },
      { color: '#f6f2ea', path: P('M 408 494 L 428 444 L 444 452 L 420 498 Z') },
      { color: '#7d1f24', path: circ(412, 448, 4), noInk: true },
      { color: SKIN, path: ell(300, 232, 46, 58) },
      { color: HAIR, path: P('M 252 206 Q 262 164 300 162 Q 340 164 348 206 Q 330 196 300 198 Q 270 196 252 206 Z') },
      { color: '#a83a40', path: P('M 286 270 Q 300 262 314 270 Q 300 280 286 270 Z') },
      { color: PEARL, path: (() => { const p = new Path2D(); for (let k = 0; k < 13; k++) { const a = Math.PI * (0.15 + 0.7 * k / 12); p.addPath(circ(300 + Math.cos(a) * 30, 318 + Math.sin(a) * 22, 4.2)); } return p; })() },
    ],
    details: ['M 274 230 Q 284 224 294 230', 'M 306 230 Q 316 224 326 230', 'M 300 236 Q 296 250 302 254', 'M 286 270 Q 300 274 314 270', 'M 300 600 L 300 858'],
    eyes: [[284, 234], [316, 234]],
  };
}

export const GUESTS = [
  { name: 'Ms. Amara Okafor', line: 'She raises her clutch in a small salute, as if you had met before.', make: amara, height: 7.5, at: [36.6, 0, -12.8] },
  { name: 'Mr. Kenji Watanabe', line: 'He lifts his glass to you: later, it says, there will be a story.', make: kenji, height: 7.4, at: [39, 0, -15] },
  { name: 'Ms. Mei Lin', line: 'She fans her cards, closes them, and smiles: not yet.', make: mei, height: 7.1, at: [35, 0, -26] },
];

export function createGuests() {
  return GUESTS.map((g, i) => {
    const f = g.make();
    const fig = paperFigure({
      parts: f.parts, details: f.details, seed: 300 + i, height: g.height,
      extra: ic => {
        ic.fillStyle = '#fff';
        for (const [x, y] of f.eyes) { ic.beginPath(); ic.ellipse(x, y, 4.5, 5, 0, 0, Math.PI * 2); ic.fill(); }
        f.extra?.(ic);
      },
    });
    fig.mesh.position.set(...g.at);
    return { ...fig, name: `guest-${i}`, guest: g };
  });
}

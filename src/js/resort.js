// The Casino Camino as an integrated resort: everything that is not the casino itself.
//
//            ┌──────────────── Theater (z −112 … −196) ────────────────┐
//            │ Gallery (west) │   Casino (centre)   │  Resort (east)    │   all three end at the theater
//            ├────────────────┴──── Foyer (z 9 … −6) ─┴─────────────────┤
//                              three doors onto the Court
//
// Up the east tower's lifts: the hotel floors, a room at the top with a window over the town,
// and the sky garden on the roof of the centre block, whose rill spills down the façade as two waterfalls.
// Units are the venue's (about 25 cm); y is up, the avenue runs toward +z, the sea lies toward −z.

import * as THREE from 'three';
import { drawPalm } from './drawing.js';
import { ARTWORKS } from './art.js';

const v = (x, y, z) => new THREE.Vector3(x, y, z);

export const DOOR_Z = 9;                                         // the plane of the portico doors
export const FOYER = { x: 64, z0: 9, z1: -6, h: 14 };
export const HALL = { x: 18, z0: -6, z1: -112, wall: 20 };       // the casino's barrel-vaulted hall
export const WING = { x0: 24, x1: 64, z0: -6, z1: -112, h: 15 }; // gallery (−x) and resort (+x)
export const THEATER = { x: 64, z0: -112, z1: -196, h: 40 };
export const ROOF = 74;                                          // the centre block's roof, now the sky garden
export const LIFT = { x0: 24, x1: 28.4, zs: [-14, -22, -30], ride: -22, top: ROOF };
// the horse in motion: a window in the cage's gate, at eye height, left of centre (heights from the cage floor)
export const ZOETROPE = { x: LIFT.x1 - 0.18, z0: LIFT.ride - 1.3, z1: LIFT.ride + 0.1, y0: 4.2, y1: 5.25 };
export const ROOM = { x0: 21, x1: 35, z0: -25.6, z1: -14.4, y0: ROOF, y1: ROOF + 4.6 };
export const SEA = -36;

// ── solids with openings: a flat wall, its holes cut as arches or rectangles
// along 'z' the wall stands at z = at and spans x; along 'x' it stands at x = at and spans z
function wall(s, axis, at, a0, a1, y0, y1, holes = []) {
  const shape = new THREE.Shape();
  const m = axis === 'x' ? -1 : 1; // shape x is −z for walls along x
  shape.moveTo(a0 * m, y0); shape.lineTo(a1 * m, y0); shape.lineTo(a1 * m, y1); shape.lineTo(a0 * m, y1); shape.closePath();
  for (const h of holes) {
    const p = new THREE.Path(), c = h.c * m, r = h.w / 2;
    if (h.arch) {
      p.moveTo(c - r, h.y0); p.lineTo(c + r, h.y0); p.lineTo(c + r, h.spring);
      p.absarc(c, h.spring, r, 0, Math.PI, false); p.closePath();
    } else { p.moveTo(c - r, h.y0); p.lineTo(c + r, h.y0); p.lineTo(c + r, h.y1); p.lineTo(c - r, h.y1); p.closePath(); }
    shape.holes.push(p);
  }
  const g = new THREE.ShapeGeometry(shape, 24);
  if (axis === 'x') g.rotateY(Math.PI / 2);
  g.translate(axis === 'x' ? at : 0, 0, axis === 'z' ? at : 0);
  s.solids.push(g);
}

// ── the foyer behind the three doors
export function drawFoyer(s) {
  const { x: X, z0, z1, h } = FOYER;
  // walls, ceiling, floor
  wall(s, 'z', z0, -X, X, 0, h, [-6, 0, 6].map(c => ({ c, w: 3.6, y0: 0, spring: 7.2, arch: true })));
  wall(s, 'z', z1, -X, X, 0, h, [
    { c: 0, w: HALL.x * 2, y0: 0, y1: h },
    { c: -44, w: 14, y0: 0, spring: 6, arch: true }, { c: 44, w: 14, y0: 0, spring: 6, arch: true },
  ]);
  s.solid(-X, h, z1, X, h + 0.4, z0);
  for (const sd of [-1, 1]) s.solid(sd > 0 ? X : -X - 2, 0, z1, sd > 0 ? X + 2 : -X, h, z0);
  for (const [y, arr] of [[0.01, s.main], [h - 0.01, s.main], [0.6, s.fine], [h - 0.8, s.fine]]) {
    s.poly(arr, [v(-X, y, z0), v(X, y, z0), v(X, y, z1), v(-X, y, z1)], true);
  }
  for (const sd of [-1, 1]) for (const z of [z0, z1]) s.seg(s.main, v(sd * X, 0, z), v(sd * X, h, z));
  // the doors from inside, and the arches on to the wings
  for (const c of [-6, 0, 6]) { s.archZ(s.main, c, 0, 7.2, 3.6, z0 - 0.02); s.archZ(s.fine, c, 0, 7.2, 4.4, z0 - 0.02); s.light(c - 1.7, 0.1, c + 1.7, 7.2, z0 - 0.03); }
  for (const c of [-44, 44]) { s.archZ(s.main, c, 0, 6, 14, z1 + 0.02); s.archZ(s.fine, c, 0, 6, 15.4, z1 + 0.02); }
  // paired columns either side of the way into the casino, and a coffered ceiling
  for (const sd of [-1, 1]) for (const x of [sd * 20.5, sd * 23]) s.cylinder(x, 0, -3.5, 0.55, h, 0.48, { n: 20 });
  for (let x = -X + 8; x < X; x += 8) s.seg(s.fine, v(x, h - 0.02, z0), v(x, h - 0.02, z1));
  s.seg(s.fine, v(-X, h - 0.02, (z0 + z1) / 2), v(X, h - 0.02, (z0 + z1) / 2));
  for (const x of [-40, 40]) { s.circle(s.main, x, h - 1.2, 1.5, 1.6, 28); s.seg(s.fine, v(x, h, 1.5), v(x, h - 1.2, 1.5)); s.glow(x, h - 1.6, 1.5, 7); }
  // and above the way into the casino, the hall's end wall up into its vault
  const sh = new THREE.Shape();
  sh.moveTo(-HALL.x, h); sh.lineTo(HALL.x, h); sh.lineTo(HALL.x, HALL.wall); sh.absarc(0, HALL.wall, HALL.x, 0, Math.PI, false); sh.closePath();
  const g = new THREE.ShapeGeometry(sh, 32); g.translate(0, 0, z1); s.solids.push(g);
}

// ── the two wings: their shells
export function drawWings(s) {
  const { x0, x1, z0, z1, h } = WING;
  for (const sd of [-1, 1]) {
    const a = sd * x0, b = sd * x1, lo = Math.min(a, b), hi = Math.max(a, b);
    // the wall shared with the casino hall, the outer wall, and the ceiling
    s.solid(Math.min(sd * HALL.x, a), 0, z1, Math.max(sd * HALL.x, a), HALL.wall, z0);
    s.solid(sd > 0 ? b : b - 2, 0, z1, sd > 0 ? b + 2 : b, h, z0);
    s.solid(lo, h, z1, hi, h + 0.4, z0);
    for (const x of [a, b]) for (const [y, arr] of [[0.01, s.main], [h, s.main], [0.6, s.fine], [h - 0.6, s.fine]]) s.seg(arr, v(x, y, z0), v(x, y, z1));
    // pilasters on the outer wall
    for (let z = z0 - 8; z > z1 + 2; z -= 13) s.block(sd > 0 ? b - 0.6 : b, 0, z - 0.6, sd > 0 ? b : b + 0.6, h, z + 0.6, { over: 0.15 });
  }
}

// ── the gallery: a long top-lit room with works on both walls
export const GALLERY_SPOTS = (() => {
  const spots = [], zs = [-22, -46, -70, -94], zs2 = [-32, -56, -80, -100];
  ARTWORKS.forEach((a, i) => {
    const outer = i % 2 === 0, k = Math.floor(i / 2);
    spots.push({ i, x: outer ? -WING.x1 + 0.12 : -WING.x0 - 0.12, z: outer ? zs[k] : zs2[k], facing: outer ? 1 : -1, w: a.w, h: a.h, y: 2.8 + a.h / 2 });
  });
  return spots;
})();

export function drawGallery(s) {
  const { x0, x1, z0, z1, h } = WING, cx = -(x0 + x1) / 2;
  // a skylight lantern down the middle of the ceiling
  for (const x of [cx - 7, cx + 7]) s.seg(s.main, v(x, h - 0.03, z0 - 4), v(x, h - 0.03, z1 + 4));
  for (let z = z0 - 4; z >= z1 + 4; z -= 4) s.seg(s.fine, v(cx - 7, h - 0.03, z), v(cx + 7, h - 0.03, z));
  // picture rail and the frames
  for (const x of [-x0 - 0.05, -x1 + 0.05]) s.seg(s.fine, v(x, h - 2, z0), v(x, h - 2, z1));
  for (const sp of GALLERY_SPOTS) {
    s.object(`art-${sp.i}`, '#b8913f');
    const { x, z, w, h: fh, y, facing } = sp, gx = x + facing * 0.02;
    s.rectX(s.main, gx, z - w / 2 - 0.35, y - fh / 2 - 0.35, z + w / 2 + 0.35, y + fh / 2 + 0.35);
    s.rectX(s.fine, gx, z - w / 2 - 0.12, y - fh / 2 - 0.12, z + w / 2 + 0.12, y + fh / 2 + 0.12);
    s.planeX(x + facing * 0.01, z - w / 2 - 0.35, y - fh / 2 - 0.35, z + w / 2 + 0.35, y + fh / 2 + 0.35, '#b8913f');
    // the label beside it
    s.rectX(s.fine, gx, z + w / 2 + 0.8, y - fh / 2, z + w / 2 + 1.6, y - fh / 2 + 0.5);
    // a picture light above
    s.seg(s.fine, v(gx, y + fh / 2 + 0.6, z), v(x + facing * 0.9, y + fh / 2 + 1.1, z));
    s.glow(x + facing * 0.9, y + fh / 2 + 1, z, 2.4);
    s.object(null);
  }
  // benches down the middle
  for (const z of [-34, -58, -82]) {
    s.block(cx - 2.2, 1.1, z - 0.7, cx + 2.2, 1.4, z + 0.7, { over: 0.1 });
    for (const dx of [-1.9, 1.9]) s.block(cx + dx - 0.1, 0, z - 0.6, cx + dx + 0.1, 1.1, z + 0.6, { over: 0, arr: s.fine });
  }
}

// ── the resort wing: lifts, a reading room with a sofa and the journal rack
export const RACK = { x: WING.x1 - 0.2, zs: [-66, -68.1, -70.2, -72.3, -74.4, -76.5], y: 3.6, w: 1.7, h: 2.26 };
export const SOFA = { x0: 59.2, x1: 63.6, z0: -60, z1: -50 };

function cage(s, z, arr = s.main, y0 = 0) {
  const { x0, x1 } = LIFT, a = z - 2.4, b = z + 2.4, top = y0 + 9.4;
  for (const [x, zz] of [[x0, a], [x0, b], [x1, a], [x1, b]]) s.seg(arr, v(x, y0, zz), v(x, top, zz));
  for (const y of [y0 + 0.3, y0 + 3.2, y0 + 6.3, top]) s.poly(arr, [v(x0, y, a), v(x1, y, a), v(x1, y, b), v(x0, y, b)]);
  // the scissor gate across the front
  const n = 8;
  for (let k = 0; k < n; k++) {
    const za = a + (k / n) * (b - a), zb = a + ((k + 1) / n) * (b - a);
    s.seg(s.fine, v(x1 + 0.02, y0 + 0.4, za), v(x1 + 0.02, y0 + 8.6, zb));
    s.seg(s.fine, v(x1 + 0.02, y0 + 0.4, zb), v(x1 + 0.02, y0 + 8.6, za));
  }
  // lattice on the sides
  for (const zz of [a, b]) for (let k = 0; k < 5; k++) {
    const xa = x0 + (k / 5) * (x1 - x0), xb = x0 + ((k + 1) / 5) * (x1 - x0);
    s.seg(s.fine, v(xa, y0 + 3.2, zz), v(xb, y0 + 6.3, zz)); s.seg(s.fine, v(xb, y0 + 3.2, zz), v(xa, y0 + 6.3, zz));
  }
}

export function drawResort(s) {
  const { x0, x1, z0, z1, h } = WING;
  // coffered ceiling
  for (let x = x0 + 5; x < x1; x += 5) s.seg(s.fine, v(x, h - 0.03, z0), v(x, h - 0.03, z1));
  for (let z = z0 - 6; z > z1; z -= 6) s.seg(s.fine, v(x0, h - 0.03, z), v(x1, h - 0.03, z));
  // the lifts: open brass cages in a lattice shaft, each with a dial above showing the floor
  s.object('lifts', '#b8913f');
  for (const z of LIFT.zs) {
    cage(s, z);
    const x = LIFT.x1 + 0.03;
    for (const [y0, y1] of [[0, 0.3], [9.4, 9.7]]) s.block(LIFT.x0, y0, z - 2.5, LIFT.x1 + 0.1, y1, z + 2.5, { over: 0.05, paint: '#b8913f' });
    for (const zz of [z - 2.4, z + 2.4]) s.block(LIFT.x1 - 0.12, 0, zz - 0.12, LIFT.x1 + 0.12, 9.4, zz + 0.12, { over: 0, arr: s.fine, paint: '#b8913f' });
    // the dial
    const dc = v(x, 11.2, z), R = 1.3, dial = [];
    for (let i = 0; i <= 20; i++) { const a = (i / 20) * Math.PI; dial.push(v(x, dc.y + Math.sin(a) * R, z + Math.cos(a) * R)); }
    s.poly(s.main, dial); s.seg(s.main, v(x, dc.y, z - R), v(x, dc.y, z + R));
    for (let i = 1; i < 12; i++) { const a = (i / 12) * Math.PI; s.seg(s.fine, v(x, dc.y + Math.sin(a) * R * 0.8, z + Math.cos(a) * R * 0.8), v(x, dc.y + Math.sin(a) * R, z + Math.cos(a) * R)); }
    s.seg(s.accent, v(x + 0.01, dc.y, z), v(x + 0.01, dc.y + R * 0.85 * Math.sin(2.2), z + R * 0.85 * Math.cos(2.2)));
    { const g = new THREE.CircleGeometry(R, 24, 0, Math.PI); g.rotateY(Math.PI / 2); g.translate(x - 0.01, dc.y, z); s.paintOnly(g, '#d8b56a'); }
    // the lattice shaft on up through the ceiling
    for (let y = 9.7; y < h; y += 1.8) s.poly(s.fine, [v(LIFT.x0, y, z - 2.4), v(LIFT.x1, y, z - 2.4), v(LIFT.x1, y, z + 2.4), v(LIFT.x0, y, z + 2.4)]);
  }
  s.object(null);
  for (const z of [LIFT.zs[0] + 4.4, LIFT.zs[2] - 4.4]) { s.seg(s.fine, v(x0 + 0.5, 0, z), v(x0 + 0.5, 7.6, z)); s.circle(s.main, x0 + 0.5, 7.9, z, 0.35, 12); s.glow(x0 + 0.6, 7.9, z, 3); }

  // the reading room: a rug, a sofa against the wall, two armchairs, a low table, standing lamps
  for (const [inset, arr] of [[0, s.accent], [0.6, s.fine]]) s.poly(arr, [v(44 + inset, 0.02, -46 - inset), v(62 - inset, 0.02, -46 - inset), v(62 - inset, 0.02, -78 + inset), v(44 + inset, 0.02, -78 + inset)], true);
  s.object('sofa', '#2f5a4a');
  const { x0: sx0, x1: sx1, z0: sz0, z1: sz1 } = SOFA;
  s.block(sx0, 0.4, sz0, sx1, 1.6, sz1, { over: 0.1 });
  s.block(sx1 - 1.2, 1.6, sz0, sx1, 4.2, sz1, { over: 0.1 });
  for (const [a, b] of [[sz0 - 0.8, sz0], [sz1, sz1 + 0.8]]) s.block(sx0, 0.4, a, sx1, 2.7, b, { over: 0.1 });
  for (const z of [-56.7, -53.3]) s.seg(s.fine, v(sx0, 1.62, z), v(sx1 - 1.2, 1.62, z));
  for (const [x, z] of [[sx0 + 0.3, sz0 - 0.5], [sx0 + 0.3, sz1 + 0.5], [sx1 - 0.3, sz0 - 0.5], [sx1 - 0.3, sz1 + 0.5]]) s.seg(s.fine, v(x, 0, z), v(x, 0.4, z));
  s.object(null);
  for (const z of [-51.5, -58.5]) {
    s.block(48.5, 0.4, z - 1.4, 51.4, 1.5, z + 1.4, { over: 0.1 });
    s.block(48.5, 1.5, z - 1.4, 49.3, 3.6, z + 1.4, { over: 0.1 });
  }
  s.cylinder(55.2, 1.3, -55, 1.5, 1.5, 1.5, { n: 32 });
  s.seg(s.fine, v(55.2, 0, -55), v(55.2, 1.3, -55));
  for (const z of [-47.6, -62.4]) {
    s.seg(s.fine, v(62.6, 0, z), v(62.6, 6.4, z));
    s.cylinder(62.6, 6.2, z, 0.9, 7.4, 0.5, { n: 16, solid: false });
    s.glow(62.6, 6.6, z, 4.5);
  }
  // the journal rack on the outer wall
  s.object('journals', '#6b3a22');
  const { x, zs, y, w, h: ch } = RACK;
  s.planeX(x1 - 0.02, zs[zs.length - 1] - 1.4, y - ch / 2 - 0.6, zs[0] + 1.4, y + ch / 2 + 0.8, '#6b3a22');
  s.rectX(s.main, x1 - 0.03, zs[zs.length - 1] - 1.4, y - ch / 2 - 0.6, zs[0] + 1.4, y + ch / 2 + 0.8);
  s.seg(s.main, v(x - 0.3, y - ch / 2 - 0.15, zs[zs.length - 1] - 1.2), v(x - 0.3, y - ch / 2 - 0.15, zs[0] + 1.2));
  for (const z of zs) s.rectX(s.fine, x - 0.03, z - w / 2, y - ch / 2, z + w / 2, y + ch / 2);
  s.object(null);
}

// ── the theater, across the back: every wing opens into it
export function drawTheater(s) {
  const { x: X, z0, z1, h } = THEATER;
  wall(s, 'z', z0, -X, X, 0, h, [
    { c: 0, w: HALL.x * 2, y0: 0, spring: HALL.wall, arch: true },
    { c: -(WING.x0 + WING.x1) / 2, w: 28, y0: 0, spring: 8, arch: true },
    { c: (WING.x0 + WING.x1) / 2, w: 28, y0: 0, spring: 8, arch: true },
  ]);
  for (const sd of [-1, 1]) s.solid(sd > 0 ? X : -X - 2, 0, z1, sd > 0 ? X + 2 : -X, h, z0);
  s.solid(-X, 0, z1 - 2, X, h, z1);
  s.solid(-X, h, z1, X, h + 0.5, z0);
  for (const [y, arr] of [[0.01, s.main], [h, s.main], [0.6, s.fine]]) s.poly(arr, [v(-X, y, z0), v(X, y, z0), v(X, y, z1), v(-X, y, z1)], true);
  for (const sd of [-1, 1]) for (const z of [z0, z1]) s.seg(s.main, v(sd * X, 0, z), v(sd * X, h, z));
  // the three arches seen from inside
  s.archZ(s.main, 0, 0, HALL.wall, HALL.x * 2, z0 - 0.02);
  for (const c of [-44, 44]) s.archZ(s.main, c, 0, 8, 28, z0 - 0.02);
  // boxes along both side walls, two tiers
  for (const sd of [-1, 1]) for (const [y0, y1] of [[8, 9.6], [17, 18.6]]) {
    const x = sd * (X - 0.02);
    s.seg(s.main, v(x, y0, z0 - 16), v(x, y0, z1 + 22)); s.seg(s.main, v(x, y1, z0 - 16), v(x, y1, z1 + 22));
    for (let z = z0 - 18; z > z1 + 22; z -= 7) s.archX(s.fine, x, z - 3.5, y1, y1 + 4.4, 5.4);
  }
  s.object('theater', '#6b3a22');
  const pw = 30, ps = 17, zf = z1 + 0.05;
  s.archPanelZ(0, 2.6, ps, pw, zf + 0.01, '#8e1f2b');
  s.block(-20, 0, z1, 20, 2.6, z1 + 12, { over: 0.4 });
  { const g = new THREE.PlaneGeometry(22, 4.5); g.translate(0, 35.8, zf + 0.01); s.paintOnly(g, '#c9a35a'); }
  for (let k = 0; k < 3; k++) s.block(-6, 0, z1 + 12 + k * 0.8, 6, 2.6 - (k + 1) * 0.65, z1 + 12.8 + k * 0.8, { over: 0.2 });
  s.archZ(s.main, 0, 2.6, ps, pw, zf); s.archZ(s.main, 0, 2.6, ps, pw + 3, zf); s.archZ(s.fine, 0, 2.6, ps, pw + 1.5, zf);
  for (let x = -pw / 2 + 0.6; x <= pw / 2 - 0.6; x += 1) {
    const top = ps + Math.sqrt(Math.max(0, (pw / 2) ** 2 - x * x)) - 0.6, pts = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(v(x + Math.sin(t * 9 + x) * 0.12, 2.6 + (top - 2.6) * t, zf + 0.02)); }
    s.poly(s.fine, pts);
  }
  for (let k = -6; k < 6; k++) { const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(v((k + t) * 2.5, 28 - Math.sin(t * Math.PI) * 1.6, zf + 0.03)); } s.poly(s.main, pts); }
  s.rectZ(s.main, -11, 33.5, 11, 38, zf); s.rectZ(s.fine, -10.4, 34.1, 10.4, 37.4, zf);
  for (let x = -10.7; x <= 10.7; x += 0.9) { s.glow(x, 33.8, zf + 0.1, 1.4); s.glow(x, 37.7, zf + 0.1, 1.4); }
  for (let x = -18; x <= 18; x += 1.8) s.glow(x, 2.9, z1 + 11.8, 1.8);
  s.object(null);
  // stalls: rows facing the stage, an aisle down the middle
  for (let r = 0; r < 11; r++) {
    const rz = z1 + 22 + r * 3.4;
    for (let c = -13; c <= 13; c++) {
      if (Math.abs(c) < 1) continue;
      const x = c * 2.2;
      s.block(x - 0.85, 0, rz - 0.6, x + 0.85, 1.2, rz + 0.6, { over: 0.05, arr: s.fine });
      s.block(x - 0.85, 1.2, rz + 0.45, x + 0.85, 2.7 + r * 0.04, rz + 0.75, { over: 0.05, arr: s.fine });
    }
  }
  // a great chandelier
  const cz = (z0 + z1) / 2 + 6;
  s.seg(s.fine, v(0, h, cz), v(0, 33, cz));
  for (const [y, r] of [[33, 1.2], [31.4, 5], [30, 3.6], [29, 2.2]]) s.circle(r > 3 ? s.main : s.fine, 0, y, cz, r, 56);
  for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2; s.seg(s.fine, v(Math.cos(a) * 1.2, 33, cz + Math.sin(a) * 1.2), v(Math.cos(a) * 5, 31.4, cz + Math.sin(a) * 5)); }
  s.glow(0, 30.8, cz, 22);
}

// ── outside: the sky garden on the centre block's roof, and the waterfalls either side of the suit panel
export function drawSkyGarden(s, rand) {
  const y = ROOF;
  // the back balustrade (the front one is part of the façade)
  for (let x = -20.5; x <= 20.5; x += 1.25) s.seg(s.fine, v(x, y, -30.8), v(x, y + 1.8, -30.8));
  s.seg(s.main, v(-21, y + 1.8, -30.8), v(21, y + 1.8, -30.8));
  s.object('skygarden', '#4f7a4a');
  // a pergola, heavy with climbing green
  const px = [-12, -4, 4, 12], pz = [-22, -10];
  for (const x of px) for (const z of pz) s.block(x - 0.25, y, z - 0.25, x + 0.25, y + 6.4, z + 0.25, { over: 0.05, paint: '#e6dfd3' });
  for (const z of pz) s.block(-13, y + 6.4, z - 0.3, 13, y + 6.9, z + 0.3, { over: 0.1, paint: '#e6dfd3' });
  for (let x = -12.5; x <= 12.5; x += 1.4) s.seg(s.fine, v(x, y + 6.95, -22.6), v(x, y + 6.95, -9.4));
  for (let k = 0; k < 22; k++) {
    const g = new THREE.SphereGeometry(0.7 + rand() * 0.9, 10, 8);
    g.scale(1, 0.6, 1).translate(-12 + rand() * 24, y + 6.9 + rand() * 0.4, -22 + rand() * 12);
    s.paintOnly(g, rand() < 0.3 ? '#a8547a' : '#4f7a4a');
  }
  // palms in the corners, cypresses against the tower walls
  for (const [x, z, hh] of [[-15.5, -5, 7], [15.5, -5, 7.6], [-15.5, -26, 8.4], [15.5, -26, 8]]) {
    drawPalm(s, x, z, hh, x < 0 ? 0.25 : -0.25, rand, y, 0.62);
    { const g = new THREE.SphereGeometry(2.4, 12, 8); g.scale(1, 0.45, 1).translate(x, y + hh - 0.4, z); s.paintOnly(g, '#5b8a4f'); }
    s.block(x - 1, y, z - 1, x + 1, y + 1.2, z + 1, { over: 0.1, paint: '#b1603e' });
  }
  for (const z of [-12, -18]) for (const sd of [-1, 1]) {
    const x = sd * 18.6, hh = 8 + rand() * 1.5, r = 1.1, pts = [], pts2 = [];
    for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI; pts.push(v(x + Math.sin(a) * r, y + 0.4 + (1 - Math.cos(a)) / 2 * hh, z)); pts2.push(v(x, y + 0.4 + (1 - Math.cos(a)) / 2 * hh, z + Math.sin(a) * r)); }
    s.poly(s.main, pts); s.poly(s.main, pts.map(p => v(2 * x - p.x, p.y, p.z))); s.poly(s.fine, pts2);
    const g = new THREE.SphereGeometry(1, 12, 10); g.scale(r, hh / 2, r).translate(x, y + 0.4 + hh / 2, z);
    s.solids.push(g.clone()); s.paintOnly(g, '#2f5a3a');
  }
  s.object(null);
  // the rill: along the front edge, a pool under the pergola, and spouts at both ends
  for (const z of [-1.2, -2.2]) s.seg(s.accent, v(-18, y + 0.03, z), v(18, y + 0.03, z));
  s.poly(s.accent, [v(-5, y + 0.03, -18), v(5, y + 0.03, -18), v(5, y + 0.03, -12), v(-5, y + 0.03, -12)], true);
  for (const r of [1.2, 2.2]) s.circle(s.water, 0, y + 0.05, -15, r, 32);
  s.seg(s.water, v(-17.5, y + 0.05, -1.7), v(17.5, y + 0.05, -1.7));
  for (const sd of [-1, 1]) s.block(sd * 18.2 - 0.4, 72.4, 0.6, sd * 18.2 + 0.4, 72.9, 1.6, { over: 0.05 });
  // a bench under the pergola, lanterns on the posts
  s.block(-3, y + 1, -16.4, 3, y + 1.3, -15.6, { over: 0.1 });
  for (const x of px) s.glow(x, y + 5.6, -10, 2.6);
}

export function drawWaterfalls(s) {
  for (const sd of [-1, 1]) {
    for (const [i, x0] of [17.3, 18.2, 19.1].entries()) {
      const x = sd * x0, pts = [v(x, 72.6, 1.5), v(x, 71.8, 1.6), v(x, 70.4, 1.1), v(x, 67, 0.55)];
      for (let y = 64; y > 15.6; y -= 4) pts.push(v(x + Math.sin(y * 0.3 + i) * 0.04, y, 0.4));
      pts.push(v(x, 15.6, 0.4));
      s.poly(s.falls, pts);
    }
    // the trough on the podium roof that catches them
    const a = sd * 16.6, b = sd * 19.8;
    s.block(Math.min(a, b), 15.2, 0, Math.max(a, b), 16, 2.2, { over: 0.1 });
    for (let k = 0; k < 3; k++) { const x = sd * (17.3 + k * 0.9), pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push(v(x + sd * Math.sin(t * Math.PI) * 0.3, 16 + Math.sin(t * Math.PI) * 0.6, 0.4 + t * 1.2)); } s.poly(s.falls, pts); }
  }
}

// ── seen from up high: the back of the resort, then the town, the harbour and the sea
export function drawRear(s) {
  // the casino hall's barrel roof behind the centre block
  const za = -30, zb = HALL.z1, R = 20;
  for (const sd of [-1, 1]) s.block(sd > 0 ? 18 : -20, 0, zb, sd > 0 ? 20 : -18, HALL.wall, za, { over: 0.4 });
  { const g = new THREE.CylinderGeometry(R, R, za - zb, 32, 1, true, Math.PI / 2, Math.PI); g.rotateX(Math.PI / 2); g.translate(0, HALL.wall, (za + zb) / 2); s.solids.push(g); }
  for (let z = za; z >= zb; z -= 12) { const pts = []; for (let i = 0; i <= 32; i++) { const a = (i / 32) * Math.PI; pts.push(v(Math.cos(a) * R, HALL.wall + Math.sin(a) * R, z)); } s.poly(z === za ? s.main : s.fine, pts); }
  for (let k = 1; k < 8; k++) { const a = (k / 8) * Math.PI; s.seg(s.fine, v(Math.cos(a) * R, HALL.wall + Math.sin(a) * R, za), v(Math.cos(a) * R, HALL.wall + Math.sin(a) * R, zb)); }
  // the two wings, low and flat
  for (const sd of [-1, 1]) s.block(sd > 0 ? 20 : -70, 0, zb, sd > 0 ? 70 : -20, 16, -20, { over: 0.6 });
  // the theater
  s.block(-70, 0, -200, 70, 41, zb, { over: 0.8 });
  s.block(-71, 41, -201, 71, 42.2, zb + 1, { over: 0.5 });
  for (let x = -66; x <= 66; x += 8) s.rectZ(s.fine, x - 1.4, 22, x + 1.4, 34, zb + 0.02);
  // the terrace's end, and the drop to the sea
  for (let x = -90; x <= 90; x += 1.5) s.seg(s.fine, v(x, 0, -215), v(x, 1.6, -215));
  s.seg(s.main, v(-90, 1.6, -215), v(90, 1.6, -215));
}

// The view north: the old town falls in terraces from the resort's back terrace to a harbour,
// the coast towns climb the hills on either side, and between them the sea opens to the horizon.
const HARBOUR = -650;                                                       // z of the harbour's inner quay
const coast = z => 70 + Math.max(0, HARBOUR - z) * 0.3;                      // half-width of the water at depth z
const slope = z => THREE.MathUtils.lerp(0, SEA + 2, THREE.MathUtils.clamp((-215 - z) / (-215 - HARBOUR), 0, 1));

function house(s, rand, x, ground, z, near) {
  const w = 7 + rand() * 9, d = 6 + rand() * 7, hh = 6 + rand() * (near ? 14 : 9);
  s.block(x - w / 2, ground, z - d / 2, x + w / 2, ground + hh, z + d / 2, { over: 0.15, arr: s.fine });
  for (let k = 0; k < 2; k++) if (rand() < 0.7) {
    const wx = x - w / 2 + 1 + rand() * (w - 3), wy = ground + 1.5 + rand() * (hh - 3);
    s.light(wx, wy, wx + 1, wy + 1.6, z + d / 2 + 0.05);
  }
}

export function drawPanorama(s, rand) {
  // the old town, terraced down the slope behind the resort
  for (let z = -232; z > HARBOUR + 10; z -= 24) {
    const ground = slope(z), spread = 150 + (-215 - z) * 0.6;
    s.seg(s.fine, v(-spread, ground, z + 12), v(spread, ground, z + 12));
    for (let x = -spread; x <= spread; x += 20) if (rand() > 0.38) house(s, rand, x + rand() * 8, ground, z, true);
  }
  // the harbour: an inner quay, side quays, two breakwaters, a lighthouse, yachts
  const H = HARBOUR, q = (x, z) => v(x, SEA + 1, z);
  s.poly(s.main, [q(-coast(H - 150), H - 150), q(-70, H - 40), q(-70, H), q(80, H), q(80, H - 40), q(coast(H - 150), H - 150)]);
  for (const [a, b] of [[v(-coast(H - 150), SEA, H - 150), v(-14, SEA, H - 215)], [v(coast(H - 150), SEA, H - 150), v(22, SEA, H - 228)]]) {
    s.poly(s.main, [a, b, b.clone().add(v(0, 3, 0)), a.clone().add(v(0, 3, 0))], true);
  }
  s.cylinder(22, SEA + 3, H - 228, 2.2, SEA + 19, 1.6, { n: 20 });
  s.cylinder(22, SEA + 19, H - 228, 2.4, SEA + 21.5, 2.4, { n: 20 });
  s.glow(22, SEA + 20.4, H - 228, 16);
  for (let i = 0; i < 28; i++) {
    const z = H - 12 - rand() * 150, x = (rand() * 2 - 1) * (coast(z) - 14), L = 6 + rand() * 12, W = L * 0.32, a = (rand() - 0.5) * 0.6;
    const ca = Math.cos(a), sa = Math.sin(a), P = (lx, lz, ly = 0) => v(x + lx * ca - lz * sa, SEA + 0.8 + ly, z + lx * sa + lz * ca);
    s.poly(s.fine, [P(-W / 2, -L / 2), P(W / 2, -L / 2), P(W / 2, L / 3), P(0, L / 2), P(-W / 2, L / 3)], true);
    if (rand() < 0.6) s.seg(s.fine, P(0, 0), P(0, 0, L * 0.9));
    else s.block(x - W / 4, SEA + 0.8, z - L / 5, x + W / 4, SEA + 2.4, z + L / 6, { over: 0.05, arr: s.fine });
    if (rand() < 0.5) s.glow(x, SEA + 2, z, 2);
  }
  for (let x = -66; x <= 76; x += 12) s.glow(x, SEA + 5, H + 1, 3);
  // the sea: a horizon, long swells, a few sails far out
  s.seg(s.main, v(-5000, SEA, -2900), v(5000, SEA, -2900));
  for (let i = 0; i < 80; i++) {
    const z = H - 240 - rand() * 2000, w = coast(z) * 0.9, x = (rand() * 2 - 1) * w, l = 6 + rand() * 30;
    s.seg(s.water, v(x - l, SEA + 0.05, z), v(x + l, SEA + 0.05, z));
  }
  for (let i = 0; i < 9; i++) {
    const z = H - 400 - rand() * 1400, x = (rand() * 2 - 1) * coast(z) * 0.7;
    s.poly(s.fine, [v(x, SEA, z), v(x, SEA + 9, z), v(x + 4, SEA + 1, z)], true);
  }
  // the coast towns on both hills, thinning as they climb; roads winding up; mountains behind
  for (const sd of [-1, 1]) {
    for (let z = H - 6; z > -1500; z -= 22 + (H - z) * 0.03) {
      const c = coast(z);
      for (let d = 6; d < 380; d += 18 + d * 0.07) {
        if (rand() < 0.25 + d / 650 + (H - z) / 2400) continue;
        house(s, rand, sd * (c + d + rand() * 8), SEA + d * 0.42 + Math.sin(z * 0.01) * 6, z, d < 80);
      }
    }
    for (let r = 0; r < 4; r++) {
      const pts = [];
      for (let i = 0; i <= 30; i++) { const t = i / 30, z = H - t * 620; pts.push(v(sd * (coast(z) + 40 + r * 70 + Math.sin(t * 9 + r) * 26), SEA + (40 + r * 70) * 0.42 + 2, z)); }
      s.poly(s.fine, pts);
    }
    for (let ridge = 0; ridge < 3; ridge++) {
      const pts = [];
      for (let i = 0; i <= 40; i++) {
        const t = i / 40, z = H - 60 - t * 2100, x = sd * (coast(z) + 330 + ridge * 240 + Math.sin(t * 7 + ridge) * 60);
        const hgt = SEA + (240 + ridge * 90) * Math.sin(Math.min(1, t * 1.4) * Math.PI) * (0.7 + 0.3 * Math.sin(t * 13 + ridge)) * (1 - t * 0.6);
        pts.push(v(x, Math.max(SEA, hgt), z));
      }
      s.poly(ridge === 0 ? s.main : s.fine, pts);
    }
  }
}

// ── the lift ride: the hotel floors passing the gate, and the cage that rides with you
export function drawShaft(s) {
  const z = LIFT.ride, a = z - 4, b = z + 4;
  for (let f = WING.h + 4.6; f < ROOF - 1; f += 4.6) {
    s.block(LIFT.x1, f - 0.6, a, 36, f, b, { over: 0.1 });
    s.block(36, f, a, 37, f + 4, b, { over: 0.05 });
    for (const dz of [-2, 2]) s.rectX(s.fine, 35.98, z + dz - 0.9, f, z + dz + 0.9, f + 3.1);
    s.glow(35.9, f + 3.2, z, 2.4);
    s.seg(s.fine, v(LIFT.x1, f + 0.02, z), v(36, f + 0.02, z));
  }
  for (const zz of [z - 2.4, z + 2.4]) for (let y = WING.h; y < ROOF; y += 1.8) s.seg(s.fine, v(LIFT.x0, y, zz), v(LIFT.x1, y + 1.8, zz));
  // walls beside the shaft, above the lobby
  s.solid(LIFT.x0 - 1, WING.h, a - 1, LIFT.x0, ROOF, b + 1);
  for (const zz of [a - 1, b]) s.solid(LIFT.x0, WING.h, zz, 36, ROOF, zz + 1);
}
export function drawCage(s) {
  cage(s, LIFT.ride, s.main, 0);
  const { x, z0, z1, y0, y1 } = ZOETROPE, f = x - 0.01;
  s.rectX(s.main, f, z0 - 0.12, y0 - 0.12, z1 + 0.12, y1 + 0.12);
  s.rectX(s.accent, f, z0 - 0.2, y0 - 0.2, z1 + 0.2, y1 + 0.2);
  s.rectX(s.fine, f, (z0 + z1) / 2 - 0.55, y0 - 0.62, (z0 + z1) / 2 + 0.55, y0 - 0.32);
  s.solid(x, y0 - 0.25, z0 - 0.25, x + 0.05, y1 + 0.25, z1 + 0.25);
}

// ── the room at the top of the tower: a bed, a window over the town, a door out to the garden
export function drawRoom(s) {
  const { x0, x1, z0, z1, y0, y1 } = ROOM, door = { c: -19.5, w: 3, y0, y1: y0 + 3.6 };
  s.solid(x0, y0 - 0.4, z0, x1, y0, z1);
  s.solid(x0, y1, z0, x1, y1 + 0.4, z1);
  s.solid(x1, y0, z0, x1 + 0.4, y1, z1);
  s.solid(x0, y0, z1, x1, y1, z1 + 0.4);
  wall(s, 'z', z0, x0, x1, y0, y1, [{ c: 28, w: 9, y0: y0 + 0.9, y1: y0 + 4.1 }]);
  wall(s, 'x', x0, z0, z1, y0, y1, [door]);
  for (const [y, arr] of [[y0 + 0.01, s.main], [y1, s.main]]) s.poly(arr, [v(x0, y, z0), v(x1, y, z0), v(x1, y, z1), v(x0, y, z1)], true);
  for (const x of [x0, x1]) for (const z of [z0, z1]) s.seg(s.main, v(x, y0, z), v(x, y1, z));
  // the window: frame, mullions, curtains
  const wz = z0 + 0.03;
  s.rectZ(s.main, 23.5, y0 + 0.9, 32.5, y0 + 4.1, wz);
  for (const x of [26.5, 29.5]) s.seg(s.fine, v(x, y0 + 0.9, wz), v(x, y0 + 4.1, wz));
  s.seg(s.fine, v(23.5, y0 + 3.2, wz), v(32.5, y0 + 3.2, wz));
  for (const sd of [-1, 1]) for (let k = 0; k < 6; k++) {
    const x = 28 + sd * (4.7 + k * 0.22), pts = [];
    for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push(v(x + Math.sin(t * 8 + k) * 0.08, y0 + 4.3 - t * 4.2, wz + 0.15 + k * 0.03)); }
    s.poly(s.fine, pts);
  }
  // the door out to the sky garden
  s.object('terrace', '#c9a35a');
  s.rectX(s.main, x0 + 0.03, door.c - door.w / 2, y0, door.c + door.w / 2, door.y1);
  s.seg(s.fine, v(x0 + 0.03, y0, door.c), v(x0 + 0.03, door.y1, door.c));
  for (const y of [y0 + 1.2, y0 + 2.4]) s.seg(s.fine, v(x0 + 0.03, y, door.c - door.w / 2), v(x0 + 0.03, y, door.c + door.w / 2));
  s.planeX(x0 + 0.02, door.c - door.w / 2 - 0.2, y0, door.c + door.w / 2 + 0.2, door.y1 + 0.2, '#c9a35a');
  s.object(null);
  // the bed against the far wall, a nightstand with a lamp, an armchair by the window
  s.block(28.2, y0, -23.6, x1 - 0.3, y0 + 1.3, -17.6, { over: 0.1, paint: undefined });
  s.block(x1 - 0.7, y0, -24, x1 - 0.3, y0 + 3.2, -17.2, { over: 0.1 });
  for (const z of [-22.2, -19]) s.block(x1 - 2.2, y0 + 1.3, z - 1.1, x1 - 0.8, y0 + 1.8, z + 1.1, { over: 0.05, arr: s.fine });
  s.seg(s.fine, v(30.5, y0 + 1.32, -23.6), v(30.5, y0 + 1.32, -17.6));
  s.block(x1 - 1.6, y0, -16.6, x1 - 0.3, y0 + 1.5, -15.2, { over: 0.05 });
  s.seg(s.fine, v(x1 - 1, y0 + 1.5, -15.9), v(x1 - 1, y0 + 2.6, -15.9));
  s.cylinder(x1 - 1, y0 + 2.6, -15.9, 0.6, y0 + 3.3, 0.35, { n: 14, solid: false });
  s.glow(x1 - 1, y0 + 2.9, -15.9, 3);
  s.block(23, y0, -23.4, 25.2, y0 + 1.2, -21.2, { over: 0.05 });
  s.block(23, y0 + 1.2, -23.4, 23.5, y0 + 2.8, -21.2, { over: 0.05 });
  s.glow((x0 + x1) / 2, y1 - 0.3, (z0 + z1) / 2, 6);
}

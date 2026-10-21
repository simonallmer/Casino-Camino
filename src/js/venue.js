// The venue as a living architectural drawing.
// Everything is ink lines over invisible "occluder" solids, so hidden lines drop out
// the way they would in a pen drawing. Day = ink on cream; night = gold on black with lit windows.
// What a guest touches is painted in watercolor (paint.js); the chip is the one thing always in colour.

import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { watercolorMaterial, tint, Paintable } from './paint.js';
import { chipStacks, bigChip } from './chip.js';
import { createMerchant } from './merchant.js';
import { createKeeper } from './keeper.js';
import { worldCanvas, loadLand, lonLatToVec } from './coins/world.js';
import { buildCoin, matcapMaterials, COIN_R } from './coins/coin.js';
import { createZoetrope } from './zoetrope.js';
import { assetBinary, loadSuits } from './assets.js';

const THEMES = {
  day:   { paper: 0xefe7d6, ink: 0x2b251d, fine: 0x5a4f40, accent: 0x8c6a2c, water: 0x5f8592, window: 0xf3c77a, glow: 0xffd28a },
  night: { paper: 0x0f0e0c, ink: 0xcaa862, fine: 0x8d7646, accent: 0xe6c27a, water: 0x86b4c2, window: 0xf6c56f, glow: 0xffc36a },
};

// ── Drawing kit ──────────────────────────────────────────────────

class Sheet {
  constructor() {
    this.main = []; this.fine = []; this.accent = []; this.water = [];
    this.solids = [];
    this.lights = [];   // night-only window planes
    this.glows = [];    // night-only lamp halos {pos, size}
    this.paints = {};   // object name -> watercolor geometries
    this.cur = null;
  }
  // everything solid drawn until the next object() call belongs to this paintable thing
  object(name, color) { this.cur = name ? { name, color } : null; }
  paintOnly(g, color) {
    if (!this.cur) return;
    (this.paints[this.cur.name] ??= []).push(tint(g, color ?? this.cur.color));
  }
  seg(arr, a, b, over = 0) {
    if (over) {
      const d = new THREE.Vector3().subVectors(b, a);
      const len = d.length();
      const o = Math.min(over, len * 0.06);
      d.normalize().multiplyScalar(o);
      a = a.clone().sub(d); b = b.clone().add(d);
    }
    arr.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }
  poly(arr, pts, closed = false) {
    for (let i = 0; i < pts.length - 1; i++) this.seg(arr, pts[i], pts[i + 1]);
    if (closed) this.seg(arr, pts[pts.length - 1], pts[0]);
  }
  rectZ(arr, x0, y0, x1, y1, z) {
    const v = THREE.Vector3;
    this.poly(arr, [new v(x0, y0, z), new v(x1, y0, z), new v(x1, y1, z), new v(x0, y1, z)], true);
  }
  rectX(arr, x, z0, y0, z1, y1) {
    const v = THREE.Vector3;
    this.poly(arr, [new v(x, y0, z0), new v(x, y0, z1), new v(x, y1, z1), new v(x, y1, z0)], true);
  }
  circle(arr, cx, y, cz, r, n = 64) {
    const pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; pts.push(new THREE.Vector3(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r)); }
    this.poly(arr, pts, true);
  }
  // arch opening on a z-facing plane: posts + semicircle
  archZ(arr, cx, y0, spring, w, z) {
    const v = THREE.Vector3, r = w / 2, pts = [new v(cx - r, y0, z), new v(cx - r, spring, z)];
    for (let i = 1; i < 24; i++) { const a = Math.PI - (i / 24) * Math.PI; pts.push(new v(cx + Math.cos(a) * r, spring + Math.sin(a) * r, z)); }
    pts.push(new v(cx + r, spring, z), new v(cx + r, y0, z));
    this.poly(arr, pts);
  }
  archX(arr, x, cz, y0, spring, w) {
    const v = THREE.Vector3, r = w / 2, pts = [new v(x, y0, cz - r), new v(x, spring, cz - r)];
    for (let i = 1; i < 24; i++) { const a = Math.PI - (i / 24) * Math.PI; pts.push(new v(x, spring + Math.sin(a) * r, cz + Math.cos(a) * r)); }
    pts.push(new v(x, spring, cz + r), new v(x, y0, cz + r));
    this.poly(arr, pts);
  }
  // vertical hatching inside an arch (shadowed opening)
  hatchArchZ(arr, cx, y0, spring, w, z, step = 0.42) {
    const r = w / 2;
    for (let x = cx - r + step / 2; x < cx + r; x += step) {
      const dx = x - cx, top = spring + Math.sqrt(Math.max(0, r * r - dx * dx));
      this.seg(arr, new THREE.Vector3(x, y0, z), new THREE.Vector3(x, top, z));
    }
  }
  solid(x0, y0, z0, x1, y1, z1, paint) {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    this.solids.push(g);
    this.paintOnly(g.clone(), paint);
  }
  // a box drawn with slightly overshooting edges, the way an architect's pen runs past the corner
  block(x0, y0, z0, x1, y1, z1, { over = 0.5, arr = this.main, solid = true, paint } = {}) {
    const v = THREE.Vector3;
    const c = [
      new v(x0, y0, z0), new v(x1, y0, z0), new v(x1, y1, z0), new v(x0, y1, z0),
      new v(x0, y0, z1), new v(x1, y0, z1), new v(x1, y1, z1), new v(x0, y1, z1),
    ];
    [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
      .forEach(([a, b]) => this.seg(arr, c[a], c[b], over));
    if (solid) this.solid(x0, y0, z0, x1, y1, z1, paint);
  }
  cylinder(cx, y0, cz, r0, y1, r1, { arr = this.main, n = 64, solid = true, paint } = {}) {
    this.circle(arr, cx, y0, cz, r0, n);
    this.circle(arr, cx, y1, cz, r1, n);
    if (solid) {
      const g = new THREE.CylinderGeometry(r1, r0, y1 - y0, n);
      g.translate(cx, (y0 + y1) / 2, cz);
      this.solids.push(g);
      this.paintOnly(g.clone(), paint);
    }
  }
  // flat paint: an arch-topped panel on a z-facing plane
  archPanelZ(cx, y0, spring, w, z, color) {
    const r = w / 2, sh = new THREE.Shape();
    sh.moveTo(cx - r, y0); sh.lineTo(cx + r, y0); sh.lineTo(cx + r, spring);
    sh.absarc(cx, spring, r, 0, Math.PI, false); sh.lineTo(cx - r, y0);
    const g = new THREE.ShapeGeometry(sh, 24); g.translate(0, 0, z);
    this.paintOnly(g, color);
  }
  disc(cx, y, cz, r, color) {
    const g = new THREE.CircleGeometry(r, 64); g.rotateX(-Math.PI / 2); g.translate(cx, y, cz);
    this.paintOnly(g, color);
  }
  planeX(x, z0, y0, z1, y1, color) {
    const g = new THREE.PlaneGeometry(Math.abs(z1 - z0), y1 - y0); g.rotateY(Math.PI / 2);
    g.translate(x, (y0 + y1) / 2, (z0 + z1) / 2);
    this.paintOnly(g, color);
  }
  light(x0, y0, x1, y1, z) {
    const g = new THREE.PlaneGeometry(x1 - x0, y1 - y0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, z);
    this.lights.push(g);
  }
  lightX(x, z0, y0, z1, y1, facing) {
    const g = new THREE.PlaneGeometry(Math.abs(z1 - z0), y1 - y0);
    g.rotateY(facing * Math.PI / 2);
    g.translate(x, (y0 + y1) / 2, (z0 + z1) / 2);
    this.lights.push(g);
  }
  glow(x, y, z, size = 4) { this.glows.push({ pos: new THREE.Vector3(x, y, z), size }); }
}

// deterministic randomness so the drawing is identical on every visit
function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }

// ── Exterior ─────────────────────────────────────────────────────

function drawPalm(s, x, z, h, lean, rand) {
  const v = THREE.Vector3;
  const top = new v(x + lean * h * 0.18, h, z);
  const trunk = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    trunk.push(new v(x + lean * h * 0.18 * t * t, h * t, z));
  }
  const off = 0.22;
  s.poly(s.main, trunk.map(p => p.clone().add(new v(-off * (1 - p.y / h * 0.4), 0, 0))));
  s.poly(s.main, trunk.map(p => p.clone().add(new v(off * (1 - p.y / h * 0.4), 0, 0))));
  for (let y = 0.6; y < h - 0.4; y += 0.55) {
    const t = y / h, cx = x + lean * h * 0.18 * t * t, w = off * (1 - t * 0.4);
    s.seg(s.fine, new v(cx - w, y, z), new v(cx + w, y + 0.12, z));
  }
  const fronds = 9;
  for (let f = 0; f < fronds; f++) {
    const a = (f / fronds) * Math.PI * 2 + rand() * 0.4;
    const R = 4.2 + rand() * 1.4, lift = 1.1 + rand() * 0.8;
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      pts.push(new v(top.x + Math.cos(a) * R * t, top.y + lift * Math.sin(Math.PI * t * 0.7) - 2.6 * t * t, top.z + Math.sin(a) * R * t));
    }
    s.poly(s.main, pts);
    for (let i = 2; i < 12; i++) {
      const p = pts[i], len = 1.1 * Math.sin(Math.PI * (i / 12));
      const side = new v(-Math.sin(a), 0, Math.cos(a)).multiplyScalar(len * 0.55);
      s.seg(s.fine, p, p.clone().add(side).add(new v(0, -len * 0.75, 0)));
      s.seg(s.fine, p, p.clone().sub(side).add(new v(0, -len * 0.75, 0)));
    }
  }
}

function drawLamp(s, x, z) {
  const v = THREE.Vector3;
  s.seg(s.main, new v(x, 0, z), new v(x, 6.2, z));
  s.seg(s.fine, new v(x - 0.35, 0, z), new v(x + 0.35, 0, z));
  s.seg(s.fine, new v(x - 0.2, 0.6, z), new v(x + 0.2, 0.6, z));
  s.seg(s.main, new v(x - 0.9, 5.6, z), new v(x + 0.9, 5.6, z));
  for (const dx of [-0.9, 0.9]) {
    s.rectZ(s.main, x + dx - 0.28, 5.6, x + dx + 0.28, 6.5, z);
    s.seg(s.fine, new v(x + dx - 0.36, 6.5, z), new v(x + dx, 6.85, z));
    s.seg(s.fine, new v(x + dx + 0.36, 6.5, z), new v(x + dx, 6.85, z));
    s.glow(x + dx, 6.05, z, 3.2);
  }
}

function drawTowers(s, side, rand) {
  // stepped setbacks falling away from the centre block, as in the founding sketch
  const tiers = [
    [20, 36, 104, 6, -26], [36, 48, 86, 4, -24], [48, 58, 68, 2, -22], [58, 68, 52, 0, -20], [68, 78, 38, -2, -18],
  ];
  tiers.forEach(([a, b, h, zf, zb], ti) => {
    const x0 = side > 0 ? a : -b, x1 = side > 0 ? b : -a;
    s.block(x0, 0, zb, x1, h, zf, { over: 0.9 });
    // stepped crown
    const steps = ti < 2 ? 3 : 2;
    let ix0 = x0, ix1 = x1, iz0 = zb, iz1 = zf, y = h;
    for (let k = 0; k < steps; k++) {
      ix0 += 1.4; ix1 -= 1.4; iz0 += 1.4; iz1 -= 1.4;
      const hh = 3.2 - k * 0.6;
      s.block(ix0, y, iz0, ix1, y + hh, iz1, { over: 0.4 });
      y += hh;
    }
    // pilaster lines framing each tier
    s.seg(s.fine, new THREE.Vector3(x0 + 0.8, 15, zf + 0.01), new THREE.Vector3(x0 + 0.8, h - 1.2, zf + 0.01));
    s.seg(s.fine, new THREE.Vector3(x1 - 0.8, 15, zf + 0.01), new THREE.Vector3(x1 - 0.8, h - 1.2, zf + 0.01));
    s.seg(s.fine, new THREE.Vector3(x0, h - 1.2, zf + 0.01), new THREE.Vector3(x1, h - 1.2, zf + 0.01));
    // tall vertical window slits split by spandrels
    const w = x1 - x0, cols = Math.max(2, Math.floor((w - 2.4) / 2.5));
    const gap = (w - 2.4) / cols;
    for (let c = 0; c < cols; c++) {
      const cx = x0 + 1.2 + gap * (c + 0.5);
      for (let y0 = 18; y0 < h - 6; y0 += 11) {
        const y1 = Math.min(y0 + 9.4, h - 4);
        if (y1 - y0 < 2) continue;
        s.rectZ(s.fine, cx - 0.42, y0, cx + 0.42, y1, zf + 0.02);
        if (rand() < 0.42) s.light(cx - 0.42, y0, cx + 0.42, y1, zf + 0.03);
      }
    }
  });
  // the left towers' inner face sits in shadow: diagonal hatching
  if (side < 0) {
    for (let t = -6; t < 104; t += 0.9) {
      const y0 = Math.max(0, t), z0 = 6 - (y0 - t);
      const y1 = Math.min(104, t + 6), z1 = 6 - (y1 - t);
      s.seg(s.fine, new THREE.Vector3(-20.02, y0, z0), new THREE.Vector3(-20.02, y1, z1));
    }
  }
}

function drawFacade(s) {
  const v = THREE.Vector3;
  // centre block, recessed between the towers
  s.block(-20, 0, -30, 20, 72, 0, { over: 0.9 });
  s.block(-21, 72, -31, 21, 74, 1, { over: 0.6 });
  s.block(-16, 74, -26, 16, 80, -4, { over: 0.5 });
  for (let x = -20.5; x <= 20.5; x += 1.25) s.seg(s.fine, new v(x, 74, 0.8), new v(x, 75.8, 0.8));
  s.seg(s.main, new v(-21, 75.8, 0.8), new v(21, 75.8, 0.8));
  // the suit panel frame
  s.rectZ(s.main, -16.4, 28.4, 16.4, 67.6, 0.02);
  s.rectZ(s.fine, -15.6, 29.2, 15.6, 66.8, 0.02);
  for (const x of [-18.2, -19.1, 18.2, 19.1]) s.seg(s.fine, new v(x, 15, 0.02), new v(x, 72, 0.02));
  // cast shadow of the left tower on the recessed centre
  for (let y = 15; y < 72; y += 0.8) s.seg(s.fine, new v(-20, y, 0.03), new v(-15.4, Math.min(72, y + 4.6), 0.03));

  // podium with arcades
  s.block(-82, 0, -20, 82, 14, 10, { over: 0.9 });
  s.block(-83, 14, -21, 83, 15.2, 11, { over: 0.6 });
  for (const [a, b] of [[-82, -13], [13, 82]]) {
    for (let x = a; x <= b; x += 1.2) s.seg(s.fine, new v(x, 15.2, 10.6), new v(x, 17, 10.6));
    s.seg(s.main, new v(a, 17, 10.6), new v(b, 17, 10.6));
  }
  for (let x = -79; x <= 79; x += 6) {
    if (Math.abs(x) < 14) continue;
    s.archZ(s.main, x, 0.2, 7, 4, 10.02);
    s.archZ(s.fine, x, 0.2, 7, 4.8, 10.02);
    s.hatchArchZ(s.fine, x, 0.2, 7, 4, 10.01);
    if (Math.abs(x) > 30) s.light(x - 1.6, 0.4, x + 1.6, 6.8, 10.015);
  }
  s.seg(s.fine, new v(-82, 11.5, 10.02), new v(82, 11.5, 10.02));

  // portico
  s.object('portico', '#cdb27e');
  s.block(-13, 0, 9, 13, 1, 21, { over: 0.4 });
  s.block(-12, 0, 21, 12, 0.66, 22.2, { over: 0.3 });
  s.block(-11, 0, 22.2, 11, 0.33, 23.4, { over: 0.3 });
  s.block(-12.5, 13, 9, 12.5, 16, 20.5, { over: 0.6 });
  s.block(-8, 16, 10, 8, 17.6, 19, { over: 0.4 });
  for (const x of [-10.5, -6.3, -2.1, 2.1, 6.3, 10.5]) {
    s.block(x - 0.7, 1, 18.6, x + 0.7, 13, 20, { over: 0.2 });
    s.block(x - 1, 12.4, 18.3, x + 1, 13, 20.3, { over: 0.1 });
    s.block(x - 1, 1, 18.3, x + 1, 1.6, 20.3, { over: 0.1 });
  }
  // doors: the centre one is where the camino goes in
  for (const x of [-6, 0, 6]) {
    s.archZ(s.main, x, 1, 7.2, 3.6, 10.03);
    s.seg(s.fine, new v(x, 1, 10.03), new v(x, 7.2, 10.03));
    for (let k = 1; k < 8; k++) {
      const a = (k / 8) * Math.PI;
      s.seg(s.fine, new v(x, 7.2, 10.03), new v(x + Math.cos(a) * 1.8, 7.2 + Math.sin(a) * 1.8, 10.03));
    }
    s.light(x - 1.7, 1.05, x + 1.7, 7.2, 10.025);
    s.archPanelZ(x, 1, 7.2, 3.6, 10.04, '#9b2d2a');
  }
  s.object(null);
}

function drawCourt(s, rand) {
  const v = THREE.Vector3;
  // avenue
  for (const x of [-12, 12]) s.seg(s.main, new v(x, 0, 24), new v(x, 0, 340));
  for (const x of [-16, 16]) s.seg(s.fine, new v(x, 0, 66), new v(x, 0, 340));
  for (let z = 70; z < 340; z += 3) s.seg(s.fine, new v(-12, 0, z), new v(12, 0, z));
  // fountain plaza paving
  const F = 48;
  for (const r of [14, 18, 21]) s.circle(r === 18 ? s.main : s.fine, 0, 0, F, r, 96);
  for (let a = 0; a < 360; a += 7.5) {
    const t = a * Math.PI / 180;
    s.seg(s.fine, new v(Math.cos(t) * 14, 0, F + Math.sin(t) * 14), new v(Math.cos(t) * 18, 0, F + Math.sin(t) * 18));
  }
  for (const x of [-6, 6]) s.seg(s.main, new v(x, 0, 24), new v(x, 0, F - 18));

  // parterres
  for (const sd of [-1, 1]) {
    const x0 = sd > 0 ? 24 : -72, x1 = sd > 0 ? 72 : -24;
    s.block(x0, 0, 18, x1, 0.8, 74, { over: 0.3, arr: s.fine });
    s.block(x0 + 4, 0, 22, x1 - 4, 0.6, 70, { over: 0.2, arr: s.fine, solid: false });
    s.seg(s.fine, new v(x0 + 4, 0, 22), new v(x1 - 4, 0, 70));
    s.seg(s.fine, new v(x1 - 4, 0, 22), new v(x0 + 4, 0, 70));
    s.circle(s.fine, (x0 + x1) / 2, 0.01, 46, 5, 48);
    for (let z = 26; z <= 66; z += 13) drawPalm(s, (x0 + x1) / 2 + sd * 14, z, 10 + rand() * 3, (rand() - 0.5) * 0.6, rand);
  }
  // palm-lined approach
  for (let z = 84; z < 330; z += 18) {
    for (const x of [-19, 19]) drawPalm(s, x, z, 10 + rand() * 3.5, x < 0 ? 0.3 + rand() * 0.3 : -0.3 - rand() * 0.3, rand);
    for (const x of [-14.5, 14.5]) drawLamp(s, x, z + 9);
  }
  for (const [x, z] of [[-24, 30], [24, 30], [-26, 62], [26, 62]]) drawPalm(s, x, z, 12 + rand() * 2, x < 0 ? -0.2 : 0.2, rand);

  // fountain
  s.object('fountain', '#c4a272');
  s.cylinder(0, 0, F, 9, 1.2, 9, { n: 96 });
  s.disc(0, 1.23, F, 8.4, '#2f6fb0');
  s.disc(0, 5.53, F, 4.6, '#3a7cbc');
  s.disc(0, 8.93, F, 2.45, '#4588c6');
  s.circle(s.main, 0, 1.2, F, 8.4, 96);
  for (const x of [-9, 9]) s.seg(s.main, new v(x, 0, F), new v(x, 1.2, F));
  for (const r of [3, 5.2, 7.2]) s.circle(s.water, 0, 0.85, F, r, 64);
  s.cylinder(0, 1.2, F, 1.1, 4.3, 0.9, { n: 40 });
  for (const x of [-1.1, 1.1]) s.seg(s.main, new v(x, 1.2, F), new v(x * 0.82, 4.3, F));
  // lower bowl
  s.cylinder(0, 4.3, F, 1.3, 5.5, 4.8, { n: 72 });
  for (const sd of [-1, 1]) {
    const pts = [];
    for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push(new v(sd * (1.3 + 3.5 * Math.sin(t * Math.PI / 2)), 4.3 + 1.2 * t * t, F)); }
    s.poly(s.main, pts);
  }
  s.cylinder(0, 5.5, F, 0.55, 8.2, 0.45, { n: 32 });
  s.cylinder(0, 8.2, F, 0.6, 8.9, 2.5, { n: 56 });
  for (const sd of [-1, 1]) s.seg(s.main, new v(sd * 0.6, 8.2, F), new v(sd * 2.5, 8.9, F));
  s.cylinder(0, 8.9, F, 0.3, 9.6, 0.15, { n: 20 });
  // water: cascades from the top bowl, and jets from the basin rim (animated dashes)
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2, pts = [];
    for (let i = 0; i <= 8; i++) { const t = i / 8; const r = 2.5 + 1.9 * t; pts.push(new v(Math.cos(a) * r, 8.9 - 3.4 * t * t, F + Math.sin(a) * r)); }
    s.poly(s.water, pts);
  }
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2, pts = [];
    for (let i = 0; i <= 14; i++) { const t = i / 14; const r = 7.6 - 2.6 * t; pts.push(new v(Math.cos(a) * r, 1.2 + 5.6 * Math.sin(Math.PI * t) - 0.6 * t, F + Math.sin(a) * r)); }
    s.poly(s.water, pts);
  }
  s.object(null);
}

// ── Interior ─────────────────────────────────────────────────────

const HALL = { x: 18, z0: 9, z1: -170, wall: 20 };

function drawHall(s) {
  const v = THREE.Vector3, { x: W, z0, z1, wall } = HALL;
  for (const sd of [-1, 1]) {
    const x = sd * W;
    for (const y of [0, 1.2, wall - 0.6, wall]) s.seg(y === 0 || y === wall ? s.main : s.fine, new v(x, y, z0), new v(x, y, z1));
    for (let z = z0 - 3; z > z1; z -= 12) {
      s.block(Math.min(x, x - sd * 0.8), 0, z - 0.8, Math.max(x, x - sd * 0.8), wall, z + 0.8, { over: 0.2 });
      const mz = z - 6;
      if (mz < z1 + 2) continue;
      s.archX(s.main, x - sd * 0.01, mz, 2, 12.5, 6.6);
      s.archX(s.fine, x - sd * 0.01, mz, 2, 12.5, 7.6);
      // mirrored panels inside the arches, glowing softly at night
      for (let k = -2; k <= 2; k++) s.seg(s.fine, new v(x - sd * 0.02, 2.4, mz + k * 1.3), new v(x - sd * 0.02, 12.5 + Math.sqrt(Math.max(0, 3.3 ** 2 - (k * 1.3) ** 2)) - 0.2, mz + k * 1.3));
      s.lightX(x - sd * 0.03, mz - 3.3, 2, mz + 3.3, 12.5, -sd);
    }
  }
  // barrel vault ribs and coffers
  for (let z = z0 - 3; z > z1; z -= 12) {
    for (const r of [W, W - 0.7]) {
      const pts = [];
      for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI; pts.push(new v(Math.cos(a) * r, wall + Math.sin(a) * r, z)); }
      s.poly(r === W ? s.main : s.fine, pts);
    }
  }
  for (let k = 1; k < 8; k++) {
    const a = (k / 8) * Math.PI;
    s.seg(s.fine, new v(Math.cos(a) * W, wall + Math.sin(a) * W, z0), new v(Math.cos(a) * W, wall + Math.sin(a) * W, z1));
  }
  // marble floor: border bands and a diagonal grid
  for (const x of [-16, -15.4, 15.4, 16]) s.seg(s.fine, new v(x, 0.01, z0), new v(x, 0.01, z1));
  for (let c = -200; c < 60; c += 5) {
    const a = new v(-15.4, 0.01, c), b = new v(15.4, 0.01, c - 30.8);
    clipZ(s, s.fine, a, b, z1 + 12, z0);
    clipZ(s, s.fine, new v(15.4, 0.01, c), new v(-15.4, 0.01, c - 30.8), z1 + 12, z0);
  }
  for (const x of [-3.6, -3, 3, 3.6]) s.seg(s.accent, new v(x, 0.02, z0), new v(x, 0.02, -46));
  // chandeliers
  for (let z = -18; z > z1 + 20; z -= 24) {
    s.seg(s.fine, new v(0, wall + W, z), new v(0, 26.5, z));
    s.circle(s.main, 0, 26.5, z, 0.9, 24);
    s.circle(s.main, 0, 25, z, 3.2, 48);
    s.circle(s.fine, 0, 24, z, 2.3, 40);
    s.circle(s.fine, 0, 23.2, z, 1.4, 32);
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      s.seg(s.fine, new v(Math.cos(a) * 0.9, 26.5, z + Math.sin(a) * 0.9), new v(Math.cos(a) * 3.2, 25, z + Math.sin(a) * 3.2));
      s.seg(s.fine, new v(Math.cos(a) * 3.2, 25, z + Math.sin(a) * 3.2), new v(Math.cos(a) * 3.2, 24.1, z + Math.sin(a) * 3.2));
    }
    s.glow(0, 24.6, z, 14);
  }
}

function clipZ(s, arr, a, b, zmin, zmax) {
  // clip a floor segment to the hall's length
  const t0 = (zmax - a.z) / (b.z - a.z), t1 = (zmin - a.z) / (b.z - a.z);
  const lo = Math.max(0, Math.min(t0, t1)), hi = Math.min(1, Math.max(t0, t1));
  if (lo >= hi) return;
  s.seg(arr, a.clone().lerp(b, lo), a.clone().lerp(b, hi));
}

function drawConcierge(s) {
  const v = THREE.Vector3;
  // reception desk on the left, with a key wall and the house clock
  s.object('concierge', '#6b3a22');
  s.block(-15, 0, -27, -10.5, 2.5, -17, { over: 0.3 });
  s.block(-15.3, 2.5, -27.3, -10.2, 2.8, -16.7, { over: 0.3, paint: '#c9a35a' });
  s.planeX(-17.99, -27.4, 3.2, -16.6, 9.8, '#8a5a32');
  for (let z = -26; z < -17; z += 1.5) s.seg(s.fine, new v(-10.49, 0.3, z), new v(-10.49, 2.2, z));
  for (let y = 3.5; y < 9; y += 1.1) for (let z = -27; z < -17; z += 1.2) s.rectX(s.fine, -17.95, z, y, z + 0.8, y + 0.7);
  s.object(null);
  // elevator bank on the right with deco sunbursts
  s.object('lifts', '#b8913f');
  for (const z of [-16, -22, -28]) {
    s.planeX(17.98, z - 1.8, 0, z + 1.8, 7.5);
    s.planeX(17.98, z - 2, 8, z + 2, 10, '#d8b56a');
    s.rectX(s.main, 17.95, z - 1.8, 0, z + 1.8, 7.5);
    s.seg(s.fine, new v(17.95, 0, z), new v(17.95, 7.5, z));
    for (let k = 0; k <= 8; k++) {
      const a = (k / 8) * Math.PI;
      s.seg(s.fine, new v(17.94, 8, z), new v(17.94, 8 + Math.sin(a) * 2, z + Math.cos(a) * 2));
    }
    s.archX(s.main, 17.94, z, 8, 8, 4);
  }
  s.object(null);
}

function drawClock(s) {
  const v = THREE.Vector3, cx = -17.9, cy = 13.4, cz = -22, R = 2.4;
  const ring = r => { const pts = []; for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2; pts.push(new v(cx, cy + Math.sin(a) * r, cz + Math.cos(a) * r)); } s.poly(s.main, pts, true); };
  ring(R); ring(R - 0.35);
  for (let h = 0; h < 12; h++) {
    const a = (h / 12) * Math.PI * 2;
    s.seg(s.fine, new v(cx, cy + Math.cos(a) * (R - 0.4), cz + Math.sin(a) * (R - 0.4)), new v(cx, cy + Math.cos(a) * (R - 0.8), cz + Math.sin(a) * (R - 0.8)));
  }
  return { cx: cx + 0.05, cy, cz, R };
}

// The coin desk stands by the velvet ropes at the entrance to the casino floor:
// Miss Sterling behind it, a globe at one end, a coin on a stand at the other.
const DESK = { x0: 5.8, x1: 12.4, z0: -43.2, z1: -41.2, top: 3.0 };
const GLOBE = { pos: new THREE.Vector3(6.85, 4.2, -42.15), r: 0.66, tilt: 23.4 * Math.PI / 180 };
const COIN = { pos: new THREE.Vector3(11.35, 3.78, -42.2), r: 0.58 };
const KEEPER = new THREE.Vector3(9.25, 0, -44.3);

function drawCoinDesk(s) {
  const v = THREE.Vector3, { x0, x1, z0, z1, top } = DESK, front = z1 + 0.012;
  s.object('keeper', '#5b2b22');
  s.block(x0, 0, z0, x1, top - 0.25, z1, { over: 0.3 });
  s.block(x0 - 0.3, top - 0.25, z0 - 0.3, x1 + 0.3, top, z1 + 0.3, { over: 0.3, paint: '#c9a35a' });
  s.block(x0 - 0.15, 0, z0 - 0.15, x1 + 0.15, 0.25, z1 + 0.15, { over: 0.2, arr: s.fine, paint: '#3e1d17' });
  // fluting, broken by a medallion that carries the coin's star
  const mx = (x0 + x1) / 2, my = 1.38, mr = 0.78;
  for (let x = x0 + 0.45; x < x1 - 0.3; x += 0.45) {
    if (Math.abs(x - mx) < mr + 0.1) {
      const h = Math.sqrt(Math.max(0, (mr + 0.1) ** 2 - (x - mx) ** 2));
      s.seg(s.fine, new v(x, 0.4, front), new v(x, my - h, front)); s.seg(s.fine, new v(x, my + h, front), new v(x, top - 0.45, front));
    } else s.seg(s.fine, new v(x, 0.4, front), new v(x, top - 0.45, front));
  }
  const ring = (r, arr) => { const pts = []; for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2; pts.push(new v(mx + Math.cos(a) * r, my + Math.sin(a) * r, front + 0.005)); } s.poly(arr, pts, true); };
  ring(mr, s.main); ring(mr - 0.1, s.fine);
  { const g = new THREE.CircleGeometry(mr, 48); g.translate(mx, my, front); s.paintOnly(g, '#c9ccd0'); }
  const star = [];
  for (let k = 0; k <= 12; k++) { const r = k % 2 ? 0.27 : 0.5, a = Math.PI / 2 + (k * Math.PI) / 6; star.push(new v(mx + Math.cos(a) * r, my + Math.sin(a) * r, front + 0.01)); }
  s.poly(s.accent, star);
  { const sh = new THREE.Shape(star.slice(0, 12).map(p => new THREE.Vector2(p.x, p.y))); const g = new THREE.ShapeGeometry(sh); g.translate(0, 0, front + 0.006); s.paintOnly(g, '#d6b066'); }
  s.object(null);

  // the globe's brass stand: foot, stem and a half meridian ring
  const { pos: g, r: gr, tilt } = GLOBE;
  s.object('globe', '#b8913f');
  s.cylinder(g.x, top, g.z, 0.42, top + 0.12, 0.36, { n: 40 });
  s.cylinder(g.x, top + 0.12, g.z, 0.07, g.y - gr - 0.08, 0.06, { n: 12 });
  const mer = [];
  for (let i = 0; i <= 32; i++) {
    const a = -Math.PI / 2 + (i / 32) * Math.PI, rr = gr + 0.1;
    // a half circle in the x–y plane, tipped with the globe's axis
    const lx = -Math.cos(a) * rr, ly = Math.sin(a) * rr;
    mer.push(new v(g.x + lx * Math.cos(tilt) + ly * Math.sin(tilt), g.y - lx * Math.sin(tilt) + ly * Math.cos(tilt), g.z));
  }
  s.poly(s.main, mer);
  s.seg(s.main, new v(g.x, g.y - gr - 0.08, g.z), mer[0]);
  s.object(null);

  // the coin's stand: a little block with two brass prongs that cradle the rim
  const c = COIN.pos;
  s.object('coin', '#3e1d17');
  s.block(c.x - 0.42, top, c.z - 0.22, c.x + 0.42, top + 0.16, c.z + 0.22, { over: 0.06 });
  for (const sd of [-1, 1]) s.block(c.x + sd * 0.36 - 0.035, top + 0.16, c.z - 0.035, c.x + sd * 0.36 + 0.035, c.y - 0.3, c.z + 0.035, { over: 0.02, paint: '#c9a35a' });
  s.object(null);
}

const TABLE = { fortuna: new THREE.Vector3(0, 3, -66), ricochet: new THREE.Vector3(-8.5, 3, -88), frontier: new THREE.Vector3(8.5, 3, -88) };

function drawCasino(s) {
  const v = THREE.Vector3;
  // floor zone
  for (const inset of [0, 0.6]) {
    const pts = [new v(-14 + inset, 0.02, -48 - inset), new v(14 - inset, 0.02, -48 - inset), new v(14 - inset, 0.02, -100 + inset), new v(-14 + inset, 0.02, -100 + inset)];
    s.poly(s.accent, pts, true);
  }
  // Fortuna: round table with the twelve-armed star
  const { x: fx, z: fz } = TABLE.fortuna;
  s.object('fortuna', '#5e2f1c');
  s.cylinder(fx, 2.6, fz, 6, 3, 6, { n: 96 });
  s.disc(fx, 3.015, fz, 5.4, '#2c5e4c');
  s.circle(s.main, fx, 3.0, fz, 5.4, 96);
  for (const x of [-6, 6]) s.seg(s.main, new v(fx + x, 2.6, fz), new v(fx + x, 3, fz));
  s.cylinder(fx, 0, fz, 2.2, 2.6, 1.1, { n: 40 });
  for (const x of [-2.2, 2.2]) s.seg(s.main, new v(fx + x, 0, fz), new v(fx + x * 0.5, 2.6, fz));
  for (const r of [1.9, 2.8, 3.7]) s.circle(s.accent, fx, 3.04, fz, r, 64);
  s.circle(s.accent, fx, 3.04, fz, 0.9, 32);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    s.seg(s.accent, new v(fx + Math.cos(a) * 0.9, 3.04, fz + Math.sin(a) * 0.9), new v(fx + Math.cos(a) * 4.4, 3.04, fz + Math.sin(a) * 4.4));
    s.circle(s.accent, fx + Math.cos(a) * 4.8, 3.04, fz + Math.sin(a) * 4.8, 0.36, 16);
  }
  for (let k = 0; k < 4; k++) chair(s, fx, fz, k * Math.PI / 2 + Math.PI / 4, 7.8);
  s.object(null);
  pendant(s, fx, fz);

  // the two classic tables, still awaiting refurbishment
  for (const [cx, kind] of [[-8.5, 'ricochet'], [8.5, 'frontier']]) {
    const cz = -88;
    s.object(kind, '#5e2f1c');
    s.block(cx - 3.6, 2.6, cz - 2.4, cx + 3.6, 3, cz + 2.4, { over: 0.2 });
    { const g = new THREE.PlaneGeometry(6.2, 3.8); g.rotateX(-Math.PI / 2); g.translate(cx, 3.015, cz); s.paintOnly(g, kind === 'ricochet' ? '#7a2633' : '#2f5a3e'); }
    for (const [dx, dz] of [[-3, -1.8], [3, -1.8], [-3, 1.8], [3, 1.8]]) s.block(cx + dx - 0.18, 0, cz + dz - 0.18, cx + dx + 0.18, 2.6, cz + dz + 0.18, { over: 0, arr: s.fine });
    const felt = [new v(cx - 3.1, 3.04, cz - 1.9), new v(cx + 3.1, 3.04, cz - 1.9), new v(cx + 3.1, 3.04, cz + 1.9), new v(cx - 3.1, 3.04, cz + 1.9)];
    s.poly(s.accent, felt, true);
    if (kind === 'frontier') for (let k = -2; k <= 2; k++) s.poly(s.accent, [new v(cx + k * 1.15 - 0.4, 3.04, cz - 0.6), new v(cx + k * 1.15 + 0.4, 3.04, cz - 0.6), new v(cx + k * 1.15 + 0.4, 3.04, cz + 0.6), new v(cx + k * 1.15 - 0.4, 3.04, cz + 0.6)], true);
    else {
      // the zoetrope drum turns at the centre (see createVenue); drawn here are its outline
      // and the pearl on a thin gold arm that stands in for the ball
      s.object(null);
      s.cylinder(cx, 3.02, cz, 1.63, 3.77, 1.6, { n: 96 });
      s.circle(s.accent, cx, 3.775, cz, 1.44, 96);
      s.object(kind, '#5e2f1c');
      const az = cz - 1.95;
      s.block(cx - 0.05, 3.02, az - 0.05, cx + 0.05, 4.35, az + 0.05, { over: 0.02, paint: '#c9a35a' });
      s.block(cx - 0.04, 4.31, az, cx + 0.04, 4.37, cz - 1.25, { over: 0.02, paint: '#c9a35a' });
      { const g = new THREE.SphereGeometry(0.13, 16, 12); g.translate(cx, 4.18, cz - 1.25); s.solids.push(g); s.paintOnly(g.clone(), '#f3ead6'); }
      s.circle(s.main, cx, 4.18, cz - 1.25, 0.13, 16);
    }
    for (const dz of [-3.6, 3.6]) chair(s, cx, cz + dz, dz < 0 ? Math.PI / 2 : -Math.PI / 2, 0, true);
    s.object(null);
    pendant(s, cx, cz);
  }
  // velvet ropes at the entrance to the floor
  for (const sd of [-1, 1]) {
    for (const x of [sd * 5, sd * 13]) { s.seg(s.main, new v(x, 0, -48), new v(x, 2.2, -48)); s.circle(s.main, x, 2.3, -48, 0.18, 10); }
    const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(new v(sd * (5 + 8 * t), 2.1 - Math.sin(t * Math.PI) * 0.7, -48)); }
    s.poly(s.accent, pts);
  }
}

function chair(s, cx, cz, a, r, local = false) {
  const x = local ? cx : cx + Math.cos(a) * r, z = local ? cz : cz + Math.sin(a) * r;
  s.block(x - 0.7, 1.4, z - 0.7, x + 0.7, 1.7, z + 0.7, { over: 0.1 });
  const bx = x + Math.cos(a) * 0.7, bz = z + Math.sin(a) * 0.7;
  s.block(bx - 0.6 * Math.abs(Math.sin(a)) - 0.12, 1.7, bz - 0.6 * Math.abs(Math.cos(a)) - 0.12, bx + 0.6 * Math.abs(Math.sin(a)) + 0.12, 3.6, bz + 0.6 * Math.abs(Math.cos(a)) + 0.12, { over: 0.1 });
  for (const [dx, dz] of [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]]) s.seg(s.fine, new THREE.Vector3(x + dx, 0, z + dz), new THREE.Vector3(x + dx, 1.4, z + dz));
}

function pendant(s, x, z) {
  const v = THREE.Vector3;
  s.seg(s.fine, new v(x, HALL.wall + HALL.x - 0.5, z), new v(x, 13.2, z));
  s.circle(s.main, x, 13.2, z, 0.5, 20);
  s.circle(s.main, x, 11.8, z, 1.8, 40);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    s.seg(s.fine, new v(x + Math.cos(a) * 0.5, 13.2, z + Math.sin(a) * 0.5), new v(x + Math.cos(a) * 1.8, 11.8, z + Math.sin(a) * 1.8));
  }
  s.glow(x, 11.4, z, 9);
}

function drawTheater(s) {
  const v = THREE.Vector3, z = HALL.z1 + 0.05;
  s.object('theater', '#6b3a22');
  s.archPanelZ(0, 2.2, 15, 23, z + 0.01, '#8e1f2b');
  s.block(-12.5, 0, HALL.z1, 12.5, 2.2, HALL.z1 + 9, { over: 0.4 });
  { const g = new THREE.PlaneGeometry(18, 4.5); g.translate(0, 30.75, z + 0.01); s.paintOnly(g, '#c9a35a'); }
  for (let k = 0; k < 3; k++) s.block(-5, 0, HALL.z1 + 9 + k * 0.8, 5, 2.2 - (k + 1) * 0.55, HALL.z1 + 9.8 + k * 0.8, { over: 0.2 });
  // proscenium
  s.archZ(s.main, 0, 2.2, 15, 23, z);
  s.archZ(s.main, 0, 2.2, 15, 25.4, z);
  s.archZ(s.fine, 0, 2.2, 15, 24.2, z);
  // curtain folds
  for (let x = -11.2; x <= 11.2; x += 0.9) {
    const top = 15 + Math.sqrt(Math.max(0, 11.5 ** 2 - x * x)) - 0.6, pts = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new v(x + Math.sin(t * 9 + x) * 0.12, 2.2 + (top - 2.2) * t, z + 0.02)); }
    s.poly(s.fine, pts);
  }
  for (let k = -5; k < 5; k++) {
    const pts = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new v((k + t) * 2.3, 24.2 - Math.sin(t * Math.PI) * 1.4, z + 0.03)); }
    s.poly(s.main, pts);
  }
  // marquee with bulbs
  s.rectZ(s.main, -9, 28.5, 9, 33, z);
  s.rectZ(s.fine, -8.4, 29.1, 8.4, 32.4, z);
  for (let x = -8.7; x <= 8.7; x += 0.87) { s.glow(x, 28.8, z + 0.1, 1.4); s.glow(x, 32.7, z + 0.1, 1.4); }
  for (let x = -10; x <= 10; x += 1.5) s.glow(x, 2.5, HALL.z1 + 8.8, 1.8);
  s.object(null);
  // seats
  for (let r = 0; r < 5; r++) {
    const rz = HALL.z1 + 18 + r * 3;
    for (let c = -5; c <= 5; c++) {
      if (c === 0) continue;
      const x = c * 2.2;
      s.block(x - 0.85, 0, rz - 0.6, x + 0.85, 1.2, rz + 0.6, { over: 0.05, arr: s.fine });
      s.block(x - 0.85, 1.2, rz + 0.45, x + 0.85, 2.6 + r * 0.05, rz + 0.75, { over: 0.05, arr: s.fine });
    }
  }
}

// ── Façade art: the five APC suits, engraved onto a canvas ─────

function engraveSuit(ctx, path, cx, cy, size) {
  // raster union outline: dilate the filled mask, then cut the mask out
  const S = Math.ceil(size + 60), off = document.createElement('canvas');
  off.width = off.height = S;
  const mask = document.createElement('canvas'); mask.width = mask.height = S;
  const m = mask.getContext('2d');
  m.translate(30, 30); m.scale(size / 100, size / 100); m.fillStyle = '#fff'; m.fill(path);
  const o = off.getContext('2d');
  const dilate = (r, op) => {
    o.globalCompositeOperation = op;
    for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2; o.drawImage(mask, Math.cos(a) * r, Math.sin(a) * r); }
  };
  dilate(size * 0.06, 'source-over');
  dilate(size * 0.045, 'destination-out');
  dilate(size * 0.018, 'source-over');
  o.globalCompositeOperation = 'destination-out'; o.drawImage(mask, 0, 0);
  // engraved hatching inside the suit
  const h = document.createElement('canvas'); h.width = h.height = S;
  const hc = h.getContext('2d');
  hc.strokeStyle = 'rgba(255,255,255,0.75)'; hc.lineWidth = Math.max(1.2, size / 160);
  for (let d = -S; d < S * 2; d += Math.max(5, size / 38)) { hc.beginPath(); hc.moveTo(d, 0); hc.lineTo(d - S, S); hc.stroke(); }
  hc.globalCompositeOperation = 'destination-in'; hc.drawImage(mask, 0, 0);
  o.globalCompositeOperation = 'source-over'; o.drawImage(h, 0, 0);
  ctx.drawImage(off, cx - S / 2, cy - S / 2);
}

async function facadeTexture() {
  const W = 1000, H = 1200, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const { spades, clubs, hearts, diamonds, star } = await loadSuits();
  ctx.strokeStyle = '#fff';
  // scrollwork connecting the suits
  ctx.lineWidth = 5;
  const scroll = (x0, y0, x1, y1, bend) => {
    ctx.beginPath(); ctx.moveTo(x0, y0);
    ctx.bezierCurveTo(x0 + bend, y0 - bend * 0.4, x1 - bend, y1 + bend * 0.4, x1, y1); ctx.stroke();
    ctx.beginPath(); ctx.arc(x1, y1, 16, 0, Math.PI * 2); ctx.stroke();
  };
  ctx.beginPath(); ctx.arc(500, 600, 300, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(500, 600, 318, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 4;
  scroll(500, 300, 120, 80, 120); scroll(500, 300, 880, 80, -120);
  scroll(500, 900, 120, 1120, 120); scroll(500, 900, 880, 1120, -120);
  scroll(200, 600, 60, 600, 40); scroll(800, 600, 940, 600, -40);
  engraveSuit(ctx, spades, 500, 600, 400);
  engraveSuit(ctx, clubs, 205, 215, 250);
  engraveSuit(ctx, hearts, 795, 215, 250);
  engraveSuit(ctx, diamonds, 205, 985, 250);
  engraveSuit(ctx, star, 795, 985, 250);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  return tex;
}

// ── Assembly ─────────────────────────────────────────────────────

function lineMaterial(color, width, opts = {}) {
  const m = new LineMaterial({ color, linewidth: width, transparent: opts.opacity !== undefined, opacity: opts.opacity ?? 1, dashed: !!opts.dashed, dashSize: 0.5, gapSize: 0.35 });
  m.fog = true;
  // ink always sits on top of the surface it is drawn on: pull it toward the eye so it never
  // fights the invisible solids, the watercolor or the window glow for the same depth
  m.polygonOffset = true; m.polygonOffsetFactor = -1; m.polygonOffsetUnits = -4;
  m.alphaToCoverage = true;
  return m;
}

function build(sheet, mats) {
  const group = new THREE.Group();
  const add = (arr, mat, dashed) => {
    if (!arr.length) return;
    const g = new LineSegmentsGeometry(); g.setPositions(arr);
    const l = new LineSegments2(g, mat);
    if (dashed) l.computeLineDistances();
    group.add(l);
  };
  add(sheet.main, mats.main); add(sheet.fine, mats.fine); add(sheet.accent, mats.accent); add(sheet.water, mats.water, true);
  if (sheet.solids.length) {
    // solids must fill the depth buffer before any ink is drawn
    const solids = new THREE.Mesh(mergeGeometries(sheet.solids), mats.occluder);
    solids.renderOrder = -1;
    group.add(solids);
  }
  if (sheet.lights.length) {
    const lit = new THREE.Mesh(mergeGeometries(sheet.lights), mats.window);
    lit.userData.nightOnly = true; group.add(lit);
  }
  for (const gl of sheet.glows) {
    const sp = new THREE.Sprite(mats.glow);
    sp.position.copy(gl.pos); sp.scale.setScalar(gl.size);
    sp.userData.nightOnly = true; group.add(sp);
  }
  // one watercolor wash per paintable object, sharing the occluders' depth so ink stays on top
  group.userData.paints = Object.entries(sheet.paints).map(([name, geos]) => {
    const geo = mergeGeometries(geos);
    const material = watercolorMaterial();
    const mesh = new THREE.Mesh(geo, material);
    mesh.renderOrder = 1;
    geo.computeBoundingSphere();
    group.add(mesh);
    return { name, mesh, material, center: geo.boundingSphere.center.clone(), radius: geo.boundingSphere.radius };
  });
  return group;
}

// What each painted thing is called, and what touching it does.
export const OBJECTS = {
  portico: { label: 'The doors', hint: 'Walk in' },
  fountain: { label: 'The fountain', hint: 'Toss in a wish' },
  concierge: { label: 'The concierge', hint: 'Your purse and ledger' },
  lifts: { label: 'Hotel lifts', hint: 'The Grand Hotel opens later' },
  fortuna: { label: 'Fortuna', hint: 'Take a seat' },
  ricochet: { label: 'Ricochet', hint: 'Take a seat' },
  frontier: { label: 'Frontier', hint: 'Take a seat' },
  theater: { label: 'The Theater', hint: 'Dark tonight' },
  merchant: { label: 'Mr. Jeremiah Thistlewood', hint: 'Merchant of Bristol, in his cups' },
  keeper: { label: 'Miss Vivienne Sterling', hint: 'Keeper of the Coin · hear her out' },
  globe: { label: 'The globe', hint: 'Where the coins are' },
  coin: { label: 'The Casino Camino Coin', hint: 'Turn it in your hand' },
};

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// ── Camera path: the camino ─────────────────────────────────────

const KEYS = [
  { pos: [0, 52, 380], tgt: [0, 46, 0] },
  { pos: [0, 16, 205], tgt: [0, 44, 0], stop: 0 },
  { pos: [0, 9, 128], tgt: [0, 34, 0] },
  { pos: [-8, 6.5, 86], tgt: [3, 19, 0], stop: 1 },
  { pos: [15, 4, 52], tgt: [0, 6, 10] },
  { pos: [5, 3.6, 30], tgt: [0, 4.5, 0] },
  { pos: [0, 3.8, 16], tgt: [0, 4.2, -20] },
  { pos: [3, 5.6, -3], tgt: [-6, 6, -30], stop: 2 },
  { pos: [-3.5, 6.2, -26], tgt: [7.6, 4.4, -44], stop: 3 },
  { pos: [-1, 9, -33], tgt: [0, 3, -66] },
  { pos: [0, 14, -44], tgt: [0, 2, -72], stop: 4 },
  { pos: [0, 8, -100], tgt: [0, 10, -170] },
  { pos: [0, 7, -122], tgt: [0, 16, -170], stop: 5 },
];
export const STOP_KEYS = KEYS.map((k, i) => (k.stop !== undefined ? i : -1)).filter(i => i >= 0);

// The long walk: what wakes up in colour while the camera rests in each room.
const ROOMS = [['portico'], ['fountain'], ['concierge', 'lifts'], ['keeper', 'globe', 'coin'], ['fortuna', 'ricochet', 'frontier', 'merchant'], ['theater']];

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export async function createVenue(canvas, { night, wash, onHover = () => {}, onActivate = () => {} }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 1.2, 800);
  scene.fog = new THREE.Fog(0, 140, 560);

  const mats = {
    main: lineMaterial(0, 1.35),
    fine: lineMaterial(0, 0.85, { opacity: 0.7 }),
    accent: lineMaterial(0, 1.2),
    water: lineMaterial(0, 1.1, { dashed: true }),
    occluder: new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 8 }),
    window: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
    glow: new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.85 }),
    panel: new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
  };
  const lineMats = [mats.main, mats.fine, mats.accent, mats.water];

  const rand = rng(1907);
  const ext = new Sheet();
  drawFacade(ext); drawTowers(ext, -1, rand); drawTowers(ext, 1, rand); drawCourt(ext, rand);
  const exterior = build(ext, mats);
  scene.add(exterior);

  const int = new Sheet();
  drawHall(int); drawConcierge(int); drawCoinDesk(int); drawCasino(int); drawTheater(int);
  const clockFace = drawClock(int);
  const interior = build(int, mats);
  interior.visible = false;
  scene.add(interior);

  // the house clock keeps real local time
  const clockGeo = new LineSegmentsGeometry();
  const clock = new LineSegments2(clockGeo, mats.main);
  interior.add(clock);
  const setClock = () => {
    const d = new Date(), h = (d.getHours() % 12 + d.getMinutes() / 60) / 12, m = d.getMinutes() / 60;
    const { cx, cy, cz, R } = clockFace;
    const hand = (f, len) => [cx, cy, cz, cx, cy + Math.cos(f * Math.PI * 2) * len, cz - Math.sin(f * Math.PI * 2) * len];
    clockGeo.setPositions([...hand(h, R * 0.5), ...hand(m, R * 0.78)]);
  };
  setClock(); setInterval(setClock, 30e3);

  // façade suits, then the 3D title from the Foundry STL
  facadeTexture().then(tex => {
    mats.panel.map = tex; mats.panel.needsUpdate = true;
    const p = new THREE.Mesh(new THREE.PlaneGeometry(31.2, 37.6), mats.panel);
    p.position.set(0, 48, 0.04);
    exterior.add(p);
  }).catch(() => {});
  assetBinary('Casino Camino Title/3D Title/CasinoCamino3dTitle.stl').then(buf => {
    const geo = new STLLoader().parse(buf);
    geo.computeBoundingBox();
    const bb = geo.boundingBox, c = bb.getCenter(new THREE.Vector3());
    const k = 26 / (bb.max.x - bb.min.x);
    geo.translate(-c.x, -c.y, -c.z); geo.scale(k, k, k);
    geo.translate(0, 23.4, 1.2);
    const edges = new THREE.EdgesGeometry(geo, 28);
    const lg = new LineSegmentsGeometry(); lg.setPositions(edges.attributes.position.array);
    exterior.add(new LineSegments2(lg, mats.accent));
    const solid = new THREE.Mesh(geo, mats.occluder); solid.renderOrder = -1; exterior.add(solid);
  }).catch(() => {});

  // ── paintables: the things a guest can touch
  const paintables = [];
  const register = (group, inside) => group.userData.paints.forEach(p => {
    paintables.push(Object.assign(new Paintable({ name: p.name, label: OBJECTS[p.name]?.label, materials: [p.material], hit: p.mesh, center: p.center, radius: p.radius }), { inside }));
  });
  register(exterior, false); register(interior, true);

  const merchant = createMerchant();
  merchant.mesh.position.set(9, 0, -71);
  interior.add(merchant.mesh);
  paintables.push(Object.assign(new Paintable({ name: 'merchant', materials: [merchant.material], hit: merchant.mesh, center: new THREE.Vector3(), radius: 1 }), { inside: true }));

  // ── the coin desk: Miss Sterling, her globe and the coin
  // extra pieces join the paintable of the desk part they belong to, and wake with it
  const join = (name, material, mesh, radius) => {
    const pt = paintables.find(p => p.name === name);
    if (material) {
      pt.materials.push(material);
      if (material.uniforms.uOrigin.value.isVector3) material.uniforms.uOrigin.value.copy(pt.center);
      if (radius) pt.materials.forEach(m => { if (m.uniforms.uRadius) m.uniforms.uRadius.value = radius; });
      material.uniforms.uReveal.value = pt.reveal;
    }
    (pt.extraHits ??= []).push(mesh);
  };
  const keeper = createKeeper();
  keeper.mesh.position.copy(KEEPER);
  interior.add(keeper.mesh);
  join('keeper', keeper.material, keeper.mesh);
  const figures = [merchant, keeper];

  // the globe turns slowly on its tipped axis: ink lines over a hidden ball, watercolour seas and lands when touched
  const globeTilt = new THREE.Group(), globeSpin = new THREE.Group();
  globeTilt.position.copy(GLOBE.pos); globeTilt.rotation.z = -GLOBE.tilt;
  globeTilt.add(globeSpin); interior.add(globeTilt);
  const globeMat = watercolorMaterial();
  const globeBall = new THREE.Mesh(tint(new THREE.SphereGeometry(GLOBE.r, 48, 32), '#ffffff'), globeMat);
  globeBall.renderOrder = 1;
  const globeHide = new THREE.Mesh(new THREE.SphereGeometry(GLOBE.r * 0.995, 32, 24), mats.occluder);
  globeHide.renderOrder = -1;
  globeSpin.add(globeBall, globeHide);
  {
    const grat = [], R = GLOBE.r * 1.003, p = new THREE.Vector3(), q = new THREE.Vector3();
    for (let lon = 0; lon < 180; lon += 30) for (let i = 0; i < 48; i++) {
      lonLatToVec(lon, -180 + i * 7.5, R, p); lonLatToVec(lon, -180 + (i + 1) * 7.5, R, q); grat.push(p.x, p.y, p.z, q.x, q.y, q.z);
    }
    for (let lat = -60; lat <= 60; lat += 30) for (let i = 0; i < 48; i++) {
      lonLatToVec(i * 7.5, lat, R, p); lonLatToVec((i + 1) * 7.5, lat, R, q); grat.push(p.x, p.y, p.z, q.x, q.y, q.z);
    }
    const g = new LineSegmentsGeometry(); g.setPositions(grat);
    globeSpin.add(new LineSegments2(g, mats.fine));
  }
  join('globe', globeMat, globeBall, 1.4);
  // the coastlines in ink, and the map for the watercolour, once the land has been fetched
  loadLand().then(polys => {
    if (!polys.length) return;
    const coast = [], R = GLOBE.r * 1.004, p = new THREE.Vector3(), q = new THREE.Vector3();
    for (const poly of polys) for (const ring of poly) for (let i = 1; i < ring.length; i++) {
      if (Math.abs(ring[i][0] - ring[i - 1][0]) > 90) continue;
      lonLatToVec(...ring[i - 1], R, p); lonLatToVec(...ring[i], R, q); coast.push(p.x, p.y, p.z, q.x, q.y, q.z);
    }
    const g = new LineSegmentsGeometry(); g.setPositions(coast);
    globeSpin.add(new LineSegments2(g, mats.main));
    return worldCanvas({ width: 1024, sea: '#5d8fb5', land: '#d9c48e', coast: '#6d5a3a', coastWidth: 1.2 });
  }).then(c => {
    if (!c) return;
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    globeMat.uniforms.uMap.value = tex; globeMat.uniforms.uHasMap.value = 1;
  }).catch(() => {});

  // the coin on its stand: like the chip, always in colour
  const coinPivot = new THREE.Group();
  coinPivot.position.copy(COIN.pos);
  interior.add(coinPivot);
  buildCoin(matcapMaterials()).then(({ group, body, top, back }) => {
    group.scale.setScalar(COIN.r / COIN_R);
    coinPivot.add(group);
    [body, top, back].forEach(m => join('coin', null, m));
  }).catch(() => {});

  // ── the chip: stacks on every table, and a monument spinning above the fountain
  const fz = TABLE.fortuna.z;
  const seatStacks = [];
  [[45, 'camino'], [135, 'jade'], [225, 'sapphire'], [315, 'ivory']].forEach(([deg, pal], k) => {
    const a = deg * Math.PI / 180;
    for (let j = -1; j <= 1; j++) {
      const r = 4.9, b = a + j * 0.075;
      seatStacks.push({ x: Math.cos(b) * r, y: 3, z: fz + Math.sin(b) * r, count: 4 + ((k * 3 + j * 5 + 9) % 7), palette: j === 0 ? 'camino' : pal });
    }
  });
  for (const [cx, pal] of [[-8.5, 'sapphire'], [8.5, 'jade']]) {
    seatStacks.push({ x: cx - 2.2, y: 3, z: -88 + 1.2, count: 6, palette: pal }, { x: cx - 1.5, y: 3, z: -88 + 1.3, count: 9, palette: 'camino' }, { x: cx + 2.4, y: 3, z: -88 - 1.2, count: 5, palette: 'ivory' });
  }
  chipStacks(seatStacks, rng(52)).then(g => interior.add(g)).catch(() => {});
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2(), occluderMeshes = [];
  // Ricochet's wheel turns on its table all night: six tiles around a chip hub
  // Ricochet's table piece: a gold zoetrope drum, always in colour like the chip
  const zoetrope = createZoetrope();
  zoetrope.group.position.set(TABLE.ricochet.x, 3.02, TABLE.ricochet.z);
  interior.add(zoetrope.group);
  paintables.find(p => p.name === 'ricochet').extraHits = [zoetrope.mesh];

  let monument = null;
  bigChip(1.7).then(c => { monument = c; c.position.set(0, 11.6, 48); exterior.add(c); }).catch(() => {});

  // ── pointer: hover paints, click keeps the paint and acts
  [exterior, interior].forEach(g => g.children.forEach(o => { if (o.isMesh && o.material === mats.occluder) occluderMeshes.push(o); }));
  let hovered = null, pointerIn = false, lastClient = { x: 0, y: 0 }, downAt = null;
  canvas.addEventListener('pointermove', e => { pointerIn = true; lastClient = { x: e.clientX, y: e.clientY }; ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); });
  canvas.addEventListener('pointerleave', () => { pointerIn = false; });
  canvas.addEventListener('pointerdown', e => { downAt = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('pointerup', e => {
    if (tour || !downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 8) return;
    // touch screens have no hover: the first tap paints and picks
    if (e.pointerType !== 'mouse') { ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); pick(); }
    if (hovered) { hovered.keep(); onActivate(hovered.name); }
  });

  function pick() {
    const inside = camera.position.z < HALL.z0;
    raycaster.setFromCamera(ndc, camera);
    const candidates = paintables.filter(p => p.inside === inside);
    const hits = raycaster.intersectObjects([...candidates.flatMap(p => [p.hit, ...(p.extraHits ?? [])]), ...occluderMeshes.filter(o => o.parent.visible)], false);
    let found = null, point = null, uv = null;
    const nearest = hits[0]?.distance ?? Infinity;
    for (const h of hits) {
      if (h.distance > nearest + 0.08) break;
      const p = candidates.find(c => c.hit === h.object || c.extraHits?.includes(h.object));
      if (!p) continue;
      if (h.object.userData.hitTest && !h.object.userData.hitTest(h.uv)) continue;
      found = p; point = h.point; uv = h.uv; break;
    }
    if (found !== hovered) {
      hovered?.leave();
      hovered = found;
      canvas.style.cursor = found ? 'pointer' : '';
    }
    if (found) found.touch(point, uv);
    onHover(found ? { name: found.name, ...OBJECTS[found.name] } : null, lastClient.x, lastClient.y);
  }

  // ── theme
  let isNight = night;
  function setTheme(n) {
    isNight = n;
    const t = THEMES[n ? 'night' : 'day'];
    renderer.setClearColor(t.paper);
    scene.fog.color.set(t.paper);
    mats.main.color.set(t.ink); mats.fine.color.set(t.fine); mats.accent.color.set(t.accent); mats.water.color.set(t.water);
    mats.panel.color.set(t.ink);
    mats.window.color.set(t.window); mats.glow.color.set(t.glow);
    mats.fine.opacity = n ? 0.8 : 0.7;
    scene.traverse(o => { if (o.userData.nightOnly) o.visible = n; });
    scene.traverse(o => { if (o.material?.uniforms?.uNight) o.material.uniforms.uNight.value = n ? 1 : 0; });
    for (const f of figures) { f.material.uniforms.uLine.value.set(t.ink); f.material.uniforms.uPaper.value.set(t.paper); }
  }
  setTheme(night);

  // ── camera
  const posCurve = new THREE.CatmullRomCurve3(KEYS.map(k => new THREE.Vector3(...k.pos)), false, 'centripetal');
  const tgtCurve = new THREE.CatmullRomCurve3(KEYS.map(k => new THREE.Vector3(...k.tgt)), false, 'centripetal');
  const at = p => {
    const u = THREE.MathUtils.clamp(p / (KEYS.length - 1), 0, 1);
    return { pos: posCurve.getPoint(u), tgt: tgtCurve.getPoint(u) };
  };

  let p = 0;
  let travel = null;       // {from, to, t0, dur, resolve}
  let fly = null;          // {from:{pos,tgt}, to:{pos,tgt}, t0, dur, resolve}
  let pose = at(0);
  let free = null;         // a pose held off the path (e.g. hovering over a table)
  let paused = false;
  let tour = null;         // the long walk, while it runs
  let veil = 0, veilTo = 0; // a fade to paper, for cuts
  const pointer = new THREE.Vector2(), look = new THREE.Vector2();
  addEventListener('pointermove', e => { pointer.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5); });

  function goToKey(k, dur) {
    if (fly) return Promise.resolve();
    travel?.resolve?.();
    const d = dur ?? 1.3 + Math.abs(k - p) * 0.55;
    return new Promise(resolve => { travel = { from: p, to: k, t0: performance.now(), dur: d * 1000, resolve }; });
  }
  function flyTo(to, dur = 1.6) {
    travel = null;
    const from = { pos: camera.position.clone(), tgt: pose.tgt.clone() };
    return new Promise(resolve => { fly = { from, to: { pos: to.pos.clone(), tgt: to.tgt.clone() }, t0: performance.now(), dur: dur * 1000, resolve }; });
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? Math.min(78, 40 / (w / h) * 0.8) : 40;
    // on portrait screens the stop card covers the lower half, so lift the drawing into the upper half
    if (w / h < 1 && !tour) camera.setViewOffset(w, h, 0, h * 0.2, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    lineMats.forEach(m => m.resolution.set(w, h));
  }
  addEventListener('resize', resize);
  resize();

  const clockStart = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    if (paused) return;
    if (travel) {
      const t = THREE.MathUtils.clamp((now - travel.t0) / travel.dur, 0, 1);
      p = travel.from + (travel.to - travel.from) * ease(t);
      if (t >= 1) { const r = travel.resolve; travel = null; r(); }
    }
    if (fly) {
      const t = THREE.MathUtils.clamp((now - fly.t0) / fly.dur, 0, 1), e = ease(t);
      pose = { pos: fly.from.pos.clone().lerp(fly.to.pos, e), tgt: fly.from.tgt.clone().lerp(fly.to.tgt, e) };
      if (t >= 1) { free = fly.to; const r = fly.resolve; fly = null; r(); }
    } else if (free) {
      pose = { pos: free.pos.clone(), tgt: free.tgt.clone() };
    } else {
      pose = at(p);
    }
    // a gentle breath and a glance toward the pointer
    const time = (now - clockStart) / 1000;
    look.lerp(pointer, 0.04);
    if (look.distanceToSquared(pointer) < 1e-6) look.copy(pointer);
    camera.position.copy(pose.pos);
    const tgt = pose.tgt.clone();
    if (tour) { tgt.x += Math.sin(time * 0.23) * 1.6; tgt.y += Math.sin(time * 0.17) * 0.6; }
    else if (!free) { tgt.x += look.x * 3; tgt.y -= look.y * 1.5; }
    camera.lookAt(tgt);

    const z = camera.position.z, inside = z < HALL.z0;
    exterior.visible = !inside; interior.visible = inside;
    scene.fog.near = inside ? 60 : 140; scene.fog.far = inside ? 230 : 560;
    veil += Math.sign(veilTo - veil) * Math.min(Math.abs(veilTo - veil), 0.035);
    if (wash) wash.style.opacity = Math.max(veil, 1 - Math.abs(z - HALL.z0) / 5.5).toFixed(3);

    mats.water.dashOffset = -time * 1.6;

    const dt = Math.min(0.05, (now - (frame.last ?? now)) / 1000); frame.last = now;
    if (pointerIn && !fly && !free && !tour) pick();
    else if (hovered && (fly || free || tour)) { hovered.leave(); hovered = null; canvas.style.cursor = ''; onHover(null); }
    paintables.forEach(pt => pt.step(dt));
    // he sways, and always turns to face whoever is looking at him
    const mm = merchant.mesh;
    mm.rotation.set(0, Math.atan2(camera.position.x - mm.position.x, camera.position.z - mm.position.z), Math.sin(time * 1.3) * 0.045);
    // Miss Sterling keeps her poise: she turns to you, and only just breathes
    const km = keeper.mesh;
    km.rotation.set(0, Math.atan2(camera.position.x - km.position.x, camera.position.z - km.position.z), Math.sin(time * 0.9) * 0.012);
    globeSpin.rotation.y = time * 0.12;
    coinPivot.rotation.y = time * 0.55;
    if (monument) monument.rotation.y = Math.sin(time * 0.45) * 0.55;
    zoetrope.update(time);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  return {
    setTheme,
    get night() { return isNight; },
    stopCount: STOP_KEYS.length,
    goToStop: (i, dur) => goToKey(STOP_KEYS[i], dur),
    jumpToStop: i => { travel = null; p = STOP_KEYS[i]; },
    // up close to the globe or the coin on the desk
    flyToDesk: name => {
      const at = name === 'globe' ? GLOBE.pos : COIN.pos;
      return flyTo({ pos: at.clone().add(new THREE.Vector3(name === 'globe' ? 0.9 : -0.9, 0.5, 2.6)), tgt: at.clone() }, 1.5);
    },
    flyToTable: (name = 'fortuna') => name === 'ricochet'
      // low and from the side, so the galloping band passes right in front of you
      ? flyTo({ pos: TABLE.ricochet.clone().add(new THREE.Vector3(0.6, 1.9, 4.6)), tgt: TABLE.ricochet.clone().add(new THREE.Vector3(0, 0.45, 0)) }, 1.8)
      : flyTo({ pos: TABLE[name].clone().add(new THREE.Vector3(0, 9, 0.6)), tgt: TABLE[name].clone() }, 1.5),
    async returnToStop(i) {
      const back = at(STOP_KEYS[i]);
      await flyTo(back, 1.4);
      free = null; p = STOP_KEYS[i];
    },
    setPaused(v) { paused = v; },
    tour: runTour,
    endTour() { if (!tour || tour.cancelled) return; tour.cancelled = true; tour.wake?.(); if (travel) { const r = travel.resolve; travel = null; r(); } },
  };

  // ── the long walk: from the far approach through every room, resting in each while it comes to colour
  async function runTour() {
    if (tour || fly || free) return;
    const t = tour = { cancelled: false, wake: null };
    hovered?.leave(); hovered = null; canvas.style.cursor = ''; onHover(null);
    const wait = ms => new Promise(r => { const id = setTimeout(r, ms); t.wake = () => { clearTimeout(id); r(); }; });
    const veilTo_ = async (v, ms = 900) => { veilTo = v; await wait(ms); };
    const lit = [];

    await veilTo_(1);
    resize(); travel = null; p = 0;
    if (!t.cancelled) await veilTo_(0, 700);
    let from = 0;
    for (const [i, key] of STOP_KEYS.entries()) {
      if (t.cancelled) break;
      await goToKey(key, 2.6 + (key - from) * 1.5);
      from = key;
      if (t.cancelled) break;
      // the room wakes up, one thing after another
      for (const name of ROOMS[i]) {
        const pt = paintables.find(x => x.name === name);
        if (!pt) continue;
        pt.touch(pt.center); lit.push(pt);
        await wait(650);
        if (t.cancelled) break;
      }
      await wait(3200);
      lit.splice(0).forEach(pt => pt.leave());
    }
    lit.forEach(pt => pt.leave());
    t.wake = null;
    // back to the doors
    veilTo = 1; await new Promise(r => setTimeout(r, 900));
    travel = null; p = STOP_KEYS[0];
    tour = null; resize();
    veilTo = 0; await new Promise(r => setTimeout(r, 700));
  }
}

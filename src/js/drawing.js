// The pen: a sheet of ink lines over invisible solids, with watercolour for whatever a guest can touch.
// Shared by the venue and the resort's rooms.

import * as THREE from 'three';
import { tint } from './paint.js';

// ── Drawing kit ──────────────────────────────────────────────────

export class Sheet {
  constructor() {
    this.main = []; this.fine = []; this.accent = []; this.water = [];
    this.falls = [];    // thin falling water, fainter than the fountain's
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
export function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }

// a palm h units tall; y0 lifts it onto a roof, k scales the fronds
export function drawPalm(s, x, z, h, lean, rand, y0 = 0, k = 1) {
  const m0 = s.main.length, f0 = s.fine.length;
  palm(s, x, z, h, lean, rand, k);
  if (y0) for (const [arr, from] of [[s.main, m0], [s.fine, f0]]) for (let i = from + 1; i < arr.length; i += 3) arr[i] += y0;
}

function palm(s, x, z, h, lean, rand, k) {
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
    const R = (4.2 + rand() * 1.4) * k, lift = (1.1 + rand() * 0.8) * k;
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      pts.push(new v(top.x + Math.cos(a) * R * t, top.y + lift * Math.sin(Math.PI * t * 0.7) - 2.6 * k * t * t, top.z + Math.sin(a) * R * t));
    }
    s.poly(s.main, pts);
    for (let i = 2; i < 12; i++) {
      const p = pts[i], len = 1.1 * k * Math.sin(Math.PI * (i / 12));
      const side = new v(-Math.sin(a), 0, Math.cos(a)).multiplyScalar(len * 0.55);
      s.seg(s.fine, p, p.clone().add(side).add(new v(0, -len * 0.75, 0)));
      s.seg(s.fine, p, p.clone().sub(side).add(new v(0, -len * 0.75, 0)));
    }
  }
}

export function drawLamp(s, x, z) {
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


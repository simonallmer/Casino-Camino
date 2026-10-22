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
import { Sheet, rng, drawPalm, drawLamp } from './drawing.js';
import { chipStacks, bigChip } from './chip.js';
import { createMerchant } from './merchant.js';
import { createKeeper } from './keeper.js';
import { createConcierge } from './concierge.js';
import { createGuests, GUESTS } from './guests.js';
import { ARTWORKS, JOURNALS, artworkCanvas, journalCover, horseInMotion, HORSE_FRAMES } from './art.js';
import { ZOETROPE, DOOR_Z, HALL, WING, THEATER, LIFT, ROOM, ROOF, RACK, SOFA, GALLERY_SPOTS, drawFoyer, drawWings, drawGallery, drawResort, drawTheater, drawSkyGarden, drawWaterfalls, drawRear, drawPanorama, drawShaft, drawCage, drawRoom } from './resort.js';
import { worldCanvas, loadLand, lonLatToVec } from './coins/world.js';
import { buildCoin, matcapMaterials, COIN_R } from './coins/coin.js';
import { createZoetrope } from './zoetrope.js';
import { assetBinary, loadSuits } from './assets.js';

const THEMES = {
  day:   { paper: 0xefe7d6, ink: 0x2b251d, fine: 0x5a4f40, accent: 0x8c6a2c, water: 0x5f8592, window: 0xf3c77a, glow: 0xffd28a },
  night: { paper: 0x0f0e0c, ink: 0xcaa862, fine: 0x8d7646, accent: 0xe6c27a, water: 0x86b4c2, window: 0xf6c56f, glow: 0xffc36a },
};

// ── Exterior ─────────────────────────────────────────────────────

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


function drawHall(s) {
  const v = THREE.Vector3, { x: W, z0, z1, wall } = HALL;
  for (const sd of [-1, 1]) {
    const x = sd * W;
    for (const y of [0, 1.2, wall - 0.6, wall]) s.seg(y === 0 || y === wall ? s.main : s.fine, new v(x, y, z0), new v(x, y, z1));
    for (let z = 6; z > z1; z -= 12) {
      if (z > z0 + 0.01) continue;
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
  for (let z = z0; z >= z1; z -= 12) {
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
    clipZ(s, s.fine, a, b, z1, z0);
    clipZ(s, s.fine, new v(15.4, 0.01, c), new v(-15.4, 0.01, c - 30.8), z1, z0);
  }
  for (const x of [-3.6, -3, 3, 3.6]) s.seg(s.accent, new v(x, 0.02, z0), new v(x, 0.02, -46));
  // chandeliers
  for (let z = -18; z > z1 + 8; z -= 24) {
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
  add(sheet.main, mats.main); add(sheet.fine, mats.fine); add(sheet.accent, mats.accent); add(sheet.water, mats.water, true); add(sheet.falls, mats.falls, true);
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
  concierge: { label: 'Monsieur Bellamy, the concierge', hint: 'Touch to speak with him' },
  lifts: { label: 'The lifts', hint: 'Up to the rooms and the sky garden' },
  fortuna: { label: 'Fortuna', hint: 'Take a seat' },
  ricochet: { label: 'Ricochet', hint: 'Take a seat' },
  frontier: { label: 'Frontier', hint: 'Take a seat' },
  theater: { label: 'The Theater', hint: 'Dark tonight' },
  merchant: { label: 'Mr. Jeremiah Thistlewood', hint: 'Merchant of Bristol, in his cups' },
  keeper: { label: 'Miss Vivienne Sterling', hint: 'Keeper of the Coin · hear her out' },
  globe: { label: 'The globe', hint: 'Where the coins are' },
  coin: { label: 'The Casino Camino Coins', hint: 'All nine, side by side' },
  skygarden: { label: 'The sky garden', hint: 'Up the lifts in the resort' },
  sofa: { label: 'A velvet sofa', hint: 'Rest a while, and the light turns' },
  journals: { label: 'The Allmer Journals', hint: 'Browse the rack' },
  terrace: { label: 'The terrace door', hint: 'Out to the sky garden' },
  ...Object.fromEntries(ARTWORKS.map((a, i) => [`art-${i}`, { label: a.title, hint: `${a.artist} · look closer` }])),
  ...Object.fromEntries(GUESTS.map((g, i) => [`guest-${i}`, { label: g.name, hint: 'A guest of the house' }])),
};

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// ── Where the camera goes ───────────────────────────────────────
// Waypoints [position, look-at], and the corridors between them. The camera always travels along
// corridors, through doors and arches, never through a wall.
const WAY = {
  far: [[0, 52, 380], [0, 46, 0]],
  garden: [[0, 16, 205], [0, 44, 0]],
  avenue: [[0, 9, 128], [0, 34, 0]],
  court: [[-8, 6.5, 86], [3, 19, 0]],
  fountain: [[15, 4, 52], [0, 6, 10]],
  steps: [[5, 3.6, 30], [0, 4.5, 0]],
  doorC: [[0, 3.8, 16], [0, 4.2, -20]],
  doorW: [[-6, 3.8, 16], [-6, 4.2, -20]],
  doorE: [[6, 3.8, 16], [6, 4.2, -20]],
  foyC: [[0, 5, 3], [0, 5.2, -30]],
  foyW: [[-12, 5, 2], [-44, 5, -4]],
  foyE: [[12, 5, 2], [44, 5, -4]],
  concierge: [[1, 6, -4], [-15, 5.4, -23]],
  coins: [[-3.5, 6.2, -26], [7.6, 4.4, -44]],
  hallMid: [[-1, 9, -33], [0, 3, -66]],
  casino: [[0, 14, -44], [0, 2, -72]],
  hallEnd: [[0, 8, -100], [0, 12, -160]],
  theater: [[0, 9, -126], [0, 14, -196]],
  galIn: [[-44, 5.5, -2], [-44, 5, -60]],
  gallery: [[-30, 6, -24], [-62, 5.2, -50]],
  galEnd: [[-44, 6, -100], [-40, 7, -150]],
  galGate: [[-42, 6.5, -116], [-10, 12, -176]],
  resIn: [[44, 5.5, -2], [44, 5, -60]],
  lobby: [[52, 6, -8], [26, 6, -24]],
  reading: [[40, 6.2, -44], [62, 3.2, -62]],
  resEnd: [[44, 6, -100], [40, 7, -150]],
  resGate: [[42, 6.5, -116], [10, 12, -176]],
};
const CORRIDORS = [
  ['far', 'garden'], ['garden', 'avenue'], ['avenue', 'court'], ['court', 'fountain'], ['fountain', 'steps'],
  ['steps', 'doorC'], ['steps', 'doorW'], ['steps', 'doorE'], ['doorC', 'foyC'], ['doorW', 'foyW'], ['doorE', 'foyE'],
  ['foyC', 'foyW'], ['foyC', 'foyE'], ['foyC', 'concierge'], ['concierge', 'coins'], ['coins', 'hallMid'], ['hallMid', 'casino'],
  ['casino', 'hallEnd'], ['hallEnd', 'theater'],
  ['foyW', 'galIn'], ['galIn', 'gallery'], ['gallery', 'galEnd'], ['galEnd', 'galGate'], ['galGate', 'theater'],
  ['foyE', 'resIn'], ['resIn', 'lobby'], ['lobby', 'reading'], ['reading', 'resEnd'], ['resEnd', 'resGate'], ['resGate', 'theater'],
];
// the stops, by index; 'room' and 'sky' are reached by the lifts
export const STOP_IDS = ['garden', 'court', 'concierge', 'coins', 'casino', 'theater', 'gallery', 'lobby', 'reading', 'room', 'sky'];

// The long walk: what wakes up in colour while the camera rests in each room.
const ROOMS = {
  garden: ['portico', 'skygarden'], court: ['fountain'], concierge: ['concierge'], coins: ['keeper', 'globe', 'coin'],
  casino: ['fortuna', 'ricochet', 'frontier', 'merchant'], theater: ['theater'], gallery: ARTWORKS.map((a, i) => `art-${i}`).slice(0, 4),
  lobby: ['lifts', ...GUESTS.map((g, i) => `guest-${i}`)], reading: ['sofa', 'journals'],
};

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const pose = ([p, t]) => ({ pos: V(...p), tgt: V(...t) });

function route(from, to) {
  // Dijkstra over the corridors
  const dist = { [from]: 0 }, prev = {}, open = new Set(Object.keys(WAY));
  while (open.size) {
    let u = null;
    for (const k of open) if (dist[k] !== undefined && (u === null || dist[k] < dist[u])) u = k;
    if (u === null || u === to) break;
    open.delete(u);
    for (const [a, b] of CORRIDORS) {
      const n = a === u ? b : b === u ? a : null;
      if (!n || !open.has(n)) continue;
      const d = dist[u] + V(...WAY[u][0]).distanceTo(V(...WAY[n][0]));
      if (dist[n] === undefined || d < dist[n]) { dist[n] = d; prev[n] = u; }
    }
  }
  const path = [to];
  while (path[0] !== from) { const p = prev[path[0]]; if (!p) return [from, to]; path.unshift(p); }
  return path;
}

// what each zone shows, and how far you can see in it
const ZONES = {
  out: { fog: [140, 560], far: 800 },
  in: { fog: [60, 230], far: 800 },
  lift: { fog: [30, 160], far: 800 },
  room: { fog: [420, 3400], far: 3600 },
  up: { fog: [420, 3400], far: 3600 },
};
const ROOM_POSE = { pos: V(33.2, ROOF + 2.6, -15.4), tgt: V(27.5, ROOF + 2.2, -36) };
const SKY_POSES = {
  avenue: { pos: V(0, ROOF + 6.4, -0.5), tgt: V(0, 6, 76) },
  sea: { pos: V(0, ROOF + 5.8, -29), tgt: V(0, ROOF - 12, -520) },
};
const SOFA_POSE = { pos: V(61.4, 3.7, -55), tgt: V(38, 4.6, -56) };
// the gallery: face the west wall, or turn round to the east one
const GALLERY_VIEWS = { west: pose(WAY.gallery), east: { pos: V(-58, 6, -24), tgt: V(-26, 5.2, -50) } };

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
    falls: Object.assign(lineMaterial(0, 0.75, { dashed: true, opacity: 0.45 }), { dashSize: 1.4, gapSize: 1.1 }),
    occluder: new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 8 }),
    window: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
    glow: new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.85 }),
    panel: new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
  };
  const lineMats = [mats.main, mats.fine, mats.accent, mats.water, mats.falls];

  // ── the sheets: outside, inside, the far view, the lift shaft, the cage, the room at the top
  const rand = rng(1907);
  const ext = new Sheet();
  drawFacade(ext); drawTowers(ext, -1, rand); drawTowers(ext, 1, rand); drawCourt(ext, rand);
  drawSkyGarden(ext, rng(74)); drawWaterfalls(ext);
  const exterior = build(ext, mats);

  const int = new Sheet();
  drawFoyer(int); drawHall(int); drawWings(int); drawGallery(int); drawResort(int);
  drawConcierge(int); drawCoinDesk(int); drawCasino(int); drawTheater(int);
  const clockFace = drawClock(int);
  const interior = build(int, mats);

  const farSheet = new Sheet();
  drawRear(farSheet); drawPanorama(farSheet, rng(2060));
  const far = build(farSheet, mats);
  const shaftSheet = new Sheet(); drawShaft(shaftSheet);
  const shaft = build(shaftSheet, mats);
  const cageSheet = new Sheet(); drawCage(cageSheet);
  const cage = build(cageSheet, mats);
  // the horse in motion rides in the cage: one frame at a time, picked by the lift's height
  // (painted in ink inside the band on the shaft wall, so it belongs to the wall, not a screen)
  const horseTex = new THREE.CanvasTexture(horseInMotion(320, 240, 'ink'));
  horseTex.repeat.set(1 / HORSE_FRAMES, 1);
  const horseMat = new THREE.MeshBasicMaterial({ map: horseTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  {
    const { x, z0, z1, y0, y1 } = ZOETROPE;
    const g = new THREE.PlaneGeometry(z1 - z0, y1 - y0); g.rotateY(-Math.PI / 2);
    const m = new THREE.Mesh(g, horseMat);
    m.position.set(x - 0.02, (y0 + y1) / 2, (z0 + z1) / 2);
    cage.add(m);
  }
  const roomSheet = new Sheet(); drawRoom(roomSheet);
  const room = build(roomSheet, mats);
  const groups = { exterior, interior, far, shaft, cage, room };
  const SHOWS = { out: ['exterior'], in: ['interior'], lift: ['interior', 'shaft', 'cage'], room: ['room', 'far'], up: ['exterior', 'far'] };
  Object.values(groups).forEach(g => { g.visible = false; scene.add(g); });

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

  // ── paintables: the things a guest can touch, and in which zones they can be touched
  const paintables = [];
  const register = (group, zones, extra = {}) => group.userData.paints.forEach(p => {
    paintables.push(Object.assign(new Paintable({ name: p.name, label: OBJECTS[p.name]?.label, materials: [p.material], hit: p.mesh, center: p.center, radius: p.radius }), { zones: extra[p.name] ?? zones }));
  });
  register(exterior, ['out'], { skygarden: ['out', 'up'] });
  register(interior, ['in']);
  register(room, ['room']);

  const merchant = createMerchant();
  merchant.mesh.position.set(9, 0, -71);
  interior.add(merchant.mesh);
  paintables.push(Object.assign(new Paintable({ name: 'merchant', materials: [merchant.material], hit: merchant.mesh, center: new THREE.Vector3(), radius: 1 }), { zones: ['in'] }));

  // extra pieces join the paintable of the drawn part they belong to, and wake with it
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
  // the people of the house
  const keeper = createKeeper();
  keeper.mesh.position.copy(KEEPER);
  interior.add(keeper.mesh);
  join('keeper', keeper.material, keeper.mesh);
  const concierge = createConcierge();
  concierge.mesh.position.set(-16.2, 0, -22);
  interior.add(concierge.mesh);
  join('concierge', concierge.material, concierge.mesh);
  // guests in the lobby, waiting for their lines
  const guests = createGuests();
  for (const g of guests) {
    interior.add(g.mesh);
    paintables.push(Object.assign(new Paintable({ name: g.name, materials: [g.material], hit: g.mesh, center: new THREE.Vector3(), radius: 1 }), { zones: ['in'] }));
  }
  const figures = [merchant, keeper, concierge, ...guests];

  // a picture on a wall or a cover on the rack: a flat painting that washes in when touched
  const picture = (canvasPromise, w, h, facing) => {
    const material = watercolorMaterial();
    const g = tint(new THREE.PlaneGeometry(w, h), '#ffffff'); g.rotateY(facing > 0 ? Math.PI / 2 : -Math.PI / 2);
    const mesh = new THREE.Mesh(g, material); mesh.renderOrder = 1;
    canvasPromise.then(c => {
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
      material.uniforms.uMap.value = tex; material.uniforms.uHasMap.value = 1;
    }).catch(() => {});
    return { mesh, material };
  };
  for (const sp of GALLERY_SPOTS) {
    const { mesh, material } = picture(artworkCanvas(ARTWORKS[sp.i], 512), sp.w, sp.h, sp.facing);
    mesh.position.set(sp.x + sp.facing * 0.04, sp.y, sp.z);
    interior.add(mesh);
    join(`art-${sp.i}`, material, mesh, Math.max(sp.w, sp.h));
  }
  JOURNALS.forEach((j, k) => {
    const { mesh, material } = picture(journalCover(j, 300), RACK.w, RACK.h, -1);
    mesh.position.set(RACK.x - 0.06, RACK.y, RACK.zs[k]);
    interior.add(mesh);
    join('journals', material, mesh, 8);
  });

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
  // Ricochet's table piece: a gold zoetrope drum, always in colour like the chip
  const zoetrope = createZoetrope();
  zoetrope.group.position.set(TABLE.ricochet.x, 3.02, TABLE.ricochet.z);
  interior.add(zoetrope.group);
  paintables.find(p => p.name === 'ricochet').extraHits = [zoetrope.mesh];

  let monument = null;
  bigChip(1.7).then(c => { monument = c; c.position.set(0, 11.6, 48); exterior.add(c); }).catch(() => {});

  // ── zones: which drawings show, how far the eye reaches
  let override = null; // 'lift' | 'room' | 'up' while away from the ground floor
  const zoneNow = () => override ?? (camera.position.z < DOOR_Z ? 'in' : 'out');
  let shownZone = null;
  function showZone(z) {
    if (z === shownZone) return;
    shownZone = z;
    for (const [name, g] of Object.entries(groups)) g.visible = SHOWS[z].includes(name);
    [scene.fog.near, scene.fog.far] = ZONES[z].fog;
    camera.far = ZONES[z].far; camera.updateProjectionMatrix();
  }

  // ── pointer: hover paints, click keeps the paint and acts
  Object.values(groups).forEach(g => g.children.forEach(o => { if (o.isMesh && o.material === mats.occluder) occluderMeshes.push(o); }));
  let hovered = null, pointerIn = false, lastClient = { x: 0, y: 0 }, downAt = null;
  canvas.addEventListener('pointermove', e => { pointerIn = true; lastClient = { x: e.clientX, y: e.clientY }; ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); });
  canvas.addEventListener('pointerleave', () => { pointerIn = false; });
  canvas.addEventListener('pointerdown', e => { downAt = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('pointerup', e => {
    if (tour || busy || !downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 8) return;
    // touch screens have no hover: the first tap paints and picks
    if (e.pointerType !== 'mouse') { ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); pick(); }
    if (hovered) { hovered.keep(); onActivate(hovered.name); }
  });

  function pick() {
    const zone = zoneNow();
    raycaster.setFromCamera(ndc, camera);
    const candidates = paintables.filter(p => p.zones.includes(zone));
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
    mats.main.color.set(t.ink); mats.fine.color.set(t.fine); mats.accent.color.set(t.accent); mats.water.color.set(t.water); mats.falls.color.set(t.water); horseMat.color.set(t.ink);
    mats.panel.color.set(t.ink);
    mats.window.color.set(t.window); mats.glow.color.set(t.glow);
    mats.fine.opacity = n ? 0.8 : 0.7;
    scene.traverse(o => { if (o.userData.nightOnly) o.visible = n; });
    scene.traverse(o => { if (o.material?.uniforms?.uNight) o.material.uniforms.uNight.value = n ? 1 : 0; });
    for (const f of figures) { f.material.uniforms.uLine.value.set(t.ink); f.material.uniforms.uPaper.value.set(t.paper); }
  }
  setTheme(night);

  // ── camera
  let at = 'far';          // where the camera rests: a waypoint, or 'room' / 'sky'
  let travel = null;       // {pos, tgt curves, t0, dur, to, resolve}
  let fly = null;          // {from:{pos,tgt}, to:{pos,tgt}, t0, dur, resolve}
  let view = pose(WAY.far);
  let free = null;         // a pose held off the corridors (a table, the room, the roof)
  let paused = false;
  let tour = null;         // the long walk, while it runs
  let busy = false;        // on the way somewhere
  let riding = false;      // in the lift, or cutting between the room and the roof: not to be interrupted
  let veil = 0, veilTo = 0; // a fade to paper, for cuts
  let skyView = 'avenue', galleryView = 'west';
  const rest = {};         // a stop's resting pose when it is not its waypoint's (the gallery, turned round)
  const pointer = new THREE.Vector2(), look = new THREE.Vector2();
  addEventListener('pointermove', e => { pointer.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5); });

  function walk(path, dur) {
    if (fly) return Promise.resolve();
    travel?.resolve?.();
    free = null;
    if (path.length < 2) { at = path[0]; return Promise.resolve(); }
    const pts = path.map(id => pose(WAY[id]));
    pts[pts.length - 1] = rest[path[path.length - 1]] ?? pts[pts.length - 1];
    // start from wherever the camera is now, so a walk interrupted by another never jumps
    pts[0] = { pos: camera.position.clone(), tgt: view.tgt.clone() };
    const curve = list => new THREE.CatmullRomCurve3(list, false, 'centripetal');
    const d = dur ?? 1.2 + (path.length - 1) * 0.55;
    return new Promise(resolve => {
      travel = { pos: curve(pts.map(p => p.pos)), tgt: curve(pts.map(p => p.tgt)), t0: performance.now(), dur: d * 1000, to: path[path.length - 1], resolve };
    });
  }
  function flyTo(to, dur = 1.6) {
    travel = null;
    const from = { pos: camera.position.clone(), tgt: view.tgt.clone() };
    return new Promise(resolve => { fly = { from, to: { pos: to.pos.clone(), tgt: to.tgt.clone() }, t0: performance.now(), dur: dur * 1000, resolve }; });
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function fade(v, ms = 650) { veilTo = v; await sleep(ms); }

  // the lift: into the middle cage, up past the hotel floors, out at the top
  const cagePose = y => ({ pos: V(24.8, y, LIFT.ride - 0.6), tgt: V(40, y - 0.4, LIFT.ride - 0.6) });
  const LIFT_LOW = 5.2, LIFT_HIGH = ROOF + 4.8;
  function rideY(from, to, secs) {
    return new Promise(resolve => {
      const t0 = performance.now();
      fly = null;
      const step = () => {
        const t = Math.min(1, (performance.now() - t0) / (secs * 1000)), e = t * t * (3 - 2 * t);
        free = cagePose(from + (to - from) * e);
        if (t < 1) requestAnimationFrame(step); else resolve();
      };
      step();
    });
  }
  async function liftUp() {
    riding = true;
    if (at !== 'lobby') await walk(route(at, 'lobby'));
    await flyTo(cagePose(LIFT_LOW), 1.6);
    override = 'lift';
    await rideY(LIFT_LOW, LIFT_HIGH, 7.5);
    await fade(1);
    override = 'room'; free = { ...ROOM_POSE }; at = 'room';
    await fade(0);
    riding = false;
  }
  async function liftDown() {
    riding = true;
    if (at === 'sky') await toRoom();
    await fade(1);
    override = 'lift'; free = cagePose(LIFT_HIGH);
    await fade(0);
    await rideY(LIFT_HIGH, LIFT_LOW, 7.5);
    override = null;
    await flyTo(pose(WAY.lobby), 1.5);
    free = null; at = 'lobby';
    riding = false;
  }
  // through the terrace door: a walk from the room out onto the roof, or back in
  const TERRACE = ROOM.x0 - 0.7; // the tower's outer face, where indoors becomes the roof
  const OUT = [
    { pos: V(25, ROOF + 2.6, -19.5), tgt: V(10, ROOF + 2.4, -19.5) },
    { pos: V(17, ROOF + 3, -19.5), tgt: V(0, ROOF + 2, -14) },
    { pos: V(9, ROOF + 4.4, -14), tgt: V(0, ROOF, -6) },
  ];
  const IN_FACE = { pos: V(8, ROOF + 3.6, -19.5), tgt: V(22, ROOF + 2.4, -19.5) }; // across the garden, facing the door
  const IN = [
    { pos: V(16, ROOF + 2.9, -19.5), tgt: V(30, ROOF + 2.6, -19.5) },
    { pos: V(25, ROOF + 2.6, -19.5), tgt: V(34, ROOF + 2.4, -16) },
  ];
  function glide(poses, secs, end) {
    return new Promise(resolve => {
      fly = null; free = null;
      const pts = [{ pos: camera.position.clone(), tgt: view.tgt.clone() }, ...poses];
      const curve = l => new THREE.CatmullRomCurve3(l, false, 'centripetal');
      travel = {
        pos: curve(pts.map(p => p.pos)), tgt: curve(pts.map(p => p.tgt)), t0: performance.now(), dur: secs * 1000, door: true, resolve,
        end: () => { free = { pos: pts[pts.length - 1].pos.clone(), tgt: pts[pts.length - 1].tgt.clone() }; at = end; override = end === 'sky' ? 'up' : 'room'; },
      };
    });
  }
  async function toRoom() { const was = riding; riding = true; await flyTo(IN_FACE, 1.8); await glide([...IN, ROOM_POSE], 3.2, 'room'); riding = was; }
  async function toSky() { const was = riding; riding = true; await glide([...OUT, SKY_POSES[skyView]], 4.4, 'sky'); riding = was; }

  async function goToStop(i, dur) {
    const target = STOP_IDS[i];
    if (!target || (target === at && !travel)) return;
    // already on the way there: just get there sooner
    if (travel && travel.to === target) {
      const now = performance.now(), t = Math.min(0.99, (now - travel.t0) / travel.dur), total = ((dur ?? 0.5) * 1000) / (1 - t);
      travel.t0 = now - t * total; travel.dur = total;
      return;
    }
    busy = true;
    try {
      if (at === 'room' || at === 'sky') {
        if (target === 'room') await toRoom();
        else if (target === 'sky') await toSky();
        else { await liftDown(); await walk(route('lobby', target), dur); }
      } else if (target === 'room' || target === 'sky') {
        await liftUp();
        if (target === 'sky') await toSky();
      } else {
        await walk(route(travel?.to ?? at, target), dur);
      }
    } finally { busy = false; }
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
      const t = THREE.MathUtils.clamp((now - travel.t0) / travel.dur, 0, 1), e = ease(t);
      view = { pos: travel.pos.getPoint(e), tgt: travel.tgt.getPoint(e) };
      if (t >= 1) { if (travel.end) travel.end(); else at = travel.to; const r = travel.resolve; travel = null; r(); }
    } else if (fly) {
      const t = THREE.MathUtils.clamp((now - fly.t0) / fly.dur, 0, 1), e = ease(t);
      view = { pos: fly.from.pos.clone().lerp(fly.to.pos, e), tgt: fly.from.tgt.clone().lerp(fly.to.tgt, e) };
      if (t >= 1) { free = fly.to; const r = fly.resolve; fly = null; r(); }
    } else if (free) {
      view = { pos: free.pos.clone(), tgt: free.tgt.clone() };
    } else if (WAY[at]) {
      view = rest[at] ?? pose(WAY[at]);
    }
    // a gentle breath and a glance toward the pointer
    const time = (now - clockStart) / 1000;
    look.lerp(pointer, 0.04);
    if (look.distanceToSquared(pointer) < 1e-6) look.copy(pointer);
    camera.position.copy(view.pos);
    const tgt = view.tgt.clone();
    if (tour) { tgt.x += Math.sin(time * 0.23) * 1.6; tgt.y += Math.sin(time * 0.17) * 0.6; }
    else if (!free || override === 'room' || override === 'up') { tgt.x += look.x * 3; tgt.y -= look.y * 1.5; }
    camera.lookAt(tgt);

    // walking through the terrace door, the room gives way to the roof at the threshold
    if (travel?.door) override = camera.position.x > TERRACE ? 'room' : 'up';
    const zone = zoneNow();
    showZone(zone);
    cage.position.y = camera.position.y - LIFT_LOW;
    // a frame for every 0.55 units climbed: up, the horse runs on; down, it runs backward
    if (cage.visible) horseTex.offset.x = (((Math.floor(cage.position.y / 0.55) % HORSE_FRAMES) + HORSE_FRAMES) % HORSE_FRAMES) / HORSE_FRAMES;
    veil += Math.sign(veilTo - veil) * Math.min(Math.abs(veilTo - veil), 0.035);
    const door = travel?.door ? 0.9 * Math.max(0, 1 - Math.abs(camera.position.x - TERRACE) / 2.4)
      : override ? 0 : 1 - Math.abs(camera.position.z - DOOR_Z) / 5.5;
    if (wash) wash.style.opacity = Math.max(veil, door).toFixed(3);

    mats.water.dashOffset = -time * 1.6;
    mats.falls.dashOffset = -time * 5;

    const dt = Math.min(0.05, (now - (frame.last ?? now)) / 1000); frame.last = now;
    const still = !fly && !travel && !tour && !busy && (!free || override === 'room' || override === 'up');
    if (pointerIn && still) pick();
    else if (hovered && !still) { hovered.leave(); hovered = null; canvas.style.cursor = ''; onHover(null); }
    paintables.forEach(pt => pt.step(dt));
    // he sways, and always turns to face whoever is looking at him
    const face = (m, sway) => m.rotation.set(0, Math.atan2(camera.position.x - m.position.x, camera.position.z - m.position.z), sway);
    face(merchant.mesh, Math.sin(time * 1.3) * 0.045);
    face(keeper.mesh, Math.sin(time * 0.9) * 0.012);
    face(concierge.mesh, Math.sin(time * 0.7) * 0.01);
    guests.forEach((g, i) => face(g.mesh, Math.sin(time * (0.8 + i * 0.17) + i) * 0.015));
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
    get at() { return at; },
    get riding() { return riding; },
    goToStop,
    // up close to the globe or the coin on the desk
    flyToDesk: name => {
      const p = name === 'globe' ? GLOBE.pos : COIN.pos;
      return flyTo({ pos: p.clone().add(V(name === 'globe' ? 0.9 : -0.9, 0.5, 2.6)), tgt: p.clone() }, 1.5);
    },
    flyToTable: (name = 'fortuna') => name === 'ricochet'
      // low and from the side, so the galloping band passes right in front of you
      ? flyTo({ pos: TABLE.ricochet.clone().add(V(0.6, 1.9, 4.6)), tgt: TABLE.ricochet.clone().add(V(0, 0.45, 0)) }, 1.8)
      : flyTo({ pos: TABLE[name].clone().add(V(0, 9, 0.6)), tgt: TABLE[name].clone() }, 1.5),
    // closer to a picture on the gallery wall
    flyToArt: i => {
      const sp = GALLERY_SPOTS.find(s => s.i === i);
      return flyTo({ pos: V(sp.x + sp.facing * Math.max(sp.w, sp.h) * 1.5, sp.y, sp.z), tgt: V(sp.x, sp.y, sp.z) }, 1.5);
    },
    flyToRack: () => flyTo({ pos: V(56, 4.2, (RACK.zs[0] + RACK.zs[RACK.zs.length - 1]) / 2), tgt: V(RACK.x, RACK.y, (RACK.zs[0] + RACK.zs[RACK.zs.length - 1]) / 2) }, 1.5),
    sitDown: () => flyTo(SOFA_POSE, 1.8),
    fade,
    async returnToStop(i) {
      const id = STOP_IDS[i];
      if (id === 'room') { await flyTo(ROOM_POSE, 1.2); free = { ...ROOM_POSE }; return; }
      if (id === 'sky') { await flyTo(SKY_POSES[skyView], 1.2); free = { ...SKY_POSES[skyView] }; return; }
      await flyTo(rest[id] ?? pose(WAY[id]), 1.4);
      free = null; at = id;
    },
    // on the roof: down the avenue, or out to sea; in the gallery: the west wall, or the east
    async lookOut(which) {
      if (at === 'sky' && SKY_POSES[which] && skyView !== which) {
        skyView = which;
        await flyTo(SKY_POSES[which], 1.8);
      } else if (at === 'gallery' && GALLERY_VIEWS[which] && galleryView !== which && !travel) {
        galleryView = which;
        await flyTo(GALLERY_VIEWS[which], 1.6);
        free = null; rest.gallery = GALLERY_VIEWS[which];
      }
    },
    get skyView() { return skyView; },
    get galleryView() { return galleryView; },
    setPaused(v) { paused = v; },
    tour: runTour,
    endTour() { if (!tour || tour.cancelled) return; tour.cancelled = true; tour.wake?.(); if (travel) { const r = travel.resolve; travel = null; r(); } },
  };

  // ── the long walk: from the far approach through every room, resting in each while it comes to colour
  async function runTour() {
    if (tour || fly || free || busy) return;
    const t = tour = { cancelled: false, wake: null };
    hovered?.leave(); hovered = null; canvas.style.cursor = ''; onHover(null);
    const wait = ms => new Promise(r => { const id = setTimeout(r, ms); t.wake = () => { clearTimeout(id); r(); }; });
    const veilTo_ = async (v, ms = 900) => { veilTo = v; await wait(ms); };
    const lit = [];

    await veilTo_(1);
    resize(); travel = null; at = 'far';
    if (!t.cancelled) await veilTo_(0, 700);
    for (const id of ['garden', 'court', 'concierge', 'coins', 'casino', 'theater', 'gallery', 'lobby', 'reading']) {
      if (t.cancelled) break;
      const path = route(at, id);
      await walk(path, 2.6 + (path.length - 1) * 1.1);
      if (t.cancelled) break;
      // the room wakes up, one thing after another
      for (const name of ROOMS[id]) {
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
    // back to the garden
    veilTo = 1; await new Promise(r => setTimeout(r, 900));
    travel = null; at = 'garden';
    tour = null; resize();
    veilTo = 0; await new Promise(r => setTimeout(r, 700));
  }
}

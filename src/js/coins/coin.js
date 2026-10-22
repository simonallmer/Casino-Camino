// The C2 print (39 mm × 3.3 mm), the first Casino Camino Coin, now kept in the archive.
// Its front face is also the front of the nine coins in set.js.
// The print has the six-pointed star, CASINO CAMINO and a ring sunk 0.5 mm into both faces.
// Here the body is silver, the lettering darkened like an antique coin, and both stars are filled
// with gold standing a hair proud of the face. Under the top star sits the chip that carries the serial.

import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { assetBinary } from '../assets.js';

export const COIN_STL = 'assets/coin/C2 Casino Camino Chip Arc Star.stl';
// one export per line: build.py picks up the first name of each export statement
export const COIN_R = 19.5;
export const COIN_T = 3.3;
export const FIELD = 3.3;
export const FLOOR = 2.8;
export const BACK_FLOOR = 0.5;
export const STAR_R = 9.2;
export const PROUD = 0.14;
// the engraved ring between the rim and the lettering
export const GROOVE = [15.5, 17.5];

let stlPromise = null, partsPromise = null;
// the raw print: a non-indexed geometry with the faces along ±Z, from z = 0 to 3.3
export function coinSTL() {
  stlPromise ??= assetBinary(COIN_STL).then(buf => new STLLoader().parse(buf));
  return stlPromise;
}
// → { body, starTop, starBottom, chip } geometries in millimetres, centred, faces along ±Z
export function coinParts() {
  partsPromise ??= coinSTL().then(split);
  return partsPromise;
}

function split(geo) {
  const pos = geo.attributes.position.array, nrm = geo.attributes.normal.array;
  const body = { p: [], n: [], c: [] }, top = [], bottom = [];
  const near = (a, b) => Math.abs(a - b) < 0.03;
  for (let i = 0; i < pos.length; i += 9) {
    const z = [pos[i + 2], pos[i + 5], pos[i + 8]];
    let rMax = 0;
    for (let k = 0; k < 9; k += 3) rMax = Math.max(rMax, Math.hypot(pos[i + k], pos[i + k + 1]));
    const tri = pos.slice(i, i + 9);
    const floorTop = z.every(v => near(v, FLOOR)), floorBack = z.every(v => near(v, BACK_FLOOR));
    if (floorTop && rMax < STAR_R) top.push(tri);
    if (floorBack && rMax < STAR_R) bottom.push(tri);
    // antique finish: the sunken floors dark, their walls half-dark, the field bright
    const nz = nrm[i + 2];
    const shade = floorTop || floorBack ? 0.42 : Math.abs(nz) < 0.2 && rMax < COIN_R - 0.2 ? 0.62 : 1;
    body.p.push(...tri);
    const rim = Math.abs(nz) < 0.2 && rMax > COIN_R - 0.2;
    for (let k = 0; k < 9; k += 3) {
      // the rim gets round normals so the edge reads as one smooth band, not facets
      if (rim) { const r = Math.hypot(tri[k], tri[k + 1]); body.n.push(tri[k] / r, tri[k + 1] / r, 0); } else body.n.push(nrm[i], nrm[i + 1], nrm[i + 2]);
      body.c.push(shade, shade, shade);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(body.p, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(body.n, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(body.c, 3));
  const centre = geo => geo.translate(0, 0, -COIN_T / 2);
  return {
    body: centre(g),
    // top star sits from the floor up to just proud of the face; the back one mirrors it
    starTop: centre(inlay(top, FIELD + PROUD, FIELD - 0.1, 1)),
    starBottom: centre(inlay(bottom, -PROUD, 0.1, -1)),
    chip: centre(chipGeometry(FLOOR + 0.02)),
  };
}

// A gold inlay from the floor triangles of a star recess: a cap at `capZ` and walls down to `wallZ`.
export function inlay(tris, capZ, wallZ, facing) {
  const p = [], n = [];
  const key = (x, y) => `${Math.round(x * 1000)},${Math.round(y * 1000)}`;
  const edges = new Map();
  for (const t of tris) {
    // keep the winding so the cap faces out of the coin
    const v = [[t[0], t[1]], [t[3], t[4]], [t[6], t[7]]];
    for (const [x, y] of v) { p.push(x, y, capZ); n.push(0, 0, facing); }
    for (let k = 0; k < 3; k++) {
      const a = v[k], b = v[(k + 1) % 3], ka = key(...a), kb = key(...b);
      const back = `${kb}|${ka}`;
      if (edges.has(back)) edges.delete(back); else edges.set(`${ka}|${kb}`, [a, b]);
    }
  }
  // what is left are the outline edges: stand a wall on each, facing away from the star
  for (const [a, b] of edges.values()) {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const nx = (dy / l) * facing, ny = (-dx / l) * facing;
    const quad = [[a, wallZ], [b, wallZ], [b, capZ], [a, wallZ], [b, capZ], [a, capZ]];
    for (const [[x, y], z] of quad) { p.push(x, y, z); n.push(nx, ny, 0); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3));
  return g;
}

export function chipGeometry(z) {
  const g = new THREE.CircleGeometry(3.3, 48);
  g.translate(0, 0, z);
  return g;
}

// The chip under the star: a tiny NFC tag, its copper antenna wound round the die.
export function chipTexture() {
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S;
  const ctx = c.getContext('2d'), R = S / 2;
  ctx.translate(R, R);
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fillStyle = '#1b2a22'; ctx.fill();
  ctx.strokeStyle = '#d08a4e'; ctx.lineWidth = 7;
  for (let r = R * 0.9; r > R * 0.42; r -= 15) { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); }
  ctx.fillStyle = '#0c0d0e'; ctx.fillRect(-R * 0.22, -R * 0.22, R * 0.44, R * 0.44);
  ctx.strokeStyle = '#c9ccd0'; ctx.lineWidth = 3; ctx.strokeRect(-R * 0.22, -R * 0.22, R * 0.44, R * 0.44);
  ctx.strokeStyle = '#d08a4e'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(R * 0.22, 0); ctx.lineTo(R * 0.44, 0); ctx.moveTo(-R * 0.22, 0); ctx.lineTo(-R * 0.44, 0); ctx.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

// ── metal without lights: a painted reflection ball (matcap), for the coin standing in the drawn venue
function matcap(stops, horizon) {
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(S * 0.36, S * 0.3, S * 0.02, S * 0.5, S * 0.5, S * 0.52);
  stops.forEach(([t, col]) => g.addColorStop(t, col));
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  // a soft horizon band, as if reflecting a room
  const h = ctx.createLinearGradient(0, S * 0.5, 0, S * 0.72);
  h.addColorStop(0, 'rgba(0,0,0,0)'); h.addColorStop(0.5, horizon); h.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = h; ctx.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export function matcapMaterials() {
  return {
    silver: new THREE.MeshMatcapMaterial({ vertexColors: true, matcap: matcap([[0, '#ffffff'], [0.25, '#dfe3e8'], [0.7, '#8d939b'], [1, '#3d4147']], 'rgba(40,44,50,0.35)') }),
    gold: new THREE.MeshMatcapMaterial({ matcap: matcap([[0, '#fff6d8'], [0.25, '#f1cf7a'], [0.7, '#b8862f'], [1, '#5e3f12']], 'rgba(70,40,10,0.35)'), side: THREE.DoubleSide }),
  };
}

// ── real metal under a studio light, for the coin you can turn in your hand
export function metalMaterials() {
  return {
    silver: new THREE.MeshPhysicalMaterial({ color: 0xdfe2e6, metalness: 1, roughness: 0.3, vertexColors: true }),
    gold: new THREE.MeshPhysicalMaterial({ color: 0xffd36e, metalness: 1, roughness: 0.18, side: THREE.DoubleSide }),
    chip: new THREE.MeshStandardMaterial({ map: chipTexture(), metalness: 0.3, roughness: 0.5 }),
  };
}

// A whole coin as a group, faces along ±Z, 1 unit = 1 mm. `top` holds the top star so it can be lifted out.
export async function buildCoin(mats) {
  const parts = await coinParts();
  const group = new THREE.Group();
  const body = new THREE.Mesh(parts.body, mats.silver);
  const top = new THREE.Mesh(parts.starTop, mats.gold);
  const back = new THREE.Mesh(parts.starBottom, mats.gold);
  group.add(body, top, back);
  let chip = null;
  if (mats.chip) { chip = new THREE.Mesh(parts.chip, mats.chip); group.add(chip); }
  return { group, body, top, back, chip };
}

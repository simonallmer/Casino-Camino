// The nine coins, read in two glances:
//   the body tells you how many digits — silver for one, gold for two, black for three;
//   the star tells you the first digit — green for a 1, blue for a 2, red for a 5.
// So a blue star on gold is 20, a red star on black is 500.
// The engraved rings, on the face and round the edge, count the digits too, for touch and for anyone who can't tell the colours.
// The front is the C2 print's face; the back carries the value.

import * as THREE from 'three';
import { coinSTL, inlay, chipGeometry, chipTexture, COIN_R, COIN_T, FIELD, FLOOR, STAR_R, PROUD, GROOVE } from './coin.js';

export const TIERS = [
  { id: 'silver', name: 'Silver', rings: 1, finish: 'Silver', star: 'enamel', note: 'One digit: 1, 2 and 5, with stars of enamel.' },
  { id: 'gold', name: 'Gold', rings: 2, finish: 'Gold', star: 'enamel', note: 'Two digits: 10, 20 and 50, with stars of enamel.' },
  { id: 'black', name: 'Black', rings: 3, finish: 'Black', star: 'gem', note: 'Three digits: 100, 200 and 500, with stars of emerald, Paraíba tourmaline and ruby.' },
];
export const COLOURS = [
  { id: 'green', name: 'Green', digit: 1, enamel: '#16875a', gem: { name: 'Emerald', color: '#12a866', emissive: '#04502c' } },
  // a bright blue leaning to turquoise, the colour Paraíba tourmaline is famous for
  { id: 'blue', name: 'Blue', digit: 2, enamel: '#139fc0', gem: { name: 'Paraíba tourmaline', color: '#18c4dc', emissive: '#035a68' } },
  // ruby, bright as a flame rather than the red of an error
  { id: 'red', name: 'Red', digit: 5, enamel: '#e0243f', gem: { name: 'Ruby', color: '#e8123f', emissive: '#6a0418' } },
];

const BODIES = [
  { field: { color: '#dfe2e6', metalness: 1, roughness: 0.3 }, engrave: { color: '#55595f', metalness: 0.7, roughness: 0.6 } },
  { field: { color: '#e9b44c', metalness: 1, roughness: 0.26 }, engrave: { color: '#7a5418', metalness: 0.8, roughness: 0.55 } },
  { field: { color: '#25272b', metalness: 1, roughness: 0.3 }, engrave: { color: '#e2b04f', metalness: 1, roughness: 0.3 } },
];
const WORDS = { 1: 'one', 2: 'two', 5: 'five', 10: 'ten', 20: 'twenty', 50: 'fifty', 100: 'a hundred', 200: 'two hundred', 500: 'five hundred' };

export const SET = TIERS.flatMap((t, ti) => COLOURS.map(c => {
  const value = c.digit * 10 ** ti, gem = t.star === 'gem';
  const star = gem ? c.gem.name : `${c.name} enamel`;
  return {
    id: `${c.id}-${t.id}`, name: `${c.name} ${value}`, value, tier: ti, colour: c.name, body: t.finish, star,
    blurb: `A ${star.toLowerCase()} star on ${t.finish.toLowerCase()}: ${WORDS[value]}. ${c.name} always leads with a ${c.digit}: ${[1, 10, 100].map(k => c.digit * k).join(', ')}.`,
    ...BODIES[ti],
    // enamel is glass fused to the metal: glossy, and the chip's signal passes straight through it
    starMat: gem ? null : { color: c.enamel, metalness: 0, roughness: 0.3, clearcoat: 0.55, clearcoatRoughness: 0.18 },
    gem: gem ? c.gem : null,
  };
}));

// ── materials
export function setMaterials(spec) {
  const pbr = o => new THREE.MeshPhysicalMaterial({ ...o, side: THREE.DoubleSide });
  const mats = {
    field: pbr(spec.field),
    engrave: pbr(spec.engrave),
    // under a gem the recess is foil-backed, the old jeweller's trick that makes a stone light up
    setting: spec.gem ? pbr({ color: '#f4f6f8', metalness: 1, roughness: 0.08 }) : pbr(spec.engrave),
    chip: new THREE.MeshStandardMaterial({ map: chipTexture(), metalness: 0.3, roughness: 0.5 }),
  };
  mats.star = spec.gem
    ? new THREE.MeshPhysicalMaterial({
      color: spec.gem.color, emissive: spec.gem.emissive, metalness: 0, roughness: 0.03, ior: 2.1, specularIntensity: 1,
      clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 2.4, flatShading: true,
      iridescence: spec.gem.iridescence ?? 0, iridescenceIOR: 1.9, iridescenceThicknessRange: [200, 700],
    })
    : pbr(spec.starMat);
  return mats;
}

// ── geometry
let frontPromise = null;
// The C2 front face, sorted into field (the face), engrave (letters and ring) and setting (the star's floor).
function front() {
  frontPromise ??= coinSTL().then(geo => {
    const pos = geo.attributes.position.array, nrm = geo.attributes.normal.array;
    const parts = { field: [], engrave: [], setting: [] }, star = [];
    const near = (a, b) => Math.abs(a - b) < 0.03;
    for (let i = 0; i < pos.length; i += 9) {
      const z = [pos[i + 2], pos[i + 5], pos[i + 8]];
      if (z.every(v => v < 0.55)) continue;                       // the back is made anew
      let rMax = 0;
      for (let k = 0; k < 9; k += 3) rMax = Math.max(rMax, Math.hypot(pos[i + k], pos[i + k + 1]));
      const nz = nrm[i + 2];
      if (Math.abs(nz) < 0.2 && rMax > COIN_R - 0.2) continue;   // so is the rim
      const tri = Array.from(pos.slice(i, i + 9)), n = [nrm[i], nrm[i + 1], nrm[i + 2]];
      const floor = z.every(v => near(v, FLOOR));
      if (floor && rMax < STAR_R) { star.push(tri); parts.setting.push([tri, n]); }
      else if (floor || Math.abs(nz) < 0.2) parts.engrave.push([tri, n]);
      else parts.field.push([tri, n]);
    }
    const geom = list => {
      const g = new THREE.BufferGeometry(), p = [], nn = [];
      for (const [t, n] of list) { p.push(...t); nn.push(...n, ...n, ...n); }
      g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nn, 3));
      return g;
    };
    return {
      field: geom(parts.field), engrave: geom(parts.engrave), setting: geom(parts.setting),
      inlay: inlay(star, FIELD + PROUD, FIELD - 0.1, 1),
    };
  });
  return frontPromise;
}

// the grooves the rings are cut as: n equal grooves across the C2 ring band, split by n − 1 ridges
const RIDGE = 0.26;
function grooveBands(n) {
  const [r0, r1] = GROOVE, g = (r1 - r0 - (n - 1) * RIDGE) / n, ridges = [];
  for (let k = 1; k < n; k++) { const a = r0 + k * g + (k - 1) * RIDGE; ridges.push([a, a + RIDGE]); }
  return ridges;
}
const annulus = (r0, r1, z, facing) => {
  const g = new THREE.RingGeometry(r0, r1, 160);
  if (facing < 0) g.rotateY(Math.PI);
  return g.translate(0, 0, z);
};
const wall = (r, z0, z1) => new THREE.CylinderGeometry(r, r, z1 - z0, 160, 1, true).rotateX(Math.PI / 2).translate(0, 0, (z0 + z1) / 2);

// the edge: a band with one V-groove per ring, cut round it
function rimGeometry(n) {
  const R = COIN_R, depth = 0.22, half = 0.15, pts = [new THREE.Vector2(R, 0)];
  for (let k = 1; k <= n; k++) {
    const z = (COIN_T * k) / (n + 1);
    pts.push(new THREE.Vector2(R, z - half), new THREE.Vector2(R - depth, z), new THREE.Vector2(R, z + half));
  }
  pts.push(new THREE.Vector2(R, COIN_T));
  const g = new THREE.LatheGeometry(pts, 180);
  return g.rotateX(Math.PI / 2);
}

// the value, struck on the back: a big numeral with a small star beneath
let fontReady = null;
function backArt(value) {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const size = [0, 470, 420, 330][String(value).length];
  ctx.font = `700 ${size}px "Cinzel Decorative", "Cormorant Garamond", serif`;
  ctx.fillText(String(value), S / 2, S / 2 + size * 0.34);
  // a small six-pointed star under the value
  ctx.beginPath();
  for (let k = 0; k < 12; k++) {
    const r = k % 2 ? 22 : 44, a = -Math.PI / 2 + (k * Math.PI) / 6;
    const x = S / 2 + Math.cos(a) * r, y = S * 0.79 + Math.sin(a) * r;
    k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath(); ctx.fill();
  // and a hairline ring framing it
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(S / 2, S / 2, S * 0.47, 0, Math.PI * 2); ctx.stroke();
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8;
  return t;
}

// the gem star: a six-pointed star cut with a raised centre, and a little faceted stone at every tip
function gemStar() {
  const pts = [], tip = 7.3, inner = 3.86, base = FLOOR + 0.02, crown = FIELD + 0.05, apex = FIELD + 1.5;
  for (let k = 0; k < 12; k++) {
    const r = k % 2 ? tip : inner, a = (k * Math.PI) / 6;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  const p = [];
  for (let k = 0; k < 12; k++) {
    const [ax, ay] = pts[k], [bx, by] = pts[(k + 1) % 12];
    p.push(ax, ay, crown, bx, by, crown, 0, 0, apex);                                   // a facet up to the centre
    p.push(ax, ay, base, bx, by, base, bx, by, crown, ax, ay, base, bx, by, crown, ax, ay, crown); // its girdle
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.computeVertexNormals();
  const balls = [];
  for (let k = 0; k < 6; k++) {
    const a = Math.PI / 6 + (k * Math.PI) / 3;
    balls.push(new THREE.IcosahedronGeometry(0.72, 0).translate(Math.cos(a) * 7.55, Math.sin(a) * 7.55, FIELD + 0.1).toNonIndexed());
  }
  return { star: g, balls };
}

// One of the nine, faces along ±Z, 1 unit = 1 mm. `top` is the star, which can be lifted out.
export async function buildSetCoin(spec, mats = setMaterials(spec)) {
  const f = await front();
  const n = TIERS[spec.tier].rings, ridges = grooveBands(n);
  const group = new THREE.Group(), inner = new THREE.Group();
  inner.position.z = -COIN_T / 2;
  group.add(inner);
  const add = (geo, mat) => { const m = new THREE.Mesh(geo, mat); inner.add(m); return m; };

  // the front: the C2 face, with ridges standing in its ring groove to make two or three rings
  add(f.field, mats.field); add(f.engrave, mats.engrave); add(f.setting, mats.setting);
  for (const [a, b] of ridges) { add(annulus(a, b, FIELD, 1), mats.field); add(wall(a, FLOOR, FIELD), mats.engrave); add(wall(b, FLOOR, FIELD), mats.engrave); }

  // the back: a plain field with the same rings, and the value
  const [g0, g1] = GROOVE, B = 0.5;
  add(annulus(0.001, g0, 0, -1), mats.field);
  add(annulus(g1, COIN_R, 0, -1), mats.field);
  add(annulus(g0, g1, B, -1), mats.engrave);
  add(wall(g0, 0, B), mats.engrave); add(wall(g1, 0, B), mats.engrave);
  for (const [a, b] of ridges) { add(annulus(a, b, 0, -1), mats.field); add(wall(a, 0, B), mats.engrave); add(wall(b, 0, B), mats.engrave); }
  if (!fontReady) fontReady = document.fonts?.load('700 64px "Cinzel Decorative"').catch(() => {}) ?? Promise.resolve();
  await fontReady;
  const art = backArt(spec.value);
  const ink = mats.engrave.clone();
  Object.assign(ink, { alphaMap: art, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const decal = new THREE.CircleGeometry(g0 - 0.3, 96).rotateY(Math.PI).translate(0, 0, -0.01);
  add(decal, ink);
  mats.ink = ink;

  // the edge, grooved once per ring, with the groove floors darkened
  add(rimGeometry(n), mats.field);

  // the star, and the chip beneath it
  const top = new THREE.Group();
  if (spec.gem) {
    const { star, balls } = gemStar();
    top.add(new THREE.Mesh(star, mats.star), ...balls.map(b => new THREE.Mesh(b, mats.star)));
  } else top.add(new THREE.Mesh(f.inlay, mats.star));
  inner.add(top);
  const chip = add(chipGeometry(FLOOR + 0.02), mats.chip);

  const dispose = () => {
    group.traverse(o => { if (o.isMesh && ![f.field, f.engrave, f.setting, f.inlay].includes(o.geometry)) o.geometry.dispose(); });
    Object.values(mats).forEach(m => { m.map?.dispose(); m.alphaMap?.dispose(); m.dispose(); });
  };
  return { group, top, chip, dispose };
}

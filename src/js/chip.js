// The Casino Camino chip, the house's recurring symbol.
// After the C1 print (39 mm, 3.4 mm, engraved ring, CASINO CAMINO across the face),
// dressed up: a star-rosette guilloché, five suit inlays at the rim, gold hairlines.

import * as THREE from 'three';
import { loadSuits, SUIT_NAMES } from './assets.js';
import { watercolorMaterial } from './paint.js';

export const PALETTES = {
  camino: { base: '#7d1f24', ring: '#55131a', inlay: '#efe3c4', gold: '#d6b066', engrave: '#f3d9a4' },
  ivory: { base: '#ece0c0', ring: '#d3c29a', inlay: '#7d1f24', gold: '#a8823a', engrave: '#7a5a22' },
  night: { base: '#1b1916', ring: '#0c0b0a', inlay: '#d6b066', gold: '#d6b066', engrave: '#d6b066' },
  jade: { base: '#245848', ring: '#163c31', inlay: '#efe3c4', gold: '#d6b066', engrave: '#cfe5d5' },
  sapphire: { base: '#26406a', ring: '#172a47', inlay: '#efe3c4', gold: '#d6b066', engrave: '#cdd9ee' },
};

let fontReady = null;
const ensureFont = () => (fontReady ??= document.fonts?.load('700 64px "Cinzel Decorative"').catch(() => {}) ?? Promise.resolve());

function starPath(ctx, ro, ri) {
  ctx.beginPath();
  for (let k = 0; k < 10; k++) {
    const r = k % 2 ? ri : ro, a = -Math.PI / 2 + (k * Math.PI) / 5;
    k ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
}

// Draws one face of the chip into a square canvas. `center` is 'logo' or a short monogram.
export async function drawChipFace(canvas, pal, center = 'logo') {
  const [suits] = await Promise.all([loadSuits(), ensureFont()]);
  const S = canvas.width, R = S / 2, ctx = canvas.getContext('2d');
  ctx.save();
  ctx.clearRect(0, 0, S, S);
  ctx.translate(R, R);

  ctx.beginPath(); ctx.arc(0, 0, R * 0.995, 0, Math.PI * 2); ctx.fillStyle = pal.base; ctx.fill();
  const shade = ctx.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.1, 0, 0, R);
  shade.addColorStop(0, 'rgba(255,255,255,0.10)'); shade.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = shade; ctx.fill();

  // five rim inlays, each carrying a suit
  SUIT_NAMES.forEach((name, k) => {
    const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5, half = 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.965, a - half, a + half);
    ctx.arc(0, 0, R * 0.8, a + half, a - half, true);
    ctx.closePath();
    ctx.fillStyle = pal.inlay; ctx.fill();
    ctx.save();
    ctx.translate(Math.cos(a) * R * 0.883, Math.sin(a) * R * 0.883);
    ctx.rotate(a + Math.PI / 2);
    const sz = R * 0.13;
    ctx.translate(-sz / 2, -sz / 2); ctx.scale(sz / 100, sz / 100);
    ctx.fillStyle = pal.base; ctx.fill(suits[name]);
    ctx.restore();
    // gold pip between inlays
    const b = a + Math.PI / 5;
    ctx.beginPath(); ctx.arc(Math.cos(b) * R * 0.883, Math.sin(b) * R * 0.883, R * 0.022, 0, Math.PI * 2);
    ctx.fillStyle = pal.gold; ctx.fill();
  });

  ctx.lineWidth = Math.max(1, S * 0.006); ctx.strokeStyle = pal.gold;
  for (const r of [0.975, 0.79]) { ctx.beginPath(); ctx.arc(0, 0, R * r, 0, Math.PI * 2); ctx.stroke(); }

  // star-rosette guilloché, the slight engraving across the field
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, R * 0.77, 0, Math.PI * 2); ctx.clip();
  ctx.strokeStyle = pal.engrave; ctx.globalAlpha = 0.2; ctx.lineWidth = Math.max(0.6, S * 0.0022);
  for (let k = 0; k < 54; k++) {
    ctx.save(); ctx.rotate((k * (Math.PI * 2 / 5)) / 54);
    starPath(ctx, R * 0.76, R * 0.31); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // the engraved ring from the print
  ctx.beginPath(); ctx.arc(0, 0, R * 0.62, 0, Math.PI * 2); ctx.arc(0, 0, R * 0.53, 0, Math.PI * 2, true);
  ctx.fillStyle = pal.ring; ctx.fill('evenodd');
  ctx.strokeStyle = pal.gold; ctx.globalAlpha = 0.55; ctx.lineWidth = Math.max(0.6, S * 0.003);
  for (let k = 0; k < 96; k++) {
    const a = (k / 96) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * 0.545, Math.sin(a) * R * 0.545); ctx.lineTo(Math.cos(a) * R * 0.605, Math.sin(a) * R * 0.605); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.arc(0, 0, R * 0.52, 0, Math.PI * 2); ctx.fillStyle = pal.base; ctx.fill();
  ctx.lineWidth = Math.max(1, S * 0.005);
  for (const r of [0.635, 0.515]) { ctx.beginPath(); ctx.arc(0, 0, R * r, 0, Math.PI * 2); ctx.strokeStyle = pal.gold; ctx.stroke(); }

  ctx.fillStyle = pal.inlay; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (center === 'logo') {
    ctx.font = `700 ${R * 0.15}px "Cinzel Decorative", "Cormorant Garamond", serif`;
    ctx.fillText('CASINO', 0, -R * 0.1);
    ctx.fillText('CAMINO', 0, R * 0.12);
    ctx.save(); ctx.translate(0, -R * 0.33); starPath(ctx, R * 0.055, R * 0.024); ctx.fillStyle = pal.gold; ctx.fill(); ctx.restore();
  } else {
    ctx.font = `600 ${R * 0.5}px "Cormorant Garamond", serif`;
    ctx.fillText(center, 0, R * 0.04);
  }
  ctx.restore();
  return canvas;
}

function drawChipEdge(pal) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = pal.base; ctx.fillRect(0, 0, 1024, 64);
  for (let k = 0; k < 10; k++) { ctx.fillStyle = pal.inlay; ctx.fillRect(k * 102.4 + 30, 0, 42, 64); }
  ctx.fillStyle = pal.gold; ctx.fillRect(0, 5, 1024, 3); ctx.fillRect(0, 56, 1024, 3);
  return c;
}

const materialCache = new Map();
// One material set per palette: [edge, top face, bottom face], always fully painted.
export async function chipMaterials(name, { instanced = false } = {}) {
  const key = `${name}:${instanced}`;
  if (materialCache.has(key)) return materialCache.get(key);
  const pal = PALETTES[name];
  const face = document.createElement('canvas'); face.width = face.height = 512;
  await drawChipFace(face, pal, 'logo');
  const faceTex = new THREE.CanvasTexture(face); faceTex.colorSpace = THREE.SRGBColorSpace; faceTex.anisotropy = 8;
  const edgeTex = new THREE.CanvasTexture(drawChipEdge(pal)); edgeTex.colorSpace = THREE.SRGBColorSpace;
  const faceMat = watercolorMaterial({ map: faceTex, revealed: true, instanced });
  const edgeMat = watercolorMaterial({ map: edgeTex, revealed: true, instanced });
  for (const m of [faceMat, edgeMat]) { m.polygonOffset = false; m.depthWrite = true; m.transparent = false; }
  const mats = [edgeMat, faceMat, faceMat];
  materialCache.set(key, mats);
  return mats;
}

export const CHIP_R = 0.34, CHIP_H = 0.07;

function chipGeometry(r = CHIP_R, h = CHIP_H) {
  const g = new THREE.CylinderGeometry(r, r, h, 64, 1);
  const n = g.attributes.position.count, col = new Float32Array(n * 3).fill(1);
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

// Stacks of chips: [{x, y, z, count, palette}] → one instanced mesh per palette.
export async function chipStacks(stacks, rand = Math.random) {
  const group = new THREE.Group();
  const byPal = {};
  for (const s of stacks) (byPal[s.palette] ??= []).push(s);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  for (const [pal, list] of Object.entries(byPal)) {
    const total = list.reduce((a, s) => a + s.count, 0);
    const mesh = new THREE.InstancedMesh(chipGeometry(), await chipMaterials(pal, { instanced: true }), total);
    let i = 0;
    for (const s of list) for (let k = 0; k < s.count; k++) {
      p.set(s.x + (rand() - 0.5) * 0.03, s.y + CHIP_H * (k + 0.5), s.z + (rand() - 0.5) * 0.03);
      q.setFromEuler(e.set(0, rand() * Math.PI * 2, 0));
      mesh.setMatrixAt(i++, m.compose(p, q, one));
    }
    mesh.frustumCulled = false;
    group.add(mesh);
  }
  return group;
}

// A single monumental chip, standing on its edge.
export async function bigChip(radius) {
  const mesh = new THREE.Mesh(chipGeometry(radius, radius * 0.174), await chipMaterials('camino'));
  // stand it on its edge, turned so CASINO CAMINO reads level to whoever faces it
  mesh.rotation.set(Math.PI / 2, Math.PI / 2, 0);
  const pivot = new THREE.Group(); pivot.add(mesh);
  return pivot;
}

// Data URL of a chip face for the 2D table (cached per palette + monogram).
const faceUrls = new Map();
export async function chipFaceURL(pal, center) {
  const key = JSON.stringify([pal, center]);
  if (!faceUrls.has(key)) {
    const c = document.createElement('canvas'); c.width = c.height = 160;
    await drawChipFace(c, pal, center);
    faceUrls.set(key, c.toDataURL());
  }
  return faceUrls.get(key);
}

// Ricochet's table piece: a low gold drum like a watch case, enamel dial on top,
// and a zoetrope band of galloping horses round its side. As the drum turns,
// every printed horse steps to its next frame, so the band seems to run.

import * as THREE from 'three';
import { watercolorMaterial } from './paint.js';

const FRAMES = 12;
const GOLD = '#c9a35a', GOLD_DARK = '#8c6a2c', ENAMEL = '#14211c';

// A galloping horse in silhouette. phase 0..1 through one stride.
function horse(ctx, phase, x, y, s) {
  const t = phase * Math.PI * 2;
  const bob = -Math.abs(Math.sin(t)) * 2.4;
  ctx.save();
  ctx.translate(x, y + bob * s);
  ctx.scale(s, s);
  ctx.lineCap = ctx.lineJoin = 'round';

  // legs: hip, then knee, then hoof; transverse gallop footfall order
  const leg = (hx, hy, off, front) => {
    const a = t + off * Math.PI * 2;
    const swing = Math.sin(a) * (front ? 0.75 : 0.65);
    const bend = Math.max(0, Math.sin(a + (front ? -1.2 : 1.1))) * (front ? 1.5 : 1.1);
    const kx = hx + Math.sin(swing) * 15, ky = hy + Math.cos(swing) * 15;
    const fx = kx + Math.sin(swing + (front ? -bend : bend)) * 16, fy = ky + Math.cos(swing + (front ? -bend : bend)) * 16;
    ctx.lineWidth = 4.2; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.stroke();
    ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
  };
  leg(-17, 3, 0.0, false);
  leg(-13, 3, 0.1, false);
  leg(13, 3, 0.5, true);
  leg(17, 3, 0.6, true);

  // body, neck, head, tail
  ctx.beginPath(); ctx.ellipse(0, 0, 23, 8.5, -0.05, 0, Math.PI * 2); ctx.fill();
  const lift = Math.sin(t + 0.6) * 0.18;
  ctx.save(); ctx.translate(17, -3); ctx.rotate(-1.0 + lift);
  ctx.beginPath(); ctx.moveTo(-5, 6); ctx.quadraticCurveTo(4, -2, 20, -2); ctx.lineTo(20, 6); ctx.quadraticCurveTo(6, 10, 2, 12); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.translate(21, 2); ctx.rotate(1.25);
  ctx.beginPath(); ctx.ellipse(5, 0, 9, 4.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-2, -4); ctx.lineTo(-5, -9); ctx.lineTo(1, -5); ctx.fill();   // ear
  ctx.restore();
  ctx.restore();
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-22, -3);
  ctx.quadraticCurveTo(-32, -6 + Math.sin(t) * 3, -36, 4 + Math.sin(t + 1) * 4); ctx.stroke();
  ctx.restore();
}

// One band image per animation step: cell i shows frame (i + step) of the stride.
function bands() {
  const W = 1536, H = 128, cells = FRAMES * 2;
  return Array.from({ length: FRAMES }, (_, step) => {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#e9c97c'); grad.addColorStop(0.45, GOLD); grad.addColorStop(1, GOLD_DARK);
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    // knurled edges, like the case of a watch
    g.fillStyle = GOLD_DARK;
    for (let x = 0; x < W; x += 6) { g.fillRect(x, 0, 2, 10); g.fillRect(x, H - 10, 2, 10); }
    g.fillStyle = ENAMEL; g.fillRect(0, 16, W, H - 32);
    g.strokeStyle = GOLD; g.lineWidth = 2;
    g.strokeRect(-2, 19, W + 4, H - 38);
    g.fillStyle = '#e9c97c'; g.strokeStyle = '#e9c97c';
    const cw = W / cells;
    for (let i = 0; i < cells; i++) {
      // a hairline between frames, as on a zoetrope strip
      g.globalAlpha = 0.35; g.fillRect(i * cw, 24, 1, H - 48); g.globalAlpha = 1;
      horse(g, ((i + step) % FRAMES) / FRAMES, i * cw + cw / 2, 52, 0.95);
    }
    // the ground line the horses run on
    g.globalAlpha = 0.5; g.fillRect(0, 84, W, 1.5); g.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    return tex;
  });
}

function dial() {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'), R = S / 2;
  g.translate(R, R);
  const grad = g.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R);
  grad.addColorStop(0, '#22352d'); grad.addColorStop(1, '#0c1511');
  g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fillStyle = GOLD; g.fill();
  g.beginPath(); g.arc(0, 0, R * 0.9, 0, Math.PI * 2); g.fillStyle = grad; g.fill();
  g.strokeStyle = '#e9c97c';
  for (let k = 0; k < 60; k++) {
    const a = (k / 60) * Math.PI * 2, long = k % 10 === 0;
    g.lineWidth = long ? 7 : 2.5;
    g.beginPath(); g.moveTo(Math.cos(a) * R * (long ? 0.7 : 0.8), Math.sin(a) * R * (long ? 0.7 : 0.8)); g.lineTo(Math.cos(a) * R * 0.86, Math.sin(a) * R * 0.86); g.stroke();
  }
  g.lineWidth = 2;
  for (const r of [0.88, 0.56, 0.17]) { g.beginPath(); g.arc(0, 0, R * r, 0, Math.PI * 2); g.stroke(); }
  g.fillStyle = '#e9c97c'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `600 ${R * 0.085}px "Cinzel Decorative", "Cormorant Garamond", serif`;
  g.fillText('CASINO CAMINO', 0, -R * 0.34);
  g.font = `500 ${R * 0.07}px "Cormorant Garamond", serif`;
  g.fillText('Ricochet', 0, R * 0.34);
  g.beginPath(); g.arc(0, 0, R * 0.06, 0, Math.PI * 2); g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return tex;
}

export function createZoetrope({ radius = 1.6, height = 0.75 } = {}) {
  const geo = new THREE.CylinderGeometry(radius, radius * 1.02, height, 96, 1);
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(1), 3));
  const frames = bands();
  const side = watercolorMaterial({ map: frames[0], revealed: true });
  const top = watercolorMaterial({ map: dial(), revealed: true });
  const bottom = watercolorMaterial({ revealed: true });
  bottom.uniforms.uHasMap.value = 0;
  for (const m of [side, top, bottom]) { m.transparent = false; m.depthWrite = true; m.polygonOffset = false; }
  const drum = new THREE.Mesh(geo, [side, top, bottom]);
  drum.position.y = height / 2;
  const group = new THREE.Group();
  group.add(drum);
  return {
    group,
    mesh: drum,
    // turn the drum, and step every printed horse to its next frame as it passes
    update(time) {
      group.rotation.y = time * 0.9;
      side.uniforms.uMap.value = frames[Math.floor(time * 11) % FRAMES];
    },
  };
}

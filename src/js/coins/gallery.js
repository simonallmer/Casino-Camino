// All nine coins side by side, in three rows.
// Hover a coin and it turns toward you; click it to hold it.
// One canvas draws every coin into its own cell, so the page needs only one drawing context.

import * as THREE from 'three';
import { deskFrame, studio, openCoin } from './viewer.js';
import { SET, TIERS, buildSetCoin } from './set.js';
import { COIN_R } from './coin.js';

const rings = n => `<svg class="ring-mark" viewBox="0 0 40 40" aria-hidden="true">${[17, 12.5, 8].slice(0, n).map(r => `<circle cx="20" cy="20" r="${r}"/>`).join('')}</svg>`;
const ringWords = ['', 'One ring', 'Two rings', 'Three rings'];

export function openCoins(root, { onLeave, back }) {
  const reopen = () => openCoins(root, { onLeave, back });
  const hold = id => openCoin(root, { id, back: 'All coins', onLeave: reopen, onNav: next => hold(next) });

  const frame = deskFrame(root, {
    name: 'The Coins', meta: 'Nine coins · three rows', onLeave, back, cls: 'gallery-view',
    body: `
      <div class="gallery">
        <p class="gallery-intro">The body tells you how many digits: silver for one, gold for two, black for three. The star tells you the first: green for a 1, blue for a 2, red for a 5. The rings on the face and edge count the digits too.</p>
        ${TIERS.map((t, ti) => `
        <section class="tier">
          <header class="tier-head">
            ${rings(t.rings)}
            <div><h3>${t.name}</h3><p>${ringWords[t.rings]} · ${t.note}</p></div>
          </header>
          <div class="tier-coins">
            ${SET.filter(c => c.tier === ti).map(c => `
            <button class="coin-cell" data-coin="${c.id}" aria-label="${c.name}, worth ${c.value}">
              <div class="coin-shot"></div>
              <b class="coin-val">${c.value}</b>
              <span class="coin-name">${c.colour} star</span>
              <small>${c.star} on ${c.body.toLowerCase()}</small>
            </button>`).join('')}
          </div>
        </section>`).join('')}
      </div>
      <canvas class="gallery-canvas"></canvas>`,
  });

  const scroller = frame.$('.gallery'), canvas = frame.$('.gallery-canvas');
  const cells = [...root.querySelectorAll('.coin-cell')];
  scroller.addEventListener('click', e => {
    const cell = e.target.closest('.coin-cell');
    if (cell && frame.close()) hold(cell.dataset.coin);
  });

  // ── one renderer for every cell
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  renderer.setScissorTest(true);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(studio(), 0.02);
  const camera = new THREE.PerspectiveCamera(30, 1, 1, 1000);
  camera.position.set(0, 0, COIN_R / Math.tan(15 * Math.PI / 180) * 1.12);
  const disposers = [];
  let closed = false;
  frame.onCleanup(() => { closed = true; cancelAnimationFrame(raf); disposers.forEach(f => f()); env.dispose(); pmrem.dispose(); renderer.dispose(); });

  const shots = cells.map((cell, i) => {
    const scene = new THREE.Scene(); scene.environment = env.texture;
    const pivot = new THREE.Group(); scene.add(pivot);
    const shot = { cell, el: cell.querySelector('.coin-shot'), scene, pivot, i, hover: 0, tx: 0, ty: 0 };
    buildSetCoin(SET.find(c => c.id === cell.dataset.coin)).then(c => {
      if (closed) { c.dispose(); return; }
      pivot.add(c.group); c.group.rotation.x = -0.18;
      disposers.push(c.dispose);
    });
    // hover: the coin turns toward the pointer
    cell.addEventListener('pointerenter', () => { shot.on = true; });
    cell.addEventListener('pointerleave', () => { shot.on = false; shot.tx = shot.ty = 0; });
    cell.addEventListener('pointermove', e => {
      const r = shot.el.getBoundingClientRect();
      shot.tx = ((e.clientX - r.left) / r.width - 0.5) * 1.1;
      shot.ty = ((e.clientY - r.top) / r.height - 0.5) * 0.9;
    });
    return shot;
  });

  let raf = 0;
  const size = new THREE.Vector2();
  const loop = now => {
    raf = requestAnimationFrame(loop);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.getSize(size);
    if (size.x !== w || size.y !== h) renderer.setSize(w, h, false);
    const box = canvas.getBoundingClientRect(), view = scroller.getBoundingClientRect();
    renderer.setScissor(0, 0, w, h); renderer.clear();
    const t = now / 1000;
    for (const s of shots) {
      const r = s.el.getBoundingClientRect();
      if (r.bottom < view.top || r.top > view.bottom || !r.width) continue;
      // a slow idle sway; on hover it faces you and leans toward the pointer
      s.hover += ((s.on ? 1 : 0) - s.hover) * 0.12;
      const idle = Math.sin(t * 0.7 + s.i * 0.9) * 0.55;
      s.pivot.rotation.y = idle * (1 - s.hover) + s.tx * s.hover;
      s.pivot.rotation.x = s.ty * s.hover;
      s.pivot.scale.setScalar(1 + s.hover * 0.06);
      // draw it into its own cell, clipped to the scrolling area
      const left = r.left - box.left, bottom = box.bottom - r.bottom;
      const top = Math.max(r.top, view.top), bot = Math.min(r.bottom, view.bottom);
      renderer.setViewport(left, bottom, r.width, r.height);
      renderer.setScissor(left, box.bottom - bot, r.width, Math.max(0, bot - top));
      camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
      renderer.render(s.scene, camera);
    }
  };
  raf = requestAnimationFrame(loop);
}

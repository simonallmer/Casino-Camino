// The coin in your hand: turn it, flip it, and lift the gold star out to see the chip beneath.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildCoin, metalMaterials, COIN_R } from './coin.js';
import { mintDate, serial, TOTAL } from './world.js';

// The shared frame of the desk views: a header with the way back, a stage and a side panel.
export function deskFrame(root, { name, meta, onLeave, cls = '' }) {
  root.innerHTML = `
    <div class="desk-view ${cls}">
      <header class="tbl-top">
        <button class="link" data-act="leave">← Back to the desk</button>
        <div class="tbl-title"><span class="tbl-name">${name}</span><span class="tbl-meta">${meta}</span></div>
        <span></span>
      </header>
      <div class="desk-body">
        <div class="desk-stage"><canvas></canvas></div>
        <aside class="desk-side"></aside>
      </div>
    </div>`;
  const $ = s => root.querySelector(s);
  const cleanups = [];
  let gone = false;
  const leave = () => {
    if (gone) return;
    gone = true;
    cleanups.forEach(f => f());
    onLeave();
  };
  $('[data-act="leave"]').addEventListener('click', leave);
  const esc = e => { if (e.key === 'Escape') leave(); };
  addEventListener('keydown', esc);
  cleanups.push(() => removeEventListener('keydown', esc));
  return { $, stage: $('.desk-stage'), canvas: $('canvas'), side: $('.desk-side'), onCleanup: f => cleanups.push(f), leave };
}

// a renderer that follows the size of its stage and stops when the view closes
export function stageRenderer(frame, { alpha = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas: frame.canvas, antialias: true, alpha });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 2000);
  const resize = () => {
    const w = frame.stage.clientWidth, h = frame.stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    // the subject is round: on a tall stage, widen the view so it still fits side to side
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 2 * Math.atan(Math.tan(15 * Math.PI / 180) / (w / h)) * 180 / Math.PI : 30;
    camera.updateProjectionMatrix();
    frame.onResize?.(w, h);
  };
  const ro = new ResizeObserver(resize); ro.observe(frame.stage);
  let raf = 0, tick = null;
  const loop = now => { raf = requestAnimationFrame(loop); tick?.(now); };
  raf = requestAnimationFrame(loop);
  frame.onCleanup(() => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); });
  resize();
  return { renderer, camera, onTick: f => { tick = f; }, resize };
}

const FEATURED = 7;

// A dark studio with three softboxes, for the metal to reflect: silver needs something to mirror.
function studio() {
  const scene = new THREE.Scene();
  const c = document.createElement('canvas'); c.width = 4; c.height = 256;
  const ctx = c.getContext('2d'), g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#9a9083'); g.addColorStop(0.48, '#5a524a'); g.addColorStop(0.52, '#2a251f'); g.addColorStop(1, '#14110d');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide })));
  const box = (w, h, intensity, tint, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); scene.add(m);
  };
  box(30, 18, 6, '#fff4e6', [-26, 30, 30]);   // the key, high and to the left
  box(46, 30, 2.6, '#fff8ee', [-6, 16, 52]);  // a broad soft light behind you, for the faces to mirror
  box(8, 40, 3.5, '#e8f0ff', [40, 4, 10]);    // a tall strip on the right, for the rim
  box(24, 6, 2.2, '#ffd7a0', [0, -18, 40]);   // warm bounce from below
  box(20, 12, 1.4, '#ffffff', [6, 26, -40]);  // a little light from behind
  return scene;
}

export async function openCoin(root, { onLeave }) {
  const frame = deskFrame(root, { name: 'The Coin', meta: `One of ${TOTAL.toLocaleString('en')}`, onLeave, cls: 'coin-view' });
  frame.side.innerHTML = `
    <p class="kicker">The Casino Camino Coin</p>
    <h2>Silver, with a star of gold.</h2>
    <p>A silver coin, 39 mm across. The six-pointed star is set in gold, flush on both faces, and the words CASINO CAMINO ring it on either side.</p>
    <p>The coin’s identity lives <em>inside</em> the star: a tiny chip that holds its serial number, one of a hundred thousand. Hold a phone to the star and the coin checks in.</p>
    <dl class="coin-specs">
      <div><dt>Diameter</dt><dd>39 mm</dd></div>
      <div><dt>Thickness</dt><dd>3.3 mm</dd></div>
      <div><dt>Body</dt><dd>Silver</dd></div>
      <div><dt>Star</dt><dd>Gold, both faces</dd></div>
      <div><dt>Inside the star</dt><dd>NFC chip · serial</dd></div>
    </dl>
    <div class="actions wrap">
      <button class="btn" data-act="open">Lift the star</button>
      <button class="btn ghost" data-act="flip">Turn it over</button>
    </div>`;
  frame.stage.insertAdjacentHTML('beforeend', `
    <div class="chip-callout"><b>${serial(FEATURED)}</b><span>The coin’s own number, held in the chip under the star</span><small>Struck ${mintDate(FEATURED).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · sample</small></div>
    <p class="desk-hint">Drag to turn it</p>`);

  const { renderer, camera, onTick } = stageRenderer(frame);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(studio(), 0.02);
  scene.environment = env.texture;
  frame.onCleanup(() => { env.dispose(); pmrem.dispose(); });

  const mats = metalMaterials();
  const coin = await buildCoin(mats);
  const holder = new THREE.Group();
  holder.add(coin.group);
  scene.add(holder);
  coin.group.rotation.x = -0.32;
  frame.onCleanup(() => Object.values(mats).forEach(m => { m.map?.dispose(); m.dispose(); }));

  camera.position.set(0, 0, COIN_R * 6.6);
  const controls = new OrbitControls(camera, frame.canvas);
  controls.enablePan = false; controls.enableDamping = true;
  controls.minDistance = COIN_R * 3; controls.maxDistance = COIN_R * 10;
  controls.autoRotate = true; controls.autoRotateSpeed = 1.4;
  frame.onCleanup(() => controls.dispose());
  let idleAt = 0;
  controls.addEventListener('start', () => { controls.autoRotate = false; facing = null; frame.stage.classList.add('touched'); });
  controls.addEventListener('end', () => { idleAt = performance.now(); });

  // lift the star out, and the coin tips toward you so you can look into the pocket
  let open = 0, openTo = 0, flip = 0, flipTo = 0, facing = null;
  const callout = frame.$('.chip-callout'), openBtn = frame.$('[data-act="open"]');
  frame.$('[data-act="open"]').addEventListener('click', () => {
    openTo = openTo ? 0 : 1;
    if (openTo) {
      flipTo = Math.round(flipTo / (Math.PI * 2)) * Math.PI * 2; // the chip is under the front star
      // come round to the front, a little above, to look into the pocket
      controls.autoRotate = false; idleAt = 0;
      facing = { from: camera.position.clone(), to: new THREE.Vector3(0, Math.sin(0.18), Math.cos(0.18)).multiplyScalar(camera.position.length()), t0: performance.now() };
    }
    openBtn.textContent = openTo ? 'Set the star back' : 'Lift the star';
  });
  frame.$('[data-act="flip"]').addEventListener('click', () => { flipTo += Math.PI; if (openTo) { openTo = 0; openBtn.textContent = 'Lift the star'; } });

  const chipAt = new THREE.Vector3();
  onTick(now => {
    if (!controls.autoRotate && idleAt && now - idleAt > 6000 && !openTo) { controls.autoRotate = true; idleAt = 0; }
    open += (openTo - open) * 0.08;
    flip += (flipTo - flip) * 0.08;
    coin.top.position.z = open * 18;
    coin.top.rotation.z = open * 0.5;
    holder.rotation.y = flip;
    holder.rotation.x = -open * 0.75;
    if (facing) {
      const t = Math.min(1, (performance.now() - facing.t0) / 1100), e = t * t * (3 - 2 * t), d = facing.from.length();
      camera.position.copy(facing.from).lerp(facing.to, e).setLength(d);
      if (t >= 1) facing = null;
    }
    controls.update();
    renderer.render(scene, camera);
    // the callout points at the chip while the star is out
    callout.classList.toggle('on', open > 0.6);
    if (open > 0.05) {
      coin.group.localToWorld(chipAt.set(0, 0, 1.2)).project(camera);
      const w = frame.stage.clientWidth, h = frame.stage.clientHeight;
      callout.style.transform = `translate(${(chipAt.x * 0.5 + 0.5) * w}px, ${(-chipAt.y * 0.5 + 0.5) * h}px)`;
    }
  });
}

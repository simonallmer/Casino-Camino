// Where are the coins? A globe you can turn, with every country's active coins standing up from it,
// a year slider from the 2027 test run to the last coin in 2060, and the travel log of any coin.
// Today (before the test run) the honest answer is: nowhere yet. Everything else is a sample.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { deskFrame, stageRenderer } from './viewer.js';
import { worldCanvas, lonLatToVec, simulate, travelLog, mintDate, mintedBy, serial, TOTAL, TEST_YEAR, FIRST_YEAR, LAST_YEAR, TEST_COINS } from './world.js';

const fmt = n => n.toLocaleString('en');
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const NOW_YEAR = new Date().getFullYear();

export async function openGlobe(root, { onLeave }) {
  const frame = deskFrame(root, { name: 'The Globe', meta: 'Where are the coins?', onLeave, cls: 'globe-view' });
  frame.side.innerHTML = `
    <p class="kicker">The Casino Camino Coin</p>
    <h2>Where are the coins?</h2>
    <div class="seg" role="group" aria-label="Show">
      <button data-mode="live">Today</button><button data-mode="sim" class="on">Simulate</button>
    </div>
    <div class="year-row">
      <button class="play" aria-label="Play the years"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></button>
      <input type="range" min="${TEST_YEAR}" max="${LAST_YEAR}" step="1" value="2034" aria-label="Year">
      <output>2034</output>
    </div>
    <p class="globe-note"></p>
    <div class="globe-stats"></div>
    <div class="mint-track"><i></i></div>
    <div class="mint-ends"><span>Test run · ${TEST_YEAR}</span><span>First coin · ${FIRST_YEAR}</span><span>Last coin · ${LAST_YEAR}</span></div>
    <h3>Last seen</h3>
    <ol class="globe-top"></ol>
    <h3>Find a coin</h3>
    <form class="find"><span>#</span><input inputmode="numeric" maxlength="6" placeholder="000007" aria-label="Serial number"><button class="btn">Look up</button></form>
    <div class="coin-log"></div>
    <p class="fine">Locations are shown by country only. We never publish where a coin, or its holder, is exactly. Simulation figures are sample data on the fixed schedule, not a forecast.</p>`;
  frame.stage.insertAdjacentHTML('beforeend', '<div class="globe-tip"></div><p class="desk-hint">Drag to turn the world · touch a country</p>');
  const $ = frame.$;

  // ── the globe
  const { renderer, camera, onTick } = stageRenderer(frame);
  const scene = new THREE.Scene();
  const R = 1;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const world = new THREE.Group();
  world.add(ball);
  scene.add(world);
  const theme = () => document.documentElement.dataset.theme === 'night';
  const colors = () => theme()
    ? { sea: '#14130f', land: '#2c2619', coast: '#caa862', grid: '#6b5a39', spike: '#e7a96f', hot: '#ffd69a', arc: '#f2cf86', ring: '#caa862' }
    : { sea: '#e9e0cc', land: '#d3c19c', coast: '#2b251d', grid: '#8a7e69', spike: '#b8643a', hot: '#7d1f24', arc: '#7d1f24', ring: '#2b251d' };
  let col = colors();
  const paintMap = async () => {
    const c = await worldCanvas({ width: 4096, sea: col.sea, land: col.land, coast: col.coast, grid: col.grid, coastWidth: 2.4, gridWidth: 1.5, gridAlpha: 0.35 });
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    ball.material.map?.dispose(); ball.material.map = tex; ball.material.needsUpdate = true;
  };
  paintMap();
  frame.onCleanup(() => { ball.material.map?.dispose(); ball.material.dispose(); ball.geometry.dispose(); });

  // an ink circle round the globe's edge, always facing you
  const rim = new THREE.Mesh(new THREE.RingGeometry(1, 1.012, 128), new THREE.MeshBasicMaterial({ color: col.ring, transparent: true, opacity: 0.8 }));
  scene.add(rim);

  // spikes: one per country, as tall as the square root of its active coins
  const spikes = new THREE.Group(); world.add(spikes);
  const spikeMat = new THREE.MeshBasicMaterial({ color: col.spike });
  const hotMat = new THREE.MeshBasicMaterial({ color: col.hot });
  const baseMat = new THREE.MeshBasicMaterial({ color: col.spike, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
  const up = new THREE.Vector3(0, 1, 0);
  let hits = [];
  function setSpikes(countries) {
    spikes.children.forEach(o => o.geometry.dispose());
    spikes.clear(); hits = [];
    const max = Math.max(1, ...countries.map(c => c.count));
    for (const c of countries) {
      const h = 0.025 + 0.3 * Math.sqrt(c.count / max), w = 0.006 + 0.009 * Math.sqrt(c.count / max);
      const dir = lonLatToVec(c.lon, c.lat);
      const g = new THREE.CylinderGeometry(w, w, h, 10); g.translate(0, h / 2, 0);
      const m = new THREE.Mesh(g, spikeMat);
      m.position.copy(dir); m.quaternion.setFromUnitVectors(up, dir);
      const base = new THREE.Mesh(new THREE.CircleGeometry(w * 3.2, 24).rotateX(-Math.PI / 2), baseMat);
      base.position.copy(dir).multiplyScalar(1.001); base.quaternion.copy(m.quaternion);
      // a fatter invisible pick target, so small countries are easy to touch
      const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, h + 0.04, 6).translate(0, h / 2, 0), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.copy(m.position); hit.quaternion.copy(m.quaternion); hit.userData.country = c; m.userData.country = c;
      spikes.add(base, m, hit); hits.push(hit);
    }
  }

  // the travel log of one coin, drawn as arcs over the surface
  const arcMat = new LineMaterial({ color: col.arc, linewidth: 2.6, transparent: true });
  const route = new THREE.Group(); world.add(route);
  let arcLine = null, arcReveal = 0, arcSegs = 0;
  function setRoute(stops) {
    route.children.forEach(o => o.geometry.dispose());
    route.clear(); arcLine = null;
    if (!stops?.length) return;
    const pts = [];
    for (let i = 1; i < stops.length; i++) {
      const a = lonLatToVec(stops[i - 1].lon, stops[i - 1].lat), b = lonLatToVec(stops[i].lon, stops[i].lat);
      const ang = a.angleTo(b), n = 40, lift = 0.04 + Math.min(0.35, ang * 0.22);
      const q0 = new THREE.Quaternion(), q = new THREE.Quaternion().setFromUnitVectors(a, b);
      let prev = a.clone().multiplyScalar(1.004);
      for (let k = 1; k <= n; k++) {
        const t = k / n, p = a.clone().applyQuaternion(q0.clone().slerp(q, t)).multiplyScalar(1.004 + Math.sin(Math.PI * t) * lift);
        pts.push(prev.x, prev.y, prev.z, p.x, p.y, p.z); prev = p;
      }
    }
    for (const [i, s] of stops.entries()) {
      const d = lonLatToVec(s.lon, s.lat);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.018, 0.028, 24), new THREE.MeshBasicMaterial({ color: i === 0 ? col.hot : col.arc, side: THREE.DoubleSide }));
      ring.position.copy(d).multiplyScalar(1.006); ring.lookAt(d.clone().multiplyScalar(2));
      route.add(ring);
    }
    if (pts.length) {
      const g = new LineSegmentsGeometry(); g.setPositions(pts);
      arcLine = new LineSegments2(g, arcMat); arcSegs = pts.length / 6; arcReveal = 0;
      g.instanceCount = 0;
      route.add(arcLine);
    }
    turnTo(stops[stops.length - 1]);
  }
  frame.onCleanup(() => arcMat.dispose());

  // ── camera: drag to turn, it drifts on by itself when left alone
  camera.position.copy(lonLatToVec(12, 32, 4.7));
  const controls = new OrbitControls(camera, frame.canvas);
  controls.enablePan = false; controls.enableDamping = true; controls.rotateSpeed = 0.6;
  controls.minDistance = 1.9; controls.maxDistance = 7;
  controls.autoRotate = true; controls.autoRotateSpeed = 0.5;
  frame.onCleanup(() => controls.dispose());
  let idleAt = 0, turning = null;
  controls.addEventListener('start', () => { controls.autoRotate = false; turning = null; frame.stage.classList.add('touched'); });
  controls.addEventListener('end', () => { idleAt = performance.now(); });
  function turnTo(c) {
    const d = camera.position.length();
    turning = { from: camera.position.clone(), to: lonLatToVec(c.lon, Math.max(-50, Math.min(55, c.lat + 8)), d), t0: performance.now() };
    controls.autoRotate = false; idleAt = performance.now() + 4000;
  }

  // ── touch a country
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), tip = $('.globe-tip');
  let hovered = null;
  function pickAt(e) {
    const r = frame.canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(hits, false)[0];
    const front = ray.intersectObject(ball, false)[0];
    const c = hit && (!front || hit.distance <= front.distance + 0.02) ? hit.object.userData.country : null;
    hovered = c;
    tip.classList.toggle('on', !!c);
    frame.canvas.style.cursor = c ? 'pointer' : '';
    if (c) {
      tip.innerHTML = `<b>${c.name}</b><span>${fmt(c.count)} active coin${c.count === 1 ? '' : 's'}</span>`;
      tip.style.transform = `translate(${e.clientX - r.left + 14}px, ${e.clientY - r.top - 46}px)`;
    }
  }
  frame.canvas.addEventListener('pointermove', pickAt);
  frame.canvas.addEventListener('pointerleave', () => tip.classList.remove('on'));
  frame.canvas.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') pickAt(e); });

  // ── the side panel
  const range = $('input[type=range]'), out = $('output'), note = $('.globe-note');
  let mode = 'sim', year = 2034, playing = null, current = null;
  const stat = (label, value, cls = '') => `<div class="${cls}"><span>${label}</span><b>${value}</b></div>`;
  function render() {
    root.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
    frame.side.classList.toggle('live', mode === 'live');
    if (mode === 'live') {
      current = { minted: 0, active: 0, unknown: 0, neverSeen: 0, toCome: TOTAL, countries: [] };
      note.innerHTML = `<b>${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}.</b> Not one coin is out yet. The test run goes out in ${TEST_YEAR}; the mint strikes its first coin on 1 January ${FIRST_YEAR}.`;
    } else {
      current = simulate(year);
      note.innerHTML = current.test
        ? `<b>${year} · test run.</b> A trial batch goes out before the mint opens. Sample of ${TEST_COINS} test coins.`
        : `<b>End of ${year} · simulation.</b> ${fmt(current.minted)} of ${fmt(TOTAL)} struck, about eight a day.`;
    }
    out.textContent = mode === 'live' ? 'Today' : year;
    range.value = year; range.disabled = mode === 'live';
    $('.globe-stats').innerHTML =
      stat(current.test ? 'Test coins' : 'Minted', fmt(current.minted)) + stat('Active', fmt(current.active), 'k-active') +
      stat('Unknown', fmt(current.unknown), 'k-unknown') + stat('Never seen', fmt(current.neverSeen), 'k-never');
    $('.mint-track i').style.width = `${(current.test ? 0 : current.minted / TOTAL) * 100}%`;
    const top = current.countries.slice(0, 8), max = top[0]?.count || 1;
    $('.globe-top').innerHTML = top.length
      ? top.map(c => `<li><span>${c.name}</span><i style="--w:${(c.count / max) * 100}%"></i><b>${fmt(c.count)}</b></li>`).join('')
      : '<li class="empty">No taps yet. The map fills in as the coins go out.</li>';
    setSpikes(current.countries);
    showCoin(lookedUp);
  }

  // find a coin by its serial
  let lookedUp = 7;
  function showCoin(n) {
    const log = $('.coin-log');
    if (!n) { log.innerHTML = ''; setRoute(null); return; }
    const when = mintDate(n), whenText = when.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const asOf = mode === 'live' ? NOW_YEAR : year;
    if (mode === 'live' || n > mintedBy(asOf)) {
      log.innerHTML = `<div class="log-head"><b>${serial(n)}</b><span class="pill">Not yet struck</span></div><p>On the schedule for ${whenText}.</p>`;
      setRoute(null); return;
    }
    const t = travelLog(n, asOf);
    log.innerHTML = `
      <div class="log-head"><b>${serial(n)}</b><span class="pill">Active</span></div>
      <p>Struck ${whenText}${n <= 100 ? ' · one of the first hundred' : ''}</p>
      <div class="log-nums"><div><b>${t.countries}</b><span>countries</span></div><div><b>${t.checkIns}</b><span>check-ins</span></div></div>
      <p class="kicker">Travel log</p>
      <ol class="log-trail">${t.stops.map(s => `<li><span>${s.name}</span></li>`).join('')}</ol>`;
    setRoute(t.stops);
  }
  $('.find').addEventListener('submit', e => {
    e.preventDefault();
    const n = parseInt($('.find input').value.replace(/\D/g, ''), 10);
    if (n >= 1 && n <= TOTAL) { lookedUp = n; showCoin(n); } else $('.coin-log').innerHTML = `<p class="muted">Serials run from 000001 to ${fmt(TOTAL).replace(',', '')}.</p>`;
  });

  root.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { stop(); mode = b.dataset.mode; render(); }));
  range.addEventListener('input', () => { stop(); mode = 'sim'; year = +range.value; render(); });
  const playBtn = $('.play');
  function stop() { clearInterval(playing); playing = null; playBtn.classList.remove('on'); }
  playBtn.addEventListener('click', () => {
    if (playing) { stop(); return; }
    mode = 'sim';
    if (year >= LAST_YEAR) year = TEST_YEAR;
    playBtn.classList.add('on');
    render();
    playing = setInterval(() => { year++; render(); if (year >= LAST_YEAR) stop(); }, 420);
  });
  frame.onCleanup(stop);
  render();

  // ── each frame
  const ease = t => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  frame.onResize = (w, h) => arcMat.resolution.set(w, h);
  frame.onResize(frame.stage.clientWidth, frame.stage.clientHeight);
  onTick(now => {
    if (!controls.autoRotate && idleAt && now - idleAt > 6000) { controls.autoRotate = true; idleAt = 0; }
    if (turning) {
      const t = Math.min(1, (now - turning.t0) / 1400), d = turning.from.length();
      camera.position.copy(turning.from).lerp(turning.to, ease(t)).setLength(d);
      if (t >= 1) turning = null;
    }
    if (arcLine && arcReveal < 1) { arcReveal = Math.min(1, arcReveal + 0.012); arcLine.geometry.instanceCount = Math.ceil(arcSegs * arcReveal); }
    controls.update();
    // keep the ink rim on the silhouette: a ring of the right size, always facing the camera
    const d = camera.position.length();
    rim.scale.setScalar(R * Math.sqrt(1 - (R * R) / (d * d)) * 1.002);
    rim.position.copy(camera.position).setLength(R * R / d);
    rim.lookAt(camera.position);
    renderer.render(scene, camera);
  });
}

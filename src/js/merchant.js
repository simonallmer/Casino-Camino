// Mr. Jeremiah Thistlewood, merchant of Bristol, resident of the casino floor since 1764,
// somewhat in his cups. A paper figure in a drawn room: ink until touched, then painted.

import * as THREE from 'three';

const W = 600, H = 1200;

// ── the figure, as paths in a 600×1200 box (y down)
function figure() {
  const P = d => new Path2D(d);
  const ell = (x, y, rx, ry) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); return p; };
  const circ = (x, y, r) => ell(x, y, r, r);
  return [
    // legs and shoes
    { name: 'stocking', color: '#ece3cf', path: P('M 212 905 L 282 910 Q 285 1000 270 1100 L 228 1100 Q 214 1000 212 905 Z') },
    { name: 'stocking', color: '#ece3cf', path: P('M 318 910 L 392 905 Q 386 1000 372 1100 L 330 1100 Q 315 1000 318 910 Z') },
    { name: 'shoe', color: '#2e2622', path: P('M 222 1098 L 276 1098 Q 282 1128 272 1142 L 196 1144 Q 178 1140 186 1124 Q 200 1114 222 1098 Z') },
    { name: 'shoe', color: '#2e2622', path: P('M 326 1098 L 378 1098 Q 400 1114 414 1124 Q 422 1140 404 1144 L 330 1142 Q 318 1128 326 1098 Z') },
    { name: 'buckle', color: '#c9ccd0', path: P('M 232 1108 h 22 v 14 h -22 Z') },
    { name: 'buckle', color: '#c9ccd0', path: P('M 346 1108 h 22 v 14 h -22 Z') },
    { name: 'breeches', color: '#c7ab7c', path: P('M 208 780 Q 300 812 392 780 L 397 908 L 315 912 L 302 842 L 287 912 L 203 908 Z') },
    // coat, waistcoat and the belly it barely contains
    { name: 'coat', color: '#7a2633', shade: true, path: P('M 250 330 L 200 345 Q 168 362 164 420 L 150 700 Q 140 850 116 976 L 232 992 Q 236 880 242 790 L 258 380 Z') },
    { name: 'coat', color: '#7a2633', shade: true, path: P('M 350 330 L 400 345 Q 432 362 436 420 L 450 700 Q 460 850 484 976 L 368 992 Q 364 880 358 790 L 342 380 Z') },
    { name: 'waistcoat', color: '#c99a3b', path: P('M 258 378 Q 300 368 342 378 Q 424 520 408 682 Q 398 784 300 804 Q 202 784 192 682 Q 176 520 258 378 Z') },
    { name: 'pocket', color: '#6a1f2b', path: P('M 158 700 Q 192 686 228 700 L 226 724 Q 192 712 160 726 Z') },
    { name: 'pocket', color: '#6a1f2b', path: P('M 372 700 Q 408 686 442 700 L 440 726 Q 408 712 374 724 Z') },
    // left arm resting on the belly
    { name: 'sleeve', color: '#7a2633', shade: true, path: P('M 202 348 Q 158 380 150 470 Q 142 560 160 630 L 206 626 Q 196 560 206 470 Z') },
    { name: 'cuff', color: '#c99a3b', path: P('M 150 614 L 210 608 L 216 662 L 146 670 Z') },
    { name: 'hand', color: '#efc39f', path: ell(186, 690, 25, 22) },
    // cravat and head
    { name: 'cravat', color: '#f6f1e6', path: P('M 260 316 Q 300 340 340 316 L 354 360 Q 332 380 342 402 Q 300 432 258 402 Q 268 380 246 360 Z') },
    { name: 'wig', color: '#e6dfd3', path: ell(300, 226, 90, 94) },
    { name: 'face', color: '#efc39f', path: ell(300, 240, 60, 72) },
    { name: 'cheek', color: '#de7a6c', path: circ(262, 270, 15), noInk: true },
    { name: 'cheek', color: '#de7a6c', path: circ(338, 270, 15), noInk: true },
    { name: 'nose', color: '#cf5547', path: circ(300, 256, 15) },
    { name: 'curl', color: '#e6dfd3', path: circ(222, 250, 22) },
    { name: 'curl', color: '#e6dfd3', path: circ(220, 292, 20) },
    { name: 'curl', color: '#e6dfd3', path: circ(378, 250, 22) },
    { name: 'curl', color: '#e6dfd3', path: circ(380, 292, 20) },
    // the tricorn, knocked askew
    { name: 'hat', color: '#3a2c24', tilt: [-0.2, 300, 150], path: P('M 186 170 Q 212 90 300 84 Q 388 90 414 170 Q 362 150 300 198 Q 238 150 186 170 Z') },
    // right arm raised in a toast
    { name: 'sleeve', color: '#7a2633', shade: true, path: P('M 398 345 Q 456 360 490 430 Q 502 462 480 472 Q 454 472 440 442 Q 420 410 394 400 Z') },
    { name: 'sleeve', color: '#7a2633', shade: true, path: P('M 452 458 Q 502 442 506 380 L 500 330 L 458 330 Q 462 392 438 432 Z') },
    { name: 'cuff', color: '#c99a3b', path: P('M 452 342 L 508 338 L 512 300 L 450 306 Z') },
    { name: 'hand', color: '#efc39f', path: ell(481, 290, 23, 20) },
    { name: 'tankard', color: '#9aa1a8', tilt: [0.16, 480, 245], path: P('M 446 206 L 514 206 L 510 286 L 450 286 Z') },
    { name: 'handle', color: '#9aa1a8', tilt: [0.16, 480, 245], path: P('M 512 218 Q 548 226 544 254 Q 540 278 510 274 L 511 262 Q 530 262 531 252 Q 532 236 512 232 Z') },
    { name: 'foam', color: '#fbf6ea', tilt: [0.16, 480, 245], path: (() => { const p = new Path2D(); [[456, 200, 13], [476, 193, 15], [498, 196, 14], [514, 204, 10]].forEach(([x, y, r]) => p.addPath(circ(x, y, r))); return p; })() },
  ];
}

// Ink-only details drawn on top: faces, buttons, folds, hatching.
const DETAILS = [
  'M 262 210 Q 278 200 292 208', 'M 308 206 Q 322 198 338 210',           // brows raised in surprise at his own wit
  'M 268 230 Q 280 222 292 230', 'M 308 230 Q 320 222 332 230',           // heavy lids
  'M 272 234 Q 280 238 290 234', 'M 310 234 Q 320 238 328 234',
  'M 276 292 Q 300 314 330 286',                                        // a crooked grin
  'M 262 302 Q 300 332 338 302',                                        // the second chin
  'M 270 336 Q 284 350 300 342 Q 316 350 330 336', 'M 266 372 Q 300 392 334 372',
  'M 300 800 L 300 384',                                                // waistcoat closure
  'M 210 894 L 288 898', 'M 314 898 L 392 894',                          // knee bands
  'M 200 360 Q 214 600 238 790', 'M 400 360 Q 386 600 362 790',          // coat lapels
  'M 470 222 L 504 222', 'M 466 268 L 500 270',                          // tankard bands
  'M 512 212 Q 524 240 516 256',                                        // a drip
];

function watercolor(ctx, path, color, rand) {
  const c = new THREE.Color(color);
  const dark = `rgb(${c.r * 160 | 0},${c.g * 160 | 0},${c.b * 160 | 0})`;
  const light = `rgb(${Math.min(255, c.r * 255 + 40) | 0},${Math.min(255, c.g * 255 + 40) | 0},${Math.min(255, c.b * 255 + 40) | 0})`;
  ctx.save();
  ctx.fillStyle = color; ctx.globalAlpha = 0.92; ctx.fill(path);
  ctx.clip(path);
  for (let i = 0; i < 16; i++) {
    const x = rand() * W, y = rand() * H, r = 30 + rand() * 90;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rand() < 0.5 ? dark : light); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.16; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.fillStyle = dark; ctx.globalAlpha = 0.12;
  for (let i = 0; i < 260; i++) ctx.fillRect(rand() * W, rand() * H, 1 + rand() * 2, 1 + rand() * 2);
  ctx.globalAlpha = 0.42; ctx.strokeStyle = dark; ctx.lineWidth = 8; ctx.stroke(path);
  ctx.restore();
}

function drawMerchant() {
  let seed = 1764;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const paint = document.createElement('canvas'), ink = document.createElement('canvas');
  paint.width = ink.width = W; paint.height = ink.height = H;
  const pc = paint.getContext('2d'), ic = ink.getContext('2d');
  ic.strokeStyle = '#fff'; ic.lineJoin = ic.lineCap = 'round';
  for (const part of figure()) {
    for (const ctx of [pc, ic]) {
      ctx.save();
      if (part.tilt) { const [a, x, y] = part.tilt; ctx.translate(x, y); ctx.rotate(a); ctx.translate(-x, -y); }
      if (ctx === pc) watercolor(pc, part.path, part.color, rand);
      else {
        // ink: knock out what lies beneath so later parts sit in front, then outline
        ic.globalCompositeOperation = 'destination-out'; ic.fill(part.path);
        ic.globalCompositeOperation = 'source-over';
        if (!part.noInk) { ic.lineWidth = 4.2; ic.stroke(part.path); }
        if (part.shade) {
          ic.save(); ic.clip(part.path); ic.lineWidth = 1.6; ic.globalAlpha = 0.55;
          for (let d = -H; d < W + H; d += 11) { ic.beginPath(); ic.moveTo(d, 0); ic.lineTo(d + H * 0.35, H); ic.stroke(); }
          ic.restore();
        }
      }
      ctx.restore();
    }
  }
  ic.lineWidth = 3.4;
  DETAILS.forEach(d => ic.stroke(new Path2D(d)));
  for (let y = 430; y < 780; y += 48) { ic.beginPath(); ic.arc(300, y, 6, 0, Math.PI * 2); ic.stroke(); }
  return { paint, ink };
}

const vertex = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const fragment = /* glsl */`
  uniform sampler2D uInk, uPaint;
  uniform float uReveal;
  uniform vec2 uOrigin;
  uniform vec3 uLine, uPaper;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vn(vec2 x) { vec2 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
  void main() {
    vec4 ink = texture2D(uInk, vUv), pt = texture2D(uPaint, vUv);
    float a = max(pt.a, ink.a);
    if (a < 0.03) discard;
    float n = vn(vUv * 9.0) * 0.6 + vn(vUv * 23.0) * 0.4;
    float d = distance(vUv * vec2(0.5, 1.0), uOrigin * vec2(0.5, 1.0));
    float front = uReveal * 1.9 - d * 1.6 + (n - 0.5) * 0.35;
    float p = smoothstep(0.0, 0.03, front);
    vec3 col = mix(uPaper, pt.rgb, p);
    col = mix(col, col * 0.6, (1.0 - smoothstep(0.0, 0.08, front)) * p * 0.8);
    col = mix(col, uLine, ink.a);
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;

export function createMerchant() {
  const { paint, ink } = drawMerchant();
  const paintTex = new THREE.CanvasTexture(paint); paintTex.colorSpace = THREE.SRGBColorSpace;
  const inkTex = new THREE.CanvasTexture(ink);
  const material = new THREE.ShaderMaterial({
    vertexShader: vertex, fragmentShader: fragment, transparent: true,
    uniforms: {
      uInk: { value: inkTex }, uPaint: { value: paintTex }, uReveal: { value: 0 },
      uOrigin: { value: new THREE.Vector2(0.5, 0.5) }, uLine: { value: new THREE.Color() }, uPaper: { value: new THREE.Color() },
    },
  });
  const h = 7.4, geo = new THREE.PlaneGeometry(h / 2, h);
  geo.translate(0, h / 2, 0);
  const mesh = new THREE.Mesh(geo, material);
  // silhouette for hit-testing so clicks on empty paper around him don't count
  const sil = paint.getContext('2d').getImageData(0, 0, W, H).data;
  mesh.userData.hitTest = uv => sil[((Math.floor((1 - uv.y) * (H - 1)) * W + Math.floor(uv.x * (W - 1))) * 4) + 3] > 40;
  return { mesh, material };
}

// Paper figures: people drawn as flat paths in a 600×1200 box (y down), standing in the drawn room.
// Ink until touched, then the watercolour bleeds in from where the touch landed.

import * as THREE from 'three';

export const FIG_W = 600, FIG_H = 1200;

// small path helpers for describing a figure
export const P = d => new Path2D(d);
export const ell = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
export const circ = (x, y, r) => ell(x, y, r, r);

function watercolor(ctx, path, color, rand) {
  const W = FIG_W, H = FIG_H;
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

// parts: [{ color, path, shade?, noInk?, tilt?: [angle, x, y] }] back to front
// details: ink-only strokes on top; extra(ctx): any further ink drawing
function drawFigure({ parts, details = [], extra, seed }) {
  const W = FIG_W, H = FIG_H;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const paint = document.createElement('canvas'), ink = document.createElement('canvas');
  paint.width = ink.width = W; paint.height = ink.height = H;
  const pc = paint.getContext('2d'), ic = ink.getContext('2d');
  ic.strokeStyle = '#fff'; ic.lineJoin = ic.lineCap = 'round';
  for (const part of parts) {
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
  details.forEach(d => ic.stroke(new Path2D(d)));
  extra?.(ic, pc);
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

// A standing paper figure, `height` world units tall, its feet at the origin.
export function paperFigure({ parts, details, extra, seed = 1, height = 7.4 }) {
  const W = FIG_W, H = FIG_H;
  const { paint, ink } = drawFigure({ parts, details, extra, seed });
  const paintTex = new THREE.CanvasTexture(paint); paintTex.colorSpace = THREE.SRGBColorSpace;
  const inkTex = new THREE.CanvasTexture(ink);
  const material = new THREE.ShaderMaterial({
    vertexShader: vertex, fragmentShader: fragment, transparent: true,
    uniforms: {
      uInk: { value: inkTex }, uPaint: { value: paintTex }, uReveal: { value: 0 },
      uOrigin: { value: new THREE.Vector2(0.5, 0.5) }, uLine: { value: new THREE.Color() }, uPaper: { value: new THREE.Color() },
    },
  });
  const geo = new THREE.PlaneGeometry(height / 2, height);
  geo.translate(0, height / 2, 0);
  const mesh = new THREE.Mesh(geo, material);
  // silhouette for hit-testing so clicks on empty paper around the figure don't count
  const sil = paint.getContext('2d').getImageData(0, 0, W, H).data;
  mesh.userData.hitTest = uv => sil[((Math.floor((1 - uv.y) * (H - 1)) * W + Math.floor(uv.x * (W - 1))) * 4) + 3] > 40;
  return { mesh, material };
}

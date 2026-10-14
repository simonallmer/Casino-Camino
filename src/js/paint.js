// Watercolor. The venue is drawn in ink; whatever a guest touches is painted into life.
// Paint bleeds outward from the point of contact, pools darker at its wet edge,
// granulates like pigment on cold-press paper, and stays once a thing has been used.

import * as THREE from 'three';

const NOISE = /* glsl */`
  float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float vnoise(vec3 x) {
    vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; } return v; }
`;

const vertex = /* glsl */`
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec3 vColor;
  varying vec2 vUv;
  void main() {
    vec4 p = vec4(position, 1.0);
    vec3 n = normal;
    #ifdef USE_INSTANCING
      p = instanceMatrix * p;
      n = mat3(instanceMatrix) * n;
    #endif
    vWorld = (modelMatrix * p).xyz;
    vNormal = normalize(mat3(modelMatrix) * n);
    #ifdef USE_COLOR
      vColor = color;
    #else
      vColor = vec3(1.0);
    #endif
    vUv = uv;
    // same transform order as the built-in materials, so depths match the solids exactly
    gl_Position = projectionMatrix * (modelViewMatrix * p);
  }
`;

const fragment = /* glsl */`
  uniform float uReveal;
  uniform vec3 uOrigin;
  uniform float uRadius;
  uniform float uNight;
  uniform sampler2D uMap;
  uniform float uHasMap;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec3 vColor;
  varying vec2 vUv;
  ${NOISE}
  void main() {
    float d = distance(vWorld, uOrigin) / uRadius;
    float bloom = fbm(vWorld * 0.42);
    float front = uReveal * 2.5 - d + (bloom - 0.5) * 0.7;
    if (front <= 0.0) discard;

    vec3 base = vColor;
    if (uHasMap > 0.5) base *= texture2D(uMap, vUv).rgb;

    // pigment density varies across the wash; fine granulation settles in the paper tooth
    float wash = fbm(vWorld * 1.6 + 11.0);
    float gran = vnoise(vWorld * 14.0);
    vec3 col = base * (0.8 + 0.34 * wash);
    col = mix(col, col * 0.8, smoothstep(0.55, 0.95, gran) * 0.6);

    // soft painted form: three tonal steps rather than smooth shading
    float l = dot(normalize(vNormal), normalize(vec3(-0.45, 0.85, 0.55)));
    col *= l > 0.45 ? 1.0 : (l > -0.1 ? 0.86 : 0.72);

    // the wet edge: pigment pools darker where the wash is still spreading
    float edge = 1.0 - smoothstep(0.0, 0.16, front);
    col = mix(col, col * 0.58, edge * 0.85);

    float alpha = smoothstep(0.0, 0.05, front) * mix(0.84, 0.95, wash);
    // by night the colour reads as gouache under lamplight
    col = mix(col, col * 1.12 + 0.03, uNight);
    alpha = mix(alpha, min(1.0, alpha + 0.08), uNight);
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

export function watercolorMaterial({ map = null, revealed = false, instanced = false } = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 2,
    side: THREE.DoubleSide,
    uniforms: {
      uReveal: { value: revealed ? 5 : 0 },
      uOrigin: { value: new THREE.Vector3() },
      uRadius: { value: 10 },
      uNight: { value: 0 },
      uMap: { value: map },
      uHasMap: { value: map ? 1 : 0 },
    },
    defines: instanced ? { USE_INSTANCING: '' } : {},
  });
}

// Solid colour geometry: tint every vertex so many pieces can share one merged wash.
export function tint(geometry, hex) {
  const c = new THREE.Color(hex);
  const n = geometry.attributes.position.count, arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  geometry.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geometry;
}

// ── what the guest has touched, remembered between visits
const KEY = 'camino_painted_v1';
let kept = new Set();
try { kept = new Set(JSON.parse(localStorage.getItem(KEY)) || []); } catch { /* nothing kept yet */ }
export const memory = {
  has: name => kept.has(name),
  keep(name) { kept.add(name); try { localStorage.setItem(KEY, JSON.stringify([...kept])); } catch { /* ignore */ } },
  get count() { return kept.size; },
};

// A paintable thing in the venue: one or more materials sharing a reveal.
export class Paintable {
  constructor({ name, label, materials, hit, center, radius }) {
    Object.assign(this, { name, label, materials, hit, center, radius });
    this.reveal = memory.has(name) ? 1 : 0;
    this.target = this.reveal;
    this.hover = false;
    for (const m of materials) {
      if (m.uniforms.uRadius) m.uniforms.uRadius.value = radius;
      if (m.uniforms.uOrigin.value.isVector3) m.uniforms.uOrigin.value.copy(center);
      m.uniforms.uReveal.value = this.reveal;
    }
  }
  touch(point, uv) {
    // a fresh wash starts where the brush lands (in the world, or on a flat figure's paper)
    if (this.reveal < 0.05) for (const m of this.materials) {
      const o = m.uniforms.uOrigin.value;
      if (o.isVector3) o.copy(point); else if (uv) o.copy(uv);
    }
    this.hover = true;
  }
  leave() { this.hover = false; }
  keep() { memory.keep(this.name); }
  step(dt) {
    this.target = this.hover || memory.has(this.name) ? 1 : 0;
    const speed = this.target > this.reveal ? 0.95 : 0.55;
    this.reveal += Math.sign(this.target - this.reveal) * Math.min(Math.abs(this.target - this.reveal), dt * speed);
    for (const m of this.materials) m.uniforms.uReveal.value = this.reveal;
  }
}

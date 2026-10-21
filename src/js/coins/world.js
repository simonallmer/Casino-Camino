// The world the coins travel: land outlines for the globes, where coins turn up, and the mint's schedule.
// All coin figures are sample data. Locations are by country only, never anything finer.

import * as THREE from 'three';

// ── the schedule
export const TOTAL = 100000;
export const TEST_YEAR = 2027, FIRST_YEAR = 2028, LAST_YEAR = 2060;
export const TEST_COINS = 100;           // size of the 2027 test run in the simulation (a placeholder)
const MINT_DAYS = (Date.UTC(LAST_YEAR + 1, 0, 1) - Date.UTC(FIRST_YEAR, 0, 1)) / 864e5;
export const PER_DAY = TOTAL / MINT_DAYS; // ≈ 8.3

// the day a coin is struck: an even, public schedule from 1 January 2028 to the last day of 2060
export function mintDate(serial) {
  return new Date(Date.UTC(FIRST_YEAR, 0, 1) + Math.floor((serial - 1) / PER_DAY) * 864e5);
}
// coins struck by the end of a given year
export function mintedBy(year) {
  if (year < FIRST_YEAR) return 0;
  if (year >= LAST_YEAR) return TOTAL;
  return Math.min(TOTAL, Math.floor((Date.UTC(year + 1, 0, 1) - Date.UTC(FIRST_YEAR, 0, 1)) / 864e5 * PER_DAY));
}
export const serial = n => `#${String(n).padStart(6, '0')}`;

// ── countries: [code, name, lat, lon, early weight, late weight]
// Early on, coins stay close to where the camino starts; over the years they spread out.
export const COUNTRIES = [
  ['AT', 'Austria', 47.6, 14.1, 412, 900], ['DE', 'Germany', 51.1, 10.4, 131, 700], ['FR', 'France', 46.6, 2.4, 74, 420],
  ['US', 'USA', 39.8, -98.6, 61, 900], ['IT', 'Italy', 42.8, 12.6, 58, 380], ['GB', 'UK', 54.0, -2.5, 34, 360],
  ['AU', 'Australia', -25.3, 133.8, 29, 220], ['JP', 'Japan', 36.2, 138.3, 24, 330], ['CH', 'Switzerland', 46.8, 8.2, 24, 200],
  ['ES', 'Spain', 40.2, -3.6, 21, 260], ['CN', 'China', 35.0, 103.0, 6, 600], ['IN', 'India', 22.0, 79.0, 3, 420],
  ['BR', 'Brazil', -10.8, -52.9, 4, 300], ['CA', 'Canada', 56.0, -106.0, 8, 220], ['MX', 'Mexico', 23.6, -102.5, 4, 200],
  ['AR', 'Argentina', -35.4, -65.2, 2, 110], ['NL', 'Netherlands', 52.2, 5.3, 9, 160], ['SE', 'Sweden', 62.0, 15.0, 5, 110],
  ['NO', 'Norway', 61.5, 9.0, 3, 80], ['PL', 'Poland', 52.1, 19.4, 6, 160], ['CZ', 'Czechia', 49.8, 15.5, 10, 110],
  ['HU', 'Hungary', 47.2, 19.5, 6, 90], ['GR', 'Greece', 39.1, 22.0, 4, 100], ['TR', 'Türkiye', 39.0, 35.2, 3, 160],
  ['AE', 'UAE', 24.0, 54.0, 3, 120], ['TH', 'Thailand', 15.1, 101.0, 4, 140], ['SG', 'Singapore', 1.35, 103.8, 3, 90],
  ['ID', 'Indonesia', -2.5, 118.0, 2, 150], ['KR', 'South Korea', 36.4, 127.9, 5, 200], ['ZA', 'South Africa', -29.0, 24.7, 2, 110],
  ['EG', 'Egypt', 26.8, 30.8, 1, 90], ['MA', 'Morocco', 31.8, -7.1, 1, 70], ['NG', 'Nigeria', 9.1, 8.7, 1, 100],
  ['KE', 'Kenya', 0.2, 37.9, 1, 70], ['NZ', 'New Zealand', -41.5, 172.8, 3, 80], ['IE', 'Ireland', 53.2, -8.2, 4, 70],
  ['PT', 'Portugal', 39.6, -8.0, 4, 90], ['VN', 'Vietnam', 16.0, 107.8, 1, 100], ['PH', 'Philippines', 12.9, 121.8, 1, 100],
  ['CL', 'Chile', -35.7, -71.5, 1, 70], ['CO', 'Colombia', 4.6, -74.1, 1, 80], ['PE', 'Peru', -9.2, -75.0, 1, 60],
  ['IL', 'Israel', 31.4, 35.0, 2, 70],
].map(([code, name, lat, lon, early, late]) => ({ code, name, lat, lon, early, late }));

const sumEarly = COUNTRIES.reduce((a, c) => a + c.early, 0), sumLate = COUNTRIES.reduce((a, c) => a + c.late, 0);
const spread = year => 1 - Math.exp(-Math.max(0, year - TEST_YEAR) / 10);
const share = (c, year) => { const g = spread(year); return (c.early / sumEarly) * (1 - g) + (c.late / sumLate) * g; };

// A sample picture of the coins at the end of a year.
export function simulate(year) {
  const test = year === TEST_YEAR;
  const minted = test ? TEST_COINS : mintedBy(year);
  const age = Math.max(0, year - FIRST_YEAR);
  const neverSeen = Math.round(minted * (test ? 0.04 : 0.09));
  const unknown = Math.round(minted * (test ? 0 : 0.03 + 0.11 * (1 - Math.exp(-age / 8))));
  const active = minted - neverSeen - unknown;
  const countries = COUNTRIES.map(c => ({ ...c, count: Math.round(active * share(c, year)) }))
    .filter(c => c.count > 0).sort((a, b) => b.count - a.count);
  return { year, test, minted, toCome: TOTAL - (test ? 0 : minted), active, unknown, neverSeen, countries };
}

// A sample travel log for a coin: where it has been tapped, in order. The same serial always tells the same story.
export function travelLog(n, year) {
  let seed = (n * 7919 + 17) % 2147483647 || 1;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const minted = mintDate(n).getUTCFullYear();
  const years = Math.max(0, year - minted);
  const pick = weight => {
    const total = COUNTRIES.reduce((a, c) => a + weight(c), 0);
    let r = rand() * total, last = null;
    for (const c of COUNTRIES) { const w = weight(c); if (w <= 0) continue; last = c; if ((r -= w) <= 0) return c; }
    return last;
  };
  const stops = [pick(c => share(c, minted))];
  const hops = Math.min(9, Math.round(rand() * 2 + years * (0.5 + rand())));
  for (let i = 0; i < hops; i++) {
    const last = stops[stops.length - 1];
    // most hops are short ones to a neighbour, a few cross the world
    const next = pick(c => (c === last ? 0 : share(c, minted + i) / (1 + (rand() < 0.75 ? dist(last, c) / 1500 : 0))));
    stops.push(next);
  }
  const checkIns = stops.length + Math.round(rand() * stops.length * 3);
  return { stops, checkIns, countries: new Set(stops).size, minted };
}

// great-circle distance in km
export function dist(a, b) {
  const r = Math.PI / 180, s = Math.sin((b.lat - a.lat) * r / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin((b.lon - a.lon) * r / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(s));
}

// a point on a unit sphere that matches THREE.SphereGeometry's texture layout
export function lonLatToVec(lon, lat, r = 1, out = new THREE.Vector3()) {
  const a = lat * Math.PI / 180, b = lon * Math.PI / 180;
  return out.set(Math.cos(a) * Math.cos(b) * r, Math.sin(a) * r, -Math.cos(a) * Math.sin(b) * r);
}

// ── land: Natural Earth 1:110m via world-atlas (fetched once, like the drawing tools themselves)
const LAND_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json';
let landPromise = null;
export function loadLand() {
  landPromise ??= fetch(LAND_URL).then(r => r.json()).then(decodeLand).catch(() => []);
  return landPromise;
}

// TopoJSON → polygons, each a list of rings of [lon, lat]
function decodeLand(topo) {
  const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
  const arcs = topo.arcs.map(arc => { let x = 0, y = 0; return arc.map(([dx, dy]) => [(x += dx) * sx + tx, (y += dy) * sy + ty]); });
  const ring = ids => {
    const out = [];
    ids.forEach((i, k) => { const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i]; out.push(...(k ? a.slice(1) : a)); });
    return out;
  };
  const polys = [];
  const walk = g => {
    if (g.type === 'GeometryCollection') g.geometries.forEach(walk);
    else if (g.type === 'Polygon') polys.push(g.arcs.map(ring));
    else if (g.type === 'MultiPolygon') g.arcs.forEach(p => polys.push(p.map(ring)));
  };
  walk(topo.objects.land);
  return polys;
}

// An equirectangular map of the world drawn into a canvas, for wrapping round a sphere.
export async function worldCanvas({ width = 2048, sea, land, coast, grid, coastWidth = 1.6, gridWidth = 1, gridAlpha = 0.5 }) {
  const polys = await loadLand();
  const W = width, H = width / 2, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const X = lon => (lon + 180) / 360 * W, Y = lat => (90 - lat) / 180 * H;
  ctx.fillStyle = sea; ctx.fillRect(0, 0, W, H);
  if (grid) {
    ctx.strokeStyle = grid; ctx.globalAlpha = gridAlpha; ctx.lineWidth = gridWidth;
    for (let lon = -180; lon <= 180; lon += 15) { ctx.beginPath(); ctx.moveTo(X(lon), 0); ctx.lineTo(X(lon), H); ctx.stroke(); }
    for (let lat = -60; lat <= 60; lat += 15) { ctx.beginPath(); ctx.moveTo(0, Y(lat)); ctx.lineTo(W, Y(lat)); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  // rings that cross the date line are unwrapped into one continuous shape, then drawn again a world
  // to either side, so the part beyond the edge comes back in on the other
  const path = new Path2D();
  for (const poly of polys) for (const r of poly) {
    let shift = 0, prev = r[0][0];
    const pts = r.map(([lon, lat]) => { if (lon - prev > 180) shift -= 360; else if (prev - lon > 180) shift += 360; prev = lon; return [lon + shift, lat]; });
    for (const off of [-360, 0, 360]) pts.forEach(([lon, lat], i) => (i ? path.lineTo(X(lon + off), Y(lat)) : path.moveTo(X(lon + off), Y(lat))));
  }
  ctx.fillStyle = land; ctx.fill(path, 'evenodd');
  if (coast) { ctx.strokeStyle = coast; ctx.lineWidth = coastWidth; ctx.lineJoin = 'round'; ctx.stroke(path); }
  return c;
}

// Ricochet's trinkets as enamel medallions: a gold rim, coloured enamel, an engraved gold mark.
// The same drawing serves the wheel tiles and the tokens in your pocket.

const ENAMEL = { heart: '#6e1b24', hourglass: '#1d3150', glass: '#1f4744', ice: '#2b4a62' };

function goldStroke(ctx, r) {
  const g = ctx.createLinearGradient(-r, -r, r, r);
  g.addColorStop(0, '#f6dc96'); g.addColorStop(0.5, '#d4b46f'); g.addColorStop(1, '#a87d34');
  return g;
}

function mark(ctx, type, r) {
  ctx.save();
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.strokeStyle = ctx.fillStyle = goldStroke(ctx, r);
  ctx.lineWidth = r * 0.075;
  if (type === 'heart') {
    const heart = k => {
      ctx.beginPath(); ctx.moveTo(0, r * 0.5 * k);
      ctx.bezierCurveTo(-r * 0.78 * k, -r * 0.02 * k, -r * 0.42 * k, -r * 0.62 * k, 0, -r * 0.22 * k);
      ctx.bezierCurveTo(r * 0.42 * k, -r * 0.62 * k, r * 0.78 * k, -r * 0.02 * k, 0, r * 0.5 * k);
      ctx.closePath();
    };
    heart(1); ctx.stroke();
    ctx.lineWidth = r * 0.035; heart(0.68); ctx.stroke();
  } else if (type === 'hourglass') {
    const w = r * 0.36, h = r * 0.5;
    ctx.beginPath(); ctx.moveTo(-w * 1.25, -h); ctx.lineTo(w * 1.25, -h); ctx.moveTo(-w * 1.25, h); ctx.lineTo(w * 1.25, h); ctx.stroke();
    ctx.lineWidth = r * 0.05;
    ctx.beginPath();
    ctx.moveTo(-w, -h * 0.9); ctx.bezierCurveTo(-w, -h * 0.25, -w * 0.12, -h * 0.15, -w * 0.12, 0);
    ctx.bezierCurveTo(-w * 0.12, h * 0.15, -w, h * 0.25, -w, h * 0.9);
    ctx.moveTo(w, -h * 0.9); ctx.bezierCurveTo(w, -h * 0.25, w * 0.12, -h * 0.15, w * 0.12, 0);
    ctx.bezierCurveTo(w * 0.12, h * 0.15, w, h * 0.25, w, h * 0.9);
    ctx.stroke();
    // the sand: a fine stream and a small dune below
    ctx.beginPath(); ctx.moveTo(-w * 0.55, -h * 0.55); ctx.lineTo(w * 0.55, -h * 0.55); ctx.lineTo(0, -h * 0.08); ctx.closePath(); ctx.fill();
    ctx.lineWidth = r * 0.02; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, h * 0.62); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-w * 0.75, h * 0.86); ctx.quadraticCurveTo(0, h * 0.35, w * 0.75, h * 0.86); ctx.closePath(); ctx.fill();
  } else if (type === 'glass') {
    const cx = -r * 0.1, cy = -r * 0.1, lr = r * 0.34;
    ctx.beginPath(); ctx.arc(cx, cy, lr, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = r * 0.03; ctx.beginPath(); ctx.arc(cx, cy, lr * 0.78, Math.PI * 1.05, Math.PI * 1.55); ctx.stroke();
    ctx.lineWidth = r * 0.13;
    ctx.beginPath(); ctx.moveTo(cx + lr * 0.74, cy + lr * 0.74); ctx.lineTo(r * 0.52, r * 0.52); ctx.stroke();
    ctx.lineWidth = r * 0.04;
    ctx.beginPath(); ctx.arc(r * 0.56, r * 0.56, r * 0.07, 0, Math.PI * 2); ctx.stroke();
  } else if (type === 'ice') {
    ctx.lineWidth = r * 0.055;
    for (let k = 0; k < 6; k++) {
      ctx.save(); ctx.rotate((k * Math.PI) / 3);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.56); ctx.stroke();
      for (const [y, l] of [[0.24, 0.15], [0.4, 0.11]]) {
        ctx.beginPath(); ctx.moveTo(-r * l, -r * (y + l * 0.8)); ctx.lineTo(0, -r * y); ctx.lineTo(r * l, -r * (y + l * 0.8)); ctx.stroke();
      }
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(0, 0, r * 0.07, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function drawSkull(ctx, r, color = '#efe3c4', ground = '#1d1a16') {
  ctx.save();
  ctx.fillStyle = ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(-r * 0.24, r * 0.38);
  ctx.bezierCurveTo(-r * 0.24, r * 0.2, -r * 0.5, r * 0.12, -r * 0.5, -r * 0.12);
  ctx.bezierCurveTo(-r * 0.5, -r * 0.5, -r * 0.24, -r * 0.62, 0, -r * 0.62);
  ctx.bezierCurveTo(r * 0.24, -r * 0.62, r * 0.5, -r * 0.5, r * 0.5, -r * 0.12);
  ctx.bezierCurveTo(r * 0.5, r * 0.12, r * 0.24, r * 0.2, r * 0.24, r * 0.38);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = ctx.strokeStyle = ground;
  for (const x of [-0.2, 0.2]) { ctx.beginPath(); ctx.ellipse(x * r, -r * 0.1, r * 0.13, r * 0.15, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(0, r * 0.06); ctx.lineTo(-r * 0.06, r * 0.18); ctx.lineTo(r * 0.06, r * 0.18); ctx.closePath(); ctx.fill();
  ctx.lineWidth = r * 0.04;
  for (const x of [-0.12, 0, 0.12]) { ctx.beginPath(); ctx.moveTo(x * r, r * 0.27); ctx.lineTo(x * r, r * 0.4); ctx.stroke(); }
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = color; ctx.globalAlpha = 0.55; ctx.lineWidth = r * 0.03;
  ctx.beginPath(); ctx.arc(0, -r * 0.08, r * 0.82, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

// A medallion of radius r centred at the current origin.
export function drawMedal(ctx, type, r) {
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = goldStroke(ctx, r); ctx.fill();
  const enamel = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.05, 0, 0, r * 0.86);
  enamel.addColorStop(0, '#ffffff22'); enamel.addColorStop(0.25, ENAMEL[type]); enamel.addColorStop(1, '#00000066');
  ctx.beginPath(); ctx.arc(0, 0, r * 0.86, 0, Math.PI * 2); ctx.fillStyle = ENAMEL[type]; ctx.fill();
  ctx.fillStyle = enamel; ctx.fill();
  ctx.strokeStyle = '#f6dc96'; ctx.globalAlpha = 0.5; ctx.lineWidth = r * 0.02;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 1;
  // a ring of fine beads round the rim, as on a struck medal
  ctx.fillStyle = '#8c6a2c';
  for (let k = 0; k < 36; k++) { const a = (k / 36) * Math.PI * 2; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.93, Math.sin(a) * r * 0.93, r * 0.022, 0, Math.PI * 2); ctx.fill(); }
  mark(ctx, type, r * 0.86);
  ctx.restore();
}

const urls = new Map();
export function medalURL(type, size = 120) {
  if (!urls.has(type)) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'); g.translate(size / 2, size / 2);
    if (type === 'skull') { g.beginPath(); g.arc(0, 0, size / 2, 0, Math.PI * 2); g.fillStyle = '#1d1a16'; g.fill(); drawSkull(g, size * 0.42); }
    else drawMedal(g, type, size / 2 - 1);
    urls.set(type, c.toDataURL());
  }
  return urls.get(type);
}

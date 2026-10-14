// The Ricochet table: a painted wheel, six covered tiles, one ball, and nerve.

import { Ricochet, TILES, BUY_IN, planDrop, wantsToLeave, soloChoice, spinAngle } from './engine.js';
import { GUESTS } from '../fortuna/engine.js';
import { createShell, confirmLeave, sleep, YOU } from '../shell.js';
import { chipFaceURL, PALETTES } from '../chip.js';
import { drawMedal, drawSkull, medalURL } from './medals.js';

export const RICOCHET_STAKE = BUY_IN;
const ROMAN = n => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][n - 1] ?? String(n);
// ivory tiles carry the medallions; the jackpot is gold leaf; a skull tile is black enamel
const FACE = {
  coin: '#efe3c4', jackpot: '#d9b465', skull: '#1d1a16', heart: '#efe3c4',
  hourglass: '#efe3c4', glass: '#efe3c4', ice: '#e4eef0',
};
const ITEMS = ['heart', 'hourglass', 'glass', 'ice'];

const RULES = `
  <p class="kicker">Ricochet · the rules of the house</p>
  <h2>Six tiles, one ball. The last guest standing takes the pot.</h2>
  <ol>
    <li>Everyone buys in for <b>${BUY_IN}</b>. On your turn the wheel spins. Its tiles show their faces for one second, then the covers come down.</li>
    <li>Drop the ball when you like. A <b>gap</b> or a <b>skull</b> puts you out. A <b>coin</b> makes the bank add to the pot (1, 2, 4, 8… doubling each round); a <b>jackpot</b> adds double.</li>
    <li>Some tiles carry trinkets. Land on one and it goes in your pocket; the symbols are below.</li>
    <li>Round one is gentle: coins only. Each round after, the wheel turns faster and the tiles grow narrower.</li>
    <li>Before your spin you may leave with a quarter of the pot.</li>
    <li>Alone at the table? Take the whole pot, or challenge the house for three more spins and take it after.</li>
    <li>Drop the ball with the button, a tap on the wheel, or the space bar.</li>
  </ol>
  <p class="kicker">The tiles</p>
  <ul class="rc-legend">
    <li><img data-chip="coin" alt=""><span><b>Coin</b>Safe. The bank adds to the pot: 1, 2, 4, 8… doubling each round.</span></li>
    <li><img data-chip="jackpot" alt=""><span><b>Jackpot</b>Safe. The bank adds double.</span></li>
    <li><img data-medal="skull" alt=""><span><b>Skull</b>You are out. So is a gap between tiles.</span></li>
    <li><img data-medal="heart" alt=""><span><b>Heart · extra life</b>Kept until you fall: the next skull or gap is forgiven, and the heart is spent.</span></li>
    <li><img data-medal="hourglass" alt=""><span><b>Hourglass · slow down</b>Your next spin turns at the slowest speed. Spent on that spin.</span></li>
    <li><img data-medal="glass" alt=""><span><b>Glass · true sight</b>You see through the covers on every spin after, for the rest of the game.</span></li>
    <li><img data-medal="ice" alt=""><span><b>Ice · wider tiles</b>Your tiles stay a round wider for good, edged in frost. Each ice adds another round.</span></li>
  </ul>
  <p class="muted">While a trinket works on a spin, its medal shows in the middle of the wheel.</p>`;

export function openRicochet(root, { purse, onLeave }) {
  let alive = true, settled = false;
  purse.set(purse.balance - BUY_IN);
  const game = new Ricochet([YOU, ...GUESTS].map(p => ({ ...p, cash: BUY_IN })));
  const me = () => game.players.find(p => p.id === 'you');
  const shell = createShell(root, { name: 'Ricochet', rules: RULES });
  shell.$('.sheet-rules').querySelectorAll('[data-medal]').forEach(img => { img.src = medalURL(img.dataset.medal); });

  shell.center.innerHTML = `
    <div class="rc-wheel">
      <canvas></canvas>
      <div class="rc-hub"><small>Pot</small><span>0</span><small class="rc-round"></small><small class="rc-fx"></small></div>
      <div class="rc-found" aria-hidden="true"></div>
    </div>`;
  const canvas = shell.center.querySelector('canvas'), ctx = canvas.getContext('2d');
  const hubPot = shell.center.querySelector('.rc-hub span'), hubRound = shell.center.querySelector('.rc-round');
  const hubFx = shell.center.querySelector('.rc-fx'), found = shell.center.querySelector('.rc-found');

  // a trinket rises off the wheel when someone finds (or spends) it
  function present(type, title, note) {
    found.innerHTML = `<img src="${medalURL(type)}" alt=""><b>${title}</b><small>${note}</small>`;
    found.classList.remove('on'); void found.offsetWidth; found.classList.add('on');
  }

  // ── wheel state and drawing
  // at rest the wheel shows six covered tiles
  const resting = Array.from({ length: 6 }, (_, i) => ({ type: 'coin', start: i * Math.PI / 3, end: i * Math.PI / 3 + (Math.PI / 3) * 0.7 }));
  const wheel = { zones: resting, rotation: -Math.PI / 2 - Math.PI / 3 * 0.35, rot0: 0, speed: 0, spinning: false, t0: 0, covered: true, trueSight: false, wider: 0, landed: undefined };
  // where the wheel stands right now: the spin follows a fixed curve from its start
  const turned = now => wheel.rot0 + spinAngle(wheel.speed, (now - wheel.t0) / 1000);
  const chip = new Image();
  chipFaceURL(PALETTES.camino, 'logo').then(u => {
    chip.src = u;
    shell.$('.sheet-rules').querySelectorAll('[data-chip]').forEach(img => { img.src = u; });
  });
  const grain = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 96;
    const g = c.getContext('2d');
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(40,30,20,${Math.random() * 0.25})`; g.fillRect(Math.random() * 96, Math.random() * 96, 1.4, 1.4); }
    return c;
  })();
  let grainPattern = null;

  function size() {
    const r = shell.center.getBoundingClientRect(), s = Math.max(200, Math.min(r.width, r.height));
    const dpr = Math.min(devicePixelRatio, 2);
    canvas.style.width = canvas.style.height = `${s}px`;
    if (canvas.width !== Math.round(s * dpr)) { canvas.width = canvas.height = Math.round(s * dpr); grainPattern = ctx.createPattern(grain, 'repeat'); }
  }
  const ro = new ResizeObserver(size); ro.observe(shell.center);

  function icon(type, s) {
    ctx.save();
    if (type === 'coin' || type === 'jackpot') {
      const chipAt = (x, y, r) => { if (chip.complete && chip.naturalWidth) ctx.drawImage(chip, x - r, y - r, r * 2, r * 2); else { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#7d1f24'; ctx.fill(); } };
      if (type === 'jackpot') { chipAt(-s * 0.18, s * 0.06, s * 0.36); chipAt(s * 0.18, -s * 0.06, s * 0.36); } else chipAt(0, 0, s * 0.42);
    } else if (type === 'skull') drawSkull(ctx, s * 0.5);
    else drawMedal(ctx, type, s * 0.46);
    ctx.restore();
  }

  function draw() {
    const S = canvas.width, c = S / 2, rIn = S * 0.205, rOut = S * 0.445;
    ctx.clearRect(0, 0, S, S);
    // felt and rails
    ctx.beginPath(); ctx.arc(c, c, S * 0.49, 0, Math.PI * 2); ctx.fillStyle = '#1d3a30'; ctx.fill();
    ctx.strokeStyle = '#d4b46f'; ctx.lineWidth = S * 0.004;
    for (const r of [0.48, 0.472, rIn / S - 0.012]) { ctx.beginPath(); ctx.arc(c, c, S * r, 0, Math.PI * 2); ctx.stroke(); }
    ctx.globalAlpha = 0.35;
    for (let k = 0; k < 60; k++) {
      const a = (k / 60) * Math.PI * 2 + wheel.rotation;
      ctx.beginPath(); ctx.moveTo(c + Math.cos(a) * (rOut + S * 0.01), c + Math.sin(a) * (rOut + S * 0.01)); ctx.lineTo(c + Math.cos(a) * (rOut + S * 0.022), c + Math.sin(a) * (rOut + S * 0.022)); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const hidden = wheel.covered && !wheel.trueSight;
    for (const z of wheel.zones) {
      const a0 = z.start + wheel.rotation, a1 = z.end + wheel.rotation, mid = (a0 + a1) / 2;
      ctx.beginPath(); ctx.arc(c, c, rOut, a0, a1); ctx.arc(c, c, rIn, a1, a0, true); ctx.closePath();
      ctx.fillStyle = hidden ? '#d8c7a3' : FACE[z.type]; ctx.fill();
      if (grainPattern) { ctx.save(); ctx.clip(); ctx.fillStyle = grainPattern; ctx.globalAlpha = 0.5; ctx.fillRect(0, 0, S, S); ctx.restore(); }
      if (hidden) {
        // the covers: ink hatching, like the rest of the venue before it is touched
        ctx.save(); ctx.beginPath(); ctx.arc(c, c, rOut, a0, a1); ctx.arc(c, c, rIn, a1, a0, true); ctx.closePath(); ctx.clip();
        ctx.strokeStyle = 'rgba(60,45,30,0.55)'; ctx.lineWidth = S * 0.002;
        for (let d = -S; d < S; d += S * 0.012) { ctx.beginPath(); ctx.moveTo(d, 0); ctx.lineTo(d + S, S); ctx.stroke(); }
        ctx.restore();
      }
      if (wheel.wider) {
        // the ice at work: the tile is edged in frost
        ctx.save(); ctx.beginPath(); ctx.arc(c, c, rOut, a0, a1); ctx.arc(c, c, rIn, a1, a0, true); ctx.closePath(); ctx.clip();
        ctx.strokeStyle = 'rgba(205, 233, 243, 0.95)'; ctx.lineWidth = S * (0.012 + 0.006 * Math.min(wheel.wider, 3)); ctx.stroke();
        ctx.strokeStyle = 'rgba(120, 170, 195, 0.55)'; ctx.lineWidth = S * 0.003; ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath(); ctx.arc(c, c, rOut, a0, a1); ctx.arc(c, c, rIn, a1, a0, true); ctx.closePath();
      ctx.strokeStyle = wheel.landed === z ? '#f3d58a' : '#2b251d'; ctx.lineWidth = wheel.landed === z ? S * 0.012 : S * 0.004; ctx.stroke();
      if (!hidden) {
        if (wheel.covered && wheel.trueSight) {
          // the glass at work: the covers are down, but you see straight through them
          ctx.save(); ctx.beginPath(); ctx.arc(c, c, rOut, a0, a1); ctx.arc(c, c, rIn, a1, a0, true); ctx.closePath(); ctx.clip();
          ctx.strokeStyle = 'rgba(60,45,30,0.22)'; ctx.lineWidth = S * 0.002;
          for (let d = -S; d < S; d += S * 0.012) { ctx.beginPath(); ctx.moveTo(d, 0); ctx.lineTo(d + S, S); ctx.stroke(); }
          ctx.restore();
        }
        const rm = (rIn + rOut) / 2, span = (a1 - a0) * rm;
        ctx.save(); ctx.translate(c + Math.cos(mid) * rm, c + Math.sin(mid) * rm); ctx.rotate(mid + Math.PI / 2);
        icon(z.type, Math.min(span * 0.72, (rOut - rIn) * 0.62));
        ctx.restore();
      }
    }
    if (wheel.landed === null) {
      ctx.beginPath(); ctx.arc(c, c - (rIn + rOut) / 2, S * 0.05, 0, Math.PI * 2); ctx.strokeStyle = '#e0877c'; ctx.lineWidth = S * 0.008; ctx.stroke();
    }
    // the pointer, and the ball: waiting under it, or dropped onto the tile (or into the gap) below
    const by = c - rOut - S * 0.035;
    ctx.beginPath(); ctx.moveTo(c - S * 0.022, by - S * 0.03); ctx.lineTo(c + S * 0.022, by - S * 0.03); ctx.lineTo(c, by + S * 0.012); ctx.closePath();
    ctx.fillStyle = '#d4b46f'; ctx.fill(); ctx.strokeStyle = '#2b251d'; ctx.lineWidth = S * 0.003; ctx.stroke();
    const ballY = wheel.landed === undefined ? by + S * 0.022 : c - rOut + S * 0.03, br = S * 0.018;
    ctx.beginPath(); ctx.arc(c, ballY, br, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(c - br * 0.3, ballY - br * 0.35, br * 0.1, c, ballY, br);
    g.addColorStop(0, '#fffdf6'); g.addColorStop(1, '#bfb398'); ctx.fillStyle = g; ctx.fill(); ctx.stroke();
  }

  function frame(now) {
    if (!alive) return;
    requestAnimationFrame(frame);
    if (wheel.spinning) {
      wheel.rotation = turned(now);
      wheel.covered = now - wheel.t0 > 1000;
    }
    draw();
  }
  requestAnimationFrame(frame);

  // ── seats, pot, pocket
  function render() {
    const cur = game.current;
    shell.meta(game.phase === 'solo' ? `Against the house · ${game.soloLeft} spin${game.soloLeft === 1 ? '' : 's'} to go` : `Round ${ROMAN(game.round)} · ${game.alive.length} still standing`);
    hubPot.textContent = game.pot;
    hubRound.textContent = `Round ${ROMAN(game.round)}`;
    shell.seats(game.players.map(p => ({ ...p, active: p.alive || !!p.cashOut, cash: p.alive ? BUY_IN : (p.cashOut ?? 0) })), {
      current: cur?.alive ? cur.id : null,
      status: p => `${p.cashOut && !p.alive ? `Left with ${p.cashOut}` : p.id === cur?.id ? (p.id === 'you' ? 'Your spin' : 'Spinning') : ''}${p.alive ? p.inventory.map(i => `<img class="rc-carry" src="${medalURL(i)}" alt="${TILES[i].label}" title="${TILES[i].label}: ${TILES[i].note}">`).join('') : ''}`,
    });
    const pocket = me().inventory;
    const kinds = ITEMS.filter(i => pocket.includes(i));
    shell.extra.innerHTML = !me().alive ? '' : kinds.length
      ? `<div class="rc-pocket">${kinds.map(i => {
        const n = pocket.filter(x => x === i).length;
        return `<span class="rc-token" title="${TILES[i].note}"><img src="${medalURL(i)}" alt=""><span><b>${TILES[i].label}${n > 1 ? ` ×${n}` : ''}</b><small>${TILES[i].note}</small></span></span>`;
      }).join('')}</div>`
      : '<p class="ft-read">Your pocket is empty</p>';
  }

  // ── input
  let waitChoice = null, waitDrop = null;
  shell.on('spin', () => waitChoice?.('spin'));
  shell.on('escape', () => waitChoice?.('leave'));
  shell.on('claim', () => waitChoice?.('claim'));
  shell.on('challenge', () => waitChoice?.('challenge'));
  shell.on('drop', () => waitDrop?.());
  canvas.addEventListener('click', () => waitDrop?.());
  // the space bar drops the ball (or spins, when a spin is on offer), whatever has focus
  const atWheel = e => (e.code === 'Space' || e.key === ' ') && root.querySelector('.sheet-rules').hidden && root.querySelector('.sheet-result').hidden;
  const onKey = e => {
    if (!atWheel(e)) return;
    e.preventDefault(); e.stopPropagation();
    if (e.repeat) return;
    if (waitDrop) waitDrop();
    else root.querySelector('[data-act="spin"]')?.click();
  };
  const noClick = e => { if (atWheel(e)) e.preventDefault(); };   // a focused button must not fire as well
  addEventListener('keydown', onKey, true);
  addEventListener('keyup', noClick, true);
  shell.on('again', () => { settle(); close(); openRicochet(root, { purse, onLeave }); });
  shell.on('leave', el => {
    if (game.phase !== 'over' && me().alive && !confirmLeave(el, 'Leave now? Your buy-in stays in the pot')) return;
    settle(); close(); onLeave();
  });
  function close() { alive = false; ro.disconnect(); removeEventListener('keydown', onKey, true); removeEventListener('keyup', noClick, true); }

  function settle() {
    if (settled) return;
    settled = true;
    const out = me().cashOut ?? 0;
    purse.set(purse.balance + out);
    const net = out - BUY_IN;
    purse.record(`Ricochet · ${net >= 0 ? 'won' : 'lost'} at the table`, net);
  }

  function finish(head) {
    settle();
    const out = me().cashOut ?? 0;
    shell.actions('');
    shell.result({
      kicker: 'Ricochet · the count', head, net: out - BUY_IN,
      ranking: game.players.map(p => ({ ...p, cash: p.cashOut ?? 0, value: p.cashOut ? `took ${p.cashOut}` : p.alive ? 'still at the wheel' : 'out' }))
        .sort((a, b) => b.cash - a.cash || Number(b.alive) - Number(a.alive)),
      again: purse.balance >= BUY_IN,
    });
  }

  async function spinFor(p) {
    const spin = game.spin();
    render();   // a spent hourglass leaves the pocket as the wheel starts
    const rot0 = wheel.rotation;
    Object.assign(wheel, { zones: spin.zones, rot0, speed: spin.speed, spinning: true, t0: performance.now(), covered: false, trueSight: spin.trueSight, wider: spin.wider, landed: undefined });
    // what is working on this spin, shown in the hub for as long as it turns
    const fx = [spin.slowed && ['hourglass', 'Slowed'], spin.trueSight && ['glass', 'True sight'], spin.wider && ['ice', spin.wider > 1 ? `Wider ×${spin.wider}` : 'Wider']].filter(Boolean);
    hubFx.innerHTML = fx.map(([type, label]) => `<img src="${medalURL(type)}" alt="${label}" title="${label}: ${TILES[type].note}">`).join('');
    if (fx.length) shell.say(`${p.id === 'you' ? 'Your' : `${p.name}'s`} spin: ${fx.map(([, label]) => label.toLowerCase()).join(', ')}.`);
    if (p.id === 'you') {
      shell.actions('<button class="btn" data-act="drop" disabled>Watch the tiles…</button>');
      setTimeout(() => alive && wheel.spinning && shell.actions('<button class="btn" data-act="drop">Drop the ball</button>'), 1000);
      await new Promise(r => { waitDrop = () => { if (performance.now() - wheel.t0 >= 1000) { waitDrop = null; r(); } }; });
      shell.actions('');
    } else {
      const t = planDrop(spin, rot0, p.style);
      await sleep(t * 1000);
    }
    wheel.rotation = turned(performance.now());
    wheel.spinning = false;
    const zone = Ricochet.under(wheel.zones, wheel.rotation);
    wheel.landed = zone; wheel.covered = false;
    hubFx.innerHTML = '';
    const out = game.resolve(zone);
    if (out.kind === 'item') present(out.item, `${p.id === 'you' ? 'You find' : `${p.short} finds`} the ${TILES[out.item].label.toLowerCase()}`, TILES[out.item].note);
    if (out.kind === 'saved') present('heart', 'The heart holds', `${out.cause === 'gap' ? 'Into the gap' : 'A skull'}, and still standing.`);
    return out;
  }

  function tell(p, out) {
    const who = p.id === 'you' ? 'You' : p.name;
    const v = p.id === 'you' ? '' : 's';
    switch (out.kind) {
      case 'coin': return `${who} land${v} on a coin. The bank adds ${out.amount}.`;
      case 'jackpot': return `Jackpot. The bank adds ${out.amount}.`;
      case 'item': return `${who} find${v} the ${TILES[out.item].label.toLowerCase()}. ${TILES[out.item].note}`;
      case 'saved': return `${out.cause === 'gap' ? 'Into the gap' : 'A skull'}, but the heart holds. ${who} stay${v} in.`;
      case 'dead': return out.cause === 'gap' ? `${who} drop${v} into the gap.` : `${who} land${v} on a skull.`;
    }
    return '';
  }

  async function play() {
    shell.say(`Four buy-ins of ${BUY_IN}. The pot opens at ${game.pot}.`);
    render(); await sleep(1300);
    while (alive && game.phase !== 'over') {
      const p = game.current;
      render();
      if (game.phase === 'solo-choice') {
        if (p.id === 'you') {
          shell.say(`You are the last one standing. Take the ${game.pot}, or spin three more times against the house and take it after?`);
          shell.actions(`<button class="btn ghost" data-act="challenge">Challenge the house</button><button class="btn" data-act="claim">Take the pot (${game.pot})</button>`);
          const c = await new Promise(r => { waitChoice = r; }); waitChoice = null; shell.actions('');
          if (c === 'claim') { game.claim(); render(); return finish(`You take the pot of ${me().cashOut}.`); }
          game.challenge(); shell.say('Three spins against the house. No more coins-only rounds.');
          await sleep(1000); continue;
        }
        // a guest is last; you are already out of this game
        return;
      }

      if (p.id === 'you') {
        const canLeave = game.phase === 'turn' && game.round > 1;
        shell.say(game.phase === 'solo' ? `Your spin against the house. ${game.soloLeft} to go.` : `Your spin, round ${ROMAN(game.round)}.`);
        shell.actions(`${canLeave ? `<button class="btn ghost" data-act="escape">Leave with ${Math.floor(game.pot * 0.25)}</button>` : ''}${game.phase === 'solo' ? `<button class="btn ghost" data-act="claim">Take the pot (${game.pot})</button>` : ''}<button class="btn" data-act="spin">Spin the wheel</button>`);
        const c = await new Promise(r => { waitChoice = r; }); waitChoice = null; shell.actions('');
        if (!alive) return;
        if (c === 'leave') { const share = game.leave(); render(); return finish(`You walk away with ${share}.`); }
        if (c === 'claim') { game.claim(); render(); return finish(`You take the pot of ${me().cashOut}.`); }
      } else {
        if (wantsToLeave(game, p.style)) {
          const share = game.leave();
          shell.say(`${p.name} has seen enough and leaves with ${share}.`);
          render(); await sleep(1500);
          game.advance(); continue;
        }
        shell.say(`${p.name} spins.`);
        await sleep(700);
      }
      if (!alive) return;
      const out = await spinFor(p);
      if (!alive) return;
      shell.say(tell(p, out));
      if (out.kind === 'dead' || out.kind === 'saved') shell.pulse(p.id);
      render();
      await sleep(p.id === 'you' && out.kind === 'dead' ? 2800 : 1900); if (!alive) return;
      const next = game.advance();
      render();
      if (p.id === 'you' && out.kind === 'dead') return finish('The wheel has the last word tonight.');
      if (next === 'house') { shell.say('Nobody is left standing. The house keeps the pot.'); await sleep(1500); return finish('The house keeps the pot.'); }
      if (next === 'won') return finish(`You beat the house. The pot of ${me().cashOut} is yours.`);
    }
  }

  size(); render();
  play();
  return { close() { settle(); close(); } };
}

// Up close in the resort: the journal rack in the reading room, and a work on the gallery wall.

import { deskFrame } from './coins/viewer.js';
import { JOURNALS, journalCover, ARTWORKS, artworkCanvas } from './art.js';

export async function openJournals(root, { onLeave }) {
  const frame = deskFrame(root, {
    name: 'The Reading Room', meta: 'Allmer Journals', back: 'Back to the reading room', onLeave, cls: 'journals-view',
    body: `
      <div class="journals">
        <p class="gallery-intro">The house takes every one of the Allmer Journals. Take one down from the rack; each opens on simonallmer.com.</p>
        <ul class="journal-list">
          ${JOURNALS.map(j => `
          <li>
            <a class="journal" href="${j.url}" target="_blank" rel="noopener">
              <span class="journal-cover" data-cover="${j.id}"></span>
              <b>${j.name}</b>
              <span>${j.line}</span>
              <small>Read it ↗</small>
            </a>
          </li>`).join('')}
        </ul>
      </div>`,
  });
  for (const j of JOURNALS) {
    journalCover(j, 420).then(c => {
      const slot = root.querySelector(`[data-cover="${j.id}"]`);
      if (slot) { c.className = 'cover-canvas'; slot.append(c); }
    }).catch(() => {});
  }
  return frame;
}

export async function openArtwork(root, { i, onLeave, onNav }) {
  const a = ARTWORKS[i];
  const frame = deskFrame(root, { name: a.title, meta: 'The Gallery', back: 'Back to the gallery', onLeave, cls: 'art-view' });
  frame.canvas.remove();
  frame.stage.insertAdjacentHTML('beforeend', '<div class="art-frame"></div>');
  frame.side.innerHTML = `
    <p class="kicker">The Gallery · ${i + 1} of ${ARTWORKS.length}</p>
    <h2>${a.title}</h2>
    <p class="art-by">${a.artist}</p>
    <dl class="coin-specs">
      <div><dt>Medium</dt><dd>${a.medium}</dd></div>
      <div><dt>Size</dt><dd>${Math.round(a.w * 25)} × ${Math.round(a.h * 25)} cm</dd></div>
    </dl>
    ${a.placeholder ? '<p class="fine">A placeholder, painted by the house while the first works are hung. Real works by real artists will take its place.</p>' : ''}
    <nav class="coin-nav">
      ${i > 0 ? `<button class="link" data-nav="${i - 1}">← ${ARTWORKS[i - 1].title}</button>` : '<span></span>'}
      ${i < ARTWORKS.length - 1 ? `<button class="link" data-nav="${i + 1}">${ARTWORKS[i + 1].title} →</button>` : '<span></span>'}
    </nav>`;
  frame.$('.coin-nav').addEventListener('click', e => {
    const b = e.target.closest('[data-nav]');
    if (b && onNav && frame.close()) onNav(+b.dataset.nav);
  });
  const c = await artworkCanvas(a, 1400);
  c.className = 'art-canvas';
  c.style.aspectRatio = `${a.w} / ${a.h}`;
  frame.$('.art-frame').append(c);
  return frame;
}

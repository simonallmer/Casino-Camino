// The C2 print on its own page, kept apart from the game.
// Built into "Coin Archive/index.html" by `python3 build.py --archive`; nothing in the game links to it.

import { openCoin } from './viewer.js';

const root = document.querySelector('.archive-root');
const show = () => openCoin(root, { id: 'c2', back: '', onLeave: show });
show();

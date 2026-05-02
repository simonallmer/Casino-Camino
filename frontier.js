// --- Constants & Data ---
const SUITS = {
    DEEP_SOUTH: { id: 'DEEP_SOUTH', name: 'Deep South', symbol: '<svg class="suit-icon" viewBox="0 0 100 100"><path d="M 50 18 C 60 8, 78 10, 78 25 C 78 40, 54 35, 54 50 C 54 65, 78 60, 78 75 C 78 90, 60 92, 50 82 C 40 92, 22 90, 22 75 C 22 60, 46 65, 46 50 C 46 35, 22 40, 22 25 C 22 10, 40 8, 50 18 Z" fill="currentColor"/></svg>', color: 'var(--deep-south-text)', bg: 'var(--deep-south-bg)', border: 'var(--deep-south-border)', align: 'Confederacy' },
    UPPER_SOUTH: { id: 'UPPER_SOUTH', name: 'Upper/Western South', symbol: '<svg class="suit-icon" viewBox="0 0 100 100"><path d="M 50 8 A 120 120 0 0 0 78 50 A 120 120 0 0 0 50 92 A 120 120 0 0 0 22 50 A 120 120 0 0 0 50 8 Z" fill="currentColor"/></svg>', color: 'var(--upper-south-text)', bg: 'var(--upper-south-bg)', border: 'var(--upper-south-border)', align: 'Confederacy' },
    INDUST_EAST: { id: 'INDUST_EAST', name: 'Indust. East', symbol: '<svg class="suit-icon" viewBox="0 0 100 100"><path d="M 45 22 L 45 35 Q 45 45 35 45 L 22 45 L 22 55 L 35 55 Q 45 55 45 65 L 45 78 L 55 78 L 55 65 Q 55 55 65 55 L 78 55 L 78 45 L 65 45 Q 55 45 55 35 L 55 22 Z" fill="currentColor"/><circle cx="50" cy="14" r="12" fill="currentColor"/><circle cx="39" cy="23" r="9" fill="currentColor"/><circle cx="61" cy="23" r="9" fill="currentColor"/><circle cx="50" cy="86" r="12" fill="currentColor"/><circle cx="39" cy="77" r="9" fill="currentColor"/><circle cx="61" cy="77" r="9" fill="currentColor"/><circle cx="14" cy="50" r="12" fill="currentColor"/><circle cx="23" cy="39" r="9" fill="currentColor"/><circle cx="23" cy="61" r="9" fill="currentColor"/><circle cx="86" cy="50" r="12" fill="currentColor"/><circle cx="77" cy="39" r="9" fill="currentColor"/><circle cx="77" cy="61" r="9" fill="currentColor"/></svg>', color: 'var(--indust-east-text)', bg: 'var(--indust-east-bg)', border: 'var(--indust-east-border)', align: 'Union' },
    WEST_FRONTIER: { id: 'WEST_FRONTIER', name: 'Western Frontier', symbol: '<svg class="suit-icon" viewBox="0 0 100 100"><path d="M 50 50 C 48 48, 35 40, 35 28 C 35 15, 45 10, 50 5 C 55 10, 65 15, 65 28 C 65 40, 52 48, 50 50 C 52 48, 60 35, 72 35 C 85 35, 90 45, 95 50 C 90 55, 85 65, 72 65 C 60 65, 52 52, 50 50 C 52 52, 65 60, 65 72 C 65 85, 55 90, 50 95 C 45 90, 35 85, 35 72 C 35 60, 48 52, 50 50 C 48 52, 40 65, 28 65 C 15 65, 10 55, 5 50 C 10 45, 15 35, 28 35 C 40 35, 48 48, 50 50 Z" fill="currentColor"/></svg>', color: 'var(--west-frontier-text)', bg: 'var(--west-frontier-bg)', border: 'var(--west-frontier-border)', align: 'Union' },
    BORDER: { id: 'BORDER', name: 'Border States', symbol: '<svg class="suit-icon" viewBox="0 0 100 100"><path d="M 50 12 L 61 31 L 83 31 L 72 50 L 83 69 L 61 69 L 50 88 L 39 69 L 17 69 L 28 50 L 17 31 L 39 31 Z" fill="currentColor"/><circle cx="50" cy="12" r="6" fill="currentColor"/><circle cx="83" cy="31" r="6" fill="currentColor"/><circle cx="83" cy="69" r="6" fill="currentColor"/><circle cx="50" cy="88" r="6" fill="currentColor"/><circle cx="17" cy="69" r="6" fill="currentColor"/><circle cx="17" cy="31" r="6" fill="currentColor"/></svg>', color: 'var(--border-text)', bg: 'var(--border-bg)', border: 'var(--border-border)', align: 'Neutral' }
};

const BASE_BET_UNIT = 1;

// --- Helper Functions ---
function createDeck() {
    let newDeck = [];
    Object.keys(SUITS).forEach(suitKey => {
        const suit = SUITS[suitKey];
        for (let val = 1; val <= 10; val++) {
            newDeck.push({
                id: `${suitKey}-${val}`,
                suit: suit,
                name: `Rank ${val}`,
                val: val
            });
        }
    });

    // Shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
}

function evaluateHand(cards) {
    if (!cards || cards.length === 0) return { name: "Fold", score: 0, style: "color: #78716c;", displayValue: "0", type: 'FOLD' };

    const sortedCards = [...cards].sort((a, b) => a.val - b.val);
    const isPureFlush = cards.every(c => c.suit.id === cards[0].suit.id);

    const isConfederate = cards.every(c => c.suit.align === 'Confederacy' || c.suit.align === 'Neutral');
    const isUnion = cards.every(c => c.suit.align === 'Union' || c.suit.align === 'Neutral');
    const hasAllegiance = isConfederate || isUnion;

    // Purity Tiebreaker Logic
    let purityBonus = 0;
    let purityTag = "";
    if (cards.length > 1) {
        if (isPureFlush) {
            purityBonus = 40;
            purityTag = " [Pure]";
        } else if (cards.every(c => c.suit.align === 'Union') || cards.every(c => c.suit.align === 'Confederacy') || cards.every(c => c.suit.align === 'Neutral')) {
            purityBonus = 30;
            purityTag = " [Strict]";
        } else if (hasAllegiance) {
            purityBonus = 20;
            purityTag = " [Border]";
        } else {
            purityBonus = 10;
            purityTag = " [Divided]";
        }
    }

    let isRun = false;
    if (cards.length > 1) {
        // Linear Run
        let maxRun = 1, currentRun = 1;
        for (let i = 0; i < sortedCards.length - 1; i++) {
            if (sortedCards[i + 1].val === sortedCards[i].val + 1) currentRun++;
            else if (sortedCards[i + 1].val !== sortedCards[i].val) currentRun = 1;
            maxRun = Math.max(maxRun, currentRun);
        }
        let linearRun = maxRun === cards.length;

        // Circular Run (Wrap-around 10 to 1)
        // Hand is already sorted by val.
        // If it's a 10-1 wrap, it would look like [1, 2, ..., 10]
        // Example for length 3: [1, 2, 10] or [1, 9, 10]
        // But sorted: [1, 2, 10] -> 10, 1, 2. The gap is between 2 and 10.
        // A better check for circular runs in a sorted array:
        // A run exists if (sorted[i+1] - sorted[i] == 1) OR (sorted[0] == 1 AND sorted[last] == 10 AND some other logic)
        // Actually, for any N cards to be a circular run, they must be distinct and 
        // (max - min == N - 1) OR (if 1 and 10 are present, check the 'gap')

        if (linearRun) {
            isRun = true;
        } else {
            // Circular check: must have 1 and 10
            const values = sortedCards.map(c => c.val);
            if (values.includes(1) && values.includes(10)) {
                // Find the rotation point where values[i+1] - values[i] > 1
                // There should be exactly one such gap if it's a run
                let gaps = 0;
                for (let i = 0; i < values.length - 1; i++) {
                    if (values[i + 1] - values[i] > 1) gaps++;
                }
                // Also check if the "outside" wrap is correct
                // If gaps == 1, and the total span excluding that gap is correct
                // The number of steps 'missing' in the linear sequence must match the wrap
                // Example 3 cards: [1, 9, 10]. Gap at 1-9 is 8. Total elements: 10. 
                // Wait, simpler: for N distinct cards, it's a circular run if
                // after sorting, there is at most one index i where sorted[i+1] != sorted[i] + 1
                // AND if that happens, the "remaining" values must be at the ends [1...x] and [y...10]
                // and the total count x + (10 - y + 1) == N.
                let breakPoint = -1;
                let breaks = 0;
                for (let i = 0; i < values.length - 1; i++) {
                    if (values[i + 1] !== values[i] + 1) {
                        breaks++;
                        breakPoint = i;
                    }
                }
                if (breaks === 1 && values[0] === 1 && values[values.length - 1] === 10) {
                    isRun = true;
                }
            }
        }
    }

    const valCounts = {};
    cards.forEach(c => valCounts[c.val] = (valCounts[c.val] || 0) + 1);
    const maxValCount = Math.max(...Object.values(valCounts));
    const dominantVal = parseInt(Object.keys(valCounts).find(k => valCounts[k] === maxValCount));

    const highCardVal = sortedCards[sortedCards.length - 1].val;

    // Scoring Hierarchy
    if (cards.length === 5) {
        if (maxValCount === 5) return { name: `Five of Rank ${dominantVal}`, score: 5300000000 + (dominantVal * 100) + purityBonus, style: "color: #e879f9; font-weight: 900;", tier: 'Tier 1' };
        if (isPureFlush) return { name: "Pure 5-Card Alliance", score: 5200000000 + (highCardVal * 100) + purityBonus, style: "color: #fbbf24; font-weight: 900;", tier: 'Tier 1' };
        if (hasAllegiance && isRun) return { name: `5-Card Coalition Series${purityTag}`, score: 5100000000 + (highCardVal * 100) + purityBonus, style: "color: #fb923c; font-weight: bold;", tier: 'Tier 1' };
        if (isRun) return { name: `5-Card Campaign Series${purityTag}`, score: 5000000000 + (highCardVal * 100) + purityBonus, style: "color: #60a5fa; font-weight: bold;", tier: 'Tier 1' };
    }

    if (cards.length === 4) {
        if (maxValCount === 4) return { name: `Four of Rank ${dominantVal}${purityTag}`, score: 4300000000 + (dominantVal * 100) + purityBonus, style: "color: #c084fc; font-weight: bold;", tier: 'Tier 2' };
        if (isPureFlush) return { name: "Pure 4-Card Alliance", score: 4200000000 + (highCardVal * 100) + purityBonus, style: "color: #34d399;", tier: 'Tier 2' };
        if (hasAllegiance && isRun) return { name: `4-Card Coalition Series${purityTag}`, score: 4100000000 + (highCardVal * 100) + purityBonus, style: "color: #a3e635;", tier: 'Tier 2' };
        if (isRun) return { name: `4-Card Campaign Series${purityTag}`, score: 4000000000 + (highCardVal * 100) + purityBonus, style: "color: #22d3ee;", tier: 'Tier 2' };
    }

    if (cards.length === 3) {
        if (maxValCount === 3) return { name: `Three of Rank ${dominantVal}${purityTag}`, score: 3300000000 + (dominantVal * 100) + purityBonus, style: "color: #fb7185;", tier: 'Tier 3' };
        if (isPureFlush) return { name: "Pure 3-Card Alliance", score: 3200000000 + (highCardVal * 100) + purityBonus, style: "color: #6ee7b7;", tier: 'Tier 3' };
        if (hasAllegiance && isRun) return { name: `3-Card Coalition Series${purityTag}`, score: 3100000000 + (highCardVal * 100) + purityBonus, style: "color: #bef264;", tier: 'Tier 3' };
        if (isRun) return { name: `3-Card Campaign Series${purityTag}`, score: 3000000000 + (highCardVal * 100) + purityBonus, style: "color: #67e8f9;", tier: 'Tier 3' };
    }

    if (cards.length === 2) {
        if (maxValCount === 2) return { name: `Pair of Rank ${dominantVal}${purityTag}`, score: 2000000000 + (dominantVal * 100) + purityBonus, style: "color: #d6d3d1;", tier: 'Tier 4' };
    }

    // --- Raw Skirmish Power ---
    let skirmishScore = 0;
    let skirmishName = "";
    let style = "color: #a8a29e;";

    if (cards.length === 1) {
        skirmishScore = cards[0].val;
        skirmishName = `Solo Force: Rank ${cards[0].val}`;
    } else if (isPureFlush) {
        skirmishScore = cards.reduce((acc, c) => acc * c.val, 1) * 2;
        skirmishName = `Pure Skirmish (${cards.length})`;
        style = "color: #10b981; font-weight: bold;";
    } else if (hasAllegiance) {
        skirmishScore = cards.reduce((acc, c) => acc * c.val, 1);
        skirmishName = `Coalition Skirmish (${cards.length})${purityTag}`;
        style = "color: #84cc16; font-weight: bold;";
    } else {
        skirmishScore = cards.reduce((acc, c) => acc + c.val, 0);
        skirmishName = `Divided Skirmish (${cards.length})`;
        style = "color: #f87171; font-weight: bold;";
    }

    return {
        name: skirmishName,
        score: (skirmishScore * 100) + purityBonus,
        style: style,
        tier: 'Tier 5',
        power: skirmishScore.toLocaleString()
    };
}

// --- Main Game Class ---
class FrontierGame {
    constructor() {
        this.deck = [];
        this.discardPile = [];
        this.pot = 0;
        this.players = [];
        this.allGlobalPlayers = [];

        this.currentRoundNum = 1;
        this.roundActivePlayers = [];
        this.roundPlays = [];
        this.roundBet = 0;
        this.activePlayerId = 0; // index in this.players
        this.gameHistory = [];

        this.selectedCardIndices = [];
        this.phase = 'SETUP'; // SETUP, TRANSITION, PLAYING, ROUND_OVER, GAME_OVER

        // DOM Elements
        this.els = {
            cardsContainer: document.getElementById('cards-container'),
            controlsArea: document.getElementById('controls-area'),
            mainHud: document.getElementById('main-hud'),
            playerStatusGrid: document.getElementById('player-status-grid'),
            overlay: document.getElementById('overlay'),
            overlayTitle: document.getElementById('overlay-title'),
            overlayDesc: document.getElementById('overlay-desc'),
            rulesModal: document.getElementById('rules-modal'),
            msgArea: document.getElementById('message-area'),
            historyPanel: document.getElementById('history-panel'),
            historyContent: document.getElementById('history-content'),
            mulliganBtn: document.getElementById('mulligan-btn')
        };

        this.loadGlobalPlayers();
    }

    loadGlobalPlayers() {
        const saved = localStorage.getItem('casino_camino_players');
        if (saved) {
            this.allGlobalPlayers = JSON.parse(saved);
        } else {
            window.location.href = 'index.html';
        }
    }

    saveGlobalPlayers() {
        // Map local player cash back to global
        this.players.forEach(p => {
            const masterIdx = this.allGlobalPlayers.findIndex(mp => mp.id === p.globalId);
            if (masterIdx > -1) {
                this.allGlobalPlayers[masterIdx].cash = p.cash;
            }
        });
        localStorage.setItem('casino_camino_players', JSON.stringify(this.allGlobalPlayers));
    }

    toggleRules() {
        this.els.rulesModal.classList.toggle('visible');
    }

    toggleDeckView() {
        const modal = document.getElementById('deck-view-modal');
        const isVisible = modal.classList.contains('visible');
        
        if (!isVisible) {
            this.renderDeckView();
            modal.classList.add('visible');
        } else {
            modal.classList.remove('visible');
        }
    }

    renderDeckView() {
        const grid = document.getElementById('deck-grid');
        grid.innerHTML = '';
        grid.style.gap = '12px';
        grid.style.padding = '20px';
        
        // Custom order to match requested aesthetic
        const suitOrder = ['WEST_FRONTIER', 'INDUST_EAST', 'DEEP_SOUTH', 'UPPER_SOUTH', 'BORDER'];
        
        suitOrder.forEach(suitKey => {
            const suit = SUITS[suitKey];
            for (let val = 1; val <= 10; val++) {
                const cardEl = document.createElement('div');
                cardEl.className = `card suit-${suit.id}`;
                // Simplified, smaller card for grid view
                cardEl.style.width = '100%';
                cardEl.style.maxWidth = '65px';
                cardEl.style.margin = '0 auto';
                cardEl.style.height = 'auto';
                cardEl.style.aspectRatio = '2/3';
                cardEl.style.padding = '5px';
                cardEl.style.cursor = 'default';
                cardEl.style.transform = 'none';
                cardEl.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
                cardEl.style.borderRadius = '4px';
                cardEl.style.borderWidth = '1px';
                
                cardEl.innerHTML = `
                    <div class="card-corner" style="font-size: 0.6rem; padding: 0;">${val}</div>
                    <div class="card-center">
                        <div class="card-val" style="font-size: 1rem; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                            ${suit.symbol}
                        </div>
                    </div>
                    <div class="card-corner bottom" style="font-size: 0.6rem; padding: 0;">${val}</div>
                `;
                grid.appendChild(cardEl);
            }
        });
    }

    // --- Autonomous Computer Logic ---
    startComputerTurn() {
        const player = this.players[this.activePlayerId];
        this.updateHUD();
        this.updatePlayerPods();

        // Prepare UI for secret computer turn
        this.els.cardsContainer.innerHTML = '';
        this.els.controlsArea.innerHTML = '';
        this.els.controlsArea.style.display = 'none';
        this.els.mulliganBtn.style.display = 'none';

        this.setMessage(`<div style="font-size: 1.8rem; color: var(--gold-bright); letter-spacing: 2px;">${player.name.toUpperCase()} IS THINKING...</div>`);
        
        // Display face-down cards to maintain secrecy
        const handCount = player.hand.length;
        for (let i = 0; i < handCount; i++) {
            const cardBack = document.createElement('div');
            cardBack.className = 'card card-back';
            cardBack.style.cursor = 'default';
            this.els.cardsContainer.appendChild(cardBack);
        }

        setTimeout(() => {
            const decision = this.calculateComputerMove(player);
            
            if (decision.type === 'FOLD') {
                this.setMessage(`<div style="font-size: 1.5rem; color: #f87171;">${player.name} retreats and FOLDS.</div>`);
                setTimeout(() => this.executeFold(), 2000);
            } else {
                this.selectedCardIndices = decision.indices;
                const isFirst = this.roundPlays.length === 0;
                const betType = decision.amount > this.roundBet ? 'raises to' : (isFirst ? 'bets' : 'calls');
                
                this.setMessage(`
                    <div style="font-size: 1.6rem; color: var(--gold-bright);">${player.name} ${betType} €${decision.amount}</div>
                    <div style="font-size: 1rem; opacity: 0.8; margin-top: 10px;">Committing ${decision.indices.length} cards to the Frontier.</div>
                `);
                
                setTimeout(() => {
                    this.executePlay(decision.amount);
                }, 2500);
            }
        }, 2000);
    }

    calculateComputerMove(player) {
        const hand = player.hand;
        let bestEval = { score: -1 };
        let bestIndices = [];

        // Check all subsets to find the most powerful play
        const n = hand.length;
        for (let i = 1; i < (1 << n); i++) {
            const currentIndices = [];
            for (let j = 0; j < n; j++) {
                if ((i >> j) & 1) currentIndices.push(j);
            }
            const subset = currentIndices.map(idx => hand[idx]);
            const evalResult = evaluateHand(subset);
            if (evalResult.score > bestEval.score) {
                bestEval = evalResult;
                bestIndices = currentIndices;
            }
        }

        // Betting Strategy based on Tier and current pot
        const isFirst = this.roundPlays.length === 0;
        let amount = this.roundBet;
        const tierNum = bestEval.tier ? parseInt(bestEval.tier.replace('Tier ', '')) : 5;
        
        if (isFirst) {
            if (tierNum <= 2) amount = 5;
            else if (tierNum === 3) amount = 3;
            else if (tierNum === 4) amount = 2;
            else amount = 1;
        } else {
            // Aggressive play for strong hands
            if (tierNum <= 2 && this.roundBet < 5) amount = Math.min(5, this.roundBet + 2);
            else if (tierNum === 3 && this.roundBet < 5) amount = Math.min(5, this.roundBet + 1);
            
            // Risk management
            if (tierNum === 5 && this.roundBet >= 3) return { type: 'FOLD' };
            if (tierNum === 4 && this.roundBet >= 5) return { type: 'FOLD' };
            if (player.cash < amount) return { type: 'FOLD' };
        }

        // Final cash check
        amount = Math.min(amount, player.cash);
        return { type: 'PLAY', indices: bestIndices, amount: amount };
    }

    setMessage(msg) {
        this.els.msgArea.innerHTML = msg;
    }

    initGame() {
        // Filter players who can afford at least 1 round (need > 0 technically, but let's just take all active)
        this.players = this.allGlobalPlayers.map(p => ({
            globalId: p.id,
            name: p.name,
            cash: p.cash,
            color: p.color,
            hand: [],
            canMulligan: true,
            status: p.cash > 0 ? 'ACTIVE' : 'BANKRUPT'
        }));

        if (this.players.length < 2) {
            alert("Need at least 2 players to play Frontier!");
            return;
        }

        this.deck = createDeck();
        this.discardPile = [];
        this.pot = 0;
        this.currentRoundNum = 1;
        this.gameHistory = [];

        // Initial Draw (Round 1 = 1 card)
        this.players.forEach(p => {
            p.hand = this.deck.splice(0, 1);
        });

        this.roundActivePlayers = this.players
            .map((p, i) => (p.status === 'ACTIVE' ? i : -1))
            .filter(idx => idx !== -1);
        this.roundPlays = [];
        this.roundBet = 0;

        // Ensure starting player is not bankrupt
        this.activePlayerId = this.players.findIndex(p => p.status === 'ACTIVE');
        if (this.activePlayerId === -1) this.activePlayerId = 0;

        this.els.mainHud.style.display = 'flex';
        this.phase = 'TRANSITION';

        this.saveGlobalPlayers();
        this.renderTransition();
    }

    renderTransition() {
        if (this.players[this.activePlayerId].status === 'BANKRUPT') {
            this.advanceRound();
            return;
        }

        // Auto-skip the very first transition screen for Player 1 in Round 1
        const firstActiveIdx = this.players.findIndex(p => p.status === 'ACTIVE');
        if (this.currentRoundNum === 1 && this.activePlayerId === firstActiveIdx) {
            this.startTurn();
            return;
        }

        const player = this.players[this.activePlayerId];
        this.updateHUD();
        this.updatePlayerPods();

        // Autonomous Computer Turn check
        if (player.name.toLowerCase().includes('computer')) {
            this.startComputerTurn();
            return;
        }

        this.els.cardsContainer.innerHTML = '';
        this.els.controlsArea.innerHTML = '';
        this.els.controlsArea.style.display = 'none';
        this.els.historyPanel.style.display = 'none';
        this.els.mulliganBtn.style.display = 'none';

        this.els.overlayTitle.innerText = `PASS TO ${player.name.toUpperCase()}`;
        this.els.overlayTitle.style.color = player.color.hex || 'var(--gold)';
        this.els.overlayDesc.innerText = `When ready, click below to reveal Round ${this.currentRoundNum} hand.`;

        const btn = document.getElementById('overlay-main-btn');
        btn.innerText = "REVEAL CARDS";
        btn.onclick = () => this.startTurn();

        this.els.overlay.classList.add('visible');
        this.setMessage("");
    }

    startTurn() {
        this.els.overlay.classList.remove('visible');
        this.phase = 'PLAYING';
        this.selectedCardIndices = [];
        this.renderPlaying();
    }

    renderCards(cards, isClickable = false, hideSelected = false) {
        this.els.cardsContainer.innerHTML = '';
        cards.forEach((card, idx) => {
            if (hideSelected && this.selectedCardIndices.includes(idx)) return;

            const div = document.createElement('div');
            div.className = `card suit-${card.suit.id}`;
            if (this.selectedCardIndices.includes(idx)) div.classList.add('selected');

            div.innerHTML = `
                <div class="card-corner">
                    <div class="corner-val">${card.val}</div>
                </div>
                <div class="card-center">
                    <div class="card-val">${card.suit.symbol}</div>
                </div>
                <div class="card-corner bottom">
                    <div class="corner-val">${card.val}</div>
                </div>
            `;

            if (isClickable) {
                div.onclick = () => {
                    if (this.selectedCardIndices.includes(idx)) {
                        this.selectedCardIndices = this.selectedCardIndices.filter(i => i !== idx);
                    } else {
                        this.selectedCardIndices.push(idx);
                    }
                    this.renderPlaying();
                };
            }
            this.els.cardsContainer.appendChild(div);
        });
    }

    renderPlaying() {
        const player = this.players[this.activePlayerId];
        const currentHandSize = this.currentRoundNum;

        this.updateHUD();
        this.updatePlayerPods();
        this.renderCards(player.hand, true);

        // Mulligan Option
        this.els.mulliganBtn.style.display = 'block';
        this.els.mulliganBtn.disabled = !player.canMulligan;

        this.els.controlsArea.style.display = 'flex';

        const isFirstPlayer = this.roundPlays.length === 0;
        const isLastPlayer = this.roundPlays.length === this.roundActivePlayers.length - 1;
        const maxBetAllowed = 5 * BASE_BET_UNIT;

        // Evaluate Selection
        const selectedCards = this.selectedCardIndices.map(i => player.hand[i]);
        let handEval = null;
        if (selectedCards.length > 0) {
            handEval = evaluateHand(selectedCards);
        }

        let controlsHTML = '';

        if (isFirstPlayer) {
            if (handEval) {
                const details = handEval.tier === 'Tier 5' ? `Power: ${handEval.power}` : handEval.name;
                this.setMessage(`<div style="font-size: 1.8rem; font-weight: bold; color: var(--gold-bright);">${handEval.tier}</div><div style="font-size: 1rem; opacity: 0.8;">${details}</div>`);
            } else {
                this.setMessage(`Select cards to play and set the bet.`);
            }
            for (let b = BASE_BET_UNIT; b <= maxBetAllowed; b += BASE_BET_UNIT) {
                const disabledStr = (this.selectedCardIndices.length === 0 || player.cash < b) ? 'disabled' : '';
                controlsHTML += `<button class="action-btn" ${disabledStr} onclick="game.executePlay(${b})">BET €${b}</button>`;
            }
            controlsHTML += `<button class="danger-btn" onclick="game.executeFold()">FOLD</button>`;
        } else {
            if (handEval) {
                const details = handEval.tier === 'Tier 5' ? `Power: ${handEval.power}` : handEval.name;
                this.setMessage(`<div style="font-size: 1.8rem; font-weight: bold; color: var(--gold-bright);">${handEval.tier}</div><div style="font-size: 1rem; opacity: 0.8;">${details}</div>`);
            } else {
                this.setMessage(`Match the bet, raise, or retreat.`);
            }
            const callDisabled = (this.selectedCardIndices.length === 0 || player.cash < this.roundBet) ? 'disabled' : '';
            controlsHTML += `<button class="action-btn call-btn" ${callDisabled} onclick="game.executePlay(${this.roundBet})">CALL €${this.roundBet}</button>`;

            if (!isLastPlayer) {
                for (let b = this.roundBet + BASE_BET_UNIT; b <= maxBetAllowed; b += BASE_BET_UNIT) {
                    const raiseDisabled = (this.selectedCardIndices.length === 0 || player.cash < b) ? 'disabled' : '';
                    controlsHTML += `<button class="action-btn raise-btn" ${raiseDisabled} onclick="game.executePlay(${b})">RAISE €${b}</button>`;
                }
            }
            controlsHTML += `<button class="danger-btn" onclick="game.executeFold()">FOLD</button>`;
        }

        this.els.controlsArea.innerHTML = controlsHTML;
    }

    useMulligan() {
        const player = this.players[this.activePlayerId];
        if (!player.canMulligan) return;

        const oldHand = [...player.hand];
        // Combine current deck, discard pile, and the player's old hand
        const combinedDeck = [...this.deck, ...this.discardPile, ...oldHand];

        // Shuffle everything
        for (let i = combinedDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [combinedDeck[i], combinedDeck[j]] = [combinedDeck[j], combinedDeck[i]];
        }

        // Draw new hand of same size
        player.hand = combinedDeck.splice(0, oldHand.length);
        this.deck = combinedDeck;
        this.discardPile = [];

        player.canMulligan = false;
        this.selectedCardIndices = [];
        this.renderPlaying();
    }

    executePlay(amount) {
        if (this.selectedCardIndices.length === 0) return;
        const player = this.players[this.activePlayerId];

        if (player.cash < amount) return;

        const cardsToPlay = this.selectedCardIndices.map(i => player.hand[i]);
        const remainingHand = player.hand.filter((_, i) => !this.selectedCardIndices.includes(i));

        this.discardPile.push(...cardsToPlay);

        player.hand = remainingHand;
        player.cash -= amount;
        this.pot += amount;

        this.roundPlays.push({ playerId: this.activePlayerId, cards: cardsToPlay, amount });
        this.roundBet = Math.max(this.roundBet, amount);
        this.saveGlobalPlayers();

        this.advanceRound();
    }

    executeFold() {
        this.roundActivePlayers = this.roundActivePlayers.filter(idx => idx !== this.activePlayerId);
        this.advanceRound();
    }

    advanceRound() {
        if (this.roundActivePlayers.length <= 1 || this.roundPlays.length === this.roundActivePlayers.length) {
            // Showdown
            let evaluatedPlays = this.roundPlays.map(p => ({ ...p, result: evaluateHand(p.cards) }));
            let winnerId = -1;
            let isDefault = false;

            if (this.roundActivePlayers.length <= 1) {
                winnerId = this.roundActivePlayers.length === 1 ? this.roundActivePlayers[0] : (this.roundPlays[0] ? this.roundPlays[0].playerId : 0);
                isDefault = true;
            } else {
                evaluatedPlays.sort((a, b) => b.result.score - a.result.score);
                winnerId = evaluatedPlays[0].playerId;
            }
            this.concludeRound(winnerId, evaluatedPlays, isDefault);
        } else {
            // Next Player
            let nextIndexObj = -1;
            for (let i = 1; i <= this.players.length; i++) {
                const checkId = (this.activePlayerId + i) % this.players.length;
                if (this.roundActivePlayers.includes(checkId) && this.players[checkId].status === 'ACTIVE') {
                    nextIndexObj = checkId;
                    break;
                }
            }
            this.activePlayerId = nextIndexObj;
            this.phase = 'TRANSITION';
            this.renderTransition();
        }
    }

    concludeRound(winnerId, finalPlays, isDefault) {
        const winner = this.players[winnerId];
        const finalPot = this.pot;
        winner.cash += finalPot;
        this.saveGlobalPlayers();

        const roundResult = {
            roundNum: this.currentRoundNum,
            winnerId,
            isDefault,
            plays: finalPlays,
            potWon: finalPot
        };
        this.gameHistory.push(roundResult);

        this.phase = 'ROUND_OVER';
        this.renderRoundOver();
    }

    renderRoundOver() {
        this.els.cardsContainer.innerHTML = '';
        this.els.controlsArea.innerHTML = '';
        this.els.mulliganBtn.style.display = 'none';
        this.updateHUD();
        this.updatePlayerPods();

        const roundResult = this.gameHistory[this.gameHistory.length - 1];
        const winnerObj = this.players[roundResult.winnerId];
        const isFinal = this.currentRoundNum === 5;

        this.setMessage(`${winnerObj.name} wins Round ${this.currentRoundNum}! (Pot: €${roundResult.potWon})`);

        // Build History Panel
        this.els.historyContent.innerHTML = '';
        if (roundResult.isDefault) {
            this.els.historyContent.innerHTML = `<div style="text-align:center; padding: 20px;">All opposing commanders retreated.</div>`;
        } else {
            roundResult.plays.forEach(p => {
                const pObj = this.players[p.playerId];
                const res = p.result;
                const isWinner = p.playerId === roundResult.winnerId;

                let cardsHtml = p.cards.map(c => `<div class="card-mini suit-${c.suit.id}"><span class="card-val" style="color:${c.suit.color}">${c.val}</span></div>`).join('');

                const details = res.tier === 'Tier 5' ? `Power: ${res.power}` : res.name;

                let html = `
                    <div class="history-item" style="${isWinner ? 'background: rgba(212,175,55,0.1); border-left: 3px solid var(--gold); border-radius: 5px;' : ''}">
                        <div class="history-player" style="color: ${pObj.color.hex}">${pObj.name}</div>
                        <div class="history-play">
                            <div style="text-align: right; line-height: 1.2;">
                                <div style="${res.style}; font-size: 0.95rem; font-weight: bold;">${res.tier}</div>
                                <div style="font-size: 0.7rem; color: #888;">${details}</div>
                            </div>
                            <div class="history-cards">${cardsHtml}</div>
                        </div>
                    </div>
                `;
                this.els.historyContent.innerHTML += html;
            });
        }
        this.els.historyPanel.style.display = 'block';
        this.els.controlsArea.style.display = 'flex';

        const btnText = isFinal ? "PROCEED TO STANDINGS" : `BEGIN ROUND ${this.currentRoundNum + 1}`;
        this.els.controlsArea.innerHTML = `<button class="primary-btn" onclick="game.advanceToNextRound()">${btnText}</button>`;
    }

    advanceToNextRound() {
        if (this.currentRoundNum === 5) {
            this.phase = 'GAME_OVER';
            this.renderShowdown();
            return;
        }

        const nextRound = this.currentRoundNum + 1;
        const targetHandSize = nextRound;

        let allAvailableCards = [...this.deck, ...this.discardPile];
        for (let i = allAvailableCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allAvailableCards[i], allAvailableCards[j]] = [allAvailableCards[j], allAvailableCards[i]];
        }

        this.players.forEach(p => {
            if (p.cash <= 0) p.status = 'BANKRUPT';

            if (p.status === 'ACTIVE') {
                let need = targetHandSize - p.hand.length;
                let drawn = [];
                while (need > 0 && allAvailableCards.length > 0) {
                    drawn.push(allAvailableCards.shift());
                    need--;
                }
                p.hand = [...p.hand, ...drawn];
            } else {
                // Return cards to deck if they go bankrupt
                allAvailableCards.push(...p.hand);
                p.hand = [];
            }
        });

        this.currentRoundNum = nextRound;
        this.roundActivePlayers = this.players
            .map((p, i) => (p.status === 'ACTIVE' ? i : -1))
            .filter(idx => idx !== -1);

        // Ensure starting player is not bankrupt
        this.activePlayerId = this.players.findIndex(p => p.status === 'ACTIVE');
        if (this.activePlayerId === -1) this.activePlayerId = 0;

        this.roundPlays = [];
        this.roundBet = 0;
        this.pot = 0;
        this.deck = allAvailableCards;
        this.discardPile = [];

        // Rotate dealer, but skip bankrupt players
        let dealerCandidate = (this.currentRoundNum - 1) % this.players.length;
        while (this.players[dealerCandidate].status === 'BANKRUPT') {
            dealerCandidate = (dealerCandidate + 1) % this.players.length;
        }
        this.activePlayerId = dealerCandidate;

        this.phase = 'TRANSITION';
        this.renderTransition();
    }

    renderShowdown() {
        this.els.overlay.classList.remove('visible');
        this.els.cardsContainer.innerHTML = '';
        this.els.controlsArea.innerHTML = '';
        this.els.historyPanel.style.display = 'none';
        this.els.mainHud.style.display = 'none';
        this.els.mulliganBtn.style.display = 'none';
        this.els.controlsArea.style.display = 'none';

        const sortedPlayers = [...this.players].sort((a, b) => b.cash - a.cash);
        const topCash = sortedPlayers[0].cash;
        const winners = sortedPlayers.filter(p => p.cash === topCash);

        let msg = winners.length > 1
            ? `DRAW! ${winners.map(w => w.name).join(' & ')} tied with €${topCash}.`
            : `${winners[0].name.toUpperCase()} WINS THE FRONTIER WITH €${topCash}!`;

        this.setMessage(msg);

        let html = `
            <div style="background: rgba(0,0,0,0.6); padding: 30px; border-radius: 15px; border: 1px solid var(--gold-dim); width: 80%; display: flex; flex-direction: column; align-items: center; gap: 20px;">
                <h2 style="color: var(--gold-bright); font-size: 2.5rem; margin: 0; text-shadow: 0 0 20px rgba(255,215,0,0.5);">FINAL STANDINGS</h2>
                <div style="display: flex; gap: 30px; border-top: 1px solid #333; padding-top: 20px;">
        `;

        sortedPlayers.forEach((p, idx) => {
            const isWinner = p.cash === topCash && p.cash > 0;
            const isBankrupt = p.status === 'BANKRUPT';
            html += `
                <div style="display: flex; flex-direction: column; align-items: center; ${isWinner ? 'transform: scale(1.1); color: var(--gold-bright);' : (isBankrupt ? 'opacity: 0.2; filter: grayscale(1);' : 'opacity: 0.6;')}">
                    <span style="font-size: 0.8rem; font-family: 'Playfair Display', serif;">#${idx + 1}</span>
                    <strong style="font-size: 1.5rem;">${p.name}</strong>
                    <span style="font-size: 2rem; font-family: 'Cinzel', serif;">€${p.cash}</span>
                    ${isBankrupt ? '<span style="font-size: 0.6rem; color: #f87171;">BANKRUPT</span>' : ''}
                </div>
            `;
        });

        html += `
                </div>
                <div style="display: flex; gap: 20px; margin-top: 20px;">
                    <button class="primary-btn" onclick="window.location.reload()">PLAY AGAIN</button>
                    <a href="index.html" style="text-decoration: none;"><button class="secondary-btn" style="background: rgba(40, 40, 40, 0.8); border: 1px solid var(--gold-dim); color: var(--gold); padding: 15px 30px; font-family: 'Cinzel', serif; font-size: 1rem; letter-spacing: 2px; cursor: pointer; border-radius: 4px; transition: all 0.3s;">BACK TO MENU</button></a>
                </div>
            </div>
        `;
        this.els.cardsContainer.innerHTML = html;
        this.els.playerStatusGrid.innerHTML = '';
    }

    updateHUD() {
        document.getElementById('round-display').innerText = this.currentRoundNum;
        document.getElementById('pot-display').innerText = `€${this.pot}`;
        document.getElementById('current-bet-display').innerText = `€${this.roundBet}`;
        document.getElementById('deck-display').innerText = this.deck.length;
    }

    updatePlayerPods() {
        this.els.playerStatusGrid.innerHTML = '';
        this.players.forEach((p, idx) => {
            const isBankrupt = p.status === 'BANKRUPT';
            const isActiveTurn = this.phase === 'PLAYING' && idx === this.activePlayerId && !isBankrupt;
            const isFolded = this.phase === 'PLAYING' && !this.roundActivePlayers.includes(idx) && !isBankrupt;

            let actionStr = '';
            if (isBankrupt) {
                actionStr = 'Bankrupt';
            } else if (this.phase === 'PLAYING') {
                const play = this.roundPlays.find(play => play.playerId === idx);
                if (play) {
                    actionStr = `Played €${play.amount}`;
                } else if (isFolded) {
                    actionStr = 'Folded';
                } else if (isActiveTurn) {
                    actionStr = 'Thinking...';
                }
            }

            const div = document.createElement('div');
            div.className = `player-status-pod ${isActiveTurn ? 'active-turn' : ''} ${isFolded || isBankrupt ? 'folded' : ''}`;
            if (isBankrupt) div.style.opacity = "0.3";

            div.innerHTML = `
                <div class="pod-name" style="color: ${p.color.hex}">${p.name}</div>
                <div class="pod-cash">€${p.cash}</div>
                <div class="pod-action">${actionStr}</div>
            `;
            this.els.playerStatusGrid.appendChild(div);
        });
    }
}

// Init
const game = new FrontierGame();

// Escape Key Handlers
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const rulesModal = document.getElementById('rules-modal');
        const deckModal = document.getElementById('deck-view-modal');
        
        if (rulesModal && rulesModal.classList.contains('visible')) {
            game.toggleRules();
        } else if (deckModal && deckModal.classList.contains('visible')) {
            game.toggleDeckView();
        } else {
            // Navigate back to Casino Camino menu
            window.location.href = 'index.html';
        }
    }
});

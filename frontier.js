// --- Constants & Data ---
const SUITS = {
    DEEP_SOUTH: { id: 'DEEP_SOUTH', name: 'Deep South', symbol: '♥', color: 'var(--deep-south-text)', bg: 'var(--deep-south-bg)', border: 'var(--deep-south-border)', align: 'Confederacy' },
    UPPER_SOUTH: { id: 'UPPER_SOUTH', name: 'Upper/Western South', symbol: '♦', color: 'var(--upper-south-text)', bg: 'var(--upper-south-bg)', border: 'var(--upper-south-border)', align: 'Confederacy' },
    INDUST_EAST: { id: 'INDUST_EAST', name: 'Indust. East', symbol: '♠', color: 'var(--indust-east-text)', bg: 'var(--indust-east-bg)', border: 'var(--indust-east-border)', align: 'Union' },
    WEST_FRONTIER: { id: 'WEST_FRONTIER', name: 'Western Frontier', symbol: '♣', color: 'var(--west-frontier-text)', bg: 'var(--west-frontier-bg)', border: 'var(--west-frontier-border)', align: 'Union' },
    BORDER: { id: 'BORDER', name: 'Border States', symbol: '★', color: 'var(--border-text)', bg: 'var(--border-bg)', border: 'var(--border-border)', align: 'Neutral' }
};

const BASE_BET_UNIT = 1;

// --- Helper Functions ---
function createDeck() {
    let newDeck = [];
    Object.keys(SUITS).forEach(suitKey => {
        const suit = SUITS[suitKey];
        for (let val = 1; val <= 9; val++) {
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

    let maxRun = 1, currentRun = 1;
    for (let i = 0; i < sortedCards.length - 1; i++) {
        if (sortedCards[i + 1].val === sortedCards[i].val + 1) currentRun++;
        else if (sortedCards[i + 1].val !== sortedCards[i].val) currentRun = 1;
        maxRun = Math.max(maxRun, currentRun);
    }
    const isRun = maxRun === cards.length && cards.length > 1;

    const valCounts = {};
    cards.forEach(c => valCounts[c.val] = (valCounts[c.val] || 0) + 1);
    const maxValCount = Math.max(...Object.values(valCounts));
    const dominantVal = parseInt(Object.keys(valCounts).find(k => valCounts[k] === maxValCount));

    const highCardVal = sortedCards[sortedCards.length - 1].val;

    // Scoring Hierarchy
    if (cards.length === 5) {
        if (maxValCount === 5) return { name: `Five of Rank ${dominantVal}`, score: 530000000 + (dominantVal * 100) + purityBonus, style: "color: #e879f9; font-weight: 900;", displayValue: 'Tier: Mythic' };
        if (isPureFlush) return { name: "Pure 5-Card Alliance", score: 520000000 + (highCardVal * 100) + purityBonus, style: "color: #fbbf24; font-weight: 900;", displayValue: 'Tier: Mythic' };
        if (hasAllegiance && isRun) return { name: `5-Card Coalition Series${purityTag}`, score: 510000000 + (highCardVal * 100) + purityBonus, style: "color: #fb923c; font-weight: bold;", displayValue: 'Tier: Legendary' };
        if (isRun) return { name: `5-Card Campaign Series${purityTag}`, score: 500000000 + (highCardVal * 100) + purityBonus, style: "color: #60a5fa; font-weight: bold;", displayValue: 'Tier: Epic' };
    }

    if (cards.length === 4) {
        if (maxValCount === 4) return { name: `Four of Rank ${dominantVal}${purityTag}`, score: 430000000 + (dominantVal * 100) + purityBonus, style: "color: #c084fc; font-weight: bold;", displayValue: 'Tier: Epic' };
        if (isPureFlush) return { name: "Pure 4-Card Alliance", score: 420000000 + (highCardVal * 100) + purityBonus, style: "color: #34d399;", displayValue: 'Tier: Rare' };
        if (hasAllegiance && isRun) return { name: `4-Card Coalition Series${purityTag}`, score: 410000000 + (highCardVal * 100) + purityBonus, style: "color: #a3e635;", displayValue: 'Tier: Rare' };
        if (isRun) return { name: `4-Card Campaign Series${purityTag}`, score: 400000000 + (highCardVal * 100) + purityBonus, style: "color: #22d3ee;", displayValue: 'Tier: Uncommon' };
    }

    if (cards.length === 3) {
        if (maxValCount === 3) return { name: `Three of Rank ${dominantVal}${purityTag}`, score: 330000000 + (dominantVal * 100) + purityBonus, style: "color: #fb7185;", displayValue: 'Tier: Rare' };
        if (isPureFlush) return { name: "Pure 3-Card Alliance", score: 320000000 + (highCardVal * 100) + purityBonus, style: "color: #6ee7b7;", displayValue: 'Tier: Uncommon' };
        if (hasAllegiance && isRun) return { name: `3-Card Coalition Series${purityTag}`, score: 310000000 + (highCardVal * 100) + purityBonus, style: "color: #bef264;", displayValue: 'Tier: Uncommon' };
        if (isRun) return { name: `3-Card Campaign Series${purityTag}`, score: 300000000 + (highCardVal * 100) + purityBonus, style: "color: #67e8f9;", displayValue: 'Tier: Common' };
    }

    if (cards.length === 2) {
        if (maxValCount === 2) return { name: `Pair of Rank ${dominantVal}${purityTag}`, score: 100000000 + (dominantVal * 100) + purityBonus, style: "color: #d6d3d1;", displayValue: 'Tier: Common' };
    }

    // --- Raw Skirmish Power ---
    let skirmishScore = 0;
    let skirmishName = "";
    let style = "color: #a8a29e;";

    if (cards.length === 1) {
        skirmishScore = cards[0].val;
        skirmishName = `Solo Force: Rank ${cards[0].val}`;
    } else if (isPureFlush) {
        const valsDesc = sortedCards.map(c => c.val).sort((a, b) => b - a);
        skirmishScore = valsDesc.reduce((acc, val) => Math.pow(acc, val));
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
        displayValue: `Power: ${skirmishScore.toLocaleString()}`
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
            status: 'ACTIVE'
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

        this.roundActivePlayers = this.players.map((_, i) => i);
        this.roundPlays = [];
        this.roundBet = 0;
        this.activePlayerId = 0;

        this.els.mainHud.style.display = 'flex';
        this.phase = 'TRANSITION';

        this.saveGlobalPlayers();
        this.renderTransition();
    }

    renderTransition() {
        const player = this.players[this.activePlayerId];
        this.updateHUD();
        this.updatePlayerPods();

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
                <div class="card-corner">${card.suit.symbol}</div>
                <div class="card-center">
                    <div class="card-suit-name">${card.suit.name}</div>
                    <div class="card-val">${card.val}</div>
                    <div class="card-align">${card.suit.align}</div>
                </div>
                <div class="card-corner bottom">${card.suit.symbol}</div>
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
        const maxBetAllowed = currentHandSize * BASE_BET_UNIT;

        let controlsHTML = '';

        if (isFirstPlayer) {
            this.setMessage(`Select cards to play and set the bet.`);
            for (let b = BASE_BET_UNIT; b <= maxBetAllowed; b += BASE_BET_UNIT) {
                const disabledStr = (this.selectedCardIndices.length === 0 || player.cash < b) ? 'disabled' : '';
                controlsHTML += `<button class="action-btn" ${disabledStr} onclick="game.executePlay(${b})">BET €${b}</button>`;
            }
            controlsHTML += `<button class="danger-btn" onclick="game.executeFold()">FOLD</button>`;
        } else {
            this.setMessage(`Match the bet, raise, or retreat.`);
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

        let need = player.hand.length;
        let drawn = [];

        this.discardPile.push(...player.hand);

        while (need > 0) {
            if (this.deck.length > 0) {
                drawn.push(this.deck.shift());
                need--;
            } else {
                this.deck = [...this.discardPile].sort(() => Math.random() - 0.5);
                this.discardPile = [];
                if (this.deck.length === 0) break;
            }
        }

        player.hand = drawn;
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
                if (this.roundActivePlayers.includes(checkId)) {
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

                let html = `
                    <div class="history-item" style="${isWinner ? 'background: rgba(212,175,55,0.1); border-left: 3px solid var(--gold); border-radius: 5px;' : ''}">
                        <div class="history-player" style="color: ${pObj.color.hex}">${pObj.name}</div>
                        <div class="history-play">
                            <div style="text-align: right; line-height: 1;">
                                <div style="${res.style}; font-size: 0.9rem;">${res.name}</div>
                                <div style="font-size: 0.6rem; color: #888;">${res.displayValue}</div>
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

        let allAvailableCards = [...this.deck, ...this.discardPile].sort(() => Math.random() - 0.5);

        this.players.forEach(p => {
            let need = targetHandSize - p.hand.length;
            let drawn = [];
            while (need > 0 && allAvailableCards.length > 0) {
                drawn.push(allAvailableCards.shift());
                need--;
            }
            p.hand = [...p.hand, ...drawn];
            p.status = 'ACTIVE';
        });

        this.currentRoundNum = nextRound;
        this.roundActivePlayers = this.players.map((_, i) => i);
        this.roundPlays = [];
        this.roundBet = 0;
        this.pot = 0;
        this.deck = allAvailableCards;
        this.discardPile = [];

        // Rotate dealer
        this.activePlayerId = (this.currentRoundNum - 1) % this.players.length;
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
            const isWinner = p.cash === topCash;
            html += `
                <div style="display: flex; flex-direction: column; align-items: center; ${isWinner ? 'transform: scale(1.1); color: var(--gold-bright);' : 'opacity: 0.6;'}">
                    <span style="font-size: 0.8rem; font-family: 'Playfair Display', serif;">#${idx + 1}</span>
                    <strong style="font-size: 1.5rem;">${p.name}</strong>
                    <span style="font-size: 2rem; font-family: 'Cinzel', serif;">€${p.cash}</span>
                </div>
            `;
        });

        html += `
                </div>
                <button class="primary-btn" style="margin-top: 20px;" onclick="window.location.reload()">RETURN TO BASE</button>
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
            const isActiveTurn = this.phase === 'PLAYING' && idx === this.activePlayerId;
            const isFolded = this.phase === 'PLAYING' && !this.roundActivePlayers.includes(idx);

            let actionStr = '';
            if (this.phase === 'PLAYING') {
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
            div.className = `player-status-pod ${isActiveTurn ? 'active-turn' : ''} ${isFolded ? 'folded' : ''}`;

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

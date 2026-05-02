// --- Constants & Data ---
const SUITS = {
    WEST_FRONTIER: { id: 'WEST_FRONTIER', name: 'Western Frontier', symbol: '<svg class="suit-icon" viewBox="0 0 100 100"><path d="M 45 22 L 45 35 Q 45 45 35 45 L 22 45 L 22 55 L 35 55 Q 45 55 45 65 L 45 78 L 55 78 L 55 65 Q 55 55 65 55 L 78 55 L 78 45 L 65 45 Q 55 45 55 35 L 55 22 Z"/><circle cx="50" cy="14" r="12"/><circle cx="39" cy="23" r="9"/><circle cx="61" cy="23" r="9"/><circle cx="50" cy="86" r="12"/><circle cx="39" cy="77" r="9"/><circle cx="61" cy="77" r="9"/><circle cx="14" cy="50" r="12"/><circle cx="23" cy="39" r="9"/><circle cx="23" cy="61" r="9"/><circle cx="86" cy="50" r="12"/><circle cx="77" cy="39" r="9"/><circle cx="77" cy="61" r="9"/></svg>', color: 'var(--west-frontier-text)', bg: 'var(--west-frontier-bg)', border: 'var(--west-frontier-border)', align: 'Union' },
    INDUST_EAST: { id: 'INDUST_EAST', name: 'Indust. East', symbol: '<svg class="suit-icon" viewBox="0 0 100 100"><path d="M 50 50 C 48 48, 35 40, 35 28 C 35 15, 45 10, 50 5 C 55 10, 65 15, 65 28 C 65 40, 52 48, 50 50 C 52 48, 60 35, 72 35 C 85 35, 90 45, 95 50 C 90 55, 85 65, 72 65 C 60 65, 52 52, 50 50 C 52 52, 65 60, 65 72 C 65 85, 55 90, 50 95 C 45 90, 35 85, 35 72 C 35 60, 48 52, 50 50 C 48 52, 40 65, 28 65 C 15 65, 10 55, 5 50 C 10 45, 15 35, 28 35 C 40 35, 48 48, 50 50 Z" fill="currentColor"/></svg>', color: 'var(--indust-east-text)', bg: 'var(--indust-east-bg)', border: 'var(--indust-east-border)', align: 'Union' },
    DEEP_SOUTH: { id: 'DEEP_SOUTH', name: 'Deep South', symbol: '<svg class="suit-icon" viewBox="0 0 100 100"><path d="M 50 18 C 60 8, 78 10, 78 25 C 78 40, 54 35, 54 50 C 54 65, 78 60, 78 75 C 78 90, 60 92, 50 82 C 40 92, 22 90, 22 75 C 22 60, 46 65, 46 50 C 46 35, 22 40, 22 25 C 22 10, 40 8, 50 18 Z" fill="currentColor"/></svg>', color: 'var(--deep-south-text)', bg: 'var(--deep-south-bg)', border: 'var(--deep-south-border)', align: 'Confederacy' },
    UPPER_SOUTH: { id: 'UPPER_SOUTH', name: 'Upper/Western South', symbol: '<svg class="suit-icon" viewBox="0 0 100 100"><path d="M 50 8 A 120 120 0 0 0 78 50 A 120 120 0 0 0 50 92 A 120 120 0 0 0 22 50 A 120 120 0 0 0 50 8 Z" fill="currentColor"/></svg>', color: 'var(--upper-south-text)', bg: 'var(--upper-south-bg)', border: 'var(--upper-south-border)', align: 'Confederacy' },
    BORDER: { id: 'BORDER', name: 'Border States', symbol: '<svg class="suit-icon" viewBox="0 0 100 100"><path d="M 50 12 L 61 31 L 83 31 L 72 50 L 83 69 L 61 69 L 50 88 L 39 69 L 17 69 L 28 50 L 17 31 L 39 31 Z" fill="currentColor"/><circle cx="50" cy="12" r="6" fill="currentColor"/><circle cx="83" cy="31" r="6" fill="currentColor"/><circle cx="83" cy="69" r="6" fill="currentColor"/><circle cx="50" cy="88" r="6" fill="currentColor"/><circle cx="17" cy="69" r="6" fill="currentColor"/><circle cx="17" cy="31" r="6" fill="currentColor"/></svg>', color: 'var(--border-text)', bg: 'var(--border-bg)', border: 'var(--border-border)', align: 'Neutral' }
};

const STATES = {
    ATLANTIC_CORRIDOR: [
        "Maine", "Vermont", "New Hampshire", "Massachusetts", "Rhode Island",
        "Connecticut", "New York", "New Jersey", "Delaware", "Maryland"
    ],
    PACIFIC_SUN: [
        "California", "Oregon", "Washington", "Hawaii", "Illinois",
        "Minnesota", "Colorado", "New Mexico", "Virginia", "Nevada"
    ],
    SOUTHERN_HEART: [
        "South Carolina", "Alabama", "Mississippi", "Louisiana", "Arkansas",
        "Tennessee", "Kentucky", "West Virginia", "Oklahoma", "Texas"
    ],
    GREAT_FRONTIER: [
        "Kansas", "Nebraska", "South Dakota", "North Dakota", "Montana",
        "Wyoming", "Idaho", "Utah", "Missouri", "Indiana"
    ],
    WILD_SWINGS: [
        "Pennsylvania", "Florida", "Ohio", "Michigan", "Wisconsin",
        "Georgia", "Arizona", "North Carolina", "Iowa", "Alaska"
    ]
};

const PRESIDENTS = {
    BLACK: [
        "washington", "adams-john", "jefferson", "madison", "monroe",
        "adams-quincy", "harrison-william", "tyler", "taylor", "fillmore"
    ],
    BLUE: [
        "jackson", "van-buren", "polk", "pierce", "buchanan",
        "johnson-andrew", "cleveland-1", "wilson", "roosevelt-franklin", "truman",
        "kennedy", "johnson-lyndon", "carter", "clinton", "obama", "biden"
    ],
    RED: [
        "lincoln", "grant", "hayes", "garfield", "arthur",
        "harrison-benjamin", "mckinley", "roosevelt-theodore", "taft", "harding",
        "coolidge", "hoover", "eisenhower", "nixon", "ford",
        "reagan", "bush-herbert", "bush-walker", "trump"
    ]
};

const BASE_BET_UNIT = 1;

// --- Helper Functions ---
function createDeck(edition = 'STANDARD') {
    let newDeck = [];
    Object.keys(SUITS).forEach(suitKey => {
        const suit = SUITS[suitKey];
        for (let val = 1; val <= 10; val++) {
            let presidentId = null;
            let stateName = null;
            if (edition === 'PRESIDENT') {
                if (suitKey === 'BORDER') {
                    presidentId = PRESIDENTS.BLACK[val - 1] || null;
                } else if (suitKey === 'WEST_FRONTIER') { // Spades (Row 1)
                    presidentId = PRESIDENTS.BLUE[val - 1] || null;
                } else if (suitKey === 'INDUST_EAST') { // Clubs (Row 4)
                    presidentId = PRESIDENTS.BLUE[10 + val - 1] || null;
                } else if (suitKey === 'DEEP_SOUTH') { // Hearts (Row 2)
                    presidentId = PRESIDENTS.RED[val - 1] || null;
                } else if (suitKey === 'UPPER_SOUTH') { // Diamonds (Row 3)
                    presidentId = PRESIDENTS.RED[10 + val - 1] || null;
                }
            } else if (edition === 'STATE') {
                if (suitKey === 'INDUST_EAST') {
                    stateName = STATES.ATLANTIC_CORRIDOR[val - 1] || null;
                } else if (suitKey === 'WEST_FRONTIER') {
                    stateName = STATES.PACIFIC_SUN[val - 1] || null;
                } else if (suitKey === 'DEEP_SOUTH') {
                    stateName = STATES.SOUTHERN_HEART[val - 1] || null;
                } else if (suitKey === 'UPPER_SOUTH') {
                    stateName = STATES.GREAT_FRONTIER[val - 1] || null;
                } else if (suitKey === 'BORDER') {
                    stateName = STATES.WILD_SWINGS[val - 1] || null;
                }
            }

            const president = presidentId ? presidentsData.find(p => p.id === presidentId) : null;
            const state = stateName ? getStateByName(stateName) : null;

            newDeck.push({
                id: `${suitKey}-${val}`,
                suit: suit,
                name: `Rank ${val}`,
                val: val,
                president: president ? president.name : null,
                state: stateName,
                portraitUrl: president ? president.portraitUrl : null,
                flagUrl: state ? state.flagUrl : null
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

    // Rank 1 Imitation: 1 imitates the highest card in the skirmish
    const maxVal = Math.max(...cards.map(c => c.val));
    const effectiveValues = cards.map(c => c.val === 1 ? maxVal : c.val);
    const hasOne = cards.some(c => c.val === 1 && maxVal > 1);

    if (cards.length === 1) {
        skirmishScore = cards[0].val;
        skirmishName = `Solo Force: Rank ${cards[0].val}`;
    } else if (isPureFlush) {
        skirmishScore = effectiveValues.reduce((acc, val) => acc * val, 1) * 2;
        skirmishName = `Pure Skirmish (${cards.length})${hasOne ? ' [Imitation]' : ''}`;
        style = "color: #10b981; font-weight: bold;";
    } else if (hasAllegiance) {
        skirmishScore = effectiveValues.reduce((acc, val) => acc * val, 1);
        skirmishName = `Coalition Skirmish (${cards.length})${purityTag}${hasOne ? ' [Imitation]' : ''}`;
        style = "color: #84cc16; font-weight: bold;";
    } else {
        skirmishScore = effectiveValues.reduce((acc, val) => acc + val, 0);
        skirmishName = `Divided Skirmish (${cards.length})${hasOne ? ' [Imitation]' : ''}`;
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
        this.currentGame = 'FRONTIER';

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
            mulliganBtn: document.getElementById('mulligan-btn'),
            menuDropdown: document.getElementById('frontier-menu-dropdown'),
            allCardsModal: document.getElementById('all-cards-modal'),
            allCardsGrid: document.getElementById('all-cards-grid'),
            rulesInnerWrapper: document.getElementById('rules-inner-content-wrapper')
        };

        this.edition = 'STANDARD'; // 'STANDARD' or 'PRESIDENT'
        this.currentGame = 'FRONTIER'; // 'FRONTIER', 'STATE_QUIZ', 'PRESIDENT_QUIZ'

        // this.loadGlobalPlayers(); // Removed as we now use showSetup()

        // window.addEventListener('keydown', (e) => { ... }) // Removed to consolidate in app.js


        window.addEventListener('click', (e) => {
            // Close modals if backdrop (the .modal shell) is clicked
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }

            // Close menu dropdown if clicking outside
            if (this.els.menuDropdown.classList.contains('active')) {
                const isMenuBtn = document.getElementById('frontier-menu-btn').contains(e.target);
                const isInsideMenu = this.els.menuDropdown.contains(e.target);
                if (!isMenuBtn && !isInsideMenu) {
                    this.els.menuDropdown.classList.remove('active');
                }
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.code === 'Space') {
                if (this.phase === 'TRANSITION') {
                    const overlayBtn = document.getElementById('overlay-main-btn');
                    if (overlayBtn && overlayBtn.style.display !== 'none') {
                        e.preventDefault();
                        this.startTurn();
                    }
                } else if (this.phase === 'PLAYING' && (this.edition === 'PRESIDENT' || this.edition === 'STATE')) {
                    e.preventDefault();
                    this.toggleProfilePanel();
                }
            }
        });
    }

    closeAllModals() {
        this.els.rulesModal.classList.remove('visible');
        this.els.allCardsModal.classList.remove('visible');
        this.els.menuDropdown.classList.remove('active');
    }

    /* loadGlobalPlayers & saveGlobalPlayers removed (absorbed into initGame) */

    toggleRules() {
        this.updateRulesContent();
        this.els.rulesModal.classList.toggle('visible');
        this.els.menuDropdown.classList.remove('active');
    }

    updateRulesContent() {
        if (!this.els.rulesInnerWrapper) return;
        
        if (this.currentGame === 'PRESIDENT_QUIZ') {
            this.els.rulesInnerWrapper.innerHTML = `
                <button class="modal-close" onclick="frontierGame.toggleRules()">&times;</button>
                <h2 style="font-size: 2rem; color: var(--gold); margin-bottom: 20px;">President Quiz Rulebook</h2>
                <div id="rules-inner-content" style="text-align: left; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #ccc;">
                    <h3 style="color: var(--gold-bright); margin-top: 2rem;">1. Objective</h3>
                    <p>Identify the years during which each President served in office.</p>
                    
                    <h3 style="color: var(--gold-bright); margin-top: 2rem;">2. The Deck (50 Cards)</h3>
                    <p>The game uses the <strong>President Edition</strong> of American Playing Cards, featuring the Presidents of the United States.</p>

                    <h3 style="color: var(--gold-bright); margin-top: 2rem;">3. Round Structure</h3>
                    <p>The game lasts <strong>5 Rounds</strong>. Each round follows this sequence:</p>
                    <ol>
                        <li><strong>Ante:</strong> Every player contributes $2 to the Pot at the start of the round.</li>
                        <li><strong>Reveal:</strong> A President card is revealed to all players.</li>
                        <li><strong>Guessing:</strong> Players use the keypad to log their guess (a specific year).</li>
                        <li><strong>Confidentiality:</strong> To ensure fair play, your guess is hidden after entry.</li>
                    </ol>

                    <h3 style="color: var(--gold-bright); margin-top: 2rem;">4. Scoring & Victory</h3>
                    <p>After all players have guessed, the President's tenure is revealed.</p>
                    <ul style="list-style: none; padding: 0;">
                        <li><strong>Correct Year:</strong> Any year that falls within the President's actual tenure is considered a direct hit!</li>
                        <li><strong>Distance:</strong> If no one guesses a year within the tenure, the player(s) closest to the tenure (either before start or after end) win.</li>
                    </ul>
                    <p>The player(s) with the <strong>best guess</strong> win the entire Pot. If multiple players are equally close or correct, the Pot is split.</p>
                    <p>The ultimate winner is the player with the <strong>most wins</strong> after 5 rounds.</p>
                    
                    <p style="text-align: center; margin-top: 3rem; font-size: 0.7rem; opacity: 0.5; letter-spacing: 2px;">DESIGN: SIMON ALLMER</p>
                </div>
            `;
        } else if (this.currentGame === 'STATE_QUIZ') {
            this.els.rulesInnerWrapper.innerHTML = `
                <button class="modal-close" onclick="frontierGame.toggleRules()">&times;</button>
                <h2 style="font-size: 2rem; color: var(--gold); margin-bottom: 20px;">The State Quiz Rulebook</h2>
                <div id="rules-inner-content" style="text-align: left; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #ccc;">
                    <h3 style="color: var(--gold-bright); margin-top: 2rem;">1. Objective</h3>
                    <p>Test your knowledge of the Union by identifying the location of each state on the US map.</p>
                    
                    <h3 style="color: var(--gold-bright); margin-top: 2rem;">2. The Deck (50 Cards)</h3>
                    <p>The game uses the <strong>State Edition</strong> of American Playing Cards, featuring all 50 states of the Union.</p>

                    <h3 style="color: var(--gold-bright); margin-top: 2rem;">3. Round Structure</h3>
                    <p>The game lasts <strong>5 Rounds</strong>. Each round follows this sequence:</p>
                    <ol>
                        <li><strong>Ante:</strong> Every player contributes $2 to the Pot at the start of the round.</li>
                        <li><strong>Reveal:</strong> A target state is revealed to all players.</li>
                        <li><strong>Guessing:</strong> Players take turns clicking on the map to place their pin.</li>
                        <li><strong>Blind Mechanic:</strong> To ensure fair play in local multiplayer, each player's pin is visible for only <strong>2 seconds</strong> before disappearing.</li>
                    </ol>

                    <h3 style="color: var(--gold-bright); margin-top: 2rem;">4. Scoring & Victory</h3>
                    <p>After all players have guessed, the true location is revealed.</p>
                    <ul style="list-style: none; padding: 0;">
                        <li><strong>Distance 0:</strong> Perfect guess! You are on the target state.</li>
                        <li><strong>Distance 1:</strong> You clicked a state that borders the target.</li>
                        <li><strong>Distance 2+:</strong> You are multiple borders away from the target.</li>
                    </ul>
                    <p>The player(s) with the <strong>closest guess</strong> (minimum distance) win the entire Pot. If multiple players are equally close, the Pot is split.</p>
                    <p>The ultimate winner is the player with the <strong>most wins</strong> after 5 rounds.</p>
                    
                    <p style="text-align: center; margin-top: 3rem; font-size: 0.7rem; opacity: 0.5; letter-spacing: 2px;">DESIGN: SIMON ALLMER</p>
                </div>
            `;
        } else {
            this.els.rulesInnerWrapper.innerHTML = `
                <button class="modal-close" onclick="frontierGame.toggleRules()">&times;</button>
                <h2 style="font-size: 2rem; color: var(--gold); margin-bottom: 20px;">The Frontier Rulebook</h2>
                <div id="rules-inner-content" style="text-align: left; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #ccc;">
                    <h3 style="color: var(--gold-bright); margin-top: 2rem;">1. The Deck (50 Cards)</h3>
                    <p>There are 5 categories, each containing 10 cards numbered 1 through 10:</p>
                    <ul style="list-style: none; padding: 0;">
                        <li><span style="color: var(--deep-south-border)"><svg class="suit-icon" viewBox="0 0 100 100"><path d="M 50 95 Q 5 65 5 40 A 25 25 0 0 1 50 25 A 25 25 0 0 1 95 40 Q 95 65 50 95 Z" fill="currentColor"/></svg></span> & <span style="color: var(--upper-south-border)"><svg class="suit-icon" viewBox="0 0 100 100"><path d="M 50 5 A 60 60 0 0 0 95 50 A 60 60 0 0 0 50 95 A 60 60 0 0 0 5 50 A 60 60 0 0 0 50 5 Z" fill="currentColor"/></svg></span> (Red Alliance)</li>
                        <li><span style="color: var(--indust-east-border)"><svg class="suit-icon" viewBox="0 0 100 100"><path d="M 50 95 C 40 80, 2 50, 10 25 A 30 30 0 0 0 50 8 A 30 30 0 0 0 90 25 C 98 50, 60 80, 50 95 Z" fill="currentColor"/></svg></span> & <span style="color: var(--west-frontier-border)"><svg class="suit-icon" viewBox="0 0 100 100"><path d="M 45 22 L 45 35 Q 45 45 35 45 L 22 45 L 22 55 L 35 55 Q 45 55 45 65 L 45 78 L 55 78 L 55 65 Q 55 55 65 55 L 78 55 L 78 45 L 65 45 Q 55 45 55 35 L 55 22 Z"/><circle cx="50" cy="14" r="12"/><circle cx="39" cy="23" r="9"/><circle cx="61" cy="23" r="9"/><circle cx="50" cy="86" r="12"/><circle cx="39" cy="77" r="9"/><circle cx="61" cy="77" r="9"/><circle cx="14" cy="50" r="12"/><circle cx="23" cy="39" r="9"/><circle cx="23" cy="61" r="9"/><circle cx="86" cy="50" r="12"/><circle cx="77" cy="39" r="9"/><circle cx="77" cy="61" r="9"/></svg></span> (Blue Alliance)</li>
                        <li><span style="color: var(--border-border)"><svg class="suit-icon" viewBox="0 0 100 100"><path d="M 50 12 L 61 31 L 83 31 L 72 50 L 83 69 L 61 69 L 50 88 L 39 69 L 17 69 L 28 50 L 17 31 L 39 31 Z" fill="currentColor"/><circle cx="50" cy="12" r="8" fill="currentColor"/><circle cx="83" cy="31" r="8" fill="currentColor"/><circle cx="83" cy="69" r="8" fill="currentColor"/><circle cx="50" cy="88" r="8" fill="currentColor"/><circle cx="17" cy="69" r="8" fill="currentColor"/><circle cx="17" cy="31" r="8" fill="currentColor"/></svg></span> (Wildcards)</li>
                    </ul>

                    <h3 style="color: var(--gold-bright); margin-top: 2rem;">2. Round Structure</h3>
                    <p>The game lasts <strong>5 Rounds</strong>. Hand capacity scales up by 1 card each round.</p>
                    <ol>
                        <li><strong>Turns:</strong> Players TAKE TURNS to bet. You must CALL (match), RAISE (increase), or FOLD.</li>
                        <li><strong>Resolution:</strong> After the last turn, the best hand takes the Pot.</li>
                        <li><strong>Discard & Draw:</strong> After each round, played cards are discarded. You keep your unplayed hand and draw cards to reach your capacity.</li>
                    </ol>

                    <h3 style="color: var(--gold-bright); margin-top: 2rem;">3. Victory & Tie-Breakers</h3>
                    <p>The winner is the player with the <strong>Most Cash</strong> at the end of Round 5!</p>
                    <p><strong>Split Pots:</strong> If two or more commanders deploy hands of identical strength, the Pot is divided equally. Any remaining coin ($1) is awarded to the first tied commander in the turn order.</p>
                    
                    <p><strong>Hierarchy (Superior Volume Prevails):</strong> A configuration deploying a greater number of cards universally overcomes one deploying fewer.</p>
                    <ul style="background: rgba(255,255,255,0.03); padding: 20px; border: 1px solid #333; list-style: none; font-size: 0.85rem;">
                        <li><strong style="color: #e879f9;">Tier 1:</strong> 5 of a Rank, Pure Suit, Coalition (Alliance), or Campaign (Sequence)</li>
                        <li><strong style="color: #fb923c;">Tier 2:</strong> 4 of a Rank, Pure, Coalition, or Campaign</li>
                        <li><strong style="color: #c084fc;">Tier 3:</strong> 3 of a Rank, Pure, Coalition, or Campaign</li>
                        <li><strong style="color: #34d399;">Tier 4:</strong> Pairs</li>
                        <li><strong style="color: #a3e635;">Tier 5 (Skirmishes):</strong> Unmatched cards. Pure (Product x 2), Coalition (Product), Divided (Sum). <strong>Rank 1</strong> imitates the highest card in the hand.</li>
                    </ul>
                    <p style="text-align: center; margin-top: 3rem; font-size: 0.7rem; opacity: 0.5; letter-spacing: 2px;">DESIGN: SIMON ALLMER</p>
                </div>
            `;
        }
    }

    getOrdinalSuffix(n) {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    }

    toggleMenu() {
        this.els.menuDropdown.classList.toggle('active');
    }

    showRules() {
        this.toggleRules();
    }

    showAllCards() {
        this.els.menuDropdown.classList.remove('active');
        this.els.allCardsGrid.innerHTML = '';
        
        // Generate all 50 cards
        Object.keys(SUITS).forEach(suitKey => {
            const suit = SUITS[suitKey];
            for (let val = 1; val <= 10; val++) {
                let presidentId = null;
                let stateName = null;
                if (this.edition === 'PRESIDENT') {
                    if (suitKey === 'BORDER') {
                        presidentId = PRESIDENTS.BLACK[val - 1] || null;
                    } else if (suitKey === 'WEST_FRONTIER') { // Spades
                        presidentId = PRESIDENTS.BLUE[val - 1] || null;
                    } else if (suitKey === 'INDUST_EAST') { // Clubs
                        presidentId = PRESIDENTS.BLUE[10 + val - 1] || null;
                    } else if (suitKey === 'DEEP_SOUTH') { // Hearts
                        presidentId = PRESIDENTS.RED[val - 1] || null;
                    } else if (suitKey === 'UPPER_SOUTH') { // Diamonds
                        presidentId = PRESIDENTS.RED[10 + val - 1] || null;
                    }
                } else if (this.edition === 'STATE') {
                    if (suitKey === 'INDUST_EAST') {
                        stateName = STATES.ATLANTIC_CORRIDOR[val - 1] || null;
                    } else if (suitKey === 'WEST_FRONTIER') {
                        stateName = STATES.PACIFIC_SUN[val - 1] || null;
                    } else if (suitKey === 'DEEP_SOUTH') {
                        stateName = STATES.SOUTHERN_HEART[val - 1] || null;
                    } else if (suitKey === 'UPPER_SOUTH') {
                        stateName = STATES.GREAT_FRONTIER[val - 1] || null;
                    } else if (suitKey === 'BORDER') {
                        stateName = STATES.WILD_SWINGS[val - 1] || null;
                    }
                }

                const president = presidentId ? presidentsData.find(p => p.id === presidentId) : null;
                const state = stateName ? getStateByName(stateName) : null;
                const card = { suit, val, president: president ? president.name : "?", state: stateName, portraitUrl: president ? president.portraitUrl : null, flagUrl: state ? state.flagUrl : null };
                const div = document.createElement('div');
                div.className = `card suit-${card.suit.id}`;
if (this.edition === 'PRESIDENT' || this.edition === 'STATE') div.classList.add('is-president-edition');
            if (this.edition === 'STATE') div.classList.add('is-state-edition');
            div.style.width = "90px";
            div.style.height = "135px";
            div.style.fontSize = "0.7rem";
            div.style.cursor = "default";
            
            if (this.edition === 'PRESIDENT' || this.edition === 'STATE') {
                    const dispText = this.edition === 'PRESIDENT' ? (card.president || "") : (card.state || "");
                    const imageUrl = this.edition === 'PRESIDENT' ? card.portraitUrl : card.flagUrl;
                    div.innerHTML = `
                        <div class="card-corner">
                            <div class="corner-val">${card.val}</div>
                            <div class="corner-suit">${card.suit.symbol}</div>
                        </div>
                        <div class="card-center">
                            <div class="card-portrait-container">
                                ${imageUrl ? `<img src="${imageUrl}" class="card-portrait" alt="${dispText}">` : ''}
                            </div>
                            <div class="card-president-name">${dispText}</div>
                        </div>
                        <div class="card-corner bottom">
                            <div class="corner-val">${card.val}</div>
                            <div class="corner-suit">${card.suit.symbol}</div>
                        </div>
                    `;
                } else {
                    div.innerHTML = `
                        <div class="card-corner">${card.val}</div>
                        <div class="card-center">
                            <div class="card-val">${card.suit.symbol}</div>
                        </div>
                        <div class="card-corner bottom">${card.val}</div>
                    `;
                }
                this.els.allCardsGrid.appendChild(div);
            }
        });
        
        this.els.allCardsModal.classList.add('visible');
    }

    hideAllCards() {
        this.els.allCardsModal.classList.remove('visible');
    }

    setMessage(msg) {
        this.els.msgArea.innerHTML = msg;
    }

    showSetup() {
        this.els.mainHud.style.display = 'none';
        this.els.playerStatusGrid.innerHTML = '';
        this.els.cardsContainer.innerHTML = '';
        this.els.controlsArea.innerHTML = '';
        this.els.mulliganBtn.style.display = 'none';

        // Close and clear profile panel if open
        const panel = document.getElementById('president-profile-panel');
        if (panel) {
            panel.classList.remove('visible');
            const panelContent = document.getElementById('profile-content');
            if (panelContent) panelContent.innerHTML = '<div class="profile-placeholder">Select a Card to view Profile</div>';
            
            const svgs = panel.querySelectorAll('.panel-close svg');
            svgs.forEach(svg => svg.style.stroke = 'var(--gold-dim)');
            
            const fab = document.querySelector('.panel-toggle-fab');
            if (fab) fab.style.display = 'none'; // Only show fab when game starts
        }

        this.els.overlayTitle.innerText = "AMERICAN PLAYING CARDS";
        this.els.overlayTitle.style.color = "var(--gold-bright)";
        this.els.overlayDesc.innerHTML = "A New System for the Frontier.";

        const actions = document.getElementById('overlay-actions');
        actions.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.id = "setup-wrapper";
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '20px';
        
        const gameRow = document.createElement('div');
        gameRow.style.display = 'flex';
        gameRow.style.flexDirection = 'column';
        gameRow.style.alignItems = 'center';
        gameRow.style.gap = '10px';
        gameRow.style.marginBottom = '20px';

        const gameLabel = document.createElement('div');
        gameLabel.innerText = "GAME";
        gameLabel.style.fontSize = "0.7rem";
        gameLabel.style.color = "var(--gold-dim)";
        gameLabel.style.letterSpacing = "2px";
        gameRow.appendChild(gameLabel);

        const gameToggle = document.createElement('div');
        gameToggle.className = 'toggle-container';
        gameToggle.style.width = '100%';
        gameToggle.style.maxWidth = '600px';

        const frontierBtn = document.createElement('button');
        frontierBtn.className = `toggle-btn ${this.currentGame === 'FRONTIER' ? 'active' : ''}`;
        frontierBtn.innerText = 'Frontier';

        const quizBtn = document.createElement('button');
        quizBtn.className = `toggle-btn ${this.currentGame === 'STATE_QUIZ' ? 'active' : ''}`;
        quizBtn.innerText = 'State Quiz';

        const presQuizBtn = document.createElement('button');
        presQuizBtn.className = `toggle-btn ${this.currentGame === 'PRESIDENT_QUIZ' ? 'active' : ''}`;
        presQuizBtn.innerText = 'President Quiz';

        const cowboyBtn = document.createElement('button');
        cowboyBtn.className = 'toggle-btn';
        cowboyBtn.innerText = 'Cowboy (TBA)';
        cowboyBtn.style.opacity = '0.4';
        cowboyBtn.style.cursor = 'not-allowed';
        cowboyBtn.disabled = true;

        frontierBtn.onclick = () => {
            this.currentGame = 'FRONTIER';
            frontierBtn.classList.add('active');
            quizBtn.classList.remove('active');
            presQuizBtn.classList.remove('active');
            stdBtn.disabled = false;
            presBtn.disabled = false;
            stateBtn.disabled = false;
            stdBtn.style.opacity = '1';
            presBtn.style.opacity = '1';
            stateBtn.style.opacity = '1';
        };

        quizBtn.onclick = () => {
            this.currentGame = 'STATE_QUIZ';
            quizBtn.classList.add('active');
            frontierBtn.classList.remove('active');
            presQuizBtn.classList.remove('active');
            // Lock in State Edition
            stateBtn.disabled = false;
            stateBtn.style.opacity = '1';
            this.edition = 'STATE';
            stateBtn.click();
            stdBtn.disabled = true;
            presBtn.disabled = true;
            stdBtn.style.opacity = '0.5';
            presBtn.style.opacity = '0.5';
        };

        presQuizBtn.onclick = () => {
            this.currentGame = 'PRESIDENT_QUIZ';
            presQuizBtn.classList.add('active');
            frontierBtn.classList.remove('active');
            quizBtn.classList.remove('active');
            // Lock in President Edition
            presBtn.disabled = false;
            presBtn.style.opacity = '1';
            this.edition = 'PRESIDENT';
            presBtn.click();
            stdBtn.disabled = true;
            stateBtn.disabled = true;
            stdBtn.style.opacity = '0.5';
            stateBtn.style.opacity = '0.5';
        };

        gameToggle.appendChild(frontierBtn);
        gameToggle.appendChild(presQuizBtn);
        gameToggle.appendChild(quizBtn);
        gameToggle.appendChild(cowboyBtn);
        gameRow.appendChild(gameToggle);

        const editionRow = document.createElement('div');
        editionRow.style.display = 'flex';
        editionRow.style.flexDirection = 'column';
        editionRow.style.alignItems = 'center';
        editionRow.style.gap = '10px';
        editionRow.style.marginBottom = '20px';

        const editionLabel = document.createElement('div');
        editionLabel.innerText = "EDITION";
        editionLabel.style.fontSize = "0.7rem";
        editionLabel.style.color = "var(--gold-dim)";
        editionLabel.style.letterSpacing = "2px";
        editionRow.appendChild(editionLabel);

        const editionToggle = document.createElement('div');
        editionToggle.className = 'toggle-container';
        editionToggle.style.width = '100%';
        editionToggle.style.maxWidth = '450px';

        const stdBtn = document.createElement('button');
        stdBtn.className = `toggle-btn ${this.edition === 'STANDARD' ? 'active' : ''}`;
        stdBtn.innerText = 'Standard';
        
        const presBtn = document.createElement('button');
        presBtn.className = `toggle-btn ${this.edition === 'PRESIDENT' ? 'active' : ''}`;
        presBtn.innerText = 'President';
        
        const stateBtn = document.createElement('button');
        stateBtn.className = `toggle-btn ${this.edition === 'STATE' ? 'active' : ''}`;
        stateBtn.innerText = 'State';

        stdBtn.onclick = () => {
            this.edition = 'STANDARD';
            stdBtn.classList.add('active');
            presBtn.classList.remove('active');
            stateBtn.classList.remove('active');
        };

        presBtn.onclick = () => {
            this.edition = 'PRESIDENT';
            presBtn.classList.add('active');
            stdBtn.classList.remove('active');
            stateBtn.classList.remove('active');
        };

        stateBtn.onclick = () => {
            this.edition = 'STATE';
            stateBtn.classList.add('active');
            stdBtn.classList.remove('active');
            presBtn.classList.remove('active');
        };

        editionToggle.appendChild(stdBtn);
        editionToggle.appendChild(presBtn);
        editionToggle.appendChild(stateBtn);
        editionRow.appendChild(editionToggle);

        const countLabel = document.createElement('div');
        countLabel.innerText = "PLAYER COUNT";
        countLabel.style.fontSize = "0.7rem";
        countLabel.style.color = "var(--gold-dim)";
        countLabel.style.letterSpacing = "2px";
        countLabel.style.marginTop = "10px";

        const countRow = document.createElement('div');
        countRow.id = 'count-row';
        countRow.style.display = 'flex';
        countRow.style.gap = '10px';
        countRow.style.flexWrap = 'wrap';
        countRow.style.justifyContent = 'center';
        
        [2, 3, 4, 5, 6].forEach(count => {
            const btn = document.createElement('button');
            btn.className = "primary-btn count-btn";
            btn.style.padding = "10px 20px";
            btn.style.minWidth = "60px";
            btn.innerText = count;
            btn.onclick = () => {
                document.querySelectorAll('.count-btn').forEach(b => b.style.background = 'transparent');
                btn.style.background = 'rgba(255,255,255,0.2)';
                this.preparePlayerNames(count);
            };
            countRow.appendChild(btn);
        });
        
        const namesWrapper = document.createElement('div');
        namesWrapper.id = "names-wrapper";
        namesWrapper.style.width = '100%';
        namesWrapper.style.display = 'flex';
        namesWrapper.style.flexDirection = 'column';
        namesWrapper.style.alignItems = 'center';
        namesWrapper.style.marginTop = '10px';

        const beginBtnWrapper = document.createElement('div');
        beginBtnWrapper.id = "begin-btn-wrapper";
        beginBtnWrapper.style.width = '100%';
        beginBtnWrapper.style.display = 'flex';
        beginBtnWrapper.style.justifyContent = 'center';
        
        const rulesBtn = document.createElement('div');
        rulesBtn.innerText = "RULES";
        rulesBtn.style.color = "var(--gold)";
        rulesBtn.style.letterSpacing = "4px";
        rulesBtn.style.fontSize = "0.9rem";
        rulesBtn.style.cursor = "pointer";
        rulesBtn.style.marginTop = "20px";
        rulesBtn.style.borderBottom = "1px solid rgba(212, 175, 55, 0.3)";
        rulesBtn.style.paddingBottom = "5px";
        rulesBtn.style.transition = "color 0.3s";
        rulesBtn.onmouseover = () => rulesBtn.style.color = "var(--gold-bright)";
        rulesBtn.onmouseout = () => rulesBtn.style.color = "var(--gold)";
        rulesBtn.onclick = () => this.showRules();

        const credit = document.createElement('div');
        credit.innerText = "GAME DESIGN: SIMON ALLMER";
        credit.style.color = "var(--text-color)";
        credit.style.fontSize = "0.6rem";
        credit.style.opacity = "0.4";
        credit.style.letterSpacing = "2px";
        credit.style.marginTop = "30px";
        
        wrapper.appendChild(gameRow);
        wrapper.appendChild(editionRow);
        wrapper.appendChild(countLabel);
        wrapper.appendChild(countRow);
        wrapper.appendChild(namesWrapper);
        wrapper.appendChild(beginBtnWrapper);
        wrapper.appendChild(rulesBtn);
        wrapper.appendChild(credit);
        actions.appendChild(wrapper);

        this.els.overlay.classList.add('visible');
        document.getElementById('overlay-main-btn').style.display = 'none';
        
        // Default to 2 players
        setTimeout(() => {
            if (countRow.children[0]) countRow.children[0].click();
        }, 10);
    }

    preparePlayerNames(count) {
        // No longer change the overlayDesc because the title is static above
        const namesWrapper = document.getElementById('names-wrapper');
        if (!namesWrapper) return;
        namesWrapper.innerHTML = '';
        
        const namesContainer = document.createElement('div');
        namesContainer.style.display = 'flex';
        namesContainer.style.flexDirection = 'column';
        namesContainer.style.gap = '20px';
        namesContainer.style.width = '90%';
        namesContainer.style.maxWidth = '300px';

        const colors = ['#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4'];
        const playerConfigs = [];

        for (let i = 0; i < count; i++) {
            const playerGroup = document.createElement('div');
            playerGroup.style.display = 'flex';
            playerGroup.style.flexDirection = 'column';
            playerGroup.style.gap = '6px';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'frontier-input is-default';
            const defaultName = `Player ${i + 1}`;
            input.value = defaultName;
            input.dataset.isDefault = 'true';
            input.style.borderLeft = `4px solid ${colors[i]}`;
            
            const config = { isAI: false, input: input };
            playerConfigs.push(config);

            input.onfocus = () => {
                if (input.dataset.isDefault === 'true') {
                    setTimeout(() => input.setSelectionRange(0, 0), 0);
                }
            };

            input.onkeydown = (e) => {
                if (input.dataset.isDefault === 'true' && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    input.value = '';
                    input.dataset.isDefault = 'false';
                    input.classList.remove('is-default');
                }
            };

            input.onblur = () => {
                if (input.value.trim() === '') {
                    this.updateAIPresence(playerConfigs);
                }
            };

            playerGroup.appendChild(input);

            // AI Toggle for players 2+
            if (i > 0) {
                const toggle = document.createElement('div');
                toggle.className = 'toggle-container';
                
                const humanBtn = document.createElement('button');
                humanBtn.className = 'toggle-btn active';
                humanBtn.innerText = 'Human';
                
                const aiBtn = document.createElement('button');
                aiBtn.className = 'toggle-btn';
                aiBtn.innerText = 'Computer';
                
                humanBtn.onclick = () => {
                    config.isAI = false;
                    humanBtn.classList.add('active');
                    aiBtn.classList.remove('active');
                    this.updateAIPresence(playerConfigs);
                };
                
                aiBtn.onclick = () => {
                    config.isAI = true;
                    aiBtn.classList.add('active');
                    humanBtn.classList.remove('active');
                    this.updateAIPresence(playerConfigs);
                };
                
                toggle.appendChild(humanBtn);
                toggle.appendChild(aiBtn);
                playerGroup.appendChild(toggle);
            }

            namesContainer.appendChild(playerGroup);
        }

        namesWrapper.appendChild(namesContainer);

        const beginBtnWrapper = document.getElementById('begin-btn-wrapper');
        if (!beginBtnWrapper) return;
        beginBtnWrapper.innerHTML = '';

        const beginBtn = document.createElement('button');
        beginBtn.className = "primary-btn";
        beginBtn.style.marginTop = "20px";
        beginBtn.style.padding = "15px 40px";
        beginBtn.innerText = "BEGIN GAME";
            beginBtn.onclick = () => {
                const finalPlayers = playerConfigs.map(c => ({
                    name: c.input.value.trim(),
                    isAI: c.isAI
                }));
                if (this.currentGame === 'STATE_QUIZ') {
                    this.els.overlay.classList.remove('visible');
                    location.hash = '#state-quiz';
                    stateQuiz.initGame(finalPlayers);
                } else if (this.currentGame === 'PRESIDENT_QUIZ') {
                    this.els.overlay.classList.remove('visible');
                    location.hash = '#president-quiz';
                    presidentQuiz.initGame(finalPlayers);
                } else {
                    this.initGame(count, finalPlayers);
                }
            };
        beginBtnWrapper.appendChild(beginBtn);
    }

    updateAIPresence(configs) {
        let aiCount = 0;
        configs.forEach((c, idx) => {
            const currentVal = c.input.value.trim();
            // A name is "default" if it's empty, "Player X", or "Computer X"
            const isDefault = currentVal === '' || currentVal === `Player ${idx + 1}` || /^Computer \d+$/.test(currentVal);
            
            if (c.isAI) {
                aiCount++;
                if (isDefault) {
                    c.input.value = `Computer ${aiCount}`;
                    c.input.dataset.isDefault = 'false';
                    c.input.classList.remove('is-default');
                }
            } else {
                // If it was an auto-generated Computer name, revert to Player default
                if (/^Computer \d+$/.test(currentVal) || currentVal === '') {
                    c.input.value = `Player ${idx + 1}`;
                    c.input.dataset.isDefault = 'true';
                    c.input.classList.add('is-default');
                }
            }
        });
    }

    initGame(playerCount, customPlayerConfigs) {
        if (playerCount === undefined) {
            playerCount = this.lastPlayerCount || 2;
        }
        this.lastPlayerCount = playerCount;

        const mainBtn = document.getElementById('overlay-main-btn');
        if (mainBtn) mainBtn.style.display = 'block';
        
        const actions = document.getElementById('overlay-actions');
        if (actions) actions.innerHTML = '';
        
        this.els.overlay.classList.remove('visible');

        const colors = ['#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4'];

        this.players = [];
        for (let i = 0; i < playerCount; i++) {
            const config = (customPlayerConfigs && customPlayerConfigs[i]) ? customPlayerConfigs[i] : { name: `Player ${i+1}`, isAI: false };
            this.players.push({
                globalId: i + 1,
                name: config.name,
                isAI: config.isAI,
                cash: 10,
                color: { hex: colors[i] },
                hand: [],
                canMulligan: true,
                status: 'ACTIVE'
            });
        }

        if (this.players.length < 2) {
            alert("Need at least 2 players to play Frontier!");
            return;
        }

        this.deck = createDeck(this.edition);
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
        this.activePlayerId = 0;
        while (this.players[this.activePlayerId].status === 'BANKRUPT') {
            this.activePlayerId = (this.activePlayerId + 1) % this.players.length;
        }

        this.els.mainHud.style.display = 'flex';
        this.phase = 'TRANSITION';

        // Removed obsolete save call
        this.renderTransition();
    }

    renderTransition() {
        if (this.players[this.activePlayerId].status === 'BANKRUPT') {
            this.advanceRound();
            return;
        }
        const player = this.players[this.activePlayerId];
        this.updateHUD();
        this.updatePlayerPods();

        this.els.cardsContainer.innerHTML = '';
        this.els.controlsArea.innerHTML = '';
        this.els.controlsArea.style.display = 'none';
        this.els.historyPanel.style.display = 'none';
        this.els.mulliganBtn.style.display = 'none';

        if (player.isAI) {
            this.executeAITurn();
            return;
        }

        this.els.overlayTitle.innerText = `PASS TO ${player.name.toUpperCase()}`;
        this.els.overlayTitle.style.color = player.color.hex || 'var(--gold)';
        this.els.overlayDesc.innerText = `When ready, click below to reveal Round ${this.currentRoundNum} hand.`;

        const btn = document.getElementById('overlay-main-btn');
        btn.style.display = 'block';
        btn.innerText = "REVEAL CARDS";
        btn.onclick = () => this.startTurn();

        this.els.overlay.classList.add('visible');
        this.setMessage("");
    }

    executeAITurn() {
        const player = this.players[this.activePlayerId];
        this.els.overlayTitle.innerText = `${player.name.toUpperCase()} IS THINKING...`;
        this.els.overlayTitle.style.color = player.color.hex;
        this.els.overlayDesc.innerText = "Analyzing current tactical landscape...";
        this.els.overlay.classList.add('visible');
        document.getElementById('overlay-main-btn').style.display = 'none';

        // Phase 1: Analyzing Hand
        setTimeout(() => {
            this.els.overlayDesc.innerText = "Evaluating hand strength and alliance potential...";
            
            setTimeout(() => {
                // Phase 2: Selecting Cards
                const bestSelection = this.getAISelection(player);
                this.selectedCardIndices = bestSelection.indices;
                this.els.overlayDesc.innerText = `Selecting ${bestSelection.indices.length} card${bestSelection.indices.length > 1 ? 's' : ''} for the engagement...`;

                setTimeout(() => {
                    // Phase 3: Deciding Action
                    const isFirstPlayer = this.roundPlays.length === 0;
                    const decision = this.getAIBettingDecision(player, bestSelection.eval);
                    
                    let actionMsg = "";
                    let type = "";
                    if (decision.action === 'FOLD') {
                        actionMsg = "Decided to retreat from the current round.";
                        type = "Folds";
                    } else {
                        type = isFirstPlayer ? 'Bets' : (decision.action === 'RAISE' ? 'Raises to' : 'Calls');
                        actionMsg = `${type} $${decision.amount} with ${bestSelection.eval.tier}.`;
                    }
                    this.els.overlayDesc.innerText = actionMsg;

                    setTimeout(() => {
                        this.els.overlay.classList.remove('visible');
                        if (decision.action === 'FOLD') {
                            this.executeFold();
                        } else {
                            this.executePlay(decision.amount);
                        }
                        
                        // Show a quick announcement message in the main UI
                        this.setMessage(`<div style="color: ${player.color.hex}; font-weight: bold;">${player.name} ${type} $${decision.amount || 0}.</div>`);
                    }, 800);
                }, 1000);
            }, 1000);
        }, 1000);
    }

    getAISelection(player) {
        // Simple logic: return all cards if they form a good hand, 
        // or find the subset with highest score.
        // For AI, we'll just check the full hand first, then pairs.
        const fullEval = evaluateHand(player.hand);
        let bestIndices = player.hand.map((_, i) => i);
        let bestEval = fullEval;

        // For simplicity in this 'average' AI, it plays its whole hand if it's better than Tier 5
        // Otherwise it plays its highest card.
        if (fullEval.tier === 'Tier 5') {
            const highCardIdx = player.hand.reduce((maxIdx, card, idx, arr) => 
                card.val > arr[maxIdx].val ? idx : maxIdx, 0);
            bestIndices = [highCardIdx];
            bestEval = evaluateHand([player.hand[highCardIdx]]);
        }

        return { indices: bestIndices, eval: bestEval };
    }

    getAIBettingDecision(player, handEval) {
        const isFirstPlayer = this.roundPlays.length === 0;
        
        const otherActiveIds = this.roundActivePlayers.filter(idx => idx !== this.activePlayerId);
        const maxOtherCash = otherActiveIds.length > 0 
            ? Math.max(...otherActiveIds.map(idx => this.players[idx].cash)) 
            : 0;
        const maxBetAllowed = Math.min(5, maxOtherCash);

        // Average risk-averse logic
        if (isFirstPlayer) {
            if (handEval.tier === 'Tier 1' || handEval.tier === 'Tier 2') {
                return { action: 'BET', amount: Math.min(player.cash, 3) };
            }
            if (handEval.tier === 'Tier 3' || handEval.tier === 'Tier 4') {
                return { action: 'BET', amount: Math.min(player.cash, 1) };
            }
            return { action: 'BET', amount: Math.min(player.cash, 1) };
        } else {
            const callAmount = Math.min(player.cash, this.roundBet);
            
            // Confidence based on Tier
            let confidence = 0;
            if (handEval.tier === 'Tier 1') confidence = 1.0;
            else if (handEval.tier === 'Tier 2') confidence = 0.9;
            else if (handEval.tier === 'Tier 3') confidence = 0.7;
            else if (handEval.tier === 'Tier 4') confidence = 0.4;
            else confidence = 0.1;

            // Decision
            if (confidence > 0.8) {
                // High confidence: Call and maybe Raise
                if (this.roundBet < maxBetAllowed && Math.random() > 0.5) {
                    return { action: 'RAISE', amount: Math.min(player.cash, this.roundBet + 1) };
                }
                return { action: 'CALL', amount: callAmount };
            } else if (confidence > 0.3) {
                // Medium confidence: Call small bets
                if (this.roundBet <= 2) return { action: 'CALL', amount: callAmount };
                return { action: 'FOLD' };
            } else {
                // Low confidence: Fold unless it's cheap
                if (this.roundBet <= 1) return { action: 'CALL', amount: callAmount };
                return { action: 'FOLD' };
            }
        }
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
            if (this.edition === 'PRESIDENT' || this.edition === 'STATE') div.classList.add('is-president-edition');
            if (this.edition === 'STATE') div.classList.add('is-state-edition');
            if (this.selectedCardIndices.includes(idx)) div.classList.add('selected');

            if (this.edition === 'PRESIDENT' || this.edition === 'STATE') {
                const dispText = this.edition === 'PRESIDENT' ? (card.president || "") : (card.state || "");
                const imageUrl = this.edition === 'PRESIDENT' ? (card.portraitUrl || (card.president ? (presidentsData.find(p => p.name === card.president)?.portraitUrl || null) : null)) : (card.flagUrl || null);
                div.innerHTML = `
                    <div class="card-corner">
                        <div class="corner-val">${card.val}</div>
                        <div class="corner-suit">${card.suit.symbol}</div>
                    </div>
                    <div class="card-center">
                        <div class="card-portrait-container">
                            ${imageUrl ? `<img src="${imageUrl}" class="card-portrait" alt="${dispText}">` : ''}
                        </div>
                        <div class="card-president-name">${dispText}</div>
                    </div>
                    <div class="card-corner bottom">
                        <div class="corner-val">${card.val}</div>
                        <div class="corner-suit">${card.suit.symbol}</div>
                    </div>
                `;
            } else {
                div.innerHTML = `
                    <div class="card-corner">${card.val}</div>
                    <div class="card-center">
                        <div class="card-val">${card.suit.symbol}</div>
                    </div>
                    <div class="card-corner bottom">${card.val}</div>
                `;
            }

            if (isClickable) {
                div.onclick = () => {
                    if (this.selectedCardIndices.includes(idx)) {
                        this.selectedCardIndices = this.selectedCardIndices.filter(i => i !== idx);
                    } else {
                        this.selectedCardIndices.push(idx);
                    }
                    if (this.edition === 'PRESIDENT' || this.edition === 'STATE') {
                        this.updateProfilePanel();
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
        
        // LIMITATION: Cannot bet more than the richest other active player has (Standard Table Stakes)
        const otherActiveIds = this.roundActivePlayers.filter(idx => idx !== this.activePlayerId);
        const maxOtherCash = otherActiveIds.length > 0 
            ? Math.max(...otherActiveIds.map(idx => this.players[idx].cash)) 
            : 0;
        const maxBetAllowed = Math.min(5, maxOtherCash);

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
            
            for (let b = 1; b <= maxBetAllowed; b++) {
                const disabledStr = (this.selectedCardIndices.length === 0 || player.cash < b) ? 'disabled' : '';
                controlsHTML += `<button class="action-btn" ${disabledStr} onclick="frontierGame.executePlay(${b})">BET $${b}</button>`;
            }
            controlsHTML += `<button class="danger-btn" onclick="frontierGame.executeFold()">FOLD</button>`;
        } else {
            if (handEval) {
                const details = handEval.tier === 'Tier 5' ? `Power: ${handEval.power}` : handEval.name;
                this.setMessage(`<div style="font-size: 1.8rem; font-weight: bold; color: var(--gold-bright);">${handEval.tier}</div><div style="font-size: 1rem; opacity: 0.8;">${details}</div>`);
            } else {
                this.setMessage(`Match the bet, raise, or retreat.`);
            }
            
            // Can always call up to your own cash or the round bet
            const callAmount = Math.min(player.cash, this.roundBet);
            const callDisabled = (this.selectedCardIndices.length === 0 || player.cash < callAmount) ? 'disabled' : '';
            controlsHTML += `<button class="action-btn call-btn" ${callDisabled} onclick="frontierGame.executePlay(${callAmount})">CALL $${callAmount}</button>`;

            if (!isLastPlayer) {
                for (let b = this.roundBet + 1; b <= maxBetAllowed; b++) {
                    const raiseDisabled = (this.selectedCardIndices.length === 0 || player.cash < b) ? 'disabled' : '';
                    controlsHTML += `<button class="action-btn raise-btn" ${raiseDisabled} onclick="frontierGame.executePlay(${b})">RAISE $${b}</button>`;
                }
            }
            controlsHTML += `<button class="danger-btn" onclick="frontierGame.executeFold()">FOLD</button>`;
        }

        if (this.edition === 'PRESIDENT' || this.edition === 'STATE') {
            const profileLabel = this.edition === 'STATE' ? 'PROFILE' : 'PROFILE';
            const panel = document.getElementById('president-profile-panel');
            const isActive = panel && panel.classList.contains('visible');
            const activeStyle = isActive ? 'style="color: var(--gold-bright); border-color: var(--gold-bright); background: rgba(255, 215, 0, 0.1);"' : '';
            controlsHTML += `<button class="action-btn" ${activeStyle} onclick="frontierGame.toggleProfilePanel()">${profileLabel}</button>`;
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
        // Removed obsolete save call

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
            let winners = [];
            let isDefault = false;

            if (this.roundActivePlayers.length <= 1) {
                const winnerId = this.roundActivePlayers.length === 1 ? this.roundActivePlayers[0] : (this.roundPlays[0] ? this.roundPlays[0].playerId : 0);
                winners = [winnerId];
                isDefault = true;
            } else {
                evaluatedPlays.sort((a, b) => b.result.score - a.result.score);
                const topScore = evaluatedPlays[0].result.score;
                winners = evaluatedPlays
                    .filter(p => p.result.score === topScore)
                    .map(p => p.playerId);
            }
            this.concludeRound(winners, evaluatedPlays, isDefault);
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

    concludeRound(winnerIds, finalPlays, isDefault) {
        const finalPot = this.pot;
        const share = Math.floor(finalPot / winnerIds.length);
        const remainder = finalPot % winnerIds.length;

        winnerIds.forEach((id, idx) => {
            const winner = this.players[id];
            winner.cash += share + (idx === 0 ? remainder : 0);
        });

        const roundResult = {
            roundNum: this.currentRoundNum,
            winnerIds,
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
        const winnerNames = roundResult.winnerIds.map(id => this.players[id].name).join(' & ');
        const isFinal = this.currentRoundNum === 5;

        this.setMessage(`${winnerNames} win${roundResult.winnerIds.length === 1 ? 's' : ''} Round ${this.currentRoundNum}! (Pot: $${roundResult.potWon})`);

        // Build History Panel
        this.els.historyContent.innerHTML = '';
        if (roundResult.isDefault) {
            this.els.historyContent.innerHTML = `<div style="text-align:center; padding: 20px;">All opposing commanders retreated.</div>`;
        } else {
            roundResult.plays.forEach(p => {
                const pObj = this.players[p.playerId];
                const res = p.result;
                const isWinner = roundResult.winnerIds.includes(p.playerId);

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
        this.els.controlsArea.innerHTML = `<button class="primary-btn" onclick="frontierGame.advanceToNextRound()">${btnText}</button>`;
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
            ? `DRAW! ${winners.map(w => w.name).join(' & ')} tied with $${topCash}.`
            : `${winners[0].name.toUpperCase()} WINS THE FRONTIER WITH $${topCash}!`;

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
                    <span style="font-size: 2rem; font-family: 'Cinzel', serif;">$${p.cash}</span>
                    ${isBankrupt ? '<span style="font-size: 0.6rem; color: #f87171;">BANKRUPT</span>' : ''}
                </div>
            `;
        });

        html += `
                </div>
                <div style="display: flex; gap: 20px; margin-top: 20px;">
                    <button class="primary-btn" onclick="frontierGame.initGame()">PLAY AGAIN</button>
                    <a href="#games" style="text-decoration: none;"><button class="secondary-btn" style="background: rgba(40, 40, 40, 0.8); border: 1px solid var(--gold-dim); color: var(--gold); padding: 15px 30px; font-family: 'Cinzel', serif; font-size: 1rem; letter-spacing: 2px; cursor: pointer; border-radius: 4px; transition: all 0.3s;">BACK TO MENU</button></a>
                </div>
            </div>
        `;
        this.els.cardsContainer.innerHTML = html;
        this.els.playerStatusGrid.innerHTML = '';
    }

    updateHUD() {
        document.getElementById('round-display').innerText = this.currentRoundNum;
        document.getElementById('pot-display').innerText = `$${this.pot}`;
        document.getElementById('current-bet-display').innerText = `$${this.roundBet}`;
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
                    actionStr = `Played $${play.amount}`;
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
                <div class="pod-name" style="color: ${p.color.hex}">${p.name}${p.isAI ? '<span class="ai-tag">AI</span>' : ''}</div>
                <div class="pod-cash">$${p.cash}</div>
                <div class="pod-action">${actionStr}</div>
            `;
            this.els.playerStatusGrid.appendChild(div);
        });
    }

    toggleProfilePanel() {
        const panel = document.getElementById('president-profile-panel');
        if (panel) {
            panel.classList.toggle('visible');
            panel.dataset.edition = this.edition;
            
            const isOpen = panel.classList.contains('visible');
            
            // Side panel button - grey when closed, gold when open
            const svgs = panel.querySelectorAll('.panel-close svg');
            svgs.forEach(svg => {
                svg.style.stroke = isOpen ? 'var(--gold-bright)' : 'var(--gold-dim)';
            });
            
            // FAB - always grey, hides when open
            const fab = document.querySelector('.panel-toggle-fab');
            if (fab) {
                fab.style.display = isOpen ? 'none' : 'flex';
            }
        }
        this.updateControls();
    }

    updateProfilePanel() {
        const panel = document.getElementById('president-profile-panel');
        if (panel) {
            panel.dataset.edition = this.edition;
        }
        
        const panelContent = document.getElementById('profile-content');
        if (!panelContent) return;

        if (this.edition === 'PRESIDENT') {
            if (this.selectedCardIndices.length === 0) {
                panelContent.innerHTML = '<div class="profile-placeholder">Select a President Card to view Profile</div>';
                return;
            }

            const lastSelectedIdx = this.selectedCardIndices[this.selectedCardIndices.length - 1];
            const player = this.players[this.activePlayerId];
            if (!player || !player.hand[lastSelectedIdx]) return;

            const card = player.hand[lastSelectedIdx];
            const pName = card.president;
            if (!pName) {
                panelContent.innerHTML = '<div class="profile-placeholder">This card does not feature a President.</div>';
                return;
            }

            const p = presidentsData.find(pres => pres.name === pName);
            if (!p) {
                panelContent.innerHTML = `<div class="profile-placeholder">Profile not found for ${pName}</div>`;
                return;
            }

            const partyColorHex = p.partyColor === 'red' ? '#ff4d4d' : p.partyColor === 'blue' ? '#0077ff' : '#fff';
            const portraitUrl = card.portraitUrl || p.portraitUrl;

            panelContent.innerHTML = `
                <div class="profile-header">
                    <div class="profile-portrait-large">
                        <img src="${portraitUrl}" alt="${p.name}">
                    </div>
                    <div class="profile-name">${p.name}</div>
                    <div class="profile-years">${p.years}</div>
                </div>
                <div class="profile-meta-grid">
                    <div class="meta-box">
                        <label>Lifespan</label>
                        <span>${p.lifespan}</span>
                    </div>
                    <div class="meta-box">
                        <label>Political Party</label>
                        <span style="color: ${partyColorHex}">${p.party}</span>
                    </div>
                </div>
                <div class="profile-summary">${p.summary}</div>
                <div class="profile-events">
                    <h4>Notable Events</h4>
                    <ul>
                        ${p.events.map(e => `<li>${e}</li>`).join('')}
                    </ul>
                </div>
                <div style="margin-top: 20px; text-align: center;">
                    <button class="action-btn" style="border-color: var(--gold); color: var(--gold); padding: 8px 16px; font-size: 0.85rem;" onclick="window.open('index.html#chronicle-view', '_blank')">AMERICAN CHRONICLE</button>
                    <div style="font-size: 0.7rem; color: #888; margin-top: 5px; font-style: italic;">(It will open in new tab)</div>
                </div>
            `;
        } else if (this.edition === 'STATE') {
            if (this.selectedCardIndices.length === 0) {
                panelContent.innerHTML = '<div class="profile-placeholder">Select a State Card to view Info</div>';
                return;
            }

            const lastSelectedIdx = this.selectedCardIndices[this.selectedCardIndices.length - 1];
            const player = this.players[this.activePlayerId];
            if (!player || !player.hand[lastSelectedIdx]) return;

            const card = player.hand[lastSelectedIdx];
            const stateName = card.state;
            if (!stateName) {
                panelContent.innerHTML = '<div class="profile-placeholder">This card does not feature a State.</div>';
                return;
            }

            const state = getStateByName(stateName);
            if (!state) {
                panelContent.innerHTML = `<div class="profile-placeholder">State info not found for ${stateName}</div>`;
                return;
            }

            panelContent.innerHTML = `
                <div class="profile-header">
                    <div class="profile-portrait-large" style="${this.edition === 'STATE' ? 'width:140px;height:90px;border-radius:4px;' : ''}">
                        <img src="${state.flagUrl}" alt="${state.name}">
                    </div>
                    <div class="profile-name">${state.name}</div>
                    <div class="profile-years">${state.nickname}</div>
                </div>
                <div class="profile-meta-grid">
                    <div class="meta-box">
                        <label>Capital</label>
                        <span>${state.capital}</span>
                    </div>
                    <div class="meta-box">
                        <label>Largest City</label>
                        <span>${state.largestCity}</span>
                    </div>
                    <div class="meta-box">
                        <label>Joined Union</label>
                        <span>${state.year}</span>
                    </div>
                    <div class="meta-box">
                        <label>Order</label>
                        <span>${state.order}${this.getOrdinalSuffix(state.order)}</span>
                    </div>
                </div>
                <div class="chronicle-text" style="font-size:0.95rem; line-height:1.7; margin-top:15px; color:#ccc;">
                    <p>${state.summary}</p>
                </div>
                <div style="margin-top: 20px; text-align: center;">
                    <button class="action-btn" style="border-color: var(--gold); color: var(--gold); padding: 8px 16px; font-size: 0.85rem;" onclick="window.open('index.html#chronicle-view', '_blank')">AMERICAN CHRONICLE</button>
                    <div style="font-size: 0.7rem; color: #888; margin-top: 5px; font-style: italic;">(Opens in new tab)</div>
                </div>
            `;
        }
    }
}

// Init
const frontierGame = new FrontierGame();

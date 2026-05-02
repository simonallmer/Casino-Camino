
class PresidentQuizGame {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.round = 1;
        this.totalRounds = 5;
        this.pot = 0;
        this.targetPresident = null;
        this.guesses = {}; // {playerName: year}
        this.currentGuess = "";
        
        this.els = {
            view: document.getElementById('president-quiz'),
            round: document.getElementById('pres-quiz-round'),
            pot: document.getElementById('pres-quiz-pot'),
            target: document.getElementById('pres-quiz-target'),
            cardDisplay: document.getElementById('pres-quiz-card-display'),
            inputContainer: document.getElementById('pres-quiz-input-container'),
            digits: document.getElementById('pres-quiz-digits'),
            keypad: document.getElementById('pres-quiz-keypad'),
            playerName: document.getElementById('pres-quiz-current-player-name'),
            overlay: document.getElementById('pres-quiz-overlay'),
            overlayTitle: document.getElementById('pres-quiz-overlay-title'),
            overlayDesc: document.getElementById('pres-quiz-overlay-desc'),
            overlayContent: document.getElementById('pres-quiz-overlay-content'),
            overlayBtn: document.getElementById('pres-quiz-overlay-btn'),
            reveal: document.getElementById('pres-quiz-reveal'),
            revealContent: document.getElementById('pres-quiz-reveal-content'),
            continueBtn: document.getElementById('pres-quiz-continue-btn')
        };

        this.initEventListeners();
    }

    initEventListeners() {
        this.els.overlayBtn.onclick = () => this.startRound();
        this.els.continueBtn.onclick = () => this.endRoundResolution();
    }

    initGame(players) {
        this.players = players.map(p => ({
            ...p,
            cash: 20, // Starting virtual cash for the quiz session
            wins: 0
        }));
        this.round = 1;
        this.showOverlay("PRESIDENT QUIZ", "Identify the tenure of the Presidents.", "START GAME");
    }

    showOverlay(title, desc, btnText) {
        this.els.overlayTitle.innerText = title;
        this.els.overlayDesc.innerText = desc;
        this.els.overlayBtn.innerText = btnText;
        
        let leadHtml = '<div style="margin-top: 20px;">';
        this.players.sort((a, b) => b.wins - a.wins).forEach(p => {
            leadHtml += `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-family: 'Courier New', monospace; font-weight: bold; font-size: 1.2rem; color: #2c3e50;">
                    <span>${p.name}</span>
                    <span style="color: #c0392b;">${p.wins} WINS</span>
                </div>
            `;
        });
        leadHtml += '</div>';
        this.els.overlayContent.innerHTML = leadHtml;
        this.els.overlay.classList.add('visible');
    }

    startRound() {
        this.els.overlay.classList.remove('visible');
        this.els.reveal.style.display = 'none';
        
        // Ante
        this.pot = this.players.length * 2;
        this.players.forEach(p => p.cash -= 2);
        
        this.updateHUD();
        
        // Pick random president
        const pool = presidentsData;
        this.targetPresident = pool[Math.floor(Math.random() * pool.length)];
        
        this.els.target.innerText = "???";
        this.renderTargetCard();
        
        this.guesses = {};
        this.currentPlayerIndex = 0;
        this.startPlayerTurn();
    }

    renderTargetCard() {
        const p = this.targetPresident;
        
        // Find actual card mapping from Frontier data
        let suitId = null;
        let rank = null;
        
        // Handle Cleveland double-entry: both 22nd and 24th are the same person/card
        const pid = p.id === 'cleveland-2' ? 'cleveland-1' : p.id;
        
        // Match frontier.js logic for card assignment
        let bIdx = PRESIDENTS.BLACK.indexOf(pid);
        if (bIdx !== -1) {
            suitId = 'BORDER';
            rank = bIdx + 1;
        } else {
            let blueIdx = PRESIDENTS.BLUE.indexOf(pid);
            if (blueIdx !== -1) {
                if (blueIdx < 10) {
                    suitId = 'WEST_FRONTIER';
                    rank = blueIdx + 1;
                } else {
                    suitId = 'INDUST_EAST';
                    rank = blueIdx - 10 + 1;
                }
            } else {
                let redIdx = PRESIDENTS.RED.indexOf(pid);
                if (redIdx !== -1) {
                    if (redIdx < 10) {
                        suitId = 'DEEP_SOUTH';
                        rank = redIdx + 1;
                    } else {
                        suitId = 'UPPER_SOUTH';
                        rank = redIdx - 10 + 1;
                    }
                }
            }
        }

        const suit = SUITS[suitId] || { symbol: "★", id: "UNKNOWN", color: "var(--gold-bright)" };
        const val = rank || "P";

        this.els.cardDisplay.innerHTML = `
            <div class="card revealed suit-${suit.id} is-president-edition" style="width: 200px; height: 300px; margin: 0 auto; cursor: default; transform: none; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
                <div class="card-corner">
                    <div class="corner-val">${val}</div>
                    <div class="corner-suit">${suit.symbol}</div>
                </div>
                <div class="card-center">
                    <div class="card-portrait-container">
                        <img src="${p.portraitUrl}" class="card-portrait" alt="${p.name}">
                    </div>
                    <div class="card-president-name">${p.name}</div>
                </div>
                <div class="card-corner bottom">
                    <div class="corner-val">${val}</div>
                    <div class="corner-suit">${suit.symbol}</div>
                </div>
            </div>
        `;
    }

    startPlayerTurn() {
        const player = this.players[this.currentPlayerIndex];
        this.els.playerName.innerText = player.name;
        this.currentGuess = "";
        this.updateDisplay();
        this.renderKeypad();
        this.els.inputContainer.style.display = 'flex';
    }

    updateDisplay() {
        let displayStr = this.currentGuess.padEnd(4, "_");
        this.els.digits.innerText = displayStr;
    }

    renderKeypad() {
        this.els.keypad.innerHTML = "";
        for (let i = 1; i <= 9; i++) {
            this.addKey(i.toString());
        }
        this.addKey("CLR", "clear");
        this.addKey("0");
        this.addKey("ENT", "enter");
    }

    addKey(label, type = "digit") {
        const btn = document.createElement('button');
        btn.className = "keypad-btn";
        btn.innerText = label;
        
        if (type === "digit") {
            btn.onclick = () => {
                if (this.currentGuess.length < 4) {
                    this.currentGuess += label;
                    this.updateDisplay();
                    if (this.currentGuess.length === 4) {
                        // Optional: auto-submit or wait for ENT
                    }
                }
            };
        } else if (type === "clear") {
            btn.onclick = () => {
                this.currentGuess = "";
                this.updateDisplay();
            };
        } else if (type === "enter") {
            btn.onclick = () => {
                if (this.currentGuess.length === 4) {
                    this.submitGuess();
                }
            };
        }
        
        this.els.keypad.appendChild(btn);
    }

    submitGuess() {
        const player = this.players[this.currentPlayerIndex];
        this.guesses[player.name] = parseInt(this.currentGuess);
        
        // Hide UI for a brief second to show it's logged
        this.els.digits.innerText = "****";
        this.els.inputContainer.style.opacity = '0.5';
        
        setTimeout(() => {
            this.els.inputContainer.style.opacity = '1';
            this.currentPlayerIndex++;
            if (this.currentPlayerIndex < this.players.length) {
                this.startPlayerTurn();
            } else {
                this.resolveRound();
            }
        }, 800);
    }

    resolveRound() {
        this.els.inputContainer.style.display = 'none';
        const p = this.targetPresident;
        this.els.target.innerText = p.years;
        
        // Calculate scores
        let results = [];
        this.players.forEach(player => {
            const guess = this.guesses[player.name];
            let distance = 0;
            
            if (guess >= p.startYear && guess <= p.endYear) {
                distance = 0;
            } else {
                distance = Math.min(
                    Math.abs(guess - p.startYear),
                    Math.abs(guess - p.endYear)
                );
            }
            
            results.push({ name: player.name, guess, distance });
        });
        
        results.sort((a, b) => a.distance - b.distance);
        const minDistance = results[0].distance;
        const winners = results.filter(r => r.distance === minDistance);
        
        // Split pot
        const share = Math.floor(this.pot / winners.length);
        winners.forEach(w => {
            const player = this.players.find(p => p.name === w.name);
            player.cash += share;
            player.wins++;
        });

        this.showReveal(results, winners, minDistance);
    }

    showReveal(results, winners, minDistance) {
        const p = this.targetPresident;
        
        let html = `
            <div style="text-align: center; color: #fff;">
                <h1 style="color: var(--gold-bright); font-size: 2.5rem; margin-bottom: 30px;">${p.name}</h1>
                <div style="display: flex; gap: 40px; align-items: flex-start; justify-content: center; margin-bottom: 40px;">
                    <img src="${p.portraitUrl}" style="width: 250px; border: 4px solid var(--gold); border-radius: 10px; box-shadow: 0 0 30px rgba(212,175,55,0.3);">
                    <div style="text-align: left; max-width: 500px;">
                        <div style="font-family: 'Cinzel', serif; font-size: 1.2rem; color: var(--gold); margin-bottom: 10px;">TENURE: ${p.years}</div>
                        <div style="color: #aaa; line-height: 1.6; font-size: 0.95rem;">${p.summary}</div>
                        <div style="margin-top: 20px;">
                            <h4 style="color: var(--gold-dim); margin-bottom: 10px; letter-spacing: 1px;">KEY EVENTS:</h4>
                            <ul style="list-style: none; padding: 0; color: #ccc;">
                                ${p.events.map(e => `<li style="margin-bottom: 5px;">\u2022 ${e}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.05); padding: 30px; border-radius: 15px; border: 1px solid #333;">
                    <h3 style="color: var(--gold); margin-bottom: 20px;">ROUND RESULTS</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px;">
                        ${results.map(r => `
                            <div style="padding: 15px; background: ${winners.some(w => w.name === r.name) ? 'rgba(16, 185, 129, 0.1)' : 'transparent'}; border: 1px solid ${winners.some(w => w.name === r.name) ? '#10b981' : '#444'}; border-radius: 10px;">
                                <div style="font-weight: bold; margin-bottom: 5px;">${r.name}</div>
                                <div style="font-size: 1.2rem; color: #fff;">${r.guess}</div>
                                <div style="font-size: 0.7rem; color: ${r.distance === 0 ? '#10b981' : '#f87171'}; text-transform: uppercase; margin-top: 5px;">
                                    ${r.distance === 0 ? 'DIRECT HIT' : `DIST: ${r.distance}`}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        this.els.revealContent.innerHTML = html;
        this.els.reveal.style.display = 'flex';
    }

    endRoundResolution() {
        this.round++;
        if (this.round > this.totalRounds) {
            this.showGameOver();
        } else {
            this.startRound();
        }
    }

    showGameOver() {
        this.els.reveal.style.display = 'none';
        this.players.sort((a, b) => b.wins - a.wins);
        const winner = this.players[0];
        
        this.showOverlay("GAME OVER", `${winner.name} IS THE CHAMPION!`, "REPLAY");
        this.els.overlayBtn.onclick = () => this.initGame(this.players);
    }

    updateHUD() {
        this.els.round.innerText = `${this.round} / ${this.totalRounds}`;
        this.els.pot.innerText = `$${this.pot}`;
    }
}

const presidentQuiz = new PresidentQuizGame();

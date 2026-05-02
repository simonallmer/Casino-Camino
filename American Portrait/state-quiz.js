class StateQuizGame {
    constructor() {
        this.players = [];
        this.currentRound = 0;
        this.totalRounds = 5;
        this.pot = 0;
        this.targetState = null;
        this.deck = [];
        this.guesses = []; // [{playerId, stateId, dist}]
        this.activePlayerIndex = 0;
        this.gameWins = {}; // playerId -> winCount
        this.phase = 'WAITING'; // WAITING, GUESSING, REVEAL, ROUND_OVER, GAME_OVER

        this.adj = {
            "AL": ["FL", "GA", "MS", "TN"],
            "AK": [],
            "AZ": ["CA", "CO", "NV", "NM", "UT"],
            "AR": ["LA", "MS", "MO", "OK", "TN", "TX"],
            "CA": ["AZ", "NV", "OR"],
            "CO": ["AZ", "KS", "NE", "NM", "OK", "UT", "WY"],
            "CT": ["MA", "NY", "RI"],
            "DE": ["MD", "NJ", "PA"],
            "FL": ["AL", "GA"],
            "GA": ["AL", "FL", "NC", "SC", "TN"],
            "HI": [],
            "ID": ["MT", "NV", "OR", "UT", "WA", "WY"],
            "IL": ["IA", "IN", "KY", "MO", "WI"],
            "IN": ["IL", "KY", "MI", "OH"],
            "IA": ["IL", "MN", "MO", "NE", "SD", "WI"],
            "KS": ["CO", "MO", "NE", "OK"],
            "KY": ["IL", "IN", "MO", "OH", "TN", "VA", "WV"],
            "LA": ["AR", "MS", "TX"],
            "ME": ["NH"],
            "MD": ["DE", "PA", "VA", "WV"],
            "MA": ["CT", "NH", "NY", "RI", "VT"],
            "MI": ["IN", "OH", "WI"],
            "MN": ["IA", "ND", "SD", "WI"],
            "MS": ["AL", "AR", "LA", "TN"],
            "MO": ["AR", "IL", "IA", "KS", "KY", "NE", "OK", "TN"],
            "MT": ["ID", "ND", "SD", "WY"],
            "NE": ["CO", "IA", "KS", "MO", "SD", "WY"],
            "NV": ["AZ", "CA", "ID", "OR", "UT"],
            "NH": ["MA", "ME", "VT"],
            "NJ": ["DE", "NY", "PA"],
            "NM": ["AZ", "CO", "OK", "TX", "UT"],
            "NY": ["CT", "MA", "NJ", "PA", "VT"],
            "NC": ["GA", "SC", "TN", "VA"],
            "ND": ["MN", "MT", "SD"],
            "OH": ["IN", "KY", "MI", "PA", "WV"],
            "OK": ["AR", "CO", "KS", "MO", "NM", "TX"],
            "OR": ["CA", "ID", "NV", "WA"],
            "PA": ["DE", "MD", "NJ", "NY", "OH", "WV"],
            "RI": ["CT", "MA"],
            "SC": ["GA", "NC"],
            "SD": ["IA", "MN", "MT", "NE", "ND", "WY"],
            "TN": ["AL", "AR", "GA", "KY", "MO", "MS", "NC", "VA"],
            "TX": ["AR", "LA", "NM", "OK"],
            "UT": ["AZ", "CO", "ID", "NV", "WY"],
            "VT": ["MA", "NH", "NY"],
            "VA": ["KY", "MD", "NC", "TN", "WV"],
            "WA": ["ID", "OR"],
            "WV": ["KY", "MD", "OH", "PA", "VA"],
            "WI": ["IL", "IA", "MI", "MN"],
            "WY": ["CO", "ID", "MT", "NE", "SD", "UT"]
        };

        this.stateToCode = {
            "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR", "california": "CA",
            "colorado": "CO", "connecticut": "CT", "delaware": "DE", "florida": "FL", "georgia": "GA",
            "hawaii": "HI", "idaho": "ID", "illinois": "IL", "indiana": "IN", "iowa": "IA",
            "kansas": "KS", "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
            "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS", "missouri": "MO",
            "montana": "MT", "nebraska": "NE", "nevada": "NV", "new-hampshire": "NH", "new-jersey": "NJ",
            "new-mexico": "NM", "new-york": "NY", "north-carolina": "NC", "north-dakota": "ND", "ohio": "OH",
            "oklahoma": "OK", "oregon": "OR", "pennsylvania": "PA", "rhode-island": "RI", "south-carolina": "SC",
            "south-dakota": "SD", "tennessee": "TN", "texas": "TX", "utah": "UT", "vermont": "VT",
            "virginia": "VA", "washington": "WA", "west-virginia": "WV", "wisconsin": "WI", "wyoming": "WY"
        };

        this.codeToStateId = Object.fromEntries(Object.entries(this.stateToCode).map(([k, v]) => [v, k]));

        this.els = {
            round: document.getElementById('quiz-round'),
            pot: document.getElementById('quiz-pot'),
            target: document.getElementById('quiz-target-state'),
            mapWrapper: document.getElementById('map-svg-wrapper'),
            playerName: document.getElementById('quiz-current-player-name'),
            cardDisplay: document.getElementById('quiz-card-display'),
            overlay: document.getElementById('quiz-overlay'),
            overlayTitle: document.getElementById('quiz-overlay-title'),
            overlayDesc: document.getElementById('quiz-overlay-desc'),
            overlayContent: document.getElementById('quiz-overlay-content'),
            overlayBtn: document.getElementById('quiz-overlay-btn')
        };

        this.els.overlayBtn.onclick = () => this.handleOverlayClick();
        this.loadMap();
    }

    loadMap() {
        try {
            // US_MAP_SVG is provided by us_map_data.js
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(US_MAP_SVG, "image/svg+xml");
            const svgElement = svgDoc.querySelector('svg');
            
            // Set viewBox for proper scaling
            if (!svgElement.getAttribute('viewBox')) {
                svgElement.setAttribute('viewBox', '0 0 959 593');
            }
            svgElement.setAttribute('width', '100%');
            svgElement.setAttribute('height', '100%');
            svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            // Remove browser tooltips (title tags)
            svgElement.querySelectorAll('title').forEach(t => t.remove());

            // Add classes and interaction to state paths
            const states = svgElement.querySelectorAll('path, circle');
            states.forEach(state => {
                const classList = state.getAttribute('class')?.split(' ') || [];
                // Check if any class matches a state code in our adjacency list
                const code = classList.find(c => this.adj[c.toUpperCase()])?.toUpperCase();

                if (code) {
                    state.style.cursor = 'pointer';
                    state.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    state.style.fill = 'rgba(40, 40, 45, 0.8)';
                    state.style.stroke = 'rgba(212, 175, 55, 0.3)';
                    state.style.strokeWidth = '0.5';

                    state.onmouseenter = () => {
                        if (this.phase === 'GUESSING') {
                            state.style.fill = 'rgba(212, 175, 55, 0.4)';
                            state.style.filter = 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))';
                        }
                    };
                    state.onmouseleave = () => {
                        if (this.phase === 'GUESSING') {
                            state.style.fill = 'rgba(40, 40, 45, 0.8)';
                            state.style.filter = 'none';
                        }
                    };
                    state.onclick = (e) => this.handleStateClick(code, e);
                } else {
                    // Non-interactive elements (borders, separators) should not block clicks
                    state.style.pointerEvents = 'none';
                }
            });

            this.els.mapWrapper.innerHTML = '';
            this.els.mapWrapper.appendChild(svgElement);
            this.mapSvg = svgElement;
        } catch (err) {
            console.error("Failed to parse US Map SVG:", err);
        }
    }

    initGame(players) {
        this.players = players.map((p, idx) => ({
            ...p,
            id: idx,
            cash: 0, // Starting session earnings at 0
            wins: 0,
            color: ['#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4'][idx] || '#fff'
        }));
        this.currentRound = 0;
        this.gameWins = {};
        this.players.forEach(p => this.gameWins[p.id] = 0);
        
        this.deck = createDeck('STATE');
        // Shuffle deck
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }

        this.startRound();
    }

    startRound() {
        this.currentRound++;
        if (this.currentRound > this.totalRounds) {
            this.endGame();
            return;
        }

        this.pot = this.players.length * 2;
        this.players.forEach(p => p.cash -= 2);

        this.targetState = this.deck.pop();
        this.guesses = [];
        this.activePlayerIndex = 0;
        this.phase = 'GUESSING';

        this.updateHUD();
        // Only show transition for the first player of the round
        this.showTurnTransition(true);
    }

    updateHUD() {
        this.els.round.innerText = `${this.currentRound} / ${this.totalRounds}`;
        this.els.pot.innerText = `$${this.pot}`;
        this.els.target.innerText = this.targetState.state;
        this.els.playerName.innerText = this.players[this.activePlayerIndex].name;
        this.els.playerName.style.color = this.players[this.activePlayerIndex].color;
        
        // Update Card Display
        this.els.cardDisplay.innerHTML = `
            <div class="card is-state-edition suit-${this.targetState.suit.id}" style="width: 120px; height: 180px; transform: rotate(-5deg); box-shadow: 0 10px 30px rgba(0,0,0,0.8); border: 2px solid var(--gold-bright);">
                <div class="card-corner">
                    <div class="corner-val">${this.targetState.val}</div>
                    <div class="corner-suit">${this.targetState.suit.symbol}</div>
                </div>
                <div class="card-center">
                    <div class="card-portrait-container">
                        <img src="${this.targetState.flagUrl}" class="card-portrait" alt="${this.targetState.state}">
                    </div>
                    <div class="card-president-name">${this.targetState.state}</div>
                </div>
            </div>
        `;
    }

    showTurnTransition(isFirst = false) {
        this.els.overlayTitle.innerText = isFirst ? "ROUND " + this.currentRound : this.players[this.activePlayerIndex].name;
        this.els.overlayTitle.style.color = this.players[this.activePlayerIndex].color;
        this.els.overlayDesc.innerText = isFirst ? "PREPARE TO GUESS" : "IT'S YOUR TURN";
        this.els.overlayContent.innerHTML = `
            <div style="text-align: center; color: #ccc; margin-top: 20px;">
                Target: <span style="color: var(--gold-bright); font-weight: bold; font-size: 1.5rem;">${this.targetState.state}</span><br>
                <p style="margin-top: 10px;">Find it on the map. Your pin hides after 2s.</p>
            </div>
        `;
        this.els.overlayBtn.innerText = "START GUESSING";
        this.els.overlay.classList.add('visible');
    }

    handleOverlayClick() {
        this.els.overlay.classList.remove('visible');
        if (this.phase === 'ROUND_OVER') {
            this.startRound();
        } else if (this.phase === 'GAME_OVER') {
            location.hash = '#games';
        }
    }

    handleStateClick(code, event) {
        if (this.phase !== 'GUESSING') return;

        const player = this.players[this.activePlayerIndex];
        const targetCode = this.stateToCode[this.targetState.state.toLowerCase().replace(/\s+/g, '-')];
        
        // If the state ID in states_data doesn't match the lowercase-hyphenated name, we should use a better mapping.
        // Actually, my stateToCode mapping above handles the names correctly.
        const targetCodeActual = this.stateToCode[Object.keys(this.stateToCode).find(k => k.toLowerCase() === this.targetState.state.toLowerCase())];

        const dist = this.getDistance(code, targetCodeActual);
        
        this.guesses.push({
            playerId: player.id,
            code: code,
            dist: dist,
            x: event.clientX,
            y: event.clientY
        });

        // Drop a temporary pin
        this.dropPin(code, player.color, true);

        // Next player or resolve
        this.activePlayerIndex++;
        if (this.activePlayerIndex < this.players.length) {
            setTimeout(() => {
                this.clearTemporaryPins();
                this.els.playerName.innerText = this.players[this.activePlayerIndex].name;
                this.els.playerName.style.color = this.players[this.activePlayerIndex].color;
                // No overlay here, just update the name and let the next person click
            }, 2000);
        } else {
            setTimeout(() => {
                this.clearTemporaryPins();
                this.resolveRound();
            }, 2000);
        }
    }

    dropPin(code, color, temporary = false) {
        const path = this.mapSvg.querySelector(`.${code.toLowerCase()}`);
        if (!path) return;

        // Get center of path
        const bbox = path.getBBox();
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;

        const pin = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pin.setAttribute("cx", cx);
        pin.setAttribute("cy", cy);
        pin.setAttribute("r", "5");
        pin.setAttribute("fill", color);
        pin.setAttribute("stroke", "#fff");
        pin.setAttribute("stroke-width", "1.5");
        pin.style.filter = `drop-shadow(0 0 5px ${color})`;
        if (temporary) pin.classList.add('temp-pin');
        else pin.classList.add('final-pin');

        this.mapSvg.appendChild(pin);

        // Animation
        pin.animate([
            { transform: 'scale(0)', opacity: 0 },
            { transform: 'scale(1.5)', opacity: 1 },
            { transform: 'scale(1)', opacity: 1 }
        ], { duration: 300, easing: 'ease-out' });
    }

    clearTemporaryPins() {
        const temps = this.mapSvg.querySelectorAll('.temp-pin');
        temps.forEach(p => p.remove());
    }

    resolveRound() {
        this.phase = 'REVEAL';
        
        // Show all guesses
        this.guesses.forEach(g => {
            const p = this.players.find(pl => pl.id === g.playerId);
            this.dropPin(g.code, p.color);
        });

        // Highlight target state
        const targetCode = this.stateToCode[Object.keys(this.stateToCode).find(k => k.toLowerCase() === this.targetState.state.toLowerCase())];
        const targetPath = this.mapSvg.querySelector(`.${targetCode.toLowerCase()}`);
        if (targetPath) {
            targetPath.style.fill = 'rgba(16, 185, 129, 0.6)'; // Green
            targetPath.style.stroke = '#10b981';
            targetPath.style.strokeWidth = '2';
        }

        // Calculate winners
        const minDist = Math.min(...this.guesses.map(g => g.dist));
        const winners = this.guesses.filter(g => g.dist === minDist);
        
        const winAmount = Math.floor(this.pot / winners.length);
        const remainder = this.pot % winners.length;

        let winnerText = "";
        winners.forEach((w, idx) => {
            const p = this.players.find(pl => pl.id === w.playerId);
            p.cash += winAmount + (idx < remainder ? 1 : 0);
            p.wins++;
            this.gameWins[p.id]++;
            winnerText += `<span style="color: ${p.color}; font-weight: bold;">${p.name}</span>${idx < winners.length - 1 ? ', ' : ''}`;
        });

        this.phase = 'ROUND_OVER';
        
        setTimeout(() => {
            this.els.overlayTitle.innerText = winners.length > 1 ? "SPLIT POT!" : "WINNER!";
            this.els.overlayTitle.style.color = winners.length === 1 ? this.players.find(p => p.id === winners[0].playerId).color : "var(--gold-bright)";
            this.els.overlayDesc.innerText = minDist === 0 ? "Perfect Guess!" : `Closest Guess (Dist: ${minDist})`;
            
            let html = `<div style="text-align: center; margin-top: 20px;">`;
            html += `<p style="font-size: 1.2rem; color: #fff;">${winnerText} won $${winAmount}${remainder > 0 ? '+' : ''}</p>`;
            html += `<div style="margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">`;
            this.players.forEach(p => {
                html += `<div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: ${p.color};">
                    <span>${p.name}</span>
                    <span>$${p.cash} (${this.gameWins[p.id]} Wins)</span>
                </div>`;
            });
            html += `</div></div>`;
            
            this.els.overlayContent.innerHTML = html;
            this.els.overlayBtn.innerText = this.currentRound < this.totalRounds ? "NEXT ROUND" : "SEE FINAL RESULTS";
            this.els.overlay.classList.add('visible');

            // Reset map colors after delay
            setTimeout(() => {
                const paths = this.mapSvg.querySelectorAll('path, circle');
                paths.forEach(p => {
                    p.style.fill = 'rgba(40, 40, 45, 0.8)';
                    p.style.stroke = 'rgba(212, 175, 55, 0.3)';
                    p.style.strokeWidth = '0.5';
                });
                const pins = this.mapSvg.querySelectorAll('.final-pin');
                pins.forEach(p => p.remove());
            }, 3000);
        }, 1500);
    }

    endGame() {
        this.phase = 'GAME_OVER';
        const sorted = [...this.players].sort((a, b) => this.gameWins[b.id] - this.gameWins[a.id]);
        const overallWinner = sorted[0];

        this.els.overlayTitle.innerText = "GAME OVER";
        this.els.overlayTitle.style.color = "var(--gold-bright)";
        this.els.overlayDesc.innerText = `${overallWinner.name} is the Master of Geography!`;

        let html = `<div style="text-align: center; margin-top: 20px;">`;
        html += `<div style="font-size: 1.5rem; color: ${overallWinner.color}; margin-bottom: 30px; font-weight: bold;">VICTORY</div>`;
        sorted.forEach((p, idx) => {
            html += `<div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 1.1rem; color: ${p.color}; opacity: ${idx === 0 ? 1 : 0.7}">
                <span>${idx + 1}. ${p.name}</span>
                <span>${this.gameWins[p.id]} Wins ($${p.cash})</span>
            </div>`;
        });
        html += `</div>`;

        this.els.overlayContent.innerHTML = html;
        this.els.overlayBtn.innerText = "BACK TO GAMES";
        this.els.overlay.classList.add('visible');
    }

    getDistance(startCode, endCode) {
        if (startCode === endCode) return 0;
        
        // BFS for shortest path
        const queue = [[startCode, 0]];
        const visited = new Set([startCode]);

        while (queue.length > 0) {
            const [curr, d] = queue.shift();
            if (curr === endCode) return d;

            const neighbors = this.adj[curr] || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([neighbor, d + 1]);
                }
            }
        }
        return 99; // Should not happen for connected states
    }
}

// Global instance
window.stateQuiz = new StateQuizGame();

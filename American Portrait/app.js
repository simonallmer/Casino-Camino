document.addEventListener('DOMContentLoaded', () => {
    // Basic Routing Logic
    const routes = {
        '': 'start-page',
        '#start': 'start-page',
        '#start': 'start-page',
        '#comics': 'comics',
        '#journals': 'journals',
        '#chronicle': 'chronicle-view',
        '#library-kissinger': 'library-kissinger',
        '#library-carter': 'library-carter',
        '#films': 'films',
        '#games': 'games',
        '#frontier': 'frontier',
        '#music': 'music',
        '#introduction': 'introduction',
        '#skyscraper': 'skyscraper',
        '#state-quiz': 'state-quiz',
        '#review-nuclear': 'review-nuclear',
        '#review-genesis': 'review-genesis',
        '#review-leadership': 'review-leadership',
        '#review-ageofai': 'review-ageofai'
    };

    // Keyboard Navigation logic
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        const activeView = document.querySelector('.view.active');
        if (!activeView) return;

        // Enterprise navigation logic handled in global listener below

        if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== ' ') return;

        // Focusable items: links, cards, years, tracks, books
        const selectors = 'a.enter-btn, a.back-abs, a.back-to-sa, .portrait-card, .journal-card, .periodic-year, .game-card:not(:has(.game-btn)), .library-book, .custom-audio, .bookstore-item';
        const focusable = Array.from(activeView.querySelectorAll(selectors))
            .filter(el => el.offsetParent !== null);

        if (focusable.length === 0) return;

        let index = focusable.indexOf(document.activeElement);
        let lastInRowIndex = -1; 
        if (window.lastNavIndex !== undefined) lastInRowIndex = window.lastNavIndex;

        if (key === 'ArrowDown' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowLeft') {
            e.preventDefault();
            
            const current = document.activeElement;
            // Record row index memory if in split row
            if (current && current.parentElement.classList.contains('split-actions-row')) {
                const subItems = Array.from(current.parentElement.querySelectorAll('a'));
                window.lastSplitIndex = subItems.indexOf(current);
            }

            // Grid logic for Music View (2 columns)
            if (activeView.id === 'music') {
                const isVertical = (key === 'ArrowDown' || key === 'ArrowUp');
                const step = isVertical ? 2 : 1;
                const dir = (key === 'ArrowDown' || key === 'ArrowRight') ? 1 : -1;
                
                index = (index + (step * dir) + focusable.length) % focusable.length;
                
                // Edge case: if we were at the end and step*dir goes beyond, ensure we loop correctly
                // (Already handled by modulo, but ensures jump feels vertical)
            } else if (key === 'ArrowDown' || key === 'ArrowRight') {
                // Special logic for down from journals back to split row
                if (key === 'ArrowDown' && current && current.getAttribute('href') === '#journals') {
                    const splitActions = activeView.querySelector('.split-actions-row');
                    if (splitActions) {
                        const splitRowItems = Array.from(splitActions.querySelectorAll('a'));
                        const targetSubIndex = (window.lastSplitIndex !== undefined) ? window.lastSplitIndex : 0;
                        index = focusable.indexOf(splitRowItems[targetSubIndex]);
                    } else {
                        index = (index + 1) % focusable.length;
                    }
                } else {
                    index = (index + 1) % focusable.length;
                }
            } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
                // Special logic for split rows: UP from any child of split row goes to the item before the row
                if (key === 'ArrowUp' && current && current.parentElement.classList.contains('split-actions-row')) {
                    const firstInRow = current.parentElement.querySelector('a');
                    index = (focusable.indexOf(firstInRow) - 1 + focusable.length) % focusable.length;
                } else {
                    index = (index - 1 + focusable.length) % focusable.length;
                }
            }
            
            focusable[index].focus();
            focusable[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        } else if (key === ' ') {
            e.preventDefault();
            const current = document.activeElement;
            if (current && focusable.includes(current)) {
                if (current.tagName === 'AUDIO') {
                    if (current.paused) current.play();
                    else current.pause();
                } else {
                    current.click();
                }
            }
        }
    });

    function navigate() {
        const hash = window.location.hash || '#start';
        // Try to finding a route in mapping, then try direct ID, then fallback to start
        let targetId = routes[hash];
        
        if (!targetId && hash.startsWith('#')) {
            const potentialId = hash.substring(1);
            if (document.getElementById(potentialId)) {
                targetId = potentialId;
            }
        }
        
        if (!targetId) targetId = 'start-page';

        // Hide current
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
            view.style.opacity = '0';
            view.style.pointerEvents = 'none';
        });

        // Show target
        const target = document.getElementById(targetId);
        if (target) {
            target.classList.add('active');
            setTimeout(() => {
                target.style.opacity = '1';
                target.style.pointerEvents = 'all';
                target.scrollTop = 0; // Scroll to top on load
            }, 10);

            // Frontier Initialization Fix: Ensure setup is shown on reload
            if (targetId === 'frontier' && typeof frontierGame !== 'undefined') {
                if (frontierGame.phase === 'SETUP' || !frontierGame.players.length) {
                    frontierGame.showSetup();
                }
            }

            // Skyscraper Initialization Fix: Ensure resize is triggered
            if (targetId === 'skyscraper' && typeof skyscraperV3D !== 'undefined') {
                setTimeout(() => {
                    skyscraperV3D.resize();
                    if (skyscraperV2D) skyscraperV2D.resize();
                }, 100);
            }

            // State Quiz: Ensure map is loaded
            if (targetId === 'state-quiz' && typeof stateQuiz !== 'undefined') {
                if (!stateQuiz.mapSvg) stateQuiz.loadMap();
            }

            // Introduction Reset
            if (targetId === 'introduction') {
                const btnShow = document.getElementById('btn-show-galleries');
                const btnHide = document.getElementById('btn-hide-galleries');
                const mainContent = document.getElementById('intro-main-content');
                const galleriesContent = document.getElementById('intro-galleries-content');
                const title = document.getElementById('intro-title');
                
                if (btnShow && btnHide && mainContent && galleriesContent) {
                    mainContent.style.display = 'block';
                    galleriesContent.style.display = 'none';
                    btnShow.style.display = 'block';
                    btnHide.style.display = 'none';
                    if (title) title.innerText = 'Introduction';
                }
            }

            // Mini Music Player Visibility Logic
            if (typeof updateMiniPlayerVisibility === 'function') {
                updateMiniPlayerVisibility(targetId);
            }
        }
    }

    // Initialize both portraits (Now in Comics view)


    // Initial load
    navigate();
    
    // Initialize both portraits (Now in Comics view)
    initPortraitGrid(
        'kissinger-portrait', 
        1924, 
        1973, 
        "A World Destroyed", 
        "Comic Book Part 1/4"
    );
    initPortraitGrid(
        'carter-portrait', 
        1925, 
        1976, 
        "The Blood Beneath the Soil", 
        "Comic Book Part 1/4"
    );
    
    initChronicleGrid();
    initMusicPlayer();
    initMusicHandlers();
    initIntroToggle();
    initLibraries();
    initChronicleNavigation(); // Add keyboard support

    // Listen for hash changes
    window.addEventListener('hashchange', navigate);

    // Consolidated Global Escape Key Navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Priority 1: Frontier Specific Modals/Menus
            if (typeof frontierGame !== 'undefined' && window.location.hash === '#frontier') {
                const els = frontierGame.els;
                const isModalOpen = els.rulesModal.classList.contains('visible') || 
                                   els.allCardsModal.classList.contains('visible') || 
                                   els.menuDropdown.classList.contains('active');
                
                if (isModalOpen) {
                    frontierGame.closeAllModals();
                    return;
                }
                
                // If in game but not setup overlay, show setup/quit
                if (!els.overlay.classList.contains('visible')) {
                    frontierGame.showSetup();
                    return;
                }
            }

            // Priority 1.5: Skyscraper Specific
            if (window.location.hash === '#skyscraper') {
                const rulesModal = document.getElementById('skyscraper-rules-modal');
                const msgModal = document.getElementById('skyscraper-message-modal');
                const trigger = document.getElementById('skyscraper-menu-trigger');
                const header = document.getElementById('skyscraper-main-header');
                const hud = document.getElementById('skyscraper-hud');

                if (rulesModal && rulesModal.style.display === 'flex') {
                    rulesModal.style.display = 'none';
                    return;
                }
                if (msgModal && msgModal.style.display === 'flex') {
                    msgModal.style.display = 'none';
                    return;
                }
                if (header && header.classList.contains('visible')) {
                    if (trigger) trigger.classList.remove('active');
                    header.classList.remove('visible');
                    if (hud) hud.classList.remove('visible');
                    return;
                }
            }

            // Priority 2: General Overlays
            if (document.getElementById('chronicle-popup').classList.contains('active')) {
                closeChroniclePopup();
                return;
            }
            if (document.getElementById('president-popup').classList.contains('active')) {
                closePresidentPopup();
                return;
            }
            if (document.getElementById('state-popup') && document.getElementById('state-popup').classList.contains('active')) {
                closeStatePopup();
                return;
            }
            if (document.getElementById('quotes-overlay').classList.contains('active')) {
                closeQuotes();
                return;
            }

            // Priority 3: View Hierarchical Navigation
            const currentHash = window.location.hash || '#start';
            const backMap = {
                '#chronicle': '#journals',
                '#library-kissinger': '#journals',
                '#library-carter': '#journals',
                '#comics': '#start',
                '#journals': '#start',
                '#films': '#start',
                '#introduction': '#start',
                '#music': '#start',
                '#games': '#start',
                '#frontier': '#games',
                '#skyscraper': '#games',
                '#state-quiz': '#games'
            };

            if (backMap[currentHash]) {
                window.location.hash = backMap[currentHash];
                return;
            }
        }
    });

    function initPortraitGrid(containerId, startYear, specialYear, specialHeading, specialText) {
        // ... (rest of initPortraitGrid code remains same)
        const grid = document.getElementById(containerId);
        if (!grid) return;
        
        // Ensure no duplication on re-init
        grid.querySelectorAll('.grid-piece, .corner-cell').forEach(el => el.remove());

        // We assume startYear corresponds to Piece 0
        function createPiece(col, row, pieceIndex) {
            const div = document.createElement('div');
            div.className = 'grid-piece';
            div.style.gridColumn = col;
            div.style.gridRow = row;
            div.dataset.year = startYear + pieceIndex;
            
            // Show year text faintly on hover? In a real grid, pieces might be too small, but let's add title attribute.
            div.title = div.dataset.year;
            
            div.addEventListener('click', () => showInfo(grid, div.dataset.year, specialYear, specialHeading, specialText));
            grid.appendChild(div);
        }

        function createCorner(col, row, poly1, poly2, year1, year2) {
            const cell = document.createElement('div');
            cell.className = 'corner-cell';
            cell.style.gridColumn = col;
            cell.style.gridRow = row;

            const t1 = document.createElement('div');
            t1.className = 'triangle-piece';
            t1.style.clipPath = poly1;
            t1.dataset.year = year1;
            t1.title = year1;
            t1.addEventListener('click', () => showInfo(grid, year1, specialYear, specialHeading, specialText));

            const t2 = document.createElement('div');
            t2.className = 'triangle-piece';
            t2.style.clipPath = poly2;
            t2.dataset.year = year2;
            t2.title = year2;
            t2.addEventListener('click', () => showInfo(grid, year2, specialYear, specialHeading, specialText));

            cell.appendChild(t1);
            cell.appendChild(t2);
            grid.appendChild(cell);
        }

        // Add a Year Display element that show only on hover
        const yearDisplay = document.createElement('div');
        yearDisplay.className = 'hover-year-display';
        yearDisplay.style.position = 'absolute';
        yearDisplay.style.top = '10px';
        yearDisplay.style.left = '10px';
        yearDisplay.style.background = 'rgba(0,0,0,0.8)';
        yearDisplay.style.color = 'var(--red-accent)';
        yearDisplay.style.padding = '5px 10px';
        yearDisplay.style.fontSize = '1.2rem';
        yearDisplay.style.display = 'none';
        yearDisplay.style.zIndex = '100';
        grid.appendChild(yearDisplay);

        grid.addEventListener('mousemove', (e) => {
            const piece = e.target.closest('.grid-piece, .triangle-piece');
            if (piece && piece.dataset.year) {
                yearDisplay.innerText = piece.dataset.year;
                yearDisplay.style.display = 'block';
            } else {
                yearDisplay.style.display = 'none';
            }
        });

        grid.addEventListener('mouseleave', () => {
            yearDisplay.style.display = 'none';
        });

        // Top-Left corner (Years 99 and 0)
        createCorner(1, 1, 'polygon(0 0, 0 100%, 100% 100%)', 'polygon(0 0, 100% 0, 100% 100%)', startYear + 99, startYear + 0);

        // Top Edge (1..23)
        for (let i = 1; i <= 23; i++) createPiece(i + 1, 1, i);

        // Top-Right corner (Years 24 and 25)
        createCorner(25, 1, 'polygon(0 0, 100% 0, 0 100%)', 'polygon(100% 0, 100% 100%, 0 100%)', startYear + 24, startYear + 25);

        // Right Edge (26..48)
        for (let i = 26; i <= 48; i++) createPiece(25, i - 25 + 1, i);

        // Bottom-Right corner (Years 49 and 50)
        createCorner(25, 25, 'polygon(0 0, 100% 0, 100% 100%)', 'polygon(0 0, 0 100%, 100% 100%)', startYear + 49, startYear + 50);

        // Bottom Edge (51..73)
        for (let i = 51; i <= 73; i++) createPiece(24 - (i - 51), 25, i);

        // Bottom-Left corner (Years 74 and 75)
        createCorner(1, 25, 'polygon(100% 0, 100% 100%, 0 100%)', 'polygon(0 0, 100% 0, 0 100%)', startYear + 74, startYear + 75);

        // Left Edge (76..98)
        for (let i = 76; i <= 98; i++) createPiece(1, 24 - (i - 76), i);
    }
});

// Moved showInfo function inside here, or define it with arguments:
// Updated showInfo to blur image and show center text
function showInfo(grid, year, specialYear, specialHeading, specialText) {
    const img = grid.querySelector('.main-portrait-img');
    const illustrationInfo = grid.querySelector('.comic-illustration-info');
    const yearLabel = grid.querySelector('.comic-year-label');
    const textInfo = grid.querySelector('.comic-text-info');
    
    // Legacy support for the bottom overlay if it's still there
    const title = grid.querySelector('.year-title');
    const info = grid.querySelector('.year-info');
    const overlay = grid.querySelector('.info-overlay');
    
    if (!img || !illustrationInfo) return;

    let heading = `Year ${year}`;
    let text = "Illustration coming soon.";

    if (year == specialYear || year === String(specialYear)) {
        heading = specialHeading;
        text = specialText;
    }

    // Central Illustration Overlay Logic
    yearLabel.innerText = heading;
    textInfo.innerText = text;
    
    img.classList.add('blurred');
    illustrationInfo.classList.add('show');

    // Bottom Overlay Logic (if element exists)
    if (title && info && overlay) {
        title.innerText = heading;
        info.innerText = text;
        overlay.classList.add('show');
    }
    
    // Reset after 6 seconds to give time to read
    setTimeout(() => {
        img.classList.remove('blurred');
        illustrationInfo.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
    }, 6000);
}

let currentChronicleYear = 1776;

function initChronicleGrid() {
    const grid = document.getElementById('chronicle-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    for (let i = 0; i <= 250; i++) { // Up to 2026 (251 years)
        let year = 1776 + i;
        const div = document.createElement('div');
        div.className = 'chronicle-year';
        div.innerText = year;
        div.title = `Year ${year}`;
        
        // Symbols logic...
        if ((year >= 1776 && year <= 1783) || (year >= 1812 && year <= 1815) || 
            (year >= 1846 && year <= 1848) || (year >= 1861 && year <= 1865) || 
            (year >= 1898 && year <= 1898) || (year >= 1917 && year <= 1918) || 
            (year >= 1941 && year <= 1945) || (year >= 1950 && year <= 1953) || 
            (year >= 1965 && year <= 1973) || (year >= 1990 && year <= 1991) || 
            (year >= 2001 && year <= 2021) || year === 2026) {
            div.classList.add('symbol-war');
        }
        if (year >= 1789 && (year - 1789) % 4 === 0) {
            div.classList.add('symbol-president');
        }
        
        div.addEventListener('click', () => openChronicleYear(year));
        grid.appendChild(div);
    }
    
    initPresidentsTimeline();
    initStatesTimeline();
}

function initPresidentsTimeline() {
    const timeline = document.getElementById('presidents-timeline');
    if (!timeline) return;
    timeline.innerHTML = '';
    
    const yearScale = 20; // 20px per year
    
    presidentsData.forEach(pres => {
        let yearsInOffice = (pres.endYear || 2025) - pres.startYear;
        if (pres.endYear === pres.startYear) yearsInOffice = 0.5; // For those who died very quickly
        
        const box = document.createElement('div');
        box.className = `president-box party-${pres.partyColor}`;
        box.style.height = `${Math.max(yearsInOffice * yearScale, 40)}px`;
        
        box.innerHTML = `
            <span class="president-name">${pres.name}</span>
            <span class="president-years">${pres.years}</span>
        `;
        
        box.onclick = () => openPresidentInfo(pres.id);
        timeline.appendChild(box);
    });
}

function initStatesTimeline() {
    const timeline = document.getElementById('states-timeline');
    if (!timeline) return;
    timeline.innerHTML = '';
    
    // Sort states by year they joined the union
    const sortedStates = [...statesData].sort((a, b) => a.year - b.year);
    
    sortedStates.forEach(state => {
        const box = document.createElement('div');
        box.className = 'state-box';
        
        box.innerHTML = `
            <img src="${state.flagUrl}" alt="${state.name}" class="state-flag">
            <div class="state-info">
                <div class="state-name">${state.name}</div>
                <div class="state-year">${state.year}</div>
            </div>
        `;
        
        box.onclick = () => openStateInfo(state.id);
        timeline.appendChild(box);
    });
}

function openPresidentInfo(id) {
    try {
        const pres = presidentsData.find(p => p.id === id);
        if (!pres) return;
        
        const popup = document.getElementById('president-popup');
        const body = document.getElementById('president-popup-body');
        
        const presIndex = presidentsData.indexOf(pres) + 1;
        const ordinal = getOrdinalSuffix(presIndex);
        
        body.innerHTML = `
            <div class="president-info-header">
                <img src="${pres.portraitUrl || 'assets/placeholder-portrait.jpg'}" alt="${pres.name}" class="president-portrait-large">
                <div>
                    <h2 style="color: #fff;">${pres.name}</h2>
                    <div class="president-subtitle">${presIndex}${ordinal} President of the United States</div>
                </div>
            </div>
            
            <div class="president-meta">
                <div class="meta-item">
                    <label>Lifespan</label>
                    <span>${pres.lifespan || 'Unknown'}</span>
                </div>
                <div class="meta-item">
                    <label>Years in Office</label>
                    <span>${pres.years || 'Unknown'}</span>
                </div>
                <div class="meta-item">
                    <label>Political Party</label>
                    <span style="color: ${pres.partyColor === 'red' ? '#ff4d4d' : pres.partyColor === 'blue' ? '#0077ff' : '#eee'}">${pres.party || 'None'}</span>
                </div>
            </div>
            
            <div class="chronicle-text" style="font-size:1.1rem; line-height:1.8; color: #ccc;">
                <p>${pres.summary || ''}</p>
            </div>

            <div class="notable-events">
                <h4>Notable Events</h4>
                <ul>
                    ${pres.events && Array.isArray(pres.events) ? pres.events.map(event => `<li>${event}</li>`).join('') : '<li>No major events recorded.</li>'}
                </ul>
            </div>
        `;
        
        popup.classList.add('active');
        
        // Highlight his years in the grid
        highlightPresidentYears(pres.startYear, pres.endYear, pres.partyColor);
    } catch (e) {
        console.error("Error opening president: ", e);
    }
}

function closePresidentPopup() {
    document.getElementById('president-popup').classList.remove('active');
    // document.body.style.overflow = '';
    clearPresidentHighlights();
}

function openStateInfo(id) {
    const state = statesData.find(s => s.id === id);
    if (!state) return;
    
    const popup = document.getElementById('state-popup');
    const body = document.getElementById('state-popup-body');
    
    const orderOrdinal = getOrdinalSuffix(state.order);

    body.innerHTML = `
        <div class="state-info-header">
            <img src="${state.flagUrl}" alt="${state.name}" class="state-flag-large">
            <div>
                <h2 style="color: #fff;">${state.name}</h2>
                <div class="state-subtitle">${state.nickname}</div>
            </div>
        </div>
        
        <div class="president-meta">
            <div class="meta-item">
                <label>Capital</label>
                <span>${state.capital}</span>
            </div>
            <div class="meta-item">
                <label>Largest City</label>
                <span>${state.largestCity || state.capital}</span>
            </div>
            <div class="meta-item">
                <label>Entered Union</label>
                <span>${state.year}</span>
            </div>
            <div class="meta-item">
                <label>Order</label>
                <span>${state.order}${orderOrdinal} State</span>
            </div>
        </div>
        
        <div class="chronicle-text" style="font-size:1.1rem; line-height:1.8; color: #ccc;">
            <p>${state.summary || 'Historical information coming soon.'}</p>
        </div>
    `;
    
    popup.classList.add('active');
}

function closeStatePopup() {
    document.getElementById('state-popup').classList.remove('active');
}

function getOrdinalSuffix(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}


function highlightPresidentYears(start, end, partyColor) {
    clearPresidentHighlights();
    const grid = document.getElementById('chronicle-grid');
    if (!grid) return;
    
    const years = grid.querySelectorAll('.chronicle-year');
    years.forEach(div => {
        const year = parseInt(div.innerText);
        if (year >= start && year <= end) {
            div.classList.add(`highlight-${partyColor}`);
        }
    });
}

function clearPresidentHighlights() {
    const grid = document.getElementById('chronicle-grid');
    if (!grid) return;
    const years = grid.querySelectorAll('.chronicle-year');
    years.forEach(div => {
        div.classList.remove('highlight-rep', 'highlight-dem', 'highlight-white');
    });
}

function openChronicleYear(year) {
    currentChronicleYear = parseInt(year);
    updateChroniclePopup();
    document.getElementById('chronicle-popup').classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scroll
}

function closeChroniclePopup() {
    document.getElementById('chronicle-popup').classList.remove('active');
    document.body.style.overflow = ''; // Unlock
}

function changeChronicleYear(delta) {
    let newYear = currentChronicleYear + delta;
    if (newYear < 1776) newYear = 1776;
    if (newYear > 2026) newYear = 2026;
    
    if (newYear !== currentChronicleYear) {
        currentChronicleYear = newYear;
        updateChroniclePopup();
    }
}

const chronicleEntries = {
    1776: "Anno Domini 1776 marked a definitive rupture with the British Crown and the birth of a sovereign identity. On the fourth day of July, the Continental Congress, convened at Philadelphia, formally adopted the Declaration of Independence, asserting that these United Colonies are, and of right ought to be, free and independent states. While the summer saw the disheartening retreat of General <strong>Washington</strong>’s forces following the Battle of Long Island, the year concluded with a stroke of brilliance; on a frozen Christmas night, the American army crossed the Delaware to secure a vital victory at Trenton, reviving the flickering spirit of the Revolution.",
    1777: "The Year 1777 tested the mettle of the nascent republic through a grueling campaign of endurance and strategic triumph. Though the British succeeded in occupying the seat of government at Philadelphia after the Battle of Brandywine, the northern theater provided a decisive turning point for the American cause. In October, the surrender of General <strong>Burgoyne</strong>’s army at Saratoga proved to the world—and notably to the Court of France—that the American rebellion was a viable war for liberty. As the year closed, the Continental Army withdrew to the bitter winter quarters of Valley Forge, beginning a season of profound hardship and rigorous transformation under arms.",
    1778: "A transformative alliance was forged in February when the Treaty of Amity and Commerce with France was signed, bringing vital naval and financial support to the American cause. On the field of battle, the Continental Army emerged from the hardships of Valley Forge a disciplined fighting force, proving their mettle against the British at the Battle of Monmouth.",
    1779: "The theater of war expanded significantly into the Western frontier and the high seas, characterized by the Sullivan Expedition against Loyalist-aligned Iroquois tribes. Meanwhile, <strong>John Paul Jones</strong> earned immortal fame in September, capturing the Serapis and defiantly declaring, \"I have not yet begun to fight!\"",
    1780: "Gloom settled over the Southern colonies as the British captured Charleston, resulting in the loss of an entire American army and one of the Revolution's greatest setbacks. The year’s bitterness was compounded in September by the discovery of <strong>Benedict Arnold</strong>’s treasonous plot to surrender the fortifications at West Point.",
    1781: "Resilience in the South finally bore fruit when General <strong>Nathanael Greene</strong>’s strategic maneuvering wore down the British forces, leading to the climactic Siege of Yorktown. In October, the world turned upside down as Lord <strong>Cornwallis</strong> surrendered his army, while the colonies officially adopted the Articles of Confederation as their first national frame of government.",
    1782: "Preliminary peace negotiations commenced in Paris as the British Parliament, weary of the mounting costs and logistical failures, voted to end offensive operations in America. Despite the cessation of major hostilities, the year remained a period of tense vigilance for the Continental Army, which remained encamped at Newburgh to await the final diplomatic resolution.",
    1783: "Finality was achieved in September with the signing of the Treaty of Paris, wherein Great Britain formally acknowledged American independence. By December, General <strong>Washington</strong> resigned his commission to Congress in Annapolis, reinforcing the principle of civilian control over the military before returning to Mount Vernon.",
    1784: "Expansion into the interior became a primary concern as the Land Ordinance of this year established the basis for statehood in the western territories. Meanwhile, the Empress of China sailed from New York, opening the first American maritime trade route with the Qing Dynasty.",
    1785: "Diplomatic and economic hurdles mounted as the Land Ordinance of 1785 refined the township system for the Northwest Territory. In Virginia, the <strong>Mount Vernon</strong> Conference brought together delegates to discuss interstate commerce, planting the first seeds of constitutional reform.",
    1786: "Domestic instability reached a boiling point in Massachusetts during <strong>Shays</strong>’ Rebellion, as debt-ridden farmers took up arms against the state government. This crisis served as a stark warning to the Annapolis Convention that the Articles of Confederation were insufficient to maintain national order.",
    1787: "Delegates from twelve states gathered in Philadelphia to revise the failing federal government, ultimately drafting a radical new Constitution of the United States. Concurrently, Congress passed the Northwest Ordinance, a landmark act prohibiting slavery in the territory north of the Ohio River.",
    1788: "Intense public debate dominated the year as the Federalist Papers urged the populace to support the new central government. By June, the necessary nine states had ratified the Constitution, making it the supreme law of the land and setting the stage for the first national elections.",
    1789: "A new era dawned in April as <strong>George Washington</strong> was unanimously inaugurated as the first President of the United States at Federal Hall in New York City. The first Congress also moved to satisfy the concerns of the Anti-Federalists by drafting the initial amendments that would become the Bill of Rights.",
    1790: "Financial stability became the priority as <strong>Alexander Hamilton</strong> submitted his Report on Public Credit, proposing that the federal government assume state debts. A grand compromise between <strong>Hamilton</strong>, <strong>Jefferson</strong>, and <strong>Madison</strong> also saw the federal capital relocated to a site on the Potomac River.",
    1791: "Tension between broad and strict interpretations of the Constitution flared during the creation of the First Bank of the United States. In December, the Bill of Rights was officially ratified, guaranteeing fundamental liberties such as freedom of speech and the right to a trial by jury.",
    1792: "Political factions solidified into the first party system as <strong>Thomas Jefferson</strong> and <strong>James Madison</strong> formed the Democratic-Republican Party to oppose <strong>Hamilton</strong>’s Federalist policies. Despite these growing divisions, President <strong>Washington</strong> was once again elected by a unanimous vote of the Electoral College.",
    1793: "Neutrality became the official stance of the executive as President <strong>Washington</strong> issued his Proclamation of Neutrality regarding the escalating war between Revolutionary France and Great Britain. Meanwhile, <strong>Eli Whitney</strong>’s invention of the cotton gin revolutionized the Southern economy, inadvertently cementing the institution of slavery for decades to come.",
    1794: "Domestic authority was tested when the Whiskey Rebellion broke out in Western Pennsylvania, prompting <strong>Washington</strong> to personally lead a federal militia to suppress the tax protesters. Concurrently, General <strong>Anthony Wayne</strong> secured the Northwest Territory for settlement by defeating a confederation of Native American tribes at the Battle of Fallen Timbers.",
    1795: "Diplomatic tensions with the great powers were eased through the ratification of <strong>Jay</strong>’s Treaty with Britain and <strong>Pinckney</strong>’s Treaty with Spain. The latter proved especially popular, as it granted American merchants the vital \"right of deposit\" in the port of New Orleans, opening the Mississippi River to trade.",
    1796: "A transition of power defined the close of the year as <strong>George Washington</strong> published his Farewell Address, famously warning the nation against permanent foreign alliances and the \"baneful effects\" of political parties. In the ensuing election, <strong>John Adams</strong> narrowly defeated <strong>Thomas Jefferson</strong> to become the second President.",
    1797: "Diplomatic scandal erupted when American envoys in Paris were met with demands for bribes, an affront known as the XYZ Affair. The resulting public outrage shifted the national mood toward hostility against France and led to the buildup of the United States Navy.",
    1798: "Fear of foreign subversion and domestic dissent led the Federalist-controlled Congress to pass the controversial Alien and Sedition Acts. In response, <strong>Jefferson</strong> and <strong>Madison</strong> secretly penned the Kentucky and Virginia Resolutions, arguing that states had the right to nullify unconstitutional federal laws.",
    1799: "Mourning gripped the young republic in December following the death of <strong>George Washington</strong> at his Mount Vernon estate. As the nation grieved its \"first citizen,\" the undeclared Quasi-War with France continued to simmer on the high seas.",
    1800: "Political upheaval arrived with the \"Revolution of 1800,\" a bitterly contested election that resulted in a tie in the Electoral College between <strong>Thomas Jefferson</strong> and <strong>Aaron Burr</strong>. Peace was finally brokered with France through the Convention of 1800, ending hostilities and dissolving the old 1778 alliance.",
    1801: "Power was transferred peacefully between opposing parties for the first time as <strong>Thomas Jefferson</strong> was inaugurated in the new capital of Washington, D.C. In his final days in office, <strong>Adams</strong> had appointed several \"midnight judges,\" setting the stage for a historic clash between the executive and judicial branches.",
    1802: "Fiscal reform took center stage as the <strong>Jefferson</strong> administration worked to repeal internal taxes and drastically reduce the national debt. The year also saw the establishment of the United States Military Academy at West Point, ensuring a professionalized officer corps for the nation's defense.",
    1803: "Territorial boundaries were redrawn overnight when the United States purchased the Louisiana Territory from <strong>Napoleonic</strong> France for $15 million. This historic acquisition effectively doubled the size of the nation, securing the vital port of New Orleans and the vast interior of the continent.",
    1804: "Exploration of the newly acquired West began in earnest as <strong>Meriwether Lewis</strong> and <strong>William Clark</strong> departed from St. Louis to find a water route to the Pacific. Meanwhile, the nation was shocked by the death of <strong>Alexander Hamilton</strong> in a duel with Vice President <strong>Aaron Burr</strong>.",
    1805: "Naval glory was achieved in the Mediterranean when Lieutenant <strong>Stephen Decatur</strong> and a small force of Marines successfully concluded the First Barbary War. The treaty signed in Tripoli ended the systemic payment of tribute to North African pirates and asserted American naval reach.",
    1806: "Tensions with the great powers of Europe intensified as Britain and France both issued decrees seizing American merchant ships. In the West, <strong>Zebulon Pike</strong> set out to explore the southern reaches of the Louisiana Purchase, eventually sighting the Colorado peak that would bear his name.",
    1807: "Economic warfare took a heavy toll with the passage of the Embargo Act, an attempt by President <strong>Jefferson</strong> to punish Britain and France by halting all American exports. The policy proved disastrous for New England merchants while failing to stop British \"impressment\" of American sailors.",
    1808: "Progress and prohibition defined the year as the constitutional ban on the international slave trade finally went into effect. Amidst economic gloom from the embargo, <strong>James Madison</strong> was elected the fourth President, inheriting a brewing international crisis.",
    1809: "Diplomatic maneuvering continued with the Non-Intercourse Act, which reopened trade with all nations except Britain and France. On the frontier, the Shawnee leader <strong>Tecumseh</strong> began organizing a great confederacy of tribes to resist further white settlement.",
    1810: "Expansionist fervor gripped the \"War Hawks\" in Congress as they eyed British Canada and Spanish Florida. Meanwhile, the Supreme Court, under <strong>John Marshall</strong>, asserted its power to strike down state laws in the landmark case of Fletcher v. Peck.",
    1811: "Violence erupted in the Indiana Territory when Governor <strong>William Henry Harrison</strong>’s forces clashed with <strong>Tecumseh</strong>’s followers at the Battle of Tippecanoe. This conflict deepened suspicions that the British were inciting Native American resistance against the United States.",
    1812: "Diplomacy finally failed as the United States declared war on Great Britain, citing maritime rights and frontier interference. The War of 1812 began with a series of failed American invasions of Canada, though the USS Constitution provided a morale boost with naval victories.",
    1813: "Brutal fighting continued across the Great Lakes, highlighted by Commodore <strong>Perry</strong>’s victory on Lake Erie. In October, the Battle of the Thames saw the death of <strong>Tecumseh</strong>, effectively shattering the Native American confederacy in the Northwest.",
    1814: "Fire ravaged the capital as British forces captured Washington, D.C., and burned the White House and Capitol building. However, American resolve held at Fort McHenry, inspiring <strong>Francis Scott Key</strong> to pen \"The Star-Spangled Banner,\" before a peace treaty was signed in Ghent.",
    1815: "Victory arrived after the peace was technically reached, as General <strong>Andrew Jackson</strong>’s forces decisively defeated the British at the Battle of New Orleans. The triumph ushered in a wave of nationalistic pride and signaled the end of the Federalist Party’s influence.",
    1816: "Economic stabilization was sought through the chartering of the Second Bank of the United States and the passage of the first protective tariff. <strong>James Monroe</strong> elected President, signaling the start of a period of relative political unity.",
    1817: "Optimism flourished as the \"Era of Good Feelings\" began with President <strong>Monroe</strong>’s goodwill tour of the Northern states. Construction also commenced on the Erie Canal, a massive infrastructure project destined to link the Atlantic Ocean with the Great Lakes.",
    1818: "Diplomacy secured the northern border through the Convention of 1818, which established the 49th parallel as the boundary with British North America. General <strong>Andrew Jackson</strong> also led a controversial incursion into Spanish Florida, seizing several military posts during the First Seminole War.",
    1819: "Economic catastrophe struck as the Panic of 1819 ended the post-war boom, leading to widespread bank failures and mortgage foreclosures. Concurrently, the Supreme Court ruled in McCulloch v. Maryland that states could not tax federal institutions, reinforcing federal supremacy.",
    1820: "Sectional tensions over the expansion of slavery erupted during the debate over Missouri’s statehood, resulting in the Missouri Compromise. This legislative \"fire bell in the night\" admitted Missouri as a slave state and Maine as a free state, drawing a line across the continent at 36\u00b030'.",
    1821: "Expansion continued as the <strong>Adams</strong>-\u00d3n\u00eds Treaty was finalized, formally ceding Florida from Spain to the United States. In the West, the Santa Fe Trail was opened, establishing a vital commercial link between Missouri and the Spanish Southwest.",
    1822: "Anxiety over slave insurrections gripped the South following the discovery of the <strong>Denmark Vesey</strong> plot in Charleston, South Carolina. The conspiracy led to stricter slave codes and increased paranoia regarding abolitionist sentiment.",
    1823: "Sovereignty was asserted on the global stage when President <strong>Monroe</strong> issued the Monroe Doctrine, declaring that the Western Hemisphere was closed to further European colonization. This bold stance aimed to protect newly independent Latin American republics from Old World interference.",
    1824: "Political controversy dominated the presidential election, which resulted in no candidate receiving a majority of the electoral vote. The House of Representatives eventually chose <strong>John Quincy Adams</strong>, leading <strong>Andrew Jackson</strong> to cry foul over an alleged \"Corrupt Bargain\" with <strong>Henry Clay</strong>.",
    1825: "Infrastructure transformed American commerce with the completion of the Erie Canal, connecting the Hudson River to the Great Lakes. This \"Big Ditch\" slashed transportation costs and turned New York City into the nation's premier commercial port.",
    1826: "Commemoration turned to mourning on the fiftieth anniversary of the Declaration of Independence, as both <strong>Thomas Jefferson</strong> and <strong>John Adams</strong> died on the same day. Their passing was viewed by many as the symbolic end of the Revolutionary generation.",
    1827: "Freedom of the press reached a milestone with the first publication of Freedom\u2019s Journal, the first African American-owned and operated newspaper in the United States. In the North, slavery was officially abolished in New York State.",
    1828: "Populism surged as <strong>Andrew Jackson</strong> won a landslide victory in the presidential election, branding himself the champion of the \"common man.\" The year also saw the passage of the \"Tariff of Abominations,\" which infuriated Southern planters and sparked talk of nullification.",
    1829: "Democracy took on a rowdy character during <strong>Jackson</strong>\u2019s inauguration, where a massive crowd of supporters nearly wrecked the White House. The new President introduced the \"spoils system,\" rewarding political loyalists with federal government positions.",
    1830: "Contention over federal versus state power reached a fever pitch during the <strong>Webster</strong>-<strong>Hayne</strong> Debate in the Senate. Additionally, <strong>Jackson</strong> signed the Indian Removal Act, authorizing the forced relocation of Native American tribes to lands west of the Mississippi.",
    1831: "Radicalism intensified with the publication of <strong>William Lloyd Garrison</strong>\u2019s The Liberator, a newspaper demanding the immediate abolition of slavery. In Virginia, <strong>Nat Turner</strong> led a bloody slave rebellion that resulted in the deaths of over fifty white citizens and subsequent harsh reprisals.",
    1832: "Defiance characterized the Nullification Crisis when South Carolina declared federal tariffs unconstitutional and threatened to secede. President <strong>Jackson</strong> responded with the Proclamation to the People of South Carolina, asserting that the Union was perpetual and secession was treason.",
    1833: "Compromise averted civil war as <strong>Henry Clay</strong> brokered a lower tariff, while the Force Bill authorized the President to use the military to collect duties. In Philadelphia, the American Anti-Slavery Society was founded to organize national resistance to the institution.",
    1834: "Opposition to \"King Andrew\" solidified into the formation of the Whig Party, led by <strong>Henry Clay</strong> and <strong>Daniel Webster</strong>. Meanwhile, the Senate formally censured President <strong>Jackson</strong> for his removal of federal deposits from the Second Bank of the United States.",
    1835: "Warfare erupted in the Southwest as American settlers in Texas began an armed revolt against the Mexican government. In Florida, the Second Seminole War commenced, becoming the longest and most expensive conflict between the U.S. and Native Americans.",
    1836: "Sacrifice at the Alamo became a rallying cry for Texan independence, which was ultimately secured at the Battle of San Jacinto. In Washington, <strong>Martin Van Buren</strong> was elected to succeed <strong>Jackson</strong>, while the \"Gag Rule\" was adopted in Congress to stifle petitions regarding slavery.",
    1837: "Financial ruin returned with the Panic of 1837, a severe economic depression triggered by speculative lending and <strong>Jackson</strong>'s \"Specie Circular.\" As banks collapsed and unemployment rose, the Cherokee began their forced march west, a tragic journey that would become known as the Trail of Tears.",
    1838: "Sorrow marked the winter as the Cherokee Nation was forcibly marched from their ancestral lands toward Indian Territory. This \"Trail of Tears\" resulted in thousands of deaths due to exposure, disease, and starvation under the enforcement of the federal military.",
    1839: "Rebellion took to the seas when African captives aboard the Spanish schooner Amistad seized control of the vessel. The ship was intercepted by the U.S. Navy off Long Island, sparking a monumental legal battle over the captives' status as free men or property.",
    1840: "Populism reached a theatrical peak in the \"Log Cabin and Hard Cider\" campaign, leading to the election of <strong>William Henry Harrison</strong>. This contest solidified the second party system, pitting the Whigs against the Democrats in a fight for the common voter.",
    1841: "Tragedy struck the executive branch when President <strong>Harrison</strong> died just one month after his inauguration, making <strong>John Tyler</strong> the first Vice President to succeed to the presidency. <strong>Tyler</strong>\u2019s subsequent break with the Whig Party created a period of intense political paralysis.",
    1842: "Diplomacy settled the northeastern frontier through the <strong>Webster</strong>-<strong>Ashburton</strong> Treaty, which resolved long-standing border disputes between Maine and British New Brunswick. The agreement also established a joint naval patrol to suppress the illegal African slave trade.",
    1843: "Migration surged as the first large-scale wagon train of over one thousand settlers departed for the Oregon Trail. This \"Great Migration\" signaled the beginning of a massive westward movement that would reshape the continent\u2019s demographics.",
    1844: "Innovation revolutionized communication in May when <strong>Samuel Morse</strong> sent the first telegraphic message\u2014\"What hath God wrought\"\u2014from Washington to Baltimore. In the political arena, <strong>James K. Polk</strong> won the presidency on a platform of aggressive territorial expansion.",
    1845: "Ambition fulfilled the vision of Manifest Destiny as the United States officially annexed the Republic of Texas as the 28th state. This move, however, immediately soured relations with Mexico and heightened sectional fears regarding the expansion of slavery.",
    1846: "Warfare commenced in the Southwest following a skirmish on the Rio Grande, leading Congress to declare war on Mexico. Simultaneously, the Oregon Treaty was signed with Britain, peacefully acquiring the Pacific Northwest and establishing the 49th parallel boundary.",
    1847: "Conquest defined the military campaigns of Generals <strong>Zachary Taylor</strong> and <strong>Winfield Scott</strong>, culminating in the Capture of Mexico City. The American victory ensured that the United States would dictate the terms of any future peace settlement.",
    1848: "Transformation arrived with the Treaty of Guadalupe Hidalgo, which ceded California and the Southwest to the United States for $15 million. In a small mill in California, the discovery of gold sparked a global rush, while in New York, the Seneca Falls Convention issued the first formal demand for women\u2019s suffrage.",
    1849: "Fever for wealth brought hundreds of thousands of \"Forty-Niners\" to the West Coast, rapidly accelerating California\u2019s application for statehood. In Washington, the veteran Whig general <strong>Zachary Taylor</strong> was inaugurated as President amidst a growing crisis over the new territories.",
    1850: "Compromise narrowly averted disunion when <strong>Henry Clay</strong> and <strong>Stephen Douglas</strong> pushed through a series of bills addressing the status of the Mexican Cession. The Compromise of 1850 admitted California as a free state but included a draconian Fugitive Slave Act that outraged Northern abolitionists.",
    1851: "Friction intensified as Northern communities resisted the enforcement of the new slave-catching laws, leading to high-profile rescues and riots. In literature, <strong>Herman Melville</strong> published Moby-Dick, reflecting the turbulent and expansive spirit of the American age.",
    1852: "Influence radiated from the pen of <strong>Harriet Beecher Stowe</strong>, whose novel Uncle Tom\u2019s Cabin humanized the horrors of slavery for millions of readers. The book became a massive bestseller, further polarizing the North and South and making conflict seem increasingly inevitable.",
    1853: "Acquisition of the final piece of the contiguous United States occurred via the <strong>Gadsden</strong> Purchase, a $10 million deal with Mexico for land in present-day Arizona and New Mexico. This land was intended to provide a southern route for a transcontinental railroad.",
    1854: "Chaos erupted in the West following the passage of the Kansas-Nebraska Act, which repealed the Missouri Compromise line in favor of \"popular sovereignty.\" The resulting violence between pro-slavery and anti-slavery settlers gave rise to the moniker \"Bleeding Kansas\" and led to the birth of the Republican Party.",
    1855: "Lawlessness prevailed in the Kansas Territory as rival governments were established at Topeka and Lecompton. Civil strife within the territory served as a grim preview of the national carnage to come, as \"Border Ruffians\" from Missouri clashed with \"Jayhawkers.\"",
    1856: "Brutality reached the floor of the Senate when Representative <strong>Preston Brooks</strong> nearly beat Senator <strong>Charles Sumner</strong> to death with a cane following an anti-slavery speech. In the presidential election, <strong>James Buchanan</strong> won a fractured contest, promising to maintain the status quo.",
    1857: "Infamy was etched into judicial history with the Dred Scott Decision, in which Chief Justice <strong>Roger Taney</strong> ruled that African Americans could not be citizens and that Congress had no power to prohibit slavery in the territories. The ruling effectively invalidated years of political compromise.",
    1858: "Eloquence and logic were on display during the Lincoln-Douglas Debates in Illinois, as <strong>Abraham Lincoln</strong> rose to national prominence by challenging the morality of slavery. Though he lost the Senate race, <strong>Lincoln</strong> emerged as the leading voice for the anti-slavery Republican cause.",
    1859: "Radicalism took a violent turn in October when <strong>John Brown</strong> led a raid on the federal arsenal at Harpers Ferry, hoping to ignite a slave insurrection. Though the raid failed and Brown was hanged, he became a martyr in the North and a terrifying omen in the South.",
    1860: "Rupture occurred in the wake of <strong>Abraham Lincoln</strong>\u2019s election as the first Republican President. Viewing his victory as a death knell for their way of life, South Carolina became the first state to formally secede from the Union in December.",
    1861: "Conflagration began in April when Confederate forces fired upon Fort Sumter in Charleston Harbor, forcing the remaining Southern states to choose sides. By July, the First Battle of Bull Run shattered any illusions that the war would be a short or bloodless affair.",
    1862: "Slaughter on an unprecedented scale defined the year, with the Battle of Antietam becoming the bloodiest single day in American history. Following this strategic Union victory, President <strong>Lincoln</strong> issued the preliminary Emancipation Proclamation, fundamentally changing the purpose of the war from mere union to universal liberation.",
    1863: "Freedom attained a new legal sanctuary on New Year’s Day when the Emancipation Proclamation took full effect, officially inviting Black men to enlist in the Union ranks. The summer brought a dual turning point as General <strong>Lee</strong>’s northern invasion was halted at the bloody crossroads of Gettysburg, while simultaneously, <strong>Ulysses S. Grant</strong> secured the Mississippi River by capturing Vicksburg. In November, President <strong>Lincoln</strong> stood upon the Pennsylvania battlefield to deliver the Gettysburg Address, redefining the struggle as a \"new birth of freedom\" for a government of the people.",
    1864: "Relentless pressure became the Union strategy as <strong>Grant</strong> took command of all federal armies, engaging <strong>Lee</strong> in a grueling war of attrition through the Wilderness of Virginia. Meanwhile, <strong>William Tecumseh Sherman</strong>’s capture of Atlanta in September provided the political momentum necessary for <strong>Lincoln</strong>’s re-election. The year concluded with <strong>Sherman</strong>’s \"March to the Sea,\" a scorched-earth campaign across Georgia designed to break the South’s economic and psychological will to continue the rebellion.",
    1865: "Victory and tragedy converged in the spring as the Confederate capital of Richmond fell, leading to <strong>Lee</strong>’s surrender at Appomattox Court House on April 9th. The national jubilation was shattered just five days later when <strong>Abraham Lincoln</strong> was assassinated at Ford’s Theatre by <strong>John Wilkes Booth</strong>. As <strong>Andrew Jackson</strong> (sic) took the oath of office, the 13th Amendment was ratified, finally and forever abolishing slavery across the reunited but grieving United States.",
    1866: "Conflict shifted from the battlefield to the halls of Congress as Radical Republicans clashed with President <strong>Johnson</strong> over the rights of formerly enslaved people. In response to \"Black Codes\" passed by Southern states to restrict African American liberty, Congress passed the Civil Rights Act of 1866 over <strong>Johnson</strong>’s veto. This year also saw the founding of the Ku Klux Klan in Tennessee, signaling the beginning of a violent underground resistance to racial equality.",
    1867: "Reconstruction took on a more militant character with the passage of the Reconstruction Acts, which divided the South into five military districts governed by federal generals. Abroad, Secretary of State <strong>William Seward</strong> orchestrated the purchase of Alaska from Russia for $7.2 million. Though critics mocked the acquisition as \"Seward’s Folly,\" the deal successfully removed a European power from the North American continent.",
    1868: "Political tensions reached a breaking point as the House of Representatives impeached President <strong>Andrew Johnson</strong> for violating the Tenure of Office Act. Though he escaped removal by a single vote in the Senate, his power was effectively neutralized for the remainder of his term. By July, the 14th Amendment was ratified, granting citizenship to all persons born in the U.S. and guaranteeing \"equal protection of the laws,\" while Civil War hero <strong>Ulysses S. Grant</strong> was elected to the presidency in the autumn.",
    1869: "Progress spanned the continent in May when the \"Golden Spike\" was driven at Promontory Summit, Utah, completing the first Transcontinental Railroad. This feat of engineering reduced a six-month journey across the plains to a mere six days, forever altering American trade and migration. In the realm of social reform, the Territory of Wyoming became the first U.S. jurisdiction to grant women the right to vote.",
    1870: "Equality reached the ballot box with the ratification of the 15th Amendment, which prohibited the denial of suffrage based on \"race, color, or previous condition of servitude.\" This year also saw <strong>Hiram Revels</strong> of Mississippi seated as the first African American member of the U.S. Senate. In the industrial sector, <strong>John D. Rockefeller</strong> incorporated the Standard Oil Company, beginning the rise of the great American corporate monopolies.",
    1871: "Disaster struck the burgeoning Midwest when the Great Chicago Fire leveled three square miles of the city, leaving 100,000 people homeless and killing hundreds. Despite the devastation, the city’s rapid rebuilding became a symbol of American industrial resilience. In Washington, the Civil Rights Act of 1871 (the KKK Act) was passed, granting the President the authority to use federal troops to suppress white supremacist terrorist organizations.",
    1872: "Corruption scandals began to plague the <strong>Grant</strong> administration, most notably the Crédit Mobilier affair, which implicated high-ranking officials in a scheme to defraud the government during the construction of the Union Pacific Railroad. On the environmental front, Congress established Yellowstone National Park, the world’s first such preserve, marking a shift toward the conservation of the American wilderness.",
    1873: "Economic despair returned with the Panic of 1873, triggered by the failure of <strong>Jay Cooke</strong>’s banking house and over-speculation in railroads. This initiated a five-year depression known as the \"Great Depression\" until the 1930s took the title. Meanwhile, the Comstock Act was passed, making it illegal to send \"obscene\" materials—including information on birth control—through the U.S. mail.",
    1874: "Temperance emerged as a powerful social force with the founding of the Woman’s Christian Temperance Union (WCTU) in Ohio, led by <strong>Frances Willard</strong>. On the Great Plains, the widespread introduction of barbed wire began to end the era of the open range, as farmers and ranchers fenced off the frontier, leading to violent \"range wars\" over land and water access.",
    1875: "Legal protections for Black citizens were bolstered one final time during Reconstruction with the Civil Rights Act of 1875, which prohibited discrimination in public accommodations and jury service. In the Kentucky Derby's inaugural run, the nation sought a return to leisure, though the \"Whiskey Ring\" scandal continued to erode public trust in the federal government.",
    1876: "Centenary celebrations for the nation's 100th birthday were held in Philadelphia, showcasing American inventions like the telephone and the typewriter. However, the mood was dampened by news from the Montana Territory, where Colonel <strong>George Custer</strong>’s Seventh Cavalry was annihilated by Lakota and Cheyenne warriors at the Battle of the Little Bighorn. The year ended in a constitutional crisis following a disputed presidential election between <strong>Rutherford B. Hayes</strong> and <strong>Samuel Tilden</strong>.",
    1877: "Reconstruction came to an abrupt and controversial end through the Compromise of 1877, in which <strong>Hayes</strong> was awarded the presidency in exchange for the removal of federal troops from the South. This effectively abandoned African Americans to the \"Redeemer\" governments and the rise of Jim Crow. Simultaneously, the Great Railroad Strike became the first national labor uprising, as workers across the country protested wage cuts, leading to violent clashes with the National Guard.",
    1878: "Silver became a central issue in American politics with the passage of the Bland-Allison Act, which required the Treasury to purchase and coin vast amounts of silver bullion. This \"Free Silver\" movement was championed by Western miners and Southern farmers who hoped to inflate the currency and ease their mounting debts. In the laboratory, <strong>Thomas Edison</strong> began the experiments that would soon lead to the perfection of the incandescent light bulb.",
    1879: "Light triumphed over darkness in October when <strong>Thomas Edison</strong> successfully demonstrated his carbon-filament electric lamp at Menlo Park. In the South, a mass migration known as the \"Exoduster\" movement began, as thousands of African Americans fled the oppressive conditions of the post-Reconstruction South to seek a new life in the \"promised land\" of Kansas.",
    1880: "Political stability seemed elusive as <strong>James A. Garfield</strong>, a \"Stalwart\" Republican, won a narrow victory in the presidential election. The nation’s population surpassed 50 million for the first time, reflecting a massive influx of \"New Immigrants\" from Southern and Eastern Europe who were arriving at ports like New York in record numbers to work in the country's booming factories.",
    1881: "Shock gripped the nation for the second time in sixteen years when President <strong>Garfield</strong> was shot by a disgruntled office-seeker, <strong>Charles Guiteau</strong>, in a Washington railway station. After a long and agonizing summer, <strong>Garfield</strong> died of infection, and his successor, <strong>Chester A. Arthur</strong>, surprised his critics by becoming a champion of civil service reform to end the \"spoils system.",
    1882: "Xenophobia found its way into federal law with the passage of the Chinese Exclusion Act, the first significant law to restrict immigration into the United States based on race. On the domestic front, the outlaw <strong>Jesse James</strong> was shot and killed by a member of his own gang, signaling that the lawless era of the \"Old West\" was slowly beginning to fade.",
    1883: "Merit became the new standard for federal employment with the signing of the Pendleton Civil Service Reform Act, which mandated that government jobs be awarded based on competitive exams rather than political loyalty. This year also saw the opening of the Brooklyn Bridge, an architectural marvel of steel and stone that symbolized the industrial might of the Gilded Age.",
    1884: "Partisan vitriol characterized one of the dirtiest campaigns in history, as the \"Mugwump\" Republicans deserted their party to support the Democrat <strong>Grover Cleveland</strong>. Despite scandals involving a secret child, <strong>Cleveland</strong> won the election, becoming the first Democrat to hold the presidency since before the Civil War. In Chicago, the completion of the Home Insurance Building marked the birth of the skyscraper.",
    1885: "Monumental tribute was paid in February with the dedication of the Washington Monument, which stood as the tallest structure in the world at the time. In the world of literature, <strong>Mark Twain</strong> published Adventures of Huckleberry Finn, a searing critique of American racism and social hypocrisy that forever changed the landscape of the American novel.",
    1886: "Labor unrest reached a violent climax in Chicago’s Haymarket Square, where a bomb exploded during a workers' rally, leading to a riot and the execution of several anarchist leaders. The tragedy cast a shadow over the eight-hour workday movement. However, the year also saw a symbol of hope as the Statue of Liberty was dedicated in New York Harbor, a gift from France to commemorate American independence and friendship.",
    1887: "Land policy in the West underwent a radical shift with the Dawes Act, which aimed to \"civilize\" Native Americans by breaking up tribal lands into individual allotments. While intended as a reform, it resulted in the loss of millions of acres of indigenous territory. In the economic realm, the Interstate Commerce Commission (ICC) was created to regulate the railroads, marking the first time the federal government moved to oversee private industry.",
    1888: "Industrial competition and the \"Great Tariff Debate\" dominated the election cycle, leading to the victory of <strong>Benjamin Harrison</strong> over the incumbent <strong>Cleveland</strong>. While the popular vote favored the Democrats, the Electoral College secured a win for the Republicans, who promised to maintain high protectionist barriers for American manufacturers. In the streets of the nation’s growing cities, the \"Great Blizzard\" of March paralyzed the Atlantic seaboard, demonstrating the vulnerability of modern urban infrastructure.",
    1889: "Expansion into the final frontiers of the continental interior accelerated with the Oklahoma Land Rush, as thousands of \"Sooners\" raced to claim territory formerly reserved for Native American tribes. In the realm of international diplomacy, the First Pan-American Conference was held in Washington, signaling a new era of American leadership and cooperation across the Western Hemisphere.",
    1890: "Modernity and tragedy collided as the Sherman Antitrust Act was passed to curb the power of massive corporate monopolies, marking a milestone in federal regulation. However, the year ended in bloodshed at Wounded Knee, South Dakota, where U.S. troops killed hundreds of Lakota men, women, and children. This massacre is widely regarded by historians as the final, somber chapter of the centuries-long Indian Wars.",
    1891: "Populist fervor began to coalesce as farmers in the West and South organized the People's Party, demanding the free coinage of silver and government ownership of railroads to combat falling crop prices. In a Springfield, Massachusetts gymnasium, <strong>James Naismith</strong> invented the game of basketball, providing a new indoor pastime for an increasingly urbanized population.",
    1892: "Labor strife turned lethal during the Homestead Strike in Pennsylvania, where private Pinkerton guards engaged in a pitched battle with striking steelworkers. The year also saw the opening of Ellis Island in New York Harbor, which would serve as the gateway for millions of immigrants seeking the \"American Dream\" during the peak of the industrial era.",
    1893: "Economic collapse arrived with the Panic of 1893, the worst depression the nation had yet faced, characterized by thousands of bank failures and massive unemployment. Despite the gloom, the World’s Columbian Exposition opened in Chicago, a \"White City\" of neoclassical architecture that showcased the country's technological progress and the debut of the Ferris Wheel.",
    1894: "Discontent boiled over as \"<strong>Coxey</strong>’s Army,\" a group of unemployed men, marched on Washington to demand public works jobs. Simultaneously, the Pullman Strike paralyzed the nation’s rail traffic until President <strong>Cleveland</strong> sent in federal troops to break the strike, a move that deeply embittered the American labor movement.",
    1895: "Assertive diplomacy took center stage when Secretary of State <strong>Richard Olney</strong> invoked the Monroe Doctrine to intervene in a boundary dispute between Venezuela and British Guiana, forcing the British to accept American arbitration. In the South, <strong>Booker T. Washington</strong> delivered his Atlanta Compromise speech, suggesting that Black Americans should focus on economic self-improvement rather than immediate social equality.",
    1896: "Judicial precedent took a dark turn with the Supreme Court’s ruling in Plessy v. Ferguson, which legalized \"separate but equal\" racial segregation and ushered in the peak of the Jim Crow era. In the presidential election, <strong>William McKinley</strong>’s \"Front Porch\" campaign defeated the orator <strong>William Jennings Bryan</strong>, effectively ending the Populist challenge and securing the gold standard.",
    1897: "Prosperity began to return as the Klondike Gold Rush in Alaska drew thousands of prospectors northward, injecting new wealth into the economy. As <strong>McKinley</strong> was inaugurated, the nation’s attention shifted toward the Caribbean, where a brutal revolution in Cuba was generating immense public sympathy in the American \"Yellow Press.\"",
    1898: "Imperialism became the new American reality following the mysterious explosion of the USS Maine in Havana Harbor. The resulting Spanish-American War lasted only months, but it left the United States in possession of Puerto Rico, Guam, and the Philippines, while the annexation of Hawaii further extended the nation’s reach into the Pacific.",
    1899: "Global trade became a priority as Secretary of State <strong>John Hay</strong> issued the Open Door Note, calling for equal trading rights in China for all nations. Meanwhile, in the newly acquired Philippines, a fierce insurrection broke out as Filipino nationalists led by <strong>Emilio Aguinaldo</strong> fought against American colonial rule.",
    1900: "Resistance to foreign influence in China culminated in the Boxer Rebellion, prompting the United States to join an international military coalition to rescue besieged diplomats in Beijing. Back at home, the nation mourned the victims of the Galveston Hurricane, the deadliest natural disaster in U.S. history, which claimed at least 6,000 lives.",
    1901: "Sudden transition defined the year when President <strong>McKinley</strong> was assassinated by an anarchist at the Pan-American Exposition in Buffalo. His successor, the 42-year-old <strong>Theodore Roosevelt</strong>, became the youngest president in history, bringing a \"Square Deal\" of progressive reform and a \"Big Stick\" approach to foreign policy.",
    1902: "Executive power was wielded in new ways as <strong>Roosevelt</strong> intervened in the Great Anthracite Coal Strike, forcing mine owners to negotiate with workers to prevent a winter heating crisis. The administration also filed its first major antitrust suit against the Northern Securities Company, earning <strong>Roosevelt</strong> the reputation of a \"trust buster.\"",
    1903: "Innovation and engineering triumphed in December when <strong>Orville</strong> and <strong>Wilbur Wright</strong> achieved the first powered, controlled flight of a heavier-than-air aircraft at Kitty Hawk. In the same year, the United States secured the rights to build the Panama Canal after encouraging a Panamanian revolution against Colombia.",
    1904: "Conservation of the nation’s natural resources became a central pillar of the <strong>Roosevelt</strong> administration, as millions of acres were set aside for national forests and wildlife refuges. The President also issued the Roosevelt Corollary to the Monroe Doctrine, asserting the right of the U.S. to act as an \"international police power\" in Latin America.",
    1905: "Diplomacy earned <strong>Theodore Roosevelt</strong> the Nobel Peace Prize for his role in mediating the Treaty of Portsmouth, which ended the Russo-Japanese War. Domestically, the radical Industrial Workers of the World (the \"Wobblies\") was founded in Chicago, aiming to organize all laborers into \"One Big Union.\"",
    1906: "Reform was the order of the day as <strong>Upton Sinclair</strong>’s The Jungle exposed the filth of the meatpacking industry, leading to the passage of the Pure Food and Drug Act. In the West, the city of San Francisco was nearly leveled by a massive earthquake and subsequent fires, prompting a gargantuan reconstruction effort.",
    1907: "Financial panic briefly threatened the economy before being quelled by the intervention of financier <strong>J.P. Morgan</strong>. To demonstrate American naval prestige, <strong>Roosevelt</strong> dispatched the Great White Fleet on a fourteen-month world tour, showcasing sixteen gleaming battleships to the nations of the globe.",
    1908: "Mobility for the masses became a reality when <strong>Henry Ford</strong> introduced the Model T, a reliable and affordable automobile produced via the moving assembly line. In the political realm, <strong>William Howard Taft</strong> was elected to succeed <strong>Roosevelt</strong>, promising to continue the Progressive agenda.",
    1909: "Racial justice saw a new organized voice with the founding of the NAACP (National Association for the Advancement of Colored People) by <strong>W.E.B. Du Bois</strong> and other activists. In Washington, <strong>Taft</strong>’s presidency began to fracture as he struggled to balance the demands of the conservative and progressive wings of the Republican Party.",
    1910: "Tensions simmered between the United States and its southern neighbor as the Mexican Revolution began, initiating a decade of instability that would frequently draw American military intervention. At home, the \"Great Migration\" saw a significant increase as Black Southerners began moving to Northern cities in search of industrial jobs.",
    1911: "Tragedy at the Triangle Shirtwaist Factory fire in New York City, where 146 workers died behind locked doors, galvanized the movement for workplace safety and labor laws. In the courts, the Supreme Court ordered the dissolution of the Standard Oil Company, a major victory for the anti-monopoly movement.",
    1912: "Political schism split the Republican Party when <strong>Theodore Roosevelt</strong>, dissatisfied with <strong>Taft</strong>, ran as a third-party \"Bull Moose\" candidate. This division allowed Democrat <strong>Woodrow Wilson</strong> to win the presidency, bringing with him a \"New Freedom\" platform of lower tariffs and banking reform.",
    1913: "Financial architecture was fundamentally reshaped with the creation of the Federal Reserve System, providing the nation with a more flexible currency and a central banking authority. The year also saw the ratification of the 16th Amendment (federal income tax) and the 17th Amendment (direct election of senators).",
    1914: "Engineering marvels reached their peak with the formal opening of the Panama Canal, drastically shortening the sea route between the Atlantic and Pacific. However, the world’s attention soon turned to Europe as the \"Guns of August\" signaled the start of the Great War, with President <strong>Wilson</strong> initially pledging American neutrality.",
    1915: "Outrage swept the nation in May when a German U-boat sank the British ocean liner Lusitania, killing 128 Americans. While <strong>Wilson</strong> managed to maintain peace through diplomatic protests, the event pushed public opinion toward \"preparedness\" for potential involvement in the European conflict.",
    1916: "Brinkmanship characterized the border with Mexico as General <strong>John J. Pershing</strong> led a \"Punitive Expedition\" into the country to capture the revolutionary <strong>Pancho Villa</strong>. <strong>Wilson</strong> was narrowly re-elected under the slogan \"He Kept Us Out of War,\" even as the threat of unrestricted submarine warfare loomed.",
    1917: "Neutrality finally collapsed after the interception of the Zimmermann Telegram, in which Germany proposed a secret alliance with Mexico against the U.S. In April, President <strong>Wilson</strong> asked Congress for a declaration of war to \"make the world safe for democracy,\" marking the entry of the United States into World War I and the end of its traditional isolationism.",
    1918: "Combat reached its grueling climax as millions of American \"Doughboys\" joined the fray on the Western Front, playing a decisive role in the Meuse-Argonne Offensive. While the Armistice on November 11th brought a cessation of hostilities, a silent killer emerged at home and abroad; the Spanish Flu pandemic began to ravage the population, eventually claiming more American lives than the war itself.",
    1919: "Bitterness defined the homecoming as the nation was gripped by the \"Red Scare,\" fueled by fears of Bolshevik revolution and a massive wave of labor strikes. While President <strong>Wilson</strong> campaigned tirelessly for the League of Nations, he suffered a debilitating stroke, leaving the Treaty of Versailles to fail in the Senate. Meanwhile, the \"Red Summer\" saw a tragic outbreak of racial violence in cities like Chicago and Washington, D.C.",
    1920: "Empowerment and prohibition arrived in tandem as the 19th Amendment was ratified, finally granting women the right to vote in federal elections. Simultaneously, the 18th Amendment went into effect, outlawing the manufacture and sale of alcohol and giving rise to a subterranean world of speakeasies and organized crime. <strong>Warren G. Harding</strong> won the presidency by promising a \"Return to Normalcy.\"",
    1921: "Prosperity and prejudice coexisted uneasily as the economy began to rebound from a post-war slump. In Oklahoma, the horrific Tulsa Race Massacre resulted in the destruction of the wealthy \"Black Wall Street\" district. To curb the tide of \"New Immigrants,\" Congress passed the Emergency Quota Act, the first of several laws designed to drastically limit immigration based on national origins.",
    1922: "Cultural vibrancy defined the burgeoning Harlem Renaissance, as Black writers, musicians, and artists like <strong>Langston Hughes</strong> and <strong>Duke Ellington</strong> redefined American modernism. On the airwaves, the first commercial radio stations began to broadcast, knitting the vast nation together through a shared mass culture of music, news, and sports.",
    1923: "Scandal shadowed the executive branch when news of the Teapot Dome bribery case broke, revealing that high-ranking officials had leased naval oil reserves to private companies. Following the sudden death of President <strong>Harding</strong> in August, the taciturn <strong>Calvin Coolidge</strong> assumed office, famously declaring that \"the chief business of the American people is business.\"",
    1924: "Citizenship was formally extended to all Native Americans through the Indian Citizenship Act, though many states continued to find ways to disenfranchise them. The year also saw the passage of the National Origins Act, further tightening immigration restrictions and specifically targeting Asian and Eastern European arrivals.",
    1925: "Modernity stood trial in a Dayton, Tennessee courtroom during the Scopes \"Monkey\" Trial, where the teaching of evolution was pitted against religious fundamentalism. Although <strong>John Scopes</strong> was convicted, the trial—featuring legal giants <strong>Clarence Darrow</strong> and <strong>William Jennings Bryan</strong>—highlighted the widening cultural rift between urban secularism and rural tradition.",
    1926: "Infrastructure and leisure merged as Route 66 was established, stretching from Chicago to Los Angeles and becoming the \"Mother Road\" for a new generation of automobile tourists. In the South, the film The Jazz Singer began production, soon to revolutionize the industry as the first \"talkie\" and signal the end of the silent film era.",
    1927: "Heroism took flight in May when <strong>Charles Lindbergh</strong> completed the first solo nonstop transatlantic flight in the Spirit of St. Louis. His arrival in Paris made him an instant global icon. At home, the Great Mississippi Flood devastated the South, displacing hundreds of thousands and sparking a massive federal relief effort under Herbert Hoover.",
    1928: "Optimism carried <strong>Herbert Hoover</strong> to the presidency, as he promised a \"chicken in every pot\" during a time of unprecedented stock market growth. Behind the scenes, however, speculative bubbles in real estate and the market were beginning to strain the nation's financial foundations.",
    1929: "Ruin arrived with a vengeance in October when the Stock Market Crash wiped out billions in wealth in a single week. \"Black Tuesday\" signaled the end of the Roaring Twenties and the beginning of the Great Depression, as banks shuttered their doors and a decade of prosperity evaporated almost overnight.",
    1930: "Despair deepened as the Smoot-Hawley Tariff was passed in a misguided attempt to protect American industry, instead triggering a global trade war that worsened the economic collapse. In the Great Plains, a severe drought began, signaling the onset of the \"Dust Bowl\" that would turn millions of acres of farmland into a desolate wasteland.",
    1931: "Hunger and homelessness became a national crisis as \"Hoovervilles\"—shantytowns of the destitute—proliferated on the outskirts of major cities. In New York, the completion of the Empire State Building stood as a soaring but lonely monument to a lost era of confidence, as much of its office space remained unrented.",
    1932: "Desperation led the \"Bonus Army\"—thousands of WWI veterans—to march on Washington to demand early payment of their service certificates, only to be forcibly cleared by federal troops. In the subsequent election, <strong>Franklin D. Roosevelt</strong> defeated <strong>Hoover</strong> in a landslide, promising a \"New Deal\" for the \"forgotten man.\"",
    1933: "Transformation began during <strong>FDR</strong>’s first \"Hundred Days,\" as a flurry of legislation established the CCC, the TVA, and the FDIC to provide relief, recovery, and reform. The President also utilized the new medium of radio for his \"Fireside Chats,\" and the nation celebrated the Repeal of Prohibition with the ratification of the 21st Amendment.",
    1934: "Strife in the labor sector intensified as the \"Dust Bowl\" reached its peak, sending \"Okies\" fleeing toward California in search of work. In Washington, the Securities and Exchange Commission (SEC) was created to regulate the stock market and prevent the type of speculative mania that had triggered the 1929 crash.",
    1935: "Security became a federal guarantee with the passage of the Social Security Act, creating a safety net for the elderly and unemployed. The Wagner Act also gave workers the legal right to form unions and bargain collectively, leading to a massive surge in membership for the CIO and AFL.",
    1936: "Mandate for the New Deal was overwhelmingly reaffirmed as <strong>Roosevelt</strong> won re-election, carrying every state except Maine and Vermont. Meanwhile, the Olympic Games in Berlin saw African American sprinter <strong>Jesse Owens</strong> win four gold medals, a symbolic blow to the \"Aryan supremacy\" preached by a rising <strong>Adolf Hitler</strong>.",
    1937: "Overreach threatened <strong>Roosevelt</strong>'s popularity when he proposed a \"Court-Packing\" plan to expand the Supreme Court after it struck down several New Deal programs. While the plan failed, the court began to rule more favorably on economic regulations. The year was also marked by the mysterious disappearance of <strong>Amelia Earhart</strong> over the Pacific.",
    1938: "Regulation of the workplace was further refined by the Fair Labor Standards Act, which established the first federal minimum wage and the forty-hour work week. Abroad, the clouds of war darkened as the Munich Agreement failed to appease Nazi Germany, prompting a slow shift in American policy toward military rearmament.",
    1939: "Conflict erupted in Europe as Germany invaded Poland, leading <strong>FDR</strong> to declare American neutrality while secretly seeking ways to assist the Allied powers. The World’s Fair in New York looked toward a \"World of Tomorrow,\" even as the reality of the present suggested a return to global carnage.",
    1940: "Precedent was broken when <strong>Roosevelt</strong> ran for and won an unprecedented third term as President. As the \"Arsenal of Democracy\" began to stir, the first peacetime draft in American history was instituted to prepare for the growing likelihood of involvement in the world war.",
    1941: "Infamy arrived on the morning of December 7th when the Japanese launched a surprise attack on Pearl Harbor, Hawaii. The following day, the United States formally entered World War II. By year's end, the nation was fully mobilized for total war, with industry shifting entirely to the production of planes, tanks, and ships.",
    1942: "Resilience was tested as the U.S. Navy secured a vital victory at the Battle of Midway, halting Japanese expansion in the Pacific. On the home front, however, a dark shadow was cast by the Executive Order 9066, which led to the forced internment of over 100,000 Japanese Americans in inland camps.",
    1943: "Mobilization reached its peak as \"Rosie the Riveter\" became the symbol of millions of women entering the industrial workforce. In the Mediterranean, American and British forces successfully invaded Sicily and Italy, while at home, the \"Zoot Suit Riots\" in Los Angeles highlighted simmering racial tensions.",
    1944: "Liberation began in June with the D-Day invasion of Normandy, the largest amphibious assault in history, which opened the path to Germany. In the Pacific, the Battle of Leyte Gulf saw the effective destruction of the Japanese Navy, while Congress passed the G.I. Bill to provide education and housing benefits for returning veterans.",
    1945: "Finality arrived in the spring with the death of <strong>FDR</strong>, the fall of Berlin, and the discovery of the horrors of the Holocaust. In August, the United States dropped atomic bombs on Hiroshima and Nagasaki, leading to the Japanese surrender. The year concluded with the founding of the United Nations in San Francisco, aimed at preventing future global conflicts.",
    1946: "Transition to peace was marked by the \"Baby Boom\" and a massive housing shortage, as millions of veterans returned home. However, the world remained uneasy as <strong>Winston Churchill</strong> gave his \"Iron Curtain\" speech in Missouri, signaling the start of the Cold War between the United States and the Soviet Union.",
    1947: "Containment became the official foreign policy with the announcement of the Truman Doctrine, pledging American support for nations resisting communism. This was bolstered by the Marshall Plan, a massive economic aid package to rebuild Western Europe. Domestically, <strong>Jackie Robinson</strong> broke the color barrier in Major League Baseball, a major milestone for the burgeoning Civil Rights Movement.",
    1948: "Defiance in the face of Soviet aggression defined the year as the U.S. launched the Berlin Airlift, flying tons of supplies into the blockaded city for nearly a year. In a domestic upset that stunned pollsters, <strong>Harry Truman</strong> won re-election, while also issuing an executive order to desegregate the U.S. Armed Forces, a pivotal victory for civil rights.",
    1949: "Security architectures shifted as the United States joined eleven other nations to form NATO, its first peacetime military alliance outside the Western Hemisphere. The year ended on a somber note for the West as the Soviet Union successfully detonated its first atomic bomb and the Communist Party seized control of mainland China.",
    1950: "Conflict turned hot on the Korean Peninsula when North Korean forces crossed the 38th parallel, prompting President <strong>Truman</strong> to commit American troops to a \"police action.\" At home, the rise of McCarthyism began in earnest as Senator <strong>Joseph McCarthy</strong> claimed to have a list of communists working within the State Department.",
    1951: "Stalemate characterized the fighting in Korea, leading to a dramatic constitutional clash when <strong>Truman</strong> fired the legendary General <strong>Douglas MacArthur</strong> for insubordination. Meanwhile, the 22nd Amendment was ratified, formally limiting future presidents to two terms in office, a direct response to the long tenure of <strong>FDR</strong>.",
    1952: "Technological terror reached a new height with the successful test of the first hydrogen bomb in the Marshall Islands, a weapon exponentially more powerful than those used in WWII. In politics, the popular war hero <strong>Dwight D. Eisenhower</strong> won a landslide victory, promising to bring an honorable end to the conflict in Korea.",
    1953: "An uneasy truce was signed at Panmunjom, ending the active fighting in the Korean War and leaving the peninsula divided. The year also saw the discovery of the double-helix structure of DNA by <strong>Watson</strong> and <strong>Crick</strong>, while the execution of the <strong>Rosenbergs</strong> for atomic espionage underscored the intensity of the domestic Red Scare.",
    1954: "Judicial revolution struck the foundations of Jim Crow when the Supreme Court ruled in Brown v. Board of Education that \"separate but equal\" has no place in public education. In Southeast Asia, the U.S. began increasing its commitment to South Vietnam following the French defeat at Dien Bien Phu, fearing a \"domino effect\" of communism.",
    1955: "Resistance took a seat on a bus in Montgomery, Alabama, when <strong>Rosa Parks</strong> refused to give up her seat to a white passenger, sparking a year-long boycott led by a young <strong>Dr. Martin Luther King Jr.</strong> On the cultural front, the opening of Disneyland and the death of <strong>James Dean</strong> captured the duality of 1950s wholesome optimism and restless youth rebellion.",
    1956: "Infrastructure took a massive leap forward with the passage of the Federal Aid Highway Act, beginning the construction of the Interstate Highway System that would forever change the American landscape. <strong>Eisenhower</strong> won re-election easily, though he was forced to navigate international crises in Hungary and the Suez Canal.",
    1957: "Anxiety gripped the nation in October when the Soviet Union launched Sputnik, the first artificial satellite, triggering the \"Space Race.\" Domestically, <strong>Eisenhower</strong> sent federal troops to enforce the integration of Central High School in Little Rock, Arkansas, demonstrating the federal government's ultimate authority over state defiance.",
    1958: "Scientific competition intensified with the launch of Explorer 1, the first American satellite, and the subsequent creation of NASA. In a move to bolster national defense and education, Congress passed the National Defense Education Act to promote the study of science, mathematics, and foreign languages.",
    1959: "Revolution arrived on the nation’s doorstep as <strong>Fidel Castro</strong> took power in Cuba, eventually aligning with the Soviet Union. Alaska and Hawaii were admitted as the 49th and 50th states, respectively, completing the modern map of the United States.",
    1960: "Youthful energy defined the presidential election as <strong>John F. Kennedy</strong> narrowly defeated <strong>Richard Nixon</strong> in the first televised debates. In the South, four Black students staged a sit-in at a Greensboro Woolworth’s lunch counter, a tactic that rapidly spread across the country to challenge segregated businesses.",
    1961: "Confrontation and idealism marked <strong>Kennedy</strong>'s first year, from the disastrous Bay of Pigs invasion of Cuba to the establishment of the Peace Corps. In a bold address to Congress, <strong>JFK</strong> challenged the nation to land a man on the moon and return him safely to Earth before the decade was out.",
    1962: "Armageddon was narrowly averted during the Cuban Missile Crisis, a thirteen-day standoff over the presence of Soviet nuclear missiles on the island. The tension was mirrored in the South, where <strong>James Meredith</strong> became the first Black student at the University of Mississippi, but only after a violent riot requiring federal military intervention.",
    1963: "Tragedy and triumph intertwined as over 200,000 people gathered for the March on Washington, where <strong>Dr. King</strong> delivered his \"I Have a Dream\" speech. The nation’s soul was then crushed in November by the assassination of <strong>John F. Kennedy</strong> in Dallas, an event that propelled <strong>Lyndon B. Johnson</strong> into the presidency.",
    1964: "Legislation sought to fulfill the promises of the Reconstruction era with the passage of the Civil Rights Act of 1864, outlawing discrimination in public places. However, the conflict in Southeast Asia deepened following the Gulf of Tonkin Incident, which gave President <strong>Johnson</strong> broad authority to escalate military involvement in Vietnam.",
    1965: "Escalation defined the year as the first American combat troops arrived in Vietnam and the U.S. began the sustained bombing campaign known as \"Operation Rolling Thunder.\" At home, the Voting Rights Act was signed into law, while the Watts Riots in Los Angeles signaled a shift in the civil rights struggle toward urban economic issues.",
    1966: "Radicalism and reform continued as the Black Panther Party was founded in Oakland and the National Organization for Women (NOW) was established to advocate for gender equality. In the Supreme Court, the Miranda v. Arizona ruling established that suspects must be informed of their constitutional rights upon arrest.",
    1967: "The \"Summer of Love\" brought the counterculture movement into the mainstream, even as the nation was rocked by the most violent urban riots in its history, particularly in Detroit and Newark. Anti-war sentiment began to surge as the \"credibility gap\" widened between government reports and the reality of the war in Vietnam.",
    1968: "Chaos seemed to engulf the republic following the Tet Offensive in January, which shattered public confidence in the war. The assassinations of <strong>Dr. Martin Luther King Jr.</strong> and <strong>Robert F. Kennedy</strong>, followed by the violent clashes at the Democratic National Convention in Chicago, left the country deeply divided as <strong>Richard Nixon</strong> won the presidency on a \"Law and Order\" platform.",
    1969: "Wonder briefly united the world in July when <strong>Neil Armstrong</strong> and <strong>Buzz Aldrin</strong> became the first humans to walk on the moon, fulfilling <strong>JFK</strong>’s promise. Back on Earth, the Woodstock festival became the pinnacle of the counterculture, while the Stonewall Riots in New York City launched the modern gay rights movement.",
    1970: "Tragedy struck the campus of Kent State University in May, where National Guardsmen killed four students during an anti-war protest following the invasion of Cambodia. Environmentalism also took center stage with the first Earth Day and the subsequent creation of the Environmental Protection Agency (EPA).",
    1971: "Secrets were exposed when the New York Times began publishing the Pentagon Papers, a classified history of the Vietnam War that revealed years of government deception. The 26th Amendment was also ratified, lowering the voting age to eighteen, arguing that those old enough to fight were old enough to vote.",
    1972: "Diplomacy took a dramatic turn when <strong>Nixon</strong> visited China, reopening relations with the communist giant to gain leverage over the Soviet Union. While <strong>Nixon</strong> won a landslide re-election, a \"third-rate burglary\" at the Watergate complex began to unravel into a scandal that would threaten his presidency.",
    1973: "Controversy and withdrawal defined the year as the Supreme Court legalized abortion in Roe v. Wade and the U.S. signed the Paris Peace Accords to end direct military involvement in Vietnam. Domestically, the OPEC Oil Embargo created massive fuel shortages and signaled the beginning of a decade of economic \"stagflation.\"",
    1974: "Resignation became the only option for <strong>Richard Nixon</strong> in August, as he became the first president to step down to avoid certain impeachment and removal over the Watergate cover-up. <strong>Gerald Ford</strong> assumed the presidency and soon issued a full pardon for <strong>Nixon</strong>, a move that remains one of the most debated in political history.",
    1975: "Finality came to Southeast Asia as Saigon fell to North Vietnamese forces, with the iconic images of helicopters evacuating the last Americans from the embassy roof. The war was over, but it left a lasting scar on the American psyche and a newfound skepticism toward foreign intervention.",
    1976: "Celebration of the nation's Bicentennial provided a brief moment of unity and reflection on the country's 200-year history. In the November election, the \"Washington outsider\" <strong>Jimmy Carter</strong> won the presidency, promising a government as \"decent and honest as the American people.\"",
    1977: "Austerity and human rights became the themes of the <strong>Carter</strong> administration as he grappled with a worsening energy crisis and signed the Panama Canal Treaties. On the cultural front, the first Star Wars film debuted, and the personal computer revolution began with the release of the Apple II.",
    1978: "Diplomacy achieved a historic breakthrough with the Camp David Accords, a peace treaty between Israel and Egypt brokered by President <strong>Carter</strong>. At home, the Supreme Court ruled on the <strong>Bakke</strong> case, upholding affirmative action but placing limits on the use of racial quotas in university admissions.",
    1979: "Crisis erupted in November when Iranian revolutionaries stormed the U.S. Embassy in Tehran and took 52 Americans hostage, an ordeal that would last 444 days. Simultaneously, a partial meltdown at the Three Mile Island nuclear plant in Pennsylvania fueled public fears about the safety of atomic energy.",
    1980: "Resurgence and \"Miracles\" closed the decade as the U.S. hockey team defeated the Soviets in the Winter Olympics. However, a failed hostage rescue attempt in Iran deepened the sense of national malaise, leading to the election of <strong>Ronald Reagan</strong>, who promised to restore American strength and usher in a \"Morning in America.\"",
    1981: "Optimism returned to the national stage as <strong>Ronald Reagan</strong> was inaugurated, a moment coinciding with the long-awaited release of the American hostages from Iran. Despite a harrowing assassination attempt in March, the President successfully pushed through his \"Supply-Side\" economic program, cutting taxes and deregulating industries, while the first flight of the Space Shuttle Columbia signaled a new era of reusable space travel.",
    1982: "Economic hardship persisted as the nation faced its deepest recession since the Great Depression, with unemployment hitting 10.8%. To combat the rising tide of drug-related crime, the administration formally declared a \"War on Drugs,\" while in the tech sector, Time magazine broke tradition by naming the \"Personal Computer\" its Man of the Year.",
    1983: "Confrontation with the \"Evil Empire\" intensified after the Soviet Union shot down a Korean airliner, leading to <strong>Reagan</strong> to announce the Strategic Defense Initiative (nicknamed \"Star Wars\"). On the domestic cultural front, the nation was captivated by the premiere of the \"Motown 25\" special where <strong>Michael Jackson</strong> debuted the moonwalk, and the tragic bombing of the Marine barracks in Beirut underscored the perils of Middle Eastern intervention.",
    1984: "Re-election arrived in a landslide as <strong>Reagan</strong>’s \"Morning in America\" campaign swept 49 states, defeating <strong>Walter Mondale</strong> and the first female vice-presidential candidate on a major ticket, <strong>Geraldine Ferraro</strong>. The summer Olympics in Los Angeles served as a showcase for American athletic dominance, though the event was boycotted by the Soviet bloc in retaliation for the 1980 U.S. boycott of Moscow.",
    1985: "Diplomacy began to thaw as <strong>Reagan</strong> met the new, reform-minded Soviet leader <strong>Mikhail Gorbachev</strong> in Geneva, marking the first of several historic summits. In the world of philanthropy, the \"Live Aid\" concert mobilized millions to fight famine in Ethiopia, while the discovery of the hole in the ozone layer sparked a global environmental awakening.",
    1986: "Disaster struck in January when the Space Shuttle Challenger exploded shortly after liftoff, killing all seven crew members, including teacher <strong>Christa McAuliffe</strong>, and grounding the shuttle program for years. Later in the year, the administration was rocked by the Iran-Contra Affair, a scandal involving the secret sale of weapons to Iran to fund anti-communist rebels in Nicaragua.",
    1987: "Challenge was issued at the Brandenburg Gate where <strong>Reagan</strong> famously commanded, \"Mr. <strong>Gorbachev</strong>, tear down this wall!\" While the stock market suffered a terrifying collapse on \"Black Monday\" in October, the year ended with the signing of the INF Treaty, the first agreement in history to actually reduce the nuclear arsenals of the two superpowers.",
    1988: "Continuity was the theme of the election as Vice President <strong>George H.W. Bush</strong> defeated <strong>Michael Dukakis</strong>, promising a \"kinder, gentler nation.\" The year was also marked by the environmental catastrophe of the Yellowstone fires and the devastating bombing of Pan Am Flight 103 over Lockerbie, Scotland.",
    1989: "Freedom swept across Eastern Europe as the Berlin Wall finally fell in November, a symbolic end to the Cold War that few had predicted would happen so suddenly. Domestically, the Exxon Valdez oil spill in Alaska became a rallying cry for environmentalists, while the \"War on Drugs\" reached a peak with the U.S. invasion of Panama to oust <strong>Manuel Noriega</strong>.",
    1990: "Aggression in the Persian Gulf forced a global response after Iraq’s <strong>Saddam Hussein</strong> invaded Kuwait, leading President <strong>Bush</strong> to organize a vast international coalition. At home, the signing of the Americans with Disabilities Act (ADA) represented a landmark victory for civil rights, and the Hubble Space Telescope was launched into orbit, despite initial mirror defects.",
    1991: "Liberation was achieved in early February as Operation Desert Storm swiftly drove Iraqi forces out of Kuwait using high-tech weaponry. The year reached a historic finale in December when the Soviet Union officially dissolved, leaving the United States as the world's sole remaining superpower.",
    1992: "Friction at home overshadowed victory abroad as the Los Angeles Riots erupted following the acquittal of police officers in the <strong>Rodney King</strong> beating case. In the political arena, third-party candidate <strong>Ross Perot</strong> siphoned off enough votes to help Democrat <strong>Bill Clinton</strong> defeat <strong>Bush</strong>, promising to focus \"like a laser beam\" on the economy.",
    1993: "Reform and tragedy marked the start of the <strong>Clinton</strong> era, from the signing of the NAFTA trade agreement to the disastrous siege of the Branch Davidian compound in Waco, Texas. In February, a truck bomb exploded below the World Trade Center, a chilling precursor to the domestic and international terrorism that would define the coming decade.",
    1994: "Political realignment occurred in the \"Republican Revolution,\" as <strong>Newt Gingrich</strong>’s \"Contract with America\" led the GOP to its first House majority in forty years. Culturally, the nation was transfixed by the low-speed chase and arrest of <strong>O.J. Simpson</strong>, a spectacle that dominated the burgeoning 24-hour news cycle.",
    1995: "Domestic terrorism reached a horrific peak in April when a truck bomb destroyed the Alfred P. Murrah Federal Building in Oklahoma City, killing 168 people. In Washington, the year ended with a bitter government shutdown as <strong>Clinton</strong> and the Republican Congress clashed over the federal budget.",
    1996: "Resilience was displayed during the Centennial Olympic Games in Atlanta, despite a pipe bomb attack in Centennial Park. <strong>Clinton</strong> won re-election by adopting more centrist policies, such as welfare reform, while the successful cloning of Dolly the Sheep sparked intense ethical debates over the future of biotechnology.",
    1997: "Prosperity was fueled by the \"Dot-com\" boom as the World Wide Web became a mainstream phenomenon, transforming commerce and communication. The nation joined the world in mourning the death of <strong>Princess Diana</strong>, while the Mars Pathfinder landed on the Red Planet, sending back unprecedented high-resolution images.",
    1998: "Turmoil gripped the executive branch when the <strong>Monica Lewinsky</strong> scandal led to the impeachment of <strong>Bill Clinton</strong> by the House of Representatives. Despite the political circus, the U.S. economy continued to soar, achieving its first federal budget surplus in a generation.",
    1999: "Anxiety over the \"Y2K bug\" grew as the millennium approached, with fears that computer systems would fail at the stroke of midnight. The year was also scarred by the Columbine High School massacre, which ignited a fierce national debate over gun control and school safety that continues to this day.",
    2000: "Uncertainty defined the turn of the century when the presidential election between <strong>George W. Bush</strong> and <strong>Al Gore</strong> ended in a dead heat in Florida. After weeks of legal battles and a Supreme Court intervention in Bush v. Gore, the Texas governor was declared the winner, though the nation remained deeply polarized by the result.",
    2001: "Catastrophe fundamentally altered the course of history on September 11th, when Al-Qaeda terrorists hijacked four planes to attack the World Trade Center and the Pentagon. In the aftermath, the U.S. launched the \"War on Terror,\" invading Afghanistan to oust the Taliban, and the Department of Homeland Security was created to fortify the nation.",
    2002: "Vigilance became the new normal with the passage of the Patriot Act and the controversial opening of the detention camp at Guantanamo Bay. In the corporate world, the collapse of Enron and WorldCom exposed massive accounting frauds, leading to new regulations in the Sarbanes-Oxley Act.",
    2003: "Preemption was the strategy as the U.S. led an invasion of Iraq, citing the suspected presence of weapons of mass destruction. While the regime of <strong>Saddam Hussein</strong> was quickly toppled, a violent insurgency began to take hold. On the scientific front, the space shuttle Columbia tragically disintegrated upon re-entry, claiming the lives of all seven astronauts.",
    2004: "Conflict and controversy marked <strong>Bush</strong>’s re-election year, as the Abu Ghraib prison scandal damaged the nation’s moral standing abroad. In the social sphere, Massachusetts became the first state to legalize same-sex marriage, sparking a nationwide debate over the definition of the institution.",
    2005: "Failure of infrastructure and federal response came to a head when Hurricane Katrina devastated New Orleans and the Gulf Coast. The images of suffering in the Superdome and the slow pace of aid led to a significant decline in public confidence in the federal government’s disaster preparedness.",
    2006: "Stalemate in Iraq led to a \"Blue Wave\" in the midterm elections, as Democrats regained control of both houses of Congress for the first time in over a decade. Meanwhile, the social media revolution gained steam with the public launch of Twitter, and Google’s acquisition of YouTube signaled the dominance of digital video.",
    2007: "Instability in the housing market began to show cracks that would soon threaten the global financial system. To address the deteriorating situation in Iraq, President <strong>Bush</strong> announced the \"Surge,\" a massive influx of troops that succeeded in reducing sectarian violence but remained politically divisive.",
    2008: "Crisis turned to collapse as the Great Recession began, triggered by the subprime mortgage meltdown and the failure of Lehman Brothers. In November, the nation made history by electing <strong>Barack Obama</strong> as the first African American President, as he campaigned on a platform of \"Hope and Change.\"",
    2009: "Intervention was the immediate priority of the <strong>Obama</strong> administration, which passed a massive $787 billion stimulus package and orchestrated the auto industry bailout to prevent total economic collapse. The year also saw the \"Tea Party\" movement emerge as a populist conservative response to government spending and the proposed healthcare overhaul.",
    2010: "Transformation of the American healthcare system was achieved with the passage of the Affordable Care Act (Obamacare), the most significant expansion of the social safety net in decades. In the Gulf of Mexico, the Deepwater Horizon oil spill became the largest marine environmental disaster in history, challenging the administration’s focus on energy and regulation.",
    2011: "Justice for the victims of the September 11 attacks was finally secured in May when U.S. Navy SEALs carried out a daring raid in Abbottabad, Pakistan, resulting in the death of <strong>Osama bin Laden</strong>. On the domestic front, the \"Occupy Wall Street\" movement highlighted growing frustrations with income inequality, while the final flight of the Space Shuttle Atlantis brought a symbolic end to thirty years of the shuttle program.",
    2012: "Persistence defined the political landscape as <strong>Barack Obama</strong> won re-election against <strong>Mitt Romney</strong>, buoyed by a slowly recovering economy. The year was marked by the tragedy of the Sandy Hook Elementary School shooting, which reignited a fierce national debate over gun control, and the landing of the Curiosity rover on Mars, which began a new chapter in planetary exploration.",
    2013: "Surveillance and privacy became the center of a global firestorm after whistleblower <strong>Edward Snowden</strong> leaked classified documents revealing the vast scale of NSA data collection. In the judicial sphere, the Supreme Court struck down the Defense of Marriage Act (DOMA), while the acquittal of <strong>George Zimmerman</strong> in Florida sparked the birth of the Black Lives Matter movement.",
    2014: "Tensions with a resurgent Russia flared following the annexation of Crimea, leading to a new era of diplomatic sanctions. Domestically, the city of Ferguson, Missouri, became a flashpoint for civil unrest following the police shooting of <strong>Michael Brown</strong>, further intensifying the national conversation regarding racial justice and policing.",
    2015: "Equality reached a landmark milestone when the Supreme Court ruled in Obergefell v. Hodges that the fundamental right to marry is guaranteed to same-sex couples. Internationally, the United States joined the Paris Agreement on climate change and finalized a controversial nuclear deal with Iran, seeking to address global threats through multilateral diplomacy.",
    2016: "Populism and polarization reshaped the political order in one of the most contentious elections in American history. Defying almost all polling and conventional wisdom, real estate mogul and reality TV star <strong>Donald J. Trump</strong> won the presidency on a \"Make America Great Again\" platform, tapping into a deep-seated desire for change among the working class in the Rust Belt.",
    2017: "Disruption arrived in Washington as the <strong>Trump</strong> administration moved to roll back Obama-era regulations, withdraw from the Paris Agreement, and implement a significant tax overhaul. The nation was also gripped by the #MeToo movement, a cultural reckoning that exposed systemic sexual harassment and assault across industries ranging from Hollywood to the halls of Congress.",
    2018: "Friction at the southern border became a central political issue as the \"Zero Tolerance\" policy led to the controversial separation of migrant families. In the midterm elections, a \"Blue Wave\" returned the House of Representatives to Democratic control, with <strong>Nancy Pelosi</strong> returning as Speaker, setting the stage for two years of intense legislative gridlock.",
    2019: "Impeachment proceedings dominated the national news for the third time in history, as the House charged President <strong>Trump</strong> with abuse of power and obstruction of Congress related to dealings with Ukraine. Meanwhile, the U.S. officially created the Space Force as a new branch of the military, and the economy reached record-low unemployment before the world was alerted to a new virus in China.",
    2020: "Catastrophe and upheaval defined a year of unprecedented crises as the COVID-19 pandemic shuttered the global economy and claimed hundreds of thousands of American lives. The summer saw the largest civil rights protests in a generation following the death of <strong>George Floyd</strong>, and the year concluded with a bitter election in which <strong>Joe Biden</strong> defeated the incumbent <strong>Trump</strong>.",
    2021: "Stability was threatened on January 6th when a mob of supporters of the outgoing president stormed the U.S. Capitol in an attempt to halt the certification of the election. After a peaceful inauguration, the <strong>Biden</strong> administration focused on the mass distribution of vaccines and passed the American Rescue Plan, while the year ended with the chaotic final withdrawal of U.S. troops from Afghanistan.",
    2022: "Reversal and war characterized the year as the Supreme Court overturned Roe v. Wade in the Dobbs decision, returning the authority to regulate abortion to the states. Abroad, the United States led the Western response to the Russian invasion of Ukraine, providing billions in military aid to counter the largest land war in Europe since 1945.",
    2023: "Innovation in Artificial Intelligence reached a fever pitch as generative AI tools became mainstream, sparking both wonder and existential dread about the future of work and truth. In Congress, history was made when <strong>Kevin McCarthy</strong> was ousted as Speaker of the House in a mid-term rebellion, reflecting the deep fractures within the Republican majority.",
    2024: "Litigation and electioneering merged into a single narrative as <strong>Donald Trump</strong> campaigned for a return to the White House while simultaneously facing multiple criminal trials. The election cycle was further stunned by President <strong>Biden</strong>'s late withdrawal from the race, leading to <strong>Kamala Harris</strong> assuming the mantle as the Democratic nominee in a whirlwind summer of political realignment.",
    2025: "Restoration or transformation began as the newly inaugurated administration moved to address high inflation and solidify domestic energy production. The year was marked by a renewed focus on the Pacific theater, as trade tensions and naval posturing between the United States and China became the primary focus of American grand strategy in a rapidly changing multipolar world.",
    2026: "Commemoration of the United States Semiquincentennial—the nation's 250th birthday—was marked by a profound juxtaposition of earthly conflict and celestial breakthrough. While the outbreak of the <strong>Iran War</strong> presented the most significant strategic challenge to the Western alliance in decades, the successful return of the <strong>Artemis II</strong> mission captured the global imagination. As the first crewed spacecraft to reach the vicinity of the Moon since the conclusion of the Apollo program 54 years prior, the mission’s triumph stood as a testament to American technological resilience."
};

function updateChroniclePopup() {
    const title = document.getElementById('popup-year-title');
    const info = document.getElementById('popup-year-info');
    
    title.innerText = `Year ${currentChronicleYear}`;
    
    // Use entry if exists, otherwise placeholder
    let details = chronicleEntries[currentChronicleYear] || "Information coming soon.";
    
    // Check if president changed this year
    const activePresidents = presidentsData.filter(p => currentChronicleYear >= p.startYear && currentChronicleYear <= (p.endYear || 2025));
    if (activePresidents.length > 0) {
        activePresidents.forEach(p => {
            details += `<br><br><span style="color: var(--accent-gold); font-size: 0.95rem; font-weight: bold;">President ${p.name}</span><br><span style="font-size: 0.85rem; color: #aaa; line-height: 1.5; display: inline-block; margin-top: 5px;">${p.summary}</span>`;
        });
    }

    info.innerHTML = details;

    // Boundary check for arrows
    document.querySelector('.nav-left').disabled = (currentChronicleYear <= 1776);
    document.querySelector('.nav-right').disabled = (currentChronicleYear >= 2026);
    document.querySelector('.nav-up').disabled = (currentChronicleYear - 10 < 1776);
    document.querySelector('.nav-down').disabled = (currentChronicleYear + 10 > 2026);

    // Highlight the active year in the grid
    document.querySelectorAll('.chronicle-year').forEach(el => {
        el.classList.toggle('active', parseInt(el.innerText) === currentChronicleYear);
    });
}

function initChronicleNavigation() {
    document.addEventListener('keydown', (e) => {
        const popup = document.getElementById('chronicle-popup');
        if (!popup.classList.contains('active')) return;

        switch (e.key) {
            case 'ArrowLeft':
                changeChronicleYear(-1);
                break;
            case 'ArrowRight':
                changeChronicleYear(1);
                break;
            case 'ArrowUp':
                changeChronicleYear(-10);
                break;
            case 'ArrowDown':
                changeChronicleYear(10);
                break;
        }
    });
}

// Global Music State
window.musicState = {
    tracks: [
        { file: 'AllmerMusicAmericanAnthem.mp3', title: 'American Anthem' },
        { file: 'Allmer Music American Portrait A World Destroyed.mp3', title: 'A World Destroyed' },
        { file: 'AllmerMusic Kissinger The Pentarchy .mp3', title: 'The Pentarchy' },
        { file: 'AllmerMusicAmericanPortraitTheLivingAndTheDead.mp3', title: 'The Living And The Dead' },
        { file: 'AllmerMusicCulturalRevolution.mp3', title: 'Cultural Revolution' },
        { file: 'AllmerMusicDesertFire.mp3', title: 'Desert Fire' },
        { file: 'AllmerMusicLandoftheFree.mp3', title: 'Land of the Free' }
    ],
    currentIndex: -1,
    isPlaying: false,
    audio: new Audio(),
    isMiniPlayerClosed: false
};

// Initialize ends of ended track
window.musicState.audio.addEventListener('ended', () => {
    playNextTrack();
});

function updateMiniPlayerVisibility(viewId) {
    const mini = document.getElementById('mini-music-player');
    if (!mini) return;

    // Show if a track is active (even if paused) and NOT on music page
    const isTrackActive = window.musicState.currentIndex !== -1;
    if (isTrackActive && viewId !== 'music' && !window.musicState.isMiniPlayerClosed) {
        mini.style.display = 'flex';
        setTimeout(() => mini.classList.add('visible'), 10);
    } else {
        mini.classList.remove('visible');
        setTimeout(() => {
            if (!mini.classList.contains('visible')) mini.style.display = 'none';
        }, 300);
    }
}

function playTrack(index) {
    if (index < 0 || index >= window.musicState.tracks.length) return;
    
    const track = window.musicState.tracks[index];
    const isSameTrack = window.musicState.currentIndex === index;

    if (isSameTrack) {
        if (window.musicState.audio.paused) {
            window.musicState.audio.play();
            window.musicState.isPlaying = true;
            window.musicState.isMiniPlayerClosed = false; // Re-open if manually resumed
        } else {
            window.musicState.audio.pause();
            window.musicState.isPlaying = false;
        }
    } else {
        window.musicState.currentIndex = index;
        window.musicState.audio.src = `American Portrait Music/${track.file}`;
        window.musicState.audio.play();
        window.musicState.isPlaying = true;
        window.musicState.isMiniPlayerClosed = false; // Re-open if user closed it but manually triggered new track
    }

    updateMusicUI();
}

function updateMusicUI() {
    const track = window.musicState.tracks[window.musicState.currentIndex];
    
    // Update Mini Player
    const miniTitle = document.getElementById('mini-track-title');
    const miniPlayBtn = document.getElementById('mini-play-pause');
    if (miniTitle && track) miniTitle.innerText = track.title;
    if (miniPlayBtn) miniPlayBtn.innerText = window.musicState.audio.paused ? '▶' : '⏸';

    // Update main Music view items
    document.querySelectorAll('.audio-track-card').forEach((card, idx) => {
        const btn = card.querySelector('.play-trigger-btn');
        if (idx === window.musicState.currentIndex) {
            card.classList.add('playing');
            if (btn) btn.innerText = window.musicState.audio.paused ? 'PLAY' : 'PAUSE';
        } else {
            card.classList.remove('playing');
            if (btn) btn.innerText = 'PLAY';
        }
    });

    const currentView = document.querySelector('.view.active');
    if (currentView) updateMiniPlayerVisibility(currentView.id);
}

function playNextTrack() {
    let next = window.musicState.currentIndex + 1;
    if (next >= window.musicState.tracks.length) next = 0;
    playTrack(next);
}

function playPrevTrack() {
    let prev = window.musicState.currentIndex - 1;
    if (prev < 0) prev = window.musicState.tracks.length - 1;
    playTrack(prev);
}

function initMusicHandlers() {
    // Mini Player Listeners
    const miniPlay = document.getElementById('mini-play-pause');
    const miniPrev = document.getElementById('mini-prev');
    const miniNext = document.getElementById('mini-next');
    const miniVol = document.getElementById('mini-volume');
    const miniClose = document.getElementById('mini-player-close');

    if (miniPlay) miniPlay.onclick = () => {
        if (window.musicState.currentIndex === -1) playTrack(0);
        else playTrack(window.musicState.currentIndex);
    };
    if (miniPrev) miniPrev.onclick = playPrevTrack;
    if (miniNext) miniNext.onclick = playNextTrack;
    if (miniVol) miniVol.oninput = (e) => {
        window.musicState.audio.volume = e.target.value;
    };
    if (miniClose) miniClose.onclick = () => {
        window.musicState.audio.pause();
        window.musicState.isPlaying = false;
        window.musicState.isMiniPlayerClosed = true;
        updateMusicUI();
    };
}

function initIntroToggle() {
    const btnShow = document.getElementById('btn-show-galleries');
    const btnHide = document.getElementById('btn-hide-galleries');
    const mainContent = document.getElementById('intro-main-content');
    const galleriesContent = document.getElementById('intro-galleries-content');
    const title = document.getElementById('intro-title');

    if (btnShow && btnHide && mainContent && galleriesContent) {
        btnShow.onclick = () => {
            mainContent.style.display = 'none';
            galleriesContent.style.display = 'block';
            btnShow.style.display = 'none';
            btnHide.style.display = 'block';
            title.innerText = 'About A Portrait';
        };

        btnHide.onclick = () => {
            mainContent.style.display = 'block';
            galleriesContent.style.display = 'none';
            btnShow.style.display = 'block';
            btnHide.style.display = 'none';
            title.innerText = 'Introduction';
        };
    }
}

function initMusicPlayer() {
    const container = document.getElementById('audio-player-container');
    if (!container) return;
    container.innerHTML = ''; // Clear for re-init
    
    window.musicState.tracks.forEach((track, idx) => {
        const wrap = document.createElement('div');
        wrap.className = 'audio-track-card';
        
        const title = document.createElement('h3');
        title.innerText = track.title;
        title.className = 'audio-title';
        
        const btn = document.createElement('button');
        btn.className = 'play-trigger-btn';
        btn.innerText = 'PLAY';
        btn.style.marginTop = '1rem';
        btn.style.padding = '0.5rem 1.5rem';
        btn.style.background = 'var(--red-accent)';
        btn.style.border = 'none';
        btn.style.color = '#fff';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        btn.style.fontWeight = 'bold';
        btn.style.letterSpacing = '1px';
        
        btn.onclick = () => playTrack(idx);

        wrap.appendChild(title);
        wrap.appendChild(btn);
        container.appendChild(wrap);
    });
}

function initLibraries() {
    const kissingerBooks = [
        { year: 2024, title: 'Genesis: Artificial Intelligence, Hope, and the Human Spirit', reviewed: true, reviewId: 'review-genesis' },
        { year: 2022, title: 'Leadership: Six Studies in World Strategy', reviewed: true, reviewId: 'review-leadership' },
        { year: 2021, title: 'The Age of AI: And Our Human Future', reviewed: true, reviewId: 'review-ageofai' },
        { year: 2014, title: 'World Order' },
        { year: 2011, title: 'On China' },
        { year: 2003, title: 'Crisis: The Anatomy of Two Major Foreign Policy Crises' },
        { year: 2003, title: 'Ending the Vietnam War' },
        { year: 2001, title: 'Does America Need a Foreign Policy?' },
        { year: 1999, title: 'Years of Renewal' },
        { year: 1994, title: 'Diplomacy' },
        { year: 1982, title: 'Years of Upheaval' },
        { year: 1979, title: 'White House Years' },
        { year: 1969, title: 'American Foreign Policy, Three Essays' },
        { year: 1965, title: 'The Troubled Partnership' },
        { year: 1961, title: 'The Necessity for Choice' },
        { year: 1957, title: 'Nuclear Weapons and Foreign Policy', reviewed: true, reviewId: 'review-nuclear' },
        { year: 1957, title: 'A World Restored' },
        { year: 1950, title: 'The Meaning of History' }
    ];

    const carterBooks = [
        { year: 2018, title: 'Faith: A Journey for All' },
        { year: 2015, title: 'A Full Life: Reflections at Ninety' },
        { year: 2014, title: 'A Call to Action' },
        { year: 2011, title: 'Through the Year with Jimmy Carter' },
        { year: 2010, title: 'White House Diary' },
        { year: 2009, title: 'We Can Have Peace in the Holy Land' },
        { year: 2008, title: 'A Remarkable Mother' },
        { year: 2007, title: 'Beyond the White House' },
        { year: 2006, title: 'Palestine: Peace Not Apartheid' },
        { year: 2006, title: 'Faith & Freedom' },
        { year: 2005, title: 'Our Endangered Values' },
        { year: 2004, title: 'Sharing Good Times' },
        { year: 2003, title: "The Hornet's Nest" },
        { year: 2001, title: 'Christmas in Plains: Memories' },
        { year: 2001, title: 'An Hour Before Daylight' },
        { year: 1998, title: 'The Virtues of Aging' },
        { year: 1997, title: 'Sources of Strength' },
        { year: 1996, title: 'Living Faith' },
        { year: 1995, title: 'Always a Reckoning' },
        { year: 1994, title: 'An Outdoor Journal' },
        { year: 1993, title: 'Talking Peace' },
        { year: 1992, title: 'Turning Point' },
        { year: 1987, title: 'Everything to Gain' },
        { year: 1985, title: 'The Blood of Abraham' },
        { year: 1984, title: 'Negotiation' },
        { year: 1982, title: 'Keeping Faith: Memoirs of a President' },
        { year: 1977, title: 'A Government as Good as Its People' },
        { year: 1975, title: 'Why Not the Best?' }
    ];

    renderBooks('kissinger-books', kissingerBooks, 'kissinger');
    renderBooks('carter-books', carterBooks, 'carter');

    function renderBooks(containerId, books, authorTag) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        books.forEach(book => {
            const wrap = document.createElement('div');
            wrap.className = 'book-cover';
            wrap.dataset.author = authorTag;
            
            if (book.reviewed) {
                const badge = document.createElement('div');
                badge.className = 'review-badge';
                badge.innerText = 'REVIEWED';
                wrap.appendChild(badge);
                
                wrap.addEventListener('click', () => {
                   window.location.hash = '#' + book.reviewId;
                });
            }

            const year = document.createElement('div');
            year.className = 'book-year';
            year.innerText = book.year;

            const title = document.createElement('div');
            title.className = 'book-title';
            title.innerText = book.title;

            wrap.appendChild(year);
            wrap.appendChild(title);
            container.appendChild(wrap);
        });
    }
}

// ===== QUOTES SYSTEM =====
const quotesData = {
    kissinger: [
        { text: "Where there are no absolute values, there is spiritual emptiness. The worst thing about a loss of faith is not that someone has stopped believing something, but that they are ready to believe anything.", author: "Fritz Kraemer" },
        { text: "Thousands of the most modern tanks will be of no use for the defense of a country, if the men in there are unwilling to fight, and here I say it, to die for the cause.", author: "Fritz Kraemer" },
        { text: "Without your German accent, you would just be a regular prisoner of war rotting in the cell. But now you are a deserter. We have a wall for cases like that.", author: "August Weber" },
        { text: "That is humanity in the 20th century. People reach such a stupor of suffering that life and death, animation or immobility can't be differentiated anymore. And then, who is dead and who is alive? The man whose agonized face stares at me from the cot or the man who stands with a bowed head and emaciated body?", author: "Henry Kissinger" },
        { text: "When I went into the army I was a refugee and when I got out I was an immigrant.", author: "Henry Kissinger" },
        { text: "Never namedrop. Rockefeller told me that.", author: "Henry Kissinger" },
        { text: "One does not remain in power through unscrupulousness alone. It also takes cynicism.", author: "Henry Kissinger" },
        { text: "I always thought the right thing to do with accusations was to ignore or deny them. But then I realized something. The media is just like my dog Checkers. When neglected, they keep sniffing around the house, digging up old bones. And worst of all, they start barking until everyone watches from the street. But give them some attention, pat them on the back, and in no time even the crooked media can become a man’s best friend.", author: "Henry Kissinger" },
        { text: "A man is not finished when he is defeated. He is finished when he quits.", author: "Richard Nixon" },
        { text: "You leave, and my wish is that you and your country will find happiness under this sky. But, mark it well, that if I shall die here on the spot and in my country that I love, it is too bad, because we all are born and must die one day. I have only committed this mistake of believing in you, the Americans.", author: "Sirik Matak" }
    ],
    carter: [
        { text: "To me, faith is not just a noun, but also a verb.", author: "Jimmy Carter" },
        { text: "God always answers prayers. Sometimes it's 'yes.' Sometimes it’s 'no.' Sometimes it's 'you gotta be kidding.'", author: "Jimmy Carter" }
    ]
};

let currentQuoteSet = [];
let currentQuoteIndex = 0;

function openQuotes(character) {
    currentQuoteSet = quotesData[character];
    currentQuoteIndex = 0;
    renderQuote();
    document.getElementById('quotes-overlay').classList.add('active');
}

function nextQuote() {
    currentQuoteIndex++;
    if (currentQuoteIndex >= currentQuoteSet.length) {
        currentQuoteIndex = 0; // Loop back
    }
    renderQuote();
}

function prevQuote() {
    currentQuoteIndex--;
    if (currentQuoteIndex < 0) {
        currentQuoteIndex = currentQuoteSet.length - 1; // Loop back
    }
    renderQuote();
}

function renderQuote() {
    const quote = currentQuoteSet[currentQuoteIndex];
    document.getElementById('quote-text').innerText = `"${quote.text}"`;
    document.getElementById('quote-author').innerText = quote.author;
    document.getElementById('quote-counter').innerText = `${currentQuoteIndex + 1} / ${currentQuoteSet.length}`;
}

function closeQuotes() {
    document.getElementById('quotes-overlay').classList.remove('active');
}

function handleMobileBack() {
    const hash = window.location.hash;
    if (hash === '' || hash === '#start' || hash === '#start-page') {
        return;
    } else if (hash === '#menu' || hash === '#about') {
        window.location.hash = '#start';
    } else {
        window.location.hash = '#menu';
    }
}

// Keyboard navigation for Quotes
document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('quotes-overlay');
    if (!overlay.classList.contains('active')) return;

    if (e.key === 'ArrowLeft') {
        prevQuote();
    } else if (e.key === 'ArrowRight') {
        nextQuote();
    }
});


const gridContainer = document.getElementById('grid-container');
const COLS = 26;
const ROWS = 26;

let currentPerson = 'Henry Kissinger';

const btnKissinger = document.getElementById('btn-kissinger');
const btnCarter = document.getElementById('btn-carter');

btnKissinger.addEventListener('click', () => switchPerson('Henry Kissinger'));
btnCarter.addEventListener('click', () => switchPerson('Jimmy Carter'));

function switchPerson(person) {
    if (currentPerson === person) return;
    currentPerson = person;

    btnKissinger.classList.toggle('active', person === 'Henry Kissinger');
    btnCarter.classList.toggle('active', person === 'Jimmy Carter');

    render();
}

// Initialize Grid
function initGrid() {
    gridContainer.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            gridContainer.appendChild(cell);
        }
    }
}

// Perimeter Path generation (Exactly 100 years)
function generatePerimeterPath(startYear, personName) {
    const path = [];
    let currentYear = startYear;

    // Left column: (25, 0) to (0, 0) [26 cells]
    for (let r = ROWS - 1; r >= 0; r--) {
        path.push({ r: r, c: 0, year: currentYear, person: personName });
        currentYear++;
    }

    // Top row: (0, 1) to (0, 25) [25 cells]
    for (let c = 1; c < COLS; c++) {
        path.push({ r: 0, c: c, year: currentYear, person: personName });
        currentYear++;
    }

    // Right column: (1, 25) to (25, 25) [25 cells]
    for (let r = 1; r < ROWS; r++) {
        path.push({ r: r, c: 25, year: currentYear, person: personName });
        currentYear++;
    }

    // Bottom row: (25, 24) to (25, 1) [24 cells]
    for (let c = COLS - 2; c >= 1; c--) {
        path.push({ r: 25, c: c, year: currentYear, person: personName });
        currentYear++;
    }

    return path;
}

// Image data for specific years and books
const yearImages = {
    'Kissinger-1971': {
        image: 'kissinger_1971.png',
        caption: '1971',
        type: 'photo',
        displayText: '📷'
    },
    'Kissinger-2023': {
        image: 'kissinger_2023.jpg',
        caption: '2023',
        type: 'photo',
        displayText: '📷'
    },
    'Carter-1976': {
        image: 'carter_1976.jpg',
        caption: '1976',
        type: 'photo',
        displayText: '📷'
    },
    'Carter-1980': {
        image: 'carter_1980.jpg',
        caption: '1980',
        type: 'photo',
        displayText: '📷'
    },
    'Kissinger-2011': {
        image: 'book_on_china.jpg',
        caption: 'On China (2011)',
        type: 'book',
        displayText: '📚'
    },
    'Kissinger-2002': [
        {
            image: 'book_crisis.jpg',
            caption: 'Crisis: The Anatomy of Two Major Foreign Policy Crises (2002)',
            type: 'book',
            displayText: '📚'
        },
        {
            image: 'book_vietnam_war.jpg',
            caption: 'Ending the Vietnam War (2002)',
            type: 'book',
            displayText: '📚'
        }
    ],
    'Kissinger-2014': {
        image: 'book_world_order.png',
        caption: 'World Order (2014)',
        type: 'book',
        displayText: '📚'
    },
    'Kissinger-2001': {
        image: 'book_foreign_policy.jpg',
        caption: 'Does America Need a Foreign Policy? (2001)',
        type: 'book',
        displayText: '📚'
    },
    'Kissinger-2021': {
        image: 'book_age_of_ai.jpg',
        caption: 'The Age of AI (2021)',
        type: 'book',
        displayText: '📚',
        reviewLink: 'https://simonallmer.com/societyreview/the-age-of-ai'
    },
    'Kissinger-2022': {
        image: 'book_leadership.jpg',
        caption: 'Leadership (2022)',
        type: 'book',
        displayText: '📚',
        reviewLink: 'https://simonallmer.com/societyreview/leadership'
    },
    'Kissinger-1994': {
        image: 'book_placeholder.jpg',
        caption: 'Diplomacy (1994)',
        type: 'book',
        displayText: '📚'
    },
    'Kissinger-1985': {
        image: 'book_placeholder.jpg',
        caption: 'Observations: Selected Speeches and Essays, 1982-1984 (1985)',
        type: 'book',
        displayText: '📚'
    },
    'Kissinger-1982': {
        image: 'book_placeholder.jpg',
        caption: 'Years of Upheaval (1982)',
        type: 'book',
        displayText: '📚'
    },
    'Kissinger-1981': {
        image: 'book_placeholder.jpg',
        caption: 'For the Record: Selected Statements, 1977-1980 (1981)',
        type: 'book',
        displayText: '📚'
    },
    'Kissinger-1979': {
        image: 'book_placeholder.jpg',
        caption: 'White House Years (1979)',
        type: 'book',
        displayText: '📚'
    },
    'Kissinger-1969': {
        image: 'book_placeholder.jpg',
        caption: 'American Foreign Policy, Three Essays (1969)',
        type: 'book',
        displayText: '📚'
    },
    'Kissinger-1965': {
        image: 'book_placeholder.jpg',
        caption: 'The Troubled Partnership: A Reappraisal of the Atlantic Alliance (1965)',
        type: 'book',
        displayText: '📚'
    },
    'Kissinger-1961': {
        image: 'book_placeholder.jpg',
        caption: 'The Necessity for Choice: Prospects of American Foreign Policy (1961)',
        type: 'book',
        displayText: '📚'
    },
    'Kissinger-1957': {
        image: 'book_placeholder.jpg',
        caption: 'Nuclear Weapons and Foreign Policy (1957)',
        type: 'book',
        displayText: '📚'
    },
    'Kissinger-1950': {
        image: 'book_placeholder.jpg',
        caption: 'The Meaning of History: Reflections on Spengler, Toynbee, and Kant (1950)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-2018': {
        image: 'book_placeholder.jpg',
        caption: 'Faith: A Journey for All (2018)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-2015': {
        image: 'book_placeholder.jpg',
        caption: 'A Full Life: Reflections at Ninety (2015)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-2014': {
        image: 'book_placeholder.jpg',
        caption: 'A Call to Action: Women, Religion, Violence, and Power (2014)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-2011': {
        image: 'book_placeholder.jpg',
        caption: 'Through the Year with Jimmy Carter: 366 Daily Meditations (2011)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-2010': {
        image: 'book_placeholder.jpg',
        caption: 'White House Diary (2010)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-2009': {
        image: 'book_placeholder.jpg',
        caption: 'We Can Have Peace in the Holy Land: A Plan That Will Work (2009)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-2008': {
        image: 'book_placeholder.jpg',
        caption: 'A Remarkable Mother (2008)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-2007': {
        image: 'book_placeholder.jpg',
        caption: 'Beyond the White House (2007)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-2006': [
        {
            image: 'book_placeholder.jpg',
            caption: 'Palestine: Peace Not Apartheid (2006)',
            type: 'book',
            displayText: '📚'
        },
        {
            image: 'book_placeholder.jpg',
            caption: 'Faith & Freedom: The Christian Challenge for the World (2006)',
            type: 'book',
            displayText: '📚'
        }
    ],
    'Carter-2005': {
        image: 'book_placeholder.jpg',
        caption: 'Our Endangered Values: America\'s Moral Crisis (2005)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-2004': {
        image: 'book_placeholder.jpg',
        caption: 'Sharing Good Times (2004)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-2003': {
        image: 'book_placeholder.jpg',
        caption: 'The Hornet\'s Nest: A Novel of the Revolutionary War (2003)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-2001': [
        {
            image: 'book_placeholder.jpg',
            caption: 'Christmas in Plains: Memories (2001)',
            type: 'book',
            displayText: '📚'
        },
        {
            image: 'book_placeholder.jpg',
            caption: 'An Hour Before Daylight: Memories of a Rural Boyhood (2001)',
            type: 'book',
            displayText: '📚'
        }
    ],
    'Carter-1998': {
        image: 'book_placeholder.jpg',
        caption: 'The Virtues of Aging (1998)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-1997': {
        image: 'book_placeholder.jpg',
        caption: 'Sources of Strength: Meditations on Scripture for a Living Faith (1997)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-1996': {
        image: 'book_placeholder.jpg',
        caption: 'Living Faith (1996)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-1995': {
        image: 'book_placeholder.jpg',
        caption: 'Always a Reckoning, and Other Poems (1995)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-1994': {
        image: 'book_placeholder.jpg',
        caption: 'An Outdoor Journal: Adventures and Reflections (1994)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-1993': {
        image: 'book_placeholder.jpg',
        caption: 'Talking Peace: A Vision for the Next Generation (1993)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-1992': {
        image: 'book_placeholder.jpg',
        caption: 'Turning Point: A Candidate, a State, and a Nation Come of Age (1992)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-1987': {
        image: 'book_placeholder.jpg',
        caption: 'Everything to Gain: Making the Most of the Rest of Your Life (1987)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-1985': {
        image: 'book_placeholder.jpg',
        caption: 'The Blood of Abraham: Insights into the Middle East (1985)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-1984': {
        image: 'book_placeholder.jpg',
        caption: 'Negotiation: The Alternative to Hostility (1984)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-1982': {
        image: 'book_placeholder.jpg',
        caption: 'Keeping Faith: Memoirs of a President (1982)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-1977': {
        image: 'book_placeholder.jpg',
        caption: 'A Government as Good as Its People (1977)',
        type: 'book',
        displayText: '📚'
    },
    'Carter-1975': {
        image: 'book_placeholder.jpg',
        caption: 'Why Not the Best? (1975)',
        type: 'book',
        displayText: '📚'
    }
};

function render() {
    initGrid();

    const startYear = currentPerson === 'Henry Kissinger' ? 1923 : 1924;
    const path = generatePerimeterPath(startYear, currentPerson);

    path.forEach(item => {
        const index = item.r * COLS + item.c;
        const cell = gridContainer.children[index];
        if (!cell) return;

        const square = document.createElement('div');
        square.classList.add('year-square');
        if (item.person === 'Henry Kissinger') {
            square.classList.add('kissinger');
        } else {
            square.classList.add('carter');
        }

        const imageKey = `${item.person.split(' ')[1]}-${item.year}`;
        const hasImage = yearImages[imageKey];

        if (hasImage) {
            square.classList.add('active-year');
            const firstItem = Array.isArray(hasImage) ? hasImage[0] : hasImage;
            if (firstItem.type === 'book') {
                square.classList.add('book');
            }
            square.innerText = firstItem.displayText || item.year;
            square.addEventListener('click', () => showImage(imageKey));
        } else {
            square.classList.add('inactive');
            square.innerText = item.year;
        }

        square.title = `${item.person} - ${item.year}`;
        cell.appendChild(square);
    });
}

function showImage(imageKey) {
    const data = yearImages[imageKey];
    const frameDisplay = document.getElementById('frame-display');
    const displayImage = document.getElementById('display-image');
    const displayCaption = document.getElementById('display-caption');
    const reviewLink = document.getElementById('review-link');

    const itemToShow = Array.isArray(data) ? data[0] : data;

    displayImage.src = itemToShow.image;
    displayCaption.textContent = itemToShow.caption;

    if (itemToShow.reviewLink) {
        reviewLink.href = itemToShow.reviewLink;
        reviewLink.classList.remove('hidden');
    } else {
        reviewLink.classList.add('hidden');
    }

    frameDisplay.classList.remove('hidden');
}

function hideImage() {
    const frameDisplay = document.getElementById('frame-display');
    frameDisplay.classList.add('hidden');
}

// Zoom functionality
let zoomLevel = 1;
const zoomStep = 0.2;
const minZoom = 0.5;
const maxZoom = 3;

const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const gridWrapper = document.getElementById('grid-wrapper');

zoomInBtn.addEventListener('click', () => {
    if (zoomLevel < maxZoom) {
        zoomLevel += zoomStep;
        gridContainer.style.transform = `scale(${zoomLevel})`;
    }
});

zoomOutBtn.addEventListener('click', () => {
    if (zoomLevel > minZoom) {
        zoomLevel -= zoomStep;
        gridContainer.style.transform = `scale(${zoomLevel})`;
    }
});

// Panning functionality
let isPanning = false;
let startX, startY, scrollLeft, scrollTop;

gridWrapper.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('year-square')) return;

    isPanning = true;
    startX = e.pageX - gridWrapper.offsetLeft;
    startY = e.pageY - gridWrapper.offsetTop;
    scrollLeft = gridWrapper.scrollLeft;
    scrollTop = gridWrapper.scrollTop;
});

gridWrapper.addEventListener('mouseleave', () => {
    isPanning = false;
});

gridWrapper.addEventListener('mouseup', () => {
    isPanning = false;
});

gridWrapper.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    e.preventDefault();
    const x = e.pageX - gridWrapper.offsetLeft;
    const y = e.pageY - gridWrapper.offsetTop;
    const walkX = (x - startX) * 2;
    const walkY = (y - startY) * 2;
    gridWrapper.scrollLeft = scrollLeft - walkX;
    gridWrapper.scrollTop = scrollTop - walkY;
});

// Arrow key navigation
document.addEventListener('keydown', (e) => {
    const step = 50;
    switch (e.key) {
        case 'ArrowUp':
            gridWrapper.scrollTop -= step;
            e.preventDefault();
            break;
        case 'ArrowDown':
            gridWrapper.scrollTop += step;
            e.preventDefault();
            break;
        case 'ArrowLeft':
            gridWrapper.scrollLeft -= step;
            e.preventDefault();
            break;
        case 'ArrowRight':
            gridWrapper.scrollLeft += step;
            e.preventDefault();
            break;
    }
});

// Arrow button controls
document.getElementById('arrow-up').addEventListener('click', () => {
    gridWrapper.scrollTop -= 50;
});

document.getElementById('arrow-down').addEventListener('click', () => {
    gridWrapper.scrollTop += 50;
});

document.getElementById('arrow-left').addEventListener('click', () => {
    gridWrapper.scrollLeft -= 50;
});

document.getElementById('arrow-right').addEventListener('click', () => {
    gridWrapper.scrollLeft += 50;
});

// Close display handler
document.getElementById('close-display').addEventListener('click', hideImage);

// Initial render
render();

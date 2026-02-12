// Data - Will be loaded from JSON file
let caseStudies = [];

// Load data from JSON file
async function loadData() {
    try {
        const response = await fetch('data/case-studies.json');
        caseStudies = await response.json();
        return true;
    } catch (error) {
        console.error('Error loading case studies data:', error);
        return false;
    }
}

// DOM Elements
const caseStudiesGridFull = document.getElementById('case-studies-grid-full');
const caseStudyFiltersFull = document.getElementById('case-study-filters-full');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('ion-icon');

// Helper: Extract Unique Tags
function getUniqueTags(items) {
    const tags = new Set();
    items.forEach(item => item.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
}

// Helper: Create Filter Buttons
function renderFilters(tags, container, type) {
    tags.forEach(tag => {
        const li = document.createElement('li');
        li.className = 'filter-item';
        li.textContent = tag;
        li.dataset.filter = tag;
        li.addEventListener('click', () => handleFilterClick(tag, container, type));
        container.appendChild(li);
    });
}

// Handler: Filter Click
function handleFilterClick(filter, container, type) {
    // Update Active State
    const buttons = container.querySelectorAll('.filter-item');
    buttons.forEach(btn => btn.classList.remove('active'));

    const activeBtn = Array.from(buttons).find(btn => btn.dataset.filter === filter);
    if (activeBtn) activeBtn.classList.add('active');

    // Re-render Content
    renderCaseStudiesFull(filter);
}

// Render All Case Studies (No Limit)
function renderCaseStudiesFull(filter = 'all') {
    caseStudiesGridFull.innerHTML = '';

    const filtered = filter === 'all'
        ? caseStudies
        : caseStudies.filter(cs => cs.tags.includes(filter));

    filtered.forEach(study => {
        const card = document.createElement('div');
        card.className = 'case-study-card';
        card.innerHTML = `
            <div class="card-content">
                <h3 class="case-study-title">${study.title}</h3>
                <div class="card-tags">
                    ${study.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <p class="case-study-desc">${study.description}</p>
                <a href="${study.link}" class="card-link" target="_blank">Read Case Study <ion-icon name="arrow-forward-outline"></ion-icon></a>
            </div>
        `;
        caseStudiesGridFull.appendChild(card);
    });
}

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    themeIcon.setAttribute('name', isDark ? 'sunny-outline' : 'moon-outline');
}

// Initialize
async function init() {
    // Load data from JSON file first
    const dataLoaded = await loadData();

    if (!dataLoaded) {
        console.error('Failed to load case studies data');
        return;
    }

    // Load Filters
    renderFilters(getUniqueTags(caseStudies), caseStudyFiltersFull, 'case-studies');

    // Initial Render
    renderCaseStudiesFull();

    // Event Listeners
    themeToggle.addEventListener('click', toggleTheme);

    // Check Preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    } else {
        updateThemeIcon(false);
    }
}

// Filter Click Handler Initial (All)
caseStudyFiltersFull.querySelector('[data-filter="all"]').addEventListener('click', () => handleFilterClick('all', caseStudyFiltersFull, 'case-studies'));

init();

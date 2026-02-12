// Data - Will be loaded from JSON files
let projects = [];
let publications = [];
let caseStudies = [];

// Load data from JSON files
async function loadData() {
    try {
        const [projectsRes, publicationsRes, caseStudiesRes] = await Promise.all([
            fetch('data/projects.json'),
            fetch('data/publications.json'),
            fetch('data/case-studies.json')
        ]);

        projects = await projectsRes.json();
        publications = await publicationsRes.json();
        caseStudies = await caseStudiesRes.json();

        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        return false;
    }
}


// DOM Elements
const projectsGrid = document.getElementById('projects-grid');
const publicationsList = document.getElementById('publications-list');
const projectFilters = document.getElementById('project-filters');
const publicationFilters = document.getElementById('publication-filters');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('ion-icon');
const caseStudiesGrid = document.getElementById('case-studies-grid');
const caseStudyFilters = document.getElementById('case-study-filters');

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

    // Find absolute match (text content match might be safer than dataset if special chars)
    const activeBtn = Array.from(buttons).find(btn => btn.dataset.filter === filter);
    if (activeBtn) activeBtn.classList.add('active');

    // Re-render Content
    if (type === 'projects') {
        renderProjects(filter);
    } else if (type === 'publications') {
        renderPublications(filter);
    } else if (type === 'case-studies') {
        renderCaseStudies(filter);
    }
}

// Render Projects
function renderProjects(filter = 'all') {
    projectsGrid.innerHTML = '';

    const filtered = filter === 'all'
        ? projects
        : projects.filter(p => p.tags.includes(filter));

    filtered.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <div class="card-content">
                <h3 class="project-title">${project.title}</h3>
                 <div class="card-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <p class="project-desc">${project.description}</p>
                <a href="${project.link}" class="card-link" target="_blank">View Project <ion-icon name="arrow-forward-outline"></ion-icon></a>
            </div>
        `;
        projectsGrid.appendChild(card);
    });
}

// Render Publications
function renderPublications(filter = 'all') {
    publicationsList.innerHTML = '';

    const filtered = filter === 'all'
        ? publications
        : publications.filter(p => p.tags.includes(filter));

    filtered.forEach(pub => {
        const card = document.createElement('div');
        card.className = 'publication-card';
        card.innerHTML = `
            <h3 class="pub-title"><a href="${pub.link}">${pub.title}</a></h3>
            <div class="pub-meta">
                ${pub.authors} &bull; <span class="pub-journal">${pub.journal}</span> &bull; ${pub.year}
            </div>
            <div class="pub-tags">
                 ${pub.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;
        publicationsList.appendChild(card);
    });
}

// Render Case Studies (Preview - limit to 3 on main page)
function renderCaseStudies(filter = 'all', limit = 3) {
    if (!caseStudiesGrid) return; // Guard for secondary page

    caseStudiesGrid.innerHTML = '';

    const filtered = filter === 'all'
        ? caseStudies
        : caseStudies.filter(cs => cs.tags.includes(filter));

    const displayed = filtered.slice(0, limit);

    displayed.forEach(study => {
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
        caseStudiesGrid.appendChild(card);
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
    // Load data from JSON files first
    const dataLoaded = await loadData();

    if (!dataLoaded) {
        console.error('Failed to load data');
        return;
    }

    // Load Filters
    renderFilters(getUniqueTags(projects), projectFilters, 'projects');
    renderFilters(getUniqueTags(publications), publicationFilters, 'publications');
    if (caseStudyFilters) {
        renderFilters(getUniqueTags(caseStudies), caseStudyFilters, 'case-studies');
    }

    // Initial Render
    renderProjects();
    renderPublications();
    if (caseStudiesGrid) {
        renderCaseStudies();
    }

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

// Filter Click Handlers Initial (All)
projectFilters.querySelector('[data-filter="all"]').addEventListener('click', () => handleFilterClick('all', projectFilters, 'projects'));
publicationFilters.querySelector('[data-filter="all"]').addEventListener('click', () => handleFilterClick('all', publicationFilters, 'publications'));
if (caseStudyFilters) {
    caseStudyFilters.querySelector('[data-filter="all"]').addEventListener('click', () => handleFilterClick('all', caseStudyFilters, 'case-studies'));
}

init();

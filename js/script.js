/**
 * Dr. Qingzhou Zhang - Portfolio Script
 * Interactive filtering, theme toggler, dynamic rendering, and scroll interactions.
 */

// State
let projects = [];
let publications = [];
let caseStudies = [];

// High-prestige journals for highlighting
const PRESTIGIOUS_JOURNALS = [
    'nature communications',
    'nature biotechnology',
    'cell systems',
    'molecular cell',
    'cell reports',
    'advanced functional materials'
];

// Highlighted author name for scientific credit
const AUTHOR_MATCH = /Zhang,\s*Q\.?/gi;

// DOM Elements
const projectsGrid = document.getElementById('projects-grid');
const publicationsList = document.getElementById('publications-list');
const caseStudiesGrid = document.getElementById('case-studies-grid');
const projectFilters = document.getElementById('project-filters');
const publicationFilters = document.getElementById('publication-filters');
const caseStudyFilters = document.getElementById('case-study-filters');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle ? themeToggle.querySelector('ion-icon') : null;
const header = document.querySelector('.header');
const mobileBtn = document.getElementById('mobile-menu-btn');
const navbar = document.getElementById('navbar');
const scrollIndicator = document.querySelector('.scroll-down-container');

// Load data from JSON files
async function loadData() {
    try {
        const [projectsRes, publicationsRes, caseStudiesRes] = await Promise.all([
            fetch('data/projects.json'),
            fetch('data/publications.json'),
            fetch('data/case-studies.json')
        ]);

        if (!projectsRes.ok || !publicationsRes.ok || !caseStudiesRes.ok) {
            throw new Error('Network error while loading JSON assets');
        }

        projects = await projectsRes.json();
        publications = await publicationsRes.json();
        caseStudies = await caseStudiesRes.json();

        return true;
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        return false;
    }
}

// Extract unique sorted tags
function getUniqueTags(items) {
    const tags = new Set();
    items.forEach(item => {
        if (Array.isArray(item.tags)) {
            item.tags.forEach(tag => tags.add(tag.trim()));
        }
    });
    return Array.from(tags).sort();
}

// Render dynamic filter buttons
function renderFilters(tags, container, type) {
    if (!container) return;

    // Reset container, keeping or recreating 'All'
    container.innerHTML = '';

    // 'All' button
    const allLi = document.createElement('li');
    allLi.className = 'filter-item active';
    allLi.textContent = 'All';
    allLi.dataset.filter = 'all';
    allLi.addEventListener('click', () => handleFilterClick('all', container, type));
    container.appendChild(allLi);

    // Individual tag buttons
    tags.forEach(tag => {
        const li = document.createElement('li');
        li.className = 'filter-item';
        li.textContent = tag;
        li.dataset.filter = tag;
        li.addEventListener('click', () => handleFilterClick(tag, container, type));
        container.appendChild(li);
    });
}

// Filter click handler
function handleFilterClick(filter, container, type) {
    const buttons = container.querySelectorAll('.filter-item');
    buttons.forEach(btn => btn.classList.remove('active'));

    const activeBtn = Array.from(buttons).find(btn => btn.dataset.filter === filter);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    if (type === 'projects') {
        renderProjects(filter);
    } else if (type === 'publications') {
        renderPublications(filter);
    } else if (type === 'case-studies') {
        renderCaseStudies(filter);
    }
}

// Helper: infer tool ecosystem badge from project links or tags
function getProjectEcosystemBadge(project) {
    const link = project.link.toLowerCase();
    const tags = (project.tags || []).map(t => t.toLowerCase());

    if (link.includes('bioconductor.org') || tags.includes('bioconductor')) {
        return 'Bioconductor';
    }
    if (link.includes('pypi.org') || tags.includes('python')) {
        return 'PyPI Package';
    }
    if (tags.includes('shiny') || link.includes('shiny')) {
        return 'Shiny App';
    }
    if (tags.includes('workflow automation') || tags.includes('ngs')) {
        return 'Pipeline';
    }
    if (link.includes('github.io') || link.includes('github.com')) {
        return 'Open Source';
    }
    return 'Software';
}

// Render Projects
function renderProjects(filter = 'all') {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';

    const filtered = filter === 'all'
        ? projects
        : projects.filter(p => p.tags && p.tags.includes(filter));

    filtered.forEach(project => {
        const ecosystemBadge = getProjectEcosystemBadge(project);
        const card = document.createElement('article');
        card.className = 'project-card fade-in-up';
        card.innerHTML = `
            <div>
                <div class="project-card-header">
                    <h3 class="project-title">${project.title}</h3>
                    <span class="project-badge">${ecosystemBadge}</span>
                </div>
                <div class="card-tags">
                    ${(project.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <p class="project-desc">${project.description}</p>
            </div>
            <div class="project-card-footer">
                <a href="${project.link}" class="card-link" target="_blank" rel="noopener noreferrer">
                    Explore Tool <ion-icon name="arrow-forward-outline"></ion-icon>
                </a>
            </div>
        `;
        projectsGrid.appendChild(card);
    });
}

// Render Case Studies
function renderCaseStudies(filter = 'all') {
    if (!caseStudiesGrid) return;
    caseStudiesGrid.innerHTML = '';

    const filtered = filter === 'all'
        ? caseStudies
        : caseStudies.filter(cs => cs.tags && cs.tags.includes(filter));

    filtered.forEach(study => {
        const card = document.createElement('article');
        card.className = 'case-study-card fade-in-up';
        card.innerHTML = `
            <div class="case-study-content">
                <div class="card-tags">
                    ${(study.tags || []).map(tag => {
                        const isKeyTag = ['Visium HD', 'CAR-T', 'Spatial transcriptomics', 'Single-cell RNA-seq'].includes(tag);
                        return `<span class="tag ${isKeyTag ? 'tag-accent' : ''}">${tag}</span>`;
                    }).join('')}
                </div>
                <h3 class="case-study-title">
                    <a href="${study.link}" target="_blank" rel="noopener noreferrer">${study.title}</a>
                </h3>
                <p class="case-study-desc">${study.description}</p>
            </div>
            <div class="case-study-action">
                <a href="${study.link}" class="case-study-btn" target="_blank" rel="noopener noreferrer" aria-label="Read Case Study: ${study.title}">
                    <ion-icon name="arrow-forward-outline"></ion-icon>
                </a>
            </div>
        `;
        caseStudiesGrid.appendChild(card);
    });
}

// Render Publications
function renderPublications(filter = 'all') {
    if (!publicationsList) return;
    publicationsList.innerHTML = '';

    const filtered = filter === 'all'
        ? publications
        : publications.filter(p => p.tags && p.tags.includes(filter));

    filtered.forEach(pub => {
        // Highlight Dr. Zhang's name
        const formattedAuthors = pub.authors.replace(
            AUTHOR_MATCH,
            '<span class="pub-author-highlight">Zhang, Q.</span>'
        );

        // Prestige journal badge detection
        const isPrestigious = PRESTIGIOUS_JOURNALS.includes(pub.journal.trim().toLowerCase());
        const journalBadgeClass = isPrestigious ? 'pub-journal prestigious' : 'pub-journal';

        const card = document.createElement('article');
        card.className = 'publication-card fade-in-up';
        card.innerHTML = `
            <div class="pub-year-badge">${pub.year}</div>
            <div class="pub-main">
                <h3 class="pub-title">
                    <a href="${pub.link}" target="_blank" rel="noopener noreferrer">${pub.title}</a>
                </h3>
                <div class="pub-meta">
                    <span class="pub-authors">${formattedAuthors}</span>
                </div>
                <div class="pub-journal-wrap">
                    <span class="${journalBadgeClass}">${pub.journal}</span>
                    ${(pub.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
                </div>
            </div>
            <div class="pub-action">
                <a href="${pub.link}" class="pub-doi-btn" target="_blank" rel="noopener noreferrer">
                    Paper / DOI <ion-icon name="open-outline"></ion-icon>
                </a>
            </div>
        `;
        publicationsList.appendChild(card);
    });
}

// Theme Engine
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        if (themeIcon) themeIcon.setAttribute('name', 'sunny-outline');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
        if (themeIcon) themeIcon.setAttribute('name', 'moon-outline');
    }
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    setTheme(isDark ? 'light' : 'dark');
}

// Setup Scroll Spy for Navigation Highlighting
function setupScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollY = window.scrollY;

        // Header shadow
        if (header) {
            if (scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Scroll indicator
        if (scrollIndicator) {
            if (scrollY > 60) {
                scrollIndicator.classList.add('hidden');
            } else {
                scrollIndicator.classList.remove('hidden');
            }
        }

        // Active link detection
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }, { passive: true });
}

// Mobile Menu Handler
function setupMobileMenu() {
    if (!mobileBtn || !navbar) return;

    const icon = mobileBtn.querySelector('ion-icon');

    mobileBtn.addEventListener('click', () => {
        navbar.classList.toggle('active');
        const isActive = navbar.classList.contains('active');
        if (icon) {
            icon.setAttribute('name', isActive ? 'close-outline' : 'menu-outline');
        }
        mobileBtn.setAttribute('aria-expanded', isActive);
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.remove('active');
            if (icon) {
                icon.setAttribute('name', 'menu-outline');
            }
            mobileBtn.setAttribute('aria-expanded', 'false');
        });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (navbar.classList.contains('active') && !navbar.contains(e.target) && !mobileBtn.contains(e.target)) {
            navbar.classList.remove('active');
            if (icon) {
                icon.setAttribute('name', 'menu-outline');
            }
            mobileBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// Initializer
async function init() {
    // Determine Theme Preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        setTheme('dark');
    } else {
        setTheme('light');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Setup Navigation & Mobile
    setupMobileMenu();
    setupScrollSpy();

    // Fetch and render data
    const dataLoaded = await loadData();
    if (!dataLoaded) {
        console.warn('Portfolio data could not be initialized.');
        return;
    }

    // Render Filters
    renderFilters(getUniqueTags(projects), projectFilters, 'projects');
    renderFilters(getUniqueTags(publications), publicationFilters, 'publications');
    renderFilters(getUniqueTags(caseStudies), caseStudyFilters, 'case-studies');

    // Render Content Lists
    renderProjects();
    renderCaseStudies();
    renderPublications();
}

// Start on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

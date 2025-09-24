(function() {
    const GITHUB_USERNAME = 'Lauiskk';
    const GITHUB_API_BASE = 'https://api.github.com';
    const MAX_PROJECTS = 6;

    const projectCategories = {
        'backend': ['api', 'server', 'backend', 'golang', 'java', 'python', 'grails', 'microservice'],
        'frontend': ['react', 'angular', 'vue', 'frontend', 'ui', 'website', 'portfolio'],
        'fullstack': ['fullstack', 'app', 'application', 'webapp', 'web-app'],
        'mobile': ['android', 'ios', 'mobile', 'react-native', 'flutter'],
        'devops': ['docker', 'kubernetes', 'ci', 'cd', 'pipeline', 'automation'],
        'data': ['data', 'ml', 'machine-learning', 'ai', 'analysis', 'scraper']
    };

    let githubStats = {
        totalRepos: 0,
        totalStars: 0,
        totalForks: 0,
        languages: {},
        contributions: 0,
        followers: 0,
        following: 0,
        organizations: [],
        pullRequests: 0
    };

    async function initProjects() {
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) return;

        const cachedStats = localStorage.getItem('github-stats-cache');
        if (cachedStats) {
            try {
                const cached = JSON.parse(cachedStats);
                const hourAgo = Date.now() - (60 * 60 * 1000);

                if (cached.timestamp > hourAgo) {
                    githubStats.totalRepos = cached.totalRepos || 32;
                    githubStats.totalStars = cached.totalStars || 0;
                    githubStats.totalForks = cached.totalForks || 0;
                    githubStats.followers = cached.followers || 0;
                    updateAllCounters();
                }
            } catch (e) {
                console.log('Cache parse error:', e);
            }
        }

        try {
            showLoadingState(projectsGrid);

            const [userData, repos, events, orgs] = await Promise.all([
                fetchUserData().catch(() => ({ public_repos: 32, followers: 0, following: 0 })),
                fetchGitHubRepos().catch(() => []),
                fetchUserEvents().catch(() => []),
                fetchUserOrganizations().catch(() => [])
            ]);

            updateGitHubStats(userData, repos, orgs);
            const processedRepos = processRepos(repos);
            displayProjects(processedRepos, projectsGrid);
            initProjectFilter(processedRepos);
            updateStatsInUI();

        } catch (error) {
            console.error('Error loading GitHub data:', error);
            displayErrorMessage(projectsGrid);

            githubStats.totalRepos = 32;
            updateAllCounters();
        }
    }

    async function fetchUserData() {
        const response = await fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}`);
        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
        return await response.json();
    }

    async function fetchGitHubRepos() {
        const response = await fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
        return await response.json();
    }

    async function fetchUserEvents() {
        const response = await fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/events/public?per_page=100`);
        if (!response.ok) return [];
        return await response.json();
    }

    async function fetchUserOrganizations() {
        const response = await fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/orgs`);
        if (!response.ok) return [];
        return await response.json();
    }

    async function fetchRepoDetails(repoName) {
        const response = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repoName}`);
        if (!response.ok) return null;
        return await response.json();
    }

    async function fetchRepoLanguages(repoName) {
        const response = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repoName}/languages`);
        if (!response.ok) return {};
        return await response.json();
    }

    function updateGitHubStats(userData, repos, orgs) {
        githubStats.totalRepos = userData.public_repos || 32;
        githubStats.followers = userData.followers || 0;
        githubStats.following = userData.following || 0;
        githubStats.organizations = orgs || [];

        repos.forEach(repo => {
            githubStats.totalStars += repo.stargazers_count || 0;
            githubStats.totalForks += repo.forks_count || 0;

            if (repo.language) {
                githubStats.languages[repo.language] = (githubStats.languages[repo.language] || 0) + 1;
            }
        });

        localStorage.setItem('github-stats-cache', JSON.stringify({
            totalRepos: githubStats.totalRepos,
            totalStars: githubStats.totalStars,
            totalForks: githubStats.totalForks,
            followers: githubStats.followers,
            timestamp: Date.now()
        }));

        updateAllCounters();
    }

    function updateAllCounters() {
        const statCards = document.querySelectorAll('.about-stats .stat-card');

        const updates = [
            { index: 0, value: 4, label: 'Years Experience' },
            { index: 1, value: githubStats.totalRepos || 32, label: 'GitHub Repos' },
            { index: 2, value: 20, label: 'Technologies' },
            { index: 3, value: 4, label: 'Companies' }
        ];

        updates.forEach(update => {
            if (statCards[update.index]) {
                const counter = statCards[update.index].querySelector('.stat-number');
                const label = statCards[update.index].querySelector('.stat-label');

                if (counter) {
                    counter.setAttribute('data-target', update.value);
                    if (counter.textContent === '0' || !counter._animated) {
                        counter.textContent = '0';
                        animateSingleCounter(counter);
                        counter._animated = true;
                    }
                }

                if (label && label.textContent !== update.label) {
                    label.textContent = update.label;
                }
            }
        });
    }

    function animateSingleCounter(counter) {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        updateCounter();
    }

    function updateStatsInUI() {
        const statsContainer = document.querySelector('.about-stats');
        if (statsContainer) {

            const githubStatsSection = document.createElement('div');
            githubStatsSection.className = 'github-stats-extra';
            githubStatsSection.innerHTML = `
                <div class="stat-card">
                    <div class="stat-number" data-target="${githubStats.totalStars}">0</div>
                    <div class="stat-label">GitHub Stars</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" data-target="${githubStats.followers}">0</div>
                    <div class="stat-label">Followers</div>
                </div>
            `;

            if (!document.querySelector('.github-stats-extra')) {
                statsContainer.appendChild(githubStatsSection);
                animateNewCounters();
            }
        }
    }

    function animateNewCounters() {
        const newCounters = document.querySelectorAll('.github-stats-extra .stat-number');
        newCounters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            updateCounter();
        });
    }

    function processRepos(repos) {
        return repos
            .filter(repo => !repo.fork && !repo.private)
            .map(repo => ({
                name: repo.name,
                description: repo.description || 'No description available',
                url: repo.html_url,
                homepage: repo.homepage,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                language: repo.language,
                topics: repo.topics || [],
                category: categorizeProject(repo),
                updatedAt: new Date(repo.updated_at),
                createdAt: new Date(repo.created_at),
                size: repo.size,
                watchers: repo.watchers_count,
                openIssues: repo.open_issues_count
            }))
            .sort((a, b) => {
                if (a.stars !== b.stars) return b.stars - a.stars;
                return b.updatedAt - a.updatedAt;
            })
            .slice(0, MAX_PROJECTS);
    }

    function categorizeProject(repo) {
        const searchText = `${repo.name} ${repo.description || ''} ${repo.language || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();

        for (const [category, keywords] of Object.entries(projectCategories)) {
            if (keywords.some(keyword => searchText.includes(keyword))) {
                return category;
            }
        }

        const language = (repo.language || '').toLowerCase();
        if (['javascript', 'typescript', 'html', 'css'].includes(language)) {
            return 'frontend';
        } else if (['go', 'java', 'python', 'c#', 'ruby'].includes(language)) {
            return 'backend';
        }

        return 'all';
    }

    function showLoadingState(container) {
        container.innerHTML = `
            <div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <div class="loader-spinner" style="margin: 0 auto 20px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--neon-cyan);"></i>
                </div>
                <p style="color: var(--text-secondary);">Fetching projects from GitHub...</p>
            </div>
        `;
    }

    function displayProjects(repos, container) {
        container.innerHTML = '';

        repos.forEach((repo, index) => {
            const projectCard = createProjectCard(repo);
            projectCard.style.animationDelay = `${index * 0.1}s`;
            container.appendChild(projectCard);
        });

        if (repos.length >= MAX_PROJECTS) {
            container.appendChild(createViewAllCard());
        }
    }

    function createProjectCard(repo) {
        const card = document.createElement('div');
        card.className = `project-card ${repo.category} animate-fadeInUp`;

        const updatedDate = repo.updatedAt.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });

        const languageColors = {
            'JavaScript': '#f1e05a',
            'TypeScript': '#2b7489',
            'Python': '#3572A5',
            'Go': '#00ADD8',
            'Java': '#b07219',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'Ruby': '#701516',
            'C#': '#178600',
            'Shell': '#89e051',
            'PHP': '#4F5D95',
            'C++': '#f34b7d',
            'C': '#555555'
        };

        const languageColor = languageColors[repo.language] || '#666';

        card.innerHTML = `
            <div class="project-header">
                <div class="project-icon">
                    <i class="fas fa-folder"></i>
                </div>
                <div class="project-links">
                    <a href="${repo.url}" target="_blank" class="project-link" title="View on GitHub">
                        <i class="fab fa-github"></i>
                    </a>
                    ${repo.homepage ? `
                        <a href="${repo.homepage}" target="_blank" class="project-link" title="Live Demo">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    ` : ''}
                </div>
            </div>
            <h3 class="project-title">${formatProjectName(repo.name)}</h3>
            <p class="project-description">${truncateDescription(repo.description)}</p>
            <div class="project-meta">
                <div class="project-stats">
                    ${repo.stars > 0 ? `
                        <span class="stat-item">
                            <i class="fas fa-star"></i> ${repo.stars}
                        </span>
                    ` : ''}
                    ${repo.forks > 0 ? `
                        <span class="stat-item">
                            <i class="fas fa-code-branch"></i> ${repo.forks}
                        </span>
                    ` : ''}
                    ${repo.openIssues > 0 ? `
                        <span class="stat-item">
                            <i class="fas fa-exclamation-circle"></i> ${repo.openIssues}
                        </span>
                    ` : ''}
                    <span class="stat-item">
                        <i class="fas fa-clock"></i> ${updatedDate}
                    </span>
                </div>
                <div class="project-tech">
                    ${repo.language ? `
                        <span class="tech-item" style="border-color: ${languageColor}; color: ${languageColor};">
                            ${repo.language}
                        </span>
                    ` : ''}
                    ${repo.topics.slice(0, 2).map(topic => `
                        <span class="tech-item">${topic}</span>
                    `).join('')}
                </div>
            </div>
        `;

        card.addEventListener('click', function(e) {
            if (!e.target.closest('a')) {
                window.open(repo.url, '_blank');
            }
        });

        return card;
    }

    function createViewAllCard() {
        const card = document.createElement('div');
        card.className = 'project-card view-all-card animate-fadeInUp';
        card.style.animationDelay = `${(MAX_PROJECTS + 1) * 0.1}s`;

        card.innerHTML = `
            <div class="view-all-content">
                <i class="fas fa-arrow-right" style="font-size: 3rem; color: var(--neon-cyan); margin-bottom: 20px;"></i>
                <h3 class="project-title">View All ${githubStats.totalRepos} Projects</h3>
                <p class="project-description">Explore all my repositories on GitHub</p>
                <div class="github-summary" style="margin: 20px 0; font-size: 0.9rem; color: var(--text-secondary);">
                    <span style="margin: 0 10px;"><i class="fas fa-star"></i> ${githubStats.totalStars} stars</span>
                    <span style="margin: 0 10px;"><i class="fas fa-code-branch"></i> ${githubStats.totalForks} forks</span>
                </div>
                <a href="https://github.com/${GITHUB_USERNAME}?tab=repositories" target="_blank" class="cyber-btn primary-btn" style="margin-top: 20px;">
                    <span class="btn-text">Visit GitHub</span>
                </a>
            </div>
        `;

        card.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            cursor: pointer;
            border: 2px dashed var(--neon-cyan);
            background: rgba(0, 255, 255, 0.05);
        `;

        return card;
    }

    function initProjectFilter(repos) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filter = button.getAttribute('data-filter');

                projectCards.forEach((card, index) => {
                    if (filter === 'all' || card.classList.contains(filter)) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    function formatProjectName(name) {
        return name
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    }

    function truncateDescription(description, maxLength = 100) {
        if (!description) return 'No description available';
        if (description.length <= maxLength) return description;
        return description.substring(0, maxLength).trim() + '...';
    }

    function displayErrorMessage(container) {
        container.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--neon-pink); margin-bottom: 20px;"></i>
                <h3 style="color: var(--text-primary); margin-bottom: 10px;">Unable to Load Projects</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">There was an error loading projects from GitHub. Please try again later.</p>
                <button onclick="window.githubProjects.refresh()" class="cyber-btn secondary-btn">
                    <i class="fas fa-redo"></i>
                    <span class="btn-text">Try Again</span>
                </button>
                <p style="margin-top: 20px;">
                    <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" style="color: var(--neon-cyan);">
                        Visit GitHub Profile Directly →
                    </a>
                </p>
            </div>
        `;
    }

    const style = document.createElement('style');
    style.textContent = `
        .project-meta {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: auto;
        }

        .project-stats {
            display: flex;
            gap: 15px;
            font-size: 0.85rem;
            color: var(--text-tertiary);
        }

        .stat-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .stat-item i {
            font-size: 0.8rem;
        }

        .view-all-card:hover {
            border-color: var(--neon-magenta) !important;
            background: rgba(255, 0, 255, 0.05) !important;
            transform: translateY(-5px);
        }

        .project-card {
            cursor: pointer;
            transition: all var(--transition-fast);
        }

        .project-card:hover {
            border-color: var(--neon-cyan);
        }

        .github-stats-extra {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-top: 20px;
        }

        .loading-state {
            animation: pulse 1.5s infinite;
        }

        @media (max-width: 768px) {
            .github-stats-extra {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProjects);
    } else {
        initProjects();
    }

    window.githubProjects = {
        refresh: initProjects,
        getUsername: () => GITHUB_USERNAME,
        getStats: () => githubStats
    };

})();

(function() {
    
    const THEME_KEY = 'portfolio-theme';
    const LIGHT_THEME = 'light-theme';
    const DARK_THEME = 'dark-theme';

    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

    function initTheme() {
        if (savedTheme) {
            if (savedTheme === LIGHT_THEME) {
                enableLightTheme();
            } else {
                enableDarkTheme();
            }
        } else if (prefersDarkScheme) {
            enableDarkTheme();
        } else {
            enableDarkTheme(); 
        }
    }

    function enableLightTheme() {
        body.classList.add('light-theme');
        localStorage.setItem(THEME_KEY, LIGHT_THEME);
        updateThemeToggle(true);
        updateMetaTheme('#ffffff');
    }

    function enableDarkTheme() {
        body.classList.remove('light-theme');
        localStorage.setItem(THEME_KEY, DARK_THEME);
        updateThemeToggle(false);
        updateMetaTheme('#0a0e27');
    }

    function updateThemeToggle(isLight) {
        if (themeToggle) {
            const moonIcon = themeToggle.querySelector('.moon-icon');
            const sunIcon = themeToggle.querySelector('.sun-icon');

            if (isLight) {
                moonIcon.style.opacity = '0.5';
                sunIcon.style.opacity = '1';
            } else {
                moonIcon.style.opacity = '1';
                sunIcon.style.opacity = '0.5';
            }
        }
    }

    function updateMetaTheme(color) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = color;
    }

    function toggleTheme() {
        if (body.classList.contains('light-theme')) {
            enableDarkTheme();
            showThemeNotification('Dark Mode Activated');
        } else {
            enableLightTheme();
            showThemeNotification('Light Mode Activated');
        }
    }

    function showThemeNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: var(--neon-cyan);
            color: var(--bg-primary);
            padding: 15px 25px;
            border-radius: 5px;
            font-weight: 600;
            z-index: 9999;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }

    function addTransitionClass() {
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
            el.style.transition = 'none';
        });

        setTimeout(() => {
            elements.forEach(el => {
                el.style.transition = '';
            });
        }, 100);
    }

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleTheme();
        }
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(THEME_KEY)) {
            if (e.matches) {
                enableDarkTheme();
            } else {
                enableLightTheme();
            }
        }
    });

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    initTheme();

    window.addEventListener('load', () => {
        body.style.transition = 'background var(--transition-medium), color var(--transition-medium)';
    });

    window.themeManager = {
        toggle: toggleTheme,
        setLight: enableLightTheme,
        setDark: enableDarkTheme,
        getCurrent: () => body.classList.contains('light-theme') ? LIGHT_THEME : DARK_THEME
    };

})();
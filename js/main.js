const scrollListeners = new Set();
let scrollTicking = false;

function registerScrollHandler(fn) {
    scrollListeners.add(fn);
    fn();
}

window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
        scrollListeners.forEach(fn => fn());
        scrollTicking = false;
    });
}, { passive: true });

document.addEventListener('DOMContentLoaded', function() {
    initPreloader();
    initNavigation();
    initTypingEffect();
    initScrollReveal();
    initCounters();
    initSkillBars();
    initSmoothScroll();
    initParallax();
    initHeroVisibility();
});

function initPreloader() {
    window.addEventListener('load', function() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;
        setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 1500);
    });
}

function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!navbar) return;

    let lastScroll = 0;

    registerScrollHandler(() => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (currentScroll > lastScroll && currentScroll > 500) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        lastScroll = currentScroll;
    });

    navToggle?.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle?.classList.remove('active');
            navMenu?.classList.remove('active');
        });
    });

    const sections = document.querySelectorAll('section[id]');
    const linkFor = new Map();
    sections.forEach(section => {
        const link = document.querySelector(`.nav-link[href="#${section.id}"]`);
        if (link) linkFor.set(section, link);
    });

    registerScrollHandler(() => {
        const scrollY = window.pageYOffset;
        sections.forEach(section => {
            const top = section.offsetTop - 100;
            const bottom = top + section.offsetHeight;
            const link = linkFor.get(section);
            if (!link) return;
            if (scrollY > top && scrollY <= bottom) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    });
}

function initTypingEffect() {
    const roles = [
        'Software Engineer',
        'Backend Developer',
        'AI Engineer',
        'Full Stack Developer',
        'Python Developer',
        'Cloud Specialist'
    ];

    const typingElement = document.getElementById('typing-role');
    if (!typingElement) return;

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            typingElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            typingSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }

    setTimeout(type, 1000);
}

function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -150px 0px' });

    reveals.forEach(el => observer.observe(el));
}

function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    const defaultValues = {
        'Years Experience': 5,
        'GitHub Repos': 34,
        'Technologies': 25,
        'Companies': 5
    };

    counters.forEach(counter => {
        const label = counter.closest('.stat-card')?.querySelector('.stat-label')?.textContent;
        if (!label) return;

        const savedValue = localStorage.getItem(`portfolio-stat-${label}`);
        if (savedValue && savedValue !== '0') {
            counter.setAttribute('data-target', savedValue);
        } else if (defaultValues[label] !== undefined) {
            const currentTarget = parseInt(counter.getAttribute('data-target') || '0');
            if (currentTarget === 0 || isNaN(currentTarget)) {
                counter.setAttribute('data-target', defaultValues[label]);
            }
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const counter = entry.target;
            observer.unobserve(counter);

            const label = counter.closest('.stat-card')?.querySelector('.stat-label')?.textContent;
            let target = parseInt(counter.getAttribute('data-target'));
            if ((isNaN(target) || target === 0) && label && defaultValues[label] !== undefined) {
                target = defaultValues[label];
                counter.setAttribute('data-target', target);
            }

            const duration = 2000;
            const startTime = performance.now();

            const step = (now) => {
                const progress = Math.min((now - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const value = Math.round(target * eased);
                counter.textContent = value;
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    counter.textContent = target;
                    if (label) localStorage.setItem(`portfolio-stat-${label}`, target);
                }
            };
            requestAnimationFrame(step);
        });
    }, { threshold: 0.3 });

    counters.forEach(counter => observer.observe(counter));
}

function initSkillBars() {
    const skillItems = document.querySelectorAll('.skill-item');
    if (!skillItems.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const skill = entry.target;
            const level = skill.getAttribute('data-level');
            const progress = skill.querySelector('.skill-progress');
            if (progress && level) {
                progress.style.width = level + '%';
            }
            observer.unobserve(skill);
        });
    }, { threshold: 0.3 });

    skillItems.forEach(skill => observer.observe(skill));
}

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        });
    });
}

function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');
    if (!parallaxElements.length) return;

    registerScrollHandler(() => {
        const scrolled = window.pageYOffset;
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.getAttribute('data-speed')) || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    });
}

function initHeroVisibility() {
    const hero = document.getElementById('home');
    if (!hero) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            document.body.classList.toggle('hero-out-of-view', !entry.isIntersecting);
        });
    }, { threshold: 0 });

    observer.observe(hero);
}

const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filter = button.getAttribute('data-filter');
        const projectCards = document.querySelectorAll('.project-card');

        projectCards.forEach(card => {
            const shouldShow = filter === 'all' || card.classList.contains(filter);
            if (shouldShow) {
                card.style.display = 'block';
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                });
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    });
});

const glitchElements = document.querySelectorAll('.glitch-text');

glitchElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        element.classList.add('glitch');
    });

    element.addEventListener('mouseleave', () => {
        setTimeout(() => {
            element.classList.remove('glitch');
        }, 300);
    });
});

if (window.innerWidth > 768 && window.matchMedia('(pointer: fine)').matches) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-glow';
    document.body.appendChild(cursor);

    let cursorX = 0, cursorY = 0;
    let cursorTicking = false;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        if (cursorTicking) return;
        cursorTicking = true;
        requestAnimationFrame(() => {
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            cursorTicking = false;
        });
    }, { passive: true });

    document.addEventListener('mousedown', () => {
        cursor.classList.add('active');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('active');
    });
}

console.log('%c Welcome to my portfolio! 🚀', 'color: #00ffff; font-size: 20px; font-weight: bold;');
console.log('%c Built with ❤ by Luis Felipe R. Vieira', 'color: #ff00ff; font-size: 14px;');
console.log('%c Feel free to explore the code!', 'color: #9d00ff; font-size: 14px;');

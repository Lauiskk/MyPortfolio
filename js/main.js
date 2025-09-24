
document.addEventListener('DOMContentLoaded', function() {
    
    initPreloader();
    initNavigation();
    initTypingEffect();
    initScrollReveal();
    initCounters();
    initSkillBars();
    initSmoothScroll();
    initParallax();
});

function initPreloader() {
    window.addEventListener('load', function() {
        const preloader = document.getElementById('preloader');
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

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
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

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    const sections = document.querySelectorAll('section[id]');

    function highlightActiveLink() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink?.classList.add('active');
            } else {
                navLink?.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', highlightActiveLink);
}

function initTypingEffect() {
    const roles = [
        'Software Engineer',
        'Backend Developer',
        'Cloud Specialist',
        'DevOps Engineer',
        'Full Stack Developer'
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

    function reveal() {
        reveals.forEach(element => {
            const windowHeight = window.innerHeight;
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', reveal);
    reveal(); 
}

function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    let animated = false;

    const defaultValues = {
        'Years Experience': 4,
        'GitHub Repos': 32,
        'Technologies': 20,
        'Companies': 4
    };

    counters.forEach(counter => {
        const label = counter.closest('.stat-card')?.querySelector('.stat-label')?.textContent;
        if (label && defaultValues[label] !== undefined) {
            const currentTarget = parseInt(counter.getAttribute('data-target') || '0');
            if (currentTarget === 0 || isNaN(currentTarget)) {
                counter.setAttribute('data-target', defaultValues[label]);
            }
        }
    });

    function animateCounters() {
        if (animated) return;

        const windowHeight = window.innerHeight;
        const triggerPoint = windowHeight * 0.8;

        counters.forEach(counter => {
            const rect = counter.getBoundingClientRect();

            if (rect.top < triggerPoint && rect.bottom > 0) {
                animated = true;
                const label = counter.closest('.stat-card')?.querySelector('.stat-label')?.textContent;
                let target = parseInt(counter.getAttribute('data-target'));

                if (isNaN(target) || target === 0) {
                    if (label && defaultValues[label] !== undefined) {
                        target = defaultValues[label];
                        counter.setAttribute('data-target', target);
                    }
                }

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
                        localStorage.setItem(`portfolio-stat-${label}`, target);
                    }
                };

                updateCounter();
            }
        });
    }

    counters.forEach(counter => {
        const label = counter.closest('.stat-card')?.querySelector('.stat-label')?.textContent;
        if (label) {
            const savedValue = localStorage.getItem(`portfolio-stat-${label}`);
            if (savedValue && savedValue !== '0') {
                counter.setAttribute('data-target', savedValue);
            } else if (defaultValues[label]) {
                counter.setAttribute('data-target', defaultValues[label]);
            }
        }
    });

    window.addEventListener('scroll', animateCounters);
    animateCounters();
}

function initSkillBars() {
    const skillItems = document.querySelectorAll('.skill-item');
    let animated = false;

    function animateSkills() {
        if (animated) return;

        const windowHeight = window.innerHeight;
        const triggerPoint = windowHeight * 0.8;

        skillItems.forEach(skill => {
            const rect = skill.getBoundingClientRect();

            if (rect.top < triggerPoint && rect.bottom > 0) {
                animated = true;
                const level = skill.getAttribute('data-level');
                const progress = skill.querySelector('.skill-progress');

                setTimeout(() => {
                    progress.style.width = level + '%';
                }, 200);
            }
        });
    }

    window.addEventListener('scroll', animateSkills);
    animateSkills(); 
}

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href === '#') return;

            e.preventDefault();

            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;

        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-speed') || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        button.classList.add('active');

        const filter = button.getAttribute('data-filter');

        projectCards.forEach(card => {
            if (filter === 'all' || card.classList.contains(filter)) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 100);
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

if (window.innerWidth > 768) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-glow';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        requestAnimationFrame(() => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
    });

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
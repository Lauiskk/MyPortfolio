
(function() {
    
    document.addEventListener('DOMContentLoaded', function() {
        initScrollAnimations();
        initHoverEffects();
        initGlitchEffects();
        initNeonEffects();
        initContactForm();
    });

    function initScrollAnimations() {
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');

                    const children = entry.target.querySelectorAll('.animate-child');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('animated');
                        }, index * 100);
                    });
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll(`
            .section-title,
            .about-content > *,
            .timeline-item,
            .project-card,
            .skill-category,
            .contact-content > *,
            .hero-content > *
        `);

        animatedElements.forEach(element => {
            element.classList.add('animate-on-scroll');
            observer.observe(element);
        });
    }

    function initHoverEffects() {
        
        const magneticButtons = document.querySelectorAll('.cyber-btn');

        magneticButtons.forEach(button => {
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translate(0, 0)';
            });
        });

        const cards = document.querySelectorAll('.project-card, .stat-card, .skill-category');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;

                const rotateY = (x - 0.5) * 10;
                const rotateX = (y - 0.5) * -10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });
        });
    }

    function initGlitchEffects() {
        const glitchElements = document.querySelectorAll('.glitch');

        glitchElements.forEach(element => {
            
            const text = element.getAttribute('data-text') || element.textContent;
            element.setAttribute('data-text', text);

            setInterval(() => {
                if (Math.random() < 0.1) {
                    element.classList.add('glitch-active');
                    setTimeout(() => {
                        element.classList.remove('glitch-active');
                    }, 200);
                }
            }, 3000);
        });
    }

    function initNeonEffects() {
        
        const neonTexts = document.querySelectorAll('.neon-text, .section-title, h1, h2, h3');

        neonTexts.forEach(text => {
            text.addEventListener('mouseenter', function() {
                this.style.textShadow = `
                    0 0 10px var(--neon-cyan),
                    0 0 20px var(--neon-cyan),
                    0 0 30px var(--neon-cyan),
                    0 0 40px var(--neon-cyan)
                `;
            });

            text.addEventListener('mouseleave', function() {
                this.style.textShadow = '';
            });
        });
    }

    function initContactForm() {
        
        emailjs.init("YOUR_EMAILJS_PUBLIC_KEY"); 

        const contactForm = document.getElementById('contact-form');
        if (!contactForm) return;

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            setTimeout(() => {
                
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');

                contactForm.reset();
            }, 2000);

        });
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const colors = {
            success: 'var(--neon-cyan)',
            error: 'var(--neon-pink)',
            info: 'var(--neon-yellow)'
        };

        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: var(--bg-tertiary);
            border: 2px solid ${colors[type]};
            color: ${colors[type]};
            padding: 15px 25px;
            border-radius: 5px;
            font-weight: 600;
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 0 20px ${colors[type]};
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }

    const style = document.createElement('style');
    style.textContent = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .animate-on-scroll.animated {
            opacity: 1;
            transform: translateY(0);
        }

        .animate-child {
            opacity: 0;
            transform: translateX(-20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .animate-child.animated {
            opacity: 1;
            transform: translateX(0);
        }

        .glitch-active {
            animation: glitch-animation 0.2s linear;
        }

        @keyframes glitch-animation {
            0%, 100% {
                transform: translate(0);
                filter: hue-rotate(0deg);
            }
            20% {
                transform: translate(-2px, 2px);
                filter: hue-rotate(90deg);
            }
            40% {
                transform: translate(2px, -2px);
                filter: hue-rotate(180deg);
            }
            60% {
                transform: translate(-2px, -2px);
                filter: hue-rotate(270deg);
            }
            80% {
                transform: translate(2px, 2px);
                filter: hue-rotate(360deg);
            }
        }

        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }

        .project-card,
        .stat-card,
        .skill-category {
            transition: transform 0.3s ease;
            transform-style: preserve-3d;
        }

        .cyber-btn {
            transition: transform 0.2s ease, box-shadow 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    window.animationUtils = {
        showNotification,
        debounce,
        throttle
    };

})();
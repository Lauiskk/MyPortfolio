
(function() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    const config = {
        particleCount: 100,
        particleSize: 2,
        particleSpeed: 0.5,
        connectionDistance: 100,
        mouseRadius: 150,
        colors: {
            particle: '#00ffff',
            line: 'rgba(0, 255, 255, 0.2)',
            mouseConnection: 'rgba(255, 0, 255, 0.3)'
        }
    };

    let mouse = {
        x: null,
        y: null
    };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor(x, y) {
            this.x = x || Math.random() * canvas.width;
            this.y = y || Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * config.particleSpeed;
            this.vy = (Math.random() - 0.5) * config.particleSpeed;
            this.radius = Math.random() * config.particleSize + 1;
            this.opacity = Math.random() * 0.5 + 0.5;
        }

        update() {
            
            if (this.x < 0 || this.x > canvas.width) {
                this.vx = -this.vx;
            }
            if (this.y < 0 || this.y > canvas.height) {
                this.vy = -this.vy;
            }

            this.x += this.vx;
            this.y += this.vy;

            if (mouse.x != null && mouse.y != null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.mouseRadius) {
                    const force = (config.mouseRadius - distance) / config.mouseRadius;
                    const angle = Math.atan2(dy, dx);
                    this.vx -= Math.cos(angle) * force * 0.5;
                    this.vy -= Math.sin(angle) * force * 0.5;
                }
            }

            const maxSpeed = 2;
            const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (currentSpeed > maxSpeed) {
                this.vx = (this.vx / currentSpeed) * maxSpeed;
                this.vy = (this.vy / currentSpeed) * maxSpeed;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = config.colors.particle;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    function initParticles() {
        particles = [];
        const count = Math.min(config.particleCount, (canvas.width * canvas.height) / 10000);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.connectionDistance) {
                    ctx.strokeStyle = config.colors.line;
                    ctx.lineWidth = 0.5 * (1 - distance / config.connectionDistance);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }

            if (mouse.x != null && mouse.y != null) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.mouseRadius) {
                    ctx.strokeStyle = config.colors.mouseConnection;
                    ctx.lineWidth = 0.5 * (1 - distance / config.mouseRadius);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        connectParticles();

        animationId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    });

    window.addEventListener('touchend', () => {
        mouse.x = null;
        mouse.y = null;
    });

    let isTabActive = true;
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isTabActive = false;
            cancelAnimationFrame(animationId);
        } else {
            isTabActive = true;
            animate();
        }
    });

    function adjustParticleCount() {
        const isMobile = window.innerWidth <= 768;
        config.particleCount = isMobile ? 50 : 100;
        config.connectionDistance = isMobile ? 80 : 100;
    }

    canvas.addEventListener('click', (e) => {
        for (let i = 0; i < 5; i++) {
            particles.push(new Particle(e.clientX, e.clientY));
        }
        
        if (particles.length > config.particleCount * 1.5) {
            particles.splice(0, 5);
        }
    });

    adjustParticleCount();
    resizeCanvas();
    initParticles();
    animate();

    window.particlesController = {
        pause: () => cancelAnimationFrame(animationId),
        resume: () => animate(),
        setParticleCount: (count) => {
            config.particleCount = count;
            initParticles();
        },
        setColors: (colors) => {
            Object.assign(config.colors, colors);
        },
        reset: () => {
            initParticles();
        }
    };

})();
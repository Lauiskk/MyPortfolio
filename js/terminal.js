
(function() {
    const terminalBody = document.getElementById('terminal-body');
    let terminalInput = document.getElementById('terminal-input');

    if (!terminalBody || !terminalInput) return;

    let commandHistory = [];
    let historyIndex = -1;

    const commands = {
        help: {
            description: 'Show available commands',
            execute: () => {
                return `
<span style="color: var(--neon-magenta)">Available commands:</span>

  <span style="color: var(--neon-cyan)">help</span>       - Show this help message
  <span style="color: var(--neon-cyan)">about</span>      - Learn more about me
  <span style="color: var(--neon-cyan)">skills</span>     - List my technical skills
  <span style="color: var(--neon-cyan)">experience</span> - Show my work experience
  <span style="color: var(--neon-cyan)">education</span>  - Display my education
  <span style="color: var(--neon-cyan)">projects</span>   - View my GitHub projects
  <span style="color: var(--neon-cyan)">contact</span>    - Get my contact information
  <span style="color: var(--neon-cyan)">resume</span>     - Download my resume
  <span style="color: var(--neon-cyan)">social</span>     - Show my social media links
  <span style="color: var(--neon-cyan)">clear</span>      - Clear the terminal
  <span style="color: var(--neon-cyan)">theme</span>      - Toggle dark/light theme
  <span style="color: var(--neon-cyan)">matrix</span>     - Enter the Matrix
  <span style="color: var(--neon-cyan)">whoami</span>     - Display user information
  <span style="color: var(--neon-cyan)">date</span>       - Show current date and time
  <span style="color: var(--neon-cyan)">ls</span>         - List directory contents
  <span style="color: var(--neon-cyan)">pwd</span>        - Print working directory
                `;
            }
        },
        about: {
            description: 'Learn more about me',
            execute: () => {
                return `
<span style="color: var(--neon-magenta)">===[ About Me ]===</span>

Name: <span style="color: var(--neon-cyan)">Luis Felipe Ribeiro Vieira</span>
Role: <span style="color: var(--neon-cyan)">Software Engineer at SHOPNOMIX</span>
Location: <span style="color: var(--neon-cyan)">Goiânia, Brazil</span>

I'm a backend & full-stack engineer with 4+ years of experience building
AI-powered APIs, scalable backend systems, and cloud-native services.
Currently working with Python, Golang, Elixir, Svelte, and LLM integrations.

My path runs through cloud-security, fintech (J.P. Morgan receivables
project at FitBank), microservices at Zetti Tech, and now AI-integrated
product work at SHOPNOMIX.

Type <span style="color: var(--neon-yellow)">skills</span> to see my technical expertise.
                `;
            }
        },
        skills: {
            description: 'List technical skills',
            execute: () => {
                return `
<span style="color: var(--neon-magenta)">===[ Technical Skills ]===</span>

<span style="color: var(--neon-cyan)">Backend Development:</span>
  • Python (Advanced)
  • Golang (Expert)
  • C#/.NET (Advanced)
  • Java / Grails
  • Elixir

<span style="color: var(--neon-cyan)">AI & Automation:</span>
  • Claude / Anthropic SDK
  • OpenAI SDK
  • FastAPI
  • Playwright
  • LLM-powered tooling

<span style="color: var(--neon-cyan)">Frontend Development:</span>
  • JavaScript / TypeScript
  • Svelte
  • React
  • HTML5 / CSS3

<span style="color: var(--neon-cyan)">Cloud & DevOps:</span>
  • Docker & Kubernetes
  • AWS, Azure, GCP, Oracle Cloud
  • CI/CD (GitLab, GitHub Actions)
  • Microservices Architecture

<span style="color: var(--neon-cyan)">Databases:</span>
  • PostgreSQL
  • SQL Server
  • BigQuery
  • SQLAlchemy / Alembic

<span style="color: var(--neon-cyan)">Other:</span>
  • Git / GitHub / GitLab
  • Kafka, gRPC
  • Linux Administration
  • Network Security
  • Agile / Scrum
                `;
            }
        },
        experience: {
            description: 'Show work experience',
            execute: () => {
                return `
<span style="color: var(--neon-magenta)">===[ Work Experience ]===</span>

<span style="color: var(--neon-cyan)">[Jul 2025 - Present] Software Engineer @ SHOPNOMIX</span>
  • AI-powered APIs for video-processing automation
  • Full-stack: Python / Golang / Elixir + Svelte frontends
  • RESTful API development and third-party integrations
  • Early-stage startup execution with clean, tested code

<span style="color: var(--neon-cyan)">[Mar 2025 - Jul 2025] Software Engineer III @ Zetti Tech</span>
  • Backend development with Golang and C#/.NET
  • Microservices architecture with Kubernetes & Kafka
  • Data management with SQL Server

<span style="color: var(--neon-cyan)">[Feb 2024 - Mar 2025] Software Engineer @ FitBank</span>
  • Built fintech workflows for J.P. Morgan receivables project
  • Backend with Golang, Java/Grails, and Python
  • Python automation (Selenium, Airflow) and data pipelines
  • Multi-cloud: AWS, Azure, GCP (CloudTask, BigQuery, Firebase)

<span style="color: var(--neon-cyan)">[Apr 2023 - Mar 2024] Security Analyst @ 3DB.CLOUD</span>
  • Network and server administration (Linux + Windows)
  • Cloud infrastructure: AWS, Azure, Oracle Cloud
  • Firewall management (Fortinet, Mikrotik, PFSense, Cisco)

<span style="color: var(--neon-cyan)">[Sep 2021 - Dec 2022] Office Assistant @ SICOOB</span>
  • ERP system management (SISBR)
  • Customer service and documentation
                `;
            }
        },
        education: {
            description: 'Display education',
            execute: () => {
                return `
<span style="color: var(--neon-magenta)">===[ Education ]===</span>

<span style="color: var(--neon-cyan)">Software Engineering</span>
Anhanguera College
2022 - Present (Currently enrolled)
Goiânia, Brazil

<span style="color: var(--neon-cyan)">Languages:</span>
  • Portuguese (Native)
  • English (C1 - Advanced)
                `;
            }
        },
        projects: {
            description: 'View GitHub projects',
            execute: () => {
                window.location.href = '#projects';
                return `
<span style="color: var(--neon-cyan)">Navigating to projects section...</span>

You can also visit my GitHub profile:
<a href="https://github.com/Lauiskk" target="_blank" rel="noopener" style="color: var(--neon-yellow)">https://github.com/Lauiskk</a>
                `;
            }
        },
        contact: {
            description: 'Get contact information',
            execute: () => {
                return `
<span style="color: var(--neon-magenta)">===[ Contact Information ]===</span>

📧 Email: <a href="mailto:vrluis157@gmail.com" style="color: var(--neon-cyan)">vrluis157@gmail.com</a>
📱 Phone: <a href="tel:+5562998239851" style="color: var(--neon-cyan)">+55 62 99823-9851</a>
📍 Location: Goiânia, Brazil

<span style="color: var(--neon-cyan)">Professional Networks:</span>
  • LinkedIn: <a href="https://www.linkedin.com/in/luis-felipe-ribeiro-vieira-6a545a261/" target="_blank" rel="noopener" style="color: var(--neon-yellow)">linkedin.com/in/luis-felipe-ribeiro-vieira</a>
  • GitHub:   <a href="https://github.com/Lauiskk" target="_blank" rel="noopener" style="color: var(--neon-yellow)">github.com/Lauiskk</a>

Type <span style="color: var(--neon-yellow)">social</span> for all social media links.
                `;
            }
        },
        resume: {
            description: 'Download resume',
            execute: () => {
                const link = document.createElement('a');
                link.href = './assets/cv/LuisFelipeRibeiroCVEN.pdf';
                link.download = 'LuisFelipeRibeiroCVEN.pdf';
                link.click();
                return `
<span style="color: var(--neon-cyan)">Downloading resume...</span>

Resume download started. If it doesn't start automatically,
<a href="./assets/cv/LuisFelipeRibeiroCVEN.pdf" download style="color: var(--neon-yellow)">click here</a>.
                `;
            }
        },
        social: {
            description: 'Show social media links',
            execute: () => {
                return `
<span style="color: var(--neon-magenta)">===[ Social Media ]===</span>

<span style="color: var(--neon-cyan)">Professional:</span>
  • GitHub:    <a href="https://github.com/Lauiskk" target="_blank" rel="noopener" style="color: var(--neon-yellow)">github.com/Lauiskk</a>
  • LinkedIn:  <a href="https://www.linkedin.com/in/luis-felipe-ribeiro-vieira-6a545a261/" target="_blank" rel="noopener" style="color: var(--neon-yellow)">linkedin.com/in/luis-felipe-ribeiro-vieira</a>

<span style="color: var(--neon-cyan)">Personal:</span>
  • Instagram: <a href="https://www.instagram.com/vrluisin/" target="_blank" rel="noopener" style="color: var(--neon-yellow)">@vrluisin</a>
  • Twitter:   <a href="https://twitter.com/luisfelipe30856" target="_blank" rel="noopener" style="color: var(--neon-yellow)">@luisfelipe30856</a>
  • Twitch:    <a href="https://www.twitch.tv/lauiskkj" target="_blank" rel="noopener" style="color: var(--neon-yellow)">twitch.tv/lauiskkj</a>
  • YouTube:   <a href="https://www.youtube.com/channel/UCPLYp5PjSwY9a3XGPqwVYRQ" target="_blank" rel="noopener" style="color: var(--neon-yellow)">youtube.com/@luisfelipe</a>
  • WhatsApp:  <a href="https://wa.me/5562998239851" target="_blank" rel="noopener" style="color: var(--neon-yellow)">+55 62 99823-9851</a>
                `;
            }
        },
        clear: {
            description: 'Clear terminal',
            execute: () => {
                while (terminalBody.firstChild) {
                    terminalBody.removeChild(terminalBody.firstChild);
                }

                const welcomeLine = document.createElement('div');
                welcomeLine.className = 'terminal-line';
                welcomeLine.innerHTML = '<span class="terminal-prompt">Welcome to my portfolio terminal!</span>';
                terminalBody.appendChild(welcomeLine);

                const helpLine = document.createElement('div');
                helpLine.className = 'terminal-line';
                helpLine.innerHTML = '<span class="terminal-prompt">Type \'help\' to see available commands.</span>';
                terminalBody.appendChild(helpLine);

                addNewLine();
                return null;
            }
        },
        theme: {
            description: 'Toggle theme',
            execute: () => {
                window.themeManager.toggle();
                const currentTheme = window.themeManager.getCurrent();
                return `<span style="color: var(--neon-cyan)">Theme switched to ${currentTheme.replace('-theme', '')} mode.</span>`;
            }
        },
        matrix: {
            description: 'Enter the Matrix',
            execute: () => {
                const messages = [
                    '<span style="color: var(--neon-cyan)">Initializing Matrix protocol...</span>',
                    '<span style="color: var(--neon-magenta)">Follow the white rabbit...</span>',
                    '<span style="color: var(--neon-yellow)">Wake up, Neo...</span>',
                    '<span style="color: var(--neon-cyan)">The Matrix has you...</span>'
                ];

                setTimeout(() => {
                    startMatrixRain();
                }, 2000);

                return messages[Math.floor(Math.random() * messages.length)] +
                       '<br><span style="color: var(--text-secondary); font-size: 0.9em;">Entering in 2 seconds... Press ESC to exit.</span>';
            }
        },
        whoami: {
            description: 'Display user information',
            execute: () => {
                return `<span style="color: var(--neon-cyan)">guest@luis-portfolio</span>`;
            }
        },
        date: {
            description: 'Show current date and time',
            execute: () => {
                const now = new Date();
                return `<span style="color: var(--neon-cyan)">${now.toLocaleString()}</span>`;
            }
        },
        ls: {
            description: 'List directory contents',
            execute: () => {
                return `
<span style="color: var(--neon-cyan)">about.txt</span>    <span style="color: var(--neon-yellow)">experience.md</span>    <span style="color: var(--neon-magenta)">projects/</span>
<span style="color: var(--neon-cyan)">skills.txt</span>   <span style="color: var(--neon-yellow)">education.md</span>     <span style="color: var(--neon-magenta)">social/</span>
<span style="color: var(--neon-cyan)">resume.pdf</span>   <span style="color: var(--neon-yellow)">contact.txt</span>      <span style="color: var(--neon-magenta)">src/</span>
                `;
            }
        },
        pwd: {
            description: 'Print working directory',
            execute: () => {
                return `<span style="color: var(--neon-cyan)">/home/luis/portfolio</span>`;
            }
        }
    };

    const secretCommands = {
        'sudo': () => '<span style="color: var(--neon-pink)">Nice try! You don\'t have sudo privileges here 😄</span>',
        'rm -rf /': () => '<span style="color: var(--neon-pink)">Whoa there! Let\'s not destroy everything! 😱</span>',
        'hack': () => '<span style="color: var(--neon-cyan)">I\'m in! Just kidding... 🤖</span>',
        'coffee': () => '☕ Here\'s your virtual coffee!',
        'hello': () => '<span style="color: var(--neon-yellow)">Hello there! Welcome to my terminal! 👋</span>',
        'exit': () => '<span style="color: var(--neon-cyan)">You can\'t exit the web! But you can close this tab... 😉</span>',
    };

    function initTerminal() {
        if (!terminalInput) {
            console.error('Terminal input not found');
            return;
        }

        terminalInput.addEventListener('keydown', handleKeyDown);
        terminalInput.addEventListener('keyup', handleKeyUp);

        terminalBody.addEventListener('click', (e) => {
            if (!e.target.matches('input')) {
                const activeInput = document.querySelector('.terminal-line.active .terminal-input');
                if (activeInput) {
                    activeInput.focus();
                }
            }
        });

        terminalInput.focus();
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const currentInput = e.target.value || terminalInput.value;
            executeCommand(currentInput);
            e.target.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateHistory(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateHistory(1);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            autocomplete();
        }
    }

    function handleKeyUp(e) {
        
        const activeLine = document.querySelector('.terminal-line.active');
        if (activeLine) {
            const cursor = activeLine.querySelector('.terminal-cursor');
            if (cursor) {
                cursor.style.left = `${terminalInput.value.length * 8}px`;
            }
        }
    }

    function executeCommand(input) {
        const trimmedInput = input.trim().toLowerCase();

        if (trimmedInput) {
            commandHistory.push(trimmedInput);
            historyIndex = commandHistory.length;
        }

        const activeLine = document.querySelector('.terminal-line.active');
        if (activeLine) {
            activeLine.classList.remove('active');
            const promptText = activeLine.querySelector('.terminal-prompt').textContent;
            activeLine.innerHTML = `<span class="terminal-prompt">${promptText}</span> <span style="color: var(--text-secondary)">${input}</span>`;
        }

        let output = '';
        if (trimmedInput === '') {
            // Empty command, do nothing
        } else if (commands.hasOwnProperty(trimmedInput)) {
            try {
                output = commands[trimmedInput].execute();
            } catch (error) {
                console.error('Error executing command:', error);
                output = `<span style="color: var(--neon-pink)">Error executing command: ${error.message}</span>`;
            }
        } else if (secretCommands.hasOwnProperty(trimmedInput)) {
            output = secretCommands[trimmedInput]();
        } else {
            output = `<span style="color: var(--neon-pink)">Command not found: ${trimmedInput}</span>. Type <span style="color: var(--neon-yellow)">help</span> for available commands.`;
        }

        if (output) {
            const outputLine = document.createElement('div');
            outputLine.className = 'terminal-line';
            outputLine.innerHTML = output;
            terminalBody.appendChild(outputLine);
        }

        if (trimmedInput !== 'clear') {
            addNewLine();
        }

        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function addNewLine() {
        const newLine = document.createElement('div');
        newLine.className = 'terminal-line active';
        newLine.innerHTML = `<span class="terminal-prompt">luis@portfolio:~$</span> <input type="text" class="terminal-input" id="terminal-input-new"> <span class="terminal-cursor">_</span>`;
        terminalBody.appendChild(newLine);

        const oldInput = terminalInput;
        const newInput = document.getElementById('terminal-input-new');
        newInput.id = 'terminal-input';

        if (oldInput) {
            oldInput.removeEventListener('keydown', handleKeyDown);
            oldInput.removeEventListener('keyup', handleKeyUp);
        }

        terminalInput = newInput;
        terminalInput.addEventListener('keydown', handleKeyDown);
        terminalInput.addEventListener('keyup', handleKeyUp);
        terminalInput.focus();

        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function navigateHistory(direction) {
        if (commandHistory.length === 0) return;

        historyIndex += direction;
        historyIndex = Math.max(0, Math.min(historyIndex, commandHistory.length));

        if (historyIndex < commandHistory.length) {
            terminalInput.value = commandHistory[historyIndex];
        } else {
            terminalInput.value = '';
        }
    }

    function autocomplete() {
        const input = terminalInput.value.toLowerCase();
        if (!input) return;

        const matches = Object.keys(commands).filter(cmd => cmd.startsWith(input));
        if (matches.length === 1) {
            terminalInput.value = matches[0];
        } else if (matches.length > 1) {
            
            executeCommand(input);
            const suggestions = matches.join(', ');
            const outputLine = document.createElement('div');
            outputLine.className = 'terminal-line';
            outputLine.innerHTML = `<span style="color: var(--text-tertiary)">Suggestions: ${suggestions}</span>`;
            terminalBody.insertBefore(outputLine, terminalBody.lastChild);
        }
    }

    function startMatrixRain() {
        const overlay = document.createElement('div');
        overlay.id = 'matrix-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9997;
            background: black;
            opacity: 0;
            transition: opacity 1s ease;
        `;
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 100);

        const canvas = document.createElement('canvas');
        canvas.id = 'matrix-rain';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9998;
            background: transparent;
            opacity: 0;
            transition: opacity 1s ease;
        `;

        setTimeout(() => {
            document.body.appendChild(canvas);
            setTimeout(() => {
                canvas.style.opacity = '1';
            }, 100);
        }, 500);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
        const matrixArray = matrix.split("");

        const fontSize = 10;
        const columns = canvas.width / fontSize;

        const drops = [];
        for (let x = 0; x < columns; x++) {
            drops[x] = 1;
        }

        function drawMatrix() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#00ff00';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        const matrixInterval = setInterval(drawMatrix, 35);

        const exitMatrix = (e) => {
            if (e.key === 'Escape') {
                clearInterval(matrixInterval);
                canvas.style.opacity = '0';
                const overlay = document.getElementById('matrix-overlay');
                if (overlay) {
                    overlay.style.opacity = '0';
                    setTimeout(() => {
                        overlay.remove();
                    }, 1000);
                }
                setTimeout(() => {
                    canvas.remove();
                }, 1000);
                document.removeEventListener('keydown', exitMatrix);

                const terminalBody = document.getElementById('terminal-body');
                if (terminalBody) {
                    const exitLine = document.createElement('div');
                    exitLine.className = 'terminal-line';
                    exitLine.innerHTML = '<span style="color: var(--neon-cyan)">Welcome back to reality...</span>';
                    terminalBody.appendChild(exitLine);
                    terminalBody.scrollTop = terminalBody.scrollHeight;
                }
            }
        };
        document.addEventListener('keydown', exitMatrix);

        setTimeout(() => {
            clearInterval(matrixInterval);
            canvas.style.opacity = '0';
            const overlay = document.getElementById('matrix-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.remove();
                }, 1000);
            }
            setTimeout(() => {
                canvas.remove();
            }, 1000);
            document.removeEventListener('keydown', exitMatrix);

            const terminalBody = document.getElementById('terminal-body');
            if (terminalBody) {
                const exitLine = document.createElement('div');
                exitLine.className = 'terminal-line';
                exitLine.innerHTML = '<span style="color: var(--neon-cyan)">Matrix session ended. Welcome back!</span>';
                terminalBody.appendChild(exitLine);
                addNewLine();
                terminalBody.scrollTop = terminalBody.scrollHeight;
            }
        }, 15000);
    }

    initTerminal();

    console.log(`
    %c
     _     _   _ ___ ___   _____ _____ ____  __  __ ___ _   _    _    _
    | |   | | | |_ _/ __| |_   _| ____|  _ \\|  \\/  |_ _| \\ | |  / \\  | |
    | |   | | | || |\\__ \\   | | |  _| | |_) | |\\/| || ||  \\| | / _ \\ | |
    | |___| |_| || |___) |  | | | |___|  _ <| |  | || || |\\  |/ ___ \\| |___
    |_____|\\___/|___|____/   |_| |_____|_| \\_\\_|  |_|___|_| \\_/_/   \\_\\_____|
    `,
        'color: #00ffff; font-weight: bold'
    );

})();
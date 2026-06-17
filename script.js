/* ==========================================================================
   Manindra Rongala Portfolio - Interactivity & Visual Effects
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialise Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Interactive Canvas Particle Background
    initParticleCanvas();

    // 3. Typist Engine (Terminal typing animation in Hero)
    initTypingAnimation();

    // 4. Scroll-Triggered Reveal Animations
    initScrollReveals();

    // 5. Theme Accent Switcher Widget
    initThemeSwitcher();

    // 6. Navigation Interactivity & Scroll Spy
    initNavigation();

    // 7. 3D Tilt Effect on Hero Terminal
    init3DTilt();

    // 8. Contact Form Handling
    initContactForm();

    // 9. Interactive Hero Terminal Shell
    initInteractiveTerminal();



    // 11. YogaMate Pose Animator
    initYogaMateAnimator();

    // 12. LeetCode Dashboard Animator
    initLeetCodeAnimator();
});

/* ==========================================================================
   2. Canvas Particle Background
   ========================================================================== */
function initParticleCanvas() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId = null;

    // Mouse coordinates tracking
    const mouse = {
        x: null,
        y: null,
        radius: 180 // Distance of mouse influence
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        // Update CSS variables for hardware-accelerated spotlight gradient
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle class definition (Soft glowing bokeh spheres)
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            // Larger soft spheres
            this.size = Math.random() * 120 + 60; 
            
            // Very slow, ambient movement
            this.vx = (Math.random() - 0.5) * 0.25;
            this.vy = (Math.random() - 0.5) * 0.25;
            
            this.density = (Math.random() * 20) + 10;
        }

        draw() {
            const accentRgb = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
            
            // Create smooth radial blur for bokeh
            let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, `rgba(${accentRgb}, 0.08)`);
            gradient.addColorStop(0.4, `rgba(${accentRgb}, 0.03)`);
            gradient.addColorStop(1, `rgba(${accentRgb}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }

        update(width, height) {
            // Periodic wrap/bounce bounds
            if (this.x < -this.size || this.x > width + this.size) this.vx = -this.vx;
            if (this.y < -this.size || this.y > height + this.size) this.vy = -this.vy;

            // Move particle
            this.x += this.vx;
            this.y += this.vy;

            // Gentle mouse evasion
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius + this.size) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    
                    // Subtle push
                    let force = (mouse.radius + this.size - distance) / (mouse.radius + this.size);
                    let directionX = forceDirectionX * force * 0.6;
                    let directionY = forceDirectionY * force * 0.6;
                    
                    this.x -= directionX;
                    this.y -= directionY;
                }
            }
        }
    }

    // Set canvas dimensions
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.scale(dpr, dpr);
        
        createParticles();
    }

    // Populate particles based on screen size
    function createParticles() {
        particles = [];
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Low density for large soft bokeh lights
        const particleCount = Math.floor((width * height) / 90000);
        const cappedCount = Math.min(particleCount, 20);

        for (let i = 0; i < cappedCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            particles.push(new Particle(x, y));
        }
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        const w = window.innerWidth;
        const h = window.innerHeight;

        particles.forEach(p => {
            p.update(w, h);
            p.draw();
        });
        
        animationId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        cancelAnimationFrame(animationId);
        resizeCanvas();
        animate();
    });

    resizeCanvas();
    animate();
}

/* ==========================================================================
   3. Typist Engine
   ========================================================================== */
function initTypingAnimation() {
    const element = document.getElementById('typing-element');
    if (!element) return;

    const words = [
        "AI Agentic Workflows.",
        "Low-Latency REST APIs.",
        "Optimized RAG Pipelines.",
        "Intelligent Systems."
    ];

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 90;

    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            // Delete characters
            element.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Deletes faster
        } else {
            // Add characters
            element.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 90;
        }

        // Check bounds
        if (!isDeleting && charIndex === currentWord.length) {
            // Full word typed, pause before deleting
            typingSpeed = 2200; // Display pause
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            // Move to next word
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 350; // Pause before typing next word
        }

        setTimeout(type, typingSpeed);
    }

    // Launch typing
    setTimeout(type, 1000);
}

/* ==========================================================================
   4. Scroll-Triggered Reveal Animations
   ========================================================================== */
function initScrollReveals() {
    const revealItems = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Animate skill progress bars if inside a revealed card
                if (entry.target.classList.contains('skills-card')) {
                    const progressBars = entry.target.querySelectorAll('.skill-progress');
                    progressBars.forEach(bar => {
                        if (!bar.dataset.targetWidth) {
                            bar.dataset.targetWidth = bar.style.width || '100%';
                        }
                        const targetWidth = bar.dataset.targetWidth;
                        bar.style.width = '0%';
                        setTimeout(() => {
                            bar.style.width = targetWidth;
                        }, 100);
                    });
                }
                
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, {
        threshold: 0.05, // Lower threshold triggers reveals earlier for a seamless feel
        rootMargin: '0px 0px -30px 0px'
    });

    revealItems.forEach(item => {
        revealObserver.observe(item);
    });
}

/* ==========================================================================
   5. Theme Accent Switcher Widget
   ========================================================================== */
function initThemeSwitcher() {
    const widget = document.getElementById('themeWidget');
    const toggle = document.getElementById('themeToggle');
    const dots = document.querySelectorAll('.color-dot');
    const htmlEl = document.documentElement;

    if (!widget || !toggle) return;

    // Toggle panel
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        widget.classList.toggle('open');
    });

    // Close panel on body click
    document.addEventListener('click', () => {
        widget.classList.remove('open');
    });

    widget.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent auto-closing
    });

    // Load stored theme if any
    const savedTheme = localStorage.getItem('manindra-theme-accent');
    if (savedTheme) {
        htmlEl.setAttribute('data-theme', savedTheme);
        dots.forEach(dot => {
            dot.classList.toggle('active', dot.getAttribute('data-theme') === savedTheme);
        });
    }

    // Accent dots handler
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const selectedColorTheme = dot.getAttribute('data-theme');
            htmlEl.setAttribute('data-theme', selectedColorTheme);
            
            // Set active dot class
            dots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            
            // Save settings
            localStorage.setItem('manindra-theme-accent', selectedColorTheme);
        });
    });
}

/* ==========================================================================
   6. Navigation Interactivity & Scroll Spy
   ========================================================================== */
function initNavigation() {
    const header = document.querySelector('.header');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Fixed scroll threshold style adjustments (keep for header glow)
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile nav hamburger toggle
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('open');
            
            // Toggle icon structure
            const icon = menuToggle.querySelector('i');
            if (icon) {
                const isOpen = navMenu.classList.contains('open');
                icon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        });

        // Close mobile nav on overlay clicks
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && e.target !== menuToggle) {
                navMenu.classList.remove('open');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                }
            }
        });
    }

    // Tabbed Section Handler
    function showSection(targetId) {
        if (!targetId.startsWith('#')) targetId = '#' + targetId;
        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;

        sections.forEach(sec => {
            if ('#' + sec.id === targetId) {
                sec.classList.remove('section-view-hidden');
                
                // Force all reveals to active inside showing section
                sec.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
                
                // Animate skill progress bars if navigating to Skills
                if (sec.id === 'skills') {
                    const progressBars = sec.querySelectorAll('.skill-progress');
                    progressBars.forEach(bar => {
                        if (!bar.dataset.targetWidth) {
                            bar.dataset.targetWidth = bar.style.width || '100%';
                        }
                        const targetWidth = bar.dataset.targetWidth;
                        bar.style.width = '0%';
                        setTimeout(() => {
                            bar.style.width = targetWidth;
                        }, 100);
                    });
                }
            } else {
                sec.classList.add('section-view-hidden');
            }
        });

        // Update Nav Link classes
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === targetId) {
                link.classList.add('active');
            }
        });

        // Scroll to the top of the window
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Set up click listeners for all anchor links pointing to sections
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (!targetEl) return;

            e.preventDefault();

            // Close mobile menu if open
            if (navMenu) {
                navMenu.classList.remove('open');
                const icon = menuToggle?.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                }
            }

            // Show section
            showSection(targetId);
            history.pushState(null, null, targetId);
        });
    });

    // Handle initial page load hash
    const initialHash = window.location.hash || '#home';
    showSection(initialHash);

    // Handle browser back/forward buttons
    window.addEventListener('hashchange', () => {
        showSection(window.location.hash || '#home');
    });
}

/* ==========================================================================
   7. 3D Tilt Card Effect
   ========================================================================== */
function init3DTilt() {
    const card = document.getElementById('tilt-card');
    if (!card) return;

    // Throttle frame rates
    let isMoving = false;

    card.addEventListener('mousemove', (e) => {
        if (isMoving) return;
        isMoving = true;

        requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x coordinate inside element
            const y = e.clientY - rect.top;  // y coordinate inside element
            
            const w = rect.width;
            const h = rect.height;
            
            // Generate tilt metrics (-15 to 15 degrees)
            const rotateY = ((x / w) - 0.5) * 30;
            const rotateX = -(((y / h) - 0.5) * 30);
            
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
            isMoving = false;
        });
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    });
}

/* ==========================================================================
   8. Contact Form Handling
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');

    if (!form || !status) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('form-name').value.trim();
        const email = document.getElementById('form-email').value.trim();
        const message = document.getElementById('form-message').value.trim();

        // Basic verification
        if (!name || !email || !message) {
            status.textContent = 'Please fill out all fields.';
            status.className = 'form-status error';
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Sending...</span> <i data-lucide="loader" class="spin"></i>`;
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Simulate form submission
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            status.textContent = `Thank you, ${name}! Your message has been sent successfully.`;
            status.className = 'form-status success';
            form.reset();

            // Clear status after some time
            setTimeout(() => {
                status.style.display = 'none';
            }, 5000);
        }, 1500);
    });
}

/* ==========================================================================
   9. Interactive Hero Terminal Shell
   ========================================================================== */
function initInteractiveTerminal() {
    const btnCode = document.getElementById('btn-code-mode');
    const btnTerminal = document.getElementById('btn-terminal-mode');
    const viewCode = document.getElementById('terminal-code-view');
    const viewTerminal = document.getElementById('terminal-interactive-view');
    const input = document.getElementById('terminal-input');
    const history = document.getElementById('terminal-history');

    if (!btnCode || !btnTerminal || !viewCode || !viewTerminal || !input || !history) return;

    // Switch to Code Mode
    btnCode.addEventListener('click', () => {
        btnTerminal.classList.remove('active');
        btnCode.classList.add('active');
        viewTerminal.classList.remove('active');
        viewCode.classList.add('active');
    });

    // Switch to Terminal Mode
    btnTerminal.addEventListener('click', () => {
        btnCode.classList.remove('active');
        btnTerminal.classList.add('active');
        viewCode.classList.remove('active');
        viewTerminal.classList.add('active');
        // Auto-focus input
        setTimeout(() => input.focus(), 100);
    });

    // Focus on click anywhere in terminal view
    viewTerminal.addEventListener('click', () => {
        input.focus();
    });

    // Input commands handler
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim();
            if (cmd) {
                executeTerminalCommand(cmd);
            }
            input.value = '';
        }
    });

    function printLine(text, isCommand = false) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        if (isCommand) {
            line.innerHTML = `<span class="terminal-prompt">guest@manindra:~$</span> ${text}`;
        } else {
            line.innerHTML = text;
        }
        history.appendChild(line);
        history.scrollTop = history.scrollHeight;
    }

    const qaPairs = [
        { keywords: ['sih', 'hackathon'], answer: "🏆 Selected as a finalist in the Deep Learning domain at the Internal Smart India Hackathon (SIH 2024, SRKR) in September 2024." },
        { keywords: ['yanthraa', 'intern', 'experience'], answer: "💼 Machine Learning Intern at Yanthraa Information System (Nov 2025 - Jan 2026):\n- Engineered FastAPI AI voice services integrated with EHR systems (improved data speed by 30%).\n- Optimized ElevenLabs voice agent workflows (latency reduction & +25% accuracy)." },
        { keywords: ['rag', 'retrieval', 'vector', 'faiss', 'bm25', 'dsa'], answer: "⚡ Agentic RAG DSA Pipeline & Quiz Generator (2026):\n- Hybrid BM25 & FAISS retrieval pipeline over 500+ coding problems.\n- Groq Llama-3.1 LLM reranking (retrieval accuracy +40%, hallucinations -35%)." },
        { keywords: ['yoga', 'pose', 'mediapipe', 'opencv'], answer: "🧘 YogaMate - AI Voice Trainer (2025):\n- Real-time pose tracking & angles correction via MediaPipe & OpenCV.\n- Real-time voice pipeline delivering 25+ FPS at 90% posture detection accuracy." },
        { keywords: ['skills', 'languages', 'frameworks'], answer: "🛠️ Core Technical Stack:\n- Languages: Python, Java\n- Frameworks: FastAPI, Spring Boot, LangChain, LangGraph\n- Databases: PostgreSQL, MySQL, FAISS (Vector DB)" },
        { keywords: ['college', 'gpa', 'grade', 'education', 'srkr'], answer: "🎓 Sagi Rama Krishnam Raju Engineering College (SRKR):\n- B.Tech in Artificial Intelligence & Machine Learning (2022 - 2026)\n- Cumulative CGPA: 8.62 / 10." },
        { keywords: ['leetcode', 'code', 'problems'], answer: "💻 Coding Metrics:\n- Solved 350+ data structures & algorithm problems.\n- Earned the LeetCode Java Problem-Solving Badge." }
    ];

    function executeTerminalCommand(commandString) {
        printLine(commandString, true);
        const lowerCmd = commandString.toLowerCase().trim();

        if (lowerCmd === 'clear') {
            history.innerHTML = '';
            return;
        }

        if (lowerCmd === 'help') {
            printLine("Available commands:\n  <span class='accent-text'>bio</span>        - Print professional summary\n  <span class='accent-text'>skills</span>     - Show technical skill set\n  <span class='accent-text'>projects</span>   - List completed engineering projects\n  <span class='accent-text'>experience</span> - Detail professional internships\n  <span class='accent-text'>clear</span>      - Clear terminal window\n\nOr type any custom question to run a mock semantic search on my resume database!");
            return;
        }

        if (lowerCmd === 'bio' || lowerCmd === 'about') {
            printLine("Manindra Rongala is an AI/ML Engineer specializing in Generative AI, RAG architectures, and low-latency API systems. Passionate about building and deploying agentic workflows that solve complex domain challenges.");
            return;
        }

        if (lowerCmd === 'skills') {
            printLine("🛠️ Technical Skill Map:\n-------------------------------------\nGenerative AI   | LangChain, LangGraph, RAG\nML & Vision     | OpenCV, MediaPipe, Deep Learning\nLanguages       | Python, Java, SQL\nBackends        | FastAPI, Spring Boot\nVectors         | FAISS, BM25 Keyword Search");
            return;
        }

        if (lowerCmd === 'projects') {
            printLine("🚀 Key Projects:\n1. Agentic RAG DSA Pipeline - Hybrid FAISS/BM25 retrieval quiz engine.\n2. AI Research Assistant - High-volume document parser (+45% relevance).\n3. YogaMate - Real-time MediaPipe postural trainer.");
            return;
        }

        if (lowerCmd === 'experience') {
            printLine("💼 Yanthraa Information System | Hyderabad, India\nML Intern (Nov 2025 - Jan 2026)\n- Developed FastAPI AI voice pipelines. Reduced EHR latency; enhanced accuracy by 25%.");
            return;
        }

        // Semantic Query Parser fallback
        let foundMatch = false;
        for (const pair of qaPairs) {
            const matches = pair.keywords.filter(keyword => lowerCmd.includes(keyword));
            if (matches.length > 0) {
                printLine(`[FAISS Vector Match | Score: 0.92]...\n${pair.answer}`);
                foundMatch = true;
                break;
            }
        }

        if (!foundMatch) {
            printLine("Searching FAISS vector database... [No exact match].\nFallback: Manindra is a B.Tech AI/ML Engineer with experience in RAG and Agentic LLM pipelines. Type 'help' to see standard queries.");
        }
    }
}

/* ==========================================================================
/* ==========================================================================
   11. YogaMate Pose Animator
   ========================================================================== */
function initYogaMateAnimator() {
    const canvas = document.getElementById('yogamate-canvas');
    const label = document.getElementById('pose-feedback');
    if (!canvas || !label) return;

    const ctx = canvas.getContext('2d');
    let t = 0;
    let dir = 1;
    let pauseTimer = 0;

    // Fixed landmarks coordinates
    const backAnkle = { x: 80, y: 120 };
    const backKnee = { x: 105, y: 100 };
    const hip = { x: 135, y: 80 };
    const spine = { x: 135, y: 50 };
    const head = { x: 135, y: 32 };
    const frontAnkle = { x: 180, y: 120 };

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update progress parameter with delays
        if (pauseTimer > 0) {
            pauseTimer--;
        } else {
            t += 0.008 * dir;
            if (t >= 1) {
                t = 1;
                dir = -1;
                pauseTimer = 100; // Pause at Warrior II
            } else if (t <= 0) {
                t = 0;
                dir = 1;
                pauseTimer = 100; // Pause at Warrior I
            }
        }

        // Interpolating landmarks based on t
        // Front Knee (Bending limb)
        const frontKnee = {
            x: 180 - 15 * t, 
            y: 98 - 18 * t  
        };

        // Arms (raised vs horizontal)
        const leftElbow = {
            x: 135 - 20 * t - 15 * (1 - t),
            y: 50 - 18 * (1 - t) + 5 * t
        };
        const leftWrist = {
            x: 135 - 35 * t - 30 * (1 - t),
            y: 50 - 35 * (1 - t) + 5 * t
        };

        const rightElbow = {
            x: 135 + 20 * t + 15 * (1 - t),
            y: 50 - 18 * (1 - t) + 5 * t
        };
        const rightWrist = {
            x: 135 + 35 * t + 30 * (1 - t),
            y: 50 - 35 * (1 - t) + 5 * t
        };

        // Draw Floor line
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(30, 120);
        ctx.lineTo(250, 120);
        ctx.stroke();

        // Draw gridlines in background
        ctx.strokeStyle = 'rgba(255,255,255,0.015)';
        ctx.lineWidth = 1;
        for (let x = 20; x < canvas.width; x += 20) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 20; y < canvas.height; y += 20) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();

        // Determine colors based on alignment state
        let feedbackColor = '#ef4444'; // Red (unaligned)
        let alignmentAngle = Math.round(110 - 20 * t);
        
        if (alignmentAngle <= 92) {
            feedbackColor = '#10b981'; // Green (aligned)
            label.textContent = `Perfect Alignment - ${alignmentAngle}°`;
            label.className = 'pose-feedback-label feedback-correct';
        } else {
            label.textContent = `Correcting Alignment... ${alignmentAngle}°`;
            label.className = 'pose-feedback-label feedback-incorrect';
        }

        // Draw Bones (Lines)
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw Spine
        ctx.strokeStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(hip.x, hip.y);
        ctx.lineTo(spine.x, spine.y);
        ctx.stroke();

        // Draw Back Leg (Straight/Stretched leg)
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(hip.x, hip.y);
        ctx.lineTo(backKnee.x, backKnee.y);
        ctx.lineTo(backAnkle.x, backAnkle.y);
        ctx.stroke();

        // Draw Front Leg (Active bending leg)
        ctx.beginPath();
        ctx.strokeStyle = '#f8fafc';
        ctx.moveTo(hip.x, hip.y);
        ctx.lineTo(frontKnee.x, frontKnee.y);
        ctx.stroke();

        // Draw Front Shin (Color changes to reflect feedback validation)
        ctx.beginPath();
        ctx.strokeStyle = feedbackColor;
        ctx.moveTo(frontKnee.x, frontKnee.y);
        ctx.lineTo(frontAnkle.x, frontAnkle.y);
        ctx.stroke();

        // Draw Arms
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(spine.x, spine.y);
        ctx.lineTo(leftElbow.x, leftElbow.y);
        ctx.lineTo(leftWrist.x, leftWrist.y);
        ctx.stroke();

        ctx.strokeStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(spine.x, spine.y);
        ctx.lineTo(rightElbow.x, rightElbow.y);
        ctx.lineTo(rightWrist.x, rightWrist.y);
        ctx.stroke();

        // Draw Joints (Circles)
        ctx.fillStyle = '#64748b';
        const joints = [backKnee, backAnkle, frontAnkle, leftElbow, leftWrist, rightElbow, rightWrist, spine, hip];
        joints.forEach(j => {
            ctx.beginPath();
            ctx.arc(j.x, j.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Bending joint highlighted
        ctx.fillStyle = feedbackColor;
        ctx.beginPath();
        ctx.arc(frontKnee.x, frontKnee.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Draw Head
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        // Draw angle indicator arc around front knee
        ctx.strokeStyle = feedbackColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(frontKnee.x, frontKnee.y, 14, Math.PI * 0.5, Math.PI * 1.1, false);
        ctx.stroke();

        requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   12. LeetCode Dashboard Animator
   ========================================================================== */
function initLeetCodeAnimator() {
    const card = document.querySelector('.coding-dashboard-card');
    const ringCircle = document.getElementById('leetcode-progress');
    const solvedCount = document.getElementById('leetcode-count');
    const barFills = document.querySelectorAll('.bar-fill');

    if (!card || !ringCircle || !solvedCount) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 1. Animate Progress Ring
                // Circumference = 2 * Math.PI * 34 = 213.63
                const circumference = 213.63;
                // Solved percentage represented out of 500 max solved (72% progress)
                const targetOffset = circumference * (1 - 0.72);
                ringCircle.style.strokeDashoffset = targetOffset;

                // 2. Animate counter number
                let count = 0;
                const target = 350;
                const duration = 1200; // ms
                const increment = Math.ceil(target / (duration / 16)); // ~60fps
                
                const counterInterval = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        count = target;
                        clearInterval(counterInterval);
                    }
                    solvedCount.textContent = count + "+";
                }, 16);

                // 3. Animate Bar Fills widths
                setTimeout(() => {
                    barFills.forEach(bar => {
                        if (bar.classList.contains('leetcode-easy')) bar.style.width = '82%';
                        if (bar.classList.contains('leetcode-medium')) bar.style.width = '68%';
                        if (bar.classList.contains('leetcode-hard')) bar.style.width = '38%';
                    });
                }, 100);

                observer.unobserve(card); // Trigger once
            }
        });
    }, {
        threshold: 0.1
    });

    observer.observe(card);
}


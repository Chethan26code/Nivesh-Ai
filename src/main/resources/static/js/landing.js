/* ========================================================================
   Landing Page — Features & 3D Hero
   ======================================================================== */

const LandingPage = {
    isAnimating: false,
    cloudNumbers: [],
    NUM_PARTICLES: 150,

    render(container) {
        container.innerHTML = `
            <div class="landing-wrapper-new">
                <div class="kinetic-grid"></div>
                
                <!-- Navigation -->
                <nav class="landing-nav">
                    <div class="logo">
                        <div class="logo-icon">
                            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                                <rect width="28" height="28" rx="7" fill="url(#logoGradLanding)"/>
                                <path d="M7 20L11 12L15 16L21 8" stroke="#050507" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="21" cy="8" r="2" fill="#050507"/>
                                <defs>
                                    <linearGradient id="logoGradLanding" x1="0" y1="0" x2="28" y2="28">
                                        <stop offset="0%" stop-color="#FFE066"/>
                                        <stop offset="100%" stop-color="#C49B0D"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <span class="logo-text" style="font-size:1.2rem;">NIVESH<span class="logo-accent">AI</span></span>
                    </div>
                    <div class="landing-nav-links">
                        <button class="btn btn-secondary btn-sm" onclick="window.location.hash='#auth'">Sign In</button>
                        <button class="btn btn-primary btn-sm" onclick="window.location.hash='#auth'">Get Started</button>
                    </div>
                </nav>

                <!-- 3D Cloud Field -->
                <div id="cloud-field"></div>

                <!-- Hero Section -->
                <section class="landing-hero-new">
                    <div class="hero-content-new">
                        <div class="badge badge-hold" style="margin-bottom:16px; background:rgba(245, 197, 24, 0.1); color:var(--gold);">
                            ✨ Introducing Beginner Mode
                        </div>
                        <h1 class="hero-title-new glow-primary">
                            "Master the market with <br/><span class="text-gradient" style="font-style: italic;">machine precision.</span>"
                        </h1>
                        <p class="hero-subtitle-new">
                            A seamless, AI-driven experience designed to secure and multiply your portfolio with uncompromising accuracy.
                        </p>
                        <div class="hero-actions">
                            <button class="btn btn-primary btn-lg" onclick="window.location.hash='#auth'" style="box-shadow: 0 0 40px rgba(245, 197, 24, 0.5);">Enter Field</button>
                            <button class="btn btn-secondary btn-lg" style="background:transparent;" onclick="document.getElementById('features').scrollIntoView({behavior: 'smooth'})">Explore Features</button>
                        </div>
                    </div>
                </section>

                <!-- Live Alpha Stream Ticker -->
                <div class="ticker-wrap">
                    <div class="ticker-scroll" id="alpha-ticker">
                        <!-- Dynamic ticker items will be added here -->
                    </div>
                </div>

                <!-- Features Section -->
                <section id="features" class="features-section-new">
                    <div class="section-header" style="text-align: center; margin-bottom: 40px;">
                        <h2 style="font-size: 2.5rem; font-family: var(--font-display); font-weight: 800;">Smarter Tools for <span style="color:var(--gold)">Retail Investors</span></h2>
                        <p style="color: var(--text-2); font-size: 1.1rem; margin-top: 10px;">Everything you need to grow your wealth, designed for beginners.</p>
                    </div>
                    
                    <div class="features-grid">
                        <div class="feature-card glass-card">
                            <div class="feature-icon">🛡️</div>
                            <h3 style="font-family: var(--font-display); font-size: 1.3rem; margin-bottom: 10px;">5-Day Beginner Protection</h3>
                            <p style="color: var(--text-3); font-size: 0.95rem;">Our app actively guides you for your first 5 days. We block high-risk trades and explain exactly why certain stocks are recommended.</p>
                        </div>
                        <div class="feature-card glass-card">
                            <div class="feature-icon">🎓</div>
                            <h3 style="font-family: var(--font-display); font-size: 1.3rem; margin-bottom: 10px;">Nivesh Academy</h3>
                            <p style="color: var(--text-3); font-size: 0.95rem;">A built-in interactive guide to learning the stock market. Understand RSI, MACD, and volatility in plain English.</p>
                        </div>
                        <div class="feature-card glass-card">
                            <div class="feature-icon">🤖</div>
                            <h3 style="font-family: var(--font-display); font-size: 1.3rem; margin-bottom: 10px;">AI Trade Signals</h3>
                            <p style="color: var(--text-3); font-size: 0.95rem;">We process millions of data points using SMA, RSI, and MACD to generate reliable BUY, SELL, and HOLD signals automatically.</p>
                        </div>
                    </div>
                </section>
            </div>
        `;

        this.init3D();
        this.initTicker();
    },

    init3D() {
        const field = document.getElementById('cloud-field');
        if (!field) return;
        
        field.innerHTML = '';
        this.cloudNumbers = [];

        for (let i = 0; i < this.NUM_PARTICLES; i++) {
            const initialZ = -5000 + (Math.random() * 6000);
            this.cloudNumbers.push(this.createNumber(field, initialZ));
        }

        if (!this.isAnimating) {
            this.isAnimating = true;
            this.animateField();
        }

        // Interactive Tilt
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseleave', this.handleMouseLeave);
    },

    createNumber(field, initialZ = null) {
        const isProfit = Math.random() > 0.45;
        const val = (Math.random() * 25 + 0.1).toFixed(Math.random() > 0.7 ? 2 : 1);
        const text = (isProfit ? '+' : '-') + val + '%';
        
        const el = document.createElement('div');
        // Use neon green for profit, neon red for loss
        el.className = 'cloud-number ' + (isProfit ? 'glow-cyan' : 'glow-error');
        el.style.color = isProfit ? 'var(--neon-green)' : 'var(--neon-red)';
        el.innerText = text;
        
        const state = {
            x: (Math.random() - 0.5) * window.innerWidth * 2,
            y: (Math.random() - 0.5) * window.innerHeight * 1.8,
            z: initialZ !== null ? initialZ : -3000 - (Math.random() * 3000),
            speed: 5 + Math.random() * 25,
            fontSize: 12 + Math.random() * 80,
            opacity: 0,
            el: el
        };
        
        el.style.fontSize = `${state.fontSize}px`;
        field.appendChild(el);
        return state;
    },

    animateField() {
        if (!this.isAnimating) return;
        if (!document.getElementById('cloud-field')) {
            this.isAnimating = false;
            document.removeEventListener('mousemove', this.handleMouseMove);
            document.removeEventListener('mouseleave', this.handleMouseLeave);
            return;
        }

        this.cloudNumbers.forEach(n => {
            n.z += n.speed;
            
            if (n.z > 1000) {
                n.z = -4000 - (Math.random() * 2000);
                n.x = (Math.random() - 0.5) * window.innerWidth * 2;
                n.y = (Math.random() - 0.5) * window.innerHeight * 1.8;
                n.speed = 5 + Math.random() * 25;
                n.fontSize = 12 + Math.random() * 80;
                n.el.style.fontSize = `${n.fontSize}px`;
                n.opacity = 0;
            }

            if (n.z < -1000) {
                n.opacity = Math.max(0, (n.z + 3000) / 2000) * 0.7;
            } else if (n.z >= -1000 && n.z < 600) {
                n.opacity = 0.8;
            } else {
                n.opacity = Math.max(0, 1 - (n.z - 600) / 400);
            }

            n.el.style.transform = `translate3d(${n.x}px, ${n.y}px, ${n.z}px)`;
            n.el.style.opacity = n.opacity;
            
            const blurVal = Math.abs(n.z) > 2000 ? 2 : (n.z > 800 ? 3 : 0);
            n.el.style.filter = blurVal > 0 ? `blur(${blurVal}px)` : 'none';
        });
        requestAnimationFrame(() => this.animateField());
    },

    initTicker() {
        const ticker = document.getElementById('alpha-ticker');
        if (!ticker) return;

        const tickerData = [
            { name: "RELIANCE", val: "+4.2%", up: true },
            { name: "TCS", val: "-1.8%", up: false },
            { name: "HDFCBANK", val: "+12.4%", up: true },
            { name: "GOLD", val: "+0.5%", up: true },
            { name: "AI ALPHA", val: "+42.8%", up: true },
            { name: "INFY", val: "-2.4%", up: false },
            { name: "NIFTY50", val: "+1.2%", up: true },
            { name: "ITC", val: "+0.3%", up: true }
        ];

        const content = [...tickerData, ...tickerData, ...tickerData, ...tickerData].map(item => `
            <div class="ticker-item" style="color: ${item.up ? 'var(--neon-green)' : 'var(--neon-red)'}">
                <span style="color: var(--text-2); font-weight: 500;">${item.name}</span>
                <span>${item.val}</span>
            </div>
        `).join('');
        ticker.innerHTML = content;
    },

    handleMouseMove(e) {
        const field = document.getElementById('cloud-field');
        if (!field) return;
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const moveX = (mouseX - centerX) / 15;
        const moveY = (mouseY - centerY) / 15;
        
        field.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        
        const cards = document.querySelectorAll('.glass-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardX = rect.left + rect.width / 2;
            const cardY = rect.top + rect.height / 2;
            const angleX = (mouseY - cardY) / 35;
            const angleY = (cardX - mouseX) / 35;
            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateZ(10px)`;
        });
    },

    handleMouseLeave() {
        const field = document.getElementById('cloud-field');
        if (field) field.style.transform = `translate3d(0, 0, 0)`;
        
        document.querySelectorAll('.glass-card').forEach(card => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)`;
        });
    }
};

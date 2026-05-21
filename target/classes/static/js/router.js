/* ========================================================================
   SPA Router — Hash-based routing with auth guards
   ======================================================================== */

const Router = {
    routes: {
        'landing': { render: (c) => LandingPage.render(c), auth: false },
        'auth': { render: (c) => AuthPage.render(), auth: false },
        'dashboard': { render: (c) => DashboardPage.render(c), auth: true },
        'recommendations': { render: (c) => RecommendationsPage.render(c), auth: true },
        'portfolio': { render: (c) => PortfolioPage.render(c), auth: true },
        'profile': { render: (c) => ProfilePage.render(c), auth: true },
        'academy': { render: (c) => AcademyPage.render(c), auth: true },
    },

    init() {
        this.setupEvents();
        const hash = window.location.hash.slice(1) || '';
        
        if (!API.isAuthenticated()) {
            if (hash === 'auth') {
                document.getElementById('landing-page').style.display = 'none';
                document.getElementById('auth-page').style.display = '';
                document.getElementById('app').style.display = 'none';
                AuthPage.render();
            } else {
                document.getElementById('landing-page').style.display = '';
                document.getElementById('auth-page').style.display = 'none';
                document.getElementById('app').style.display = 'none';
                window.location.hash = '#landing';
                LandingPage.render(document.getElementById('landing-page'));
            }
            // Initialize chatbot globally if not done
            Chatbot.init();
            return;
        }

        // Show app, hide others
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('auth-page').style.display = 'none';
        document.getElementById('app').style.display = 'flex';

        // Update user info in sidebar
        const user = API.getUser();
        if (user) {
            document.getElementById('user-name').textContent = user.name;
            document.getElementById('user-email').textContent = user.email;
            document.getElementById('user-avatar').textContent = user.name.charAt(0).toUpperCase();
        }

        // Initialize Chatbot
        Chatbot.init();

        // Events already setup initially

        // Navigate to current hash
        const currentHash = window.location.hash.slice(1) || 'dashboard';
        this.navigate(currentHash === 'landing' || currentHash === 'auth' ? 'dashboard' : currentHash);
    },

    navigate(page) {
        const route = this.routes[page];
        if (!route) {
            this.navigate('dashboard');
            return;
        }

        if (route.auth && !API.isAuthenticated()) {
            window.location.hash = '';
            this.init();
            return;
        }

        // Handle full-page routes vs app-content routes
        if (page === 'landing') {
            document.getElementById('landing-page').style.display = '';
            document.getElementById('auth-page').style.display = 'none';
            document.getElementById('app').style.display = 'none';
            LandingPage.render(document.getElementById('landing-page'));
        } else if (page === 'auth') {
            document.getElementById('landing-page').style.display = 'none';
            document.getElementById('auth-page').style.display = '';
            document.getElementById('app').style.display = 'none';
            AuthPage.render();
        } else {
            document.getElementById('landing-page').style.display = 'none';
            document.getElementById('auth-page').style.display = 'none';
            document.getElementById('app').style.display = 'flex';

            // Update active nav
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.page === page);
            });

            // Render page
            const container = document.getElementById('page-content');
            container.innerHTML = Utils.loading();
            route.render(container);

            // Close mobile sidebar
            document.getElementById('sidebar').classList.remove('open');
        }

        // Update hash without triggering hashchange
        if (window.location.hash !== '#' + page) {
            history.replaceState(null, null, '#' + page);
        }
    },

    setupEvents() {
        if (this._eventsBound) return;
        this._eventsBound = true;

        // Navigation clicks
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                window.location.hash = '#' + page;
                this.navigate(page);
            });
        });

        // Hash change
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1) || 'dashboard';
            this.navigate(hash);
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            API.clearAuth();
            Utils.showToast('Logged out successfully', 'info');
            this.init();
        });

        // Mobile sidebar toggle
        const toggle = document.getElementById('sidebar-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('open');
            });
        }

        // Add mobile header for small screens
        this.addMobileHeader();
    },

    addMobileHeader() {
        if (window.innerWidth <= 768 && !document.querySelector('.mobile-header')) {
            const header = document.createElement('div');
            header.className = 'mobile-header';
            header.innerHTML = `
                <button class="sidebar-toggle" onclick="document.getElementById('sidebar').classList.toggle('open')">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                </button>
                <div class="logo">
                    <div class="logo-icon">
                        <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                            <rect width="28" height="28" rx="6" fill="#FFD700"/>
                            <path d="M7 20L11 12L15 16L21 8" stroke="#0d0d0d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <span class="logo-text">NIVESH<span class="logo-accent">AI</span></span>
                </div>
            `;
            document.querySelector('.main-content').prepend(header);
        }
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    Router.init();
});

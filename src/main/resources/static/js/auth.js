/* ========================================================================
   Auth Page — Login & Register with CAPTCHA
   ======================================================================== */

const AuthPage = {
    captchaToken: null,
    captchaQuestion: '',
    mode: 'login', // 'login' or 'register'

    render() {
        const container = document.getElementById('auth-page');
        container.innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-logo">
                        <div class="logo-icon">
                            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                                <path d="M7 20L11 12L15 16L21 8" stroke="#0d0d0d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="21" cy="8" r="2" fill="#0d0d0d"/>
                            </svg>
                        </div>
                        <h1>NIVESH<span>AI</span></h1>
                        <p>Intelligent Portfolio Management</p>
                    </div>

                    <div class="auth-tabs">
                        <button class="auth-tab ${this.mode === 'login' ? 'active' : ''}" id="tab-login" onclick="AuthPage.switchMode('login')">LOGIN</button>
                        <button class="auth-tab ${this.mode === 'register' ? 'active' : ''}" id="tab-register" onclick="AuthPage.switchMode('register')">SIGN UP</button>
                    </div>

                    <form id="auth-form" onsubmit="AuthPage.handleSubmit(event)">
                        <div id="name-field" class="form-group" style="display: ${this.mode === 'register' ? 'block' : 'none'}">
                            <label class="form-label" for="auth-name">Full Name</label>
                            <input class="form-input" type="text" id="auth-name" placeholder="Enter your full name" autocomplete="name">
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="auth-email">Email Address</label>
                            <input class="form-input" type="email" id="auth-email" placeholder="you@example.com" required autocomplete="email">
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="auth-password">Password</label>
                            <input class="form-input" type="password" id="auth-password" placeholder="Min 6 characters" required autocomplete="current-password">
                        </div>

                        <div class="captcha-box" id="captcha-box">
                            <span class="captcha-question" id="captcha-display">Loading...</span>
                            <input class="captcha-input" type="text" id="captcha-answer" placeholder="?" required>
                            <button type="button" class="captcha-refresh" onclick="AuthPage.loadCaptcha()" title="New CAPTCHA">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
                            </button>
                        </div>

                        <div class="checkbox-row" style="display: ${this.mode === 'login' ? 'flex' : 'none'}" id="remember-row">
                            <input type="checkbox" id="remember-me">
                            <label for="remember-me">Keep me signed in</label>
                        </div>

                        <button type="submit" class="btn btn-primary btn-lg" style="width:100%" id="auth-submit-btn">
                            ${this.mode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}
                        </button>

                        <div id="auth-error" class="form-error" style="text-align:center; margin-top: 12px;"></div>
                    </form>

                    <div class="auth-footer">
                        ${this.mode === 'login'
                            ? 'Don\'t have an account? <a href="#" onclick="AuthPage.switchMode(\'register\'); return false;">Sign Up</a>'
                            : 'Already have an account? <a href="#" onclick="AuthPage.switchMode(\'login\'); return false;">Login</a>'}
                    </div>
                </div>
            </div>
        `;

        this.loadCaptcha();
    },

    switchMode(mode) {
        this.mode = mode;
        this.render();
    },

    async loadCaptcha() {
        try {
            const data = await fetch('/api/captcha/generate').then(r => r.json());
            this.captchaToken = data.token;
            this.captchaQuestion = data.question;
            document.getElementById('captcha-display').textContent = data.question;
            document.getElementById('captcha-answer').value = '';
        } catch (e) {
            document.getElementById('captcha-display').textContent = 'Error loading CAPTCHA';
        }
    },

    async handleSubmit(e) {
        e.preventDefault();
        const errorEl = document.getElementById('auth-error');
        const submitBtn = document.getElementById('auth-submit-btn');
        errorEl.textContent = '';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Please wait...';

        try {
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;
            const captchaAnswer = document.getElementById('captcha-answer').value;

            if (!captchaAnswer) {
                throw new Error('Please solve the CAPTCHA');
            }

            let result;
            if (this.mode === 'login') {
                result = await API.post('/auth/login', {
                    email, password,
                    captchaAnswer, captchaToken: this.captchaToken
                });
            } else {
                const name = document.getElementById('auth-name').value;
                if (!name) throw new Error('Please enter your name');
                result = await API.post('/auth/register', {
                    email, password, name,
                    captchaAnswer, captchaToken: this.captchaToken
                });
            }

            API.setToken(result.token);
            API.setUser({
                id: result.userId,
                email: result.email,
                name: result.name,
                hasProfile: result.hasProfile
            });

            Utils.showToast(`Welcome${this.mode === 'login' ? ' back' : ''}, ${result.name}!`, 'success');

            if (!result.hasProfile) {
                window.location.hash = '#profile';
            } else {
                window.location.hash = '#dashboard';
            }
            Router.init();
        } catch (error) {
            errorEl.textContent = error.message;
            this.loadCaptcha();
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = this.mode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT';
        }
    }
};

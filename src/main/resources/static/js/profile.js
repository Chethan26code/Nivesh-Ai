/* ========================================================================
   Financial Profile Wizard
   ======================================================================== */

const ProfilePage = {
    step: 1,
    totalSteps: 3,
    data: {
        monthlyIncome: '',
        monthlyExpenses: '',
        totalSavings: '',
        investmentGoal: '',
        riskAppetite: ''
    },
    existingProfile: null,

    async render(container) {
        container.innerHTML = Utils.loading();

        try {
            const profile = await API.get('/profile').catch(() => null);
            if (profile) {
                this.existingProfile = profile;
                this.data = {
                    monthlyIncome: profile.monthlyIncome,
                    monthlyExpenses: profile.monthlyExpenses,
                    totalSavings: profile.totalSavings,
                    investmentGoal: profile.investmentGoal,
                    riskAppetite: profile.riskAppetite
                };
            }
        } catch (e) { /* first time */ }

        this.renderStep(container);
    },

    renderStep(container) {
        if (!container) container = document.getElementById('page-content');

        const html = `
            <div class="profile-wizard">
                <div class="page-header">
                    <h1>📊 Financial Profile</h1>
                    <p>${this.existingProfile ? 'Update your financial details' : 'Tell us about your finances to get personalized recommendations'}</p>
                </div>

                <div class="wizard-progress">
                    ${Array.from({length: this.totalSteps}, (_, i) => `
                        <div class="progress-dot ${i + 1 < this.step ? 'completed' : ''} ${i + 1 === this.step ? 'active' : ''}"></div>
                    `).join('')}
                </div>

                ${this.step === 1 ? this.renderStep1() : ''}
                ${this.step === 2 ? this.renderStep2() : ''}
                ${this.step === 3 ? this.renderStep3() : ''}
            </div>
        `;
        container.innerHTML = html;
        this.attachEvents();
    },

    renderStep1() {
        return `
            <div class="wizard-step card">
                <h2 style="font-family:var(--font-display); margin-bottom:24px;">💰 Income & Expenses</h2>

                <div class="form-group">
                    <label class="form-label">Monthly Income ($)</label>
                    <input class="form-input" type="number" id="prof-income" placeholder="e.g., 5000"
                           value="${this.data.monthlyIncome || ''}" min="0" step="100" required>
                </div>

                <div class="form-group">
                    <label class="form-label">Monthly Expenses ($)</label>
                    <input class="form-input" type="number" id="prof-expenses" placeholder="e.g., 3000"
                           value="${this.data.monthlyExpenses || ''}" min="0" step="100" required>
                </div>

                <div class="form-group">
                    <label class="form-label">Total Savings ($)</label>
                    <input class="form-input" type="number" id="prof-savings" placeholder="e.g., 20000"
                           value="${this.data.totalSavings || ''}" min="0" step="100" required>
                </div>

                <div style="display:flex; justify-content:flex-end; margin-top:24px;">
                    <button class="btn btn-primary" onclick="ProfilePage.nextStep()">Next →</button>
                </div>
            </div>
        `;
    },

    renderStep2() {
        return `
            <div class="wizard-step card">
                <h2 style="font-family:var(--font-display); margin-bottom:24px;">🎯 Investment Goals</h2>

                <label class="form-label" style="margin-bottom:12px;">What's your investment horizon?</label>
                <div class="goal-cards">
                    <div class="goal-card ${this.data.investmentGoal === 'SHORT_TERM' ? 'selected' : ''}"
                         onclick="ProfilePage.selectGoal('SHORT_TERM')">
                        <div class="goal-icon">⚡</div>
                        <div class="goal-label">Short Term</div>
                        <div class="goal-desc">Less than 1 year</div>
                    </div>
                    <div class="goal-card ${this.data.investmentGoal === 'MEDIUM_TERM' ? 'selected' : ''}"
                         onclick="ProfilePage.selectGoal('MEDIUM_TERM')">
                        <div class="goal-icon">📈</div>
                        <div class="goal-label">Medium Term</div>
                        <div class="goal-desc">1 to 3 years</div>
                    </div>
                    <div class="goal-card ${this.data.investmentGoal === 'LONG_TERM' ? 'selected' : ''}"
                         onclick="ProfilePage.selectGoal('LONG_TERM')">
                        <div class="goal-icon">🏦</div>
                        <div class="goal-label">Long Term</div>
                        <div class="goal-desc">3+ years</div>
                    </div>
                </div>

                <div style="display:flex; justify-content:space-between; margin-top:24px;">
                    <button class="btn btn-secondary" onclick="ProfilePage.prevStep()">← Back</button>
                    <button class="btn btn-primary" onclick="ProfilePage.nextStep()">Next →</button>
                </div>
            </div>
        `;
    },

    renderStep3() {
        return `
            <div class="wizard-step card">
                <h2 style="font-family:var(--font-display); margin-bottom:24px;">🛡️ Risk Appetite</h2>

                <label class="form-label" style="margin-bottom:12px;">How much risk can you tolerate?</label>
                <div class="risk-cards">
                    <div class="risk-card ${this.data.riskAppetite === 'CONSERVATIVE' ? 'selected' : ''}"
                         onclick="ProfilePage.selectRisk('CONSERVATIVE')">
                        <div class="risk-icon">🔒</div>
                        <div class="risk-label">Conservative</div>
                        <div class="risk-desc">Prefer stability over high returns</div>
                    </div>
                    <div class="risk-card ${this.data.riskAppetite === 'MODERATE' ? 'selected' : ''}"
                         onclick="ProfilePage.selectRisk('MODERATE')">
                        <div class="risk-icon">⚖️</div>
                        <div class="risk-label">Moderate</div>
                        <div class="risk-desc">Balanced risk and return</div>
                    </div>
                    <div class="risk-card ${this.data.riskAppetite === 'AGGRESSIVE' ? 'selected' : ''}"
                         onclick="ProfilePage.selectRisk('AGGRESSIVE')">
                        <div class="risk-icon">🚀</div>
                        <div class="risk-label">Aggressive</div>
                        <div class="risk-desc">High risk for high returns</div>
                    </div>
                </div>

                <div id="investable-preview"></div>

                <div style="display:flex; justify-content:space-between; margin-top:24px;">
                    <button class="btn btn-secondary" onclick="ProfilePage.prevStep()">← Back</button>
                    <button class="btn btn-primary btn-lg" id="save-profile-btn" onclick="ProfilePage.saveProfile()">
                        ${this.existingProfile ? 'Update Profile' : 'Complete Setup'} ✓
                    </button>
                </div>
            </div>

            ${this.existingProfile ? this.renderSimulator() : ''}
        `;
    },

    renderSimulator() {
        return `
            <div class="simulator-card" style="margin-top: 24px;">
                <h3 style="font-family:var(--font-display); margin-bottom: 16px;">🔮 What-If Simulator</h3>
                <p style="color:var(--text-secondary); font-size: 0.88rem; margin-bottom: 16px;">
                    See how changes to your income or expenses would affect your investable amount.
                </p>

                <div class="form-group">
                    <label class="form-label">Simulated Monthly Income ($)</label>
                    <div class="slider-container">
                        <input type="range" id="sim-income"
                               min="${Math.max(0, this.data.monthlyIncome * 0.5)}"
                               max="${this.data.monthlyIncome * 2}"
                               value="${this.data.monthlyIncome}"
                               step="100"
                               oninput="ProfilePage.runSimulation()">
                        <div class="slider-labels">
                            <span>${Utils.formatCurrency(this.data.monthlyIncome * 0.5)}</span>
                            <span id="sim-income-val">${Utils.formatCurrency(this.data.monthlyIncome)}</span>
                            <span>${Utils.formatCurrency(this.data.monthlyIncome * 2)}</span>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Simulated Monthly Expenses ($)</label>
                    <div class="slider-container">
                        <input type="range" id="sim-expenses"
                               min="${Math.max(0, this.data.monthlyExpenses * 0.5)}"
                               max="${this.data.monthlyExpenses * 2}"
                               value="${this.data.monthlyExpenses}"
                               step="100"
                               oninput="ProfilePage.runSimulation()">
                        <div class="slider-labels">
                            <span>${Utils.formatCurrency(this.data.monthlyExpenses * 0.5)}</span>
                            <span id="sim-expenses-val">${Utils.formatCurrency(this.data.monthlyExpenses)}</span>
                            <span>${Utils.formatCurrency(this.data.monthlyExpenses * 2)}</span>
                        </div>
                    </div>
                </div>

                <div id="sim-result" style="display:none;"></div>
            </div>
        `;
    },

    selectGoal(goal) {
        this.data.investmentGoal = goal;
        document.querySelectorAll('.goal-card').forEach(c => c.classList.remove('selected'));
        event.currentTarget.classList.add('selected');
    },

    selectRisk(risk) {
        this.data.riskAppetite = risk;
        document.querySelectorAll('.risk-card').forEach(c => c.classList.remove('selected'));
        event.currentTarget.classList.add('selected');
        this.updateInvestablePreview();
    },

    updateInvestablePreview() {
        if (!this.data.monthlyIncome || !this.data.monthlyExpenses || !this.data.riskAppetite) return;

        const surplus = this.data.monthlyIncome - this.data.monthlyExpenses;
        const rates = { CONSERVATIVE: 0.15, MODERATE: 0.25, AGGRESSIVE: 0.40 };
        const savingsRates = { SHORT_TERM: 0.05, MEDIUM_TERM: 0.10, LONG_TERM: 0.15 };
        const rate = rates[this.data.riskAppetite] || 0.20;
        const savingsRate = savingsRates[this.data.investmentGoal] || 0.10;
        const investable = Math.max(0, surplus * rate * 12 + (this.data.totalSavings || 0) * savingsRate);

        const el = document.getElementById('investable-preview');
        if (el) {
            el.innerHTML = `
                <div class="investable-display">
                    <div class="label">Your Estimated Investable Amount</div>
                    <div class="amount">${Utils.formatCurrency(investable)}</div>
                    <div class="sub">per year based on your profile</div>
                </div>
            `;
        }
    },

    nextStep() {
        if (this.step === 1) {
            const income = parseFloat(document.getElementById('prof-income').value);
            const expenses = parseFloat(document.getElementById('prof-expenses').value);
            const savings = parseFloat(document.getElementById('prof-savings').value);
            if (!income || !expenses || savings === undefined) {
                Utils.showToast('Please fill in all fields', 'error');
                return;
            }
            this.data.monthlyIncome = income;
            this.data.monthlyExpenses = expenses;
            this.data.totalSavings = savings;
        }
        if (this.step === 2 && !this.data.investmentGoal) {
            Utils.showToast('Please select an investment goal', 'error');
            return;
        }
        this.step = Math.min(this.step + 1, this.totalSteps);
        this.renderStep();
    },

    prevStep() {
        this.step = Math.max(this.step - 1, 1);
        this.renderStep();
    },

    async saveProfile() {
        if (!this.data.riskAppetite) {
            Utils.showToast('Please select your risk appetite', 'error');
            return;
        }

        const btn = document.getElementById('save-profile-btn');
        btn.disabled = true;
        btn.textContent = 'Saving...';

        try {
            await API.post('/profile', this.data);

            const user = API.getUser();
            if (user) {
                user.hasProfile = true;
                API.setUser(user);
            }

            Utils.showToast('Profile saved successfully!', 'success');
            window.location.hash = '#recommendations';
            Router.navigate('recommendations');
        } catch (error) {
            Utils.showToast(error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = this.existingProfile ? 'Update Profile' : 'Complete Setup ✓';
        }
    },

    async runSimulation() {
        const income = parseFloat(document.getElementById('sim-income').value);
        const expenses = parseFloat(document.getElementById('sim-expenses').value);
        document.getElementById('sim-income-val').textContent = Utils.formatCurrency(income);
        document.getElementById('sim-expenses-val').textContent = Utils.formatCurrency(expenses);

        try {
            const result = await API.post(`/profile/simulate?income=${income}&expenses=${expenses}`, {});
            const el = document.getElementById('sim-result');
            el.style.display = 'block';
            el.innerHTML = `
                <div class="summary-grid" style="margin-top: 16px;">
                    <div class="summary-card">
                        <div class="label">Current</div>
                        <div class="value">${Utils.formatCurrency(result.currentInvestable)}</div>
                    </div>
                    <div class="summary-card ${result.change >= 0 ? '' : ''}">
                        <div class="label">Simulated</div>
                        <div class="value">${Utils.formatCurrency(result.simulatedInvestable)}</div>
                        <div class="change ${result.change >= 0 ? 'positive' : 'negative'}">
                            ${result.change >= 0 ? '+' : ''}${Utils.formatCurrency(result.change)} (${Utils.formatPercent(result.changePercent)})
                        </div>
                    </div>
                </div>
            `;
        } catch (e) { /* silent */ }
    },

    attachEvents() {
        if (this.step === 3) {
            this.updateInvestablePreview();
        }
    }
};

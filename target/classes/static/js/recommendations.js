/* ========================================================================
   Recommendations Page — Stock Signals with Suitability
   ======================================================================== */

const RecommendationsPage = {
    data: null,
    filters: { risk: '', sector: '', signal: '' },
    sectors: ['Technology', 'Healthcare', 'Finance', 'Consumer', 'Energy'],

    async render(container) {
        container.innerHTML = Utils.loading();

        try {
            await this.fetchData();
            this.renderContent(container);
        } catch (e) {
            if (e.message.includes('financial profile')) {
                container.innerHTML = Utils.emptyState(
                    'Complete Your Profile First',
                    'We need your financial information to provide personalized stock recommendations.',
                    '<a href="#profile" class="btn btn-primary">Setup Profile →</a>'
                );
            } else {
                container.innerHTML = Utils.emptyState('Error Loading', e.message);
            }
        }
    },

    async fetchData() {
        const params = new URLSearchParams();
        if (this.filters.risk) params.set('risk', this.filters.risk);
        if (this.filters.sector) params.set('sector', this.filters.sector);
        if (this.filters.signal) params.set('signal', this.filters.signal);
        const query = params.toString() ? '?' + params.toString() : '';
        this.data = await API.get('/recommendations' + query);
    },

    renderContent(container) {
        const { recommendations, investableAmount, riskAppetite } = this.data;

        container.innerHTML = `
            <div class="page-header">
                <h1>⭐ Stock Recommendations</h1>
                <p>AI-powered signals matched to your ${riskAppetite.toLowerCase()} risk profile • Investable: ${Utils.formatCurrency(investableAmount)}</p>
            </div>

            <div class="filters-bar">
                <span style="font-size:0.82rem; color:var(--text-secondary); font-weight:600;">Filters:</span>

                <button class="filter-chip ${this.filters.signal === '' ? 'active' : ''}" onclick="RecommendationsPage.setFilter('signal','')">All Signals</button>
                <button class="filter-chip ${this.filters.signal === 'BUY' ? 'active' : ''}" onclick="RecommendationsPage.setFilter('signal','BUY')">🟢 BUY</button>
                <button class="filter-chip ${this.filters.signal === 'SELL' ? 'active' : ''}" onclick="RecommendationsPage.setFilter('signal','SELL')">🔴 SELL</button>
                <button class="filter-chip ${this.filters.signal === 'HOLD' ? 'active' : ''}" onclick="RecommendationsPage.setFilter('signal','HOLD')">🟡 HOLD</button>

                <span style="color:var(--border); margin: 0 4px;">|</span>

                <select class="form-select" style="width:auto; padding:8px 36px 8px 12px; font-size:0.82rem;" onchange="RecommendationsPage.setFilter('risk', this.value)">
                    <option value="">All Risk</option>
                    <option value="LOW" ${this.filters.risk === 'LOW' ? 'selected' : ''}>🟢 Low Risk</option>
                    <option value="MEDIUM" ${this.filters.risk === 'MEDIUM' ? 'selected' : ''}>🟡 Medium Risk</option>
                    <option value="HIGH" ${this.filters.risk === 'HIGH' ? 'selected' : ''}>🔴 High Risk</option>
                </select>

                <select class="form-select" style="width:auto; padding:8px 36px 8px 12px; font-size:0.82rem;" onchange="RecommendationsPage.setFilter('sector', this.value)">
                    <option value="">All Sectors</option>
                    ${this.sectors.map(s => `<option value="${s}" ${this.filters.sector === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
            </div>

            <div class="stock-grid">
                ${recommendations.length === 0
                    ? '<div style="grid-column:1/-1;">' + Utils.emptyState('No Matches', 'Try adjusting your filters') + '</div>'
                    : recommendations.map(rec => this.renderStockCard(rec)).join('')
                }
            </div>
        `;
    },

    renderStockCard(rec) {
        const changeClass = rec.priceChange >= 0 ? 'pnl-positive' : 'pnl-negative';
        const suitColor = Utils.suitabilityColor(rec.suitabilityScore);

        return `
            <div class="stock-card" onclick="RecommendationsPage.showStockDetail(${rec.stockId})">
                <div class="stock-card-header">
                    <div>
                        <div class="stock-symbol">${rec.symbol}</div>
                        <div class="stock-name">${rec.name}</div>
                    </div>
                    <div>
                        <div class="stock-price">${Utils.formatCurrency(rec.latestPrice)}</div>
                        <div class="stock-change ${changeClass}">${Utils.formatPercent(rec.priceChange)}</div>
                    </div>
                </div>

                <div class="stock-meta">
                    ${Utils.signalBadge(rec.signal)}
                    ${Utils.riskBadge(rec.riskLevel)}
                    <span class="badge" style="background:var(--neon-blue-dim);color:var(--neon-blue)">${rec.sector}</span>
                </div>

                <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--text-3); margin-bottom:4px; font-family:var(--font-mono);">
                    <span>RSI: ${rec.rsi}</span>
                    <span>Vol: ${rec.volatility}%</span>
                </div>

                <div class="suitability-bar">
                    <div class="suitability-fill" style="width:${rec.suitabilityScore}%; background:${suitColor};"></div>
                </div>
                <div class="suitability-label">
                    <span>${rec.riskMatch}</span>
                    <span style="font-weight:700; color:${suitColor};">Suitability: ${rec.suitabilityScore}/100</span>
                </div>

                <div class="suggested-info">
                    <span>Suggested: ${Utils.formatCurrency(rec.suggestedAmount)}</span>
                    <span>${rec.suggestedQuantity} shares</span>
                </div>
            </div>
        `;
    },

    async setFilter(key, value) {
        this.filters[key] = value;
        const container = document.getElementById('page-content');
        container.innerHTML = Utils.loading();
        try {
            await this.fetchData();
            this.renderContent(container);
        } catch (e) {
            container.innerHTML = Utils.emptyState('Error', e.message);
        }
    },

    async showStockDetail(stockId) {
        try {
            const stock = await API.get(`/stocks/${stockId}`);
            const prices = await API.get(`/stocks/${stockId}/prices`);

            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

            const signal = stock.signal || {};

            overlay.innerHTML = `
                <div class="modal" style="max-width:640px;">
                    <div class="modal-header">
                        <div>
                            <div class="modal-title">${stock.symbol} — ${stock.name}</div>
                            <div style="font-size:0.82rem; color:var(--text-secondary); margin-top:4px;">
                                ${stock.sector} • ${Utils.riskBadge(stock.riskLevel)} ${Utils.signalBadge(signal.signal || 'HOLD')}
                            </div>
                        </div>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                    </div>

                    <div class="chart-container" style="height:250px;">
                        <canvas id="stock-detail-chart"></canvas>
                    </div>

                    <div class="summary-grid" style="margin-top:16px;">
                        <div class="summary-card">
                            <div class="label">RSI (14)</div>
                            <div class="value" style="font-size:1.3rem;">${signal.rsi || 'N/A'}</div>
                        </div>
                        <div class="summary-card">
                            <div class="label">Volatility</div>
                            <div class="value" style="font-size:1.3rem;">${signal.volatility || 'N/A'}%</div>
                        </div>
                        <div class="summary-card">
                            <div class="label">SMA Trend</div>
                            <div class="value" style="font-size:1rem;">${signal.smaSignal || 'N/A'}</div>
                        </div>
                        <div class="summary-card">
                            <div class="label">MACD</div>
                            <div class="value" style="font-size:1rem;">${signal.macdSignal || 'N/A'}</div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        <button class="btn btn-success" onclick="this.closest('.modal-overlay').remove(); window.location.hash='#portfolio'; PortfolioPage.openBuyModal(${stock.id}, '${stock.symbol}');">
                            Buy ${stock.symbol}
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Render chart
            setTimeout(() => {
                const ctx = document.getElementById('stock-detail-chart');
                if (ctx && prices.length > 0) {
                    const last90 = prices.slice(-90);
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: last90.map(p => p.date),
                            datasets: [{
                                label: 'Close Price',
                                data: last90.map(p => p.close),
                                borderColor: '#F5C518',
                                backgroundColor: 'rgba(245,197,24,0.06)',
                                fill: true,
                                tension: 0.4,
                                pointRadius: 0,
                                borderWidth: 2
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: {
                                    display: true,
                                    ticks: { color: '#3F3F46', maxTicksLimit: 6, font: { size: 10, family: 'Inter' } },
                                    grid: { color: 'rgba(255,255,255,0.03)' }
                                },
                                y: {
                                    display: true,
                                    ticks: { color: '#3F3F46', font: { size: 10, family: 'JetBrains Mono' } },
                                    grid: { color: 'rgba(255,255,255,0.03)' }
                                }
                            }
                        }
                    });
                }
            }, 100);
        } catch (e) {
            Utils.showToast('Error loading stock details', 'error');
        }
    }
};

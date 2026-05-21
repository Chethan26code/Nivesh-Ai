/* ========================================================================
   Dashboard Page — Charts & Insights (v2 — Tech UI)
   ======================================================================== */

const DashboardPage = {
    charts: {},

    async render(container) {
        container.innerHTML = Utils.loading();

        try {
            const [summary, allocation, movers, insights] = await Promise.all([
                API.get('/dashboard/summary'),
                API.get('/dashboard/allocation'),
                API.get('/dashboard/top-movers'),
                API.get('/dashboard/insights')
            ]);

            this.renderContent(container, summary, allocation, movers, insights);
        } catch (e) {
            container.innerHTML = Utils.emptyState('Error loading dashboard', e.message);
        }
    },

    renderContent(container, summary, allocation, movers, insights) {
        const { totalInvested, totalValue, totalPnl, totalPnlPercent, holdingsCount, holdings } = summary;

        container.innerHTML = `
            <div class="page-header">
                <h1>📊 Portfolio Dashboard</h1>
                <p>Real-time overview of your investment performance</p>
            </div>

            <div class="summary-grid">
                <div class="summary-card accent-card">
                    <div class="label">Total Portfolio Value</div>
                    <div class="value">${Utils.formatCurrency(totalValue)}</div>
                    <div class="change" style="color:rgba(0,0,0,0.5);background:rgba(0,0,0,0.1)">${holdingsCount} holdings</div>
                </div>
                <div class="summary-card">
                    <div class="label">Total Invested</div>
                    <div class="value">${Utils.formatCurrency(totalInvested)}</div>
                </div>
                <div class="summary-card">
                    <div class="label">Total P&L</div>
                    <div class="value ${Utils.pnlClass(totalPnl)}">${Utils.formatCurrency(totalPnl)}</div>
                    <div class="change ${Utils.changeClass(totalPnlPercent)}">${Utils.formatPercent(totalPnlPercent)}</div>
                </div>
                <div class="summary-card">
                    <div class="label">Investable Amount</div>
                    <div class="value">${Utils.formatCurrency(summary.investableAmount || 0)}</div>
                    <div class="change" style="color:var(--text-4);background:rgba(255,255,255,0.04)">${summary.riskAppetite || 'N/A'} risk</div>
                </div>
            </div>

            <div class="dashboard-grid">
                <!-- Holdings Performance -->
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Holdings Performance</span>
                    </div>
                    <div class="chart-container" style="height:280px;">
                        <canvas id="holdings-chart"></canvas>
                    </div>
                </div>

                <!-- Sector Allocation -->
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Sector Allocation</span>
                    </div>
                    <div class="chart-container" style="height:280px;">
                        <canvas id="allocation-chart"></canvas>
                    </div>
                </div>

                <!-- Top Gainers -->
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">↑ Top Gainers</span>
                    </div>
                    ${movers.gainers && movers.gainers.length > 0
                        ? movers.gainers.map(g => this.renderMoverItem(g, true)).join('')
                        : '<p style="color:var(--text-4);padding:24px;text-align:center;font-size:0.85rem;">No gainers yet</p>'}
                </div>

                <!-- Top Losers -->
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">↓ Top Losers</span>
                    </div>
                    ${movers.losers && movers.losers.length > 0
                        ? movers.losers.map(g => this.renderMoverItem(g, false)).join('')
                        : '<p style="color:var(--text-4);padding:24px;text-align:center;font-size:0.85rem;">No losers yet</p>'}
                </div>

                <!-- AI Insights -->
                <div class="insight-card full-width">
                    <h3>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2a7 7 0 017 7c0 3-2 5.5-4 7l-1 3H10l-1-3c-2-1.5-4-4-4-7a7 7 0 017-7z"/>
                            <line x1="10" y1="22" x2="14" y2="22"/>
                        </svg>
                        AI Insights
                    </h3>
                    ${insights.insights.map(i => `<div class="insight-item">→ ${i}</div>`).join('')}
                </div>
            </div>
        `;

        setTimeout(() => {
            this.renderHoldingsChart(holdings || []);
            this.renderAllocationChart(allocation);
        }, 100);
    },

    renderMoverItem(item, isGainer) {
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid var(--border-subtle);">
                <div>
                    <strong style="font-size:0.88rem;">${item.symbol}</strong>
                    <div style="font-size:0.7rem; color:var(--text-4);">${item.name}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:700; font-size:0.88rem; font-family:var(--font-mono);" class="${isGainer ? 'pnl-positive' : 'pnl-negative'}">
                        ${Utils.formatPercent(item.pnlPercent)}
                    </div>
                    <div style="font-size:0.72rem; color:var(--text-4); font-family:var(--font-mono);">
                        ${Utils.formatCurrency(item.pnl)}
                    </div>
                </div>
            </div>
        `;
    },

    renderHoldingsChart(holdings) {
        const ctx = document.getElementById('holdings-chart');
        if (!ctx || holdings.length === 0) return;

        const labels = holdings.map(h => h.symbol);
        const invested = holdings.map(h => h.totalInvested);
        const current = holdings.map(h => h.currentValue);

        if (this.charts.holdings) this.charts.holdings.destroy();

        this.charts.holdings = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Invested',
                        data: invested,
                        backgroundColor: 'rgba(245,197,24,0.2)',
                        borderColor: 'rgba(245,197,24,0.6)',
                        borderWidth: 1,
                        borderRadius: 6
                    },
                    {
                        label: 'Current',
                        data: current,
                        backgroundColor: current.map((v, i) => v >= invested[i] ? 'rgba(57,255,20,0.2)' : 'rgba(255,59,92,0.2)'),
                        borderColor: current.map((v, i) => v >= invested[i] ? 'rgba(57,255,20,0.6)' : 'rgba(255,59,92,0.6)'),
                        borderWidth: 1,
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#71717A', font: { size: 11, family: 'Inter' }, padding: 16, usePointStyle: true }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#3F3F46', font: { size: 10, family: 'Inter' } },
                        grid: { color: 'rgba(255,255,255,0.03)' }
                    },
                    y: {
                        ticks: { color: '#3F3F46', font: { size: 10, family: 'JetBrains Mono' }, callback: v => '$' + v.toLocaleString() },
                        grid: { color: 'rgba(255,255,255,0.03)' }
                    }
                }
            }
        });
    },

    renderAllocationChart(allocation) {
        const ctx = document.getElementById('allocation-chart');
        if (!ctx || Object.keys(allocation).length === 0) {
            if (ctx) {
                ctx.parentElement.innerHTML = '<p style="color:var(--text-4);text-align:center;padding:60px 20px;font-size:0.85rem;">No allocation data. Buy stocks to see distribution.</p>';
            }
            return;
        }

        const sectorColors = {
            'Technology': '#3B82F6',
            'Healthcare': '#39FF14',
            'Finance': '#F5C518',
            'Consumer': '#F97316',
            'Energy': '#A855F7'
        };

        const labels = Object.keys(allocation);
        const data = Object.values(allocation);
        const colors = labels.map(l => sectorColors[l] || '#71717A');

        if (this.charts.allocation) this.charts.allocation.destroy();

        this.charts.allocation = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderColor: '#0e0e14',
                    borderWidth: 3,
                    hoverBorderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#A1A1AA',
                            font: { size: 11, family: 'Inter' },
                            padding: 16,
                            usePointStyle: true,
                            pointStyleWidth: 10
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(14,14,20,0.9)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        titleFont: { family: 'Inter', weight: '700' },
                        bodyFont: { family: 'JetBrains Mono' },
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${ctx.raw}%`
                        }
                    }
                }
            }
        });
    }
};

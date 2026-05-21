/* ========================================================================
   Utility Functions — v2
   ======================================================================== */

const Utils = {
    formatCurrency(amount, symbol = '$') {
        if (amount === null || amount === undefined) return `${symbol}0.00`;
        const num = parseFloat(amount);
        const formatted = Math.abs(num).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return num < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
    },

    formatPercent(value) {
        if (value === null || value === undefined) return '0.00%';
        const num = parseFloat(value);
        return (num >= 0 ? '+' : '') + num.toFixed(2) + '%';
    },

    formatNumber(num) {
        if (num === null || num === undefined) return '0';
        return parseFloat(num).toLocaleString('en-US');
    },

    pnlClass(value) {
        const num = parseFloat(value);
        if (num > 0) return 'pnl-positive';
        if (num < 0) return 'pnl-negative';
        return '';
    },

    changeClass(value) {
        const num = parseFloat(value);
        if (num > 0) return 'positive';
        if (num < 0) return 'negative';
        return '';
    },

    signalBadge(signal) {
        const cls = signal === 'BUY' ? 'badge-buy' : signal === 'SELL' ? 'badge-sell' : 'badge-hold';
        const icon = signal === 'BUY' ? '↑' : signal === 'SELL' ? '↓' : '—';
        return `<span class="badge ${cls}">${icon} ${signal}</span>`;
    },

    riskBadge(risk) {
        const cls = risk === 'LOW' ? 'badge-low' : risk === 'HIGH' ? 'badge-high' : 'badge-medium';
        return `<span class="badge ${cls}">${risk}</span>`;
    },

    suitabilityColor(score) {
        if (score >= 70) return 'var(--neon-green)';
        if (score >= 40) return 'var(--neon-orange)';
        return 'var(--neon-red)';
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ'
        };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span style="font-weight:800">${icons[type] || '•'}</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(30px) scale(0.9)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    loading() {
        return '<div class="loading"><div class="spinner"></div></div>';
    },

    emptyState(title, description, actionHtml = '') {
        return `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 12V7H5a2 2 0 010-4h14v4"/>
                    <path d="M3 5v14a2 2 0 002 2h16v-5"/>
                    <path d="M18 12a2 2 0 000 4h4v-4h-4z"/>
                </svg>
                <h3>${title}</h3>
                <p>${description}</p>
                ${actionHtml}
            </div>
        `;
    }
};

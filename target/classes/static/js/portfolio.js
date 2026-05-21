/* ========================================================================
   Portfolio Page — Virtual Trading with P&L
   ======================================================================== */

const PortfolioPage = {
    holdings: [],
    history: [],
    stocks: [],

    async render(container) {
        container.innerHTML = Utils.loading();

        try {
            const [holdings, history, stocks] = await Promise.all([
                API.get('/portfolio'),
                API.get('/portfolio/history'),
                API.get('/stocks')
            ]);
            this.holdings = holdings;
            this.history = history;
            this.stocks = stocks;
            this.renderContent(container);
        } catch (e) {
            container.innerHTML = Utils.emptyState('Error loading portfolio', e.message);
        }
    },

    renderContent(container) {
        const totalInvested = this.holdings.reduce((s, h) => s + h.totalInvested, 0);
        const totalValue = this.holdings.reduce((s, h) => s + h.currentValue, 0);
        const totalPnl = this.holdings.reduce((s, h) => s + h.pnl, 0);
        const totalPnlPct = totalInvested > 0 ? (totalValue / totalInvested - 1) * 100 : 0;

        container.innerHTML = `
            <div class="page-header">
                <h1>💼 Virtual Portfolio</h1>
                <p>Track your positions and P&L with historical price replay</p>
            </div>

            <div class="summary-grid">
                <div class="summary-card accent-card">
                    <div class="label">Portfolio Value</div>
                    <div class="value">${Utils.formatCurrency(totalValue)}</div>
                </div>
                <div class="summary-card">
                    <div class="label">Total Invested</div>
                    <div class="value">${Utils.formatCurrency(totalInvested)}</div>
                </div>
                <div class="summary-card">
                    <div class="label">Total P&L</div>
                    <div class="value ${Utils.pnlClass(totalPnl)}">${Utils.formatCurrency(totalPnl)}</div>
                    <div class="change ${Utils.changeClass(totalPnlPct)}">${Utils.formatPercent(totalPnlPct)}</div>
                </div>
                <div class="summary-card">
                    <div class="label">Holdings</div>
                    <div class="value">${this.holdings.length}</div>
                </div>
            </div>

            <div class="portfolio-actions">
                <button class="btn btn-success" onclick="PortfolioPage.showBuyModal()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    BUY Stock
                </button>
                ${this.holdings.length > 0 ? `
                <button class="btn btn-danger" onclick="PortfolioPage.showSellModal()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    SELL Stock
                </button>` : ''}
            </div>

            ${this.holdings.length > 0 ? `
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header">
                    <span class="card-title">Current Holdings</span>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Stock</th>
                                <th>Qty</th>
                                <th>Buy Price</th>
                                <th>Current Price</th>
                                <th>Invested</th>
                                <th>Current Value</th>
                                <th>P&L</th>
                                <th>P&L %</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.holdings.map(h => `
                                <tr>
                                    <td>
                                        <strong>${h.symbol}</strong>
                                        <div style="font-size:0.72rem;color:var(--text-muted)">${h.name}</div>
                                    </td>
                                    <td>${h.quantity}</td>
                                    <td>${Utils.formatCurrency(h.buyPrice)}</td>
                                    <td>${Utils.formatCurrency(h.currentPrice)}</td>
                                    <td>${Utils.formatCurrency(h.totalInvested)}</td>
                                    <td>${Utils.formatCurrency(h.currentValue)}</td>
                                    <td class="${Utils.pnlClass(h.pnl)}" style="font-weight:600;">${Utils.formatCurrency(h.pnl)}</td>
                                    <td class="${Utils.pnlClass(h.pnlPercent)}" style="font-weight:600;">${Utils.formatPercent(h.pnlPercent)}</td>
                                    <td>
                                        <button class="btn btn-danger btn-sm" onclick="PortfolioPage.quickSell(${h.id}, '${h.symbol}', ${h.quantity})">Sell</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>` : Utils.emptyState('No Holdings Yet', 'Start by buying stocks from the recommendations page.',
                '<a href="#recommendations" class="btn btn-primary">View Recommendations →</a>')}

            ${this.history.length > 0 ? `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Trade History</span>
                    <span class="card-subtitle">${this.history.length} trades</span>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Stock</th>
                                <th>Type</th>
                                <th>Qty</th>
                                <th>Buy Price</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>P&L</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.history.slice(0, 20).map(t => `
                                <tr>
                                    <td><strong>${t.symbol}</strong></td>
                                    <td>${t.status === 'CLOSED' ? '<span class="badge badge-sell">SOLD</span>' : '<span class="badge badge-buy">OPEN</span>'}</td>
                                    <td>${t.quantity}</td>
                                    <td>${Utils.formatCurrency(t.buyPrice)}</td>
                                    <td>${t.buyDate}</td>
                                    <td>${t.status}</td>
                                    <td class="${Utils.pnlClass(t.pnl || t.unrealizedPnl || 0)}" style="font-weight:600;">
                                        ${Utils.formatCurrency(t.pnl || t.unrealizedPnl || 0)}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>` : ''}
        `;
    },

    showBuyModal(stockId, symbol) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <span class="modal-title">🟢 Buy Stock</span>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>

                <div class="form-group">
                    <label class="form-label">Select Stock</label>
                    <select class="form-select" id="buy-stock-id">
                        ${this.stocks.map(s => `<option value="${s.id}" ${s.id === stockId ? 'selected' : ''}>${s.symbol} — ${s.name} (${Utils.formatCurrency(s.latestPrice)})</option>`).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Quantity</label>
                    <input class="form-input" type="number" id="buy-quantity" min="1" value="10" placeholder="Number of shares">
                </div>

                <div class="form-group">
                    <label class="form-label">Buy Date (Historical)</label>
                    <input class="form-input" type="date" id="buy-date" value="2024-06-15" min="2022-01-03" max="2024-12-31">
                </div>

                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn btn-success" id="confirm-buy-btn" onclick="PortfolioPage.executeBuy()">Confirm Buy</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    showSellModal() {
        if (this.holdings.length === 0) {
            Utils.showToast('No holdings to sell', 'error');
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <span class="modal-title">🔴 Sell Stock</span>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>

                <div class="form-group">
                    <label class="form-label">Select Position</label>
                    <select class="form-select" id="sell-portfolio-id" onchange="PortfolioPage.updateSellMax()">
                        ${this.holdings.map(h => `<option value="${h.id}" data-qty="${h.quantity}" data-stock="${h.stockId}">${h.symbol} — ${h.quantity} shares @ ${Utils.formatCurrency(h.buyPrice)}</option>`).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Quantity to Sell</label>
                    <input class="form-input" type="number" id="sell-quantity" min="1" max="${this.holdings[0]?.quantity || 1}" value="1">
                </div>

                <div class="form-group">
                    <label class="form-label">Sell Date (Historical)</label>
                    <input class="form-input" type="date" id="sell-date" value="2024-12-15" min="2022-01-03" max="2024-12-31">
                </div>

                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn btn-danger" id="confirm-sell-btn" onclick="PortfolioPage.executeSell()">Confirm Sell</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    updateSellMax() {
        const select = document.getElementById('sell-portfolio-id');
        const option = select.options[select.selectedIndex];
        const maxQty = parseInt(option.dataset.qty);
        const qtyInput = document.getElementById('sell-quantity');
        qtyInput.max = maxQty;
        qtyInput.value = Math.min(parseInt(qtyInput.value), maxQty);
    },

    async executeBuy() {
        const btn = document.getElementById('confirm-buy-btn');
        btn.disabled = true;
        btn.textContent = 'Processing...';

        try {
            const stockId = parseInt(document.getElementById('buy-stock-id').value);
            const quantity = parseInt(document.getElementById('buy-quantity').value);
            const date = document.getElementById('buy-date').value;

            if (!quantity || quantity < 1) throw new Error('Invalid quantity');
            if (!date) throw new Error('Please select a date');

            const result = await API.post('/portfolio/buy', { stockId, quantity, date });

            document.querySelector('.modal-overlay').remove();
            Utils.showToast(`Bought ${result.quantity} shares of ${result.stock} at ${Utils.formatCurrency(result.buyPrice)}`, 'success');

            this.render(document.getElementById('page-content'));
        } catch (e) {
            Utils.showToast(e.message, 'error');
            btn.disabled = false;
            btn.textContent = 'Confirm Buy';
        }
    },

    async executeSell() {
        const btn = document.getElementById('confirm-sell-btn');
        btn.disabled = true;
        btn.textContent = 'Processing...';

        try {
            const select = document.getElementById('sell-portfolio-id');
            const portfolioId = parseInt(select.value);
            const stockId = parseInt(select.options[select.selectedIndex].dataset.stock);
            const quantity = parseInt(document.getElementById('sell-quantity').value);
            const date = document.getElementById('sell-date').value;

            if (!quantity || quantity < 1) throw new Error('Invalid quantity');

            const result = await API.post('/portfolio/sell', { portfolioId, stockId, quantity, date });

            document.querySelector('.modal-overlay').remove();
            const pnlText = result.pnl >= 0 ? `+${Utils.formatCurrency(result.pnl)}` : Utils.formatCurrency(result.pnl);
            Utils.showToast(`Sold ${result.quantity} ${result.stock} — P&L: ${pnlText}`, result.pnl >= 0 ? 'success' : 'error');

            this.render(document.getElementById('page-content'));
        } catch (e) {
            Utils.showToast(e.message, 'error');
            btn.disabled = false;
            btn.textContent = 'Confirm Sell';
        }
    },

    async quickSell(portfolioId, symbol, maxQty) {
        const qty = prompt(`Sell how many shares of ${symbol}? (max ${maxQty})`);
        if (!qty || parseInt(qty) < 1 || parseInt(qty) > maxQty) return;

        try {
            const holding = this.holdings.find(h => h.id === portfolioId);
            const result = await API.post('/portfolio/sell', {
                portfolioId,
                stockId: holding.stockId,
                quantity: parseInt(qty),
                date: '2024-12-31'
            });

            const pnlText = result.pnl >= 0 ? `+${Utils.formatCurrency(result.pnl)}` : Utils.formatCurrency(result.pnl);
            Utils.showToast(`Sold ${result.quantity} ${result.stock} — P&L: ${pnlText}`, result.pnl >= 0 ? 'success' : 'error');
            this.render(document.getElementById('page-content'));
        } catch (e) {
            Utils.showToast(e.message, 'error');
        }
    },

    openBuyModal(stockId, symbol) {
        // Called from recommendations page
        setTimeout(() => {
            this.showBuyModal(stockId, symbol);
        }, 500);
    }
};

/* ========================================================================
   Academy Page — Beginner Guides
   ======================================================================== */

const AcademyPage = {
    render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Nivesh Academy 🎓</h1>
                    <p>Your guide to mastering the stock market.</p>
                </div>
            </div>

            <div class="academy-content" style="display: flex; flex-direction: column; gap: 24px;">
                <div class="card">
                    <h3 style="color:var(--gold); margin-bottom:12px; font-family:var(--font-display);">1. How to Buy and Sell Stocks</h3>
                    <p style="color:var(--text-2); line-height:1.6; margin-bottom: 12px;">
                        Buying a stock means you are purchasing a small piece of a company. When the company does well, the stock price usually goes up. 
                        Selling a stock means you are cashing out your piece of the company.
                    </p>
                    <ul style="color:var(--text-2); padding-left:20px; line-height:1.6;">
                        <li><strong>BUY:</strong> Use the <span style="color:var(--neon-green)">Buy</span> signal on the recommendations page to purchase stocks we predict will rise.</li>
                        <li><strong>SELL:</strong> Monitor your portfolio. If a stock you own gets a <span style="color:var(--neon-red)">Sell</span> signal, consider selling it to secure profits or prevent losses.</li>
                    </ul>
                </div>

                <div class="card">
                    <h3 style="color:var(--gold); margin-bottom:12px; font-family:var(--font-display);">2. Understanding Risk vs Reward</h3>
                    <p style="color:var(--text-2); line-height:1.6;">
                        In the stock market, higher potential rewards usually come with higher risks. 
                        As a beginner, it is crucial to start with <strong>Low Risk</strong> or <strong>Medium Risk</strong> stocks. 
                        During your 5-Day Grace Period, Nivesh AI will guide you and warn you about highly volatile stocks.
                    </p>
                </div>

                <div class="card">
                    <h3 style="color:var(--gold); margin-bottom:12px; font-family:var(--font-display);">3. Decoding Our Signals</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:16px; margin-top:16px;">
                        <div style="padding:16px; border:1px solid var(--border-subtle); border-radius:var(--r-md); background:rgba(255,255,255,0.02);">
                            <h4 style="color:var(--text-1); margin-bottom:8px;">RSI (Relative Strength Index)</h4>
                            <p style="color:var(--text-3); font-size:0.85rem;">Measures if a stock is overbought (>70) or oversold (<30). We look for oversold stocks to buy.</p>
                        </div>
                        <div style="padding:16px; border:1px solid var(--border-subtle); border-radius:var(--r-md); background:rgba(255,255,255,0.02);">
                            <h4 style="color:var(--text-1); margin-bottom:8px;">MACD</h4>
                            <p style="color:var(--text-3); font-size:0.85rem;">Shows the trend direction. A positive MACD indicates upward momentum.</p>
                        </div>
                        <div style="padding:16px; border:1px solid var(--border-subtle); border-radius:var(--r-md); background:rgba(255,255,255,0.02);">
                            <h4 style="color:var(--text-1); margin-bottom:8px;">Volatility</h4>
                            <p style="color:var(--text-3); font-size:0.85rem;">How much the stock price jumps around. High volatility means higher risk.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

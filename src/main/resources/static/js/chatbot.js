/* ========================================================================
   Chatbot — NivBot (Rule-based prototype)
   ======================================================================== */

const Chatbot = {
    isOpen: false,
    initialized: false,

    // Pre-programmed responses for the prototype
    knowledgeBase: {
        "rsi": "RSI stands for Relative Strength Index. It helps us know if a stock is 'overbought' or 'oversold'. A number below 30 usually means it's a good time to buy!",
        "macd": "MACD shows the trend direction. If the MACD line crosses above the signal line, it suggests the stock price might go up.",
        "buy": "To buy a stock, go to the 'Recommendations' tab, click on a stock you like, and hit the 'Buy' button. Make sure to check the 'Suitability Score' first!",
        "sell": "To sell, head to your 'Portfolio' tab. You'll see an option to sell the stocks you currently own.",
        "risk": "Risk is the chance of losing money. High-risk stocks can make you a lot of money quickly, but can also drop suddenly. Since you are a beginner, we recommend Low or Medium risk stocks.",
        "grace": "The 5-Day Grace Period is to protect you! During your first 5 days, we block High-Risk trades so you don't accidentally make a highly volatile trade while you're still learning.",
        "hello": "Hi there! I am NivBot. I can help you understand trading terms like RSI, MACD, or how to buy and sell stocks. What do you need help with?",
        "default": "I'm not quite sure about that. Try asking me about 'RSI', 'Risk', 'How to buy', or 'Grace Period'!"
    },

    init() {
        if (this.initialized) return;
        
        const container = document.getElementById('chatbot-container');
        if (!container) return;

        container.innerHTML = `
            <div class="chatbot-wrapper">
                <button class="chatbot-toggle" id="chatbot-toggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>

                <div class="chatbot-window" id="chatbot-window">
                    <div class="chat-header">
                        <div class="bot-avatar">🤖</div>
                        <div class="chat-title">NivBot <span style="font-size:0.7rem; font-weight:normal; opacity:0.7; margin-left:4px;">Online</span></div>
                    </div>
                    
                    <div class="chat-messages" id="chat-messages">
                        <div class="chat-msg msg-bot">
                            Hi! I'm NivBot. How can I help you with your investments today?
                        </div>
                    </div>

                    <div class="chat-input-area">
                        <input type="text" class="chat-input" id="chat-input" placeholder="Ask about RSI, Risk, Buying...">
                        <button class="chat-send" id="chat-send">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Event Listeners
        document.getElementById('chatbot-toggle').addEventListener('click', () => this.toggle());
        document.getElementById('chat-send').addEventListener('click', () => this.sendMessage());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        this.initialized = true;
    },

    toggle() {
        this.isOpen = !this.isOpen;
        const win = document.getElementById('chatbot-window');
        if (this.isOpen) {
            win.classList.add('open');
            document.getElementById('chat-input').focus();
        } else {
            win.classList.remove('open');
        }
    },

    sendMessage() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text) return;

        // Render user message
        this.renderMessage(text, 'msg-user');
        input.value = '';

        // Simulate typing delay
        setTimeout(() => {
            this.generateResponse(text.toLowerCase());
        }, 600);
    },

    generateResponse(query) {
        let response = this.knowledgeBase["default"];
        
        // Simple keyword matching
        for (const key in this.knowledgeBase) {
            if (key !== "default" && query.includes(key)) {
                response = this.knowledgeBase[key];
                break;
            }
        }

        this.renderMessage(response, 'msg-bot');
    },

    renderMessage(text, className) {
        const container = document.getElementById('chat-messages');
        const msg = document.createElement('div');
        msg.className = `chat-msg ${className}`;
        msg.textContent = text;
        container.appendChild(msg);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
};

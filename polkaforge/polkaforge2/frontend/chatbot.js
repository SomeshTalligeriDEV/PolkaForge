// chatbot.js - Complete AI Assistant for PolkaForge

class ChatBot {
    constructor() {
        this.responses = {
            // Greetings
            'hello': 'Hello! Welcome to PolkaForge! How can I help you today?',
            'hi': 'Hi there! I\'m your PolkaForge assistant. What would you like to know?',
            'hey': 'Hey! Ready to explore decentralized development?',
            
            // Repository Management
            'create repo': 'To create a repository: 1) Connect your Talisman wallet, 2) Click "Create Repository", 3) Enter name and description, 4) Click create!',
            'how to create repository': 'Creating a repo is easy! Click the "Create Repository" button, fill in the details, and your repo will be stored on IPFS with metadata on-chain.',
            'new repository': 'Ready to create something amazing? Use the "Create Repository" button and start building!',
            
            // File Management
            'add file': 'To add files: 1) Open your repository, 2) Click "Add File", 3) Enter filename and code, 4) Save, 5) Push changes to mint an NFT!',
            'upload code': 'Upload your code by clicking "Add File" in your repository, then use "Push Changes" to store it on IPFS and mint your authorship NFT!',
            'push changes': 'Pushing changes uploads your code to IPFS and mints an NFT as proof of authorship. Click "Push Changes" when ready!',
            
            // NFT and Blockchain
            'nft': 'Every time you push code, you automatically mint a non-transferable NFT as proof of authorship! It\'s stored on the blockchain forever.',
            'proof of authorship': 'Your NFTs serve as permanent proof that you wrote the code. They can\'t be transferred, ensuring authentic authorship!',
            'blockchain': 'PolkaForge uses Polkadot\'s EVM-compatible parachains to store metadata and mint NFTs while keeping your code on IPFS.',
            
            // Collaboration
            'fork': 'To fork a repository: 1) Find the repo you want, 2) Click "Fork", 3) It creates a copy under your account that you can modify!',
            'clone': 'Cloning downloads the repository files to view locally. Click "Clone" on any public repository!',
            'star': 'Show appreciation for great projects by clicking the "Star" button! Stars are stored on-chain.',
            'collaborate': 'Collaborate by forking projects, making improvements, and sharing! You can also send collaboration invites via email.',
            
            // Wallet and DOT
            'wallet': 'Connect your Talisman wallet to interact with PolkaForge. Make sure you have some DOT for transaction fees!',
            'talisman': 'Talisman is your gateway to the Polkadot ecosystem. Install the extension and connect to start using PolkaForge!',
            'dot': 'DOT is used for transaction fees and future reward systems. You\'ll need a small amount for creating repos and pushing code.',
            'send dot': 'To send DOT: Use the format "Send 10 DOT to @username" and I\'ll help you transfer tokens!',
            
            // Search and Discovery
            'search': 'Use the search bar to find repositories by name, description, or author. Discover amazing open-source projects!',
            'find repository': 'Click "Search Repos" and enter keywords to find interesting projects to contribute to or learn from!',
            
            // Technical Help
            'ipfs': 'IPFS (InterPlanetary File System) stores your code files in a decentralized way. It\'s like the internet\'s hard drive!',
            'gas fees': 'Transaction fees are minimal because we only store metadata on-chain. Your code files live on IPFS for free!',
            'smart contract': 'Our smart contracts handle repository metadata, NFT minting, and collaboration features on the blockchain.',
            
            // Errors and Troubleshooting
            'error': 'If you encounter errors: 1) Check your wallet connection, 2) Ensure you have enough DOT, 3) Try refreshing the page.',
            'transaction failed': 'Transaction failures usually mean insufficient gas or network issues. Check your DOT balance and try again!',
            'not working': 'Having issues? Make sure Talisman is connected, you\'re on the right network, and have sufficient DOT for fees.',
            
            // Features
            'features': 'PolkaForge features: Decentralized repos, NFT authorship proof, IPFS storage, DOT rewards, forking, starring, and more!',
            'what can i do': 'You can: Create repos, upload code, fork projects, mint NFTs, search repositories, collaborate, and earn DOT rewards!',
            'how it works': 'PolkaForge combines IPFS storage with Polkadot blockchain to create a decentralized GitHub where you own your code and get rewarded!',
            
            // Default responses
            'help': 'I can help you with: creating repos, uploading code, forking projects, wallet connection, NFTs, and more! What do you need?',
            'thanks': 'You\'re welcome! Happy coding on PolkaForge! 🚀',
            'bye': 'Goodbye! Keep building amazing things on PolkaForge! 👋'
        };
        
        this.commandPatterns = [
            {
                pattern: /send (\d+) dot to @?(\w+)/i,
                response: (matches) => `I'll help you send ${matches[1]} DOT to ${matches[2]}. This feature is coming soon! For now, use your wallet directly.`
            },
            {
                pattern: /transfer (\d+) dot to @?(\w+)/i,
                response: (matches) => `Transfer of ${matches[1]} DOT to ${matches[2]} noted! This feature will be available in the next update.`
            },
            {
                pattern: /bug in (.+)/i,
                response: (matches) => `To check for bugs in ${matches[1]}, try: 1) Review variable names, 2) Check syntax, 3) Test edge cases, 4) Use console.log for debugging!`
            },
            {
                pattern: /how to (.+)/i,
                response: (matches) => `To ${matches[1]}, check our documentation or ask me more specifically about PolkaForge features!`
            }
        ];
        
        this.isOpen = false;
        this.messages = [];
        
        this.init();
    }
    
    init() {
        // Add welcome message
        this.messages.push({
            type: 'bot',
            text: 'Hello! I\'m your PolkaForge assistant. I can help you navigate the platform, understand features, and guide you through decentralized development!',
            timestamp: Date.now()
        });
        
        // Create UI and bind events
        this.createChatbotUI();
        this.bindEvents();
    }
    
    createChatbotUI() {
        const chatbotHTML = `
            <div id="chatbot-container" class="chatbot-container">
                <div class="chatbot-header">
                    <div class="chatbot-title">
                        <span class="chatbot-icon">🤖</span>
                        <span>PolkaForge Assistant</span>
                    </div>
                    <button id="closeChatbot" class="chatbot-close">&times;</button>
                </div>
                
                <div id="chatbot-messages" class="chatbot-messages">
                    <!-- Messages will be added here -->
                </div>
                
                <div class="chatbot-input-container">
                    <input type="text" id="chatbot-input" placeholder="Ask me about PolkaForge..." class="chatbot-input">
                    <button id="sendMessage" class="chatbot-send">Send</button>
                </div>
                
                <div class="chatbot-quick-actions">
                    <button class="quick-action" data-message="help">Help</button>
                    <button class="quick-action" data-message="create repo">Create Repo</button>
                    <button class="quick-action" data-message="fork">Fork Repo</button>
                    <button class="quick-action" data-message="wallet">Connect Wallet</button>
                    <button class="quick-action" data-message="nft">NFT Info</button>
                    <button class="quick-action" data-message="send dot">Send DOT</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
        
        // Load initial messages
        this.loadMessages();
    }
    
    bindEvents() {
        // Toggle chatbot from main button
        const chatbotToggle = document.getElementById('chatbotToggle');
        if (chatbotToggle) {
            chatbotToggle.addEventListener('click', () => this.toggleChatbot());
        }

        // Close chatbot
        document.getElementById('closeChatbot').addEventListener('click', () => this.closeChatbot());

        // Send message
        document.getElementById('sendMessage').addEventListener('click', () => this.sendMessage());
        
        // Enter key to send
        document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Quick actions
        document.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.target.getAttribute('data-message');
                this.addUserMessage(message);
                this.processAndRespond(message);
            });
        });
    }
    
    toggleChatbot() {
        const container = document.getElementById('chatbot-container');
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            container.style.display = 'flex';
            container.classList.add('chatbot-open');
            document.getElementById('chatbot-input').focus();
        } else {
            container.classList.remove('chatbot-open');
            setTimeout(() => {
                container.style.display = 'none';
            }, 300);
        }
    }
    
    closeChatbot() {
        this.isOpen = false;
        const container = document.getElementById('chatbot-container');
        container.classList.remove('chatbot-open');
        setTimeout(() => {
            container.style.display = 'none';
        }, 300);
    }
    
    sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message) return;

        this.addUserMessage(message);
        this.processAndRespond(message);
        
        input.value = '';
    }
    
    addUserMessage(message) {
        this.messages.push({
            type: 'user',
            text: message,
            timestamp: Date.now()
        });
        this.renderMessage(message, 'user');
    }
    
    addBotMessage(message) {
        this.messages.push({
            type: 'bot',
            text: message,
            timestamp: Date.now()
        });
        this.renderMessage(message, 'bot');
    }
    
    renderMessage(message, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        if (sender === 'bot') {
            messageDiv.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content">${this.formatMessage(message)}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">${this.formatMessage(message)}</div>
                <div class="message-avatar">👤</div>
            `;
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    formatMessage(message) {
        return message
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }
    
    loadMessages() {
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.innerHTML = '';
        
        this.messages.forEach(msg => {
            this.renderMessage(msg.text, msg.type);
        });
    }
    
    processAndRespond(userInput) {
        const response = this.processMessage(userInput);
        
        setTimeout(() => {
            this.addBotMessage(response);
        }, 500);
    }
    
    processMessage(userInput) {
        const input = userInput.toLowerCase().trim();
        
        // Check for command patterns first
        for (const pattern of this.commandPatterns) {
            const matches = input.match(pattern.pattern);
            if (matches) {
                return pattern.response(matches);
            }
        }
        
        // Check for exact matches or partial matches in responses
        for (const [key, response] of Object.entries(this.responses)) {
            if (input.includes(key)) {
                return response;
            }
        }
        
        // Fuzzy matching for common typos or variations
        const fuzzyMatches = this.findFuzzyMatch(input);
        if (fuzzyMatches) {
            return fuzzyMatches;
        }
        
        // Default response
        return this.getDefaultResponse(input);
    }
    
    findFuzzyMatch(input) {
        const keywords = {
            'repository': ['repo', 'repositories', 'reposity', 'repositry'],
            'create': ['make', 'build', 'new', 'add'],
            'fork': ['copy', 'duplicate', 'clone'],
            'wallet': ['connect', 'talisman', 'metamask'],
            'nft': ['token', 'mint', 'proof'],
            'ipfs': ['storage', 'decentralized', 'distributed'],
            'dot': ['polkadot', 'token', 'crypto'],
            'search': ['find', 'lookup', 'discover'],
            'star': ['like', 'favorite', 'bookmark'],
            'push': ['upload', 'commit', 'save'],
            'bug': ['error', 'issue', 'problem', 'debug'],
            'gas': ['fee', 'cost', 'transaction'],
            'collaboration': ['collaborate', 'team', 'work together'],
            'smart contract': ['contract', 'blockchain', 'ethereum']
        };
        
        for (const [mainKeyword, variations] of Object.entries(keywords)) {
            if (variations.some(variation => input.includes(variation)) || input.includes(mainKeyword)) {
                if (this.responses[mainKeyword]) {
                    return this.responses[mainKeyword];
                }
            }
        }
        
        return null;
    }
    
    getDefaultResponse(input) {
        const defaultResponses = [
            "I'm not sure about that specific question, but I can help you with PolkaForge features like creating repositories, forking projects, or connecting your wallet!",
            "That's an interesting question! Try asking me about repositories, NFTs, wallet connection, or IPFS storage.",
            "I'd love to help! You can ask me about creating repos, pushing code, minting NFTs, or any other PolkaForge features.",
            "I'm here to help with PolkaForge! Try asking about forking, starring repos, DOT transfers, or troubleshooting.",
            "Not sure about that one! But I can guide you through using PolkaForge features. What would you like to know?"
        ];
        
        // Add some intelligence based on input
        if (input.includes('?')) {
            return "Great question! " + defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
        }
        
        if (input.length > 50) {
            return "That's quite detailed! " + defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
        }
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    // Additional utility methods
    clearHistory() {
        this.messages = [this.messages[0]]; // Keep welcome message
        this.loadMessages();
    }
    
    exportHistory() {
        return JSON.stringify(this.messages, null, 2);
    }
    
    getStats() {
        const userMessages = this.messages.filter(msg => msg.type === 'user').length;
        const botMessages = this.messages.filter(msg => msg.type === 'bot').length;
        
        return {
            totalMessages: this.messages.length,
            userMessages,
            botMessages,
            averageResponseTime: 500 // milliseconds
        };
    }
}

// CSS Styles for Chatbot
const chatbotStyles = `
.chatbot-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 380px;
    height: 600px;
    background: var(--bg-secondary);
    border: 2px solid var(--accent-pink);
    border-radius: 15px;
    display: none;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(255, 0, 128, 0.3);
    z-index: 1000;
    transition: all 0.3s ease;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.chatbot-container.chatbot-open {
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.chatbot-header {
    background: var(--accent-pink);
    color: white;
    padding: 15px;
    border-radius: 13px 13px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chatbot-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
    font-size: 1.1em;
}

.chatbot-icon {
    font-size: 1.2em;
}

.chatbot-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.5em;
    cursor: pointer;
    padding: 0;
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;
}

.chatbot-close:hover {
    background: rgba(255, 255, 255, 0.2);
}

.chatbot-messages {
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: var(--bg-primary);
}

.message {
    display: flex;
    gap: 10px;
    max-width: 90%;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.user-message {
    align-self: flex-end;
    flex-direction: row-reverse;
}

.bot-message {
    align-self: flex-start;
}

.message-avatar {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1em;
    flex-shrink: 0;
}

.user-message .message-avatar {
    background: var(--accent-pink);
    color: white;
}

.bot-message .message-avatar {
    background: var(--bg-tertiary);
}

.message-content {
    background: var(--bg-secondary);
    padding: 12px 15px;
    border-radius: 18px;
    color: var(--text-primary);
    font-size: 0.95em;
    line-height: 1.4;
    white-space: pre-wrap;
    word-wrap: break-word;
    border: 1px solid var(--border-color);
}

.user-message .message-content {
    background: var(--accent-pink);
    color: white;
    border-color: var(--accent-pink);
}

.message-content code {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
}

.chatbot-input-container {
    padding: 15px;
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 10px;
    background: var(--bg-secondary);
}

.chatbot-input {
    flex: 1;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 12px 15px;
    border-radius: 20px;
    outline: none;
    font-size: 0.95em;
    transition: border-color 0.3s ease;
}

.chatbot-input:focus {
    border-color: var(--accent-pink);
}

.chatbot-input::placeholder {
    color: var(--text-secondary);
}

.chatbot-send {
    background: var(--accent-pink);
    color: white;
    border: none;
    padding: 12px 18px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.95em;
    font-weight: bold;
    transition: all 0.2s;
}

.chatbot-send:hover {
    background: var(--accent-pink-hover);
    transform: translateY(-1px);
}

.chatbot-quick-actions {
    padding: 12px 15px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    border-top: 1px solid var(--border-color);
    background: var(--bg-secondary);
    border-radius: 0 0 13px 13px;
}

.quick-action {
    background: var(--bg-primary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
    padding: 6px 12px;
    border-radius: 15px;
    cursor: pointer;
    font-size: 0.85em;
    transition: all 0.2s;
    white-space: nowrap;
}

.quick-action:hover {
    border-color: var(--accent-pink);
    color: var(--accent-pink);
    transform: translateY(-1px);
}

/* Scrollbar styling */
.chatbot-messages::-webkit-scrollbar {
    width: 6px;
}

.chatbot-messages::-webkit-scrollbar-track {
    background: var(--bg-primary);
}

.chatbot-messages::-webkit-scrollbar-thumb {
    background: var(--accent-pink);
    border-radius: 3px;
}

.chatbot-messages::-webkit-scrollbar-thumb:hover {
    background: var(--accent-pink-hover);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .chatbot-container {
        width: 95vw;
        height: 80vh;
        bottom: 10px;
        right: 2.5vw;
        left: 2.5vw;
    }
}

@media (max-width: 480px) {
    .chatbot-container {
        height: 85vh;
    }
    
    .quick-action {
        font-size: 0.8em;
        padding: 5px 10px;
    }
}
`;

// Add styles to document
function addChatbotStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = chatbotStyles;
    document.head.appendChild(styleSheet);
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    addChatbotStyles();
    window.polkaforgeChatbot = new ChatBot();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatBot;
}
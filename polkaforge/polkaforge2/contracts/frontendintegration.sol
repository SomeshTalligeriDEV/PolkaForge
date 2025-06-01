// polkaforge-web3.js - Frontend integration with smart contracts

class PolkaForgeWeb3 
    constructor() {
        this.web3 = null;
        this.account = null;
        this.networkId = null;
        this.contracts = {};
        this.sdk = null;
        this.isConnected = false;
        
        // Contract addresses (update these after deployment)
        this.contractAddresses = {
            1: { // Mainnet
                core: '0x...', // Update with actual addresses
                nft: '0x...',
                rewards: '0x...'
            },
            5: { // Goerli testnet
                core: '0x...',
                nft: '0x...',
                rewards: '0x...'
            },
            1287: { // Moonbase Alpha (Polkadot testnet)
                core: '0x...',
                nft: '0x...',
                rewards: '0x...'
            }
        };
        
        this.init();
    }
    
    async init() {
        await this.detectProvider();
        this.setupEventListeners();
    }
    
    async detectProvider() {
        if (typeof window.ethereum !== 'undefined') {
            this.web3 = new Web3(window.ethereum);
            console.log('MetaMask detected');
        } else if (typeof window.talismanEth !== 'undefined') {
            this.web3 = new Web3(window.talismanEth);
            console.log('Talisman detected');
        } else {
            console.error('No Web3 provider detected');
            throw new Error('Please install MetaMask or Talisman wallet');
        }
    }
    
    async connectWallet() {
        try {
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            this.account = accounts[0];
            this.networkId = await this.web3.eth.net.getId();
            
            // Initialize contracts
            await this.initializeContracts();
            
            this.isConnected = true;
            
            // Update UI
            this.updateWalletUI();
            
            console.log('Wallet connected:', this.account);
            return this.account;
            
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            throw error;
        }
    }
    
    async initializeContracts() {
        const addresses = this.contractAddresses[this.networkId];
        if (!addresses) {
            throw new Error(`Unsupported network: ${this.networkId}`);
        }
        
        try {
            // Initialize SDK
            const signer = this.web3.eth.accounts.privateKeyToAccount(this.account);
            this.sdk = new PolkaForgeSDK(
                addresses.core,
                addresses.nft,
                addresses.rewards,
                signer
            );
            
            console.log('Contracts initialized');
        } catch (error) {
            console.error('Failed to initialize contracts:', error);
            throw error;
        }
    }
    
    setupEventListeners() {
        // Account changed
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnect();
                } else {
                    this.account = accounts[0];
                    this.updateWalletUI();
                }
            });
            
            // Network changed
            window.ethereum.on('chainChanged', (chainId) => {
                window.location.reload(); // Reload page on network change
            });
        }
    }
    
    disconnect() {
        this.account = null;
        this.isConnected = false;
        this.sdk = null;
        this.updateWalletUI();
    }
    
    updateWalletUI() {
        const connectBtn = document.getElementById('connectWallet');
        const walletInfo = document.getElementById('walletInfo');
        const userAccount = document.getElementById('userAccount');
        
        if (this.isConnected && this.account) {
            if (connectBtn) connectBtn.style.display = 'none';
            if (walletInfo) walletInfo.style.display = 'block';
            if (userAccount) {
                userAccount.textContent = `${this.account.slice(0, 6)}...${this.account.slice(-4)}`;
            }
            
            // Enable app functionality
            this.enableAppFeatures();
        } else {
            if (connectBtn) connectBtn.style.display = 'block';
            if (walletInfo) walletInfo.style.display = 'none';
            
            // Disable app functionality
            this.disableAppFeatures();
        }
    }
    
    enableAppFeatures() {
        const features = document.querySelectorAll('.wallet-required');
        features.forEach(element => {
            element.classList.remove('disabled');
            element.removeAttribute('disabled');
        });
    }
    
    disableAppFeatures() {
        const features = document.querySelectorAll('.wallet-required');
        features.forEach(element => {
            element.classList.add('disabled');
            element.setAttribute('disabled', 'true');
        });
    }
    
    // Repository operations
    async createRepository(name, description, files) {
        if (!this.isConnected) throw new Error('Wallet not connected');
        
        try {
            // Upload files to IPFS first
            const ipfsHash = await this.uploadToIPFS(files);
            
            // Create repository on blockchain
            const repoId = await this.sdk.createRepository(name, description, ipfsHash, false);
            
            // Show success message
            this.showNotification('Repository created successfully!', 'success');
            
            return repoId;
        } catch (error) {
            this.showNotification(`Failed to create repository: ${error.message}`, 'error');
            throw error;
        }
    }
    
    async pushChanges(repoId, files, commitMessage) {
        if (!this.isConnected) throw new Error('Wallet not connected');
        
        try {
            // Upload new files to IPFS
            const ipfsHash = await this.uploadToIPFS(files);
            
            // Update repository
            await this.sdk.updateRepository(repoId, ipfsHash);
            
            // Mint commit NFT
            const commitHash = this.generateCommitHash(files, commitMessage);
            const metadata = await this.createCommitMetadata(commitMessage, files);
            const metadataIPFS = await this.uploadToIPFS({ 'metadata.json': metadata });
            
            const linesAdded = this.countLinesAdded(files);
            const linesRemoved = this.countLinesRemoved(files);
            
            const tokenId = await this.sdk.mintCommitNFT(
                repoId,
                commitHash,
                metadataIPFS,
                linesAdded,
                linesRemoved
            );
            
            this.showNotification('Changes pushed and NFT minted!', 'success');
            
            return { ipfsHash, tokenId };
        } catch (error) {
            this.showNotification(`Failed to push changes: ${error.message}`, 'error');
            throw error;
        }
    }
    
    async forkRepository(repoId, newName) {
        if (!this.isConnected) throw new Error('Wallet not connected');
        
        try {
            const newRepoId = await this.sdk.forkRepository(repoId, newName);
            this.showNotification('Repository forked successfully!', 'success');
            return newRepoId;
        } catch (error) {
            this.showNotification(`Failed to fork repository: ${error.message}`, 'error');
            throw error;
        }
    }
    
    async starRepository(repoId) {
        if (!this.isConnected) throw new Error('Wallet not connected');
        
        try {
            await this.sdk.starRepository(repoId);
            this.showNotification('Repository starred!', 'success');
            
            // Update UI
            const starBtn = document.querySelector(`[data-repo-id="${repoId}"] .star-btn`);
            if (starBtn) {
                starBtn.classList.add('starred');
                const count = starBtn.querySelector('.star-count');
                if (count) count.textContent = parseInt(count.textContent) + 1;
            }
        } catch (error) {
            this.showNotification(`Failed to star repository: ${error.message}`, 'error');
            throw error;
        }
    }
    
    async claimRewards() {
        if (!this.isConnected) throw new Error('Wallet not connected');
        
        try {
            const pendingRewards = await this.sdk.getPendingRewards(this.account);
            
            if (pendingRewards.toString() === '0') {
                this.showNotification('No rewards to claim', 'info');
                return;
            }
            
            await this.sdk.claimRewards();
            
            const amount = this.web3.utils.fromWei(pendingRewards, 'ether');
            this.showNotification(`Claimed ${amount} DOT rewards!`, 'success');
            
            // Update rewards display
            this.updateRewardsDisplay();
        } catch (error) {
            this.showNotification(`Failed to claim rewards: ${error.message}`, 'error');
            throw error;
        }
    }
    
    // IPFS operations (mock implementation - integrate with actual IPFS service)
    async uploadToIPFS(files) {
        // This is a mock implementation
        // In production, integrate with IPFS services like Pinata, Infura, or your own node
        
        const formData = new FormData();
        
        if (typeof files === 'object' && !files.name) {
            // Multiple files or JSON data
            for (const [filename, content] of Object.entries(files)) {
                if (typeof content === 'string') {
                    formData.append('file', new Blob([content], { type: 'text/plain' }), filename);
                } else {
                    formData.append('file', content, filename);
                }
            }
        } else {
            // Single file
            formData.append('file', files);
        }
        
        try {
            // Replace with your IPFS service endpoint
            const response = await fetch('/api/ipfs/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            return result.hash;
        } catch (error) {
            console.error('IPFS upload failed:', error);
            // Return mock hash for development
            return 'Qm' + Math.random().toString(36).substring(2, 15);
        }
    }
    
    async downloadFromIPFS(hash) {
        try {
            const response = await fetch(`/api/ipfs/get/${hash}`);
            return await response.json();
        } catch (error) {
            console.error('IPFS download failed:', error);
            return null;
        }
    }
    
    // Utility functions
    generateCommitHash(files, message) {
        const content = JSON.stringify(files) + message + Date.now();
        return this.web3.utils.keccak256(content);
    }
    
    async createCommitMetadata(message, files) {
        return JSON.stringify({
            message: message,
            timestamp: new Date().toISOString(),
            files: Object.keys(files),
            author: this.account,
            fileCount: Object.keys(files).length
        });
    }
    
    countLinesAdded(files) {
        // Simple line counting - in production, implement proper diff analysis
        let lines = 0;
        for (const content of Object.values(files)) {
            if (typeof content === 'string') {
                lines += content.split('\n').length;
            }
        }
        return lines;
    }
    
    countLinesRemoved(files) {
        // Mock implementation - in production, compare with previous version
        return Math.floor(Math.random() * 10);
    }
    
    async updateRewardsDisplay() {
        if (!this.isConnected) return;
        
        try {
            const pendingRewards = await this.sdk.getPendingRewards(this.account);
            const totalEarned = await this.sdk.rewards.getTotalEarned(this.account);
            
            const pendingEl = document.getElementById('pendingRewards');
            const totalEl = document.getElementById('totalEarned');
            
            if (pendingEl) {
                pendingEl.textContent = this.web3.utils.fromWei(pendingRewards, 'ether') + ' DOT';
            }
            
            if (totalEl) {
                totalEl.textContent = this.web3.utils.fromWei(totalEarned, 'ether') + ' DOT';
            }
        } catch (error) {
            console.error('Failed to update rewards display:', error);
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add to DOM
        const container = document.getElementById('notifications') || document.body;
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        // Close button functionality
        notification.querySelector('.notification-close').onclick = () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        };
    }
    
    // User registration
    async registerUser(username, profileData) {
        if (!this.isConnected) throw new Error('Wallet not connected');
        
        try {
            const profileIPFS = await this.uploadToIPFS({ 'profile.json': JSON.stringify(profileData) });
            await this.sdk.registerUser(username, profileIPFS);
            
            this.showNotification('User registered successfully!', 'success');
            return true;
        } catch (error) {
            this.showNotification(`Registration failed: ${error.message}`, 'error');
            throw error;
        }
    }
    
    async getUserProfile(address = null) {
        const userAddress = address || this.account;
        if (!userAddress) return null;
        
        try {
            const user = await this.sdk.getUser(userAddress);
            
            // Download profile data from IPFS
            let profileData = {};
            if (user.profileIPFS) {
                profileData = await this.downloadFromIPFS(user.profileIPFS);
            }
            
            return {
                ...user,
                profileData
            };
        } catch (error) {
            console.error('Failed to get user profile:', error);
            return null;
        }
    }
    
    async searchRepositories(query) {
        try {
            return await this.sdk.searchRepositories(query);
        } catch (error) {
            console.error('Search failed:', error);
            return [];
        }
    }
    
    // Event handling
    setupContractEventListeners() {
        if (!this.sdk) return;
        
        this.sdk.onRepositoryCreated((repoId, owner, name) => {
            console.log('Repository created:', { repoId, owner, name });
            this.showNotification(`New repository "${name}" created!`, 'success');
        });
        
        this.sdk.onRepositoryStarred((repoId, user) => {
            console.log('Repository starred:', { repoId, user });
        });
        
        this.sdk.onCommitMinted((tokenId, repoId, author, commitHash) => {
            console.log('Commit NFT minted:', { tokenId, repoId, author, commitHash });
        });
        
        this.sdk.onRewardEarned((user, amount, reason) => {
            console.log('Reward earned:', { user, amount, reason });
            if (user.toLowerCase() === this.account.toLowerCase()) {
                const amountDOT = this.web3.utils.fromWei(amount, 'ether');
                this.showNotification(`Earned ${amountDOT} DOT for ${reason}!`, 'success');
                this.updateRewardsDisplay();
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.polkaforgeWeb3 = new PolkaForgeWeb3();
    
    // Bind wallet connection button
    const connectBtn = document.getElementById('connectWallet');
    if (connectBtn) {
        connectBtn.addEventListener('click', async () => {
            try {
                await window.polkaforgeWeb3.connectWallet();
            } catch (error) {
                console.error('Connection failed:', error);
            }
        });
    }
    
    // Bind other UI elements
    setupUIEventHandlers();
});

function setupUIEventHandlers() {
    // Create repository form
    const createRepoForm = document.getElementById('createRepositoryForm');
    if (createRepoForm) {
        createRepoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const name = formData.get('name');
            const description = formData.get('description');
            
            // Get files from file input or code editor
            const files = getFilesFromForm();
            
            try {
                await window.polkaforgeWeb3.createRepository(name, description, files);
                e.target.reset();
            } catch (error) {
                console.error('Failed to create repository:', error);
            }
        });
    }
    
    // Claim rewards button
    const claimRewardsBtn = document.getElementById('claimRewards');
    if (claimRewardsBtn) {
        claimRewardsBtn.addEventListener('click', async () => {
            try {
                await window.polkaforgeWeb3.claimRewards();
            } catch (error) {
                console.error('Failed to claim rewards:', error);
            }
        });
    }
    
    // Star repository buttons
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('star-btn') && !e.target.classList.contains('starred')) {
            const repoId = e.target.getAttribute('data-repo-id');
            if (repoId) {
                try {
                    await window.polkaforgeWeb3.starRepository(parseInt(repoId));
                } catch (error) {
                    console.error('Failed to star repository:', error);
                }
            }
        }
    });
}

function getFilesFromForm() {
    // Mock implementation - get files from your form/editor
    const fileInput = document.getElementById('repositoryFiles');
    const codeEditor = document.getElementById('codeEditor');
    
    const files = {};
    
    if (fileInput && fileInput.files.length > 0) {
        for (const file of fileInput.files) {
            files[file.name] = file;
        }
    } else if (codeEditor && codeEditor.value) {
        files['main.js'] = codeEditor.value;
    } else {
        files['README.md'] = '# New Repository\n\nThis is a new repository created on PolkaForge.';
    }
    
    return files;
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PolkaForgeWeb3;
}
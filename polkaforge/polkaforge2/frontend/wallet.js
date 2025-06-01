// wallet.js - Talisman Wallet Integration for PolkaForge

class WalletManager {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.isConnected = false;
        this.contractAddress = '0x...'; // Update after deployment
        this.contractABI = []; // Update with your contract ABI
        this.contract = null;
        
        this.init();
    }
    
    async init() {
        // Check if Talisman is installed
        if (typeof window.ethereum !== 'undefined') {
            this.web3 = new Web3(window.ethereum);
            console.log('Talisman wallet detected');
            
            // Check if already connected
            const accounts = await this.web3.eth.getAccounts();
            if (accounts.length > 0) {
                this.account = accounts[0];
                this.isConnected = true;
                this.updateUI();
                this.initContract();
            }
        } else {
            console.warn('Talisman wallet not detected');
            showNotification('Please install Talisman wallet', 'warning');
        }
    }
    
    async connect() {
        try {
            if (!window.ethereum) {
                throw new Error('Talisman wallet not installed');
            }
            
            showLoading(true);
            
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }
            
            this.account = accounts[0];
            this.isConnected = true;
            this.web3 = new Web3(window.ethereum);
            
            // Initialize contract
            this.initContract();
            
            // Update UI
            this.updateUI();
            
            showNotification('Wallet connected successfully!', 'success');
            
            // Switch to dashboard view
            showDashboard();
            
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            showNotification(`Failed to connect wallet: ${error.message}`, 'error');
        } finally {
            showLoading(false);
        }
    }
    
    async disconnect() {
        this.account = null;
        this.isConnected = false;
        this.contract = null;
        this.updateUI();
        showNotification('Wallet disconnected', 'success');
        
        // Switch back to welcome view
        showWelcome();
    }
    
    initContract() {
        if (this.web3 && this.contractAddress && this.contractABI.length > 0) {
            this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);
            console.log('Contract initialized');
        }
    }
    
    updateUI() {
        const connectBtn = document.getElementById('connectWallet');
        const walletInfo = document.getElementById('walletInfo');
        const walletAddress = document.getElementById('walletAddress');
        
        if (this.isConnected && this.account) {
            connectBtn.classList.add('hidden');
            walletInfo.classList.remove('hidden');
            walletAddress.textContent = this.formatAddress(this.account);
        } else {
            connectBtn.classList.remove('hidden');
            walletInfo.classList.add('hidden');
        }
    }
    
    formatAddress(address) {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    async getBalance() {
        if (!this.isConnected || !this.account) return '0';
        
        try {
            const balance = await this.web3.eth.getBalance(this.account);
            return this.web3.utils.fromWei(balance, 'ether');
        } catch (error) {
            console.error('Failed to get balance:', error);
            return '0';
        }
    }
    
    async sendTransaction(to, value, data = '0x') {
        if (!this.isConnected || !this.account) {
            throw new Error('Wallet not connected');
        }
        
        try {
            const gasPrice = await this.web3.eth.getGasPrice();
            const gasLimit = await this.web3.eth.estimateGas({
                from: this.account,
                to: to,
                value: value,
                data: data
            });
            
            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: this.account,
                    to: to,
                    value: this.web3.utils.toHex(value),
                    gas: this.web3.utils.toHex(gasLimit),
                    gasPrice: this.web3.utils.toHex(gasPrice),
                    data: data
                }]
            });
            
            return txHash;
        } catch (error) {
            console.error('Transaction failed:', error);
            throw error;
        }
    }
    
    // Contract interaction methods
    async createRepository(name, description, isPrivate, ipfsHash) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }
        
        try {
            showLoading(true);
            
            const method = this.contract.methods.createRepository(
                name,
                description,
                isPrivate,
                ipfsHash
            );
            
            const gasEstimate = await method.estimateGas({ from: this.account });
            
            const receipt = await method.send({
                from: this.account,
                gas: gasEstimate
            });
            
            showNotification('Repository created successfully!', 'success');
            return receipt;
            
        } catch (error) {
            console.error('Failed to create repository:', error);
            showNotification(`Failed to create repository: ${error.message}`, 'error');
            throw error;
        } finally {
            showLoading(false);
        }
    }
    
    async forkRepository(repoId) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }
        
        try {
            showLoading(true);
            
            const method = this.contract.methods.forkRepository(repoId);
            const gasEstimate = await method.estimateGas({ from: this.account });
            
            const receipt = await method.send({
                from: this.account,
                gas: gasEstimate
            });
            
            showNotification('Repository forked successfully!', 'success');
            return receipt;
            
        } catch (error) {
            console.error('Failed to fork repository:', error);
            showNotification(`Failed to fork repository: ${error.message}`, 'error');
            throw error;
        } finally {
            showLoading(false);
        }
    }
    
    async starRepository(repoId) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }
        
        try {
            const method = this.contract.methods.starRepository(repoId);
            const gasEstimate = await method.estimateGas({ from: this.account });
            
            const receipt = await method.send({
                from: this.account,
                gas: gasEstimate
            });
            
            showNotification('Repository starred!', 'success');
            return receipt;
            
        } catch (error) {
            console.error('Failed to star repository:', error);
            showNotification(`Failed to star repository: ${error.message}`, 'error');
            throw error;
        }
    }
    
    async pushCode(repoId, ipfsHash, commitMessage) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }
        
        try {
            showLoading(true);
            
            const method = this.contract.methods.pushCode(repoId, ipfsHash, commitMessage);
            const gasEstimate = await method.estimateGas({ from: this.account });
            
            const receipt = await method.send({
                from: this.account,
                gas: gasEstimate
            });
            
            showNotification('Code pushed and NFT minted!', 'success');
            return receipt;
            
        } catch (error) {
            console.error('Failed to push code:', error);
            showNotification(`Failed to push code: ${error.message}`, 'error');
            throw error;
        } finally {
            showLoading(false);
        }
    }
    
    async getUserRepositories() {
        if (!this.contract || !this.account) return [];
        
        try {
            const repos = await this.contract.methods.getUserRepositories(this.account).call();
            return repos;
        } catch (error) {
            console.error('Failed to get user repositories:', error);
            return [];
        }
    }
    
    async getAllRepositories() {
        if (!this.contract) return [];
        
        try {
            const repos = await this.contract.methods.getAllRepositories().call();
            return repos;
        } catch (error) {
            console.error('Failed to get all repositories:', error);
            return [];
        }
    }
    
    async getRepository(repoId) {
        if (!this.contract) return null;
        
        try {
            const repo = await this.contract.methods.getRepository(repoId).call();
            return repo;
        } catch (error) {
            console.error('Failed to get repository:', error);
            return null;
        }
    }
    
    async searchRepositories(query) {
        if (!this.contract) return [];
        
        try {
            // This would need to be implemented in the smart contract
            // For now, we'll filter on the frontend
            const allRepos = await this.getAllRepositories();
            return allRepos.filter(repo => 
                repo.name.toLowerCase().includes(query.toLowerCase()) ||
                repo.description.toLowerCase().includes(query.toLowerCase())
            );
        } catch (error) {
            console.error('Failed to search repositories:', error);
            return [];
        }
    }
}

// Initialize wallet manager
const walletManager = new WalletManager();

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const connectBtn = document.getElementById('connectWallet');
    const disconnectBtn = document.getElementById('disconnectWallet');
    
    if (connectBtn) {
        connectBtn.addEventListener('click', () => walletManager.connect());
    }
    
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', () => walletManager.disconnect());
    }
    
    // Listen for account changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', function(accounts) {
            if (accounts.length === 0) {
                walletManager.disconnect();
            } else {
                walletManager.account = accounts[0];
                walletManager.updateUI();
            }
        });
        
        window.ethereum.on('chainChanged', function(chainId) {
            window.location.reload();
        });
    }
});

// Export for use in other files
window.walletManager = walletManager;
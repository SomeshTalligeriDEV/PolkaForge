// ipfs.js - IPFS Integration with Pinata for PolkaForge

class IPFSManager {
    constructor() {
        // These should be set via environment variables in production
        this.PINATA_API_KEY = 'your_pinata_api_key';
        this.PINATA_SECRET_KEY = 'your_pinata_secret_key';
        this.PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
        this.PINATA_API_URL = 'https://api.pinata.cloud';
        
        // In-memory storage for files (since no localStorage allowed)
        this.fileStorage = new Map();
        this.repoFiles = new Map(); // repoId -> files[]
    }
    
    // Upload a single file to IPFS
    async uploadFile(file, fileName = null) {
        try {
            showLoading(true);
            
            const formData = new FormData();
            formData.append('file', file);
            
            if (fileName) {
                formData.append('pinataMetadata', JSON.stringify({
                    name: fileName
                }));
            }
            
            const response = await fetch(`${this.PINATA_API_URL}/pinning/pinFileToIPFS`, {
                method: 'POST',
                headers: {
                    'pinata_api_key': this.PINATA_API_KEY,
                    'pinata_secret_api_key': this.PINATA_SECRET_KEY
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            showNotification('File uploaded to IPFS successfully!', 'success');
            
            return {
                hash: result.IpfsHash,
                url: `${this.PINATA_GATEWAY}${result.IpfsHash}`
            };
            
        } catch (error) {
            console.error('Failed to upload file to IPFS:', error);
            showNotification(`Failed to upload file: ${error.message}`, 'error');
            throw error;
        } finally {
            showLoading(false);
        }
    }
    
    // Upload JSON data to IPFS
    async uploadJSON(data, fileName = 'data.json') {
        try {
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const file = new File([blob], fileName, { type: 'application/json' });
            
            return await this.uploadFile(file, fileName);
        } catch (error) {
            console.error('Failed to upload JSON to IPFS:', error);
            throw error;
        }
    }
    
    // Upload repository files to IPFS
    async uploadRepository(repoId, files) {
        try {
            showLoading(true);
            
            // Create a repository structure
            const repoData = {
                id: repoId,
                timestamp: Date.now(),
                files: {}
            };
            
            // Process each file
            for (const [fileName, content] of Object.entries(files)) {
                if (typeof content === 'string') {
                    // Text file
                    repoData.files[fileName] = {
                        type: 'text',
                        content: content,
                        size: content.length
                    };
                } else if (content instanceof File) {
                    // Binary file - upload separately and store reference
                    const fileResult = await this.uploadFile(content, fileName);
                    repoData.files[fileName] = {
                        type: 'binary',
                        ipfsHash: fileResult.hash,
                        url: fileResult.url,
                        size: content.size
                    };
                }
            }
            
            // Upload the repository metadata
            const result = await this.uploadJSON(repoData, `repo-${repoId}.json`);
            
            // Store in local cache
            this.repoFiles.set(repoId, repoData.files);
            
            showNotification('Repository uploaded to IPFS successfully!', 'success');
            return result;
            
        } catch (error) {
            console.error('Failed to upload repository:', error);
            showNotification(`Failed to upload repository: ${error.message}`, 'error');
            throw error;
        } finally {
            showLoading(false);
        }
    }
    
    // Fetch content from IPFS
    async fetchContent(ipfsHash) {
        try {
            const response = await fetch(`${this.PINATA_GATEWAY}${ipfsHash}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
            
        } catch (error) {
            console.error('Failed to fetch content from IPFS:', error);
            throw error;
        }
    }
    
    // Clone repository from IPFS
    async cloneRepository(ipfsHash) {
        try {
            showLoading(true);
            
            const repoData = await this.fetchContent(ipfsHash);
            
            if (!repoData.files) {
                throw new Error('Invalid repository structure');
            }
            
            // Process files
            const processedFiles = {};
            
            for (const [fileName, fileData] of Object.entries(repoData.files)) {
                if (fileData.type === 'text') {
                    processedFiles[fileName] = fileData.content;
                } else if (fileData.type === 'binary' && fileData.ipfsHash) {
                    // For binary files, we'll store the IPFS reference
                    processedFiles[fileName] = {
                        type: 'binary',
                        url: fileData.url,
                        ipfsHash: fileData.ipfsHash,
                        size: fileData.size
                    };
                }
            }
            
            showNotification('Repository cloned successfully!', 'success');
            return {
                id: repoData.id,
                files: processedFiles,
                timestamp: repoData.timestamp
            };
            
        } catch (error) {
            console.error('Failed to clone repository:', error);
            showNotification(`Failed to clone repository: ${error.message}`, 'error');
            throw error;
        } finally {
            showLoading(false);
        }
    }
    
    // Pin content to ensure it stays on IPFS
    async pinContent(ipfsHash) {
        try {
            const response = await fetch(`${this.PINATA_API_URL}/pinning/pinByHash`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': this.PINATA_API_KEY,
                    'pinata_secret_api_key': this.PINATA_SECRET_KEY
                },
                body: JSON.stringify({
                    hashToPin: ipfsHash
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('Failed to pin content:', error);
            throw error;
        }
    }
    
    // Get pinned files list
    async getPinnedFiles() {
        try {
            const response = await fetch(`${this.PINATA_API_URL}/data/pinList`, {
                method: 'GET',
                headers: {
                    'pinata_api_key': this.PINATA_API_KEY,
                    'pinata_secret_api_key': this.PINATA_SECRET_KEY
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result.rows;
            
        } catch (error) {
            console.error('Failed to get pinned files:', error);
            throw error;
        }
    }
    
    // Local file management (in-memory)
    addFileToRepo(repoId, fileName, content) {
        if (!this.repoFiles.has(repoId)) {
            this.repoFiles.set(repoId, {});
        }
        
        const repoFiles = this.repoFiles.get(repoId);
        repoFiles[fileName] = content;
        this.repoFiles.set(repoId, repoFiles);
    }
    
    getRepoFiles(repoId) {
        return this.repoFiles.get(repoId) || {};
    }
    
    removeFileFromRepo(repoId, fileName) {
        if (!this.repoFiles.has(repoId)) return;
        
        const repoFiles = this.repoFiles.get(repoId);
        delete repoFiles[fileName];
        this.repoFiles.set(repoId, repoFiles);
    }
    
    // Utility functions
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    getFileExtension(fileName) {
        return fileName.split('.').pop().toLowerCase();
    }
    
    getFileIcon(fileName) {
        const ext = this.getFileExtension(fileName);
        const iconMap = {
            'js': 'fab fa-js-square',
            'html': 'fab fa-html5',
            'css': 'fab fa-css3-alt',
            'json': 'fas fa-code',
            'md': 'fab fa-markdown',
            'py': 'fab fa-python',
            'java': 'fab fa-java',
            'cpp': 'fas fa-code',
            'c': 'fas fa-code',
            'rs': 'fas fa-code',
            'go': 'fas fa-code',
            'sol': 'fas fa-code',
            'txt': 'fas fa-file-alt',
            'pdf': 'fas fa-file-pdf',
            'png': 'fas fa-image',
            'jpg': 'fas fa-image',
            'gif': 'fas fa-image',
            'svg': 'fas fa-image'
        };
        
        return iconMap[ext] || 'fas fa-file';
    }
    
    // Create a downloadable file
    downloadFile(fileName, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Convert file to base64 for storage
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
}

// Initialize IPFS manager
const ipfsManager = new IPFSManager();

// Export for use in other files
window.ipfsManager = ipfsManager;
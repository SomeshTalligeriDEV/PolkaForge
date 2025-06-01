// deploy.js - Deployment script for PolkaForge contracts
const { ethers } = require("hardhat");

async function main() {
    console.log("Starting PolkaForge deployment...");
    
    // Get the contract factories
    const PolkaForgeCore = await ethers.getContractFactory("PolkaForgeCore");
    const PolkaForgeNFT = await ethers.getContractFactory("PolkaForgeNFT");
    const PolkaForgeRewards = await ethers.getContractFactory("PolkaForgeRewards");
    
    // Deploy Core contract first
    console.log("Deploying PolkaForgeCore...");
    const coreContract = await PolkaForgeCore.deploy();
    await coreContract.deployed();
    console.log("PolkaForgeCore deployed to:", coreContract.address);
    
    // Deploy NFT contract
    console.log("Deploying PolkaForgeNFT...");
    const nftContract = await PolkaForgeNFT.deploy(coreContract.address);
    await nftContract.deployed();
    console.log("PolkaForgeNFT deployed to:", nftContract.address);
    
    // Deploy Rewards contract
    console.log("Deploying PolkaForgeRewards...");
    const rewardsContract = await PolkaForgeRewards.deploy(coreContract.address, nftContract.address);
    await rewardsContract.deployed();
    console.log("PolkaForgeRewards deployed to:", rewardsContract.address);
    
    // Fund rewards contract with some initial DOT
    console.log("Funding rewards contract...");
    const fundAmount = ethers.utils.parseEther("100"); // 100 DOT
    await rewardsContract.connect(await ethers.getSigner()).sendTransaction({
        value: fundAmount
    });
    
    console.log("Deployment completed!");
    console.log("Contract addresses:");
    console.log("- Core:", coreContract.address);
    console.log("- NFT:", nftContract.address);
    console.log("- Rewards:", rewardsContract.address);
    
    // Verify contracts on block explorer (if on mainnet/testnet)
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("Waiting for block confirmations...");
        await coreContract.deployTransaction.wait(6);
        await nftContract.deployTransaction.wait(6);
        await rewardsContract.deployTransaction.wait(6);
        
        console.log("Verifying contracts...");
        try {
            await hre.run("verify:verify", {
                address: coreContract.address,
                constructorArguments: [],
            });
            
            await hre.run("verify:verify", {
                address: nftContract.address,
                constructorArguments: [coreContract.address],
            });
            
            await hre.run("verify:verify", {
                address: rewardsContract.address,
                constructorArguments: [coreContract.address, nftContract.address],
            });
            
            console.log("Contracts verified!");
        } catch (error) {
            console.log("Verification failed:", error.message);
        }
    }
    
    // Save deployment addresses
    const fs = require('fs');
    const deploymentInfo = {
        network: network.name,
        timestamp: new Date().toISOString(),
        contracts: {
            core: coreContract.address,
            nft: nftContract.address,
            rewards: rewardsContract.address
        },
        deployer: (await ethers.getSigners())[0].address
    };
    
    fs.writeFileSync(
        `./deployments/${network.name}.json`,
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log(`Deployment info saved to ./deployments/${network.name}.json`);
}

// Error handling
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// Helper functions for contract interaction
class PolkaForgeSDK {
    constructor(coreAddress, nftAddress, rewardsAddress, signer) {
        this.core = new ethers.Contract(coreAddress, PolkaForgeCoreABI, signer);
        this.nft = new ethers.Contract(nftAddress, PolkaForgeNFTABI, signer);
        this.rewards = new ethers.Contract(rewardsAddress, PolkaForgeRewardsABI, signer);
        this.signer = signer;
    }
    
    // User management
    async registerUser(username, profileIPFS) {
        try {
            const tx = await this.core.registerUser(username, profileIPFS);
            const receipt = await tx.wait();
            return receipt;
        } catch (error) {
            throw new Error(`Failed to register user: ${error.message}`);
        }
    }
    
    async getUser(address) {
        try {
            return await this.core.getUser(address);
        } catch (error) {
            throw new Error(`Failed to get user: ${error.message}`);
        }
    }
    
    // Repository management
    async createRepository(name, description, ipfsHash, isPrivate = false) {
        try {
            const tx = await this.core.createRepository(name, description, ipfsHash, isPrivate);
            const receipt = await tx.wait();
            
            // Extract repository ID from events
            const event = receipt.events.find(e => e.event === 'RepositoryCreated');
            return event ? event.args.repoId.toNumber() : null;
        } catch (error) {
            throw new Error(`Failed to create repository: ${error.message}`);
        }
    }
    
    async updateRepository(repoId, newIPFSHash) {
        try {
            const tx = await this.core.updateRepository(repoId, newIPFSHash);
            return await tx.wait();
        } catch (error) {
            throw new Error(`Failed to update repository: ${error.message}`);
        }
    }
    
    async getRepository(repoId) {
        try {
            return await this.core.getRepository(repoId);
        } catch (error) {
            throw new Error(`Failed to get repository: ${error.message}`);
        }
    }
    
    async forkRepository(repoId, newName) {
        try {
            const tx = await this.core.forkRepository(repoId, newName);
            const receipt = await tx.wait();
            
            const event = receipt.events.find(e => e.event === 'RepositoryForked');
            return event ? event.args.newRepoId.toNumber() : null;
        } catch (error) {
            throw new Error(`Failed to fork repository: ${error.message}`);
        }
    }
    
    // Star system
    async starRepository(repoId) {
        try {
            const tx = await this.core.starRepository(repoId);
            return await tx.wait();
        } catch (error) {
            throw new Error(`Failed to star repository: ${error.message}`);
        }
    }
    
    async unstarRepository(repoId) {
        try {
            const tx = await this.core.unstarRepository(repoId);
            return await tx.wait();
        } catch (error) {
            throw new Error(`Failed to unstar repository: ${error.message}`);
        }
    }
    
    // NFT operations
    async mintCommitNFT(repositoryId, commitHash, ipfsMetadata, linesAdded, linesRemoved) {
        try {
            const tx = await this.nft.mintCommitNFT(
                repositoryId, 
                commitHash, 
                ipfsMetadata, 
                linesAdded, 
                linesRemoved
            );
            const receipt = await tx.wait();
            
            const event = receipt.events.find(e => e.event === 'CommitMinted');
            return event ? event.args.tokenId.toNumber() : null;
        } catch (error) {
            throw new Error(`Failed to mint commit NFT: ${error.message}`);
        }
    }
    
    async getCommit(tokenId) {
        try {
            return await this.nft.getCommit(tokenId);
        } catch (error) {
            throw new Error(`Failed to get commit: ${error.message}`);
        }
    }
    
    async getAuthorCommits(author) {
        try {
            return await this.nft.getAuthorCommits(author);
        } catch (error) {
            throw new Error(`Failed to get author commits: ${error.message}`);
        }
    }
    
    // Rewards
    async getPendingRewards(address) {
        try {
            return await this.rewards.getPendingRewards(address);
        } catch (error) {
            throw new Error(`Failed to get pending rewards: ${error.message}`);
        }
    }
    
    async claimRewards() {
        try {
            const tx = await this.rewards.claimRewards();
            return await tx.wait();
        } catch (error) {
            throw new Error(`Failed to claim rewards: ${error.message}`);
        }
    }
    
    // Collaboration
    async addCollaborator(repoId, collaboratorAddress, permission) {
        try {
            const tx = await this.core.addCollaborator(repoId, collaboratorAddress, permission);
            return await tx.wait();
        } catch (error) {
            throw new Error(`Failed to add collaborator: ${error.message}`);
        }
    }
    
    async removeCollaborator(repoId, collaboratorAddress) {
        try {
            const tx = await this.core.removeCollaborator(repoId, collaboratorAddress);
            return await tx.wait();
        } catch (error) {
            throw new Error(`Failed to remove collaborator: ${error.message}`);
        }
    }
    
    async getRepositoryCollaborators(repoId) {
        try {
            return await this.core.getRepositoryCollaborators(repoId);
        } catch (error) {
            throw new Error(`Failed to get collaborators: ${error.message}`);
        }
    }
    
    // Utility functions
    async getTotalRepositories() {
        return await this.core.getTotalRepositories();
    }
    
    async getTotalUsers() {
        return await this.core.getTotalUsers();
    }
    
    async getUserRepositories(userAddress) {
        return await this.core.getUserRepositories(userAddress);
    }
    
    // Event listeners
    onRepositoryCreated(callback) {
        this.core.on('RepositoryCreated', callback);
    }
    
    onRepositoryStarred(callback) {
        this.core.on('RepositoryStarred', callback);
    }
    
    onRepositoryForked(callback) {
        this.core.on('RepositoryForked', callback);
    }
    
    onCommitMinted(callback) {
        this.nft.on('CommitMinted', callback);
    }
    
    onRewardEarned(callback) {
        this.rewards.on('RewardEarned', callback);
    }
    
    // Batch operations
    async batchGetRepositories(repoIds) {
        try {
            const repositories = await Promise.all(
                repoIds.map(id => this.core.getRepository(id))
            );
            return repositories;
        } catch (error) {
            throw new Error(`Failed to batch get repositories: ${error.message}`);
        }
    }
    
    async searchRepositories(query, limit = 20) {
        try {
            const totalRepos = await this.getTotalRepositories();
            const repositories = [];
            
            for (let i = 1; i <= Math.min(totalRepos.toNumber(), limit); i++) {
                try {
                    const repo = await this.core.getRepository(i);
                    if (repo.name.toLowerCase().includes(query.toLowerCase()) || 
                        repo.description.toLowerCase().includes(query.toLowerCase())) {
                        repositories.push({...repo, id: i});
                    }
                } catch (error) {
                    // Skip non-existent repositories
                    continue;
                }
            }
            
            return repositories;
        } catch (error) {
            throw new Error(`Failed to search repositories: ${error.message}`);
        }
    }
    
    // Analytics
    async getUserStats(userAddress) {
        try {
            const user = await this.getUser(userAddress);
            const repositories = await this.getUserRepositories(userAddress);
            const commits = await this.getAuthorCommits(userAddress);
            const pendingRewards = await this.getPendingRewards(userAddress);
            const totalEarned = await this.rewards.getTotalEarned(userAddress);
            
            let totalStars = 0;
            let totalForks = 0;
            
            for (const repoId of repositories) {
                try {
                    const repo = await this.getRepository(repoId.toNumber());
                    totalStars += repo.stars.toNumber();
                    totalForks += repo.forks.toNumber();
                } catch (error) {
                    continue;
                }
            }
            
            return {
                user: user,
                repositoryCount: repositories.length,
                commitCount: commits.length,
                totalStars: totalStars,
                totalForks: totalForks,
                reputation: user.reputation.toNumber(),
                pendingRewards: ethers.utils.formatEther(pendingRewards),
                totalEarned: ethers.utils.formatEther(totalEarned)
            };
        } catch (error) {
            throw new Error(`Failed to get user stats: ${error.message}`);
        }
    }
    
    async getRepositoryStats(repoId) {
        try {
            const repo = await this.getRepository(repoId);
            const commits = await this.nft.getRepositoryCommits(repoId);
            const collaborators = await this.getRepositoryCollaborators(repoId);
            
            return {
                repository: repo,
                commitCount: commits.length,
                collaboratorCount: collaborators.length,
                lastUpdated: new Date(repo.updatedAt.toNumber() * 1000),
                createdAt: new Date(repo.createdAt.toNumber() * 1000)
            };
        } catch (error) {
            throw new Error(`Failed to get repository stats: ${error.message}`);
        }
    }
}

// Export SDK for use in frontend
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PolkaForgeSDK };
}
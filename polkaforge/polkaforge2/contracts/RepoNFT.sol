// test/PolkaForge.test.js - Comprehensive tests (continued)

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PolkaForge Platform", function () {
    let coreContract, nftContract, rewardsContract;
    let owner, user1, user2, user3;
    let polkaForgeSDK;

    beforeEach(async function () {
        [owner, user1, user2, user3] = await ethers.getSigners();

        // Deploy Core contract
        const PolkaForgeCore = await ethers.getContractFactory("PolkaForgeCore");
        coreContract = await PolkaForgeCore.deploy();
        await coreContract.deployed();

        // Deploy NFT contract
        const PolkaForgeNFT = await ethers.getContractFactory("PolkaForgeNFT");
        nftContract = await PolkaForgeNFT.deploy(coreContract.address);
        await nftContract.deployed();

        // Deploy Rewards contract
        const PolkaForgeRewards = await ethers.getContractFactory("PolkaForgeRewards");
        rewardsContract = await PolkaForgeRewards.deploy(coreContract.address, nftContract.address);
        await rewardsContract.deployed();

        // Fund rewards contract
        await rewardsContract.connect(owner).sendTransaction({
            value: ethers.utils.parseEther("100")
        });
    });

    describe("Repository Management", function () {
        beforeEach(async function () {
            await coreContract.connect(user1).registerUser("user1", "QmUser1");
            await coreContract.connect(user2).registerUser("user2", "QmUser2");
        });

        it("Should create a repository", async function () {
            const tx = await coreContract.connect(user1).createRepository(
                "Test Repo",
                "A test repository",
                "QmTestRepo",
                false
            );

            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === 'RepositoryCreated');
            
            expect(event.args.owner).to.equal(user1.address);
            expect(event.args.name).to.equal("Test Repo");
            
            const repo = await coreContract.getRepository(1);
            expect(repo.name).to.equal("Test Repo");
            expect(repo.description).to.equal("A test repository");
            expect(repo.owner).to.equal(user1.address);
            expect(repo.isPrivate).to.be.false;
            expect(repo.active).to.be.true;
        });

        it("Should update repository metadata", async function () {
            await coreContract.connect(user1).createRepository(
                "Test Repo",
                "A test repository",
                "QmTestRepo",
                false
            );

            await coreContract.connect(user1).updateRepository(
                1,
                "Updated Repo",
                "Updated description",
                "QmUpdatedRepo"
            );

            const repo = await coreContract.getRepository(1);
            expect(repo.name).to.equal("Updated Repo");
            expect(repo.description).to.equal("Updated description");
        });

        it("Should only allow owner to update repository", async function () {
            await coreContract.connect(user1).createRepository(
                "Test Repo",
                "A test repository",
                "QmTestRepo",
                false
            );

            await expect(
                coreContract.connect(user2).updateRepository(
                    1,
                    "Malicious Update",
                    "Hacked",
                    "QmHacked"
                )
            ).to.be.revertedWith("Not repository owner");
        });

        it("Should fork a repository", async function () {
            await coreContract.connect(user1).createRepository(
                "Original Repo",
                "Original repository",
                "QmOriginal",
                false
            );

            const tx = await coreContract.connect(user2).forkRepository(1, "QmForked");
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === 'RepositoryForked');
            
            expect(event.args.originalId).to.equal(1);
            expect(event.args.forkId).to.equal(2);
            expect(event.args.forker).to.equal(user2.address);

            const fork = await coreContract.getRepository(2);
            expect(fork.owner).to.equal(user2.address);
            expect(fork.forkedFrom).to.equal(1);
        });

        it("Should not allow forking private repositories", async function () {
            await coreContract.connect(user1).createRepository(
                "Private Repo",
                "Private repository",
                "QmPrivate",
                true
            );

            await expect(
                coreContract.connect(user2).forkRepository(1, "QmForked")
            ).to.be.revertedWith("Cannot fork private repository");
        });
    });

    describe("Contribution Management", function () {
        beforeEach(async function () {
            await coreContract.connect(user1).registerUser("user1", "QmUser1");
            await coreContract.connect(user2).registerUser("user2", "QmUser2");
            await coreContract.connect(user1).createRepository(
                "Test Repo",
                "A test repository",
                "QmTestRepo",
                false
            );
        });

        it("Should submit a contribution", async function () {
            const tx = await coreContract.connect(user2).submitContribution(
                1,
                "QmContribution",
                "Added new feature",
                0 // FEATURE type
            );

            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === 'ContributionSubmitted');
            
            expect(event.args.repositoryId).to.equal(1);
            expect(event.args.contributor).to.equal(user2.address);

            const contribution = await coreContract.getContribution(1);
            expect(contribution.contributor).to.equal(user2.address);
            expect(contribution.description).to.equal("Added new feature");
            expect(contribution.status).to.equal(0); // PENDING
        });

        it("Should approve a contribution", async function () {
            await coreContract.connect(user2).submitContribution(
                1,
                "QmContribution",
                "Added new feature",
                0
            );

            const tx = await coreContract.connect(user1).reviewContribution(1, true);
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === 'ContributionReviewed');
            
            expect(event.args.contributionId).to.equal(1);
            expect(event.args.approved).to.be.true;

            const contribution = await coreContract.getContribution(1);
            expect(contribution.status).to.equal(1); // APPROVED
        });

        it("Should reject a contribution", async function () {
            await coreContract.connect(user2).submitContribution(
                1,
                "QmContribution",
                "Bad code",
                0
            );

            await coreContract.connect(user1).reviewContribution(1, false);

            const contribution = await coreContract.getContribution(1);
            expect(contribution.status).to.equal(2); // REJECTED
        });

        it("Should only allow repository owner to review contributions", async function () {
            await coreContract.connect(user2).submitContribution(
                1,
                "QmContribution",
                "Added new feature",
                0
            );

            await expect(
                coreContract.connect(user2).reviewContribution(1, true)
            ).to.be.revertedWith("Not repository owner");
        });
    });

    describe("Reputation System", function () {
        beforeEach(async function () {
            await coreContract.connect(user1).registerUser("user1", "QmUser1");
            await coreContract.connect(user2).registerUser("user2", "QmUser2");
            await coreContract.connect(user1).createRepository(
                "Test Repo",
                "A test repository",
                "QmTestRepo",
                false
            );
        });

        it("Should increase reputation on approved contribution", async function () {
            await coreContract.connect(user2).submitContribution(
                1,
                "QmContribution",
                "Added new feature",
                0
            );

            const initialRep = (await coreContract.getUser(user2.address)).reputation;
            
            await coreContract.connect(user1).reviewContribution(1, true);

            const finalRep = (await coreContract.getUser(user2.address)).reputation;
            expect(finalRep).to.be.gt(initialRep);
        });

        it("Should not change reputation on rejected contribution", async function () {
            await coreContract.connect(user2).submitContribution(
                1,
                "QmContribution",
                "Bad code",
                0
            );

            const initialRep = (await coreContract.getUser(user2.address)).reputation;
            
            await coreContract.connect(user1).reviewContribution(1, false);

            const finalRep = (await coreContract.getUser(user2.address)).reputation;
            expect(finalRep).to.equal(initialRep);
        });
    });

    describe("NFT Integration", function () {
        beforeEach(async function () {
            await coreContract.connect(user1).registerUser("user1", "QmUser1");
            await coreContract.connect(user2).registerUser("user2", "QmUser2");
            await coreContract.connect(user1).createRepository(
                "Test Repo",
                "A test repository",
                "QmTestRepo",
                false
            );
        });

        it("Should mint achievement NFT", async function () {
            await nftContract.connect(owner).mintAchievement(
                user1.address,
                "First Repository",
                "QmAchievementMeta"
            );

            expect(await nftContract.balanceOf(user1.address)).to.equal(1);
            
            const tokenId = await nftContract.tokenOfOwnerByIndex(user1.address, 0);
            const achievement = await nftContract.getAchievement(tokenId);
            
            expect(achievement.title).to.equal("First Repository");
            expect(achievement.recipient).to.equal(user1.address);
        });

        it("Should mint project NFT", async function () {
            await nftContract.connect(user1).mintProject(
                1,
                "QmProjectMeta"
            );

            const tokenId = await nftContract.tokenOfOwnerByIndex(user1.address, 0);
            const project = await nftContract.getProject(tokenId);
            
            expect(project.repositoryId).to.equal(1);
            expect(project.creator).to.equal(user1.address);
        });

        it("Should only allow repository owner to mint project NFT", async function () {
            await expect(
                nftContract.connect(user2).mintProject(1, "QmProjectMeta")
            ).to.be.revertedWith("Not repository owner");
        });
    });

    describe("Rewards System", function () {
        beforeEach(async function () {
            await coreContract.connect(user1).registerUser("user1", "QmUser1");
            await coreContract.connect(user2).registerUser("user2", "QmUser2");
            await coreContract.connect(user1).createRepository(
                "Test Repo",
                "A test repository",
                "QmTestRepo",
                false
            );
        });

        it("Should distribute rewards for approved contributions", async function () {
            await coreContract.connect(user2).submitContribution(
                1,
                "QmContribution",
                "Added new feature",
                0
            );

            const initialBalance = await ethers.provider.getBalance(user2.address);
            
            await coreContract.connect(user1).reviewContribution(1, true);

            const finalBalance = await ethers.provider.getBalance(user2.address);
            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("Should calculate rewards based on contribution type", async function () {
            // Submit feature contribution
            await coreContract.connect(user2).submitContribution(
                1,
                "QmFeature",
                "Added feature",
                0 // FEATURE
            );

            // Submit bug fix contribution
            await coreContract.connect(user2).submitContribution(
                1,
                "QmBugFix",
                "Fixed bug",
                1 // BUG_FIX
            );

            const featureReward = await rewardsContract.calculateReward(1);
            const bugFixReward = await rewardsContract.calculateReward(2);

            expect(featureReward).to.be.gt(bugFixReward);
        });

        it("Should handle insufficient funds gracefully", async function () {
            // Drain the rewards contract
            await rewardsContract.connect(owner).withdraw(
                await ethers.provider.getBalance(rewardsContract.address)
            );

            await coreContract.connect(user2).submitContribution(
                1,
                "QmContribution",
                "Added feature",
                0
            );

            // Should not revert, but should emit an event
            await expect(
                coreContract.connect(user1).reviewContribution(1, true)
            ).to.not.be.reverted;
        });
    });

    describe("Access Control", function () {
        it("Should only allow admin to add new admins", async function () {
            await expect(
                coreContract.connect(user1).addAdmin(user2.address)
            ).to.be.revertedWith("Only admin");
        });

        it("Should allow admin to pause contract", async function () {
            await coreContract.connect(owner).pause();
            
            await expect(
                coreContract.connect(user1).registerUser("testuser", "QmTest")
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should allow admin to unpause contract", async function () {
            await coreContract.connect(owner).pause();
            await coreContract.connect(owner).unpause();
            
            await expect(
                coreContract.connect(user1).registerUser("testuser", "QmTest")
            ).to.not.be.reverted;
        });
    });

    describe("Edge Cases and Error Handling", function () {
        it("Should handle non-existent repository queries", async function () {
            await expect(
                coreContract.getRepository(999)
            ).to.be.revertedWith("Repository does not exist");
        });

        it("Should handle non-existent contribution queries", async function () {
            await expect(
                coreContract.getContribution(999)
            ).to.be.revertedWith("Contribution does not exist");
        });

        it("Should handle empty username registration", async function () {
            await expect(
                coreContract.connect(user1).registerUser("", "QmTest")
            ).to.be.revertedWith("Username cannot be empty");
        });

        it("Should handle contribution to non-existent repository", async function () {
            await coreContract.connect(user1).registerUser("user1", "QmUser1");
            
            await expect(
                coreContract.connect(user1).submitContribution(
                    999,
                    "QmContribution",
                    "Invalid contribution",
                    0
                )
            ).to.be.revertedWith("Repository does not exist");
        });
    });

    describe("Gas Optimization Tests", function () {
        it("Should use reasonable gas for user registration", async function () {
            const tx = await coreContract.connect(user1).registerUser("testuser", "QmTest");
            const receipt = await tx.wait();
            
            expect(receipt.gasUsed).to.be.lt(150000); // Should use less than 150k gas
        });

        it("Should use reasonable gas for repository creation", async function () {
            await coreContract.connect(user1).registerUser("user1", "QmUser1");
            
            const tx = await coreContract.connect(user1).createRepository(
                "Test Repo",
                "Description",
                "QmRepo",
                false
            );
            const receipt = await tx.wait();
            
            expect(receipt.gasUsed).to.be.lt(200000); // Should use less than 200k gas
        });
    });

    describe("Integration Tests", function () {
        it("Should handle complete workflow", async function () {
            // Register users
            await coreContract.connect(user1).registerUser("creator", "QmCreator");
            await coreContract.connect(user2).registerUser("contributor", "QmContributor");

            // Create repository
            await coreContract.connect(user1).createRepository(
                "Amazing Project",
                "An amazing open source project",
                "QmProject",
                false
            );

            // Submit contribution
            await coreContract.connect(user2).submitContribution(
                1,
                "QmContribution",
                "Added awesome feature",
                0
            );

            // Review and approve
            await coreContract.connect(user1).reviewContribution(1, true);

            // Check reputation increase
            const contributor = await coreContract.getUser(user2.address);
            expect(contributor.reputation).to.be.gt(0);

            // Check reward distribution
            const rewardAmount = await rewardsContract.calculateReward(1);
            expect(rewardAmount).to.be.gt(0);

            // Mint project NFT
            await nftContract.connect(user1).mintProject(1, "QmProjectNFT");
            expect(await nftContract.balanceOf(user1.address)).to.equal(1);
        });
    });
});

// Additional utility functions for testing
async function advanceTime(seconds) {
    await network.provider.send("evm_increaseTime", [seconds]);
    await network.provider.send("evm_mine");
}

async function getLatestBlock() {
    return await ethers.provider.getBlock("latest");
}

// Performance benchmarking
describe("Performance Benchmarks", function () {
    let coreContract;
    let users = [];

    before(async function () {
        const signers = await ethers.getSigners();
        users = signers.slice(0, 10); // Use first 10 signers

        const PolkaForgeCore = await ethers.getContractFactory("PolkaForgeCore");
        coreContract = await PolkaForgeCore.deploy();
        await coreContract.deployed();
    });

    it("Should handle batch user registrations efficiently", async function () {
        const startTime = Date.now();
        
        const promises = users.map((user, index) => 
            coreContract.connect(user).registerUser(`user${index}`, `QmUser${index}`)
        );
        
        await Promise.all(promises);
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`Batch registration of ${users.length} users took ${duration}ms`);
        expect(duration).to.be.lt(5000); // Should complete in less than 5 seconds
    });

    it("Should handle multiple repository creations efficiently", async function () {
        const startTime = Date.now();
        
        const promises = users.map((user, index) => 
            coreContract.connect(user).createRepository(
                `Repo ${index}`,
                `Description ${index}`,
                `QmRepo${index}`,
                false
            )
        );
        
        await Promise.all(promises);
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`Creation of ${users.length} repositories took ${duration}ms`);
        expect(duration).to.be.lt(10000); // Should complete in less than 10 seconds
    });
});
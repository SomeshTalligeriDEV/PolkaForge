// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PolkaForgeCore
 * @dev Main contract for managing repositories, users, and core platform functionality
 */
contract PolkaForgeCore is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Counters
    Counters.Counter private _repositoryIds;
    Counters.Counter private _userIds;
    
    // Structs
    struct Repository {
        uint256 id;
        string name;
        string description;
        address owner;
        string ipfsHash;
        uint256 createdAt;
        uint256 updatedAt;
        bool isPrivate;
        uint256 stars;
        uint256 forks;
        bool exists;
    }
    
    struct User {
        uint256 id;
        address userAddress;
        string username;
        string profileIPFS;
        uint256[] repositories;
        uint256[] starredRepos;
        uint256 reputation;
        uint256 joinedAt;
        bool exists;
    }
    
    struct Collaboration {
        address collaborator;
        uint8 permission; // 0: read, 1: write, 2: admin
        uint256 addedAt;
    }
    
    // Mappings
    mapping(uint256 => Repository) public repositories;
    mapping(address => User) private users; // Changed to private for proper getter
    mapping(address => uint256) public addressToUserId;
    mapping(string => bool) public usernameExists;
    mapping(uint256 => mapping(address => bool)) public hasStarred;
    mapping(uint256 => Collaboration[]) public repositoryCollaborators;
    mapping(uint256 => uint256) public repositoryToParent; // For forks
    mapping(address => bool) public authorizedContracts;
    
    // Events
    event UserRegistered(address indexed user, uint256 indexed userId, string username);
    event RepositoryCreated(uint256 indexed repoId, address indexed owner, string name);
    event RepositoryUpdated(uint256 indexed repoId, string newIPFSHash);
    event RepositoryStarred(uint256 indexed repoId, address indexed user);
    event RepositoryUnstarred(uint256 indexed repoId, address indexed user);
    event RepositoryForked(uint256 indexed originalRepoId, uint256 indexed newRepoId, address indexed forker);
    event CollaboratorAdded(uint256 indexed repoId, address indexed collaborator, uint8 permission);
    event CollaboratorRemoved(uint256 indexed repoId, address indexed collaborator);
    
    // Modifiers
    modifier onlyRegisteredUser() {
        require(users[msg.sender].exists, "User not registered");
        _;
    }
    
    modifier onlyRepositoryOwner(uint256 _repoId) {
        require(repositories[_repoId].exists, "Repository does not exist");
        require(repositories[_repoId].owner == msg.sender, "Not repository owner");
        _;
    }
    
    modifier repositoryExists(uint256 _repoId) {
        require(repositories[_repoId].exists, "Repository does not exist");
        _;
    }
    
    modifier validUsername(string memory _username) {
        require(bytes(_username).length > 0 && bytes(_username).length <= 32, "Invalid username length");
        require(!usernameExists[_username], "Username already exists");
        _;
    }
    
    modifier onlyAuthorizedContract() {
        require(authorizedContracts[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    /**
     * @dev Constructor - initialize owner
     */
    constructor() {
        _transferOwnership(msg.sender);
    }
    
    /**
     * @dev Authorize contract to interact with this contract
     */
    function authorizeContract(address _contract) external onlyOwner {
        authorizedContracts[_contract] = true;
    }
    
    /**
     * @dev Revoke contract authorization
     */
    function revokeContractAuthorization(address _contract) external onlyOwner {
        authorizedContracts[_contract] = false;
    }
    
    /**
     * @dev Register a new user
     */
    function registerUser(string memory _username, string memory _profileIPFS) 
        external 
        validUsername(_username) 
    {
        require(!users[msg.sender].exists, "User already registered");
        
        _userIds.increment();
        uint256 newUserId = _userIds.current();
        
        users[msg.sender] = User({
            id: newUserId,
            userAddress: msg.sender,
            username: _username,
            profileIPFS: _profileIPFS,
            repositories: new uint256[](0),
            starredRepos: new uint256[](0),
            reputation: 0,
            joinedAt: block.timestamp,
            exists: true
        });
        
        addressToUserId[msg.sender] = newUserId;
        usernameExists[_username] = true;
        
        emit UserRegistered(msg.sender, newUserId, _username);
    }
    
    /**
     * @dev Create a new repository
     */
    function createRepository(
        string memory _name,
        string memory _description,
        string memory _ipfsHash,
        bool _isPrivate
    ) external onlyRegisteredUser returns (uint256) {
        require(bytes(_name).length > 0 && bytes(_name).length <= 100, "Invalid repository name");
        
        _repositoryIds.increment();
        uint256 newRepoId = _repositoryIds.current();
        
        repositories[newRepoId] = Repository({
            id: newRepoId,
            name: _name,
            description: _description,
            owner: msg.sender,
            ipfsHash: _ipfsHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isPrivate: _isPrivate,
            stars: 0,
            forks: 0,
            exists: true
        });
        
        // Add to user's repositories
        users[msg.sender].repositories.push(newRepoId);
        
        emit RepositoryCreated(newRepoId, msg.sender, _name);
        return newRepoId;
    }
    
    /**
     * @dev Update repository IPFS hash (for code updates)
     */
    function updateRepository(uint256 _repoId, string memory _newIPFSHash) 
        external 
        onlyRepositoryOwner(_repoId) 
    {
        repositories[_repoId].ipfsHash = _newIPFSHash;
        repositories[_repoId].updatedAt = block.timestamp;
        
        emit RepositoryUpdated(_repoId, _newIPFSHash);
    }
    
    /**
     * @dev Star a repository
     */
    function starRepository(uint256 _repoId) external onlyRegisteredUser repositoryExists(_repoId) {
        require(!hasStarred[_repoId][msg.sender], "Already starred");
        require(repositories[_repoId].owner != msg.sender, "Cannot star own repository");
        
        hasStarred[_repoId][msg.sender] = true;
        repositories[_repoId].stars++;
        users[msg.sender].starredRepos.push(_repoId);
        
        // Increase repository owner's reputation
        users[repositories[_repoId].owner].reputation += 1;
        
        emit RepositoryStarred(_repoId, msg.sender);
    }
    
    /**
     * @dev Unstar a repository
     */
    function unstarRepository(uint256 _repoId) external onlyRegisteredUser repositoryExists(_repoId) {
        require(hasStarred[_repoId][msg.sender], "Not starred");
        
        hasStarred[_repoId][msg.sender] = false;
        repositories[_repoId].stars--;
        
        // Remove from starred repos array
        uint256[] storage starredRepos = users[msg.sender].starredRepos;
        for (uint256 i = 0; i < starredRepos.length; i++) {
            if (starredRepos[i] == _repoId) {
                starredRepos[i] = starredRepos[starredRepos.length - 1];
                starredRepos.pop();
                break;
            }
        }
        
        // Decrease repository owner's reputation
        if (users[repositories[_repoId].owner].reputation > 0) {
            users[repositories[_repoId].owner].reputation -= 1;
        }
        
        emit RepositoryUnstarred(_repoId, msg.sender);
    }
    
    /**
     * @dev Fork a repository
     */
    function forkRepository(uint256 _repoId, string memory _newName) 
        external 
        onlyRegisteredUser 
        repositoryExists(_repoId) 
        returns (uint256) 
    {
        require(!repositories[_repoId].isPrivate, "Cannot fork private repository");
        require(repositories[_repoId].owner != msg.sender, "Cannot fork own repository");
        
        uint256 newRepoId = createRepository(
            _newName,
            string(abi.encodePacked("Fork of ", repositories[_repoId].name)),
            repositories[_repoId].ipfsHash,
            false
        );
        
        repositoryToParent[newRepoId] = _repoId;
        repositories[_repoId].forks++;
        
        // Increase original owner's reputation
        users[repositories[_repoId].owner].reputation += 2;
        
        emit RepositoryForked(_repoId, newRepoId, msg.sender);
        return newRepoId;
    }
    
    /**
     * @dev Add collaborator to repository
     */
    function addCollaborator(uint256 _repoId, address _collaborator, uint8 _permission) 
        external 
        onlyRepositoryOwner(_repoId) 
    {
        require(users[_collaborator].exists, "Collaborator not registered");
        require(_permission <= 2, "Invalid permission level");
        require(_collaborator != msg.sender, "Cannot add self as collaborator");
        
        // Check if already a collaborator
        Collaboration[] storage collaborators = repositoryCollaborators[_repoId];
        for (uint256 i = 0; i < collaborators.length; i++) {
            require(collaborators[i].collaborator != _collaborator, "Already a collaborator");
        }
        
        collaborators.push(Collaboration({
            collaborator: _collaborator,
            permission: _permission,
            addedAt: block.timestamp
        }));
        
        emit CollaboratorAdded(_repoId, _collaborator, _permission);
    }
    
    /**
     * @dev Remove collaborator from repository
     */
    function removeCollaborator(uint256 _repoId, address _collaborator) 
        external 
        onlyRepositoryOwner(_repoId) 
    {
        Collaboration[] storage collaborators = repositoryCollaborators[_repoId];
        
        for (uint256 i = 0; i < collaborators.length; i++) {
            if (collaborators[i].collaborator == _collaborator) {
                collaborators[i] = collaborators[collaborators.length - 1];
                collaborators.pop();
                emit CollaboratorRemoved(_repoId, _collaborator);
                return;
            }
        }
        
        revert("Collaborator not found");
    }
    
    /**
     * @dev Check if user has write permission to repository
     */
    function hasWritePermission(uint256 _repoId, address _user) external view returns (bool) {
        // Check if user is owner
        if (repositories[_repoId].owner == _user) return true;
        
        // Check collaborator permissions
        Collaboration[] storage collaborators = repositoryCollaborators[_repoId];
        for (uint256 i = 0; i < collaborators.length; i++) {
            if (collaborators[i].collaborator == _user && collaborators[i].permission >= 1) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Update user reputation (only authorized contracts)
     */
    function updateUserReputation(address _user, int256 _change) external onlyAuthorizedContract {
        require(users[_user].exists, "User does not exist");
        
        if (_change > 0) {
            users[_user].reputation += uint256(_change);
        } else if (_change < 0) {
            uint256 decrease = uint256(-_change);
            if (users[_user].reputation >= decrease) {
                users[_user].reputation -= decrease;
            } else {
                users[_user].reputation = 0;
            }
        }
    }
    
    // View functions
    function getRepository(uint256 _repoId) external view returns (Repository memory) {
        require(repositories[_repoId].exists, "Repository does not exist");
        return repositories[_repoId];
    }
    
    function getUser(address _userAddress) external view returns (User memory) {
        require(users[_userAddress].exists, "User does not exist");
        return users[_userAddress];
    }
    
    function getUserRepositories(address _userAddress) external view returns (uint256[] memory) {
        require(users[_userAddress].exists, "User does not exist");
        return users[_userAddress].repositories;
    }
    
    function getRepositoryCollaborators(uint256 _repoId) external view returns (Collaboration[] memory) {
        require(repositories[_repoId].exists, "Repository does not exist");
        return repositoryCollaborators[_repoId];
    }
    
    function getTotalRepositories() external view returns (uint256) {
        return _repositoryIds.current();
    }
    
    function getTotalUsers() external view returns (uint256) {
        return _userIds.current();
    }
    
    function isUserRegistered(address _user) external view returns (bool) {
        return users[_user].exists;
    }
}

/**
 * @title PolkaForgeNFT
 * @dev NFT contract for code authorship proof
 */
contract PolkaForgeNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Reference to core contract
    PolkaForgeCore public coreContract;
    
    struct CodeCommit {
        uint256 repositoryId;
        address author;
        string commitHash;
        string ipfsMetadata;
        uint256 timestamp;
        uint256 linesAdded;
        uint256 linesRemoved;
    }
    
    mapping(uint256 => CodeCommit) public commits;
    mapping(address => uint256[]) public authorCommits;
    mapping(uint256 => uint256[]) public repositoryCommits;
    
    event CommitMinted(uint256 indexed tokenId, uint256 indexed repositoryId, address indexed author, string commitHash);
    
    constructor(address _coreContract) ERC721("PolkaForge Code Commit", "PFC") {
        require(_coreContract != address(0), "Invalid core contract address");
        coreContract = PolkaForgeCore(_coreContract);
        _transferOwnership(msg.sender);
    }
    
    /**
     * @dev Mint NFT for code commit (called when pushing changes)
     */
    function mintCommitNFT(
        uint256 _repositoryId,
        string memory _commitHash,
        string memory _ipfsMetadata,
        uint256 _linesAdded,
        uint256 _linesRemoved
    ) external nonReentrant returns (uint256) {
        // Verify repository exists and user has permission
        require(coreContract.hasWritePermission(_repositoryId, msg.sender), "No write permission");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Store commit data
        commits[newTokenId] = CodeCommit({
            repositoryId: _repositoryId,
            author: msg.sender,
            commitHash: _commitHash,
            ipfsMetadata: _ipfsMetadata,
            timestamp: block.timestamp,
            linesAdded: _linesAdded,
            linesRemoved: _linesRemoved
        });
        
        // Track commits
        authorCommits[msg.sender].push(newTokenId);
        repositoryCommits[_repositoryId].push(newTokenId);
        
        // Mint NFT (non-transferable)
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _ipfsMetadata);
        
        emit CommitMinted(newTokenId, _repositoryId, msg.sender, _commitHash);
        return newTokenId;
    }
    
    /**
     * @dev Override transfer functions to make NFTs non-transferable
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal pure override {
        require(from == address(0), "Code commit NFTs are non-transferable");
    }
    
    /**
     * @dev Get commit details
     */
    function getCommit(uint256 _tokenId) external view returns (CodeCommit memory) {
        require(_exists(_tokenId), "Token does not exist");
        return commits[_tokenId];
    }
    
    /**
     * @dev Get all commits by author
     */
    function getAuthorCommits(address _author) external view returns (uint256[] memory) {
        return authorCommits[_author];
    }
    
    /**
     * @dev Get all commits for repository
     */
    function getRepositoryCommits(uint256 _repositoryId) external view returns (uint256[] memory) {
        return repositoryCommits[_repositoryId];
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

/**
 * @title PolkaForgeRewards
 * @dev Handle DOT rewards and token economics
 */
contract PolkaForgeRewards is Ownable, ReentrancyGuard {
    PolkaForgeCore public coreContract;
    PolkaForgeNFT public nftContract;
    
    // Reward rates (in wei)
    uint256 public rewardPerStar = 0.1 ether;
    uint256 public rewardPerCommit = 0.05 ether;
    uint256 public rewardPerFork = 0.2 ether;
    
    mapping(address => uint256) public pendingRewards;
    mapping(address => uint256) public totalEarned;
    
    event RewardEarned(address indexed user, uint256 amount, string reason);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardRatesUpdated(uint256 starReward, uint256 commitReward, uint256 forkReward);
    
    constructor(address _coreContract, address _nftContract) {
        require(_coreContract != address(0), "Invalid core contract address");
        require(_nftContract != address(0), "Invalid NFT contract address");
        
        coreContract = PolkaForgeCore(_coreContract);
        nftContract = PolkaForgeNFT(_nftContract);
        _transferOwnership(msg.sender);
    }
    
    /**
     * @dev Add reward for user action
     */
    function addReward(address _user, uint256 _amount, string memory _reason) external onlyOwner {
        require(_user != address(0), "Invalid user address");
        require(_amount > 0, "Invalid reward amount");
        
        pendingRewards[_user] += _amount;
        totalEarned[_user] += _amount;
        emit RewardEarned(_user, _amount, _reason);
    }
    
    /**
     * @dev Claim pending rewards
     */
    function claimRewards() external nonReentrant {
        uint256 reward = pendingRewards[msg.sender];
        require(reward > 0, "No pending rewards");
        require(address(this).balance >= reward, "Insufficient contract balance");
        
        pendingRewards[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: reward}("");
        require(success, "Transfer failed");
        
        emit RewardClaimed(msg.sender, reward);
    }
    
    /**
     * @dev Update reward rates
     */
    function updateRewardRates(
        uint256 _starReward,
        uint256 _commitReward,
        uint256 _forkReward
    ) external onlyOwner {
        rewardPerStar = _starReward;
        rewardPerCommit = _commitReward;
        rewardPerFork = _forkReward;
        
        emit RewardRatesUpdated(_starReward, _commitReward, _forkReward);
    }
    
    /**
     * @dev Fund contract with ETH/DOT
     */
    receive() external payable {
        require(msg.value > 0, "Cannot send 0 value");
    }
    
    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Withdraw specific amount (owner only)
     */
    function withdraw(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Invalid amount");
        require(address(this).balance >= _amount, "Insufficient balance");
        
        (bool success, ) = payable(owner()).call{value: _amount}("");
        require(success, "Transfer failed");
    }
    
    // View functions
    function getPendingRewards(address _user) external view returns (uint256) {
        return pendingRewards[_user];
    }
    
    function getTotalEarned(address _user) external view returns (uint256) {
        return totalEarned[_user];
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getRewardRates() external view returns (uint256, uint256, uint256) {
        return (rewardPerStar, rewardPerCommit, rewardPerFork);
    }
}
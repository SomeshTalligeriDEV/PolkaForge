import type { Repository, Job, NFT } from "./types"

// In-memory storage with better ID generation
let repositories: Repository[] = []
let jobs: Job[] = []
const nfts: NFT[] = []

// Generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

// Initialize with some sample data
const initializeData = () => {
  if (repositories.length === 0) {
    repositories = [
      {
        id: generateId(),
        name: "polkadot-js-api",
        owner: "alice",
        ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        description: "JavaScript API for interacting with Polkadot and Substrate nodes",
        stars: 245,
        forks: 87,
        lastUpdated: "2 days ago",
        tags: ["api", "javascript", "substrate"],
        ipfsHash: "QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx",
        nftId: "NFT-001",
        isPrivate: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        files: [
          {
            name: "README.md",
            content: "# Polkadot.js API\n\nJavaScript API for Polkadot",
            type: "markdown",
            size: 1024,
          },
          {
            name: "package.json",
            content: '{\n  "name": "@polkadot/api",\n  "version": "1.0.0"\n}',
            type: "json",
            size: 512,
          },
        ],
      },
      {
        id: generateId(),
        name: "substrate-node-template",
        owner: "bob",
        ownerAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        description: "A template for building custom Substrate nodes",
        stars: 189,
        forks: 56,
        lastUpdated: "5 days ago",
        tags: ["substrate", "blockchain", "template"],
        ipfsHash: "QmULKig5Fxrs2uC5oBBKPNhJawxbq8tGsxYTc9mZQVtpSm",
        nftId: "NFT-002",
        isPrivate: false,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        files: [
          {
            name: "Cargo.toml",
            content: '[package]\nname = "substrate-node"\nversion = "1.0.0"',
            type: "toml",
            size: 256,
          },
        ],
      },
    ]

    jobs = [
      {
        id: generateId(),
        title: "Build DeFi Staking Contract",
        description:
          "Need an experienced Substrate developer to build a staking contract with reward distribution mechanism.",
        requirements: ["Substrate/ink! experience", "Smart contract security knowledge", "Testing experience"],
        reward: "50",
        deadline: "2025-02-15",
        poster: "DeFi Protocol",
        posterAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        status: "open",
        applicants: 12,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["defi", "staking", "substrate", "ink"],
      },
      {
        id: generateId(),
        title: "NFT Marketplace Frontend",
        description:
          "Create a React frontend for an NFT marketplace built on Polkadot. Must integrate with Polkadot.js API.",
        requirements: ["React/TypeScript", "Polkadot.js API", "Web3 UI/UX experience"],
        reward: "30",
        deadline: "2025-01-30",
        poster: "NFT Collective",
        posterAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        status: "open",
        applicants: 8,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["frontend", "nft", "react", "polkadot"],
      },
    ]
  }
}

initializeData()

export const repositoryStorage = {
  getAll: (): Repository[] => {
    return repositories.filter((repo) => !repo.isPrivate)
  },

  getById: (id: string): Repository | null => {
    return repositories.find((repo) => repo.id === id) || null
  },

  getByOwner: (ownerAddress: string): Repository[] => {
    return repositories.filter((repo) => repo.ownerAddress === ownerAddress)
  },

  create: (repo: Omit<Repository, "id" | "createdAt" | "lastUpdated" | "stars" | "forks">): Repository => {
    const newRepo: Repository = {
      ...repo,
      id: generateId(),
      createdAt: new Date().toISOString(),
      lastUpdated: "just now",
      stars: 0,
      forks: 0,
      files: repo.files || [],
    }
    repositories.push(newRepo)
    console.log("Repository created with ID:", newRepo.id)
    return newRepo
  },

  update: (id: string, updates: Partial<Repository>): Repository | null => {
    const index = repositories.findIndex((repo) => repo.id === id)
    if (index === -1) return null

    repositories[index] = { ...repositories[index], ...updates, lastUpdated: "just now" }
    return repositories[index]
  },

  addFile: (repoId: string, file: { name: string; content: string; type: string; size: number }): boolean => {
    const repo = repositories.find((r) => r.id === repoId)
    if (!repo) return false

    if (!repo.files) repo.files = []

    // Remove existing file with same name
    repo.files = repo.files.filter((f) => f.name !== file.name)

    // Add new file
    repo.files.push(file)
    repo.lastUpdated = "just now"

    return true
  },

  deleteFile: (repoId: string, fileName: string): boolean => {
    const repo = repositories.find((r) => r.id === repoId)
    if (!repo || !repo.files) return false

    repo.files = repo.files.filter((f) => f.name !== fileName)
    repo.lastUpdated = "just now"

    return true
  },
}

export const jobStorage = {
  getAll: (): Job[] => {
    return jobs
  },

  getById: (id: string): Job | null => {
    return jobs.find((job) => job.id === id) || null
  },

  create: (job: Omit<Job, "id" | "createdAt" | "applicants" | "status">): Job => {
    const newJob: Job = {
      ...job,
      id: generateId(),
      createdAt: new Date().toISOString(),
      applicants: 0,
      status: "open",
    }
    jobs.push(newJob)
    return newJob
  },

  update: (id: string, updates: Partial<Job>): Job | null => {
    const index = jobs.findIndex((job) => job.id === id)
    if (index === -1) return null

    jobs[index] = { ...jobs[index], ...updates }
    return jobs[index]
  },
}

export const nftStorage = {
  getAll: (): NFT[] => {
    return nfts
  },

  getByOwner: (owner: string): NFT[] => {
    return nfts.filter((nft) => nft.owner === owner)
  },

  getByRepo: (repoId: string): NFT | null => {
    return nfts.find((nft) => nft.repoId === repoId) || null
  },

  create: (nft: Omit<NFT, "id" | "mintedAt">): NFT => {
    const newNFT: NFT = {
      ...nft,
      id: generateId(),
      mintedAt: new Date().toISOString(),
    }
    nfts.push(newNFT)
    console.log("NFT created with ID:", newNFT.id)
    return newNFT
  },
}

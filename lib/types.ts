export interface Repository {
  id: string
  name: string
  owner: string
  ownerAddress: string
  description: string
  stars: number
  forks: number
  lastUpdated: string
  tags: string[]
  ipfsHash?: string
  nftId?: string
  isPrivate: boolean
  createdAt: string
  files?: RepositoryFile[]
}

export interface RepositoryFile {
  name: string
  content: string
  type: string
  size: number
}

export interface PolkadotAccount {
  address: string
  meta: {
    name?: string
    source: string
  }
}

export interface WalletContextType {
  account: PolkadotAccount | null
  accounts: PolkadotAccount[]
  connected: boolean
  connecting: boolean
  balance: string
  connect: () => Promise<void>
  disconnect: () => void
  switchAccount: (account: PolkadotAccount) => void
}

export interface Job {
  id: string
  title: string
  description: string
  requirements: string[]
  reward: string // in DOT
  deadline: string
  poster: string
  posterAddress: string
  status: "open" | "in-progress" | "completed" | "cancelled"
  applicants: number
  createdAt: string
  tags: string[]
}

export interface NFT {
  id: string
  tokenId: string
  owner: string
  repoId: string
  metadata: {
    name: string
    description: string
    image: string
    attributes: Array<{
      trait_type: string
      value: string
    }>
  }
  mintedAt: string
}

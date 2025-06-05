export interface NFTMetadata {
  name: string
  description: string
  image: string
  external_url?: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  properties: {
    category: string
    creators: Array<{
      address: string
      share: number
    }>
  }
}

export function generateNFTMetadata(repoData: {
  name: string
  owner: string
  ownerAddress: string
  description: string
  tags: string[]
  ipfsHash: string
  createdAt: string
}): NFTMetadata {
  const { name, owner, ownerAddress, description, tags, ipfsHash, createdAt } = repoData

  // Generate a unique NFT image based on repo data
  const imageUrl = generateNFTImage(name, owner, tags)

  return {
    name: `${name} - Repository Authorship`,
    description: `Proof of authorship for the repository "${name}" on PolkaForge. ${description}`,
    image: imageUrl,
    external_url: `https://polkaforge.dev/repo/${name}`,
    attributes: [
      {
        trait_type: "Repository Name",
        value: name,
      },
      {
        trait_type: "Owner",
        value: owner,
      },
      {
        trait_type: "Creation Date",
        value: new Date(createdAt).toISOString().split("T")[0],
      },
      {
        trait_type: "IPFS Hash",
        value: ipfsHash,
      },
      {
        trait_type: "Primary Language",
        value: tags[0] || "Unknown",
      },
      {
        trait_type: "Tag Count",
        value: tags.length,
      },
      {
        trait_type: "Blockchain",
        value: "Polkadot",
      },
      {
        trait_type: "Platform",
        value: "PolkaForge",
      },
    ],
    properties: {
      category: "Repository",
      creators: [
        {
          address: ownerAddress,
          share: 100,
        },
      ],
    },
  }
}

function generateNFTImage(repoName: string, owner: string, tags: string[]): string {
  // Create a unique color scheme based on repo name
  const colors = [
    "#e6007a", // Polkadot pink
    "#552bbf", // Purple
    "#00d4aa", // Teal
    "#ff6b35", // Orange
    "#4ecdc4", // Mint
    "#45b7d1", // Blue
    "#96ceb4", // Green
    "#feca57", // Yellow
  ]

  const colorIndex = repoName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  const primaryColor = colors[colorIndex]
  const secondaryColor = colors[(colorIndex + 1) % colors.length]

  // Generate SVG-based NFT image
  const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="400" fill="url(#bg)"/>
      
      <!-- Pattern -->
      <circle cx="100" cy="100" r="50" fill="rgba(255,255,255,0.1)"/>
      <circle cx="300" cy="300" r="70" fill="rgba(255,255,255,0.1)"/>
      <circle cx="350" cy="100" r="30" fill="rgba(255,255,255,0.1)"/>
      
      <!-- Main content area -->
      <rect x="40" y="80" width="320" height="240" rx="20" fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
      
      <!-- PolkaForge logo -->
      <text x="200" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${primaryColor}">PolkaForge</text>
      
      <!-- Repository icon -->
      <rect x="180" y="140" width="40" height="30" rx="5" fill="none" stroke="${primaryColor}" stroke-width="2"/>
      <circle cx="185" cy="150" r="2" fill="${primaryColor}"/>
      <line x1="190" y1="150" x2="210" y2="150" stroke="${primaryColor}" stroke-width="2"/>
      <line x1="190" y1="160" x2="205" y2="160" stroke="${primaryColor}" stroke-width="1"/>
      
      <!-- Repository name -->
      <text x="200" y="190" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#333">${repoName.length > 15 ? repoName.substring(0, 15) + "..." : repoName}</text>
      
      <!-- Owner -->
      <text x="200" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">by ${owner}</text>
      
      <!-- Tags -->
      <text x="200" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#888">${tags.slice(0, 3).join(" • ")}</text>
      
      <!-- NFT label -->
      <text x="200" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${primaryColor}" filter="url(#glow)">AUTHORSHIP NFT</text>
      
      <!-- Polkadot dots pattern -->
      <circle cx="80" cy="350" r="3" fill="rgba(255,255,255,0.8)"/>
      <circle cx="95" cy="350" r="3" fill="rgba(255,255,255,0.6)"/>
      <circle cx="110" cy="350" r="3" fill="rgba(255,255,255,0.4)"/>
      <circle cx="290" cy="350" r="3" fill="rgba(255,255,255,0.4)"/>
      <circle cx="305" cy="350" r="3" fill="rgba(255,255,255,0.6)"/>
      <circle cx="320" cy="350" r="3" fill="rgba(255,255,255,0.8)"/>
    </svg>
  `

  // Convert SVG to data URL
  const encodedSvg = encodeURIComponent(svg)
  return `data:image/svg+xml,${encodedSvg}`
}

export function generateTokenId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `PF-${timestamp}-${random}`
}

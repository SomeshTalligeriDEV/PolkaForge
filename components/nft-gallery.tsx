"use client"

import { useState, useEffect } from "react"
import { nftStorage } from "@/lib/storage"
import { useWallet } from "@/hooks/use-wallet"
import type { NFT } from "@/lib/types"
import { Sparkles, Eye, Download, Share, ExternalLink } from "lucide-react"

export default function NFTGallery() {
  const { connected, account } = useWallet()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)

  useEffect(() => {
    if (connected && account) {
      const userNFTs = nftStorage.getByOwner(account.address)
      setNfts(userNFTs)
    }
  }, [connected, account])

  const handleViewNFT = (nft: NFT) => {
    setSelectedNFT(nft)
  }

  const handleDownloadNFT = (nft: NFT) => {
    // Create download link for NFT image
    const link = document.createElement("a")
    link.href = nft.metadata.image
    link.download = `${nft.metadata.name}.svg`
    link.click()
  }

  const handleShareNFT = async (nft: NFT) => {
    if (navigator.share) {
      await navigator.share({
        title: nft.metadata.name,
        text: nft.metadata.description,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert("NFT link copied to clipboard!")
    }
  }

  if (!connected) {
    return (
      <div className="card text-center">
        <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
        <h3 className="text-xl font-bold mb-2">Connect Wallet to View NFTs</h3>
        <p className="opacity-70">Connect your Polkadot wallet to see your authorship NFTs</p>
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="card text-center">
        <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
        <h3 className="text-xl font-bold mb-2">No NFTs Yet</h3>
        <p className="opacity-70">Create a repository to mint your first authorship NFT!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Sparkles size={24} className="text-[#e6007a] animate-spin" />
        Your NFT Collection
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft, index) => (
          <div
            key={nft.id}
            className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 hover:scale-105 transition-all duration-300 animate-fadeIn"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="relative mb-4">
              <img
                src={nft.metadata.image || "/placeholder.svg"}
                alt={nft.metadata.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2">
                <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                  NFT
                </div>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-2">{nft.metadata.name}</h3>
            <p className="text-sm opacity-70 mb-4 line-clamp-2">{nft.metadata.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {nft.metadata.attributes.slice(0, 3).map((attr, index) => (
                <span key={index} className="badge badge-secondary text-xs">
                  {attr.trait_type}: {attr.value}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleViewNFT(nft)}
                className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1"
              >
                <Eye size={14} />
                View
              </button>
              <button
                onClick={() => handleDownloadNFT(nft)}
                className="btn btn-secondary btn-sm flex items-center gap-1"
              >
                <Download size={14} />
              </button>
              <button onClick={() => handleShareNFT(nft)} className="btn btn-secondary btn-sm flex items-center gap-1">
                <Share size={14} />
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800 text-xs opacity-60">
              Minted: {new Date(nft.mintedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{selectedNFT.metadata.name}</h2>
              <button onClick={() => setSelectedNFT(null)} className="btn btn-secondary btn-sm">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedNFT.metadata.image || "/placeholder.svg"}
                  alt={selectedNFT.metadata.name}
                  className="w-full rounded-lg"
                />
              </div>

              <div>
                <h3 className="font-bold mb-2">Description</h3>
                <p className="text-sm opacity-80 mb-4">{selectedNFT.metadata.description}</p>

                <h3 className="font-bold mb-2">Attributes</h3>
                <div className="space-y-2 mb-4">
                  {selectedNFT.metadata.attributes.map((attr, index) => (
                    <div key={index} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="font-medium">{attr.trait_type}</span>
                      <span>{attr.value}</span>
                    </div>
                  ))}
                </div>

                <h3 className="font-bold mb-2">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Token ID:</span>
                    <span className="font-mono">{selectedNFT.tokenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minted:</span>
                    <span>{new Date(selectedNFT.mintedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Owner:</span>
                    <span className="font-mono">{selectedNFT.owner.substring(0, 8)}...</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => handleDownloadNFT(selectedNFT)}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download
                  </button>
                  <button
                    onClick={() => handleShareNFT(selectedNFT)}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <Share size={16} />
                    Share
                  </button>
                  <button className="btn btn-secondary flex items-center gap-2">
                    <ExternalLink size={16} />
                    View on Explorer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

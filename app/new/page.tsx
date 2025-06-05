"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import OfflineIndicator from "@/components/offline-indicator"
import { useWallet } from "@/hooks/use-wallet"
import { repositoryStorage, nftStorage } from "@/lib/storage"
import { generateNFTMetadata, generateTokenId } from "@/lib/nft-generator"
import { Lock, Sparkles, Zap, CheckCircle, Code, Rocket, Upload, FileText, X } from "lucide-react"

interface FileUpload {
  name: string
  content: string
  type: string
  size: number
}

export default function NewRepoPage() {
  const router = useRouter()
  const { connected, connect, account } = useWallet()
  const [repoName, setRepoName] = useState("")
  const [description, setDescription] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [tags, setTags] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1) // 1: uploading, 2: creating repo, 3: minting NFT, 4: complete
  const [files, setFiles] = useState<FileUpload[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return

    Array.from(uploadedFiles).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const newFile: FileUpload = {
          name: file.name,
          content,
          type: file.type || getFileType(file.name),
          size: file.size,
        }
        setFiles((prev) => [...prev.filter((f) => f.name !== file.name), newFile])
      }
      reader.readAsText(file)
    })
  }

  const getFileType = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    const typeMap: { [key: string]: string } = {
      js: "javascript",
      ts: "typescript",
      jsx: "javascript",
      tsx: "typescript",
      py: "python",
      rs: "rust",
      go: "go",
      java: "java",
      cpp: "cpp",
      c: "c",
      md: "markdown",
      json: "json",
      yaml: "yaml",
      yml: "yaml",
      toml: "toml",
      txt: "text",
    }
    return typeMap[extension || ""] || "text"
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!connected || !account) {
      await connect()
      return
    }

    setIsSubmitting(true)
    setStep(1)

    try {
      // Step 1: Simulate IPFS upload
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const mockIpfsHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

      // Step 2: Create repository
      setStep(2)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newRepo = repositoryStorage.create({
        name: repoName,
        owner: account.meta.name || account.address.substring(0, 8),
        ownerAddress: account.address,
        description,
        isPrivate,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        ipfsHash: mockIpfsHash,
        files:
          files.length > 0
            ? files
            : [
                {
                  name: "README.md",
                  content: `# ${repoName}\n\n${description || "A new repository created on PolkaForge"}\n\n## Getting Started\n\nThis repository was created on PolkaForge, the decentralized GitHub on Polkadot.\n\n## Features\n\n- Decentralized storage on IPFS\n- NFT authorship proof\n- Built on Polkadot\n\n## Tags\n\n${tags
                    .split(",")
                    .map((tag) => `- ${tag.trim()}`)
                    .join("\n")}`,
                  type: "markdown",
                  size: 500,
                },
              ],
      })

      console.log("Repository created:", newRepo)

      // Step 3: Mint NFT for repository authorship
      setStep(3)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const tokenId = generateTokenId()
      const nftMetadata = generateNFTMetadata({
        name: repoName,
        owner: account.meta.name || account.address.substring(0, 8),
        ownerAddress: account.address,
        description,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        ipfsHash: mockIpfsHash,
        createdAt: new Date().toISOString(),
      })

      const nft = nftStorage.create({
        tokenId,
        owner: account.address,
        repoId: newRepo.id,
        metadata: nftMetadata,
      })

      console.log("NFT created:", nft)

      // Update repository with NFT ID
      repositoryStorage.update(newRepo.id, { nftId: nft.tokenId })

      // Step 4: Complete
      setStep(4)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setTimeout(() => {
        setIsSubmitting(false)
        router.push(`/repo/${newRepo.id}`)
      }, 2000)
    } catch (error) {
      console.error("Error creating repository:", error)
      setIsSubmitting(false)
      alert("Failed to create repository. Please try again.")
    }
  }

  return (
    <div className="animate-fadeIn">
      <Header />
      <OfflineIndicator />
      <div className="container py-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 gradient-text">Create a New Repository</h1>
          <p className="text-lg opacity-80">Build the future on Polkadot with automatic NFT authorship proof</p>
        </div>

        {!connected && (
          <div className="card mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-800/30 flex items-center justify-center animate-bounce">
                <Lock size={24} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Connect your Polkadot wallet first</h3>
                <p className="text-sm opacity-80">
                  You need to connect your Polkadot wallet to create repositories and mint NFTs
                </p>
              </div>
            </div>
            <button className="btn btn-primary mt-4 animate-glow" onClick={connect}>
              <Zap size={16} className="mr-2" />
              Connect Polkadot Wallet
            </button>
          </div>
        )}

        <div className="card mb-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <Sparkles size={24} className="text-purple-600 animate-spin" />
            <div>
              <h3 className="font-bold text-lg">✨ Automatic NFT Authorship Proof</h3>
              <p className="text-sm opacity-80">
                Creating this repository will automatically mint a unique NFT as proof of your authorship on Polkadot
              </p>
            </div>
          </div>
        </div>

        {isSubmitting && (
          <div className="card mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <h3 className="font-bold text-lg mb-4">Creating Your Repository...</h3>

              <div className="space-y-4">
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg ${step >= 1 ? "bg-green-100 dark:bg-green-900/20" : "bg-gray-100 dark:bg-gray-800"}`}
                >
                  {step > 1 ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span className={step >= 1 ? "text-green-700 dark:text-green-300" : ""}>Uploading to IPFS...</span>
                </div>

                <div
                  className={`flex items-center gap-3 p-3 rounded-lg ${step >= 2 ? "bg-green-100 dark:bg-green-900/20" : "bg-gray-100 dark:bg-gray-800"}`}
                >
                  {step > 2 ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : step === 2 ? (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Code size={20} className="text-gray-400" />
                  )}
                  <span className={step >= 2 ? "text-green-700 dark:text-green-300" : ""}>
                    Creating repository on Polkadot...
                  </span>
                </div>

                <div
                  className={`flex items-center gap-3 p-3 rounded-lg ${step >= 3 ? "bg-green-100 dark:bg-green-900/20" : "bg-gray-100 dark:bg-gray-800"}`}
                >
                  {step > 3 ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : step === 3 ? (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Sparkles size={20} className="text-gray-400" />
                  )}
                  <span className={step >= 3 ? "text-green-700 dark:text-green-300" : ""}>
                    Minting authorship NFT...
                  </span>
                </div>

                <div
                  className={`flex items-center gap-3 p-3 rounded-lg ${step >= 4 ? "bg-green-100 dark:bg-green-900/20" : "bg-gray-100 dark:bg-gray-800"}`}
                >
                  {step >= 4 ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <Rocket size={20} className="text-gray-400" />
                  )}
                  <span className={step >= 4 ? "text-green-700 dark:text-green-300" : ""}>
                    Finalizing repository...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="card">
            <h2 className="text-xl font-bold mb-6">Repository Details</h2>

            <div className="mb-6">
              <label htmlFor="repo-name" className="block font-bold mb-2 text-lg">
                Repository name *
              </label>
              <input
                id="repo-name"
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:border-[#e6007a] focus:ring-2 focus:ring-[#e6007a]/20 transition-all duration-300"
                placeholder="e.g., my-awesome-polkadot-project"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block font-bold mb-2 text-lg">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:border-[#e6007a] focus:ring-2 focus:ring-[#e6007a]/20 transition-all duration-300"
                placeholder="Short description of your repository"
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="tags" className="block font-bold mb-2 text-lg">
                Tags (comma separated)
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:border-[#e6007a] focus:ring-2 focus:ring-[#e6007a]/20 transition-all duration-300"
                placeholder="e.g., polkadot, defi, nft, substrate"
                disabled={isSubmitting}
              />
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-3">
                <input
                  id="private"
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-5 h-5 text-[#e6007a] focus:ring-[#e6007a] rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="private" className="flex items-center gap-2 font-medium">
                  <Lock size={18} className={isPrivate ? "text-[#e6007a]" : ""} />
                  Private repository
                </label>
              </div>
              <p className="text-sm opacity-70 mt-2 ml-8">
                Private repositories are only visible to you and collaborators you add
              </p>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="btn btn-primary w-full text-lg py-4 animate-glow"
                disabled={isSubmitting || !repoName || !connected}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-dots mr-3">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    Creating repository & minting NFT...
                  </>
                ) : (
                  <>
                    <Rocket size={20} className="mr-3" />
                    Create Repository & Mint NFT
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="card">
            <h2 className="text-xl font-bold mb-6">Upload Files</h2>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                dragActive
                  ? "border-[#e6007a] bg-[#e6007a]/5"
                  : "border-gray-300 dark:border-gray-600 hover:border-[#e6007a]/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Drag & drop files here</p>
              <p className="text-sm opacity-70 mb-4">or click to browse</p>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
                disabled={isSubmitting}
              />
              <label htmlFor="file-upload" className="btn btn-secondary cursor-pointer">
                <FileText size={16} className="mr-2" />
                Choose Files
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold mb-3">Uploaded Files ({files.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-[#e6007a]" />
                        <div>
                          <div className="font-medium text-sm">{file.name}</div>
                          <div className="text-xs opacity-70">
                            {file.type} • {(file.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file.name)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        disabled={isSubmitting}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-bold mb-2">💡 File Upload Tips</h4>
              <ul className="text-sm space-y-1 opacity-80">
                <li>• Supported: .js, .ts, .py, .rs, .md, .json, .yaml, etc.</li>
                <li>• Files are stored on IPFS for decentralization</li>
                <li>• Maximum file size: 10MB per file</li>
                <li>• README.md will be auto-generated if not provided</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

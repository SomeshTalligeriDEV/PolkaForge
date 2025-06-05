"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Header from "@/components/header"
import OfflineIndicator from "@/components/offline-indicator"
import CodeEditor from "@/components/code-editor"
import { repositoryStorage, nftStorage } from "@/lib/storage"
import type { Repository, NFT } from "@/lib/types"
import {
  GitFork,
  Star,
  Code,
  FileText,
  GitBranch,
  Clock,
  Download,
  Sparkles,
  Eye,
  User,
  Plus,
  Edit,
  Trash2,
} from "lucide-react"

export default function RepoPage() {
  const params = useParams()
  const repoId = params.id as string
  const [repo, setRepo] = useState<Repository | null>(null)
  const [nft, setNft] = useState<NFT | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("code")
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [editingFile, setEditingFile] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const foundRepo = repositoryStorage.getById(repoId)
      setRepo(foundRepo)

      if (foundRepo) {
        const foundNft = nftStorage.getByRepo(foundRepo.id)
        setNft(foundNft)

        // Select first file by default
        if (foundRepo.files && foundRepo.files.length > 0) {
          setSelectedFile(foundRepo.files[0].name)
        }
      }

      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [repoId])

  const handleSaveFile = (fileName: string, content: string) => {
    if (!repo) return

    const fileType = fileName.split(".").pop()?.toLowerCase() || "text"
    const file = {
      name: fileName,
      content,
      type: fileType,
      size: content.length,
    }

    repositoryStorage.addFile(repo.id, file)

    // Update local state
    const updatedRepo = { ...repo }
    if (!updatedRepo.files) updatedRepo.files = []
    updatedRepo.files = updatedRepo.files.filter((f) => f.name !== fileName)
    updatedRepo.files.push(file)
    setRepo(updatedRepo)
    setEditingFile(null)
  }

  const handleDeleteFile = (fileName: string) => {
    if (!repo) return

    if (confirm(`Are you sure you want to delete ${fileName}?`)) {
      repositoryStorage.deleteFile(repo.id, fileName)

      // Update local state
      const updatedRepo = { ...repo }
      if (updatedRepo.files) {
        updatedRepo.files = updatedRepo.files.filter((f) => f.name !== fileName)
      }
      setRepo(updatedRepo)

      // Select another file if current was deleted
      if (selectedFile === fileName) {
        setSelectedFile(updatedRepo.files?.[0]?.name || null)
      }
    }
  }

  if (loading) {
    return (
      <div>
        <Header />
        <OfflineIndicator />
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!repo) {
    return (
      <div>
        <Header />
        <OfflineIndicator />
        <div className="container py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Repository Not Found</h2>
          <p>The repository you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const selectedFileContent = repo.files?.find((f) => f.name === selectedFile)

  return (
    <div>
      <Header />
      <OfflineIndicator />
      <div className="container py-8">
        <div className="flex items-center gap-2 mb-2">
          <Code size={20} className="text-[#e6007a]" />
          <h1 className="text-2xl font-bold">
            {repo.owner}/{repo.name}
          </h1>
          {repo.isPrivate && <Eye size={16} className="text-gray-400" title="Private Repository" />}
        </div>

        <p className="text-lg opacity-80 mb-6">{repo.description}</p>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="badge badge-secondary flex items-center hover:scale-105 transition-transform">
            <Star size={14} className="mr-1" />
            {repo.stars} stars
          </div>
          <div className="badge badge-secondary flex items-center hover:scale-105 transition-transform">
            <GitFork size={14} className="mr-1" />
            {repo.forks} forks
          </div>
          <div className="badge badge-secondary flex items-center hover:scale-105 transition-transform">
            <Clock size={14} className="mr-1" />
            Updated {repo.lastUpdated}
          </div>
          <div className="badge badge-secondary flex items-center hover:scale-105 transition-transform">
            <User size={14} className="mr-1" />
            {repo.owner}
          </div>
          {repo.ipfsHash && (
            <div className="badge badge-primary flex items-center hover:scale-105 transition-transform">
              IPFS: {repo.ipfsHash.substring(0, 6)}...{repo.ipfsHash.substring(repo.ipfsHash.length - 4)}
            </div>
          )}
          {nft && (
            <div className="badge badge-primary flex items-center animate-pulse hover:scale-105 transition-transform">
              <Sparkles size={14} className="mr-1" />
              NFT: {nft.tokenId}
            </div>
          )}
        </div>

        <div className="flex gap-4 mb-6">
          <button className="btn btn-primary flex items-center hover:scale-105 transition-transform">
            <Download size={16} className="mr-2" />
            Clone
          </button>
          <button className="btn btn-secondary flex items-center hover:scale-105 transition-transform">
            <GitFork size={16} className="mr-2" />
            Fork
          </button>
          <button className="btn btn-secondary flex items-center hover:scale-105 transition-transform">
            <Star size={16} className="mr-2" />
            Star
          </button>
        </div>

        {nft && (
          <div className="card mb-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <img
                  src={nft.metadata.image || "/placeholder.svg"}
                  alt={nft.metadata.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Sparkles size={20} className="text-purple-600 animate-spin" />
                  {nft.metadata.name}
                </h3>
                <p className="text-sm opacity-80">{nft.metadata.description}</p>
                <div className="flex gap-2 mt-2">
                  {nft.metadata.attributes.slice(0, 3).map((attr, index) => (
                    <span key={index} className="badge badge-secondary text-xs">
                      {attr.trait_type}: {attr.value}
                    </span>
                  ))}
                </div>
              </div>
              <button className="btn btn-secondary">View NFT Details</button>
            </div>
          </div>
        )}

        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex gap-6">
            <button
              className={`py-3 px-1 border-b-2 transition-all duration-300 ${activeTab === "code" ? "border-[#e6007a] text-[#e6007a]" : "border-transparent hover:text-[#e6007a]"}`}
              onClick={() => setActiveTab("code")}
            >
              <Code size={16} className="inline mr-2" />
              Code
            </button>
            <button
              className={`py-3 px-1 border
              Code
            </button>
            <button
              className={\`py-3 px-1 border-b-2 transition-all duration-300 ${activeTab === "files" ? "border-[#e6007a] text-[#e6007a]" : "border-transparent hover:text-[#e6007a]"}`}
              onClick={() => setActiveTab("files")}
            >
              <FileText size={16} className="inline mr-2" />
              Files ({repo.files?.length || 0})
            </button>
            <button
              className={`py-3 px-1 border-b-2 transition-all duration-300 ${activeTab === "branches" ? "border-[#e6007a] text-[#e6007a]" : "border-transparent hover:text-[#e6007a]"}`}
              onClick={() => setActiveTab("branches")}
            >
              <GitBranch size={16} className="inline mr-2" />
              Branches
            </button>
          </nav>
        </div>

        {activeTab === "code" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="card">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold">Files</h3>
                  <button className="btn btn-primary btn-sm flex items-center gap-1">
                    <Plus size={14} />
                    Add
                  </button>
                </div>
                {repo.files && repo.files.length > 0 ? (
                  <ul className="space-y-1">
                    {repo.files.map((file, index) => (
                      <li key={index} className="group">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setSelectedFile(file.name)}
                            className={`flex-1 text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                              selectedFile === file.name ? "bg-[#e6007a]/10 text-[#e6007a]" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <FileText size={14} />
                              <span className="text-sm">{file.name}</span>
                            </div>
                          </button>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                              onClick={() => setEditingFile(file.name)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              title="Edit file"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.name)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded"
                              title="Delete file"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm opacity-70">No files uploaded</p>
                )}
              </div>
            </div>

            <div className="lg:col-span-3">
              {selectedFileContent ? (
                editingFile === selectedFileContent.name ? (
                  <CodeEditor
                    fileName={selectedFileContent.name}
                    initialContent={selectedFileContent.content}
                    language={selectedFileContent.type}
                    onSave={(content) => handleSaveFile(selectedFileContent.name, content)}
                  />
                ) : (
                  <div className="card p-0">
                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <FileText size={16} />
                        <span className="font-medium">{selectedFileContent.name}</span>
                        <span className="badge badge-secondary text-xs">{selectedFileContent.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm opacity-70">{(selectedFileContent.size / 1024).toFixed(1)} KB</span>
                        <button
                          onClick={() => setEditingFile(selectedFileContent.name)}
                          className="btn btn-secondary btn-sm flex items-center gap-1"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 overflow-auto max-h-96">
                      <pre className="text-sm">
                        <code>{selectedFileContent.content}</code>
                      </pre>
                    </div>
                  </div>
                )
              ) : (
                <div className="card text-center py-12">
                  <FileText size={48} className="mx-auto opacity-30 mb-4" />
                  <p className="text-lg font-medium mb-2">No file selected</p>
                  <p className="opacity-70">Select a file from the sidebar to view its contents</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "files" && (
          <div className="card">
            {repo.files && repo.files.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {repo.files.map((file, index) => (
                  <li
                    key={index}
                    className="py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-[#e6007a]" />
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm opacity-70">
                          {file.type} • {(file.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveTab("code")
                          setSelectedFile(file.name)
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("code")
                          setSelectedFile(file.name)
                          setEditingFile(file.name)
                        }}
                        className="btn btn-primary btn-sm flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto opacity-30 mb-4" />
                <p className="text-lg font-medium mb-2">No files uploaded</p>
                <p className="opacity-70">This repository doesn't have any files yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "branches" && (
          <div className="card">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {["main", "develop", "feature/nft-integration", "bugfix/ipfs-upload"].map((branch, index) => (
                <li
                  key={index}
                  className="py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center">
                    <GitBranch size={16} className="mr-2 opacity-70" />
                    {branch}
                    {branch === "main" && <span className="ml-2 badge badge-primary">default</span>}
                  </div>
                  <div className="text-sm opacity-70">Updated {Math.floor(Math.random() * 14) + 1} days ago</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

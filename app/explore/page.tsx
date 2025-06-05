"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import OfflineIndicator from "@/components/offline-indicator"
import RepoList from "@/components/repo-list"
import TrendingRepos from "@/components/trending-repos"
import NFTGallery from "@/components/nft-gallery"
import { repositoryStorage } from "@/lib/storage"
import type { Repository } from "@/lib/types"
import { Search, Filter, Code, Sparkles, TrendingUp } from "lucide-react"

export default function ExplorePage() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState<"repositories" | "nfts" | "trending">("repositories")

  useEffect(() => {
    const timer = setTimeout(() => {
      const allRepos = repositoryStorage.getAll()
      setRepos(allRepos)
      setFilteredRepos(allRepos)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let filtered = repos

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (repo) =>
          repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          repo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          repo.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
          repo.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter((repo) => repo.tags.includes(selectedTag))
    }

    // Sort repositories
    switch (sortBy) {
      case "stars":
        filtered.sort((a, b) => b.stars - a.stars)
        break
      case "forks":
        filtered.sort((a, b) => b.forks - a.forks)
        break
      case "recent":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    setFilteredRepos(filtered)
  }, [repos, searchTerm, selectedTag, sortBy])

  // Get all unique tags
  const allTags = Array.from(new Set(repos.flatMap((repo) => repo.tags)))

  const viewModes = [
    { id: "repositories", label: "Repositories", icon: Code },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "nfts", label: "NFT Gallery", icon: Sparkles },
  ]

  return (
    <div>
      <Header />
      <OfflineIndicator />
      <div className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 gradient-text">Explore PolkaForge</h1>
          <p className="text-lg opacity-80">Discover amazing projects built on Polkadot</p>
        </div>

        {/* View Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                  viewMode === mode.id
                    ? "bg-[#e6007a] text-white shadow-lg"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <mode.icon size={18} />
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {viewMode === "repositories" && (
          <>
            {/* Search and Filters */}
            <div className="card mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50" />
                    <input
                      type="text"
                      placeholder="Search repositories, users, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:border-[#e6007a] focus:ring-2 focus:ring-[#e6007a]/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:border-[#e6007a] focus:ring-2 focus:ring-[#e6007a]/20 transition-all duration-300"
                  >
                    <option value="">All Tags</option>
                    {allTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:border-[#e6007a] focus:ring-2 focus:ring-[#e6007a]/20 transition-all duration-300"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="stars">Most Stars</option>
                    <option value="forks">Most Forks</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm || selectedTag) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm opacity-70">Active filters:</span>
                  {searchTerm && (
                    <span className="badge badge-primary flex items-center gap-1">
                      Search: "{searchTerm}"
                      <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-red-300">
                        ✕
                      </button>
                    </span>
                  )}
                  {selectedTag && (
                    <span className="badge badge-primary flex items-center gap-1">
                      Tag: {selectedTag}
                      <button onClick={() => setSelectedTag("")} className="ml-1 hover:text-red-300">
                        ✕
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Results */}
            <div className="mb-4 flex justify-between items-center">
              <div className="text-lg font-medium">{filteredRepos.length} repositories found</div>
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <span className="text-sm opacity-70">Sorted by {sortBy}</span>
              </div>
            </div>

            <RepoList repos={filteredRepos} loading={loading} />
          </>
        )}

        {viewMode === "trending" && (
          <div className="max-w-4xl mx-auto">
            <TrendingRepos />
          </div>
        )}

        {viewMode === "nfts" && (
          <div className="max-w-6xl mx-auto">
            <NFTGallery />
          </div>
        )}
      </div>
    </div>
  )
}

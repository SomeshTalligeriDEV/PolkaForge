"use client"

import { useEffect, useState } from "react"
import { repositoryStorage } from "@/lib/storage"
import type { Repository } from "@/lib/types"
import { GitFork, Star, Code, Sparkles, Eye, Calendar, User } from "lucide-react"

interface RepoListProps {
  repos: Repository[]
  loading: boolean
}

export default function RepoList({ repos: initialRepos, loading }: RepoListProps) {
  const [repos, setRepos] = useState<Repository[]>(initialRepos)

  useEffect(() => {
    const refreshRepos = () => {
      const allRepos = repositoryStorage.getAll()
      setRepos(allRepos)
    }

    refreshRepos()
    const interval = setInterval(refreshRepos, 5000)
    return () => clearInterval(interval)
  }, [initialRepos])

  if (loading) {
    return (
      <div className="repo-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card repo-card animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            <div className="mt-4 flex justify-between">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (repos.length === 0) {
    return (
      <div className="text-center py-16 animate-fadeIn">
        <div className="relative mb-6">
          <Code size={64} className="mx-auto opacity-30 animate-float" />
          <Sparkles
            size={24}
            className="absolute top-0 right-1/2 transform translate-x-8 text-[#e6007a] animate-pulse"
          />
        </div>
        <h3 className="text-2xl font-bold mb-4">No repositories yet</h3>
        <p className="text-lg opacity-70 mb-6">Be the first to create a repository on PolkaForge!</p>
        <a href="/new" className="btn btn-primary animate-glow">
          Create Your First Repository
        </a>
      </div>
    )
  }

  return (
    <div className="repo-grid">
      {repos.map((repo, index) => (
        <div
          key={repo.id}
          className="card repo-card animate-fadeIn group hover:scale-105 transition-all duration-300"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="repo-card-header">
            <div className="relative">
              <Code size={20} className="mr-3 text-[#e6007a] group-hover:animate-spin transition-all duration-300" />
              {repo.nftId && (
                <div className="absolute -top-1 -right-1">
                  <Sparkles size={16} className="text-yellow-500 animate-pulse" title="NFT Minted" />
                </div>
              )}
            </div>
            <h3 className="font-bold text-lg flex-1">
              <a
                href={`/repo/${repo.id}`}
                className="hover:text-[#e6007a] transition-colors duration-300 gradient-text-hover"
              >
                {repo.owner}/{repo.name}
              </a>
            </h3>
            {repo.isPrivate && <Eye size={16} className="text-gray-400 ml-2" title="Private Repository" />}
          </div>

          <div className="repo-card-body">
            <p className="text-sm opacity-80 mb-4 line-clamp-2">{repo.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {repo.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="badge badge-secondary text-xs hover:scale-110 transition-transform duration-200"
                >
                  {tag}
                </span>
              ))}
              {repo.tags.length > 3 && (
                <span className="badge badge-secondary text-xs opacity-60">+{repo.tags.length - 3} more</span>
              )}
            </div>

            {repo.ipfsHash && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                <div className="text-xs font-medium mb-1 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  IPFS Hash
                </div>
                <div className="text-xs font-mono opacity-70 break-all">
                  {repo.ipfsHash.substring(0, 12)}...{repo.ipfsHash.substring(repo.ipfsHash.length - 8)}
                </div>
              </div>
            )}

            {repo.nftId && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 mb-4 border border-purple-200 dark:border-purple-800">
                <div className="text-xs font-medium mb-1 flex items-center gap-1">
                  <Sparkles size={12} className="text-purple-600 animate-spin" />
                  Authorship NFT
                </div>
                <div className="text-xs opacity-70">{repo.nftId}</div>
              </div>
            )}
          </div>

          <div className="repo-card-footer">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm group-hover:text-[#e6007a] transition-colors">
                <Star size={16} className="mr-1" />
                {repo.stars}
              </div>
              <div className="flex items-center text-sm group-hover:text-[#e6007a] transition-colors">
                <GitFork size={16} className="mr-1" />
                {repo.forks}
              </div>
              <div className="flex items-center text-sm opacity-60">
                <User size={14} className="mr-1" />
                {repo.owner}
              </div>
            </div>
            <div className="text-sm opacity-70 flex items-center gap-1">
              <Calendar size={12} />
              {repo.lastUpdated}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { repositoryStorage } from "@/lib/storage"
import type { Repository } from "@/lib/types"
import { TrendingUp, Star, GitFork, Code, Sparkles, Calendar, User } from "lucide-react"

export default function TrendingRepos() {
  const [trendingRepos, setTrendingRepos] = useState<Repository[]>([])

  useEffect(() => {
    const repos = repositoryStorage.getAll()
    // Sort by stars + forks + recent activity
    const trending = repos
      .sort((a, b) => {
        const scoreA = a.stars + a.forks + (a.lastUpdated === "just now" ? 10 : 0)
        const scoreB = b.stars + b.forks + (b.lastUpdated === "just now" ? 10 : 0)
        return scoreB - scoreA
      })
      .slice(0, 3)

    setTrendingRepos(trending)
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <TrendingUp size={24} className="text-[#e6007a] animate-pulse" />
        Trending Repositories
      </h2>

      <div className="space-y-4">
        {trendingRepos.map((repo, index) => (
          <div
            key={repo.id}
            className="card bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-l-4 border-[#e6007a] hover:scale-105 transition-all duration-300 animate-slideIn"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e6007a] to-[#552bbf] flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles size={12} className="text-yellow-500 animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <Link
                    href={`/repo/${repo.id}`}
                    className="font-bold text-lg hover:text-[#e6007a] transition-colors flex items-center gap-2"
                  >
                    <Code size={16} />
                    {repo.owner}/{repo.name}
                  </Link>
                  <p className="text-sm opacity-70 line-clamp-1">{repo.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star size={14} />
                  {repo.stars}
                </div>
                <div className="flex items-center gap-1 text-blue-500">
                  <GitFork size={14} />
                  {repo.forks}
                </div>
                <div className="flex items-center gap-1 opacity-60">
                  <Calendar size={14} />
                  {repo.lastUpdated}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                {repo.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="badge badge-secondary text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-sm opacity-60">
                <User size={12} />
                {repo.owner}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

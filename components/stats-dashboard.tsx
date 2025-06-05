"use client"

import { useState, useEffect } from "react"
import { repositoryStorage, jobStorage, nftStorage } from "@/lib/storage"
import { useWallet } from "@/hooks/use-wallet"
import { Code, Briefcase, Sparkles, TrendingUp, Users, Star, GitFork, DollarSign } from "lucide-react"

export default function StatsDashboard() {
  const { connected, account } = useWallet()
  const [stats, setStats] = useState({
    totalRepos: 0,
    totalJobs: 0,
    totalNFTs: 0,
    userRepos: 0,
    userNFTs: 0,
    totalStars: 0,
    totalForks: 0,
    totalRewards: 0,
  })

  useEffect(() => {
    const updateStats = () => {
      const repos = repositoryStorage.getAll()
      const jobs = jobStorage.getAll()
      const nfts = nftStorage.getAll()

      const userRepos = connected && account ? repositoryStorage.getByOwner(account.address) : []
      const userNFTs = connected && account ? nftStorage.getByOwner(account.address) : []

      setStats({
        totalRepos: repos.length,
        totalJobs: jobs.length,
        totalNFTs: nfts.length,
        userRepos: userRepos.length,
        userNFTs: userNFTs.length,
        totalStars: repos.reduce((sum, repo) => sum + repo.stars, 0),
        totalForks: repos.reduce((sum, repo) => sum + repo.forks, 0),
        totalRewards: jobs.reduce((sum, job) => sum + Number.parseFloat(job.reward), 0),
      })
    }

    updateStats()
    const interval = setInterval(updateStats, 5000)
    return () => clearInterval(interval)
  }, [connected, account])

  const globalStats = [
    {
      icon: Code,
      label: "Total Repositories",
      value: stats.totalRepos,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: Briefcase,
      label: "Active Jobs",
      value: stats.totalJobs,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      icon: Sparkles,
      label: "NFTs Minted",
      value: stats.totalNFTs,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: DollarSign,
      label: "Total Rewards",
      value: `${stats.totalRewards} DOT`,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
  ]

  const userStats = [
    {
      icon: Code,
      label: "Your Repositories",
      value: stats.userRepos,
      color: "text-[#e6007a]",
    },
    {
      icon: Sparkles,
      label: "Your NFTs",
      value: stats.userNFTs,
      color: "text-[#552bbf]",
    },
    {
      icon: Star,
      label: "Total Stars",
      value: stats.totalStars,
      color: "text-yellow-500",
    },
    {
      icon: GitFork,
      label: "Total Forks",
      value: stats.totalForks,
      color: "text-blue-500",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Global Stats */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp size={24} className="text-[#e6007a]" />
          Platform Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {globalStats.map((stat, index) => (
            <div
              key={index}
              className={`card ${stat.bgColor} border-0 hover:scale-105 transition-all duration-300 animate-fadeIn`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm opacity-70">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Stats */}
      {connected && (
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users size={24} className="text-[#e6007a]" />
            Your Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userStats.map((stat, index) => (
              <div
                key={index}
                className="card bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-0 hover:scale-105 transition-all duration-300 animate-slideIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e6007a] to-[#552bbf] flex items-center justify-center">
                    <stat.icon size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">{stat.value}</div>
                    <div className="text-sm opacity-70">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

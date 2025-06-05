"use client"

import { useState, useEffect } from "react"
import { repositoryStorage, jobStorage, nftStorage } from "@/lib/storage"
import { Code, Briefcase, Sparkles, User, Clock } from "lucide-react"

interface Activity {
  id: string
  type: "repo_created" | "job_posted" | "nft_minted" | "repo_starred" | "repo_forked"
  title: string
  description: string
  user: string
  timestamp: Date
  icon: any
  color: string
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    // Generate mock activities based on existing data
    const repos = repositoryStorage.getAll()
    const jobs = jobStorage.getAll()
    const nfts = nftStorage.getAll()

    const mockActivities: Activity[] = [
      ...repos.slice(0, 3).map((repo, index) => ({
        id: `repo-${repo.id}`,
        type: "repo_created" as const,
        title: `New repository created`,
        description: `${repo.owner} created ${repo.name}`,
        user: repo.owner,
        timestamp: new Date(Date.now() - index * 3600000),
        icon: Code,
        color: "text-blue-500",
      })),
      ...jobs.slice(0, 2).map((job, index) => ({
        id: `job-${job.id}`,
        type: "job_posted" as const,
        title: `New job posted`,
        description: `${job.poster} posted "${job.title}"`,
        user: job.poster,
        timestamp: new Date(Date.now() - (index + 3) * 3600000),
        icon: Briefcase,
        color: "text-green-500",
      })),
      ...nfts.slice(0, 2).map((nft, index) => ({
        id: `nft-${nft.id}`,
        type: "nft_minted" as const,
        title: `NFT minted`,
        description: `Authorship NFT created for repository`,
        user: nft.owner.substring(0, 8),
        timestamp: new Date(Date.now() - (index + 5) * 3600000),
        icon: Sparkles,
        color: "text-purple-500",
      })),
    ]

    // Sort by timestamp
    mockActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    setActivities(mockActivities.slice(0, 8))
  }, [])

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "just now"
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Clock size={24} className="text-[#e6007a] animate-pulse" />
        Recent Activity
      </h2>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="card bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:scale-105 transition-all duration-300 animate-fadeIn"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}>
                <activity.icon size={20} className={activity.color} />
              </div>
              <div className="flex-1">
                <div className="font-medium">{activity.title}</div>
                <div className="text-sm opacity-70">{activity.description}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm opacity-60 mb-1">
                  <User size={12} />
                  {activity.user}
                </div>
                <div className="text-xs opacity-50">{getTimeAgo(activity.timestamp)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

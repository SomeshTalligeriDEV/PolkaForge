"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Header from "@/components/header"
import { jobStorage } from "@/lib/storage"
import { useWallet } from "@/hooks/use-wallet"
import type { Job } from "@/lib/types"
import { Briefcase, Clock, DollarSign, Users, Plus, Filter } from "lucide-react"

export default function JobsPage() {
  const { connected, connect } = useWallet()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "open" | "in-progress" | "completed">("all")

  useEffect(() => {
    const timer = setTimeout(() => {
      const allJobs = jobStorage.getAll()
      setJobs(allJobs)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredJobs = jobs.filter((job) => filter === "all" || job.status === filter)

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Blockchain Development Jobs</h1>
            <p className="text-lg opacity-80">Find opportunities to earn DOT by building on Polkadot</p>
          </div>

          <div className="flex gap-3">
            {connected && (
              <Link href="/jobs/new" className="btn btn-primary">
                <Plus size={16} className="mr-2" />
                Post Job
              </Link>
            )}
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <span className="font-medium">Filter:</span>
          </div>
          {(["all", "open", "in-progress", "completed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === status
                  ? "bg-[#e6007a] text-white"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {status === "all" ? "All Jobs" : status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>

        {!connected && (
          <div className="card mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <Briefcase size={20} className="text-blue-600" />
              <div>
                <h3 className="font-medium">Connect to apply for jobs</h3>
                <p className="text-sm opacity-80">
                  Connect your Polkadot wallet to apply for jobs and receive DOT payments
                </p>
              </div>
            </div>
            <button className="btn btn-primary mt-4" onClick={connect}>
              Connect Polkadot Wallet
            </button>
          </div>
        )}

        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">
                      <Link href={`/jobs/${job.id}`} className="hover:text-[#e6007a]">
                        {job.title}
                      </Link>
                    </h3>
                    <span
                      className={`badge ${
                        job.status === "open"
                          ? "badge-primary"
                          : job.status === "in-progress"
                            ? "bg-yellow-500 text-white"
                            : job.status === "completed"
                              ? "bg-green-500 text-white"
                              : "badge-secondary"
                      }`}
                    >
                      {job.status.replace("-", " ")}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">{job.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.tags.map((tag) => (
                      <span key={tag} className="badge badge-secondary text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="flex items-center text-2xl font-bold text-[#e6007a] mb-1">
                    <DollarSign size={20} />
                    {job.reward} DOT
                  </div>
                  <div className="text-sm opacity-70">Reward</div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm opacity-70">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    {job.applicants} applicants
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </div>
                </div>
                <div>Posted by {job.poster}</div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium mb-1">Requirements:</h4>
                    <ul className="text-sm opacity-80">
                      {job.requirements.slice(0, 2).map((req, index) => (
                        <li key={index}>• {req}</li>
                      ))}
                      {job.requirements.length > 2 && <li>• +{job.requirements.length - 2} more...</li>}
                    </ul>
                  </div>

                  <Link href={`/jobs/${job.id}`} className="btn btn-secondary">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase size={48} className="mx-auto opacity-50 mb-4" />
            <h3 className="text-xl font-medium mb-2">No jobs found</h3>
            <p className="opacity-70">
              {filter === "all" ? "No jobs have been posted yet." : `No ${filter.replace("-", " ")} jobs found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

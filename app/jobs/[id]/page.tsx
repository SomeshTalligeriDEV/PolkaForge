"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/header"
import { jobStorage } from "@/lib/storage"
import { useWallet } from "@/hooks/use-wallet"
import type { Job } from "@/lib/types"
import { Briefcase, Clock, DollarSign, Users, Send, CheckCircle } from "lucide-react"

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  const { connected, connect, account } = useWallet()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [proposal, setProposal] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      const foundJob = jobStorage.getById(jobId)
      setJob(foundJob)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [jobId])

  const handleApply = async () => {
    if (!connected || !account) {
      await connect()
      return
    }

    setApplying(true)

    // Simulate application submission
    setTimeout(() => {
      if (job) {
        jobStorage.update(job.id, { applicants: job.applicants + 1 })
        setJob({ ...job, applicants: job.applicants + 1 })
      }
      setApplying(false)
      alert("Application submitted successfully! The job poster will review your proposal.")
    }, 2000)
  }

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-8"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div>
        <Header />
        <div className="container py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
          <p>The job you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <div className="container py-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase size={24} className="text-[#e6007a]" />
              <h1 className="text-3xl font-bold">{job.title}</h1>
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

            <div className="flex items-center gap-6 mb-6 text-sm opacity-70">
              <div className="flex items-center gap-1">
                <Users size={16} />
                {job.applicants} applicants
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                Deadline: {new Date(job.deadline).toLocaleDateString()}
              </div>
              <div>Posted {new Date(job.createdAt).toLocaleDateString()}</div>
            </div>

            <div className="card mb-6">
              <h2 className="text-xl font-semibold mb-3">Job Description</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{job.description}</p>
            </div>

            <div className="card mb-6">
              <h2 className="text-xl font-semibold mb-3">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold mb-3">Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span key={tag} className="badge badge-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center text-3xl font-bold text-[#e6007a] mb-2">
                  <DollarSign size={28} />
                  {job.reward} DOT
                </div>
                <div className="text-sm opacity-70">Total Reward</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="opacity-70">Posted by:</span>
                  <span className="font-medium">{job.poster}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Status:</span>
                  <span className="font-medium capitalize">{job.status.replace("-", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Deadline:</span>
                  <span className="font-medium">{new Date(job.deadline).toLocaleDateString()}</span>
                </div>
              </div>

              {job.status === "open" && (
                <>
                  {!connected ? (
                    <button onClick={connect} className="btn btn-primary w-full mb-4">
                      Connect Wallet to Apply
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="proposal" className="block font-medium mb-2">
                          Your Proposal
                        </label>
                        <textarea
                          id="proposal"
                          value={proposal}
                          onChange={(e) => setProposal(e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                          placeholder="Describe your approach, timeline, and relevant experience..."
                          rows={4}
                        />
                      </div>

                      <button
                        onClick={handleApply}
                        disabled={applying || !proposal.trim()}
                        className="btn btn-primary w-full"
                      >
                        {applying ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send size={16} className="mr-2" />
                            Apply for Job
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}

              {job.status === "completed" && (
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
                  <div className="font-medium text-green-700 dark:text-green-300">Job Completed</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Reward has been distributed</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

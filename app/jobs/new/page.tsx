"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { useWallet } from "@/hooks/use-wallet"
import { jobStorage } from "@/lib/storage"
import { Briefcase, DollarSign, Calendar, Tag } from "lucide-react"

export default function NewJobPage() {
  const router = useRouter()
  const { connected, connect, account } = useWallet()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [requirements, setRequirements] = useState("")
  const [reward, setReward] = useState("")
  const [deadline, setDeadline] = useState("")
  const [tags, setTags] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!connected || !account) {
      await connect()
      return
    }

    setIsSubmitting(true)

    try {
      const newJob = jobStorage.create({
        title,
        description,
        requirements: requirements.split("\n").filter((req) => req.trim()),
        reward,
        deadline,
        poster: account.meta.name || account.address.substring(0, 8),
        posterAddress: account.address,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      })

      setTimeout(() => {
        setIsSubmitting(false)
        router.push(`/jobs/${newJob.id}`)
      }, 2000)
    } catch (error) {
      console.error("Error creating job:", error)
      setIsSubmitting(false)
      alert("Failed to create job. Please try again.")
    }
  }

  return (
    <div>
      <Header />
      <div className="container py-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Briefcase size={24} className="text-[#e6007a]" />
          <h1 className="text-2xl font-bold">Post a New Job</h1>
        </div>

        {!connected && (
          <div className="card mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-3">
              <Briefcase size={20} className="text-yellow-600" />
              <div>
                <h3 className="font-medium">Connect your Polkadot wallet</h3>
                <p className="text-sm opacity-80">
                  You need to connect your wallet to post jobs and manage DOT payments
                </p>
              </div>
            </div>
            <button className="btn btn-primary mt-4" onClick={connect}>
              Connect Polkadot Wallet
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card">
          <div className="mb-4">
            <label htmlFor="title" className="block font-medium mb-1">
              Job Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
              placeholder="e.g., Build DeFi Staking Contract"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block font-medium mb-1">
              Job Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
              placeholder="Detailed description of the project, goals, and deliverables..."
              rows={4}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="requirements" className="block font-medium mb-1">
              Requirements (one per line) *
            </label>
            <textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
              placeholder="Substrate/ink! experience&#10;Smart contract security knowledge&#10;Testing experience"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="reward" className="block font-medium mb-1 flex items-center gap-1">
                <DollarSign size={16} />
                Reward (DOT) *
              </label>
              <input
                id="reward"
                type="number"
                step="0.1"
                min="0"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                placeholder="50"
                required
              />
            </div>

            <div>
              <label htmlFor="deadline" className="block font-medium mb-1 flex items-center gap-1">
                <Calendar size={16} />
                Deadline *
              </label>
              <input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="tags" className="block font-medium mb-1 flex items-center gap-1">
              <Tag size={16} />
              Tags (comma separated)
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
              placeholder="defi, staking, substrate, ink"
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2">💡 Job Posting Tips</h3>
              <ul className="text-sm space-y-1 opacity-80">
                <li>• Be specific about deliverables and timeline</li>
                <li>• Set a fair reward based on project complexity</li>
                <li>• Include clear acceptance criteria</li>
                <li>• Respond promptly to applicant questions</li>
              </ul>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !title || !description || !reward || !connected}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Posting job...
                </>
              ) : (
                <>
                  <Briefcase size={16} className="mr-2" />
                  Post Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

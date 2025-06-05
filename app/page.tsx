"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import OfflineIndicator from "@/components/offline-indicator"
import ParticleBackground from "@/components/particle-background"
import RepoList from "@/components/repo-list"
import StatsDashboard from "@/components/stats-dashboard"
import TrendingRepos from "@/components/trending-repos"
import ActivityFeed from "@/components/activity-feed"
import { repositoryStorage } from "@/lib/storage"
import { useWallet } from "@/hooks/use-wallet"
import type { Repository } from "@/lib/types"
import { Rocket, Zap, Shield, Globe, Code, Sparkles, TrendingUp, Activity } from "lucide-react"

export default function Home() {
  const { account, connected, connect } = useWallet()
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("overview")

  useEffect(() => {
    const timer = setTimeout(() => {
      const allRepos = repositoryStorage.getAll()
      setRepos(allRepos)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const features = [
    {
      icon: Shield,
      title: "Decentralized Storage",
      description: "Your code is stored on IPFS, ensuring permanent availability and censorship resistance.",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: Sparkles,
      title: "NFT Authorship",
      description: "Automatic NFT minting proves your authorship and ownership of repositories on-chain.",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: Zap,
      title: "DOT Payments",
      description: "Earn and pay in DOT for development work, bounties, and collaborative projects.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      icon: Globe,
      title: "Polkadot Native",
      description: "Built specifically for the Polkadot ecosystem with full parachain compatibility.",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
  ]

  const sections = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "repositories", label: "Repositories", icon: Code },
    { id: "activity", label: "Activity", icon: Activity },
  ]

  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <div className="relative z-10">
        <Header />
        <OfflineIndicator />

        <div className="container">
          {/* Hero Section */}
          <section className="py-16 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="relative">
                  <Code size={64} className="text-[#e6007a] animate-float" />
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#e6007a] to-[#552bbf] rounded-full opacity-20 animate-pulse"></div>
                </div>
                <div className="text-left">
                  <h1 className="text-5xl font-bold mb-2 gradient-text">PolkaForge</h1>
                  <p className="text-xl opacity-80">Decentralized GitHub on Polkadot</p>
                </div>
              </div>

              <p className="text-2xl opacity-90 mb-8 max-w-3xl mx-auto leading-relaxed">
                Code, Collaborate, Earn — All on Polkadot Chain with automatic NFT authorship proof and IPFS storage
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {!connected ? (
                  <button className="btn btn-primary text-lg px-8 py-4 animate-glow" onClick={connect}>
                    <Rocket size={20} className="mr-2" />
                    Connect Polkadot Wallet
                  </button>
                ) : (
                  <a href="/new" className="btn btn-primary text-lg px-8 py-4 animate-glow">
                    <Sparkles size={20} className="mr-2" />
                    Create Repository
                  </a>
                )}
                <a href="/explore" className="btn btn-secondary text-lg px-8 py-4">
                  <Globe size={20} className="mr-2" />
                  Explore Projects
                </a>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <div className="badge badge-primary text-lg px-4 py-2 animate-pulse">🔗 Polkadot Asset Hub</div>
                <div className="badge badge-secondary text-lg px-4 py-2">📦 IPFS Storage</div>
                <div className="badge badge-secondary text-lg px-4 py-2">🎨 NFT Authorship</div>
                <div className="badge badge-secondary text-lg px-4 py-2">💰 DOT Payments</div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose PolkaForge?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`card ${feature.bgColor} border-0 text-center hover:scale-105 transition-all duration-300 animate-fadeIn`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div
                    className={`w-16 h-16 rounded-full ${feature.bgColor} mx-auto mb-4 flex items-center justify-center`}
                  >
                    <feature.icon size={32} className={feature.color} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="opacity-80 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Navigation Tabs */}
          <section className="py-8">
            <div className="flex justify-center mb-8">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                      activeSection === section.id
                        ? "bg-[#e6007a] text-white shadow-lg"
                        : "hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <section.icon size={18} />
                    {section.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Sections */}
            {activeSection === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <StatsDashboard />
                </div>
                <div className="space-y-8">
                  <TrendingRepos />
                  <ActivityFeed />
                </div>
              </div>
            )}

            {activeSection === "repositories" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">All Repositories</h2>
                  {connected && (
                    <a href="/new" className="btn btn-primary">
                      <Sparkles size={16} className="mr-2" />
                      Create New
                    </a>
                  )}
                </div>
                <RepoList repos={repos} loading={loading} />
              </div>
            )}

            {activeSection === "activity" && (
              <div className="max-w-4xl mx-auto">
                <ActivityFeed />
              </div>
            )}
          </section>

          {/* Call to Action */}
          <section className="py-16 text-center">
            <div className="card bg-gradient-to-r from-[#e6007a] to-[#552bbf] text-white border-0 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Ready to Build the Future?</h2>
              <p className="text-xl opacity-90 mb-8">
                Join the decentralized development revolution on Polkadot. Create, collaborate, and earn with
                PolkaForge.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {!connected ? (
                  <button className="btn bg-white text-[#e6007a] hover:bg-gray-100 text-lg px-8 py-4" onClick={connect}>
                    <Zap size={20} className="mr-2" />
                    Get Started Now
                  </button>
                ) : (
                  <a href="/new" className="btn bg-white text-[#e6007a] hover:bg-gray-100 text-lg px-8 py-4">
                    <Rocket size={20} className="mr-2" />
                    Create Your First Repo
                  </a>
                )}
                <a href="/jobs" className="btn btn-secondary text-lg px-8 py-4">
                  <Globe size={20} className="mr-2" />
                  Browse Jobs
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useWallet } from "@/hooks/use-wallet"
import { Menu, Search, Plus, Code2, ChevronDown, Briefcase, MessageCircle, Wallet, Zap } from "lucide-react"

export default function Header() {
  const { account, accounts, connected, connecting, connect, disconnect, switchAccount, balance } = useWallet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <header className="header container">
        <div className="animate-pulse flex justify-between items-center w-full">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="header container animate-slideIn">
      <div className="flex items-center">
        <Link href="/" className="flex items-center gap-3 text-xl font-bold group">
          <div className="relative">
            <Code2 size={28} className="text-[#e6007a] animate-float" />
            <div className="absolute -inset-1 bg-gradient-to-r from-[#e6007a] to-[#552bbf] rounded-full opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
          </div>
          <span className="gradient-text">PolkaForge</span>
        </Link>
        <nav className="hidden md:flex ml-8 gap-6">
          <Link href="/explore" className="hover:text-[#e6007a] transition-colors duration-300 relative group">
            Explore
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#e6007a] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/jobs"
            className="hover:text-[#e6007a] transition-colors duration-300 flex items-center gap-1 relative group"
          >
            <Briefcase size={16} />
            Jobs
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#e6007a] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/chat"
            className="hover:text-[#e6007a] transition-colors duration-300 flex items-center gap-1 relative group"
          >
            <MessageCircle size={16} />
            AI Chat
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#e6007a] transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>
      </div>

      <div className="hidden md:flex items-center gap-4">
        <div className="relative group">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50 transition-opacity group-focus-within:opacity-100"
          />
          <input
            type="text"
            placeholder="Search repositories..."
            className="pl-10 pr-4 py-2 rounded-full bg-transparent border border-current/20 focus:outline-none focus:border-[#e6007a] focus:ring-2 focus:ring-[#e6007a]/20 transition-all duration-300 w-64"
          />
        </div>

        {connected ? (
          <div className="flex items-center gap-3 animate-fadeIn">
            <Link href="/new" className="btn btn-primary group">
              <Plus size={16} className="mr-1 group-hover:rotate-90 transition-transform duration-300" />
              New
            </Link>

            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group glass"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e6007a] to-[#552bbf] flex items-center justify-center text-white text-sm font-bold animate-glow">
                    {account?.meta.name?.substring(0, 1) || account?.address.substring(0, 1)}
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">
                    {account?.meta.name ||
                      `${account?.address.substring(0, 6)}...${account?.address.substring(account?.address.length - 4)}`}
                  </div>
                  <div className="text-xs opacity-70 flex items-center gap-1">
                    <Zap size={12} className="text-yellow-500" />
                    {Number.parseFloat(balance).toFixed(2)} DOT
                  </div>
                </div>
                <ChevronDown size={16} className="group-hover:rotate-180 transition-transform duration-300" />
              </button>

              {accountMenuOpen && (
                <div className="absolute top-16 right-0 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-3 z-50 min-w-80 glass animate-fadeIn">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                    <div className="text-sm font-medium px-3 py-1 flex items-center gap-2">
                      <Wallet size={16} className="text-[#e6007a]" />
                      Connected Accounts
                    </div>
                  </div>

                  {accounts.map((acc) => (
                    <button
                      key={acc.address}
                      onClick={() => {
                        switchAccount(acc)
                        setAccountMenuOpen(false)
                      }}
                      className={`w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 ${
                        acc.address === account?.address ? "bg-gray-100 dark:bg-gray-700 ring-2 ring-[#e6007a]/20" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e6007a] to-[#552bbf] flex items-center justify-center text-white text-xs">
                          {acc.meta.name?.substring(0, 1) || acc.address.substring(0, 1)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {acc.meta.name ||
                              `${acc.address.substring(0, 8)}...${acc.address.substring(acc.address.length - 4)}`}
                          </div>
                          <div className="text-xs opacity-70">{acc.address}</div>
                        </div>
                      </div>
                    </button>
                  ))}

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <button
                      onClick={() => {
                        disconnect()
                        setAccountMenuOpen(false)
                      }}
                      className="w-full text-left p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-all duration-300"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button onClick={connect} disabled={connecting} className="btn btn-primary group">
            {connecting ? (
              <>
                <div className="loading-dots mr-2">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                Connecting...
              </>
            ) : (
              <>
                <Wallet size={16} className="mr-2 group-hover:animate-bounce" />
                Connect Wallet
              </>
            )}
          </button>
        )}
      </div>

      <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        <Menu size={24} />
      </button>

      {mobileMenuOpen && (
        <div className="absolute top-20 right-4 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-4 z-50 md:hidden glass animate-fadeIn">
          <nav className="flex flex-col gap-3">
            <Link href="/explore" className="hover:text-[#e6007a] transition-colors">
              Explore
            </Link>
            <Link href="/jobs" className="hover:text-[#e6007a] transition-colors">
              Jobs
            </Link>
            <Link href="/chat" className="hover:text-[#e6007a] transition-colors">
              AI Chat
            </Link>
            {connected ? (
              <>
                <Link href="/new" className="hover:text-[#e6007a] transition-colors">
                  New Repository
                </Link>
                <button onClick={disconnect} className="text-left hover:text-[#e6007a] transition-colors">
                  Disconnect
                </button>
              </>
            ) : (
              <button onClick={connect} className="text-left hover:text-[#e6007a] transition-colors">
                Connect Wallet
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

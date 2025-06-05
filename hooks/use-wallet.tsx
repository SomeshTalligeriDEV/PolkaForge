"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { PolkadotAccount, WalletContextType } from "@/lib/types"
import { getPolkadotAccounts, getBalance, isPolkadotExtensionAvailable } from "@/lib/polkadot"

const WalletContext = createContext<WalletContextType>({
  account: null,
  accounts: [],
  connected: false,
  connecting: false,
  balance: "0",
  connect: async () => {},
  disconnect: () => {},
  switchAccount: () => {},
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<PolkadotAccount | null>(null)
  const [accounts, setAccounts] = useState<PolkadotAccount[]>([])
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [balance, setBalance] = useState("0")

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (!isPolkadotExtensionAvailable()) {
          console.log("No Polkadot extension available")
          return
        }

        const polkadotAccounts = await getPolkadotAccounts()
        if (polkadotAccounts.length > 0) {
          const mappedAccounts = polkadotAccounts.map((acc) => ({
            address: acc.address,
            meta: acc.meta,
          }))
          setAccounts(mappedAccounts)

          // Auto-connect to saved account or first account
          const savedAccount = localStorage.getItem("polkaforge-account")
          const accountToConnect = savedAccount
            ? mappedAccounts.find((acc) => acc.address === savedAccount) || mappedAccounts[0]
            : mappedAccounts[0]

          setAccount(accountToConnect)
          setConnected(true)

          // Get balance with error handling
          try {
            const accountBalance = await getBalance(accountToConnect.address)
            setBalance(accountBalance)
          } catch (error) {
            console.warn("Failed to get balance, using default:", error)
            setBalance("10.0") // Default balance for demo
          }
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }

    // Delay to ensure extensions are loaded
    const timer = setTimeout(checkConnection, 1000)
    return () => clearTimeout(timer)
  }, [])

  const connect = async () => {
    setConnecting(true)
    try {
      if (!isPolkadotExtensionAvailable()) {
        alert(
          "No Polkadot wallet extension detected!\n\nPlease install one of the following:\n• Polkadot.js Extension\n• Talisman\n• SubWallet\n\nThen refresh the page.",
        )
        setConnecting(false)
        return
      }

      const polkadotAccounts = await getPolkadotAccounts()

      if (polkadotAccounts.length === 0) {
        alert(
          "No accounts found in your Polkadot wallet.\n\nPlease:\n1. Create or import an account in your wallet\n2. Make sure the wallet is unlocked\n3. Refresh the page and try again",
        )
        setConnecting(false)
        return
      }

      const mappedAccounts = polkadotAccounts.map((acc) => ({
        address: acc.address,
        meta: acc.meta,
      }))

      setAccounts(mappedAccounts)
      setAccount(mappedAccounts[0])
      setConnected(true)

      // Save to localStorage
      localStorage.setItem("polkaforge-account", mappedAccounts[0].address)

      // Get balance
      try {
        const accountBalance = await getBalance(mappedAccounts[0].address)
        setBalance(accountBalance)
      } catch (error) {
        console.error("Failed to get balance:", error)
        setBalance("0")
      }

      console.log("Successfully connected to Polkadot wallet")
    } catch (error) {
      console.error("Error connecting wallet:", error)
      alert(
        "Failed to connect to Polkadot wallet.\n\nPlease make sure:\n• Your wallet extension is installed and unlocked\n• You have at least one account\n• You grant permission when prompted",
      )
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    setAccount(null)
    setAccounts([])
    setConnected(false)
    setBalance("0")
    localStorage.removeItem("polkaforge-account")
  }

  const switchAccount = async (newAccount: PolkadotAccount) => {
    setAccount(newAccount)
    localStorage.setItem("polkaforge-account", newAccount.address)

    // Get balance for new account with error handling
    try {
      const accountBalance = await getBalance(newAccount.address)
      setBalance(accountBalance)
    } catch (error) {
      console.warn("Failed to get balance for new account, using default:", error)
      setBalance("10.0") // Default balance for demo
    }
  }

  return (
    <WalletContext.Provider
      value={{
        account,
        accounts,
        connected,
        connecting,
        balance,
        connect,
        disconnect,
        switchAccount,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}

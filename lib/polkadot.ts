import { ApiPromise, WsProvider } from "@polkadot/api"
import { web3Accounts, web3Enable, web3FromAddress } from "@polkadot/extension-dapp"
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types"

let api: ApiPromise | null = null
let connectionAttempts = 0
const MAX_CONNECTION_ATTEMPTS = 3

// Fallback RPC endpoints
const RPC_ENDPOINTS = [
  "wss://rpc.polkadot.io",
  "wss://polkadot-rpc.dwellir.com",
  "wss://polkadot.api.onfinality.io/public-ws",
]

export async function connectToPolkadot(): Promise<ApiPromise | null> {
  if (api && api.isConnected) return api

  // Skip connection in development/demo mode
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    console.log("Development mode: Skipping Polkadot connection")
    return null
  }

  for (const endpoint of RPC_ENDPOINTS) {
    try {
      connectionAttempts++
      console.log(`Attempting to connect to ${endpoint} (attempt ${connectionAttempts})`)

      const wsProvider = new WsProvider(endpoint, 1000) // 1 second timeout
      api = await Promise.race([
        ApiPromise.create({ provider: wsProvider }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 5000)),
      ])

      if (api && api.isConnected) {
        console.log(`Successfully connected to ${endpoint}`)
        return api
      }
    } catch (error) {
      console.warn(`Failed to connect to ${endpoint}:`, error)
      if (api) {
        try {
          await api.disconnect()
        } catch (disconnectError) {
          console.warn("Error disconnecting:", disconnectError)
        }
        api = null
      }
    }
  }

  console.error("Failed to connect to any Polkadot endpoint")
  return null
}

export async function enablePolkadotExtension(): Promise<boolean> {
  try {
    if (typeof window === "undefined") return false

    const extensions = await web3Enable("PolkaForge")
    if (extensions.length === 0) {
      console.log("No Polkadot extensions found")
      return false
    }

    console.log(
      "Found extensions:",
      extensions.map((ext) => ext.name),
    )
    return true
  } catch (error) {
    console.error("Failed to enable Polkadot extension:", error)
    return false
  }
}

export async function getPolkadotAccounts(): Promise<InjectedAccountWithMeta[]> {
  try {
    const enabled = await enablePolkadotExtension()
    if (!enabled) {
      throw new Error("No Polkadot extension available")
    }

    const accounts = await web3Accounts()
    console.log("Found accounts:", accounts.length)
    return accounts
  } catch (error) {
    console.error("Failed to get accounts:", error)
    return []
  }
}

export async function transferDOT(fromAddress: string, toAddress: string, amount: string): Promise<string> {
  try {
    // In development mode, simulate the transfer
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      console.log(`Simulating DOT transfer: ${amount} DOT from ${fromAddress} to ${toAddress}`)
      return `0x${Math.random().toString(16).substring(2, 66)}`
    }

    const api = await connectToPolkadot()
    if (!api) {
      throw new Error("Unable to connect to Polkadot network")
    }

    const injector = await web3FromAddress(fromAddress)
    const value = api.createType("Balance", Number.parseFloat(amount) * Math.pow(10, 10))
    const transfer = api.tx.balances.transfer(toAddress, value)
    const hash = await transfer.signAndSend(fromAddress, { signer: injector.signer })

    return hash.toString()
  } catch (error) {
    console.error("Transfer failed:", error)
    throw error
  }
}

export async function getBalance(address: string): Promise<string> {
  try {
    // In development mode, return mock balance
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      const mockBalances = ["12.5", "25.0", "50.0", "100.0", "5.25"]
      const hash = address.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
      return mockBalances[hash % mockBalances.length]
    }

    const api = await connectToPolkadot()
    if (!api) {
      console.warn("Unable to connect to Polkadot network, returning mock balance")
      return "10.0"
    }

    const { data: balance } = await api.query.system.account(address)
    const dotBalance = balance.free.toBn().div(api.createType("Balance", Math.pow(10, 10).toString()).toBn())
    return dotBalance.toString()
  } catch (error) {
    console.error("Failed to get balance:", error)
    return "0"
  }
}

export function isPolkadotExtensionAvailable(): boolean {
  if (typeof window === "undefined") return false

  return !!(
    window.injectedWeb3 &&
    (window.injectedWeb3["polkadot-js"] ||
      window.injectedWeb3["talisman"] ||
      window.injectedWeb3["subwallet-js"] ||
      window.injectedWeb3["nova"])
  )
}

// Cleanup function to disconnect API
export async function disconnectPolkadot(): Promise<void> {
  if (api) {
    try {
      await api.disconnect()
      api = null
      console.log("Disconnected from Polkadot")
    } catch (error) {
      console.error("Error disconnecting from Polkadot:", error)
    }
  }
}

// Check connection status
export function isConnected(): boolean {
  return api ? api.isConnected : false
}

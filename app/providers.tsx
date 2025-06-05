"use client"

import type { ReactNode } from "react"
import { WalletProvider } from "@/hooks/use-wallet"

export function Providers({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>
}

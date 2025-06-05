"use client"

import { useState, useEffect } from "react"
import { WifiOff, Globe } from "lucide-react"

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    // Check if we're in demo mode (localhost)
    const demoMode = typeof window !== "undefined" && window.location.hostname === "localhost"
    setIsDemoMode(demoMode)

    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  if (isDemoMode) {
    return (
      <div className="fixed top-4 right-4 z-50 animate-fadeIn">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
          <Globe size={16} className="animate-pulse" />
          Demo Mode
        </div>
      </div>
    )
  }

  if (!isOnline) {
    return (
      <div className="fixed top-4 right-4 z-50 animate-fadeIn">
        <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
          <WifiOff size={16} className="animate-pulse" />
          Offline Mode
        </div>
      </div>
    )
  }

  return null
}

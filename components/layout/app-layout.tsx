"use client"

import { useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { startLiveUpdates, isLiveMode } = useAppStore()

  useEffect(() => {
    if (isLiveMode) {
      startLiveUpdates()
    }
    
    return () => {
      // Cleanup handled by store
    }
  }, [isLiveMode, startLiveUpdates])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

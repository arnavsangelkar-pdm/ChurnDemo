"use client"

import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

export function Header() {
  const { user, logout, isLiveMode, setLiveMode } = useAppStore()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            isLiveMode ? "bg-green-500 animate-pulse" : "bg-gray-400"
          )} />
          <span className="text-sm text-muted-foreground">
            {isLiveMode ? "Live Mode" : "Paused"}
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLiveMode(!isLiveMode)}
        >
          {isLiveMode ? "Pause" : "Resume"} Updates
        </Button>
        
        
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{user?.name}</span>
        </div>
        
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

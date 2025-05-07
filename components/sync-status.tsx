"use client"

import { Wifi, WifiOff } from "lucide-react"
import { useTaskStore } from "@/lib/stores/task-store"

interface SyncStatusProps {
  isOnline: boolean
}

export function SyncStatus({ isOnline }: SyncStatusProps) {
  const { pendingSync } = useTaskStore()
  const hasPendingChanges = pendingSync > 0

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-medium shadow-lg">
      {isOnline ? (
        <>
          <Wifi className="h-3.5 w-3.5 text-green-500" />
          {hasPendingChanges ? <span>Syncing {pendingSync} changes...</span> : <span>Online</span>}
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5 text-yellow-500" />
          <span>Offline Mode</span>
        </>
      )}
    </div>
  )
}

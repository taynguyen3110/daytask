"use client";

import { GitMerge, RefreshCcw, Wifi, WifiOff } from "lucide-react";
import { useTaskStore } from "@/lib/stores/task-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useEffect } from "react";

interface SyncStatusProps {
  isOnline: boolean;
}

export function SyncStatus({ isOnline }: SyncStatusProps) {
  const { pendingSync } = useTaskStore();
  const { setSyncData, isAuthenticated, syncData, mergeData } = useAuthStore();
  const hasPendingChanges = pendingSync.length > 0;

  useEffect(() => {
    if (isOnline && isAuthenticated && hasPendingChanges) {
      setSyncData(true);
    }
  }, [isOnline]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-medium shadow-lg">
      {isAuthenticated &&
        (isOnline ? (
          <>
            {hasPendingChanges && syncData ? (
              <>
                <RefreshCcw className="animate-spin text-blue-500" size={16} />
                <span>Syncing {pendingSync.length} changes...</span>
              </>
            ) : mergeData ? (
              <>
                <GitMerge className="text-yellow-500" size={16} />
                <span>Merging changes...</span>
              </>
            ) : (
              <>
                <Wifi className="h-3.5 w-3.5 text-green-500" />
                <span>Online</span>
              </>
            )}
          </>
        ) : (
          <>
            <WifiOff className="h-3.5 w-3.5 text-yellow-500" />
            <span>Offline Mode</span>
          </>
        ))}
    </div>
  );
}

"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layouts/sidebar";
import { MobileHeader } from "@/components/layouts/mobile-header";
import { SyncStatus } from "@/components/sync-status";
import { useTaskStore } from "@/lib/stores/task-store";
import { useNetworkStatus } from "@/lib/hooks/use-network-status";
import { useAuthStore } from "@/lib/stores/auth-store";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isOnline } = useNetworkStatus();
  const { syncTasks, mergeTasks, fetchTasks } = useTaskStore();
  const { syncData, mergeData, setSyncData, setMergeData } = useAuthStore();

  useEffect(() => {
    useAuthStore.getState().initialize();
    fetchTasks();
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Merge tasks when logining in
  useEffect(() => {
    if (mergeData) {
      console.log("Merging tasks...");
      (async () => {
        await mergeTasks();
        console.log("Done...");
        setMergeData(false);
      })();
    }
  }, [mergeData]);

  // Sync tasks when coming back online
  useEffect(() => {
    if (syncData) {
      console.log("Syncing tasks...");
      (async () => {
        await syncTasks();
        console.log("Done...");
        setSyncData(false);
      })();
    }
  }, [syncData]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
        <SyncStatus isOnline={isOnline} />
      </div>
    </div>
  );
}

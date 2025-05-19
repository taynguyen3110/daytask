"use client";

import { useState, useEffect } from "react";
import { useNetworkStatus } from "./use-network-status";
import { useAuthStore } from "../stores/auth-store";
import { User } from "../types";

export function useMode() {
  const [userMode, setUserMode] = useState<"offline-user" | "online-user">("online-user");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const { isAuthenticated, user } = useAuthStore();
    const { isOnline } = useNetworkStatus();

    if (isAuthenticated && isOnline) {
      setUserMode("online-user");
      setCurrentUser(user!);
    } else if (!isOnline && isAuthenticated) {
      setUserMode("offline-user");
    }
  }, []);

  return { userMode, currentUser };
}

"use client";

import { useState, useEffect } from "react";
import { useNetworkStatus } from "./use-network-status";
import { useAuthStore } from "../stores/auth-store";
import { User, UserMode } from "../types";

export function useMode() {
  const [userMode, setUserMode] = useState<UserMode>("online-user");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { isAuthenticated, user } = useAuthStore();
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    if (isAuthenticated && isOnline) {
      setUserMode("online-user");
      setCurrentUser(user!);
    } else if (!isOnline && isAuthenticated) {
      setUserMode("offline-user");
    }
  }, [isAuthenticated, isOnline, user]);

  return { userMode, currentUser };
}

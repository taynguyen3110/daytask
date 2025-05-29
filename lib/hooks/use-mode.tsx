"use client";

import { useState, useEffect } from "react";
import { useNetworkStatus } from "./use-network-status";
import { useAuthStore } from "../stores/auth-store";
import { User, UserMode } from "../types";

export function useMode() {
  const [userMode, setUserMode] = useState<UserMode>("guest");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { isAuthenticated, user } = useAuthStore();
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    if (isAuthenticated && isOnline) {
      setUserMode("online-user");
      setCurrentUser(user!);
      console.log("online user");
    } else if (!isOnline && isAuthenticated) {
      console.log("offline user");
      setUserMode("offline-user");
    } else {
      setUserMode("guest");
      setCurrentUser(null);
      console.log("guest user");
    }
  }, [isAuthenticated, isOnline, user]);

  return { userMode, currentUser };
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  CheckSquare,
  Settings,
  MessageSquare,
  StickyNote,
  X,
  Moon,
  Sun,
  LogIn,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "../ui/use-toast";
import { useTaskStore } from "@/lib/stores/task-store";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, logout } = useAuthStore();
  const { removeLocalTasks } = useTaskStore();

  // Ensure the component is mounted before rendering theme-dependent content
  useEffect(() => {
    setMounted(true);
  }, []);

  const routes = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: CheckSquare,
    },
    {
      name: "Notes",
      path: "/notes",
      icon: StickyNote,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
    {
      name: "Feedback",
      path: "/feedback",
      icon: MessageSquare,
    },
  ];

  const handleLogout = async () => {
    try {
      await removeLocalTasks(); // Clear local tasks before logout
      await logout();
      toast({
        title: "You are now logged out!",
        description: "Login to sync your tasks to your account.",
        duration: 5000,
        variant: "info",
      });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-card p-4 shadow-lg transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="mt-3 ml-3">
            {mounted &&
              (theme === "dark" ? (
                <Image
                  src="/logoDark.png"
                  height={28}
                  width={107}
                  alt="DayTask Logo"
                />
              ) : (
                <Image
                  src="/logoLight.png"
                  height={28}
                  width={107}
                  alt="DayTask Logo"
                />
              ))}
          </div>
          {/* <h1 className="text-xl font-bold text-primary">DayTask</h1> */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-8 space-y-1">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === route.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <route.icon className="mr-3 h-5 w-5" />
              {route.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          {isAuthenticated ? (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/login")}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}

          {mounted && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark Mode
                </>
              )}
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}

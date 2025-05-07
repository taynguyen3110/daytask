"use client"

import { useState, useCallback } from "react"
import { useSettingsStore } from "@/lib/stores/settings-store"

export function useConfetti() {
  const { settings } = useSettingsStore()
  const [isActive, setIsActive] = useState(false)

  const showConfetti = useCallback(() => {
    if (settings.showConfetti) {
      setIsActive(true)
      setTimeout(() => setIsActive(false), 3000)
    }
  }, [settings.showConfetti])

  const ConfettiComponent = isActive ? (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 100 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-5%",
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 10}px`,
            backgroundColor: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ff8000", "#8000ff"][
              Math.floor(Math.random() * 8)
            ],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${Math.random() * 3 + 2}s`,
          }}
        />
      ))}
    </div>
  ) : null

  return { showConfetti, ConfettiComponent }
}

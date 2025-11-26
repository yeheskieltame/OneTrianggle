"use client"

import { cn } from "@/lib/utils"
import { FactionIcon } from "@/components/faction-icons"

interface FactionCardProps {
  faction: "rock" | "paper" | "scissors"
  label: string
  percentage: number
  score: number
  isSelected: boolean
  onClick: () => void
  tvl?: number
}

const factionConfig = {
  rock: {
    color: "text-rock",
    bg: "bg-rock/10",
    border: "border-rock/50",
    glow: "shadow-[0_0_30px_oklch(0.6_0.2_25/0.3)]",
  },
  paper: {
    color: "text-paper",
    bg: "bg-paper/10",
    border: "border-paper/50",
    glow: "shadow-[0_0_30px_oklch(0.7_0.18_145/0.3)]",
  },
  scissors: {
    color: "text-scissors",
    bg: "bg-scissors/10",
    border: "border-scissors/50",
    glow: "shadow-[0_0_30px_oklch(0.65_0.22_280/0.3)]",
  },
}

export function FactionCard({ faction, label, percentage, score, isSelected, onClick, tvl }: FactionCardProps) {
  const config = factionConfig[faction]

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 group w-full",
        config.bg,
        isSelected ? `${config.border} ${config.glow}` : "border-border hover:border-muted-foreground",
        isSelected && "scale-[1.02] sm:scale-105",
      )}
    >
      {/* Animated background */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 transition-opacity",
          config.bg,
          isSelected && "opacity-100 animate-pulse-glow",
        )}
      />

      <div className="relative z-10">
        <div
          className={cn(
            "w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-2xl flex items-center justify-center",
            config.bg,
            isSelected && "animate-float",
          )}
        >
          <FactionIcon
            faction={faction}
            className={cn("w-10 h-10 sm:w-14 sm:h-14", config.color)}
            glowing={isSelected}
          />
        </div>

        {/* Label */}
        <h3
          className={cn(
            "text-base sm:text-xl font-bold mb-2 transition-colors",
            isSelected ? config.color : "text-foreground",
          )}
        >
          {label}
        </h3>

        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
          {tvl !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">TVL</span>
              <span className={cn("font-mono font-bold", config.color)}>${(tvl / 1000).toFixed(0)}K</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dist</span>
            <span className={cn("font-mono font-bold", config.color)}>{percentage.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Score</span>
            <span
              className={cn(
                "font-mono font-bold",
                score > 0 ? "text-chart-3" : score < 0 ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {score > 0 ? "+" : ""}
              {score.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 sm:mt-4 h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", config.bg.replace("/10", ""))}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div
          className={cn(
            "absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold",
            config.bg.replace("/10", ""),
            "text-background",
          )}
        >
          ✓
        </div>
      )}
    </button>
  )
}

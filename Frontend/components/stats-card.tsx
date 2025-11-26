"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string
  trend?: string
  className?: string
}

export function StatsCard({ icon: Icon, label, value, trend, className }: StatsCardProps) {
  return (
    <div
      className={cn("p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-border bg-card/50 backdrop-blur-sm", className)}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{label}</span>
      </div>
      <div className="flex items-end justify-between gap-1">
        <span className="text-lg sm:text-2xl font-bold font-mono">{value}</span>
        {trend && <span className="text-xs sm:text-sm text-chart-3 font-medium shrink-0">{trend}</span>}
      </div>
    </div>
  )
}

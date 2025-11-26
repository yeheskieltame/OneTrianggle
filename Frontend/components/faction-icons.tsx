"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface FactionIconProps {
  className?: string
  glowing?: boolean
}

export function RockIcon({ className, glowing }: FactionIconProps) {
  return (
    <div className={cn("relative", className)}>
      <Image
        src="/Rock.png"
        alt="Rock"
        width={100}
        height={100}
        className={cn(
          "object-contain transition-all duration-300",
          glowing && "drop-shadow-[0_0_15px_oklch(0.6_0.2_25)]"
        )}
      />
    </div>
  )
}

export function PaperIcon({ className, glowing }: FactionIconProps) {
  return (
    <div className={cn("relative", className)}>
      <Image
        src="/Paper.png"
        alt="Paper"
        width={100}
        height={100}
        className={cn(
          "object-contain transition-all duration-300",
          glowing && "drop-shadow-[0_0_15px_oklch(0.7_0.18_145)]"
        )}
      />
    </div>
  )
}

export function ScissorsIcon({ className, glowing }: FactionIconProps) {
  return (
    <div className={cn("relative", className)}>
      <Image
        src="/Scissors.png"
        alt="Scissors"
        width={100}
        height={100}
        className={cn(
          "object-contain transition-all duration-300",
          glowing && "drop-shadow-[0_0_15px_oklch(0.65_0.22_280)]"
        )}
      />
    </div>
  )
}

export function FactionIcon({
  faction,
  className,
  glowing,
}: {
  faction: "rock" | "paper" | "scissors"
  className?: string
  glowing?: boolean
}) {
  switch (faction) {
    case "rock":
      return <RockIcon className={className} glowing={glowing} />
    case "paper":
      return <PaperIcon className={className} glowing={glowing} />
    case "scissors":
      return <ScissorsIcon className={className} glowing={glowing} />
  }
}

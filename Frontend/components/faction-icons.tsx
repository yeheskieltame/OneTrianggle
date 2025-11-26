"use client"

import { cn } from "@/lib/utils"

interface FactionIconProps {
  className?: string
  glowing?: boolean
}

export function RockIcon({ className, glowing }: FactionIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("transition-all duration-300", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Glow effect */}
      {glowing && (
        <defs>
          <filter id="rock-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      <g filter={glowing ? "url(#rock-glow)" : undefined}>
        {/* Fist shape - anime style */}
        <path
          d="M30 65 L25 45 Q23 35 30 30 L35 28 Q40 25 45 28 L48 30 Q50 28 55 28 L60 30 Q65 28 70 32 L72 38 Q78 42 75 55 L73 65 Q72 75 65 78 L35 78 Q28 75 30 65Z"
          fill="url(#rock-gradient)"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-rock"
        />
        {/* Knuckle details */}
        <path d="M35 45 Q38 42 42 45" stroke="currentColor" strokeWidth="2" className="text-rock/70" fill="none" />
        <path d="M48 43 Q51 40 55 43" stroke="currentColor" strokeWidth="2" className="text-rock/70" fill="none" />
        <path d="M61 45 Q64 42 67 46" stroke="currentColor" strokeWidth="2" className="text-rock/70" fill="none" />
        {/* Highlight */}
        <ellipse cx="40" cy="55" rx="8" ry="5" fill="currentColor" className="text-rock/20" />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="rock-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.7 0.15 25)" />
            <stop offset="100%" stopColor="oklch(0.5 0.2 25)" />
          </linearGradient>
        </defs>
      </g>
    </svg>
  )
}

export function PaperIcon({ className, glowing }: FactionIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("transition-all duration-300", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {glowing && (
        <defs>
          <filter id="paper-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      <g filter={glowing ? "url(#paper-glow)" : undefined}>
        {/* Open palm - anime style */}
        <path
          d="M25 75 L28 50 Q25 35 30 25 L33 20 Q38 18 42 22 L44 30 Q45 25 48 20 L52 18 Q56 17 58 22 L60 32 Q62 25 66 22 L70 20 Q75 19 76 25 L77 38 Q80 32 83 30 Q87 30 88 35 L85 55 Q84 70 75 78 L30 78 Q22 75 25 75Z"
          fill="url(#paper-gradient)"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-paper"
        />
        {/* Finger lines */}
        <path d="M33 50 L33 28" stroke="currentColor" strokeWidth="1.5" className="text-paper/50" />
        <path d="M52 48 L52 22" stroke="currentColor" strokeWidth="1.5" className="text-paper/50" />
        <path d="M70 50 L70 25" stroke="currentColor" strokeWidth="1.5" className="text-paper/50" />
        <path d="M83 52 L83 38" stroke="currentColor" strokeWidth="1.5" className="text-paper/50" />
        {/* Highlight */}
        <ellipse cx="55" cy="55" rx="12" ry="6" fill="currentColor" className="text-paper/20" />
        <defs>
          <linearGradient id="paper-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.8 0.15 145)" />
            <stop offset="100%" stopColor="oklch(0.6 0.18 145)" />
          </linearGradient>
        </defs>
      </g>
    </svg>
  )
}

export function ScissorsIcon({ className, glowing }: FactionIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("transition-all duration-300", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {glowing && (
        <defs>
          <filter id="scissors-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      <g filter={glowing ? "url(#scissors-glow)" : undefined}>
        {/* V-sign fingers - anime style */}
        <path
          d="M25 78 L30 55 Q28 45 32 35 L38 18 Q42 12 48 15 L50 20 Q52 12 58 15 L65 18 Q70 22 68 35 L62 55 Q65 60 60 70 L55 78 Q50 82 45 78 L25 78Z"
          fill="url(#scissors-gradient)"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-scissors"
        />
        {/* Finger separation */}
        <path d="M44 55 L44 22" stroke="currentColor" strokeWidth="2" className="text-scissors/60" />
        <path d="M56 55 L56 22" stroke="currentColor" strokeWidth="2" className="text-scissors/60" />
        {/* Folded fingers */}
        <path
          d="M30 78 L28 68 Q26 62 30 58 Q35 55 40 60 L42 68"
          fill="url(#scissors-gradient)"
          stroke="currentColor"
          strokeWidth="2"
          className="text-scissors"
        />
        {/* Highlight */}
        <ellipse cx="50" cy="45" rx="6" ry="10" fill="currentColor" className="text-scissors/15" />
        <defs>
          <linearGradient id="scissors-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.75 0.18 280)" />
            <stop offset="100%" stopColor="oklch(0.55 0.22 280)" />
          </linearGradient>
        </defs>
      </g>
    </svg>
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

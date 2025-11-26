"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"

interface AudioContextType {
  isPlaying: boolean
  isMuted: boolean
  hasInteracted: boolean
  togglePlay: () => void
  toggleMute: () => void
  setHasInteracted: (value: boolean) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedMusicPreference = localStorage.getItem("music-enabled")
    const savedInteracted = localStorage.getItem("music-interacted")

    if (savedInteracted === "true") {
      setHasInteracted(true)
      if (savedMusicPreference === "true") {
        setIsPlaying(true)
      }
    }
  }, [])

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/musik.mp3")
      audioRef.current.loop = true
      audioRef.current.volume = 0.5 // Set volume to 50%
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Handle play/pause based on isPlaying state
  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying && !isMuted) {
      audioRef.current.play().catch((err) => {
        console.log("Audio play failed:", err)
      })
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, isMuted])

  const togglePlay = () => {
    const newState = !isPlaying
    setIsPlaying(newState)
    localStorage.setItem("music-enabled", String(newState))
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isMuted,
        hasInteracted,
        togglePlay,
        toggleMute,
        setHasInteracted,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}

"use client"

import { useEffect, useState } from "react"
import { useAudio } from "@/contexts/audio-context"
import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MusicModal() {
  const { hasInteracted, setHasInteracted, togglePlay } = useAudio()
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Show modal after a short delay if user hasn't interacted
    if (!hasInteracted) {
      const timer = setTimeout(() => {
        setShow(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [hasInteracted])

  const handleChoice = (playMusic: boolean) => {
    setHasInteracted(true)
    localStorage.setItem("music-interacted", "true")

    if (playMusic) {
      togglePlay()
    }

    setShow(false)
  }

  if (!show || hasInteracted) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative max-w-md mx-4 p-8 rounded-3xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/20 animate-in zoom-in-95 duration-500">
        {/* Glow effects */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent/30 rounded-full blur-3xl" />

        <div className="relative z-10 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <Volume2 className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold mb-3 glow-text-cyan">
            Epic Battle Awaits!
          </h2>

          {/* Description */}
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Enhance your gaming experience with immersive background music.
            Feel the adrenaline as you compete for victory!
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleChoice(true)}
              size="lg"
              className="flex-1 rounded-xl glow-cyan bg-primary hover:bg-primary/90"
            >
              <Volume2 className="w-5 h-5 mr-2" />
              Play Music
            </Button>
            <Button
              onClick={() => handleChoice(false)}
              size="lg"
              variant="outline"
              className="flex-1 rounded-xl border-border hover:border-primary/50"
            >
              <VolumeX className="w-5 h-5 mr-2" />
              Maybe Later
            </Button>
          </div>

          {/* Note */}
          <p className="text-xs text-muted-foreground mt-4">
            You can toggle music anytime from the navigation bar
          </p>
        </div>
      </div>
    </div>
  )
}

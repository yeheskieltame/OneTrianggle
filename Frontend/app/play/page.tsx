"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Navigation } from "@/components/navigation"
import { FactionCard } from "@/components/faction-card"
import { FactionIcon } from "@/components/faction-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, Clock, TrendingUp, History, Wallet, Calculator, Zap, DollarSign } from "lucide-react"

type Faction = "rock" | "paper" | "scissors"

interface EpochHistory {
  epoch: number
  winner: Faction
  yield: number
  rockPct: number
  paperPct: number
  scissorsPct: number
}

export default function PlayPage() {
  const { t } = useLanguage()
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [timeLeft, setTimeLeft] = useState(259200)

  const [distribution, setDistribution] = useState({
    rock: 35,
    paper: 40,
    scissors: 25,
  })

  const totalTVL = 2543890
  const epochYield = 5234

  const calculateScore = (faction: Faction) => {
    const { rock, paper, scissors } = distribution
    switch (faction) {
      case "rock":
        return scissors - paper
      case "paper":
        return rock - scissors
      case "scissors":
        return paper - rock
    }
  }

  const getWinner = () => {
    const scores = {
      rock: calculateScore("rock"),
      paper: calculateScore("paper"),
      scissors: calculateScore("scissors"),
    }
    return Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as Faction
  }

  const history: EpochHistory[] = [
    { epoch: 41, winner: "paper", yield: 4523, rockPct: 45, paperPct: 30, scissorsPct: 25 },
    { epoch: 40, winner: "scissors", yield: 3892, rockPct: 35, paperPct: 40, scissorsPct: 25 },
    { epoch: 39, winner: "rock", yield: 5124, rockPct: 25, paperPct: 35, scissorsPct: 40 },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 259200))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${d}d ${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const factionColor = {
    rock: "text-rock",
    paper: "text-paper",
    scissors: "text-scissors",
  }

  return (
    <main className="min-h-screen relative">
      <Navigation />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative pt-24 sm:pt-28 pb-16 sm:pb-20 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 glow-text-cyan">
              {t("play.title")}
            </h1>

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-6 text-sm sm:text-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-muted-foreground">{t("play.epoch")}:</span>
                <span className="font-bold font-mono">42</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-chart-3/10 border border-chart-3/30">
                <span className="text-chart-3 text-xs sm:text-sm font-medium">{t("play.depositPhase")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                <span className="text-muted-foreground">{t("play.timeLeft")}:</span>
                <span className="font-bold font-mono text-accent text-sm sm:text-base">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Mobile: Deposit Panel First */}
            <div className="lg:hidden space-y-4">
              {/* Quick Stats Bar */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-border bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Total TVL</div>
                    <div className="font-bold font-mono text-lg">${(totalTVL / 1000000).toFixed(2)}M</div>
                  </CardContent>
                </Card>
                <Card className="border-primary/30 bg-primary/5 backdrop-blur-sm">
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Epoch Yield</div>
                    <div className="font-bold font-mono text-lg text-primary">${(epochYield / 1000).toFixed(1)}K</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Left Column - Faction Selection */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Faction Cards */}
              <Card className="border-border bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <span className="text-xl sm:text-2xl">⚔️</span>
                    {t("play.selectFaction")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {(["rock", "paper", "scissors"] as Faction[]).map((faction) => (
                      <FactionCard
                        key={faction}
                        faction={faction}
                        label={t(`play.${faction}`)}
                        percentage={distribution[faction]}
                        score={calculateScore(faction)}
                        isSelected={selectedFaction === faction}
                        onClick={() => setSelectedFaction(faction)}
                        tvl={Math.round((totalTVL * distribution[faction]) / 100)}
                      />
                    ))}
                  </div>

                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-primary/10 border border-primary/30 text-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">Current Leader:</span>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <FactionIcon
                        faction={getWinner()}
                        className={`w-6 h-6 sm:w-8 sm:h-8 ${factionColor[getWinner()]}`}
                      />
                      <span className="text-base sm:text-lg font-bold text-primary">
                        {t(`play.${getWinner()}`)} (+{calculateScore(getWinner())}%)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    {t("play.formula")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">Score = %Target - %Predator</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 font-mono text-xs sm:text-sm">
                    <div className="p-3 sm:p-4 rounded-xl bg-rock/10 border border-rock/30">
                      <div className="flex items-center gap-2 text-rock font-bold mb-1 sm:mb-2">
                        <FactionIcon faction="rock" className="w-5 h-5 text-rock" />
                        <span className="hidden sm:inline">Rock Score</span>
                        <span className="sm:hidden">Rock</span>
                      </div>
                      <div className="text-muted-foreground text-[10px] sm:text-xs mb-1">= %Scissors - %Paper</div>
                      <div className="text-foreground">
                        = {distribution.scissors}% - {distribution.paper}% ={" "}
                        <span className={calculateScore("rock") >= 0 ? "text-chart-3" : "text-destructive"}>
                          {calculateScore("rock") > 0 ? "+" : ""}
                          {calculateScore("rock")}%
                        </span>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 rounded-xl bg-paper/10 border border-paper/30">
                      <div className="flex items-center gap-2 text-paper font-bold mb-1 sm:mb-2">
                        <FactionIcon faction="paper" className="w-5 h-5 text-paper" />
                        <span className="hidden sm:inline">Paper Score</span>
                        <span className="sm:hidden">Paper</span>
                      </div>
                      <div className="text-muted-foreground text-[10px] sm:text-xs mb-1">= %Rock - %Scissors</div>
                      <div className="text-foreground">
                        = {distribution.rock}% - {distribution.scissors}% ={" "}
                        <span className={calculateScore("paper") >= 0 ? "text-chart-3" : "text-destructive"}>
                          {calculateScore("paper") > 0 ? "+" : ""}
                          {calculateScore("paper")}%
                        </span>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 rounded-xl bg-scissors/10 border border-scissors/30">
                      <div className="flex items-center gap-2 text-scissors font-bold mb-1 sm:mb-2">
                        <FactionIcon faction="scissors" className="w-5 h-5 text-scissors" />
                        <span className="hidden sm:inline">Scissors Score</span>
                        <span className="sm:hidden">Scissors</span>
                      </div>
                      <div className="text-muted-foreground text-[10px] sm:text-xs mb-1">= %Paper - %Rock</div>
                      <div className="text-foreground">
                        = {distribution.paper}% - {distribution.rock}% ={" "}
                        <span className={calculateScore("scissors") >= 0 ? "text-chart-3" : "text-destructive"}>
                          {calculateScore("scissors") > 0 ? "+" : ""}
                          {calculateScore("scissors")}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* History - Mobile optimized */}
              <Card className="border-border bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <History className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    {t("play.history")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    {history.map((h) => (
                      <div
                        key={h.epoch}
                        className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-secondary/50 border border-border"
                      >
                        <div className="flex items-center gap-2 sm:gap-4">
                          <span className="text-muted-foreground font-mono text-xs sm:text-sm">#{h.epoch}</span>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <FactionIcon
                              faction={h.winner}
                              className={`w-6 h-6 sm:w-8 sm:h-8 ${factionColor[h.winner]}`}
                            />
                            <span className="font-bold capitalize text-sm sm:text-base hidden sm:inline">
                              {h.winner}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-chart-3 font-bold font-mono text-sm sm:text-base">
                            ${h.yield.toLocaleString()}
                          </div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            <span className="text-rock">{h.rockPct}%</span>
                            <span className="text-muted-foreground/50">|</span>
                            <span className="text-paper">{h.paperPct}%</span>
                            <span className="text-muted-foreground/50">|</span>
                            <span className="text-scissors">{h.scissorsPct}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Deposit Panel (Desktop) */}
            <div className="space-y-4 sm:space-y-6">
              {/* Vault Stats - Hidden on mobile (shown above) */}
              <Card className="hidden lg:block border-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-primary" />
                    {t("play.vault")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-secondary/50">
                    <span className="text-muted-foreground">{t("play.totalDeposited")}</span>
                    <div className="text-right">
                      <span className="font-bold font-mono text-xl">${totalTVL.toLocaleString()}</span>
                      <span className="text-muted-foreground ml-1">USDC</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-primary/10 border border-primary/30">
                    <span className="text-muted-foreground">{t("play.epochYield")}</span>
                    <div className="text-right">
                      <span className="font-bold font-mono text-xl text-primary">${epochYield.toLocaleString()}</span>
                      <span className="text-primary/70 ml-1">USDC</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deposit Form */}
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm glow-cyan">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    {t("play.deposit")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">USDC Balance</span>
                      <span className="font-mono">10,000.00 USDC</span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="pr-20 sm:pr-24 text-base sm:text-lg font-mono bg-secondary border-border"
                      />
                      <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => setDepositAmount("10000")}
                          className="text-xs text-primary font-medium hover:text-primary/80"
                        >
                          MAX
                        </button>
                        <span className="text-muted-foreground text-xs sm:text-sm">USDC</span>
                      </div>
                    </div>
                  </div>

                  {selectedFaction && (
                    <div className="p-3 sm:p-4 rounded-xl bg-secondary/50 space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Selected</span>
                        <span className="font-bold capitalize flex items-center gap-1.5">
                          <FactionIcon
                            faction={selectedFaction}
                            className={`w-4 h-4 ${factionColor[selectedFaction]}`}
                          />
                          {t(`play.${selectedFaction}`)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">{t("play.potentialYield")}</span>
                        <span className="font-mono text-chart-3">
                          ~${((Number.parseFloat(depositAmount) || 0) * (epochYield / totalTVL)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">If you lose</span>
                        <span className="font-mono">${(Number.parseFloat(depositAmount) || 0).toFixed(2)} (100%)</span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full rounded-xl text-base sm:text-lg py-5 sm:py-6 glow-cyan"
                    disabled={!selectedFaction || !depositAmount}
                  >
                    {t("play.depositBtn")}
                  </Button>

                  <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                    Principal is 100% protected. Only yield is at stake.
                  </p>
                </CardContent>
              </Card>

              {/* Your Position */}
              <Card className="border-border bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    {t("play.yourPosition")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <Wallet className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                    <p className="text-xs sm:text-sm">Connect wallet to view</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

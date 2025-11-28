"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { useContract } from "@/contexts/contract-context"
import { useDeposit, useWithdraw } from "@/hooks/use-contract-transactions"
import { useUserCoins } from "@/hooks/use-user-coins"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { Navigation } from "@/components/navigation"
import { FactionCard } from "@/components/faction-card"
import { FactionIcon } from "@/components/faction-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, Clock, TrendingUp, History, Wallet, Calculator, Zap, DollarSign } from "lucide-react"
import { u64ToNumber, formatUSDC } from "@/lib/onechain"
import { Faction, FACTION_REVERSE } from "@/types/contract"
import { toast } from "sonner"

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
  const { vault, userReceipts, isLoading: contractLoading, refetch } = useContract()
  const currentAccount = useCurrentAccount()
  const { deposit, isPending: isDepositing } = useDeposit()
  const { withdraw, isPending: isWithdrawing } = useWithdraw()
  const { coins, totalBalance, isLoading: coinsLoading, refetch: refetchCoins } = useUserCoins()

  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [timeLeft, setTimeLeft] = useState(0)

  // Calculate real-time values from vault state
  const currentEpoch = vault ? u64ToNumber(vault.current_epoch) : 0
  const epochEndTime = vault ? u64ToNumber(vault.epoch_end_time) : 0
  const rockPool = vault ? u64ToNumber(vault.rock_pool) : 0
  const paperPool = vault ? u64ToNumber(vault.paper_pool) : 0
  const scissorsPool = vault ? u64ToNumber(vault.scissors_pool) : 0
  const totalDeposited = rockPool + paperPool + scissorsPool
  const yieldPool = vault ? u64ToNumber(vault.yield_pool) : 0
  const totalTVL = totalDeposited

  // Calculate epoch yield (actual or estimated)
  const ESTIMATED_APY = 0.15 // 15% APY
  const EPOCH_DAYS = 3
  const estimatedEpochYield = totalTVL > 0 ? (totalTVL * ESTIMATED_APY * EPOCH_DAYS / 365) : 0
  const epochYield = yieldPool > 0 ? yieldPool : estimatedEpochYield

  // Calculate percentages
  const distribution = {
    rock: totalDeposited > 0 ? Math.round((rockPool / totalDeposited) * 100) : 33,
    paper: totalDeposited > 0 ? Math.round((paperPool / totalDeposited) * 100) : 33,
    scissors: totalDeposited > 0 ? Math.round((scissorsPool / totalDeposited) * 100) : 34,
  }

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

  // Calculate potential yield for user's deposit
  const calculatePotentialYield = (amount: number, faction: Faction | null): number => {
    if (!amount || !faction) return 0

    // Get faction pool after user deposit
    const factionPoolMap = { rock: rockPool, paper: paperPool, scissors: scissorsPool }
    const currentFactionPool = factionPoolMap[faction]
    const amountInBaseUnits = amount * 1_000_000
    const newFactionPool = currentFactionPool + amountInBaseUnits
    const newTotalTVL = totalTVL + amountInBaseUnits

    // Calculate potential epoch yield (projected if currently 0)
    const projectedEpochYield = yieldPool > 0 
      ? yieldPool 
      : (newTotalTVL * ESTIMATED_APY * EPOCH_DAYS / 365)

    if (projectedEpochYield === 0) return 0

    // Calculate new distribution with user's deposit
    const newDistribution = {
      rock: faction === "rock" ? newFactionPool : rockPool,
      paper: faction === "paper" ? newFactionPool : paperPool,
      scissors: faction === "scissors" ? newFactionPool : scissorsPool,
    }

    const newDistributionPct = {
      rock: Math.round((newDistribution.rock / newTotalTVL) * 100),
      paper: Math.round((newDistribution.paper / newTotalTVL) * 100),
      scissors: Math.round((newDistribution.scissors / newTotalTVL) * 100),
    }

    // Calculate score with new distribution
    const calculateScoreWithNew = (f: Faction) => {
      const { rock, paper, scissors } = newDistributionPct
      switch (f) {
        case "rock": return scissors - paper
        case "paper": return rock - scissors
        case "scissors": return paper - rock
      }
    }

    const userScore = calculateScoreWithNew(faction)

    // If user faction would win (score > 0), calculate proportional yield
    if (userScore > 0) {
      // User gets proportional share of total yield based on their contribution to winning faction
      const userShare = amountInBaseUnits / newFactionPool
      return (userShare * projectedEpochYield) / 1_000_000
    }

    return 0
  }

  // TODO: Fetch real history from blockchain events
  const history: EpochHistory[] = []

  // Real-time countdown from blockchain epoch end time
  useEffect(() => {
    const updateTime = () => {
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((epochEndTime - now) / 1000))
      setTimeLeft(remaining)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [epochEndTime])

  // Withdrawable receipts (from previous epoch)
  const withdrawableReceipts = userReceipts.filter(
    (r) => u64ToNumber(r.epoch_id) === currentEpoch - 1
  )

  // Handle deposit
  const handleDeposit = async () => {
    if (!selectedFaction || !depositAmount || !currentAccount || coins.length === 0) {
      return
    }

    // Check if epoch has ended
    const now = Date.now()
    if (now >= epochEndTime) {
      toast.error('Epoch has ended! Please wait for settlement before depositing.')
      return
    }

    // depositAmount is already in base units, no conversion needed
    const amountInBaseUnits = BigInt(depositAmount)

    console.log('Initiating deposit:', {
      faction: selectedFaction,
      amountInput: depositAmount,
      amountInBaseUnits: amountInBaseUnits.toString(),
      amountInOCT: (Number(amountInBaseUnits) / 1_000_000).toFixed(2) + ' OCT',
      epochEndTime,
      currentTime: now,
      timeLeft: epochEndTime - now,
    })

    try {
      await deposit(coins, amountInBaseUnits, selectedFaction, async () => {
        // Refetch everything after successful deposit
        await Promise.all([refetch(), refetchCoins()])
        setDepositAmount("")
        setSelectedFaction(null)
      })
    } catch (err) {
      // Error already handled in deposit hook
      console.error('Deposit error:', err)
    }
  }

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
                <span className="font-bold font-mono">{currentEpoch || "..."}</span>
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
                    <div className="font-bold font-mono text-sm">{formatUSDC(totalTVL)} OCT</div>
                    <div className="text-xs text-muted-foreground">{totalTVL.toLocaleString()} units</div>
                  </CardContent>
                </Card>
                <Card className="border-primary/30 bg-primary/5 backdrop-blur-sm">
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Epoch Yield</div>
                    <div className="font-bold font-mono text-sm text-primary">{formatUSDC(epochYield)} OCT</div>
                    <div className="text-xs text-muted-foreground">{epochYield.toLocaleString()} units</div>
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
                  {history.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <p className="text-xs sm:text-sm">No history available yet</p>
                      <p className="text-[10px] sm:text-xs mt-1">History will be available after first epoch settlement</p>
                    </div>
                  ) : (
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
                  )}
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
                      <div className="font-bold font-mono text-lg">{formatUSDC(totalTVL)} OCT</div>
                      <div className="text-xs text-muted-foreground">{totalTVL.toLocaleString()} units</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-primary/10 border border-primary/30">
                    <span className="text-muted-foreground">{t("play.epochYield")}</span>
                    <div className="text-right">
                      <div className="font-bold font-mono text-lg text-primary">{formatUSDC(epochYield)} OCT</div>
                      <div className="text-xs text-primary/70">{epochYield.toLocaleString()} units</div>
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
                      <span className="text-muted-foreground">OCT Balance (base units)</span>
                      {coinsLoading ? (
                        <span className="font-mono">Loading...</span>
                      ) : (
                        <span className="font-mono">{totalBalance.toString()} units</span>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="1000000 (min)"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="pr-24 text-base sm:text-lg font-mono bg-secondary border-border"
                        disabled={!currentAccount || coinsLoading}
                      />
                      <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => setDepositAmount(totalBalance.toString())}
                          className="text-xs text-primary font-medium hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!currentAccount || coinsLoading || totalBalance === 0n}
                        >
                          MAX
                        </button>
                        <span className="text-muted-foreground text-xs sm:text-sm">units</span>
                      </div>
                    </div>

                    {/* Quick amount buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDepositAmount('1000000')}
                        className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-secondary hover:bg-secondary/80 border border-border"
                        disabled={!currentAccount || coinsLoading}
                      >
                        1 OCT
                      </button>
                      <button
                        onClick={() => setDepositAmount('5000000')}
                        className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-secondary hover:bg-secondary/80 border border-border"
                        disabled={!currentAccount || coinsLoading}
                      >
                        5 OCT
                      </button>
                      <button
                        onClick={() => setDepositAmount('10000000')}
                        className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-secondary hover:bg-secondary/80 border border-border"
                        disabled={!currentAccount || coinsLoading}
                      >
                        10 OCT
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      💡 1 OCT = 1,000,000 units (6 decimals). Contract enforces min 1,000,000 units.
                    </p>
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
                        <span className="text-muted-foreground">Amount in OCT</span>
                        <span className="font-mono text-primary">
                          {((Number.parseInt(depositAmount) || 0) / 1_000_000).toFixed(2)} OCT
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Principal protected</span>
                        <span className="font-mono text-chart-3">100%</span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleDeposit}
                    className="w-full rounded-xl text-base sm:text-lg py-5 sm:py-6 glow-cyan"
                    disabled={
                      !selectedFaction ||
                      !depositAmount ||
                      !currentAccount ||
                      contractLoading ||
                      coinsLoading ||
                      isDepositing ||
                      coins.length === 0
                    }
                  >
                    {!currentAccount
                      ? "Connect Wallet"
                      : contractLoading || coinsLoading
                      ? "Loading..."
                      : isDepositing
                      ? "Depositing..."
                      : coins.length === 0
                      ? "No OCT Balance"
                      : t("play.depositBtn")
                    }
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
                  {!currentAccount ? (
                    <div className="text-center py-6 sm:py-8 text-muted-foreground">
                      <Wallet className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                      <p className="text-xs sm:text-sm">Connect wallet to view</p>
                    </div>
                  ) : userReceipts.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-muted-foreground">
                      <p className="text-xs sm:text-sm">No deposits yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {userReceipts.map((receipt) => (
                        <div
                          key={receipt.id}
                          className="p-3 rounded-xl bg-secondary/50 border border-border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FactionIcon
                                faction={FACTION_REVERSE[receipt.faction as keyof typeof FACTION_REVERSE]}
                                className="w-5 h-5"
                              />
                              <span className="text-sm font-bold capitalize">
                                {FACTION_REVERSE[receipt.faction as keyof typeof FACTION_REVERSE]}
                              </span>
                            </div>
                            <span className="text-sm font-mono">${formatUSDC(receipt.amount)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Epoch {receipt.epoch_id}</span>
                            {withdrawableReceipts.find(r => r.id === receipt.id) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => withdraw(receipt.id, refetch)}
                                disabled={isWithdrawing}
                                className="h-7 text-xs"
                              >
                                Withdraw
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

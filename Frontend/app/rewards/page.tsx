"use client"

import { useState, useMemo } from "react"
import { useLanguage } from "@/contexts/language-context"
import { useContract } from "@/contexts/contract-context"
import { useWithdraw } from "@/hooks/use-contract-transactions"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { Navigation } from "@/components/navigation"
import { ReceiptCard } from "@/components/receipt-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, Wallet, TrendingUp, Clock, AlertCircle, Sparkles } from "lucide-react"
import { u64ToNumber, formatUSDC } from "@/lib/onechain"
import { FACTION_REVERSE } from "@/types/contract"

export default function RewardsPage() {
  const { t } = useLanguage()
  const { vault, userReceipts, isLoading, refetch } = useContract()
  const currentAccount = useCurrentAccount()
  const { withdraw, isPending } = useWithdraw()
  const [claimingReceiptId, setClaimingReceiptId] = useState<string | null>(null)

  // Categorize receipts: claimable vs current epoch
  const { claimableReceipts, currentEpochReceipts } = useMemo(() => {
    if (!vault || !userReceipts.length) {
      return { claimableReceipts: [], currentEpochReceipts: [] }
    }

    const currentEpoch = u64ToNumber(vault.current_epoch)
    const claimable = userReceipts.filter((r) => u64ToNumber(r.epoch_id) === currentEpoch - 1)
    const current = userReceipts.filter((r) => u64ToNumber(r.epoch_id) === currentEpoch)

    return { claimableReceipts: claimable, currentEpochReceipts: current }
  }, [vault, userReceipts])

  // Calculate total claimable
  const totalClaimable = useMemo(() => {
    if (!vault || !claimableReceipts.length) return 0

    const lastWinner = vault.last_winner
    if (lastWinner === 255) return 0 // No winner yet

    const yieldPool = u64ToNumber(vault.yield_pool)

    // Get winner pool from vault (this is current epoch pool, not previous)
    // Note: After settlement, pools are reset, so we can't calculate exact yield
    // We'll show principal only, or fetch from settlement event

    return claimableReceipts.reduce((total, receipt) => {
      const amount = u64ToNumber(receipt.amount)
      // If user was winner, they get principal + yield share
      // For now, show principal (yield calculation needs historical pool data)
      return total + amount
    }, 0)
  }, [vault, claimableReceipts])

  const handleClaim = async (receiptId: string) => {
    setClaimingReceiptId(receiptId)
    try {
      await withdraw(receiptId, () => {
        refetch()
      })
    } finally {
      setClaimingReceiptId(null)
    }
  }

  const handleClaimAll = async () => {
    for (const receipt of claimableReceipts) {
      await handleClaim(receipt.id)
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <Navigation />

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--background)_70%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">{t("rewards.center")}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 glow-text-cyan">
              {t("rewards.title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("rewards.subtitle")}
            </p>
          </div>

          {/* Wallet Not Connected */}
          {!currentAccount && (
            <Card className="max-w-2xl mx-auto border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">{t("rewards.connectWallet")}</h3>
                <p className="text-muted-foreground">
                  {t("rewards.connectWalletDesc")}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {currentAccount && isLoading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="mt-4 text-muted-foreground">{t("rewards.loading")}</p>
            </div>
          )}

          {/* Connected & Loaded */}
          {currentAccount && !isLoading && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <Card className="border-border bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{t("rewards.claimable")}</span>
                    </div>
                    <div className="text-2xl font-bold font-mono">
                      {formatUSDC(totalClaimable)} OCT
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-chart-3" />
                      </div>
                      <span className="text-sm text-muted-foreground">{t("rewards.readyToClaim")}</span>
                    </div>
                    <div className="text-2xl font-bold font-mono">{claimableReceipts.length}</div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-accent" />
                      </div>
                      <span className="text-sm text-muted-foreground">{t("rewards.activeDeposits")}</span>
                    </div>
                    <div className="text-2xl font-bold font-mono">{currentEpochReceipts.length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Claimable Rewards Section */}
              {claimableReceipts.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Gift className="w-6 h-6 text-primary" />
                      {t("rewards.claimableRewards")}
                    </h2>
                    {claimableReceipts.length > 1 && (
                      <Button
                        onClick={handleClaimAll}
                        disabled={isPending}
                        className="rounded-xl glow-cyan"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {t("rewards.claimAll")} ({claimableReceipts.length})
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {claimableReceipts.map((receipt) => (
                      <ReceiptCard
                        key={receipt.id}
                        receipt={receipt}
                        vault={vault}
                        isClaimable={true}
                        onClaim={() => handleClaim(receipt.id)}
                        isClaiming={claimingReceiptId === receipt.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Active Deposits Section */}
              {currentEpochReceipts.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                    <Clock className="w-6 h-6 text-accent" />
                    {t("rewards.activeDepositsSection")}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentEpochReceipts.map((receipt) => (
                      <ReceiptCard
                        key={receipt.id}
                        receipt={receipt}
                        vault={vault}
                        isClaimable={false}
                        onClaim={() => {}}
                        isClaiming={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* No Receipts */}
              {claimableReceipts.length === 0 && currentEpochReceipts.length === 0 && (
                <Card className="border-border bg-card/50 backdrop-blur-sm">
                  <CardContent className="py-16 text-center">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold mb-2">{t("rewards.noDeposits")}</h3>
                    <p className="text-muted-foreground mb-6">
                      {t("rewards.noDepositsDesc")}
                    </p>
                    <Button asChild className="rounded-xl glow-cyan">
                      <a href="/play">{t("rewards.startPlaying")}</a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

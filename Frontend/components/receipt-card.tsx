"use client"

import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { FactionIcon } from "@/components/faction-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Coins, Trophy, Calendar, Sparkles } from "lucide-react"
import { DepositReceipt, GameVault, Faction, FACTION_REVERSE } from "@/types/contract"
import { u64ToNumber, formatUSDC } from "@/lib/onechain"

interface ReceiptCardProps {
  receipt: DepositReceipt
  vault: GameVault | null
  isClaimable: boolean
  onClaim: () => void
  isClaiming: boolean
}

const factionConfig = {
  rock: {
    color: "text-rock",
    bg: "bg-rock/10",
    border: "border-rock/50",
    glow: "shadow-[0_0_20px_oklch(0.6_0.2_25/0.3)]",
  },
  paper: {
    color: "text-paper",
    bg: "bg-paper/10",
    border: "border-paper/50",
    glow: "shadow-[0_0_20px_oklch(0.7_0.18_145/0.3)]",
  },
  scissors: {
    color: "text-scissors",
    bg: "bg-scissors/10",
    border: "border-scissors/50",
    glow: "shadow-[0_0_20px_oklch(0.65_0.22_280/0.3)]",
  },
}

export function ReceiptCard({ receipt, vault, isClaimable, onClaim, isClaiming }: ReceiptCardProps) {
  const { t } = useLanguage()
  const faction = FACTION_REVERSE[receipt.faction as 0 | 1 | 2] as Faction
  const config = factionConfig[faction]
  const amount = u64ToNumber(receipt.amount)
  const epochId = u64ToNumber(receipt.epoch_id)

  // Determine if user won (for claimable receipts)
  const isWinner = vault && vault.last_winner === receipt.faction

  // Calculate potential yield (approximation)
  // Note: Exact yield calculation requires historical pool data from settlement event
  const yieldPool = vault ? u64ToNumber(vault.yield_pool) : 0
  const estimatedYield = isClaimable && isWinner && yieldPool > 0 ? amount * 0.05 : 0 // Rough estimate

  return (
    <Card
      className={cn(
        "border-2 transition-all duration-300 group",
        config.bg,
        isClaimable && isWinner ? `${config.border} ${config.glow}` : "border-border",
        isClaimable && "hover:scale-[1.02]"
      )}
    >
      <CardContent className="p-6">
        {/* Faction Icon & Name */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", config.bg)}>
              <FactionIcon faction={faction} className={cn("w-8 h-8", config.color)} glowing={isClaimable && !!isWinner} />
            </div>
            <div>
              <h3 className={cn("text-lg font-bold capitalize", config.color)}>{faction}</h3>
              <p className="text-xs text-muted-foreground">{t("rewards.epoch")} {epochId}</p>
            </div>
          </div>

          {/* Winner Badge */}
          {isClaimable && isWinner && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-chart-3/20 border border-chart-3/50">
              <Trophy className="w-3 h-3 text-chart-3" />
              <span className="text-xs font-bold text-chart-3">{t("rewards.winner")}</span>
            </div>
          )}

          {/* Loser Badge */}
          {isClaimable && !isWinner && vault?.last_winner !== 255 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 border border-border">
              <span className="text-xs font-medium text-muted-foreground">{t("rewards.noYield")}</span>
            </div>
          )}
        </div>

        {/* Deposit Amount */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="w-4 h-4" />
              <span>{t("rewards.principal")}</span>
            </div>
            <span className="font-mono font-bold">{formatUSDC(amount)} OCT</span>
          </div>

          {/* Estimated Yield (for claimable winners) */}
          {isClaimable && isWinner && estimatedYield > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-chart-3" />
                <span>{t("rewards.yield")}</span>
              </div>
              <span className="font-mono font-bold text-chart-3">+{formatUSDC(estimatedYield)} OCT</span>
            </div>
          )}

          {/* Total Claimable */}
          {isClaimable && (
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("rewards.totalClaimable")}</span>
                <span className={cn("font-mono font-bold text-lg", isWinner ? "text-chart-3" : "")}>
                  {formatUSDC(amount + estimatedYield)} OCT
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Receipt ID (truncated) */}
        <div className="mb-4 p-2 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("rewards.receipt")}:</span>
            <span className="text-xs font-mono">
              {receipt.id.slice(0, 8)}...{receipt.id.slice(-6)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        {isClaimable ? (
          <Button
            onClick={onClaim}
            disabled={isClaiming}
            className={cn("w-full rounded-xl font-bold", isWinner && "glow-cyan")}
            variant={isWinner ? "default" : "outline"}
          >
            {isClaiming ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                {t("rewards.claiming")}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {t("rewards.claimRewards")}
              </>
            )}
          </Button>
        ) : (
          <div className="text-center py-2 px-4 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{t("rewards.activeInEpoch")}</span>
            </div>
          </div>
        )}

        {/* Status Note */}
        {isClaimable && vault?.last_winner === 255 && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            {t("rewards.epochNotSettled")}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

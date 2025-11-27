"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "en" | "cn"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.play": "Play",
    "nav.rewards": "Rewards",
    "nav.docs": "Docs",
    "nav.connect": "Connect Wallet",
    "nav.connected": "Connected",

    // Home Page
    "home.title": "OneTriangle",
    "home.subtitle": "No-Loss Gamified Savings",
    "home.description":
      "A DeFi protocol that gamifies stablecoin savings. Deposit USDC, choose a faction, win the yield. Your principal is always protected.",
    "home.play": "Enter Arena",
    "home.learn": "Learn More",

    // Features
    "feature.noLoss": "No-Loss Guarantee",
    "feature.noLossDesc": "Your USDC principal is always protected. Win or lose, you never lose your deposit.",
    "feature.strategy": "Skill-Based Strategy",
    "feature.strategyDesc":
      "Unlike random lotteries, victory depends on analyzing market sentiment and liquidity flows.",
    "feature.yield": "Gamified Yield",
    "feature.yieldDesc": "Interest is aggregated and gamified. Winners take the yield of losers.",
    "feature.factions": "Rock Paper Scissors",
    "feature.factionsDesc": "Choose Rock, Paper, or Scissors faction each epoch based on game theory.",

    // Innovation
    "innovation.title": "Protocol Innovation",
    "innovation.equilibrium": "Dynamic Equilibrium",
    "innovation.equilibriumDesc": "Score = Target - Predator formula creates strategic depth",
    "innovation.noLoss": "Principal Protection",
    "innovation.noLossDesc": "100% USDC principal returned regardless of outcome",
    "innovation.gameTheory": "Game Theory Based",
    "innovation.gameTheoryDesc": "Analyze TVL distribution to maximize win probability",

    // Stats
    "stats.tvl": "Total Value Locked",
    "stats.players": "Active Players",
    "stats.epochs": "Epochs Completed",
    "stats.yield": "Total Yield Distributed",

    // Play Page
    "play.title": "Battle Arena",
    "play.epoch": "Current Epoch",
    "play.timeLeft": "Time Remaining",
    "play.selectFaction": "Choose Your Faction",
    "play.rock": "Rock",
    "play.paper": "Paper",
    "play.scissors": "Scissors",
    "play.deposit": "Deposit Amount",
    "play.depositBtn": "Deposit & Join",
    "play.distribution": "Live Liquidity",
    "play.yourPosition": "Your Position",
    "play.potentialYield": "Potential Yield",
    "play.score": "Projected Score",
    "play.formula": "Scoring Formula",
    "play.vault": "Game Vault",
    "play.totalDeposited": "Total Deposited",
    "play.epochYield": "Epoch Yield Pool",
    "play.history": "Epoch History",
    "play.winner": "Winner",
    "play.yieldDist": "Yield Distributed",
    "play.phase": "Current Phase",
    "play.depositPhase": "Deposit Phase",
    "play.lockPhase": "Lock Phase",

    // Rewards Page
    "rewards.title": "Your Rewards",
    "rewards.subtitle": "Claim your principal and yield from completed epochs",
    "rewards.center": "Rewards Center",
    "rewards.claimable": "Claimable",
    "rewards.readyToClaim": "Ready to Claim",
    "rewards.activeDeposits": "Active Deposits",
    "rewards.claimableRewards": "Claimable Rewards",
    "rewards.claimAll": "Claim All",
    "rewards.activeDepositsSection": "Active Deposits (Current Epoch)",
    "rewards.connectWallet": "Connect Your Wallet",
    "rewards.connectWalletDesc": "Connect your wallet to view and claim your rewards",
    "rewards.loading": "Loading your rewards...",
    "rewards.noDeposits": "No Deposits Found",
    "rewards.noDepositsDesc": "You haven't made any deposits yet. Start playing to earn rewards!",
    "rewards.startPlaying": "Start Playing",
    "rewards.principal": "Principal",
    "rewards.yield": "Yield",
    "rewards.totalClaimable": "Total Claimable",
    "rewards.receipt": "Receipt",
    "rewards.winner": "Winner",
    "rewards.noYield": "No Yield",
    "rewards.claimRewards": "Claim Rewards",
    "rewards.claiming": "Claiming...",
    "rewards.activeInEpoch": "Active in Current Epoch",
    "rewards.epochNotSettled": "Epoch not settled yet",
    "rewards.epoch": "Epoch",

    // Docs Page
    "docs.title": "Documentation",
    "docs.overview": "Overview",
    "docs.mechanism": "How It Works",
    "docs.formula": "Scoring Formula",
    "docs.strategy": "Strategy Tips",
    "docs.faq": "FAQ",

    // Docs Content
    "docs.overviewContent":
      "OneTriangle is a No-Loss Gamified Savings Protocol on OneChain. It replaces traditional fixed APY with a competitive Rock-Paper-Scissors strategy game. Deposit USDC, join a faction, win the yield!",
    "docs.depositTitle": "Deposit USDC",
    "docs.depositDesc":
      "Connect your OneWallet and deposit USDC into the Game Vault. Your principal is protected - you never lose your deposit.",
    "docs.factionTitle": "Join Faction",
    "docs.factionDesc":
      "Choose Rock, Paper, or Scissors faction. Analyze the Live Liquidity chart to make strategic decisions.",
    "docs.scoringTitle": "Victory Scoring",
    "docs.scoringDesc": "Score = Target TVL% - Predator TVL%. The faction with highest score wins all the yield.",
    "docs.settlementTitle": "Settlement & Claim",
    "docs.settlementDesc":
      "Winners receive 100% Principal + Yield Share. Losers receive 100% Principal. Your receipt NFT is burned on withdraw.",

    // Strategy
    "strategy.title": "Pro Strategy Tips",
    "strategy.tip1": "Watch the Liquidity",
    "strategy.tip1Desc": "Monitor real-time TVL distribution. Heavy concentration creates opportunity.",
    "strategy.tip2": "Counter-Play Strategy",
    "strategy.tip2Desc": "If Rock has too much TVL, choose Paper - it has higher score potential.",
    "strategy.tip3": "Timing Matters",
    "strategy.tip3Desc": "Last-minute deposits can shift the balance. Stay alert until lock phase.",
    "strategy.tip4": "Think Like Others",
    "strategy.tip4Desc": "Other players also strategize. Predict the predictors.",
  },
  cn: {
    // Navigation
    "nav.home": "首页",
    "nav.play": "竞技场",
    "nav.rewards": "奖励",
    "nav.docs": "文档",
    "nav.connect": "连接钱包",
    "nav.connected": "已连接",

    // Home Page
    "home.title": "OneTriangle",
    "home.subtitle": "零损失游戏化储蓄",
    "home.description": "一个将稳定币储蓄游戏化的DeFi协议。存入USDC，选择阵营，赢取收益。您的本金始终受到保护。",
    "home.play": "进入竞技场",
    "home.learn": "了解更多",

    // Features
    "feature.noLoss": "零损失保障",
    "feature.noLossDesc": "您的USDC本金始终受到保护。无论输赢，您永远不会损失存款。",
    "feature.strategy": "技能型策略",
    "feature.strategyDesc": "与随机抽奖不同，胜利取决于分析市场情绪和流动性流向。",
    "feature.yield": "游戏化收益",
    "feature.yieldDesc": "利息被汇总并游戏化。获胜者获得失败者的收益。",
    "feature.factions": "石头剪刀布",
    "feature.factionsDesc": "根据博弈论，每个周期选择石头、布或剪刀阵营。",

    // Innovation
    "innovation.title": "协议创新",
    "innovation.equilibrium": "动态均衡",
    "innovation.equilibriumDesc": "分数 = 目标 - 猎手 公式创造策略深度",
    "innovation.noLoss": "本金保护",
    "innovation.noLossDesc": "无论结果如何，100%返还USDC本金",
    "innovation.gameTheory": "基于博弈论",
    "innovation.gameTheoryDesc": "分析TVL分布以最大化获胜概率",

    // Stats
    "stats.tvl": "总锁仓价值",
    "stats.players": "活跃玩家",
    "stats.epochs": "已完成周期",
    "stats.yield": "总分配收益",

    // Play Page
    "play.title": "战斗竞技场",
    "play.epoch": "当前周期",
    "play.timeLeft": "剩余时间",
    "play.selectFaction": "选择你的阵营",
    "play.rock": "石头",
    "play.paper": "布",
    "play.scissors": "剪刀",
    "play.deposit": "存款金额",
    "play.depositBtn": "存入并加入",
    "play.distribution": "实时流动性",
    "play.yourPosition": "你的仓位",
    "play.potentialYield": "潜在收益",
    "play.score": "预测分数",
    "play.formula": "计分公式",
    "play.vault": "游戏金库",
    "play.totalDeposited": "总存款",
    "play.epochYield": "周期收益池",
    "play.history": "周期历史",
    "play.winner": "获胜者",
    "play.yieldDist": "分配收益",
    "play.phase": "当前阶段",
    "play.depositPhase": "存款阶段",
    "play.lockPhase": "锁定阶段",

    // Rewards Page
    "rewards.title": "你的奖励",
    "rewards.subtitle": "从已完成的周期中领取本金和收益",
    "rewards.center": "奖励中心",
    "rewards.claimable": "可领取",
    "rewards.readyToClaim": "待领取",
    "rewards.activeDeposits": "活跃存款",
    "rewards.claimableRewards": "可领取奖励",
    "rewards.claimAll": "全部领取",
    "rewards.activeDepositsSection": "活跃存款（当前周期）",
    "rewards.connectWallet": "连接你的钱包",
    "rewards.connectWalletDesc": "连接钱包以查看和领取奖励",
    "rewards.loading": "加载奖励中...",
    "rewards.noDeposits": "未找到存款",
    "rewards.noDepositsDesc": "您还没有任何存款。开始游戏以赚取奖励！",
    "rewards.startPlaying": "开始游戏",
    "rewards.principal": "本金",
    "rewards.yield": "收益",
    "rewards.totalClaimable": "总可领取",
    "rewards.receipt": "收据",
    "rewards.winner": "获胜者",
    "rewards.noYield": "无收益",
    "rewards.claimRewards": "领取奖励",
    "rewards.claiming": "领取中...",
    "rewards.activeInEpoch": "当前周期活跃",
    "rewards.epochNotSettled": "周期尚未结算",
    "rewards.epoch": "周期",

    // Docs Page
    "docs.title": "游戏文档",
    "docs.overview": "概述",
    "docs.mechanism": "运作方式",
    "docs.formula": "计分公式",
    "docs.strategy": "策略技巧",
    "docs.faq": "常见问题",

    // Docs Content
    "docs.overviewContent":
      "OneTriangle是OneChain上的零损失游戏化储蓄协议。它用竞争性的石头剪刀布策略游戏取代传统固定APY。存入USDC，加入阵营，赢取收益！",
    "docs.depositTitle": "存入USDC",
    "docs.depositDesc": "连接您的OneWallet并将USDC存入游戏金库。您的本金受到保护 - 永远不会损失存款。",
    "docs.factionTitle": "加入阵营",
    "docs.factionDesc": "选择石头、布或剪刀阵营。分析实时流动性图表做出策略决策。",
    "docs.scoringTitle": "胜利计分",
    "docs.scoringDesc": "分数 = 目标TVL% - 猎手TVL%。分数最高的阵营赢得所有收益。",
    "docs.settlementTitle": "结算与领取",
    "docs.settlementDesc": "获胜者获得100%本金 + 收益份额。失败者获得100%本金。提款时您的收据NFT将被销毁。",

    // Strategy
    "strategy.title": "专业策略技巧",
    "strategy.tip1": "观察流动性",
    "strategy.tip1Desc": "监控实时TVL分布。高度集中创造机会。",
    "strategy.tip2": "反向操作策略",
    "strategy.tip2Desc": "如果石头TVL过高，选择布 - 它有更高的分数潜力。",
    "strategy.tip3": "时机很重要",
    "strategy.tip3Desc": "最后时刻的存款可能改变平衡。在锁定阶段前保持警觉。",
    "strategy.tip4": "换位思考",
    "strategy.tip4Desc": "其他玩家也在策划。预测预测者。",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}

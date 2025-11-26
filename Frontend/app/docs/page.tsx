"use client"

import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Navigation } from "@/components/navigation"
import { FactionIcon } from "@/components/faction-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Cog,
  Calculator,
  Lightbulb,
  HelpCircle,
  ChevronRight,
  Wallet,
  Lock,
  Trophy,
  Unlock,
  Target,
  Eye,
  Clock,
  Brain,
  DollarSign,
  ChevronDown,
} from "lucide-react"

type DocSection = "overview" | "mechanism" | "formula" | "strategy" | "faq"

export default function DocsPage() {
  const { t, language } = useLanguage()
  const [activeSection, setActiveSection] = useState<DocSection>("overview")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const sections = [
    { id: "overview" as DocSection, label: t("docs.overview"), icon: BookOpen },
    { id: "mechanism" as DocSection, label: t("docs.mechanism"), icon: Cog },
    { id: "formula" as DocSection, label: t("docs.formula"), icon: Calculator },
    { id: "strategy" as DocSection, label: t("docs.strategy"), icon: Lightbulb },
    { id: "faq" as DocSection, label: t("docs.faq"), icon: HelpCircle },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 glow-text-cyan">OneTriangle</h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{t("docs.overviewContent")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border-border bg-card/50">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-chart-3/10 flex items-center justify-center shrink-0">
                      <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-chart-3" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1 sm:mb-2 text-sm sm:text-base">
                        {language === "en" ? "USDC Deposits" : "USDC存款"}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {language === "en"
                          ? "Deposit USDC into the Game Vault. Your capital generates yield through lending protocols."
                          : "将USDC存入游戏金库。您的资金通过借贷协议产生收益。"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1 sm:mb-2 text-sm sm:text-base">
                        {language === "en" ? "Winner Takes Yield" : "赢家获得收益"}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {language === "en"
                          ? "Winners receive 100% principal + share of total yield. Losers get 100% principal back."
                          : "获胜者获得100%本金 + 总收益份额。失败者取回100%本金。"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Problems & Solutions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-destructive text-base sm:text-lg">
                    {language === "en" ? "The Problem" : "问题"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <p>{language === "en" ? "• DeFi protocols are boring and passive" : "• DeFi协议无聊且被动"}</p>
                  <p>{language === "en" ? "• Prediction markets risk your principal" : "• 预测市场会损失本金"}</p>
                  <p>
                    {language === "en" ? "• Retention driven by unsustainable emissions" : "• 留存靠不可持续的代币排放"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-chart-3/30 bg-chart-3/5">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-chart-3 text-base sm:text-lg">
                    {language === "en" ? "Our Solution" : "我们的解决方案"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <p>{language === "en" ? "• Principal always protected (no-loss)" : "• 本金始终受保护（零损失）"}</p>
                  <p>{language === "en" ? "• Gamified yield distribution" : "• 游戏化收益分配"}</p>
                  <p>{language === "en" ? "• Skill-based game theory strategy" : "• 基于技能的博弈论策略"}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "mechanism":
        return (
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold glow-text-cyan">{t("docs.mechanism")}</h2>

            <div className="relative">
              <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-border" />

              {[
                {
                  step: 1,
                  icon: Wallet,
                  title: t("docs.depositTitle"),
                  desc: t("docs.depositDesc"),
                  color: "bg-chart-4",
                },
                {
                  step: 2,
                  icon: Target,
                  title: t("docs.factionTitle"),
                  desc: t("docs.factionDesc"),
                  color: "bg-primary",
                },
                {
                  step: 3,
                  icon: Lock,
                  title: language === "en" ? "Lock Phase" : "锁定阶段",
                  desc:
                    language === "en"
                      ? "Deposits are locked for the duration of the epoch (3 days). USDC is lent out to generate yield."
                      : "存款在周期内被锁定（3天）。USDC被借出以产生收益。",
                  color: "bg-accent",
                },
                {
                  step: 4,
                  icon: Trophy,
                  title: t("docs.scoringTitle"),
                  desc: t("docs.scoringDesc"),
                  color: "bg-chart-3",
                },
                {
                  step: 5,
                  icon: Unlock,
                  title: t("docs.settlementTitle"),
                  desc: t("docs.settlementDesc"),
                  color: "bg-primary",
                },
              ].map((item, i) => (
                <div key={i} className="relative pl-12 sm:pl-16 pb-6 sm:pb-10 last:pb-0">
                  <div
                    className={cn(
                      "absolute left-1.5 sm:left-3 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-background text-xs sm:text-sm font-bold",
                      item.color,
                    )}
                  >
                    {item.step}
                  </div>
                  <Card className="border-border bg-card/50">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div
                          className={cn(
                            "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0",
                            item.color + "/10",
                          )}
                        >
                          <item.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", item.color.replace("bg-", "text-"))} />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2">{item.title}</h3>
                          <p className="text-xs sm:text-base text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-4 sm:pt-6">
                <h4 className="font-bold mb-2 text-sm sm:text-base">
                  {language === "en" ? "Technical Note" : "技术说明"}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === "en"
                    ? "When you deposit, you receive a DepositReceipt NFT storing your Amount, Faction Choice, and Epoch ID. This receipt is burned when you withdraw."
                    : "存款时，您会收到一个存款收据NFT，存储您的金额、阵营选择和周期ID。提款时该收据将被销毁。"}
                </p>
              </CardContent>
            </Card>
          </div>
        )

      case "formula":
        return (
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold glow-text-cyan">{t("docs.formula")}</h2>

            <Card className="border-primary/30 bg-card/50">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">
                  {language === "en" ? "Target vs Predator Formula" : "目标 vs 猎手公式"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <p className="text-xs sm:text-base text-muted-foreground">
                  {language === "en"
                    ? "The score for a faction is determined by the TVL percentage of its target minus the TVL percentage of its predator."
                    : "阵营分数由其目标的TVL百分比减去其猎手的TVL百分比决定。"}
                </p>

                <div className="space-y-3 sm:space-y-4 font-mono">
                  <div className="p-4 sm:p-6 rounded-xl bg-rock/10 border border-rock/30">
                    <div className="flex items-center gap-2 text-rock font-bold text-sm sm:text-lg mb-2">
                      <FactionIcon faction="rock" className="w-6 h-6 sm:w-8 sm:h-8 text-rock" />
                      <span>Rock Score</span>
                    </div>
                    <div className="text-lg sm:text-2xl mb-2">Score = %Scissors - %Paper</div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-sans">
                      {language === "en"
                        ? "Rock beats Scissors (target), Paper beats Rock (predator)"
                        : "石头克剪刀（目标），布克石头（猎手）"}
                    </p>
                  </div>

                  <div className="p-4 sm:p-6 rounded-xl bg-paper/10 border border-paper/30">
                    <div className="flex items-center gap-2 text-paper font-bold text-sm sm:text-lg mb-2">
                      <FactionIcon faction="paper" className="w-6 h-6 sm:w-8 sm:h-8 text-paper" />
                      <span>Paper Score</span>
                    </div>
                    <div className="text-lg sm:text-2xl mb-2">Score = %Rock - %Scissors</div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-sans">
                      {language === "en"
                        ? "Paper beats Rock (target), Scissors beats Paper (predator)"
                        : "布克石头（目标），剪刀克布（猎手）"}
                    </p>
                  </div>

                  <div className="p-4 sm:p-6 rounded-xl bg-scissors/10 border border-scissors/30">
                    <div className="flex items-center gap-2 text-scissors font-bold text-sm sm:text-lg mb-2">
                      <FactionIcon faction="scissors" className="w-6 h-6 sm:w-8 sm:h-8 text-scissors" />
                      <span>Scissors Score</span>
                    </div>
                    <div className="text-lg sm:text-2xl mb-2">Score = %Paper - %Rock</div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-sans">
                      {language === "en"
                        ? "Scissors beats Paper (target), Rock beats Scissors (predator)"
                        : "剪刀克布（目标），石头克剪刀（猎手）"}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-6 rounded-xl bg-secondary border border-border">
                  <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">
                    {language === "en" ? "Example Calculation" : "计算示例"}
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <p className="font-medium">
                      {language === "en"
                        ? "TVL Distribution: Rock 35%, Paper 40%, Scissors 25%"
                        : "TVL分布：石头 35%，布 40%，剪刀 25%"}
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-4 font-mono">
                      <div className="text-center p-2 sm:p-3 rounded-lg bg-rock/10">
                        <FactionIcon faction="rock" className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-rock" />
                        <div className="text-rock text-xs sm:text-sm">
                          25-40 = <span className="font-bold">-15%</span>
                        </div>
                      </div>
                      <div className="text-center p-2 sm:p-3 rounded-lg bg-paper/10">
                        <FactionIcon faction="paper" className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-paper" />
                        <div className="text-paper text-xs sm:text-sm">
                          35-25 = <span className="font-bold">+10%</span>
                        </div>
                      </div>
                      <div className="text-center p-2 sm:p-3 rounded-lg bg-scissors/10">
                        <FactionIcon faction="scissors" className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-scissors" />
                        <div className="text-scissors text-xs sm:text-sm">
                          40-35 = <span className="font-bold">+5%</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 text-chart-3 font-bold text-center flex items-center justify-center gap-2">
                      <FactionIcon faction="paper" className="w-5 h-5 text-paper" />
                      <span className="text-xs sm:text-sm">
                        {language === "en" ? "Paper wins with highest score (+10%)!" : "布以最高分（+10%）获胜！"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "strategy":
        return (
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold glow-text-cyan">{t("strategy.title")}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[
                { icon: Eye, title: t("strategy.tip1"), desc: t("strategy.tip1Desc"), color: "text-primary" },
                { icon: Target, title: t("strategy.tip2"), desc: t("strategy.tip2Desc"), color: "text-accent" },
                { icon: Clock, title: t("strategy.tip3"), desc: t("strategy.tip3Desc"), color: "text-chart-4" },
                { icon: Brain, title: t("strategy.tip4"), desc: t("strategy.tip4Desc"), color: "text-chart-3" },
              ].map((tip, i) => (
                <Card key={i} className="border-border bg-card/50 hover:border-primary/30 transition-colors">
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                        <tip.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", tip.color)} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2">{tip.title}</h3>
                        <p className="text-xs sm:text-base text-muted-foreground">{tip.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2 text-accent">
                      {language === "en" ? "Pro Tip: Nash Equilibrium" : "专业提示：纳什均衡"}
                    </h3>
                    <p className="text-xs sm:text-base text-muted-foreground">
                      {language === "en"
                        ? "In perfect equilibrium, all factions would have 33.33% TVL and 0 score. Any deviation creates opportunity for strategic counter-play. Watch for these imbalances!"
                        : "在完美均衡中，所有阵营将有33.33%的TVL和0分。任何偏差都会为策略性反向操作创造机会。注意这些不平衡！"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "faq":
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold glow-text-cyan">{t("docs.faq")}</h2>

            {[
              {
                q: language === "en" ? "What happens if I lose?" : "如果我输了会怎样？",
                a:
                  language === "en"
                    ? "You get 100% of your USDC principal back. Only the yield generated during the epoch goes to the winners. Your deposit is never at risk."
                    : "您将取回100%的USDC本金。只有周期内产生的收益归获胜者所有。您的存款永远不会有风险。",
              },
              {
                q: language === "en" ? "How is yield generated?" : "收益是如何产生的？",
                a:
                  language === "en"
                    ? "All deposited USDC in the Game Vault is lent to OneChain lending protocols (simulated via Mock Vault for testnet), generating returns throughout each epoch."
                    : "游戏金库中所有存入的USDC都会借给OneChain借贷协议（测试网通过模拟金库），在每个周期内产生收益。",
              },
              {
                q: language === "en" ? "Can I withdraw during an epoch?" : "我可以在周期内提取吗？",
                a:
                  language === "en"
                    ? "Once you deposit and select a faction, your USDC is locked until the epoch ends (3 days). You can withdraw your principal + any winnings after settlement."
                    : "一旦存款并选择阵营，您的USDC将被锁定直到周期结束（3天）。结算后您可以提取本金和任何奖金。",
              },
              {
                q: language === "en" ? "What is the DepositReceipt NFT?" : "什么是存款收据NFT？",
                a:
                  language === "en"
                    ? "When you deposit, you receive a DepositReceipt NFT (Sui object) that stores your deposit amount, faction choice, and epoch ID. This receipt is burned when you withdraw."
                    : "存款时，您会收到一个存款收据NFT（Sui对象），存储您的存款金额、阵营选择和周期ID。提款时该收据将被销毁。",
              },
              {
                q: language === "en" ? "What network does OneTriangle use?" : "OneTriangle使用什么网络？",
                a:
                  language === "en"
                    ? "OneTriangle is built on OneChain, a Sui Fork. You'll need OneWallet to connect and USDC (Mock/Testnet) to play."
                    : "OneTriangle建立在OneChain（Sui分叉）上。您需要OneWallet连接和USDC（模拟/测试网）来玩。",
              },
            ].map((item, i) => (
              <Card key={i} className="border-border bg-card/50">
                <CardContent className="pt-4 sm:pt-6">
                  <h3 className="font-bold text-sm sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                    <span>{item.q}</span>
                  </h3>
                  <p className="text-xs sm:text-base text-muted-foreground pl-6 sm:pl-7">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )
    }
  }

  return (
    <main className="min-h-screen relative">
      <Navigation />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative pt-24 sm:pt-28 pb-16 sm:pb-20 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 glow-text-cyan">
              {t("docs.title")}
            </h1>
          </div>

          <div className="grid lg:grid-cols-4 gap-4 sm:gap-8">
            <div className="lg:col-span-1">
              {/* Mobile: Dropdown */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setMobileNavOpen(!mobileNavOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-card/50 border border-border"
                >
                  <div className="flex items-center gap-2">
                    {(() => {
                      const current = sections.find((s) => s.id === activeSection)
                      const Icon = current?.icon || BookOpen
                      return (
                        <>
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="font-medium">{current?.label}</span>
                        </>
                      )
                    })()}
                  </div>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", mobileNavOpen && "rotate-180")} />
                </button>

                {mobileNavOpen && (
                  <div className="mt-2 p-2 rounded-xl bg-card/95 border border-border backdrop-blur-sm">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => {
                          setActiveSection(section.id)
                          setMobileNavOpen(false)
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all",
                          activeSection === section.id
                            ? "bg-primary/20 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                        )}
                      >
                        <section.icon className="w-4 h-4" />
                        {section.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop: Sticky Sidebar */}
              <div className="hidden lg:block sticky top-28 space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                      activeSection === section.id
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                    )}
                  >
                    <section.icon className="w-5 h-5" />
                    {section.label}
                    {activeSection === section.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">{renderContent()}</div>
          </div>
        </div>
      </div>
    </main>
  )
}

"use client"

import { useLanguage } from "@/contexts/language-context"
import { Navigation } from "@/components/navigation"
import { StatsCard } from "@/components/stats-card"
import { FactionIcon } from "@/components/faction-icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import {
  Shield,
  Brain,
  Coins,
  Swords,
  TrendingUp,
  Users,
  Calendar,
  Zap,
  ArrowRight,
  Sparkles,
  Target,
} from "lucide-react"

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen relative overflow-hidden">
      <Navigation />

      {/* Video Background for Hero */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Video Element */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/Digital_Void_Mascot_Battle.mp4" type="video/mp4" />
        </video>

        {/* Dark Overlay to darken video */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Additional gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--background)_70%)]" />

        {/* Colored glow effects */}
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 pb-12 sm:pb-20 px-3 sm:px-4 z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Floating Logo with RPS Icons */}
          <div className="relative inline-block mb-6 sm:mb-8">
            <div className="relative w-16 h-16 sm:w-24 sm:h-24 animate-float">
              <Image
                src="/onetriangle-logo.png"
                alt="OneTriangle Logo"
                width={96}
                height={96}
                className="object-contain"
                priority
              />
            </div>
            <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full" />
            <div className="absolute -top-2 -left-8 sm:-left-12 animate-float" style={{ animationDelay: "0.2s" }}>
              <FactionIcon faction="rock" className="w-6 h-6 sm:w-8 sm:h-8 text-rock" />
            </div>
            <div className="absolute -top-2 -right-8 sm:-right-12 animate-float" style={{ animationDelay: "0.4s" }}>
              <FactionIcon faction="paper" className="w-6 h-6 sm:w-8 sm:h-8 text-paper" />
            </div>
            <div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 animate-float"
              style={{ animationDelay: "0.6s" }}
            >
              <FactionIcon faction="scissors" className="w-6 h-6 sm:w-8 sm:h-8 text-scissors" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-3 sm:mb-4 tracking-tight">
            <span className="glow-text-cyan">{t("home.title")}</span>
          </h1>
          <p className="text-lg sm:text-2xl md:text-3xl font-medium text-accent mb-4 sm:mb-6 glow-text-magenta">
            {t("home.subtitle")}
          </p>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            {t("home.description")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Button
              asChild
              size="lg"
              className="rounded-xl text-base sm:text-lg px-6 sm:px-8 glow-cyan bg-primary hover:bg-primary/90 w-full sm:w-auto"
            >
              <Link href="/play">
                <Swords className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t("home.play")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl text-base sm:text-lg px-6 sm:px-8 border-border hover:border-primary/50 bg-transparent w-full sm:w-auto"
            >
              <Link href="/docs">
                {t("home.learn")}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-10 sm:py-16 px-3 sm:px-4 z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <StatsCard icon={Coins} label={t("stats.tvl")} value="$2.5M" trend="+15%" />
          <StatsCard icon={Users} label={t("stats.players")} value="1,432" trend="+124" />
          <StatsCard icon={Calendar} label={t("stats.epochs")} value="42" />
          <StatsCard icon={TrendingUp} label={t("stats.yield")} value="$89.2K" trend="+$5.2K" />
        </div>
      </section>

      {/* Faction Showcase */}
      <section className="relative py-10 sm:py-16 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center gap-4 sm:gap-8 md:gap-16">
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-2xl bg-rock/10 border border-rock/30 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:shadow-[0_0_30px_oklch(0.6_0.2_25/0.3)]">
                <FactionIcon faction="rock" className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 text-rock" glowing />
              </div>
              <span className="mt-2 sm:mt-3 text-rock font-bold text-sm sm:text-base">Rock</span>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-2xl bg-paper/10 border border-paper/30 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:shadow-[0_0_30px_oklch(0.7_0.18_145/0.3)]">
                <FactionIcon faction="paper" className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 text-paper" glowing />
              </div>
              <span className="mt-2 sm:mt-3 text-paper font-bold text-sm sm:text-base">Paper</span>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-2xl bg-scissors/10 border border-scissors/30 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:shadow-[0_0_30px_oklch(0.65_0.22_280/0.3)]">
                <FactionIcon
                  faction="scissors"
                  className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 text-scissors"
                  glowing
                />
              </div>
              <span className="mt-2 sm:mt-3 text-scissors font-bold text-sm sm:text-base">Scissors</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-12 sm:py-20 px-3 sm:px-4 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { icon: Shield, title: t("feature.noLoss"), desc: t("feature.noLossDesc"), color: "text-chart-3" },
              { icon: Brain, title: t("feature.strategy"), desc: t("feature.strategyDesc"), color: "text-primary" },
              { icon: Coins, title: t("feature.yield"), desc: t("feature.yieldDesc"), color: "text-chart-4" },
              { icon: Target, title: t("feature.factions"), desc: t("feature.factionsDesc"), color: "text-accent" },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-4 sm:p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all hover:-translate-y-1"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.color}`} />
                </div>
                <h3 className="text-sm sm:text-lg font-bold mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Section */}
      <section className="relative py-12 sm:py-20 px-3 sm:px-4 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-accent/10 text-accent mb-4">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">{t("innovation.title")}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Zap, title: t("innovation.equilibrium"), desc: t("innovation.equilibriumDesc") },
              { icon: Shield, title: t("innovation.noLoss"), desc: t("innovation.noLossDesc") },
              { icon: Brain, title: t("innovation.gameTheory"), desc: t("innovation.gameTheoryDesc") },
            ].map((item, i) => (
              <div
                key={i}
                className="relative p-6 sm:p-8 rounded-2xl border border-border bg-gradient-to-b from-card to-background overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
                <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-xs sm:text-base text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-12 sm:py-20 px-3 sm:px-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-3xl border border-border bg-card/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Ready to Play?</h2>
              <p className="text-xs sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto">
                Deposit USDC, choose your faction wisely, and compete for the yield pool. No losses, pure strategy.
              </p>
              <Button
                asChild
                size="lg"
                className="rounded-xl text-base sm:text-lg px-8 sm:px-10 glow-cyan w-full sm:w-auto"
              >
                <Link href="/play">
                  <Swords className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {t("home.play")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 sm:py-10 px-3 sm:px-4 border-t border-border z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="relative w-5 h-5 sm:w-6 sm:h-6">
              <Image
                src="/onetriangle-logo.png"
                alt="OneTriangle Logo"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <span className="font-bold tracking-wider text-sm sm:text-base">OneTriangle</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Built on OneChain (Sui Fork)</p>
        </div>
      </footer>
    </main>
  )
}

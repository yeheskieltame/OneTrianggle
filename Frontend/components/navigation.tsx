"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Menu, X, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'

export function Navigation() {
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  const currentAccount = useCurrentAccount()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/play", label: t("nav.play") },
    { href: "/docs", label: t("nav.docs") },
  ]

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg shadow-primary/10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10">
            <Image
              src="/onetriangle-logo.png"
              alt="OneTriangle Logo"
              width={40}
              height={40}
              className="object-contain transition-all group-hover:scale-110"
              priority
            />
            <div className="absolute inset-0 blur-md bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-bold text-lg tracking-wider glow-text-cyan hidden sm:block">OneTriangle</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                pathname === item.href
                  ? "bg-primary/20 text-primary glow-cyan"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === "en" ? "cn" : "en")}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <Globe className="w-4 h-4" />
            <span>{language === "en" ? "EN" : "中文"}</span>
          </button>

          {/* Connect Wallet */}
          {currentAccount && (
            <div className="hidden sm:flex items-center px-3 py-2 rounded-xl bg-primary/10 border border-primary/30">
              <span className="text-xs text-muted-foreground font-mono">
                {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
              </span>
            </div>
          )}
          <div className="wallet-button-wrapper">
            <ConnectButton />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 backdrop-blur-xl bg-card/95 border border-border rounded-2xl p-4 shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1",
                pathname === item.href
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

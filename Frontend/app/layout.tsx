"use client"

import type React from "react"
import type { Metadata } from "next"
import { Orbitron, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/contexts/language-context"
import { ContractProvider } from "@/contexts/contract-context"
import { AudioProvider } from "@/contexts/audio-context"
import { SuiClientProvider, WalletProvider, createNetworkConfig } from '@mysten/dapp-kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RPC_URL } from '@/lib/onechain'
import { Toaster } from "@/components/ui/sonner"
import { MusicModal } from "@/components/music-modal"
import "@mysten/dapp-kit/dist/index.css"
import "./globals.css"

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: 1000,
    },
  },
})

// OneChain network configuration
const { networkConfig } = createNetworkConfig({
  'onechain-testnet': {
    url: RPC_URL,
  },
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>OneTriangle | No-Loss Strategy GameFi</title>
        <meta name="description" content="A gamified savings protocol merging DeFi with Rock-Paper-Scissors strategy" />
        <link rel="icon" type="image/png" href="/onetriangle-logo.png" />
        <link rel="apple-touch-icon" href="/onetriangle-logo.png" />
      </head>
      <body className={`${orbitron.variable} ${geistMono.variable} font-sans antialiased`}>
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networkConfig} defaultNetwork="onechain-testnet">
            <WalletProvider
              autoConnect
              preferredWallets={['OneWallet']}
            >
              <ContractProvider>
                <AudioProvider>
                  <LanguageProvider>
                    {children}
                    <MusicModal />
                  </LanguageProvider>
                </AudioProvider>
              </ContractProvider>
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { Orbitron, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/contexts/language-context"
import "./globals.css"

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "OneTriangle | No-Loss Strategy GameFi",
  description: "A gamified savings protocol merging DeFi with Rock-Paper-Scissors strategy",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${orbitron.variable} ${geistMono.variable} font-sans antialiased`}>
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}

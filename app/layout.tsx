import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { StorageProvider } from "@/contexts/storage-context"
import { PublicEntriesProvider } from "@/contexts/public-entries-context"
import { ThemeProvider } from "@/contexts/theme-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Anonymous Diary - Decentralized Database",
  description: "Share your thoughts anonymously with AI-powered insights on Ceramic Network",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <StorageProvider>
              <PublicEntriesProvider>{children}</PublicEntriesProvider>
            </StorageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

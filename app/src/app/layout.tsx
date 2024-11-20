// src/app/layout.tsx
import { AuthProvider } from "@/lib/auth/auth-context"
import { ThemeProvider } from "@/lib/theme/theme-context"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Top 8 Friends",
  description: "Rank your Bluesky friends",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
// src/components/layout/base-layout.tsx
import { ReactNode } from "react"
import { Logo } from "@/components/ui/logo"

interface BaseLayoutProps {
  children: ReactNode
}

export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <div className="min-h-screen">
      <header className="bg-primary px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <Logo className="h-12 w-auto text-white" />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  )
}

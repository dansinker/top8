// src/lib/theme/theme-context.tsx
"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from "react"

type ThemeName = "pink" | "dark-blue" | "almond" | "vampire" | "toxic" | "shoes" | "angels" | "night" | "pastel"

interface ThemeContextType {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  themes: ThemeName[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const themes: ThemeName[] = [
  "pink",
  "dark-blue",
  "almond",
  "vampire",
  "toxic",
  "shoes",
  "angels",
  "night",
  "pastel"
]

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>("pink")

  useEffect(() => {
    const stored = localStorage.getItem("theme") as ThemeName | null
    if (stored && themes.includes(stored)) {
      setTheme(stored)
    }
  }, [])

  const handleSetTheme = (newTheme: ThemeName) => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

// src/components/theme/theme-picker.tsx
"use client"

import { useTheme } from "@/lib/theme/theme-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ThemePicker() {
  const { theme, setTheme, themes } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((themeName) => (
            <button
              key={themeName}
              onClick={() => setTheme(themeName)}
              className={`h-8 w-8 rounded-full border-2 ${
                theme === themeName ? "border-primary" : "border-transparent"
              }`}
              style={{
                backgroundColor: `var(--theme-${themeName})`
              }}
              title={themeName}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// src/components/theme/theme-picker.tsx
"use client";

import { useTheme } from "@/lib/theme/theme-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ThemeButtonProps {
    themeName: string;
    isSelected: boolean;
    onClick: () => void;
}

function ThemeButton({ themeName, isSelected, onClick }: ThemeButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`color-choice ${isSelected ? "selected" : ""}`}
            style={
                {
                    "--picker-color": `var(--theme-${themeName})`,
                } as React.CSSProperties
            }
            title={themeName.charAt(0).toUpperCase() + themeName.slice(1)}
        />
    );
}

export function ThemePicker() {
    const { theme, setTheme, themes } = useTheme();

    return (
        <Card className="box">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Theme</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="color-theme-container flex flex-wrap gap-2">
                    {themes.map((themeName) => (
                        <ThemeButton
                            key={themeName}
                            themeName={themeName}
                            isSelected={theme === themeName}
                            onClick={() => setTheme(themeName)}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

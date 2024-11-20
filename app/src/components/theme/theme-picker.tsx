"use client";

import { useTheme } from "@/lib/theme/theme-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ThemePicker() {
    const { theme, setTheme, themes } = useTheme();

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
                                theme === themeName
                                    ? "border-primary"
                                    : "border-transparent"
                            }`}
                            style={{
                                backgroundColor: `var(--theme-${themeName})`,
                            }}
                            title={themeName}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

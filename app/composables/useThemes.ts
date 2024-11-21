// composables/useTheme.ts
import { ref, computed, watchEffect } from "vue";

export interface ThemeColor {
    name: string;
    hex: string;
}

export interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
    accent: string;
}

export const PRESET_COLORS: ThemeColor[] = [
    { name: "Classic Blue", hex: "#0000FF" },
    { name: "Forest Green", hex: "#228B22" },
    { name: "Ruby Red", hex: "#E0115F" },
    { name: "Royal Purple", hex: "#7851A9" },
    { name: "Sunset Orange", hex: "#FD5E53" },
    { name: "Ocean Teal", hex: "#469990" },
    { name: "Lavender", hex: "#E6E6FA" },
    { name: "Rose Gold", hex: "#B76E79" },
    { name: "Midnight Blue", hex: "#191970" },
    { name: "Emerald", hex: "#50C878" },
    { name: "Burgundy", hex: "#800020" },
    { name: "Golden", hex: "#FFD700" },
];

// Create singleton state
const currentTheme = ref<ThemeColors>({
    primary: "#0000FF", // Default to Classic Blue
    secondary: "#FF6600",
    background: "#EDEEF3",
    text: "#000000",
    border: "#000099",
    accent: "#FF8533",
});
const baseColor = ref("#0000FF");

export function useTheme() {
    // Color utility functions
    const hexToRGB = (hex: string) => {
        const cleanHex = hex.replace("#", "");
        return {
            r: parseInt(cleanHex.substr(0, 2), 16),
            g: parseInt(cleanHex.substr(2, 2), 16),
            b: parseInt(cleanHex.substr(4, 2), 16),
        };
    };

    const rgbToHex = (r: number, g: number, b: number) => {
        return (
            "#" +
            [r, g, b]
                .map((x) => {
                    const hex = Math.max(0, Math.min(255, x)).toString(16);
                    return hex.length === 1 ? "0" + hex : hex;
                })
                .join("")
        );
    };

    const getComplementaryColor = (hex: string) => {
        const rgb = hexToRGB(hex);
        return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
    };

    const getVariant = (hex: string, percent: number) => {
        const rgb = hexToRGB(hex);
        const amount = Math.round(2.55 * percent);

        return rgbToHex(
            Math.max(0, Math.min(255, rgb.r + amount)),
            Math.max(0, Math.min(255, rgb.g + amount)),
            Math.max(0, Math.min(255, rgb.b + amount)),
        );
    };

    const getTextColor = (backgroundColor: string) => {
        const rgb = hexToRGB(backgroundColor);
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return luminance > 0.5 ? "#000000" : "#FFFFFF";
    };

    const setTheme = (newBaseColor: string) => {
        baseColor.value = newBaseColor;
        currentTheme.value = {
            primary: newBaseColor,
            secondary: getComplementaryColor(newBaseColor),
            background: getVariant(newBaseColor, 90),
            text: getTextColor(getVariant(newBaseColor, 90)),
            border: getVariant(newBaseColor, -20),
            accent: getVariant(getComplementaryColor(newBaseColor), 20),
        };
    };

    // Watch for theme changes and apply to CSS variables
    watchEffect(() => {
        const root = document.documentElement;
        Object.entries(currentTheme.value).forEach(([key, value]) => {
            root.style.setProperty(`--theme-${key}`, value);
        });
    });

    return {
        // State
        currentTheme,
        baseColor,

        // Computed
        availableColors: computed(() => PRESET_COLORS),
        colors: computed(() => currentTheme.value),

        // Actions
        setTheme,

        // Utility functions
        getComplementaryColor,
        getVariant,
        getTextColor,
    };
}

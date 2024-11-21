// composables/useTheme.ts

interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
    accent: string;
}

export const useTheme = () => {
    const profile = useProfile();

    // Compute complementary color
    const getComplementaryColor = (hex: string): string => {
        // Remove the hash if it exists
        hex = hex.replace("#", "");

        // Convert to RGB
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Get complementary values
        const rC = 255 - r;
        const gC = 255 - g;
        const bC = 255 - b;

        // Convert back to hex
        return `#${rC.toString(16).padStart(2, "0")}${gC.toString(16).padStart(2, "0")}${bC.toString(16).padStart(2, "0")}`;
    };

    // Get lighter/darker variant
    const getVariant = (hex: string, percent: number): string => {
        hex = hex.replace("#", "");

        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const amount = Math.round(2.55 * percent);

        const rNew = Math.max(Math.min(r + amount, 255), 0);
        const gNew = Math.max(Math.min(g + amount, 255), 0);
        const bNew = Math.max(Math.min(b + amount, 255), 0);

        return `#${rNew.toString(16).padStart(2, "0")}${gNew.toString(16).padStart(2, "0")}${bNew.toString(16).padStart(2, "0")}`;
    };

    // Get optimal text color (black or white) based on background
    const getTextColor = (backgroundColor: string): string => {
        const hex = backgroundColor.replace("#", "");
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Calculate relative luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        return luminance > 0.5 ? "#000000" : "#FFFFFF";
    };

    // Generate complete theme from base color
    const generateTheme = (baseColor: string): ThemeColors => {
        const secondary = getComplementaryColor(baseColor);
        const background = getVariant(baseColor, 90); // Lighter variant
        const border = getVariant(baseColor, -20); // Darker variant
        const accent = getVariant(secondary, 20); // Lighter complementary

        return {
            primary: baseColor,
            secondary,
            background,
            text: getTextColor(background),
            border,
            accent,
        };
    };

    // Get current theme colors
    const currentTheme = computed(() => {
        const baseColor = profile.currentTheme?.baseColor || "#003399"; // Classic blue default
        return generateTheme(baseColor);
    });

    // Apply theme to document
    const applyTheme = () => {
        const theme = currentTheme.value;

        // Apply theme colors to CSS variables
        const root = document.documentElement;
        root.style.setProperty("--theme-primary", theme.primary);
        root.style.setProperty("--theme-secondary", theme.secondary);
        root.style.setProperty("--theme-background", theme.background);
        root.style.setProperty("--theme-text", theme.text);
        root.style.setProperty("--theme-border", theme.border);
        root.style.setProperty("--theme-accent", theme.accent);
    };

    // Watch for theme changes
    watch(
        () => profile.currentTheme?.baseColor,
        () => {
            applyTheme();
        },
    );

    onMounted(() => {
        applyTheme();
    });

    return {
        currentTheme,
        generateTheme,
        getComplementaryColor,
        getVariant,
        getTextColor,
    };
};

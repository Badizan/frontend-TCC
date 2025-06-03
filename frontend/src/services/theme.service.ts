import { storageService } from './storage.service';
import { configService } from './config.service';

interface ThemeColors {
    primary: string;
    secondary: string;
    success: string;
    info: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: {
        primary: string;
        secondary: string;
        disabled: string;
        hint: string;
    };
    divider: string;
    [key: string]: any;
}

interface ThemeTypography {
    fontFamily: string;
    fontSize: number;
    fontWeight: {
        light: number;
        regular: number;
        medium: number;
        bold: number;
    };
    lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
    };
    letterSpacing: {
        tighter: string;
        tight: string;
        normal: string;
        wide: string;
        wider: string;
    };
    [key: string]: any;
}

interface ThemeSpacing {
    base: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    [key: string]: any;
}

interface ThemeBorderRadius {
    none: number;
    sm: number;
    base: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
    [key: string]: any;
}

interface ThemeShadows {
    none: string;
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    [key: string]: any;
}

interface ThemeTransitions {
    duration: {
        shortest: number;
        shorter: number;
        short: number;
        standard: number;
        complex: number;
        enteringScreen: number;
        leavingScreen: number;
    };
    easing: {
        easeInOut: string;
        easeOut: string;
        easeIn: string;
        sharp: string;
    };
    [key: string]: any;
}

interface ThemeZIndex {
    mobileStepper: number;
    speedDial: number;
    appBar: number;
    drawer: number;
    modal: number;
    snackbar: number;
    tooltip: number;
    [key: string]: any;
}

interface Theme {
    mode: 'light' | 'dark' | 'system';
    colors: ThemeColors;
    typography: ThemeTypography;
    spacing: ThemeSpacing;
    borderRadius: ThemeBorderRadius;
    shadows: ThemeShadows;
    transitions: ThemeTransitions;
    zIndex: ThemeZIndex;
    [key: string]: any;
}

class ThemeService {
    private theme: Theme;
    private readonly THEME_KEY = 'app_theme';
    private readonly DEFAULT_THEME: Theme = {
        mode: 'system',
        colors: {
            primary: '#1976d2',
            secondary: '#dc004e',
            success: '#4caf50',
            info: '#2196f3',
            warning: '#ff9800',
            error: '#f44336',
            background: '#ffffff',
            surface: '#ffffff',
            text: {
                primary: 'rgba(0, 0, 0, 0.87)',
                secondary: 'rgba(0, 0, 0, 0.6)',
                disabled: 'rgba(0, 0, 0, 0.38)',
                hint: 'rgba(0, 0, 0, 0.38)',
            },
            divider: 'rgba(0, 0, 0, 0.12)',
        },
        typography: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: 16,
            fontWeight: {
                light: 300,
                regular: 400,
                medium: 500,
                bold: 700,
            },
            lineHeight: {
                tight: 1.25,
                normal: 1.5,
                relaxed: 1.75,
            },
            letterSpacing: {
                tighter: '-0.05em',
                tight: '-0.025em',
                normal: '0',
                wide: '0.025em',
                wider: '0.05em',
            },
        },
        spacing: {
            base: 8,
            xs: 4,
            sm: 8,
            md: 16,
            lg: 24,
            xl: 32,
        },
        borderRadius: {
            none: 0,
            sm: 2,
            base: 4,
            md: 6,
            lg: 8,
            xl: 12,
            full: 9999,
        },
        shadows: {
            none: 'none',
            sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
        transitions: {
            duration: {
                shortest: 150,
                shorter: 200,
                short: 250,
                standard: 300,
                complex: 375,
                enteringScreen: 225,
                leavingScreen: 195,
            },
            easing: {
                easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
                easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
                easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
                sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
            },
        },
        zIndex: {
            mobileStepper: 1000,
            speedDial: 1050,
            appBar: 1100,
            drawer: 1200,
            modal: 1300,
            snackbar: 1400,
            tooltip: 1500,
        },
    };

    constructor() {
        this.theme = this.loadTheme();
        this.initialize();
    }

    private loadTheme(): Theme {
        return storageService.get<Theme>(this.THEME_KEY, this.DEFAULT_THEME);
    }

    private saveTheme(): void {
        storageService.set(this.THEME_KEY, this.theme);
    }

    private initialize(): void {
        this.applyTheme();
        this.setupSystemThemeListener();
    }

    private applyTheme(): void {
        const mode = this.getEffectiveMode();
        document.documentElement.setAttribute('data-theme', mode);
        document.documentElement.setAttribute('data-color-scheme', mode);
    }

    private setupSystemThemeListener(): void {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', () => {
                if (this.theme.mode === 'system') {
                    this.applyTheme();
                }
            });
        }
    }

    private getEffectiveMode(): 'light' | 'dark' {
        if (this.theme.mode === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return this.theme.mode;
    }

    getTheme(): Theme {
        return { ...this.theme };
    }

    setTheme(theme: Partial<Theme>): void {
        this.theme = {
            ...this.theme,
            ...theme,
        };
        this.saveTheme();
        this.applyTheme();
    }

    setMode(mode: 'light' | 'dark' | 'system'): void {
        this.theme.mode = mode;
        this.saveTheme();
        this.applyTheme();
    }

    toggleMode(): void {
        const currentMode = this.getEffectiveMode();
        this.setMode(currentMode === 'light' ? 'dark' : 'light');
    }

    // Color methods
    getColors(): ThemeColors {
        return { ...this.theme.colors };
    }

    setColors(colors: Partial<ThemeColors>): void {
        this.theme.colors = {
            ...this.theme.colors,
            ...colors,
        };
        this.saveTheme();
        this.applyTheme();
    }

    setPrimaryColor(color: string): void {
        this.theme.colors.primary = color;
        this.saveTheme();
        this.applyTheme();
    }

    setSecondaryColor(color: string): void {
        this.theme.colors.secondary = color;
        this.saveTheme();
        this.applyTheme();
    }

    // Typography methods
    getTypography(): ThemeTypography {
        return { ...this.theme.typography };
    }

    setTypography(typography: Partial<ThemeTypography>): void {
        this.theme.typography = {
            ...this.theme.typography,
            ...typography,
        };
        this.saveTheme();
        this.applyTheme();
    }

    setFontFamily(fontFamily: string): void {
        this.theme.typography.fontFamily = fontFamily;
        this.saveTheme();
        this.applyTheme();
    }

    setFontSize(fontSize: number): void {
        this.theme.typography.fontSize = fontSize;
        this.saveTheme();
        this.applyTheme();
    }

    // Spacing methods
    getSpacing(): ThemeSpacing {
        return { ...this.theme.spacing };
    }

    setSpacing(spacing: Partial<ThemeSpacing>): void {
        this.theme.spacing = {
            ...this.theme.spacing,
            ...spacing,
        };
        this.saveTheme();
        this.applyTheme();
    }

    // Border radius methods
    getBorderRadius(): ThemeBorderRadius {
        return { ...this.theme.borderRadius };
    }

    setBorderRadius(borderRadius: Partial<ThemeBorderRadius>): void {
        this.theme.borderRadius = {
            ...this.theme.borderRadius,
            ...borderRadius,
        };
        this.saveTheme();
        this.applyTheme();
    }

    // Shadow methods
    getShadows(): ThemeShadows {
        return { ...this.theme.shadows };
    }

    setShadows(shadows: Partial<ThemeShadows>): void {
        this.theme.shadows = {
            ...this.theme.shadows,
            ...shadows,
        };
        this.saveTheme();
        this.applyTheme();
    }

    // Transition methods
    getTransitions(): ThemeTransitions {
        return { ...this.theme.transitions };
    }

    setTransitions(transitions: Partial<ThemeTransitions>): void {
        this.theme.transitions = {
            ...this.theme.transitions,
            ...transitions,
        };
        this.saveTheme();
        this.applyTheme();
    }

    // Z-index methods
    getZIndex(): ThemeZIndex {
        return { ...this.theme.zIndex };
    }

    setZIndex(zIndex: Partial<ThemeZIndex>): void {
        this.theme.zIndex = {
            ...this.theme.zIndex,
            ...zIndex,
        };
        this.saveTheme();
        this.applyTheme();
    }

    // Utility methods
    getColor(name: string): string {
        return this.theme.colors[name] || '';
    }

    getSpacingValue(name: string): number {
        return this.theme.spacing[name] || 0;
    }

    getBorderRadiusValue(name: string): number {
        return this.theme.borderRadius[name] || 0;
    }

    getShadowValue(name: string): string {
        return this.theme.shadows[name] || '';
    }

    getTransitionValue(name: string): number {
        return this.theme.transitions.duration[name] || 0;
    }

    getZIndexValue(name: string): number {
        return this.theme.zIndex[name] || 0;
    }

    // Export/Import methods
    exportTheme(): string {
        return JSON.stringify(this.theme, null, 2);
    }

    importTheme(theme: string): void {
        try {
            const parsedTheme = JSON.parse(theme);
            this.theme = {
                ...this.DEFAULT_THEME,
                ...parsedTheme,
            };
            this.saveTheme();
            this.applyTheme();
        } catch (error) {
            throw new Error('Invalid theme format');
        }
    }

    resetTheme(): void {
        this.theme = { ...this.DEFAULT_THEME };
        this.saveTheme();
        this.applyTheme();
    }
}

export const themeService = new ThemeService(); 
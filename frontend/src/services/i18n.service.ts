import { storageService } from './storage.service';
import { configService } from './config.service';

interface Translation {
    [key: string]: string | Translation;
}

interface I18nConfig {
    defaultLanguage: string;
    fallbackLanguage: string;
    supportedLanguages: string[];
    loadPath: string;
    [key: string]: any;
}

class I18nService {
    private translations: Map<string, Translation> = new Map();
    private currentLanguage: string;
    private config: I18nConfig = {
        defaultLanguage: 'en',
        fallbackLanguage: 'en',
        supportedLanguages: ['en'],
        loadPath: '/locales',
    };

    constructor() {
        this.currentLanguage = this.loadLanguage();
        this.initialize();
    }

    private loadLanguage(): string {
        return storageService.get<string>('language', this.config.defaultLanguage);
    }

    private async initialize(): Promise<void> {
        await this.loadTranslation(this.currentLanguage);
    }

    private async loadTranslation(language: string): Promise<void> {
        try {
            const response = await fetch(`${this.config.loadPath}/${language}.json`);
            const translation = await response.json();
            this.translations.set(language, translation);
        } catch (error) {
            console.error(`Failed to load translation for ${language}:`, error);
            if (language !== this.config.fallbackLanguage) {
                await this.loadTranslation(this.config.fallbackLanguage);
            }
        }
    }

    setConfig(config: Partial<I18nConfig>): void {
        this.config = {
            ...this.config,
            ...config,
        };
    }

    async setLanguage(language: string): Promise<void> {
        if (!this.config.supportedLanguages.includes(language)) {
            throw new Error(`Language ${language} is not supported`);
        }

        if (!this.translations.has(language)) {
            await this.loadTranslation(language);
        }

        this.currentLanguage = language;
        storageService.set('language', language);
        configService.setLanguageCode(language);
    }

    getLanguage(): string {
        return this.currentLanguage;
    }

    getSupportedLanguages(): string[] {
        return [...this.config.supportedLanguages];
    }

    translate(key: string, params?: Record<string, string | number>): string {
        const translation = this.getTranslation(key);
        if (!translation) {
            return key;
        }

        if (params) {
            return this.interpolate(translation, params);
        }

        return translation;
    }

    private getTranslation(key: string): string | null {
        const keys = key.split('.');
        let translation = this.translations.get(this.currentLanguage);

        if (!translation) {
            translation = this.translations.get(this.config.fallbackLanguage);
        }

        if (!translation) {
            return null;
        }

        for (const k of keys) {
            translation = translation[k];
            if (!translation) {
                return null;
            }
        }

        return translation as string;
    }

    private interpolate(text: string, params: Record<string, string | number>): string {
        return text.replace(/\{(\w+)\}/g, (_, key) => {
            return params[key]?.toString() || `{${key}}`;
        });
    }

    // Date formatting
    formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
        const dateObj = new Date(date);
        return new Intl.DateTimeFormat(this.currentLanguage, options).format(dateObj);
    }

    formatDateShort(date: Date | string | number): string {
        return this.formatDate(date, { dateStyle: 'short' });
    }

    formatDateMedium(date: Date | string | number): string {
        return this.formatDate(date, { dateStyle: 'medium' });
    }

    formatDateLong(date: Date | string | number): string {
        return this.formatDate(date, { dateStyle: 'long' });
    }

    formatDateFull(date: Date | string | number): string {
        return this.formatDate(date, { dateStyle: 'full' });
    }

    // Time formatting
    formatTime(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
        const dateObj = new Date(date);
        return new Intl.DateTimeFormat(this.currentLanguage, {
            ...options,
            hour: 'numeric',
            minute: 'numeric',
        }).format(dateObj);
    }

    formatTimeShort(date: Date | string | number): string {
        return this.formatTime(date, { hour: 'numeric', minute: 'numeric' });
    }

    formatTimeMedium(date: Date | string | number): string {
        return this.formatTime(date, { hour: 'numeric', minute: 'numeric', second: 'numeric' });
    }

    formatTimeLong(date: Date | string | number): string {
        return this.formatTime(date, {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short',
        });
    }

    // Number formatting
    formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
        return new Intl.NumberFormat(this.currentLanguage, options).format(number);
    }

    formatCurrency(amount: number, currency: string, options?: Intl.NumberFormatOptions): string {
        return new Intl.NumberFormat(this.currentLanguage, {
            style: 'currency',
            currency,
            ...options,
        }).format(amount);
    }

    formatPercent(number: number, options?: Intl.NumberFormatOptions): string {
        return new Intl.NumberFormat(this.currentLanguage, {
            style: 'percent',
            ...options,
        }).format(number);
    }

    formatUnit(number: number, unit: string, options?: Intl.NumberFormatOptions): string {
        return new Intl.NumberFormat(this.currentLanguage, {
            style: 'unit',
            unit,
            ...options,
        }).format(number);
    }

    // Relative time formatting
    formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
        const formatter = new Intl.RelativeTimeFormat(this.currentLanguage);
        return formatter.format(value, unit);
    }

    // List formatting
    formatList(items: string[], options?: Intl.ListFormatOptions): string {
        const formatter = new Intl.ListFormat(this.currentLanguage, options);
        return formatter.format(items);
    }

    // Plural rules
    formatPlural(number: number, options: {
        one: string;
        other: string;
        zero?: string;
        two?: string;
        few?: string;
        many?: string;
    }): string {
        const formatter = new Intl.PluralRules(this.currentLanguage);
        const rule = formatter.select(number);
        return options[rule] || options.other;
    }

    // Collation
    compareStrings(a: string, b: string, options?: Intl.CollatorOptions): number {
        const collator = new Intl.Collator(this.currentLanguage, options);
        return collator.compare(a, b);
    }

    // Display names
    getLanguageName(language: string): string {
        return new Intl.DisplayNames(this.currentLanguage, { type: 'language' }).of(language) || language;
    }

    getRegionName(region: string): string {
        return new Intl.DisplayNames(this.currentLanguage, { type: 'region' }).of(region) || region;
    }

    getScriptName(script: string): string {
        return new Intl.DisplayNames(this.currentLanguage, { type: 'script' }).of(script) || script;
    }

    getCurrencyName(currency: string): string {
        return new Intl.DisplayNames(this.currentLanguage, { type: 'currency' }).of(currency) || currency;
    }

    // Direction
    getTextDirection(): 'ltr' | 'rtl' {
        return new Intl.Locale(this.currentLanguage).textInfo?.direction || 'ltr';
    }

    // Calendar
    getCalendarName(): string {
        return new Intl.Locale(this.currentLanguage).calendar || 'gregory';
    }

    // Numbering system
    getNumberingSystem(): string {
        return new Intl.Locale(this.currentLanguage).numberingSystem || 'latn';
    }

    // Time zone
    getTimeZone(): string {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    // First day of week
    getFirstDayOfWeek(): number {
        return new Intl.Locale(this.currentLanguage).weekInfo?.firstDay || 1;
    }

    // Weekend
    getWeekend(): number[] {
        return new Intl.Locale(this.currentLanguage).weekInfo?.weekend || [6, 7];
    }

    // Minimal days in first week
    getMinimalDaysInFirstWeek(): number {
        return new Intl.Locale(this.currentLanguage).weekInfo?.minimalDays || 1;
    }
}

export const i18nService = new I18nService(); 
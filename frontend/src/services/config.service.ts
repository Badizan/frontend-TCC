import { storageService } from './storage.service';
import { analyticsService } from './analytics.service';

interface Config {
    apiUrl: string;
    apiVersion: string;
    appName: string;
    appVersion: string;
    appDescription: string;
    appAuthor: string;
    appLicense: string;
    appRepository: string;
    appHomepage: string;
    appBugs: string;
    appKeywords: string[];
    appCategories: string[];
    appEngines: {
        node: string;
        npm: string;
    };
    appDependencies: Record<string, string>;
    appDevDependencies: Record<string, string>;
    appScripts: Record<string, string>;
    appConfig: {
        theme: {
            primary: string;
            secondary: string;
            accent: string;
            error: string;
            warning: string;
            info: string;
            success: string;
            background: string;
            surface: string;
            text: string;
            textSecondary: string;
            textDisabled: string;
            divider: string;
        };
        layout: {
            header: {
                height: number;
                fixed: boolean;
                clipped: boolean;
                elevated: boolean;
                color: string;
            };
            navigation: {
                width: number;
                mini: boolean;
                clipped: boolean;
                color: string;
            };
            footer: {
                height: number;
                fixed: boolean;
                elevated: boolean;
                color: string;
            };
        };
        features: {
            analytics: boolean;
            notifications: boolean;
            search: boolean;
            theme: boolean;
            language: boolean;
            currency: boolean;
            timezone: boolean;
            dateFormat: boolean;
            timeFormat: boolean;
            numberFormat: boolean;
        };
        security: {
            minPasswordLength: number;
            requireSpecialChars: boolean;
            requireNumbers: boolean;
            requireUppercase: boolean;
            requireLowercase: boolean;
            maxLoginAttempts: number;
            lockoutDuration: number;
            sessionTimeout: number;
            refreshTokenExpiry: number;
            accessTokenExpiry: number;
        };
        storage: {
            prefix: string;
            driver: 'local' | 'session' | 'memory';
            encryption: boolean;
            compression: boolean;
        };
        cache: {
            enabled: boolean;
            ttl: number;
            maxSize: number;
            driver: 'memory' | 'local' | 'session';
        };
        logging: {
            level: 'debug' | 'info' | 'warn' | 'error';
            format: 'json' | 'text';
            destination: 'console' | 'file' | 'remote';
            maxSize: number;
            maxFiles: number;
        };
        performance: {
            lazyLoad: boolean;
            preload: boolean;
            prefetch: boolean;
            compression: boolean;
            minification: boolean;
            caching: boolean;
        };
        seo: {
            title: string;
            description: string;
            keywords: string[];
            robots: string;
            canonical: string;
            og: {
                title: string;
                description: string;
                image: string;
                url: string;
                type: string;
                siteName: string;
            };
            twitter: {
                card: string;
                site: string;
                creator: string;
                title: string;
                description: string;
                image: string;
            };
        };
        social: {
            facebook: string;
            twitter: string;
            instagram: string;
            linkedin: string;
            github: string;
            youtube: string;
        };
        contact: {
            email: string;
            phone: string;
            address: string;
            hours: string;
        };
        legal: {
            terms: string;
            privacy: string;
            cookies: string;
            disclaimer: string;
        };
    };
}

class ConfigService {
    private config: Config;

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): Config {
        // Load config from environment variables
        const config: Config = {
            apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
            apiVersion: process.env.REACT_APP_API_VERSION || 'v1',
            appName: process.env.REACT_APP_NAME || 'TCC Site',
            appVersion: process.env.REACT_APP_VERSION || '1.0.0',
            appDescription: process.env.REACT_APP_DESCRIPTION || 'TCC Site Description',
            appAuthor: process.env.REACT_APP_AUTHOR || 'TCC Site Author',
            appLicense: process.env.REACT_APP_LICENSE || 'MIT',
            appRepository: process.env.REACT_APP_REPOSITORY || 'https://github.com/tcc-site',
            appHomepage: process.env.REACT_APP_HOMEPAGE || 'https://tcc-site.com',
            appBugs: process.env.REACT_APP_BUGS || 'https://github.com/tcc-site/issues',
            appKeywords: (process.env.REACT_APP_KEYWORDS || 'tcc,site').split(','),
            appCategories: (process.env.REACT_APP_CATEGORIES || 'education,research').split(','),
            appEngines: {
                node: process.env.REACT_APP_NODE_VERSION || '>=14.0.0',
                npm: process.env.REACT_APP_NPM_VERSION || '>=6.0.0',
            },
            appDependencies: {},
            appDevDependencies: {},
            appScripts: {},
            appConfig: {
                theme: {
                    primary: process.env.REACT_APP_THEME_PRIMARY || '#1976d2',
                    secondary: process.env.REACT_APP_THEME_SECONDARY || '#dc004e',
                    accent: process.env.REACT_APP_THEME_ACCENT || '#82b1ff',
                    error: process.env.REACT_APP_THEME_ERROR || '#f44336',
                    warning: process.env.REACT_APP_THEME_WARNING || '#ff9800',
                    info: process.env.REACT_APP_THEME_INFO || '#2196f3',
                    success: process.env.REACT_APP_THEME_SUCCESS || '#4caf50',
                    background: process.env.REACT_APP_THEME_BACKGROUND || '#ffffff',
                    surface: process.env.REACT_APP_THEME_SURFACE || '#ffffff',
                    text: process.env.REACT_APP_THEME_TEXT || '#000000',
                    textSecondary: process.env.REACT_APP_THEME_TEXT_SECONDARY || '#757575',
                    textDisabled: process.env.REACT_APP_THEME_TEXT_DISABLED || '#9e9e9e',
                    divider: process.env.REACT_APP_THEME_DIVIDER || '#e0e0e0',
                },
                layout: {
                    header: {
                        height: Number(process.env.REACT_APP_HEADER_HEIGHT) || 64,
                        fixed: process.env.REACT_APP_HEADER_FIXED === 'true',
                        clipped: process.env.REACT_APP_HEADER_CLIPPED === 'true',
                        elevated: process.env.REACT_APP_HEADER_ELEVATED === 'true',
                        color: process.env.REACT_APP_HEADER_COLOR || '#ffffff',
                    },
                    navigation: {
                        width: Number(process.env.REACT_APP_NAVIGATION_WIDTH) || 256,
                        mini: process.env.REACT_APP_NAVIGATION_MINI === 'true',
                        clipped: process.env.REACT_APP_NAVIGATION_CLIPPED === 'true',
                        color: process.env.REACT_APP_NAVIGATION_COLOR || '#ffffff',
                    },
                    footer: {
                        height: Number(process.env.REACT_APP_FOOTER_HEIGHT) || 64,
                        fixed: process.env.REACT_APP_FOOTER_FIXED === 'true',
                        elevated: process.env.REACT_APP_FOOTER_ELEVATED === 'true',
                        color: process.env.REACT_APP_FOOTER_COLOR || '#ffffff',
                    },
                },
                features: {
                    analytics: process.env.REACT_APP_FEATURE_ANALYTICS === 'true',
                    notifications: process.env.REACT_APP_FEATURE_NOTIFICATIONS === 'true',
                    search: process.env.REACT_APP_FEATURE_SEARCH === 'true',
                    theme: process.env.REACT_APP_FEATURE_THEME === 'true',
                    language: process.env.REACT_APP_FEATURE_LANGUAGE === 'true',
                    currency: process.env.REACT_APP_FEATURE_CURRENCY === 'true',
                    timezone: process.env.REACT_APP_FEATURE_TIMEZONE === 'true',
                    dateFormat: process.env.REACT_APP_FEATURE_DATE_FORMAT === 'true',
                    timeFormat: process.env.REACT_APP_FEATURE_TIME_FORMAT === 'true',
                    numberFormat: process.env.REACT_APP_FEATURE_NUMBER_FORMAT === 'true',
                },
                security: {
                    minPasswordLength: Number(process.env.REACT_APP_MIN_PASSWORD_LENGTH) || 8,
                    requireSpecialChars: process.env.REACT_APP_REQUIRE_SPECIAL_CHARS === 'true',
                    requireNumbers: process.env.REACT_APP_REQUIRE_NUMBERS === 'true',
                    requireUppercase: process.env.REACT_APP_REQUIRE_UPPERCASE === 'true',
                    requireLowercase: process.env.REACT_APP_REQUIRE_LOWERCASE === 'true',
                    maxLoginAttempts: Number(process.env.REACT_APP_MAX_LOGIN_ATTEMPTS) || 5,
                    lockoutDuration: Number(process.env.REACT_APP_LOCKOUT_DURATION) || 15,
                    sessionTimeout: Number(process.env.REACT_APP_SESSION_TIMEOUT) || 30,
                    refreshTokenExpiry: Number(process.env.REACT_APP_REFRESH_TOKEN_EXPIRY) || 7,
                    accessTokenExpiry: Number(process.env.REACT_APP_ACCESS_TOKEN_EXPIRY) || 1,
                },
                storage: {
                    prefix: process.env.REACT_APP_STORAGE_PREFIX || 'tcc_',
                    driver: (process.env.REACT_APP_STORAGE_DRIVER as 'local' | 'session' | 'memory') || 'local',
                    encryption: process.env.REACT_APP_STORAGE_ENCRYPTION === 'true',
                    compression: process.env.REACT_APP_STORAGE_COMPRESSION === 'true',
                },
                cache: {
                    enabled: process.env.REACT_APP_CACHE_ENABLED === 'true',
                    ttl: Number(process.env.REACT_APP_CACHE_TTL) || 3600,
                    maxSize: Number(process.env.REACT_APP_CACHE_MAX_SIZE) || 1000,
                    driver: (process.env.REACT_APP_CACHE_DRIVER as 'memory' | 'local' | 'session') || 'memory',
                },
                logging: {
                    level: (process.env.REACT_APP_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
                    format: (process.env.REACT_APP_LOG_FORMAT as 'json' | 'text') || 'text',
                    destination: (process.env.REACT_APP_LOG_DESTINATION as 'console' | 'file' | 'remote') || 'console',
                    maxSize: Number(process.env.REACT_APP_LOG_MAX_SIZE) || 5242880,
                    maxFiles: Number(process.env.REACT_APP_LOG_MAX_FILES) || 5,
                },
                performance: {
                    lazyLoad: process.env.REACT_APP_LAZY_LOAD === 'true',
                    preload: process.env.REACT_APP_PRELOAD === 'true',
                    prefetch: process.env.REACT_APP_PREFETCH === 'true',
                    compression: process.env.REACT_APP_COMPRESSION === 'true',
                    minification: process.env.REACT_APP_MINIFICATION === 'true',
                    caching: process.env.REACT_APP_CACHING === 'true',
                },
                seo: {
                    title: process.env.REACT_APP_SEO_TITLE || 'TCC Site',
                    description: process.env.REACT_APP_SEO_DESCRIPTION || 'TCC Site Description',
                    keywords: (process.env.REACT_APP_SEO_KEYWORDS || 'tcc,site').split(','),
                    robots: process.env.REACT_APP_SEO_ROBOTS || 'index,follow',
                    canonical: process.env.REACT_APP_SEO_CANONICAL || 'https://tcc-site.com',
                    og: {
                        title: process.env.REACT_APP_SEO_OG_TITLE || 'TCC Site',
                        description: process.env.REACT_APP_SEO_OG_DESCRIPTION || 'TCC Site Description',
                        image: process.env.REACT_APP_SEO_OG_IMAGE || 'https://tcc-site.com/og-image.jpg',
                        url: process.env.REACT_APP_SEO_OG_URL || 'https://tcc-site.com',
                        type: process.env.REACT_APP_SEO_OG_TYPE || 'website',
                        siteName: process.env.REACT_APP_SEO_OG_SITE_NAME || 'TCC Site',
                    },
                    twitter: {
                        card: process.env.REACT_APP_SEO_TWITTER_CARD || 'summary_large_image',
                        site: process.env.REACT_APP_SEO_TWITTER_SITE || '@tccsite',
                        creator: process.env.REACT_APP_SEO_TWITTER_CREATOR || '@tccsite',
                        title: process.env.REACT_APP_SEO_TWITTER_TITLE || 'TCC Site',
                        description: process.env.REACT_APP_SEO_TWITTER_DESCRIPTION || 'TCC Site Description',
                        image: process.env.REACT_APP_SEO_TWITTER_IMAGE || 'https://tcc-site.com/twitter-image.jpg',
                    },
                },
                social: {
                    facebook: process.env.REACT_APP_SOCIAL_FACEBOOK || 'https://facebook.com/tccsite',
                    twitter: process.env.REACT_APP_SOCIAL_TWITTER || 'https://twitter.com/tccsite',
                    instagram: process.env.REACT_APP_SOCIAL_INSTAGRAM || 'https://instagram.com/tccsite',
                    linkedin: process.env.REACT_APP_SOCIAL_LINKEDIN || 'https://linkedin.com/company/tccsite',
                    github: process.env.REACT_APP_SOCIAL_GITHUB || 'https://github.com/tccsite',
                    youtube: process.env.REACT_APP_SOCIAL_YOUTUBE || 'https://youtube.com/tccsite',
                },
                contact: {
                    email: process.env.REACT_APP_CONTACT_EMAIL || 'contact@tcc-site.com',
                    phone: process.env.REACT_APP_CONTACT_PHONE || '+1 234 567 890',
                    address: process.env.REACT_APP_CONTACT_ADDRESS || '123 TCC Street, City, Country',
                    hours: process.env.REACT_APP_CONTACT_HOURS || 'Monday - Friday: 9:00 AM - 5:00 PM',
                },
                legal: {
                    terms: process.env.REACT_APP_LEGAL_TERMS || 'https://tcc-site.com/terms',
                    privacy: process.env.REACT_APP_LEGAL_PRIVACY || 'https://tcc-site.com/privacy',
                    cookies: process.env.REACT_APP_LEGAL_COOKIES || 'https://tcc-site.com/cookies',
                    disclaimer: process.env.REACT_APP_LEGAL_DISCLAIMER || 'https://tcc-site.com/disclaimer',
                },
            },
        };

        return config;
    }

    getConfig(): Config {
        return this.config;
    }

    getApiUrl(): string {
        return this.config.apiUrl;
    }

    getApiVersion(): string {
        return this.config.apiVersion;
    }

    getAppName(): string {
        return this.config.appName;
    }

    getAppVersion(): string {
        return this.config.appVersion;
    }

    getAppDescription(): string {
        return this.config.appDescription;
    }

    getAppAuthor(): string {
        return this.config.appAuthor;
    }

    getAppLicense(): string {
        return this.config.appLicense;
    }

    getAppRepository(): string {
        return this.config.appRepository;
    }

    getAppHomepage(): string {
        return this.config.appHomepage;
    }

    getAppBugs(): string {
        return this.config.appBugs;
    }

    getAppKeywords(): string[] {
        return this.config.appKeywords;
    }

    getAppCategories(): string[] {
        return this.config.appCategories;
    }

    getAppEngines(): { node: string; npm: string } {
        return this.config.appEngines;
    }

    getAppDependencies(): Record<string, string> {
        return this.config.appDependencies;
    }

    getAppDevDependencies(): Record<string, string> {
        return this.config.appDevDependencies;
    }

    getAppScripts(): Record<string, string> {
        return this.config.appScripts;
    }

    getAppConfig(): Config['appConfig'] {
        return this.config.appConfig;
    }

    getTheme(): Config['appConfig']['theme'] {
        return this.config.appConfig.theme;
    }

    getLayout(): Config['appConfig']['layout'] {
        return this.config.appConfig.layout;
    }

    getFeatures(): Config['appConfig']['features'] {
        return this.config.appConfig.features;
    }

    getSecurity(): Config['appConfig']['security'] {
        return this.config.appConfig.security;
    }

    getStorage(): Config['appConfig']['storage'] {
        return this.config.appConfig.storage;
    }

    getCache(): Config['appConfig']['cache'] {
        return this.config.appConfig.cache;
    }

    getLogging(): Config['appConfig']['logging'] {
        return this.config.appConfig.logging;
    }

    getPerformance(): Config['appConfig']['performance'] {
        return this.config.appConfig.performance;
    }

    getSeo(): Config['appConfig']['seo'] {
        return this.config.appConfig.seo;
    }

    getSocial(): Config['appConfig']['social'] {
        return this.config.appConfig.social;
    }

    getContact(): Config['appConfig']['contact'] {
        return this.config.appConfig.contact;
    }

    getLegal(): Config['appConfig']['legal'] {
        return this.config.appConfig.legal;
    }

    isFeatureEnabled(feature: keyof Config['appConfig']['features']): boolean {
        return this.config.appConfig.features[feature];
    }

    isAnalyticsEnabled(): boolean {
        return this.isFeatureEnabled('analytics');
    }

    isNotificationsEnabled(): boolean {
        return this.isFeatureEnabled('notifications');
    }

    isSearchEnabled(): boolean {
        return this.isFeatureEnabled('search');
    }

    isThemeEnabled(): boolean {
        return this.isFeatureEnabled('theme');
    }

    isLanguageEnabled(): boolean {
        return this.isFeatureEnabled('language');
    }

    isCurrencyEnabled(): boolean {
        return this.isFeatureEnabled('currency');
    }

    isTimezoneEnabled(): boolean {
        return this.isFeatureEnabled('timezone');
    }

    isDateFormatEnabled(): boolean {
        return this.isFeatureEnabled('dateFormat');
    }

    isTimeFormatEnabled(): boolean {
        return this.isFeatureEnabled('timeFormat');
    }

    isNumberFormatEnabled(): boolean {
        return this.isFeatureEnabled('numberFormat');
    }

    isCacheEnabled(): boolean {
        return this.config.appConfig.cache.enabled;
    }

    isStorageEncryptionEnabled(): boolean {
        return this.config.appConfig.storage.encryption;
    }

    isStorageCompressionEnabled(): boolean {
        return this.config.appConfig.storage.compression;
    }

    isLazyLoadEnabled(): boolean {
        return this.config.appConfig.performance.lazyLoad;
    }

    isPreloadEnabled(): boolean {
        return this.config.appConfig.performance.preload;
    }

    isPrefetchEnabled(): boolean {
        return this.config.appConfig.performance.prefetch;
    }

    isCompressionEnabled(): boolean {
        return this.config.appConfig.performance.compression;
    }

    isMinificationEnabled(): boolean {
        return this.config.appConfig.performance.minification;
    }

    isCachingEnabled(): boolean {
        return this.config.appConfig.performance.caching;
    }
}

export const configService = new ConfigService(); 
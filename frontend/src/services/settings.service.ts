import { api } from './api';
import { localStorageService } from './storage.service';

interface Settings {
    theme: 'light' | 'dark' | 'system';
    language: string;
    currency: string;
    dateFormat: string;
    timeFormat: string;
    notifications: {
        email: boolean;
        push: boolean;
        desktop: boolean;
    };
    reminders: {
        enabled: boolean;
        daysBefore: number;
    };
    reports: {
        defaultPeriod: 'week' | 'month' | 'year';
        defaultFormat: 'pdf' | 'excel' | 'csv';
    };
    privacy: {
        shareData: boolean;
        analytics: boolean;
    };
}

class SettingsService {
    private readonly SETTINGS_KEY = 'settings';
    private defaultSettings: Settings = {
        theme: 'system',
        language: 'pt-BR',
        currency: 'BRL',
        dateFormat: 'dd/MM/yyyy',
        timeFormat: 'HH:mm',
        notifications: {
            email: true,
            push: true,
            desktop: true,
        },
        reminders: {
            enabled: true,
            daysBefore: 7,
        },
        reports: {
            defaultPeriod: 'month',
            defaultFormat: 'pdf',
        },
        privacy: {
            shareData: false,
            analytics: true,
        },
    };

    constructor() {
        this.initializeSettings();
    }

    private initializeSettings(): void {
        const savedSettings = localStorageService.get<Settings>(this.SETTINGS_KEY, null);
        if (!savedSettings) {
            localStorageService.set(this.SETTINGS_KEY, this.defaultSettings);
        }
    }

    async getSettings(): Promise<Settings> {
        try {
            const response = await api.get<Settings>('/settings');
            const settings = response.data;
            localStorageService.set(this.SETTINGS_KEY, settings);
            return settings;
        } catch (error) {
            return localStorageService.get(this.SETTINGS_KEY, this.defaultSettings);
        }
    }

    async updateSettings(settings: Partial<Settings>): Promise<Settings> {
        try {
            const response = await api.put<Settings>('/settings', settings);
            const updatedSettings = response.data;
            localStorageService.set(this.SETTINGS_KEY, updatedSettings);
            return updatedSettings;
        } catch (error) {
            const currentSettings = localStorageService.get(this.SETTINGS_KEY, this.defaultSettings);
            const updatedSettings = { ...currentSettings, ...settings };
            localStorageService.set(this.SETTINGS_KEY, updatedSettings);
            return updatedSettings;
        }
    }

    async resetSettings(): Promise<Settings> {
        try {
            await api.delete('/settings');
            localStorageService.set(this.SETTINGS_KEY, this.defaultSettings);
            return this.defaultSettings;
        } catch (error) {
            localStorageService.set(this.SETTINGS_KEY, this.defaultSettings);
            return this.defaultSettings;
        }
    }

    getTheme(): Settings['theme'] {
        const settings = localStorageService.get<Settings>(this.SETTINGS_KEY, this.defaultSettings);
        return settings.theme;
    }

    setTheme(theme: Settings['theme']): void {
        const settings = localStorageService.get<Settings>(this.SETTINGS_KEY, this.defaultSettings);
        settings.theme = theme;
        localStorageService.set(this.SETTINGS_KEY, settings);
        this.updateSettings({ theme });
    }

    getLanguage(): string {
        const settings = localStorageService.get<Settings>(this.SETTINGS_KEY, this.defaultSettings);
        return settings.language;
    }

    setLanguage(language: string): void {
        const settings = localStorageService.get<Settings>(this.SETTINGS_KEY, this.defaultSettings);
        settings.language = language;
        localStorageService.set(this.SETTINGS_KEY, settings);
        this.updateSettings({ language });
    }

    getNotifications(): Settings['notifications'] {
        const settings = localStorageService.get<Settings>(this.SETTINGS_KEY, this.defaultSettings);
        return settings.notifications;
    }

    setNotifications(notifications: Settings['notifications']): void {
        const settings = localStorageService.get<Settings>(this.SETTINGS_KEY, this.defaultSettings);
        settings.notifications = notifications;
        localStorageService.set(this.SETTINGS_KEY, settings);
        this.updateSettings({ notifications });
    }

    getReminders(): Settings['reminders'] {
        const settings = localStorageService.get<Settings>(this.SETTINGS_KEY, this.defaultSettings);
        return settings.reminders;
    }

    setReminders(reminders: Settings['reminders']): void {
        const settings = localStorageService.get<Settings>(this.SETTINGS_KEY, this.defaultSettings);
        settings.reminders = reminders;
        localStorageService.set(this.SETTINGS_KEY, settings);
        this.updateSettings({ reminders });
    }
}

export const settingsService = new SettingsService(); 
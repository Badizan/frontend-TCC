import { api } from './api';
import { analyticsService } from './analytics.service';
import { storageService } from './storage.service';
import { configService } from './config.service';
import { i18nService } from './i18n.service';

interface Notification {
    id: string;
    type: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message: string;
    icon?: string;
    duration?: number;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    action?: {
        label: string;
        onClick: () => void;
    };
    onClose?: () => void;
    createdAt: number;
    read: boolean;
    [key: string]: any;
}

interface NotificationOptions {
    type?: Notification['type'];
    title?: string;
    message: string;
    icon?: string;
    duration?: number;
    position?: Notification['position'];
    action?: Notification['action'];
    onClose?: () => void;
    [key: string]: any;
}

class NotificationService {
    private readonly STORAGE_KEY = 'notifications';
    private readonly MAX_NOTIFICATIONS = 100;
    private readonly DEFAULT_DURATION = 5000;
    private readonly DEFAULT_POSITION: Notification['position'] = 'top-right';

    private notifications: Notification[] = [];
    private listeners: ((notifications: Notification[]) => void)[] = [];

    constructor() {
        this.loadNotifications();
    }

    private loadNotifications(): void {
        this.notifications = storageService.get<Notification[]>(this.STORAGE_KEY, []);
    }

    private saveNotifications(): void {
        storageService.set(this.STORAGE_KEY, this.notifications);
    }

    private notifyListeners(): void {
        this.listeners.forEach((listener) => listener(this.notifications));
    }

    private createNotification(options: NotificationOptions): Notification {
        const id = Math.random().toString(36).substring(2, 15);
        const createdAt = Date.now();

        return {
            id,
            type: options.type || 'info',
            title: options.title || '',
            message: options.message,
            icon: options.icon,
            duration: options.duration || this.DEFAULT_DURATION,
            position: options.position || this.DEFAULT_POSITION,
            action: options.action,
            onClose: options.onClose,
            createdAt,
            read: false,
            ...options,
        };
    }

    private addNotification(notification: Notification): void {
        this.notifications.unshift(notification);

        if (this.notifications.length > this.MAX_NOTIFICATIONS) {
            this.notifications.pop();
        }

        this.saveNotifications();
        this.notifyListeners();

        if (configService.isAnalyticsEnabled()) {
            analyticsService.trackEvent('Notification', 'Show', notification.type, undefined, {
                title: notification.title,
                message: notification.message,
            });
        }
    }

    private removeNotification(id: string): void {
        const index = this.notifications.findIndex((notification) => notification.id === id);

        if (index !== -1) {
            const notification = this.notifications[index];
            this.notifications.splice(index, 1);
            this.saveNotifications();
            this.notifyListeners();

            if (notification.onClose) {
                notification.onClose();
            }

            if (configService.isAnalyticsEnabled()) {
                analyticsService.trackEvent('Notification', 'Close', notification.type, undefined, {
                    title: notification.title,
                    message: notification.message,
                });
            }
        }
    }

    private markNotificationAsRead(id: string): void {
        const notification = this.notifications.find((notification) => notification.id === id);

        if (notification && !notification.read) {
            notification.read = true;
            this.saveNotifications();
            this.notifyListeners();

            if (configService.isAnalyticsEnabled()) {
                analyticsService.trackEvent('Notification', 'Read', notification.type, undefined, {
                    title: notification.title,
                    message: notification.message,
                });
            }
        }
    }

    success(message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}): void {
        this.addNotification(
            this.createNotification({
                type: 'success',
                message,
                ...options,
            })
        );
    }

    info(message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}): void {
        this.addNotification(
            this.createNotification({
                type: 'info',
                message,
                ...options,
            })
        );
    }

    warning(message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}): void {
        this.addNotification(
            this.createNotification({
                type: 'warning',
                message,
                ...options,
            })
        );
    }

    error(message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}): void {
        this.addNotification(
            this.createNotification({
                type: 'error',
                message,
                ...options,
            })
        );
    }

    show(options: NotificationOptions): void {
        this.addNotification(this.createNotification(options));
    }

    close(id: string): void {
        this.removeNotification(id);
    }

    closeAll(): void {
        this.notifications = [];
        this.saveNotifications();
        this.notifyListeners();

        if (configService.isAnalyticsEnabled()) {
            analyticsService.trackEvent('Notification', 'CloseAll');
        }
    }

    markAsRead(id: string): void {
        this.markNotificationAsRead(id);
    }

    markAllAsRead(): void {
        this.notifications.forEach((notification) => {
            if (!notification.read) {
                notification.read = true;
            }
        });

        this.saveNotifications();
        this.notifyListeners();

        if (configService.isAnalyticsEnabled()) {
            analyticsService.trackEvent('Notification', 'ReadAll');
        }
    }

    getNotifications(): Notification[] {
        return [...this.notifications];
    }

    getUnreadNotifications(): Notification[] {
        return this.notifications.filter((notification) => !notification.read);
    }

    getUnreadCount(): number {
        return this.notifications.filter((notification) => !notification.read).length;
    }

    subscribe(listener: (notifications: Notification[]) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    clear(): void {
        this.notifications = [];
        this.saveNotifications();
        this.notifyListeners();

        if (configService.isAnalyticsEnabled()) {
            analyticsService.trackEvent('Notification', 'Clear');
        }
    }

    export(): string {
        return JSON.stringify(this.notifications, null, 2);
    }

    import(data: string): void {
        try {
            const notifications = JSON.parse(data);
            this.notifications = notifications;
            this.saveNotifications();
            this.notifyListeners();

            if (configService.isAnalyticsEnabled()) {
                analyticsService.trackEvent('Notification', 'Import', undefined, undefined, {
                    count: notifications.length,
                });
            }
        } catch (error) {
            throw new Error('Invalid notification data format');
        }
    }
}

export const notificationService = new NotificationService(); 
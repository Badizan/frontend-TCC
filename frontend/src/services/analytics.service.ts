import { configService } from './config.service';
import { storageService } from './storage.service';
import { authService } from './auth.service';

interface AnalyticsEvent {
    category: string;
    action: string;
    label?: string;
    value?: number;
    [key: string]: any;
}

interface AnalyticsPageView {
    path: string;
    title: string;
    referrer?: string;
    [key: string]: any;
}

interface AnalyticsUser {
    id: string;
    name: string;
    email: string;
    role: string;
    [key: string]: any;
}

interface AnalyticsSession {
    id: string;
    startTime: number;
    lastActivity: number;
    events: AnalyticsEvent[];
    pageViews: AnalyticsPageView[];
    [key: string]: any;
}

class AnalyticsService {
    private readonly SESSION_KEY = 'analytics_session';
    private readonly EVENTS_KEY = 'analytics_events';
    private readonly PAGE_VIEWS_KEY = 'analytics_page_views';
    private readonly USER_KEY = 'analytics_user';
    private readonly ENABLED_KEY = 'analytics_enabled';

    private session: AnalyticsSession | null = null;
    private events: AnalyticsEvent[] = [];
    private pageViews: AnalyticsPageView[] = [];
    private user: AnalyticsUser | null = null;
    private enabled: boolean = false;

    constructor() {
        this.loadState();
        this.setupEventListeners();
    }

    private loadState(): void {
        this.session = storageService.get<AnalyticsSession>(this.SESSION_KEY, null);
        this.events = storageService.get<AnalyticsEvent[]>(this.EVENTS_KEY, []);
        this.pageViews = storageService.get<AnalyticsPageView[]>(this.PAGE_VIEWS_KEY, []);
        this.user = storageService.get<AnalyticsUser>(this.USER_KEY, null);
        this.enabled = storageService.get<boolean>(this.ENABLED_KEY, false);
    }

    private saveState(): void {
        if (this.session) {
            storageService.set(this.SESSION_KEY, this.session);
        } else {
            storageService.remove(this.SESSION_KEY);
        }

        storageService.set(this.EVENTS_KEY, this.events);
        storageService.set(this.PAGE_VIEWS_KEY, this.pageViews);

        if (this.user) {
            storageService.set(this.USER_KEY, this.user);
        } else {
            storageService.remove(this.USER_KEY);
        }

        storageService.set(this.ENABLED_KEY, this.enabled);
    }

    private setupEventListeners(): void {
        // Track page views
        window.addEventListener('popstate', () => this.trackPageView());
        window.addEventListener('pushstate', () => this.trackPageView());

        // Track user activity
        window.addEventListener('click', () => this.updateLastActivity());
        window.addEventListener('keydown', () => this.updateLastActivity());
        window.addEventListener('scroll', () => this.updateLastActivity());

        // Track session end
        window.addEventListener('beforeunload', () => this.endSession());
    }

    private updateLastActivity(): void {
        if (this.session) {
            this.session.lastActivity = Date.now();
            this.saveState();
        }
    }

    private startSession(): void {
        this.session = {
            id: Math.random().toString(36).substring(2, 15),
            startTime: Date.now(),
            lastActivity: Date.now(),
            events: [],
            pageViews: [],
        };
        this.saveState();
    }

    private endSession(): void {
        if (this.session) {
            this.session.events = this.events;
            this.session.pageViews = this.pageViews;
            this.saveState();
        }
    }

    private createEvent(category: string, action: string, label?: string, value?: number, data?: Record<string, any>): AnalyticsEvent {
        return {
            category,
            action,
            label,
            value,
            timestamp: Date.now(),
            sessionId: this.session?.id,
            userId: this.user?.id,
            ...data,
        };
    }

    private createPageView(path: string, title: string, referrer?: string, data?: Record<string, any>): AnalyticsPageView {
        return {
            path,
            title,
            referrer,
            timestamp: Date.now(),
            sessionId: this.session?.id,
            userId: this.user?.id,
            ...data,
        };
    }

    enable(): void {
        this.enabled = true;
        this.startSession();
        this.saveState();
    }

    disable(): void {
        this.enabled = false;
        this.endSession();
        this.saveState();
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    setUser(user: AnalyticsUser | null): void {
        this.user = user;
        this.saveState();
    }

    getUser(): AnalyticsUser | null {
        return this.user;
    }

    trackEvent(category: string, action: string, label?: string, value?: number, data?: Record<string, any>): void {
        if (!this.enabled) return;

        const event = this.createEvent(category, action, label, value, data);
        this.events.push(event);
        this.saveState();

        // Send event to analytics server
        this.sendEvent(event);
    }

    trackPageView(path: string = window.location.pathname, title: string = document.title, referrer: string = document.referrer, data?: Record<string, any>): void {
        if (!this.enabled) return;

        const pageView = this.createPageView(path, title, referrer, data);
        this.pageViews.push(pageView);
        this.saveState();

        // Send page view to analytics server
        this.sendPageView(pageView);
    }

    trackError(error: Error, data?: Record<string, any>): void {
        if (!this.enabled) return;

        this.trackEvent('Error', error.name, error.message, undefined, {
            stack: error.stack,
            ...data,
        });
    }

    trackPerformance(metric: PerformanceEntry, data?: Record<string, any>): void {
        if (!this.enabled) return;

        this.trackEvent('Performance', metric.name, undefined, metric.duration, {
            entryType: metric.entryType,
            startTime: metric.startTime,
            ...data,
        });
    }

    trackUserTiming(category: string, variable: string, value: number, label?: string, data?: Record<string, any>): void {
        if (!this.enabled) return;

        this.trackEvent('UserTiming', category, label, value, {
            variable,
            ...data,
        });
    }

    trackException(description: string, fatal: boolean = false, data?: Record<string, any>): void {
        if (!this.enabled) return;

        this.trackEvent('Exception', description, undefined, fatal ? 1 : 0, data);
    }

    trackSocial(network: string, action: string, target: string, data?: Record<string, any>): void {
        if (!this.enabled) return;

        this.trackEvent('Social', network, target, undefined, {
            action,
            ...data,
        });
    }

    trackTiming(category: string, variable: string, value: number, label?: string, data?: Record<string, any>): void {
        if (!this.enabled) return;

        this.trackEvent('Timing', category, label, value, {
            variable,
            ...data,
        });
    }

    trackSearch(keyword: string, results?: number, data?: Record<string, any>): void {
        if (!this.enabled) return;

        this.trackEvent('Search', keyword, undefined, results, data);
    }

    trackEcommerce(transactionId: string, affiliation: string, revenue: number, tax: number, shipping: number, currency: string, data?: Record<string, any>): void {
        if (!this.enabled) return;

        this.trackEvent('Ecommerce', 'Transaction', undefined, revenue, {
            transactionId,
            affiliation,
            tax,
            shipping,
            currency,
            ...data,
        });
    }

    trackEcommerceItem(transactionId: string, name: string, sku: string, category: string, price: number, quantity: number, currency: string, data?: Record<string, any>): void {
        if (!this.enabled) return;

        this.trackEvent('Ecommerce', 'Item', undefined, price * quantity, {
            transactionId,
            name,
            sku,
            category,
            price,
            quantity,
            currency,
            ...data,
        });
    }

    trackCustomDimension(index: number, value: string, data?: Record<string, any>): void {
        if (!this.enabled) return;

        this.trackEvent('CustomDimension', `dimension${index}`, value, undefined, data);
    }

    trackCustomMetric(index: number, value: number, data?: Record<string, any>): void {
        if (!this.enabled) return;

        this.trackEvent('CustomMetric', `metric${index}`, undefined, value, data);
    }

    private async sendEvent(event: AnalyticsEvent): Promise<void> {
        try {
            const response = await fetch(`${configService.getApiUrl()}/analytics/event`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authService.getToken()}`,
                },
                body: JSON.stringify(event),
            });

            if (!response.ok) {
                throw new Error('Failed to send event');
            }
        } catch (error) {
            console.error('Error sending event:', error);
        }
    }

    private async sendPageView(pageView: AnalyticsPageView): Promise<void> {
        try {
            const response = await fetch(`${configService.getApiUrl()}/analytics/pageview`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authService.getToken()}`,
                },
                body: JSON.stringify(pageView),
            });

            if (!response.ok) {
                throw new Error('Failed to send page view');
            }
        } catch (error) {
            console.error('Error sending page view:', error);
        }
    }

    getEvents(): AnalyticsEvent[] {
        return [...this.events];
    }

    getPageViews(): AnalyticsPageView[] {
        return [...this.pageViews];
    }

    getSession(): AnalyticsSession | null {
        return this.session;
    }

    clearEvents(): void {
        this.events = [];
        this.saveState();
    }

    clearPageViews(): void {
        this.pageViews = [];
        this.saveState();
    }

    clearSession(): void {
        this.session = null;
        this.saveState();
    }

    clearAll(): void {
        this.events = [];
        this.pageViews = [];
        this.session = null;
        this.saveState();
    }

    exportData(): string {
        const data = {
            session: this.session,
            events: this.events,
            pageViews: this.pageViews,
            user: this.user,
        };
        return JSON.stringify(data, null, 2);
    }

    importData(data: string): void {
        try {
            const parsed = JSON.parse(data);
            this.session = parsed.session;
            this.events = parsed.events;
            this.pageViews = parsed.pageViews;
            this.user = parsed.user;
            this.saveState();
        } catch (error) {
            throw new Error('Invalid data format');
        }
    }
}

export const analyticsService = new AnalyticsService(); 
import { analyticsService } from './analytics.service';
import { configService } from './config.service';
import { storageService } from './storage.service';

type EventHandler = (...args: any[]) => void;

interface EventSubscription {
    handler: EventHandler;
    once: boolean;
    timestamp: number;
}

interface EventMetadata {
    timestamp: number;
    source?: string;
    [key: string]: any;
}

class EventService {
    private events: Map<string, EventSubscription[]> = new Map();
    private eventHistory: Array<{ event: string; args: any[]; metadata: EventMetadata }> = [];
    private readonly MAX_HISTORY: number = 1000;
    private readonly STORAGE_KEY: string = 'event_history';

    constructor() {
        this.loadEventHistory();
    }

    private loadEventHistory(): void {
        try {
            const history = storageService.get<typeof this.eventHistory>(this.STORAGE_KEY, []);
            this.eventHistory = history;
        } catch (error) {
            console.error('Error loading event history:', error);
            this.eventHistory = [];
        }
    }

    private saveEventHistory(): void {
        try {
            storageService.set(this.STORAGE_KEY, this.eventHistory);
        } catch (error) {
            console.error('Error saving event history:', error);
        }
    }

    private trackEvent(event: string, args: any[], metadata: EventMetadata): void {
        if (configService.isAnalyticsEnabled()) {
            analyticsService.trackEvent('Event', event, undefined, undefined, {
                args,
                metadata,
            });
        }
    }

    on(event: string, handler: EventHandler): () => void {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }

        const subscription: EventSubscription = {
            handler,
            once: false,
            timestamp: Date.now(),
        };

        this.events.get(event)!.push(subscription);

        return () => this.off(event, handler);
    }

    once(event: string, handler: EventHandler): () => void {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }

        const subscription: EventSubscription = {
            handler,
            once: true,
            timestamp: Date.now(),
        };

        this.events.get(event)!.push(subscription);

        return () => this.off(event, handler);
    }

    off(event: string, handler: EventHandler): void {
        if (!this.events.has(event)) return;

        const subscriptions = this.events.get(event)!;
        const index = subscriptions.findIndex((sub) => sub.handler === handler);

        if (index !== -1) {
            subscriptions.splice(index, 1);
        }

        if (subscriptions.length === 0) {
            this.events.delete(event);
        }
    }

    emit(event: string, ...args: any[]): void {
        if (!this.events.has(event)) return;

        const metadata: EventMetadata = {
            timestamp: Date.now(),
        };

        this.trackEvent(event, args, metadata);

        const subscriptions = this.events.get(event)!;
        const toRemove: number[] = [];

        subscriptions.forEach((subscription, index) => {
            try {
                subscription.handler(...args);
                if (subscription.once) {
                    toRemove.push(index);
                }
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });

        toRemove.reverse().forEach((index) => {
            subscriptions.splice(index, 1);
        });

        if (subscriptions.length === 0) {
            this.events.delete(event);
        }

        this.eventHistory.push({ event, args, metadata });
        if (this.eventHistory.length > this.MAX_HISTORY) {
            this.eventHistory.shift();
        }
        this.saveEventHistory();
    }

    getEventHistory(): Array<{ event: string; args: any[]; metadata: EventMetadata }> {
        return [...this.eventHistory];
    }

    clearEventHistory(): void {
        this.eventHistory = [];
        this.saveEventHistory();
    }

    getEventSubscribers(event: string): EventSubscription[] {
        return this.events.get(event) || [];
    }

    getEventCount(event: string): number {
        return this.events.get(event)?.length || 0;
    }

    hasEvent(event: string): boolean {
        return this.events.has(event);
    }

    getEvents(): string[] {
        return Array.from(this.events.keys());
    }

    removeAllListeners(event?: string): void {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }

    listenerCount(event: string): number {
        return this.events.get(event)?.length || 0;
    }

    getEventMetadata(event: string): EventMetadata[] {
        return this.eventHistory
            .filter((entry) => entry.event === event)
            .map((entry) => entry.metadata);
    }

    getEventArgs(event: string): any[][] {
        return this.eventHistory
            .filter((entry) => entry.event === event)
            .map((entry) => entry.args);
    }

    getEventTimestamps(event: string): number[] {
        return this.eventHistory
            .filter((entry) => entry.event === event)
            .map((entry) => entry.metadata.timestamp);
    }

    getEventFrequency(event: string, timeWindow: number): number {
        const now = Date.now();
        return this.eventHistory.filter(
            (entry) => entry.event === event && now - entry.metadata.timestamp <= timeWindow
        ).length;
    }

    getEventDistribution(timeWindow: number): Record<string, number> {
        const now = Date.now();
        const distribution: Record<string, number> = {};

        this.eventHistory
            .filter((entry) => now - entry.metadata.timestamp <= timeWindow)
            .forEach((entry) => {
                distribution[entry.event] = (distribution[entry.event] || 0) + 1;
            });

        return distribution;
    }

    getEventTimeline(timeWindow: number): Array<{ timestamp: number; event: string; args: any[] }> {
        const now = Date.now();
        return this.eventHistory
            .filter((entry) => now - entry.metadata.timestamp <= timeWindow)
            .map((entry) => ({
                timestamp: entry.metadata.timestamp,
                event: entry.event,
                args: entry.args,
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    exportEventHistory(): string {
        return JSON.stringify(this.eventHistory, null, 2);
    }

    importEventHistory(history: string): void {
        try {
            const parsedHistory = JSON.parse(history);
            this.eventHistory = parsedHistory;
            this.saveEventHistory();
        } catch (error) {
            throw new Error('Invalid event history format');
        }
    }
}

export const eventService = new EventService(); 
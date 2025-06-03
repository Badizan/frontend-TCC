import { analyticsService } from './analytics.service';

interface PerformanceMetric {
    name: string;
    value: number;
    timestamp: string;
}

interface PerformanceMark {
    name: string;
    startTime: number;
    duration?: number;
}

class PerformanceService {
    private marks: Map<string, PerformanceMark> = new Map();
    private metrics: PerformanceMetric[] = [];

    constructor() {
        this.initializePerformanceObserver();
    }

    private initializePerformanceObserver(): void {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.trackMetric(entry.name, entry.duration);
                }
            });

            observer.observe({ entryTypes: ['measure', 'resource', 'paint', 'largest-contentful-paint'] });
        }
    }

    startMeasure(name: string): void {
        if ('performance' in window) {
            performance.mark(`${name}-start`);
            this.marks.set(name, {
                name,
                startTime: performance.now(),
            });
        }
    }

    endMeasure(name: string): void {
        if ('performance' in window) {
            performance.mark(`${name}-end`);
            performance.measure(name, `${name}-start`, `${name}-end`);

            const mark = this.marks.get(name);
            if (mark) {
                mark.duration = performance.now() - mark.startTime;
                this.trackMetric(name, mark.duration);
            }

            this.marks.delete(name);
        }
    }

    private trackMetric(name: string, value: number): void {
        const metric: PerformanceMetric = {
            name,
            value,
            timestamp: new Date().toISOString(),
        };

        this.metrics.push(metric);
        analyticsService.trackEvent({
            category: 'Performance',
            action: 'Metric',
            label: name,
            value: Math.round(value),
        });
    }

    getMetrics(): PerformanceMetric[] {
        return [...this.metrics];
    }

    getMetricsByName(name: string): PerformanceMetric[] {
        return this.metrics.filter(metric => metric.name === name);
    }

    getAverageMetric(name: string): number {
        const metrics = this.getMetricsByName(name);
        if (metrics.length === 0) return 0;

        const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
        return sum / metrics.length;
    }

    getSlowestMetric(name: string): PerformanceMetric | undefined {
        const metrics = this.getMetricsByName(name);
        return metrics.reduce((slowest, current) =>
            current.value > (slowest?.value || 0) ? current : slowest
            , undefined);
    }

    clearMetrics(): void {
        this.metrics = [];
    }

    async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
        this.startMeasure(name);
        try {
            const result = await fn();
            return result;
        } finally {
            this.endMeasure(name);
        }
    }

    measureSync<T>(name: string, fn: () => T): T {
        this.startMeasure(name);
        try {
            const result = fn();
            return result;
        } finally {
            this.endMeasure(name);
        }
    }

    getResourceTiming(): PerformanceResourceTiming[] {
        if ('performance' in window) {
            return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        }
        return [];
    }

    getNavigationTiming(): PerformanceNavigationTiming | null {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            return navigation || null;
        }
        return null;
    }

    getPageLoadMetrics(): {
        loadTime: number;
        domContentLoaded: number;
        firstPaint: number;
        firstContentfulPaint: number;
    } {
        const navigation = this.getNavigationTiming();
        const paint = performance.getEntriesByType('paint');

        return {
            loadTime: navigation?.loadEventEnd || 0,
            domContentLoaded: navigation?.domContentLoadedEventEnd || 0,
            firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        };
    }
}

export const performanceService = new PerformanceService(); 
import { analyticsService } from './analytics.service';
import { configService } from './config.service';
import { storageService } from './storage.service';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: number;
    context?: Record<string, any>;
    stack?: string;
}

interface LogOptions {
    persist?: boolean;
    track?: boolean;
    maxSize?: number;
    maxAge?: number;
}

class LogService {
    private logs: LogEntry[] = [];
    private readonly STORAGE_KEY: string = 'app_logs';
    private readonly DEFAULT_MAX_SIZE: number = 1000;
    private readonly DEFAULT_MAX_AGE: number = 7 * 24 * 60 * 60 * 1000; // 7 days

    constructor() {
        this.loadLogs();
        this.cleanupLogs();
    }

    private loadLogs(): void {
        try {
            const storedLogs = storageService.get<LogEntry[]>(this.STORAGE_KEY, []);
            this.logs = storedLogs;
        } catch (error) {
            console.error('Error loading logs:', error);
            this.logs = [];
        }
    }

    private saveLogs(): void {
        try {
            storageService.set(this.STORAGE_KEY, this.logs);
        } catch (error) {
            console.error('Error saving logs:', error);
        }
    }

    private cleanupLogs(): void {
        const now = Date.now();
        this.logs = this.logs.filter((log) => {
            const age = now - log.timestamp;
            return age <= this.DEFAULT_MAX_AGE;
        });
        this.saveLogs();
    }

    private trackLog(entry: LogEntry): void {
        if (configService.isAnalyticsEnabled()) {
            analyticsService.trackEvent('Log', entry.level, undefined, undefined, {
                message: entry.message,
                context: entry.context,
                stack: entry.stack,
            });
        }
    }

    private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
        const entry: LogEntry = {
            level,
            message,
            timestamp: Date.now(),
            context,
        };

        if (level === 'error' || level === 'fatal') {
            entry.stack = new Error().stack;
        }

        return entry;
    }

    private addLog(entry: LogEntry, options: LogOptions = {}): void {
        const { persist = true, track = true, maxSize = this.DEFAULT_MAX_SIZE } = options;

        this.logs.push(entry);
        if (this.logs.length > maxSize) {
            this.logs.shift();
        }

        if (persist) {
            this.saveLogs();
        }

        if (track) {
            this.trackLog(entry);
        }

        if (configService.isDevelopment()) {
            const consoleMethod = entry.level === 'debug' ? 'debug' : entry.level;
            console[consoleMethod](entry.message, entry.context || '');
        }
    }

    debug(message: string, context?: Record<string, any>, options?: LogOptions): void {
        const entry = this.createLogEntry('debug', message, context);
        this.addLog(entry, options);
    }

    info(message: string, context?: Record<string, any>, options?: LogOptions): void {
        const entry = this.createLogEntry('info', message, context);
        this.addLog(entry, options);
    }

    warn(message: string, context?: Record<string, any>, options?: LogOptions): void {
        const entry = this.createLogEntry('warn', message, context);
        this.addLog(entry, options);
    }

    error(message: string, context?: Record<string, any>, options?: LogOptions): void {
        const entry = this.createLogEntry('error', message, context);
        this.addLog(entry, options);
    }

    fatal(message: string, context?: Record<string, any>, options?: LogOptions): void {
        const entry = this.createLogEntry('fatal', message, context);
        this.addLog(entry, options);
    }

    getLogs(level?: LogLevel): LogEntry[] {
        if (level) {
            return this.logs.filter((log) => log.level === level);
        }
        return [...this.logs];
    }

    getLogsByTimeRange(startTime: number, endTime: number): LogEntry[] {
        return this.logs.filter((log) => log.timestamp >= startTime && log.timestamp <= endTime);
    }

    getLogsByContext(key: string, value: any): LogEntry[] {
        return this.logs.filter((log) => log.context?.[key] === value);
    }

    getLogCount(level?: LogLevel): number {
        if (level) {
            return this.logs.filter((log) => log.level === level).length;
        }
        return this.logs.length;
    }

    clearLogs(): void {
        this.logs = [];
        this.saveLogs();
    }

    getLogLevels(): LogLevel[] {
        return ['debug', 'info', 'warn', 'error', 'fatal'];
    }

    getLogDistribution(): Record<LogLevel, number> {
        const distribution: Record<LogLevel, number> = {
            debug: 0,
            info: 0,
            warn: 0,
            error: 0,
            fatal: 0,
        };

        this.logs.forEach((log) => {
            distribution[log.level]++;
        });

        return distribution;
    }

    getLogTimeline(): Array<{ timestamp: number; level: LogLevel; message: string }> {
        return this.logs.map((log) => ({
            timestamp: log.timestamp,
            level: log.level,
            message: log.message,
        }));
    }

    getErrorLogs(): LogEntry[] {
        return this.logs.filter((log) => log.level === 'error' || log.level === 'fatal');
    }

    getWarningLogs(): LogEntry[] {
        return this.logs.filter((log) => log.level === 'warn');
    }

    getInfoLogs(): LogEntry[] {
        return this.logs.filter((log) => log.level === 'info');
    }

    getDebugLogs(): LogEntry[] {
        return this.logs.filter((log) => log.level === 'debug');
    }

    getLogsWithStack(): LogEntry[] {
        return this.logs.filter((log) => log.stack);
    }

    getLogsByMessage(message: string): LogEntry[] {
        return this.logs.filter((log) => log.message.includes(message));
    }

    getLogsByRegex(pattern: RegExp): LogEntry[] {
        return this.logs.filter((log) => pattern.test(log.message));
    }

    getLogsByLevelAndTimeRange(level: LogLevel, startTime: number, endTime: number): LogEntry[] {
        return this.logs.filter(
            (log) => log.level === level && log.timestamp >= startTime && log.timestamp <= endTime
        );
    }

    getLogsByLevelAndContext(level: LogLevel, key: string, value: any): LogEntry[] {
        return this.logs.filter((log) => log.level === level && log.context?.[key] === value);
    }

    getLogsByLevelAndMessage(level: LogLevel, message: string): LogEntry[] {
        return this.logs.filter((log) => log.level === level && log.message.includes(message));
    }

    getLogsByLevelAndRegex(level: LogLevel, pattern: RegExp): LogEntry[] {
        return this.logs.filter((log) => log.level === level && pattern.test(log.message));
    }

    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }

    importLogs(logs: string): void {
        try {
            const parsedLogs = JSON.parse(logs);
            this.logs = parsedLogs;
            this.saveLogs();
        } catch (error) {
            throw new Error('Invalid logs format');
        }
    }
}

export const logService = new LogService(); 
import { configService } from './config.service';
import { analyticsService } from './analytics.service';

interface StorageOptions {
    prefix?: string;
    driver?: 'local' | 'session' | 'memory';
    encryption?: boolean;
    compression?: boolean;
    ttl?: number;
    [key: string]: any;
}

interface StorageItem<T> {
    key: string;
    value: T;
    timestamp: number;
    ttl?: number;
    [key: string]: any;
}

class StorageService {
    private readonly prefix: string;
    private readonly driver: 'local' | 'session' | 'memory';
    private readonly encryption: boolean;
    private readonly compression: boolean;
    private readonly memory: Map<string, string>;

    constructor() {
        const config = configService.getStorage();
        this.prefix = config.prefix;
        this.driver = config.driver;
        this.encryption = config.encryption;
        this.compression = config.compression;
        this.memory = new Map();
    }

    private getKey(key: string): string {
        return `${this.prefix}${key}`;
    }

    private getStorage(): Storage {
        switch (this.driver) {
            case 'local':
                return window.localStorage;
            case 'session':
                return window.sessionStorage;
            case 'memory':
                return {
                    getItem: (key: string) => this.memory.get(key) || null,
                    setItem: (key: string, value: string) => this.memory.set(key, value),
                    removeItem: (key: string) => this.memory.delete(key),
                    clear: () => this.memory.clear(),
                    key: (index: number) => Array.from(this.memory.keys())[index],
                    length: this.memory.size,
                };
            default:
                return window.localStorage;
        }
    }

    private encrypt(value: string): string {
        if (!this.encryption) return value;

        try {
            // Implement encryption logic here
            return value;
        } catch (error) {
            console.error('Encryption error:', error);
            return value;
        }
    }

    private decrypt(value: string): string {
        if (!this.encryption) return value;

        try {
            // Implement decryption logic here
            return value;
        } catch (error) {
            console.error('Decryption error:', error);
            return value;
        }
    }

    private compress(value: string): string {
        if (!this.compression) return value;

        try {
            // Implement compression logic here
            return value;
        } catch (error) {
            console.error('Compression error:', error);
            return value;
        }
    }

    private decompress(value: string): string {
        if (!this.compression) return value;

        try {
            // Implement decompression logic here
            return value;
        } catch (error) {
            console.error('Decompression error:', error);
            return value;
        }
    }

    private serialize<T>(value: T): string {
        const serialized = JSON.stringify(value);
        const compressed = this.compress(serialized);
        return this.encrypt(compressed);
    }

    private deserialize<T>(value: string): T {
        const decrypted = this.decrypt(value);
        const decompressed = this.decompress(decrypted);
        return JSON.parse(decompressed);
    }

    private isExpired(item: StorageItem<any>): boolean {
        if (!item.ttl) return false;
        return Date.now() - item.timestamp > item.ttl;
    }

    get<T>(key: string, defaultValue: T): T {
        try {
            const storage = this.getStorage();
            const item = storage.getItem(this.getKey(key));

            if (!item) return defaultValue;

            const deserialized = this.deserialize<StorageItem<T>>(item);

            if (this.isExpired(deserialized)) {
                this.remove(key);
                return defaultValue;
            }

            if (configService.isAnalyticsEnabled()) {
                analyticsService.trackEvent('Storage', 'Get', key, undefined, {
                    driver: this.driver,
                    encryption: this.encryption,
                    compression: this.compression,
                });
            }

            return deserialized.value;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }

    set<T>(key: string, value: T, options: StorageOptions = {}): void {
        try {
            const storage = this.getStorage();
            const item: StorageItem<T> = {
                key: this.getKey(key),
                value,
                timestamp: Date.now(),
                ttl: options.ttl,
            };

            const serialized = this.serialize(item);
            storage.setItem(item.key, serialized);

            if (configService.isAnalyticsEnabled()) {
                analyticsService.trackEvent('Storage', 'Set', key, undefined, {
                    driver: this.driver,
                    encryption: this.encryption,
                    compression: this.compression,
                    ttl: options.ttl,
                });
            }
        } catch (error) {
            console.error('Storage set error:', error);
        }
    }

    remove(key: string): void {
        try {
            const storage = this.getStorage();
            storage.removeItem(this.getKey(key));

            if (configService.isAnalyticsEnabled()) {
                analyticsService.trackEvent('Storage', 'Remove', key, undefined, {
                    driver: this.driver,
                });
            }
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    }

    clear(): void {
        try {
            const storage = this.getStorage();
            storage.clear();

            if (configService.isAnalyticsEnabled()) {
                analyticsService.trackEvent('Storage', 'Clear', undefined, undefined, {
                    driver: this.driver,
                });
            }
        } catch (error) {
            console.error('Storage clear error:', error);
        }
    }

    has(key: string): boolean {
        try {
            const storage = this.getStorage();
            const item = storage.getItem(this.getKey(key));

            if (!item) return false;

            const deserialized = this.deserialize<StorageItem<any>>(item);
            return !this.isExpired(deserialized);
        } catch (error) {
            console.error('Storage has error:', error);
            return false;
        }
    }

    keys(): string[] {
        try {
            const storage = this.getStorage();
            const keys: string[] = [];

            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keys.push(key.slice(this.prefix.length));
                }
            }

            return keys;
        } catch (error) {
            console.error('Storage keys error:', error);
            return [];
        }
    }

    values<T>(): T[] {
        try {
            const storage = this.getStorage();
            const values: T[] = [];

            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    const item = storage.getItem(key);
                    if (item) {
                        const deserialized = this.deserialize<StorageItem<T>>(item);
                        if (!this.isExpired(deserialized)) {
                            values.push(deserialized.value);
                        }
                    }
                }
            }

            return values;
        } catch (error) {
            console.error('Storage values error:', error);
            return [];
        }
    }

    entries<T>(): [string, T][] {
        try {
            const storage = this.getStorage();
            const entries: [string, T][] = [];

            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    const item = storage.getItem(key);
                    if (item) {
                        const deserialized = this.deserialize<StorageItem<T>>(item);
                        if (!this.isExpired(deserialized)) {
                            entries.push([key.slice(this.prefix.length), deserialized.value]);
                        }
                    }
                }
            }

            return entries;
        } catch (error) {
            console.error('Storage entries error:', error);
            return [];
        }
    }

    size(): number {
        try {
            const storage = this.getStorage();
            let size = 0;

            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    const item = storage.getItem(key);
                    if (item) {
                        const deserialized = this.deserialize<StorageItem<any>>(item);
                        if (!this.isExpired(deserialized)) {
                            size++;
                        }
                    }
                }
            }

            return size;
        } catch (error) {
            console.error('Storage size error:', error);
            return 0;
        }
    }

    export(): string {
        try {
            const storage = this.getStorage();
            const data: Record<string, any> = {};

            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    const item = storage.getItem(key);
                    if (item) {
                        const deserialized = this.deserialize<StorageItem<any>>(item);
                        if (!this.isExpired(deserialized)) {
                            data[key.slice(this.prefix.length)] = deserialized.value;
                        }
                    }
                }
            }

            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Storage export error:', error);
            return '{}';
        }
    }

    import(data: string): void {
        try {
            const parsed = JSON.parse(data);
            const storage = this.getStorage();

            Object.entries(parsed).forEach(([key, value]) => {
                this.set(key, value);
            });

            if (configService.isAnalyticsEnabled()) {
                analyticsService.trackEvent('Storage', 'Import', undefined, undefined, {
                    driver: this.driver,
                    encryption: this.encryption,
                    compression: this.compression,
                    count: Object.keys(parsed).length,
                });
            }
        } catch (error) {
            console.error('Storage import error:', error);
            throw new Error('Invalid storage data format');
        }
    }
}

export const storageService = new StorageService(); 
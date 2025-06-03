interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class CacheService {
    private cache: Map<string, CacheItem<any>>;
    private defaultTTL: number;

    constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default TTL
        this.cache = new Map();
        this.defaultTTL = defaultTTL;
    }

    set<T>(key: string, data: T, ttl?: number): void {
        const timestamp = Date.now();
        const expiresAt = timestamp + (ttl || this.defaultTTL);

        this.cache.set(key, {
            data,
            timestamp,
            expiresAt,
        });
    }

    get<T>(key: string): T | null {
        const item = this.cache.get(key);

        if (!item) {
            return null;
        }

        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return item.data as T;
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    getExpiredKeys(): string[] {
        const now = Date.now();
        return Array.from(this.cache.entries())
            .filter(([_, item]) => now > item.expiresAt)
            .map(([key]) => key);
    }

    cleanup(): void {
        const expiredKeys = this.getExpiredKeys();
        expiredKeys.forEach(key => this.cache.delete(key));
    }

    getSize(): number {
        return this.cache.size;
    }

    getKeys(): string[] {
        return Array.from(this.cache.keys());
    }

    getValues<T>(): T[] {
        return Array.from(this.cache.values())
            .map(item => item.data as T);
    }

    getEntries<T>(): [string, T][] {
        return Array.from(this.cache.entries())
            .map(([key, item]) => [key, item.data as T]);
    }

    async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
        const cached = this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        const data = await fetchFn();
        this.set(key, data, ttl);
        return data;
    }

    setDefaultTTL(ttl: number): void {
        this.defaultTTL = ttl;
    }

    getDefaultTTL(): number {
        return this.defaultTTL;
    }

    getItemInfo(key: string): {
        exists: boolean;
        timestamp: number | null;
        expiresAt: number | null;
        age: number | null;
        timeToExpiry: number | null;
    } {
        const item = this.cache.get(key);
        const now = Date.now();

        if (!item) {
            return {
                exists: false,
                timestamp: null,
                expiresAt: null,
                age: null,
                timeToExpiry: null,
            };
        }

        return {
            exists: true,
            timestamp: item.timestamp,
            expiresAt: item.expiresAt,
            age: now - item.timestamp,
            timeToExpiry: item.expiresAt - now,
        };
    }
}

export const cacheService = new CacheService(); 
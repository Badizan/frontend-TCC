import { configService } from './config.service';
import { storageService } from './storage.service';
import { notificationService } from './notification.service';
import { analyticsService } from './analytics.service';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
    data?: any;
    timeout?: number;
    retry?: number;
    retryDelay?: number;
    cache?: boolean;
    cacheTTL?: number;
    [key: string]: any;
}

interface Response<T> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
    config: RequestOptions;
}

interface ErrorResponse {
    message: string;
    code: string;
    status: number;
    data?: any;
    [key: string]: any;
}

class ApiService {
    private readonly baseUrl: string;
    private readonly timeout: number;
    private readonly retry: number;
    private readonly retryDelay: number;
    private readonly cache: boolean;
    private readonly cacheTTL: number;
    private readonly headers: HeadersInit;

    constructor() {
        const config = configService.getConfig();
        this.baseUrl = config.apiUrl;
        this.timeout = 30000;
        this.retry = 3;
        this.retryDelay = 1000;
        this.cache = config.appConfig.cache.enabled;
        this.cacheTTL = config.appConfig.cache.ttl;
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }

    private getUrl(path: string, params?: Record<string, string>): string {
        const url = new URL(path, this.baseUrl);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }

        return url.toString();
    }

    private getCacheKey(path: string, params?: Record<string, string>): string {
        return `api_${path}_${JSON.stringify(params || {})}`;
    }

    private async getCachedResponse<T>(cacheKey: string): Promise<Response<T> | null> {
        if (!this.cache) return null;

        try {
            const cached = storageService.get<Response<T>>(cacheKey, null);
            if (!cached) return null;

            const now = Date.now();
            const timestamp = cached.config.timestamp || 0;
            const ttl = cached.config.cacheTTL || this.cacheTTL;

            if (now - timestamp > ttl) {
                storageService.remove(cacheKey);
                return null;
            }

            return cached;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    private async setCachedResponse<T>(cacheKey: string, response: Response<T>): Promise<void> {
        if (!this.cache) return;

        try {
            storageService.set(cacheKey, response, {
                ttl: response.config.cacheTTL || this.cacheTTL,
            });
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    private async handleResponse<T>(response: globalThis.Response, config: RequestOptions): Promise<Response<T>> {
        const data = await response.json();
        const headers = response.headers;

        return {
            data,
            status: response.status,
            statusText: response.statusText,
            headers,
            config: {
                ...config,
                timestamp: Date.now(),
            },
        };
    }

    private async handleError(error: any): Promise<never> {
        const errorResponse: ErrorResponse = {
            message: error.message || 'An error occurred',
            code: error.code || 'UNKNOWN_ERROR',
            status: error.status || 500,
            data: error.data,
        };

        if (configService.isAnalyticsEnabled()) {
            analyticsService.trackError(error, {
                url: error.config?.url,
                method: error.config?.method,
                status: error.status,
                code: error.code,
            });
        }

        notificationService.error(errorResponse.message);

        throw errorResponse;
    }

    private async request<T>(path: string, options: RequestOptions = {}): Promise<Response<T>> {
        const {
            params,
            data,
            timeout = this.timeout,
            retry = this.retry,
            retryDelay = this.retryDelay,
            cache = this.cache,
            cacheTTL = this.cacheTTL,
            ...rest
        } = options;

        const url = this.getUrl(path, params);
        const cacheKey = this.getCacheKey(path, params);
        const config: RequestOptions = {
            ...rest,
            params,
            data,
            timeout,
            retry,
            retryDelay,
            cache,
            cacheTTL,
        };

        if (cache) {
            const cached = await this.getCachedResponse<T>(cacheKey);
            if (cached) return cached;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...config,
                signal: controller.signal,
                headers: {
                    ...this.headers,
                    ...config.headers,
                },
                body: data ? JSON.stringify(data) : undefined,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw {
                    message: response.statusText,
                    code: `HTTP_${response.status}`,
                    status: response.status,
                    config,
                };
            }

            const result = await this.handleResponse<T>(response, config);

            if (cache) {
                await this.setCachedResponse(cacheKey, result);
            }

            return result;
        } catch (error: any) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw {
                    message: 'Request timeout',
                    code: 'TIMEOUT',
                    status: 408,
                    config,
                };
            }

            if (retry > 0) {
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
                return this.request<T>(path, {
                    ...config,
                    retry: retry - 1,
                });
            }

            throw error;
        }
    }

    async get<T>(path: string, options: RequestOptions = {}): Promise<Response<T>> {
        return this.request<T>(path, {
            ...options,
            method: 'GET',
        });
    }

    async post<T>(path: string, data?: any, options: RequestOptions = {}): Promise<Response<T>> {
        return this.request<T>(path, {
            ...options,
            method: 'POST',
            data,
        });
    }

    async put<T>(path: string, data?: any, options: RequestOptions = {}): Promise<Response<T>> {
        return this.request<T>(path, {
            ...options,
            method: 'PUT',
            data,
        });
    }

    async patch<T>(path: string, data?: any, options: RequestOptions = {}): Promise<Response<T>> {
        return this.request<T>(path, {
            ...options,
            method: 'PATCH',
            data,
        });
    }

    async delete<T>(path: string, options: RequestOptions = {}): Promise<Response<T>> {
        return this.request<T>(path, {
            ...options,
            method: 'DELETE',
        });
    }

    async head<T>(path: string, options: RequestOptions = {}): Promise<Response<T>> {
        return this.request<T>(path, {
            ...options,
            method: 'HEAD',
        });
    }

    async options<T>(path: string, options: RequestOptions = {}): Promise<Response<T>> {
        return this.request<T>(path, {
            ...options,
            method: 'OPTIONS',
        });
    }

    setHeader(key: string, value: string): void {
        this.headers[key] = value;
    }

    removeHeader(key: string): void {
        delete this.headers[key];
    }

    setToken(token: string): void {
        this.setHeader('Authorization', `Bearer ${token}`);
    }

    removeToken(): void {
        this.removeHeader('Authorization');
    }

    setBaseUrl(url: string): void {
        this.baseUrl = url;
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }

    setTimeout(timeout: number): void {
        this.timeout = timeout;
    }

    getTimeout(): number {
        return this.timeout;
    }

    setRetry(retry: number): void {
        this.retry = retry;
    }

    getRetry(): number {
        return this.retry;
    }

    setRetryDelay(delay: number): void {
        this.retryDelay = delay;
    }

    getRetryDelay(): number {
        return this.retryDelay;
    }

    setCache(enabled: boolean): void {
        this.cache = enabled;
    }

    isCacheEnabled(): boolean {
        return this.cache;
    }

    setCacheTTL(ttl: number): void {
        this.cacheTTL = ttl;
    }

    getCacheTTL(): number {
        return this.cacheTTL;
    }

    clearCache(): void {
        const keys = storageService.keys();
        keys.forEach((key) => {
            if (key.startsWith('api_')) {
                storageService.remove(key);
            }
        });
    }
}

export const apiService = new ApiService(); 
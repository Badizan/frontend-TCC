import { analyticsService } from './analytics.service';
import { configService } from './config.service';
import { storageService } from './storage.service';

interface Route {
    path: string;
    name: string;
    component: React.ComponentType<any>;
    exact?: boolean;
    private?: boolean;
    roles?: string[];
    meta?: {
        title?: string;
        description?: string;
        icon?: string;
        [key: string]: any;
    };
}

interface RouterState {
    currentRoute: Route | null;
    previousRoute: Route | null;
    params: Record<string, string>;
    query: Record<string, string>;
    hash: string;
}

class RouterService {
    private routes: Route[] = [];
    private state: RouterState = {
        currentRoute: null,
        previousRoute: null,
        params: {},
        query: {},
        hash: '',
    };
    private listeners: ((state: RouterState) => void)[] = [];

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        window.addEventListener('popstate', this.handlePopState.bind(this));
        this.handlePopState();
    }

    private handlePopState(): void {
        const { pathname, search, hash } = window.location;
        this.navigate(pathname + search + hash, false);
    }

    private parseUrl(url: string): {
        pathname: string;
        search: string;
        hash: string;
        query: Record<string, string>;
    } {
        const [pathname, searchHash] = url.split('?');
        const [search, hash] = (searchHash || '').split('#');
        const query: Record<string, string> = {};

        if (search) {
            search.split('&').forEach((param) => {
                const [key, value] = param.split('=');
                if (key) {
                    query[key] = decodeURIComponent(value || '');
                }
            });
        }

        return {
            pathname,
            search: search ? `?${search}` : '',
            hash: hash ? `#${hash}` : '',
            query,
        };
    }

    private matchRoute(pathname: string): {
        route: Route;
        params: Record<string, string>;
    } | null {
        for (const route of this.routes) {
            const pattern = route.path
                .replace(/:[^/]+/g, '([^/]+)')
                .replace(/\*/g, '.*');
            const regex = new RegExp(`^${pattern}$`);
            const match = pathname.match(regex);

            if (match) {
                const params: Record<string, string> = {};
                const paramNames = route.path.match(/:[^/]+/g) || [];
                paramNames.forEach((param, index) => {
                    params[param.slice(1)] = match[index + 1];
                });

                return { route, params };
            }
        }

        return null;
    }

    private updateState(route: Route | null, params: Record<string, string>, query: Record<string, string>, hash: string): void {
        this.state = {
            currentRoute: route,
            previousRoute: this.state.currentRoute,
            params,
            query,
            hash,
        };

        this.notifyListeners();
    }

    private notifyListeners(): void {
        this.listeners.forEach((listener) => listener(this.state));
    }

    registerRoutes(routes: Route[]): void {
        this.routes = routes;
    }

    navigate(url: string, pushState: boolean = true): void {
        const { pathname, search, hash, query } = this.parseUrl(url);
        const match = this.matchRoute(pathname);

        if (match) {
            const { route, params } = match;

            if (pushState) {
                window.history.pushState(null, '', url);
            }

            this.updateState(route, params, query, hash);

            if (configService.isAnalyticsEnabled()) {
                analyticsService.trackPageView(pathname, route.meta?.title || route.name);
            }

            if (route.meta?.title) {
                document.title = `${route.meta.title} - ${configService.getAppName()}`;
            }
        } else {
            this.navigate('/404');
        }
    }

    goBack(): void {
        window.history.back();
    }

    goForward(): void {
        window.history.forward();
    }

    subscribe(listener: (state: RouterState) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    getCurrentRoute(): Route | null {
        return this.state.currentRoute;
    }

    getPreviousRoute(): Route | null {
        return this.state.previousRoute;
    }

    getParams(): Record<string, string> {
        return { ...this.state.params };
    }

    getQuery(): Record<string, string> {
        return { ...this.state.query };
    }

    getHash(): string {
        return this.state.hash;
    }

    getState(): RouterState {
        return { ...this.state };
    }

    isPrivateRoute(): boolean {
        return this.state.currentRoute?.private || false;
    }

    hasRequiredRole(roles: string[]): boolean {
        if (!this.state.currentRoute?.roles) return true;
        return roles.some((role) => this.state.currentRoute?.roles?.includes(role));
    }

    getRouteMeta(): Record<string, any> {
        return this.state.currentRoute?.meta || {};
    }

    getRouteTitle(): string {
        return this.state.currentRoute?.meta?.title || this.state.currentRoute?.name || '';
    }

    getRouteDescription(): string {
        return this.state.currentRoute?.meta?.description || '';
    }

    getRouteIcon(): string {
        return this.state.currentRoute?.meta?.icon || '';
    }

    clearHistory(): void {
        window.history.replaceState(null, '', window.location.pathname);
    }

    saveScrollPosition(): void {
        const positions: Record<string, number> = storageService.get('scroll_positions', {});
        positions[window.location.pathname] = window.scrollY;
        storageService.set('scroll_positions', positions);
    }

    restoreScrollPosition(): void {
        const positions: Record<string, number> = storageService.get('scroll_positions', {});
        const position = positions[window.location.pathname] || 0;
        window.scrollTo(0, position);
    }
}

export const routerService = new RouterService(); 
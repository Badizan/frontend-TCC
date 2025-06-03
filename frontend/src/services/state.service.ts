import { storageService } from './storage.service';
import { analyticsService } from './analytics.service';
import { configService } from './config.service';

interface StateAction {
    type: string;
    payload?: any;
    meta?: {
        timestamp: number;
        [key: string]: any;
    };
}

interface StateReducer<T> {
    (state: T, action: StateAction): T;
}

interface StateSubscription<T> {
    (state: T, action: StateAction): void;
}

interface StateMiddleware {
    (action: StateAction, next: (action: StateAction) => void): void;
}

class StateService<T extends object> {
    private state: T;
    private reducers: Map<string, StateReducer<T>> = new Map();
    private subscriptions: Set<StateSubscription<T>> = new Set();
    private middlewares: StateMiddleware[] = [];
    private actionHistory: StateAction[] = [];
    private readonly STORAGE_KEY: string;
    private readonly MAX_HISTORY: number = 100;

    constructor(initialState: T, storageKey: string) {
        this.STORAGE_KEY = storageKey;
        this.state = this.loadState() || initialState;
    }

    private loadState(): T | null {
        try {
            return storageService.get<T>(this.STORAGE_KEY, null);
        } catch (error) {
            console.error('Error loading state:', error);
            return null;
        }
    }

    private saveState(): void {
        try {
            storageService.set(this.STORAGE_KEY, this.state);
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    private notifySubscribers(action: StateAction): void {
        this.subscriptions.forEach((subscription) => {
            try {
                subscription(this.state, action);
            } catch (error) {
                console.error('Error in state subscription:', error);
            }
        });
    }

    private trackAction(action: StateAction): void {
        if (configService.isAnalyticsEnabled()) {
            analyticsService.trackEvent('State', action.type, undefined, undefined, {
                payload: action.payload,
                meta: action.meta,
            });
        }
    }

    registerReducer(type: string, reducer: StateReducer<T>): void {
        this.reducers.set(type, reducer);
    }

    unregisterReducer(type: string): void {
        this.reducers.delete(type);
    }

    addMiddleware(middleware: StateMiddleware): void {
        this.middlewares.push(middleware);
    }

    removeMiddleware(middleware: StateMiddleware): void {
        this.middlewares = this.middlewares.filter((m) => m !== middleware);
    }

    subscribe(subscription: StateSubscription<T>): () => void {
        this.subscriptions.add(subscription);
        return () => {
            this.subscriptions.delete(subscription);
        };
    }

    dispatch(action: StateAction): void {
        const enhancedAction: StateAction = {
            ...action,
            meta: {
                ...action.meta,
                timestamp: Date.now(),
            },
        };

        const dispatchWithMiddleware = (action: StateAction): void => {
            const reducer = this.reducers.get(action.type);
            if (reducer) {
                const newState = reducer(this.state, action);
                this.state = newState;
                this.saveState();
                this.notifySubscribers(action);
                this.trackAction(action);
            }
        };

        const runMiddleware = (index: number, action: StateAction): void => {
            if (index === this.middlewares.length) {
                dispatchWithMiddleware(action);
                return;
            }

            const middleware = this.middlewares[index];
            middleware(action, (nextAction) => {
                runMiddleware(index + 1, nextAction);
            });
        };

        runMiddleware(0, enhancedAction);
        this.actionHistory.push(enhancedAction);

        if (this.actionHistory.length > this.MAX_HISTORY) {
            this.actionHistory.shift();
        }
    }

    getState(): T {
        return { ...this.state };
    }

    getActionHistory(): StateAction[] {
        return [...this.actionHistory];
    }

    clearActionHistory(): void {
        this.actionHistory = [];
    }

    resetState(initialState: T): void {
        this.state = initialState;
        this.saveState();
        this.notifySubscribers({
            type: 'RESET_STATE',
            payload: initialState,
            meta: { timestamp: Date.now() },
        });
    }

    select<K extends keyof T>(key: K): T[K] {
        return this.state[key];
    }

    setState(partialState: Partial<T>): void {
        this.state = {
            ...this.state,
            ...partialState,
        };
        this.saveState();
        this.notifySubscribers({
            type: 'SET_STATE',
            payload: partialState,
            meta: { timestamp: Date.now() },
        });
    }

    patchState(patches: Partial<T>[]): void {
        patches.forEach((patch) => {
            this.state = {
                ...this.state,
                ...patch,
            };
        });
        this.saveState();
        this.notifySubscribers({
            type: 'PATCH_STATE',
            payload: patches,
            meta: { timestamp: Date.now() },
        });
    }

    deleteState(keys: (keyof T)[]): void {
        const newState = { ...this.state };
        keys.forEach((key) => {
            delete newState[key];
        });
        this.state = newState;
        this.saveState();
        this.notifySubscribers({
            type: 'DELETE_STATE',
            payload: keys,
            meta: { timestamp: Date.now() },
        });
    }

    hasState(key: keyof T): boolean {
        return key in this.state;
    }

    getStateKeys(): (keyof T)[] {
        return Object.keys(this.state) as (keyof T)[];
    }

    getStateValues(): T[keyof T][] {
        return Object.values(this.state);
    }

    getStateEntries(): [keyof T, T[keyof T]][] {
        return Object.entries(this.state) as [keyof T, T[keyof T]][];
    }

    getStateSize(): number {
        return Object.keys(this.state).length;
    }

    isStateEmpty(): boolean {
        return this.getStateSize() === 0;
    }

    exportState(): string {
        return JSON.stringify(this.state, null, 2);
    }

    importState(state: string): void {
        try {
            const parsedState = JSON.parse(state);
            this.state = parsedState;
            this.saveState();
            this.notifySubscribers({
                type: 'IMPORT_STATE',
                payload: parsedState,
                meta: { timestamp: Date.now() },
            });
        } catch (error) {
            throw new Error('Invalid state format');
        }
    }
}

export const createStateService = <T extends object>(initialState: T, storageKey: string): StateService<T> => {
    return new StateService<T>(initialState, storageKey);
}; 
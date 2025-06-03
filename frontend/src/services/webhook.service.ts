import { api } from './api';

export interface Webhook {
    id: string;
    url: string;
    events: string[];
    secret: string;
    status: 'active' | 'inactive' | 'error';
    createdAt: string;
    updatedAt: string;
}

export interface CreateWebhookData {
    url: string;
    events: string[];
}

export interface WebhookEvent {
    id: string;
    webhookId: string;
    type: string;
    payload: Record<string, any>;
    status: 'success' | 'failed';
    response?: string;
    createdAt: string;
}

export const webhookService = {
    async getAll(): Promise<Webhook[]> {
        const response = await api.get<Webhook[]>('/webhooks');
        return response.data;
    },

    async getById(id: string): Promise<Webhook> {
        const response = await api.get<Webhook>(`/webhooks/${id}`);
        return response.data;
    },

    async create(data: CreateWebhookData): Promise<Webhook> {
        const response = await api.post<Webhook>('/webhooks', data);
        return response.data;
    },

    async update(id: string, data: Partial<CreateWebhookData>): Promise<Webhook> {
        const response = await api.put<Webhook>(`/webhooks/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/webhooks/${id}`);
    },

    async getEvents(webhookId: string): Promise<WebhookEvent[]> {
        const response = await api.get<WebhookEvent[]>(`/webhooks/${webhookId}/events`);
        return response.data;
    },

    async retryEvent(webhookId: string, eventId: string): Promise<WebhookEvent> {
        const response = await api.post<WebhookEvent>(`/webhooks/${webhookId}/events/${eventId}/retry`);
        return response.data;
    },
}; 
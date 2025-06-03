import { api } from './api';

export interface Integration {
    id: string;
    name: string;
    type: 'google' | 'microsoft' | 'apple' | 'other';
    status: 'active' | 'inactive' | 'error';
    config: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface IntegrationConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
}

export const integrationService = {
    async getAll(): Promise<Integration[]> {
        const response = await api.get<Integration[]>('/integrations');
        return response.data;
    },

    async getById(id: string): Promise<Integration> {
        const response = await api.get<Integration>(`/integrations/${id}`);
        return response.data;
    },

    async connect(type: Integration['type'], config: IntegrationConfig): Promise<Integration> {
        const response = await api.post<Integration>('/integrations/connect', {
            type,
            config
        });
        return response.data;
    },

    async disconnect(id: string): Promise<void> {
        await api.post(`/integrations/${id}/disconnect`);
    },

    async updateConfig(id: string, config: IntegrationConfig): Promise<Integration> {
        const response = await api.put<Integration>(`/integrations/${id}/config`, { config });
        return response.data;
    },

    async sync(id: string): Promise<void> {
        await api.post(`/integrations/${id}/sync`);
    },
}; 
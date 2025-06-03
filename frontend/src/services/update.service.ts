import { api } from './api';

export interface Update {
    id: string;
    version: string;
    title: string;
    description: string;
    type: 'feature' | 'bugfix' | 'improvement' | 'security';
    releaseDate: string;
    isRequired: boolean;
    downloadUrl?: string;
    size?: number;
}

export const updateService = {
    async checkForUpdates(): Promise<Update | null> {
        const response = await api.get<Update | null>('/updates/check');
        return response.data;
    },

    async getUpdateHistory(): Promise<Update[]> {
        const response = await api.get<Update[]>('/updates/history');
        return response.data;
    },

    async getLatestUpdate(): Promise<Update> {
        const response = await api.get<Update>('/updates/latest');
        return response.data;
    },

    async downloadUpdate(id: string): Promise<Blob> {
        const response = await api.get(`/updates/${id}/download`, {
            responseType: 'blob'
        });
        return response.data;
    },

    async installUpdate(id: string): Promise<void> {
        await api.post(`/updates/${id}/install`);
    },
}; 
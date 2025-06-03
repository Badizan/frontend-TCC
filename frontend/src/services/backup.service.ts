import { api } from './api';

export interface Backup {
    id: string;
    filename: string;
    size: number;
    createdAt: string;
}

export const backupService = {
    async create(): Promise<Backup> {
        const response = await api.post<Backup>('/backup');
        return response.data;
    },

    async getAll(): Promise<Backup[]> {
        const response = await api.get<Backup[]>('/backup');
        return response.data;
    },

    async download(id: string): Promise<Blob> {
        const response = await api.get(`/backup/${id}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    async restore(id: string): Promise<void> {
        await api.post(`/backup/${id}/restore`);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/backup/${id}`);
    },
}; 
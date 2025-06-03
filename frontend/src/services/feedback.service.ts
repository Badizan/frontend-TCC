import { api } from './api';

export interface Feedback {
    id: string;
    type: 'bug' | 'feature' | 'improvement' | 'other';
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    updatedAt: string;
}

export interface CreateFeedbackData {
    type: 'bug' | 'feature' | 'improvement' | 'other';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
}

export const feedbackService = {
    async create(data: CreateFeedbackData): Promise<Feedback> {
        const response = await api.post<Feedback>('/feedback', data);
        return response.data;
    },

    async getAll(): Promise<Feedback[]> {
        const response = await api.get<Feedback[]>('/feedback');
        return response.data;
    },

    async getById(id: string): Promise<Feedback> {
        const response = await api.get<Feedback>(`/feedback/${id}`);
        return response.data;
    },

    async updateStatus(id: string, status: Feedback['status']): Promise<Feedback> {
        const response = await api.put<Feedback>(`/feedback/${id}/status`, { status });
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/feedback/${id}`);
    },
}; 
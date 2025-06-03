import api from './api';

export const reminderService = {
    async findAll() {
        const response = await api.get('/reminders');
        return response.data;
    },
    async findById(id: string) {
        const response = await api.get(`/reminders/${id}`);
        return response.data;
    },
    async create(reminder: any) {
        const response = await api.post('/reminders', reminder);
        return response.data;
    },
    async update(id: string, reminder: any) {
        const response = await api.put(`/reminders/${id}`, reminder);
        return response.data;
    },
    async delete(id: string) {
        await api.delete(`/reminders/${id}`);
    },
}; 
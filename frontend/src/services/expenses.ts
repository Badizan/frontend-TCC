import api from './api';

export const expenseService = {
    async findAll() {
        const response = await api.get('/expenses');
        return response.data;
    },
    async findById(id: string) {
        const response = await api.get(`/expenses/${id}`);
        return response.data;
    },
    async create(expense: any) {
        const response = await api.post('/expenses', expense);
        return response.data;
    },
    async update(id: string, expense: any) {
        const response = await api.put(`/expenses/${id}`, expense);
        return response.data;
    },
    async delete(id: string) {
        await api.delete(`/expenses/${id}`);
    },
}; 
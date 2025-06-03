import { api } from './api';

export interface Expense {
    id: string;
    vehicleId: string;
    type: 'fuel' | 'maintenance' | 'insurance' | 'tax';
    amount: number;
    date: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateExpenseData {
    vehicleId: string;
    type: 'fuel' | 'maintenance' | 'insurance' | 'tax';
    amount: number;
    date: string;
    description: string;
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> { }

export const expenseService = {
    async getAll(): Promise<Expense[]> {
        const response = await api.get<Expense[]>('/expenses');
        return response.data;
    },

    async getById(id: string): Promise<Expense> {
        const response = await api.get<Expense>(`/expenses/${id}`);
        return response.data;
    },

    async getByVehicle(vehicleId: string): Promise<Expense[]> {
        const response = await api.get<Expense[]>(`/expenses/vehicle/${vehicleId}`);
        return response.data;
    },

    async create(data: CreateExpenseData): Promise<Expense> {
        const response = await api.post<Expense>('/expenses', data);
        return response.data;
    },

    async update(id: string, data: UpdateExpenseData): Promise<Expense> {
        const response = await api.put<Expense>(`/expenses/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/expenses/${id}`);
    }
}; 
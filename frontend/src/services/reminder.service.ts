import { api } from './api';

export interface Reminder {
    id: string;
    vehicleId: string;
    type: 'maintenance' | 'insurance' | 'tax' | 'other';
    description: string;
    dueDate: string;
    status: 'pending' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

export interface CreateReminderData {
    vehicleId: string;
    type: 'maintenance' | 'insurance' | 'tax' | 'other';
    description: string;
    dueDate: string;
}

export interface UpdateReminderData extends Partial<CreateReminderData> {
    status?: 'pending' | 'completed' | 'cancelled';
}

export const reminderService = {
    async getAll(): Promise<Reminder[]> {
        const response = await api.get<Reminder[]>('/reminders');
        return response.data;
    },

    async getById(id: string): Promise<Reminder> {
        const response = await api.get<Reminder>(`/reminders/${id}`);
        return response.data;
    },

    async getByVehicle(vehicleId: string): Promise<Reminder[]> {
        const response = await api.get<Reminder[]>(`/reminders/vehicle/${vehicleId}`);
        return response.data;
    },

    async create(data: CreateReminderData): Promise<Reminder> {
        const response = await api.post<Reminder>('/reminders', data);
        return response.data;
    },

    async update(id: string, data: UpdateReminderData): Promise<Reminder> {
        const response = await api.put<Reminder>(`/reminders/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/reminders/${id}`);
    }
}; 
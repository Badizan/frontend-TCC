import { api } from './api';

export interface ExpenseStats {
    total: number;
    byType: {
        fuel: number;
        maintenance: number;
        insurance: number;
        tax: number;
    };
    byMonth: {
        month: string;
        total: number;
        fuel: number;
        maintenance: number;
        insurance: number;
        tax: number;
    }[];
}

export interface VehicleStats {
    total: number;
    byFuelType: {
        gasoline: number;
        ethanol: number;
        diesel: number;
        flex: number;
    };
    averageMileage: number;
}

export interface ReminderStats {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    byType: {
        maintenance: number;
        insurance: number;
        tax: number;
        other: number;
    };
}

export const statsService = {
    async getExpenseStats(period?: 'week' | 'month' | 'year'): Promise<ExpenseStats> {
        const response = await api.get<ExpenseStats>('/stats/expenses', {
            params: { period }
        });
        return response.data;
    },

    async getVehicleStats(): Promise<VehicleStats> {
        const response = await api.get<VehicleStats>('/stats/vehicles');
        return response.data;
    },

    async getReminderStats(): Promise<ReminderStats> {
        const response = await api.get<ReminderStats>('/stats/reminders');
        return response.data;
    },
}; 
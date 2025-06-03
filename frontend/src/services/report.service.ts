import { api } from './api';

export interface ReportFilters {
    startDate?: string;
    endDate?: string;
    vehicleId?: string;
    type?: 'expenses' | 'maintenance' | 'fuel' | 'all';
}

export interface ExpenseReport {
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
    byVehicle: {
        vehicleId: string;
        brand: string;
        model: string;
        total: number;
        fuel: number;
        maintenance: number;
        insurance: number;
        tax: number;
    }[];
}

export interface MaintenanceReport {
    total: number;
    byType: {
        preventive: number;
        corrective: number;
    };
    byMonth: {
        month: string;
        total: number;
        preventive: number;
        corrective: number;
    }[];
    byVehicle: {
        vehicleId: string;
        brand: string;
        model: string;
        total: number;
        preventive: number;
        corrective: number;
    }[];
}

export interface FuelReport {
    total: number;
    byType: {
        gasoline: number;
        ethanol: number;
        diesel: number;
    };
    byMonth: {
        month: string;
        total: number;
        gasoline: number;
        ethanol: number;
        diesel: number;
    }[];
    byVehicle: {
        vehicleId: string;
        brand: string;
        model: string;
        total: number;
        gasoline: number;
        ethanol: number;
        diesel: number;
    }[];
}

export const reportService = {
    async getExpenseReport(filters?: ReportFilters): Promise<ExpenseReport> {
        const response = await api.get<ExpenseReport>('/reports/expenses', {
            params: filters
        });
        return response.data;
    },

    async getMaintenanceReport(filters?: ReportFilters): Promise<MaintenanceReport> {
        const response = await api.get<MaintenanceReport>('/reports/maintenance', {
            params: filters
        });
        return response.data;
    },

    async getFuelReport(filters?: ReportFilters): Promise<FuelReport> {
        const response = await api.get<FuelReport>('/reports/fuel', {
            params: filters
        });
        return response.data;
    },

    async exportReport(type: 'expenses' | 'maintenance' | 'fuel', filters?: ReportFilters): Promise<Blob> {
        const response = await api.get(`/reports/${type}/export`, {
            params: filters,
            responseType: 'blob'
        });
        return response.data;
    },
}; 
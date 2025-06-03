import api from './api';
import { Vehicle } from '../types';

export const vehicleService = {
    async findAll(): Promise<Vehicle[]> {
        try {
            const response = await api.get<Vehicle[]>('/vehicles');
            return response.data;
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            return [];
        }
    },

    async findById(id: string): Promise<Vehicle | null> {
        try {
            const response = await api.get<Vehicle>(`/vehicles/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching vehicle:', error);
            return null;
        }
    },

    async create(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle | null> {
        try {
            const response = await api.post<Vehicle>('/vehicles', vehicle);
            return response.data;
        } catch (error) {
            console.error('Error creating vehicle:', error);
            throw error;
        }
    },

    async update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle | null> {
        try {
            const response = await api.put<Vehicle>(`/vehicles/${id}`, vehicle);
            return response.data;
        } catch (error) {
            console.error('Error updating vehicle:', error);
            throw error;
        }
    },

    async delete(id: string): Promise<void> {
        try {
            await api.delete(`/vehicles/${id}`);
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            throw error;
        }
    },
}; 
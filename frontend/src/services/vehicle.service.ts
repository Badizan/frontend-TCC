import { api } from './api';

export interface Vehicle {
    id: string;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
    mileage: number;
    fuelType: 'gasoline' | 'ethanol' | 'diesel' | 'flex';
    createdAt: string;
    updatedAt: string;
}

export interface CreateVehicleData {
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
    mileage: number;
    fuelType: 'gasoline' | 'ethanol' | 'diesel' | 'flex';
}

export interface UpdateVehicleData extends Partial<CreateVehicleData> { }

export const vehicleService = {
    async getAll(): Promise<Vehicle[]> {
        const response = await api.get<Vehicle[]>('/vehicles');
        return response.data;
    },

    async getById(id: string): Promise<Vehicle> {
        const response = await api.get<Vehicle>(`/vehicles/${id}`);
        return response.data;
    },

    async create(data: CreateVehicleData): Promise<Vehicle> {
        const response = await api.post<Vehicle>('/vehicles', data);
        return response.data;
    },

    async update(id: string, data: UpdateVehicleData): Promise<Vehicle> {
        const response = await api.put<Vehicle>(`/vehicles/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/vehicles/${id}`);
    }
}; 
interface Vehicle {
    id: string;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
    mileage: number;
    lastMaintenance: string;
    nextMaintenance: string;
    status: 'active' | 'maintenance' | 'inactive';
}

const mockVehicles: Vehicle[] = [
    {
        id: '1',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        licensePlate: 'ABC1234',
        color: 'Prata',
        mileage: 45000,
        lastMaintenance: '2023-12-15',
        nextMaintenance: '2024-06-15',
        status: 'active'
    },
    {
        id: '2',
        brand: 'Honda',
        model: 'Civic',
        year: 2021,
        licensePlate: 'DEF5678',
        color: 'Preto',
        mileage: 30000,
        lastMaintenance: '2024-01-10',
        nextMaintenance: '2024-07-10',
        status: 'active'
    },
    {
        id: '3',
        brand: 'Volkswagen',
        model: 'Golf',
        year: 2019,
        licensePlate: 'GHI9012',
        color: 'Branco',
        mileage: 60000,
        lastMaintenance: '2024-02-01',
        nextMaintenance: '2024-08-01',
        status: 'maintenance'
    }
];

class VehicleService {
    async getVehicles(): Promise<Vehicle[]> {
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        return mockVehicles;
    }

    async getVehicle(id: string): Promise<Vehicle | null> {
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockVehicles.find(vehicle => vehicle.id === id) || null;
    }

    async createVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newVehicle = {
            ...vehicle,
            id: String(mockVehicles.length + 1)
        };
        mockVehicles.push(newVehicle);
        return newVehicle;
    }

    async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        const index = mockVehicles.findIndex(v => v.id === id);
        if (index === -1) {
            throw new Error('Veículo não encontrado');
        }
        mockVehicles[index] = { ...mockVehicles[index], ...vehicle };
        return mockVehicles[index];
    }

    async deleteVehicle(id: string): Promise<void> {
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        const index = mockVehicles.findIndex(v => v.id === id);
        if (index === -1) {
            throw new Error('Veículo não encontrado');
        }
        mockVehicles.splice(index, 1);
    }
}

export const vehicleService = new VehicleService(); 
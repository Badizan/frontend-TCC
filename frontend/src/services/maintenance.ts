interface Maintenance {
    id: string;
    vehicleId: string;
    type: 'preventive' | 'corrective';
    description: string;
    date: string;
    cost: number;
    mileage: number;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    nextMaintenance?: string;
}

const mockMaintenances: Maintenance[] = [
    {
        id: '1',
        vehicleId: '1',
        type: 'preventive',
        description: 'Troca de óleo e filtros',
        date: '2024-03-15',
        cost: 350.00,
        mileage: 45000,
        status: 'scheduled',
        nextMaintenance: '2024-09-15'
    },
    {
        id: '2',
        vehicleId: '2',
        type: 'corrective',
        description: 'Substituição de pastilhas de freio',
        date: '2024-02-20',
        cost: 280.00,
        mileage: 30000,
        status: 'completed'
    },
    {
        id: '3',
        vehicleId: '3',
        type: 'preventive',
        description: 'Revisão geral',
        date: '2024-03-01',
        cost: 500.00,
        mileage: 60000,
        status: 'in_progress'
    }
];

class MaintenanceService {
    async getMaintenances(): Promise<Maintenance[]> {
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        return mockMaintenances;
    }

    async getMaintenance(id: string): Promise<Maintenance | null> {
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockMaintenances.find(maintenance => maintenance.id === id) || null;
    }

    async getVehicleMaintenances(vehicleId: string): Promise<Maintenance[]> {
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        return mockMaintenances.filter(maintenance => maintenance.vehicleId === vehicleId);
    }

    async createMaintenance(maintenance: Omit<Maintenance, 'id'>): Promise<Maintenance> {
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newMaintenance = {
            ...maintenance,
            id: String(mockMaintenances.length + 1)
        };
        mockMaintenances.push(newMaintenance);
        return newMaintenance;
    }

    async updateMaintenance(id: string, maintenance: Partial<Maintenance>): Promise<Maintenance> {
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        const index = mockMaintenances.findIndex(m => m.id === id);
        if (index === -1) {
            throw new Error('Manutenção não encontrada');
        }
        mockMaintenances[index] = { ...mockMaintenances[index], ...maintenance };
        return mockMaintenances[index];
    }

    async deleteMaintenance(id: string): Promise<void> {
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        const index = mockMaintenances.findIndex(m => m.id === id);
        if (index === -1) {
            throw new Error('Manutenção não encontrada');
        }
        mockMaintenances.splice(index, 1);
    }
}

export const maintenanceService = new MaintenanceService(); 
import { Vehicle, MaintenanceService, MaintenanceReminder, Expense, VehicleStats } from '../types';
import { addDays, subDays, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Mock Vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    name: 'Meu Carro Principal',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    licensePlate: 'ABC1234',
    currentMileage: 45000,
    fuelType: 'flex',
    image: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800',
    createdAt: new Date(2022, 1, 15),
    updatedAt: new Date(2023, 3, 10),
  },
  {
    id: '2',
    name: 'Carro da Família',
    brand: 'Honda',
    model: 'HR-V',
    year: 2019,
    licensePlate: 'DEF5678',
    currentMileage: 62000,
    fuelType: 'flex',
    image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800',
    createdAt: new Date(2021, 8, 22),
    updatedAt: new Date(2023, 2, 18),
  },
];

// Mock Maintenance Services
export const mockMaintenanceServices: MaintenanceService[] = [
  {
    id: '1',
    vehicleId: '1',
    serviceType: 'Troca de Óleo',
    description: 'Troca de óleo e filtro',
    date: subDays(new Date(), 45),
    mileage: 40000,
    cost: 280,
    nextServiceDate: addDays(new Date(), 15),
    nextServiceMileage: 50000,
    provider: 'Oficina Central',
    notes: 'Óleo sintético 5W30',
    createdAt: subDays(new Date(), 45),
    updatedAt: subDays(new Date(), 45),
  },
  {
    id: '2',
    vehicleId: '1',
    serviceType: 'Revisão',
    description: 'Revisão completa dos 40.000 km',
    date: subDays(new Date(), 30),
    mileage: 40000,
    cost: 850,
    nextServiceDate: addDays(new Date(), 180),
    nextServiceMileage: 50000,
    provider: 'Concessionária Toyota',
    notes: 'Troca de óleo, filtros, verificação de freios e suspensão',
    createdAt: subDays(new Date(), 30),
    updatedAt: subDays(new Date(), 30),
  },
  {
    id: '3',
    vehicleId: '1',
    serviceType: 'Freios',
    description: 'Troca de pastilhas de freio dianteiras',
    date: subDays(new Date(), 90),
    mileage: 38000,
    cost: 350,
    nextServiceMileage: 60000,
    provider: 'Oficina Central',
    createdAt: subDays(new Date(), 90),
    updatedAt: subDays(new Date(), 90),
  },
  {
    id: '4',
    vehicleId: '2',
    serviceType: 'Troca de Óleo',
    description: 'Troca de óleo e filtro',
    date: subDays(new Date(), 15),
    mileage: 60000,
    cost: 300,
    nextServiceDate: addDays(new Date(), 75),
    nextServiceMileage: 65000,
    provider: 'Oficina Express',
    notes: 'Óleo sintético',
    createdAt: subDays(new Date(), 15),
    updatedAt: subDays(new Date(), 15),
  },
];

// Mock Maintenance Reminders
export const mockMaintenanceReminders: MaintenanceReminder[] = [
  {
    id: '1',
    vehicleId: '1',
    serviceType: 'Troca de Óleo',
    description: 'Troca de óleo e filtro do motor',
    dueDate: addDays(new Date(), 15),
    dueMileage: 50000,
    isCompleted: false,
    createdAt: subDays(new Date(), 45),
    updatedAt: subDays(new Date(), 45),
  },
  {
    id: '2',
    vehicleId: '1',
    serviceType: 'Revisão',
    description: 'Revisão completa dos 50.000 km',
    dueDate: addDays(new Date(), 45),
    dueMileage: 50000,
    isCompleted: false,
    createdAt: subDays(new Date(), 30),
    updatedAt: subDays(new Date(), 30),
  },
  {
    id: '3',
    vehicleId: '2',
    serviceType: 'Troca de Pneus',
    description: 'Verificar desgaste e trocar se necessário',
    dueDate: addDays(new Date(), 30),
    dueMileage: 65000,
    isCompleted: false,
    createdAt: subDays(new Date(), 60),
    updatedAt: subDays(new Date(), 60),
  },
];

// Mock Expenses
export const mockExpenses: Expense[] = [
  {
    id: '1',
    vehicleId: '1',
    category: 'maintenance',
    description: 'Troca de óleo e filtro',
    amount: 280,
    date: subDays(new Date(), 45),
    createdAt: subDays(new Date(), 45),
    updatedAt: subDays(new Date(), 45),
  },
  {
    id: '2',
    vehicleId: '1',
    category: 'maintenance',
    description: 'Revisão completa dos 40.000 km',
    amount: 850,
    date: subDays(new Date(), 30),
    createdAt: subDays(new Date(), 30),
    updatedAt: subDays(new Date(), 30),
  },
  {
    id: '3',
    vehicleId: '1',
    category: 'fuel',
    description: 'Abastecimento gasolina',
    amount: 200,
    date: subDays(new Date(), 20),
    createdAt: subDays(new Date(), 20),
    updatedAt: subDays(new Date(), 20),
  },
  {
    id: '4',
    vehicleId: '1',
    category: 'fuel',
    description: 'Abastecimento gasolina',
    amount: 220,
    date: subDays(new Date(), 5),
    createdAt: subDays(new Date(), 5),
    updatedAt: subDays(new Date(), 5),
  },
  {
    id: '5',
    vehicleId: '2',
    category: 'maintenance',
    description: 'Troca de óleo e filtro',
    amount: 300,
    date: subDays(new Date(), 15),
    createdAt: subDays(new Date(), 15),
    updatedAt: subDays(new Date(), 15),
  },
  {
    id: '6',
    vehicleId: '2',
    category: 'tax',
    description: 'IPVA 2023',
    amount: 1500,
    date: subDays(new Date(), 60),
    createdAt: subDays(new Date(), 60),
    updatedAt: subDays(new Date(), 60),
  },
];

// Generate mock vehicle stats
export const mockVehicleStats = (vehicleId: string): VehicleStats => {
  const vehicleExpenses = mockExpenses.filter(expense => expense.vehicleId === vehicleId);
  const totalExpenses = vehicleExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const lastMonthExpenses = vehicleExpenses
    .filter(expense => expense.date > subMonths(new Date(), 1))
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const expensesByCategory = vehicleExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Generate monthly expenses for the last 6 months
  const monthlyExpenses = Array.from({ length: 6 }, (_, i) => {
    const monthDate = subMonths(new Date(), i);
    const monthExpenses = vehicleExpenses
      .filter(expense => {
        const expenseMonth = expense.date.getMonth();
        const expenseYear = expense.date.getFullYear();
        return expenseMonth === monthDate.getMonth() && expenseYear === monthDate.getFullYear();
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      month: format(monthDate, 'MMM', { locale: ptBR }),
      amount: monthExpenses,
    };
  }).reverse();
  
  return {
    totalMaintenance: mockMaintenanceServices.filter(service => service.vehicleId === vehicleId).length,
    upcomingMaintenance: mockMaintenanceReminders.filter(reminder => reminder.vehicleId === vehicleId && !reminder.isCompleted).length,
    totalExpenses,
    lastMonthExpenses,
    expensesByCategory,
    monthlyExpenses,
  };
};

// Generate mock data functions
export const getMockVehicles = (): Promise<Vehicle[]> => {
  return Promise.resolve(mockVehicles);
};

export const getMockVehicle = (id: string): Promise<Vehicle | undefined> => {
  return Promise.resolve(mockVehicles.find(vehicle => vehicle.id === id));
};

export const getMockMaintenanceServices = (vehicleId: string): Promise<MaintenanceService[]> => {
  return Promise.resolve(
    mockMaintenanceServices.filter(service => service.vehicleId === vehicleId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  );
};

export const getMockMaintenanceReminders = (vehicleId: string): Promise<MaintenanceReminder[]> => {
  return Promise.resolve(
    mockMaintenanceReminders.filter(reminder => reminder.vehicleId === vehicleId)
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return a.dueDate.getTime() - b.dueDate.getTime();
        }
        return 0;
      })
  );
};

export const getMockExpenses = (vehicleId: string): Promise<Expense[]> => {
  return Promise.resolve(
    mockExpenses.filter(expense => expense.vehicleId === vehicleId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  );
};

export const getMockVehicleStats = (vehicleId: string): Promise<VehicleStats> => {
  return Promise.resolve(mockVehicleStats(vehicleId));
};

// CRUD functions (mock implementations)
export const addVehicle = (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> => {
  const newVehicle: Vehicle = {
    ...vehicle,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockVehicles.push(newVehicle);
  return Promise.resolve(newVehicle);
};

export const updateVehicle = (id: string, vehicle: Partial<Vehicle>): Promise<Vehicle | undefined> => {
  const index = mockVehicles.findIndex(v => v.id === id);
  if (index === -1) return Promise.resolve(undefined);
  
  mockVehicles[index] = {
    ...mockVehicles[index],
    ...vehicle,
    updatedAt: new Date(),
  };
  
  return Promise.resolve(mockVehicles[index]);
};

export const addMaintenanceService = (service: Omit<MaintenanceService, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceService> => {
  const newService: MaintenanceService = {
    ...service,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockMaintenanceServices.push(newService);
  
  // Also add an expense entry
  const newExpense: Expense = {
    id: generateId(),
    vehicleId: service.vehicleId,
    category: 'maintenance',
    description: service.description,
    amount: service.cost,
    date: service.date,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockExpenses.push(newExpense);
  
  return Promise.resolve(newService);
};

export const addMaintenanceReminder = (reminder: Omit<MaintenanceReminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceReminder> => {
  const newReminder: MaintenanceReminder = {
    ...reminder,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockMaintenanceReminders.push(newReminder);
  return Promise.resolve(newReminder);
};

export const completeMaintenanceReminder = (id: string): Promise<MaintenanceReminder | undefined> => {
  const index = mockMaintenanceReminders.findIndex(r => r.id === id);
  if (index === -1) return Promise.resolve(undefined);
  
  mockMaintenanceReminders[index] = {
    ...mockMaintenanceReminders[index],
    isCompleted: true,
    updatedAt: new Date(),
  };
  
  return Promise.resolve(mockMaintenanceReminders[index]);
};

export const addExpense = (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> => {
  const newExpense: Expense = {
    ...expense,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockExpenses.push(newExpense);
  return Promise.resolve(newExpense);
};
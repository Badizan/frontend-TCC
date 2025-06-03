export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  currentMileage: number;
  fuelType: 'gasoline' | 'ethanol' | 'diesel' | 'electric' | 'hybrid' | 'flex';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceService {
  id: string;
  vehicleId: string;
  serviceType: string;
  description: string;
  date: Date;
  mileage: number;
  cost: number;
  nextServiceDate?: Date;
  nextServiceMileage?: number;
  provider?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  vehicleId: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  vehicleId: string;
  description: string;
  category: string;
  amount: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleStats {
  totalMaintenance: number;
  upcomingMaintenance: number;
  totalExpenses: number;
  lastMonthExpenses: number;
  expensesByCategory: Record<string, number>;
  monthlyExpenses: Array<{ month: string; amount: number }>;
}
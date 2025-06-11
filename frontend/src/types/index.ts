export type UserRole = 'ADMIN' | 'MECHANIC' | 'RECEPTIONIST' | 'OWNER'
export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'VAN'
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION'

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  type: VehicleType;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  maintenances?: Maintenance[];
  reminders?: Reminder[];
  expenses?: Expense[];
  _count?: {
    maintenances: number;
    reminders: number;
    expenses: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  mechanicId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  cost?: number;
  notes?: string;
  vehicle?: {
    id: string;
    brand: string;
    model: string;
    licensePlate: string;
  };
  mechanic?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Alias para compatibilidade
export interface MaintenanceService extends Maintenance { }

export interface Reminder {
  id: string;
  vehicleId: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  vehicle?: {
    id: string;
    brand: string;
    model: string;
    licensePlate: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Compatibilidade com o store antigo
export interface MaintenanceReminder {
  id: string;
  vehicleId: string;
  serviceType?: string;
  description: string;
  dueDate?: Date;
  dueMileage?: number;
  isCompleted: boolean;
  completed?: boolean;
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
  vehicle?: {
    id: string;
    brand: string;
    model: string;
    licensePlate: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleStats {
  totalExpenses?: number;
  expenseCount?: number;
  averageExpense?: number;
  totalMaintenance?: number;
  upcomingMaintenance?: number;
  lastMonthExpenses?: number;
  expensesByCategory?: Record<string, number>;
  monthlyExpenses?: Array<{ month: string; amount: number }>;
}

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}
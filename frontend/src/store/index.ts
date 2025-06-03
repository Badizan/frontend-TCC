import { create } from 'zustand';
import { Vehicle, MaintenanceService, MaintenanceReminder, Expense, VehicleStats, Reminder } from '../types';
import { vehicleService } from '../services/vehicles';
import { authService } from '../services/auth';
import { reminderService } from '../services/reminders';
import { expenseService } from '../services/expenses';

interface AppState {
  // Loading states
  loading: boolean;

  // Data
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  maintenanceServices: MaintenanceService[];
  maintenanceReminders: MaintenanceReminder[];
  expenses: Expense[];
  vehicleStats: VehicleStats | null;
  reminders: Reminder[];

  // Actions
  fetchVehicles: () => Promise<void>;
  selectVehicle: (id: string) => Promise<void>;
  createVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Vehicle>;
  updateVehicleData: (id: string, vehicle: Partial<Vehicle>) => Promise<Vehicle | undefined>;
  fetchMaintenanceServices: (vehicleId: string) => Promise<void>;
  createMaintenanceService: (service: Omit<MaintenanceService, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MaintenanceService>;
  fetchMaintenanceReminders: (vehicleId: string) => Promise<void>;
  createMaintenanceReminder: (reminder: Omit<MaintenanceReminder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MaintenanceReminder>;
  completeReminder: (id: string) => Promise<void>;
  fetchExpenses: (vehicleId: string) => Promise<void>;
  createExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Expense>;
  fetchVehicleStats: (vehicleId: string) => Promise<void>;
  fetchReminders: (vehicleId: string) => Promise<void>;
  createReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Reminder>;
  updateReminder: (id: string, reminder: Partial<Reminder>) => Promise<Reminder>;
  deleteReminder: (id: string) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  loading: false,
  vehicles: [],
  selectedVehicle: null,
  maintenanceServices: [],
  maintenanceReminders: [],
  expenses: [],
  vehicleStats: null,
  reminders: [],

  // Actions
  fetchVehicles: async () => {
    try {
      set({ loading: true });
      const vehicles = await vehicleService.findAll();
      set({ vehicles });
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      set({ loading: false });
    }
  },

  selectVehicle: async (id: string) => {
    try {
      set({ loading: true });
      const vehicle = await vehicleService.findById(id);
      set({ selectedVehicle: vehicle });
    } catch (error) {
      console.error('Error selecting vehicle:', error);
    } finally {
      set({ loading: false });
    }
  },

  createVehicle: async (vehicle) => {
    try {
      set({ loading: true });
      const newVehicle = await vehicleService.create(vehicle);
      set((state) => ({
        vehicles: [...state.vehicles, newVehicle],
      }));
      return newVehicle;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateVehicleData: async (id: string, vehicle) => {
    try {
      set({ loading: true });
      const updatedVehicle = await vehicleService.update(id, vehicle);
      set((state) => ({
        vehicles: state.vehicles.map((v) => (v.id === id ? updatedVehicle : v)),
        selectedVehicle: state.selectedVehicle?.id === id ? updatedVehicle : state.selectedVehicle,
      }));
      return updatedVehicle;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // TODO: Implementar serviços de manutenção quando o backend estiver pronto
  fetchMaintenanceServices: async () => {
    // Implementar quando o backend estiver pronto
  },

  createMaintenanceService: async () => {
    // Implementar quando o backend estiver pronto
    throw new Error('Not implemented');
  },

  fetchMaintenanceReminders: async () => {
    // Implementar quando o backend estiver pronto
  },

  createMaintenanceReminder: async () => {
    // Implementar quando o backend estiver pronto
    throw new Error('Not implemented');
  },

  completeReminder: async () => {
    // Implementar quando o backend estiver pronto
    throw new Error('Not implemented');
  },

  fetchExpenses: async (vehicleId) => {
    set({ loading: true });
    try {
      const all = await expenseService.findAll();
      const expenses = all.filter((e: Expense) => e.vehicleId === vehicleId);
      set({ expenses });
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      set({ loading: false });
    }
  },

  createExpense: async (expense) => {
    set({ loading: true });
    try {
      const created = await expenseService.create(expense);
      set((state) => ({ expenses: [...state.expenses, created] }));
      return created;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchVehicleStats: async () => {
    // Implementar quando o backend estiver pronto
  },

  fetchReminders: async (vehicleId) => {
    set({ loading: true });
    try {
      const all = await reminderService.findAll();
      const reminders = all.filter((r: Reminder) => r.vehicleId === vehicleId);
      set({ reminders });
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      set({ loading: false });
    }
  },

  createReminder: async (reminder) => {
    set({ loading: true });
    try {
      const created = await reminderService.create(reminder);
      set((state) => ({ reminders: [...state.reminders, created] }));
      return created;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateReminder: async (id, reminder) => {
    set({ loading: true });
    try {
      const updated = await reminderService.update(id, reminder);
      set((state) => ({ reminders: state.reminders.map((r) => (r.id === id ? updated : r)) }));
      return updated;
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteReminder: async (id) => {
    set({ loading: true });
    try {
      await reminderService.delete(id);
      set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) }));
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateExpense: async (id, expense) => {
    set({ loading: true });
    try {
      const updated = await expenseService.update(id, expense);
      set((state) => ({ expenses: state.expenses.map((e) => (e.id === id ? updated : e)) }));
      return updated;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteExpense: async (id) => {
    set({ loading: true });
    try {
      await expenseService.delete(id);
      set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
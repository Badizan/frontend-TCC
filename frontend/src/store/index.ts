import { create } from 'zustand';
import { Vehicle, MaintenanceService, MaintenanceReminder, Expense, VehicleStats } from '../types';
import apiService from '../services/api';

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

  // User state
  user: any | null;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<any>;
  register: (data: { name: string; email: string; password: string; role: string }) => Promise<any>;
  logout: () => void;
  fetchVehicles: () => Promise<void>;
  selectVehicle: (id: string) => Promise<void>;
  createVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Vehicle>;
  updateVehicleData: (id: string, vehicle: Partial<Vehicle>) => Promise<Vehicle | undefined>;
  deleteVehicle: (id: string) => Promise<void>;
  fetchMaintenanceServices: (vehicleId?: string) => Promise<void>;
  createMaintenanceService: (service: Omit<MaintenanceService, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MaintenanceService>;
  fetchMaintenanceReminders: (vehicleId?: string) => Promise<void>;
  createMaintenanceReminder: (reminder: Omit<MaintenanceReminder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MaintenanceReminder>;
  completeReminder: (id: string) => Promise<void>;
  fetchExpenses: (vehicleId?: string) => Promise<void>;
  createExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Expense>;
  fetchVehicleStats: (vehicleId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial states
  loading: false,
  vehicles: [],
  selectedVehicle: null,
  maintenanceServices: [],
  maintenanceReminders: [],
  expenses: [],
  vehicleStats: null,
  user: null,
  isAuthenticated: !!localStorage.getItem('auth_token'),

  // Auth actions
  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const response = await apiService.login(email, password);
      set({
        user: response.user,
        isAuthenticated: true,
        loading: false
      });
      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ loading: true });
    try {
      const response = await apiService.register(data);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    apiService.clearToken();
    set({
      user: null,
      isAuthenticated: false,
      vehicles: [],
      selectedVehicle: null,
      maintenanceServices: [],
      maintenanceReminders: [],
      expenses: [],
      vehicleStats: null
    });
  },

  // Vehicle actions
  fetchVehicles: async () => {
    set({ loading: true });
    try {
      const vehicles = await apiService.getVehicles();
      set({ vehicles, loading: false });
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      set({ loading: false });
    }
  },

  selectVehicle: async (id: string) => {
    set({ loading: true });
    try {
      const vehicle = await apiService.getVehicle(id);
      if (vehicle) {
        set({ selectedVehicle: vehicle, loading: false });
        get().fetchMaintenanceServices(id);
        get().fetchMaintenanceReminders(id);
        get().fetchExpenses(id);
        get().fetchVehicleStats(id);
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error selecting vehicle:', error);
      set({ loading: false });
    }
  },

  createVehicle: async (vehicleData) => {
    set({ loading: true });
    try {
      const newVehicle = await apiService.createVehicle(vehicleData);
      set(state => ({
        vehicles: [...state.vehicles, newVehicle],
        loading: false
      }));
      return newVehicle;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      set({ loading: false });
      throw error;
    }
  },

  updateVehicleData: async (id, vehicleData) => {
    set({ loading: true });
    try {
      const updatedVehicle = await apiService.updateVehicle(id, vehicleData);
      if (updatedVehicle) {
        set(state => ({
          vehicles: state.vehicles.map(v => v.id === id ? updatedVehicle : v),
          selectedVehicle: state.selectedVehicle?.id === id ? updatedVehicle : state.selectedVehicle,
          loading: false
        }));
      } else {
        set({ loading: false });
      }
      return updatedVehicle;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      set({ loading: false });
      throw error;
    }
  },

  deleteVehicle: async (id: string) => {
    set({ loading: true });
    try {
      await apiService.deleteVehicle(id);
      set(state => ({
        vehicles: state.vehicles.filter(v => v.id !== id),
        selectedVehicle: state.selectedVehicle?.id === id ? null : state.selectedVehicle,
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      set({ loading: false });
      throw error;
    }
  },

  // Maintenance actions
  fetchMaintenanceServices: async (vehicleId?: string) => {
    try {
      const services = await apiService.getMaintenances(vehicleId ? { vehicleId } : {});
      set({ maintenanceServices: services });
    } catch (error) {
      console.error('Error fetching maintenance services:', error);
    }
  },

  createMaintenanceService: async (serviceData) => {
    set({ loading: true });
    try {
      const newService = await apiService.createMaintenance(serviceData);
      set(state => ({
        maintenanceServices: [newService, ...state.maintenanceServices],
        loading: false
      }));

      // Refresh expenses and stats if vehicleId is available
      if (serviceData.vehicleId) {
        get().fetchExpenses(serviceData.vehicleId);
        get().fetchVehicleStats(serviceData.vehicleId);
      }

      return newService;
    } catch (error) {
      console.error('Error creating maintenance service:', error);
      set({ loading: false });
      throw error;
    }
  },

  // Reminder actions
  fetchMaintenanceReminders: async (vehicleId?: string) => {
    try {
      const params = vehicleId ? { vehicleId } : {};
      const reminders = await apiService.getReminders(params);
      set({ maintenanceReminders: reminders });
    } catch (error) {
      console.error('Error fetching maintenance reminders:', error);
    }
  },

  createMaintenanceReminder: async (reminderData) => {
    set({ loading: true });
    try {
      const newReminder = await apiService.createReminder(reminderData);
      set(state => ({
        maintenanceReminders: [...state.maintenanceReminders, newReminder],
        loading: false
      }));
      return newReminder;
    } catch (error) {
      console.error('Error creating maintenance reminder:', error);
      set({ loading: false });
      throw error;
    }
  },

  completeReminder: async (id: string) => {
    set({ loading: true });
    try {
      const updatedReminder = await apiService.updateReminder(id, { isCompleted: true });
      if (updatedReminder) {
        set(state => ({
          maintenanceReminders: state.maintenanceReminders.map(r =>
            r.id === id ? updatedReminder : r
          ),
          loading: false
        }));
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error completing reminder:', error);
      set({ loading: false });
    }
  },

  // Expense actions
  fetchExpenses: async (vehicleId?: string) => {
    try {
      const params = vehicleId ? { vehicleId } : {};
      const expenses = await apiService.getExpenses(params);
      set({ expenses });
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  },

  createExpense: async (expenseData) => {
    set({ loading: true });
    try {
      const newExpense = await apiService.createExpense(expenseData);
      set(state => ({
        expenses: [newExpense, ...state.expenses],
        loading: false
      }));

      // Refresh stats if vehicleId is available
      if (expenseData.vehicleId) {
        get().fetchVehicleStats(expenseData.vehicleId);
      }

      return newExpense;
    } catch (error) {
      console.error('Error creating expense:', error);
      set({ loading: false });
      throw error;
    }
  },

  fetchVehicleStats: async (vehicleId: string) => {
    try {
      // Note: This would need to be implemented in the backend
      // For now, we'll calculate basic stats from expenses
      const expenses = await apiService.getExpenses({ vehicleId });
      const maintenances = await apiService.getMaintenances({ vehicleId });
      const reminders = await apiService.getReminders({ vehicleId });

      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Calculate monthly expenses for chart
      const monthlyExpenses = expenses.reduce((acc, expense) => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        if (!acc[monthKey]) {
          acc[monthKey] = { month: monthName, amount: 0 };
        }
        acc[monthKey].amount += expense.amount;
        return acc;
      }, {} as Record<string, { month: string; amount: number }>);

      const monthlyExpensesArray = Object.values(monthlyExpenses).sort((a, b) =>
        new Date(a.month).getTime() - new Date(b.month).getTime()
      );

      // Calculate expense categories
      const expensesByCategory = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

      const stats = {
        totalExpenses,
        expenseCount: expenses.length,
        averageExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0,
        totalMaintenance: maintenances.length,
        upcomingMaintenance: reminders.filter(r => !r.completed).length,
        monthlyExpenses: monthlyExpensesArray,
        expensesByCategory
      };
      set({ vehicleStats: stats });
    } catch (error) {
      console.error('Error fetching vehicle stats:', error);
      // Set empty stats to avoid undefined errors
      set({
        vehicleStats: {
          totalExpenses: 0,
          expenseCount: 0,
          averageExpense: 0,
          totalMaintenance: 0,
          upcomingMaintenance: 0,
          monthlyExpenses: [],
          expensesByCategory: {}
        }
      });
    }
  },
}));
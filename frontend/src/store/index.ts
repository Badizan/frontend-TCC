import { create } from 'zustand';
import { Vehicle, MaintenanceService, MaintenanceReminder, Expense, VehicleStats } from '../types';
import { ApiService } from '../services/api';

// Create a single instance of ApiService
const apiService = new ApiService();

interface AppState {
  // Loading states
  loading: boolean;
  error: string | null;

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
  initializeAuth: () => Promise<void>;
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
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, password: string) => Promise<any>;
  validateResetToken: (token: string) => Promise<boolean>;
  clearUserData: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial states
  loading: false,
  error: null,
  vehicles: [],
  selectedVehicle: null,
  maintenanceServices: [],
  maintenanceReminders: [],
  expenses: [],
  vehicleStats: null,
  user: null,
  isAuthenticated: false,

  // Clear all user data utility function
  clearUserData: () => {
    console.log('🧹 Store: Limpando todos os dados do usuário...');
    set({
      vehicles: [],
      selectedVehicle: null,
      maintenanceServices: [],
      maintenanceReminders: [],
      expenses: [],
      vehicleStats: null,
      loading: false,
      error: null
    });

    // Limpar cache local
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('vehicle_') ||
        key.startsWith('maintenance_') ||
        key.startsWith('expense_') ||
        key.startsWith('reminder_') ||
        key.startsWith('stats_') ||
        key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  },

  // Initialize user profile if authenticated
  initializeAuth: async () => {
    const token = localStorage.getItem('auth_token');
    console.log('🔄 Store: initializeAuth chamado', { hasToken: !!token });

    // Sempre limpar dados primeiro
    const { clearUserData } = get();
    clearUserData();

    // Se não há token, define como não autenticado
    if (!token) {
      console.log('❌ Store: Sem token, definindo como não autenticado');
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      });
      return;
    }

    // Se já está carregando, não faça nada
    const currentState = get();
    if (currentState.loading) {
      console.log('⏳ Store: Já carregando, pulando...');
      return;
    }

    try {
      set({ loading: true, error: null });
      console.log('🔑 Store: Buscando perfil do usuário...');

      const userProfile = await apiService.getProfile();
      console.log('✅ Store: Usuário carregado com sucesso:', userProfile);

      set({
        user: userProfile,
        isAuthenticated: true,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('❌ Store: Erro ao carregar usuário:', error);

      // Limpar token inválido
      localStorage.removeItem('auth_token');
      apiService.clearAllCache();

      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: 'Sessão expirada. Faça login novamente.'
      });

      throw error;
    }
  },

  // Auth actions
  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      console.log('🔑 Store: Fazendo login...');

      // Limpar dados da sessão anterior antes do login
      set({
        vehicles: [],
        selectedVehicle: null,
        maintenanceServices: [],
        maintenanceReminders: [],
        expenses: [],
        vehicleStats: null,
      });

      const response = await apiService.login(email, password);
      console.log('✅ Store: Login bem-sucedido:', response);

      // Definir estado imediatamente
      set({
        user: response.user,
        isAuthenticated: true,
        loading: false,
        error: null,
        // Garantir que todos os dados estão zerados para o novo usuário
        vehicles: [],
        selectedVehicle: null,
        maintenanceServices: [],
        maintenanceReminders: [],
        expenses: [],
        vehicleStats: null,
      });

      console.log('✅ Store: Estado atualizado - isAuthenticated:', true);
      return response;
    } catch (error: any) {
      console.error('❌ Store: Erro no login:', error);
      set({
        error: error.message || 'Erro ao fazer login',
        loading: false,
        isAuthenticated: false,
        user: null
      });
      throw error;
    }
  },

  register: async (data: { name: string; email: string; password: string; role: string }) => {
    try {
      set({ loading: true, error: null });
      console.log('📝 Store: Fazendo registro...');

      // Limpar dados da sessão anterior antes do registro
      set({
        vehicles: [],
        selectedVehicle: null,
        maintenanceServices: [],
        maintenanceReminders: [],
        expenses: [],
        vehicleStats: null,
      });

      const response = await apiService.register(data);
      console.log('✅ Store: Registro bem-sucedido:', response);

      // NÃO fazer login automático - apenas retornar sucesso
      set({
        loading: false,
        error: null,
        // Manter como não autenticado
        isAuthenticated: false,
        user: null,
        // Manter dados zerados
        vehicles: [],
        selectedVehicle: null,
        maintenanceServices: [],
        maintenanceReminders: [],
        expenses: [],
        vehicleStats: null,
      });

      return { success: true, message: 'Conta criada com sucesso! Faça login para continuar.' };
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao registrar',
        loading: false,
        isAuthenticated: false,
        user: null
      });
      throw error;
    }
  },

  logout: () => {
    console.log('🚪 Store: Fazendo logout e limpando todos os dados...');

    // Limpar token, cache da API e recriar instância
    apiService.clearAllCache();
    localStorage.removeItem('auth_token');

    // Limpar completamente TODOS os dados do estado
    set({
      user: null,
      isAuthenticated: false,
      vehicles: [],
      selectedVehicle: null,
      maintenanceServices: [],
      maintenanceReminders: [],
      expenses: [],
      vehicleStats: null,
      loading: false,
      error: null
    });

    // Limpar qualquer cache adicional no localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('vehicle_') ||
        key.startsWith('maintenance_') ||
        key.startsWith('expense_') ||
        key.startsWith('reminder_') ||
        key.startsWith('stats_') ||
        key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });

    // Forçar reload da página para garantir limpeza total
    console.log('🔄 Store: Limpeza completa realizada');
  },

  // Vehicle actions - Otimizadas para evitar loading desnecessário
  fetchVehicles: async () => {
    try {
      const vehicles = await apiService.getVehicles();
      set(state => ({ ...state, vehicles }));
    } catch (error) {
      console.error('Error fetching vehicles:', error);
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
    console.log('🚗 Store: Criando veículo:', vehicleData);
    console.log('👤 Usuário atual:', get().user);

    set({ loading: true });
    try {
      const currentUser = get().user;

      // Validate user is authenticated
      if (!currentUser || !currentUser.id) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      // Validate user ID is a proper UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(currentUser.id)) {
        console.error('❌ ID do usuário não é um UUID válido:', currentUser.id);
        throw new Error('ID do usuário inválido. Faça login novamente.');
      }

      // Garantir que o ownerId está definido
      const dataWithOwner = {
        ...vehicleData,
        ownerId: vehicleData.ownerId || currentUser.id
      };

      console.log('🚗 Store: Dados finais:', dataWithOwner);
      console.log('🔐 Owner ID (UUID):', dataWithOwner.ownerId);

      const newVehicle = await apiService.createVehicle(dataWithOwner);
      console.log('✅ Store: Veículo criado:', newVehicle);

      set(state => ({
        vehicles: [...state.vehicles, newVehicle],
        loading: false
      }));
      return newVehicle;
    } catch (error) {
      console.error('❌ Store: Erro ao criar veículo:', error);
      set({ loading: false });
      throw error;
    }
  },

  updateVehicleData: async (id: string, vehicleData: Partial<Vehicle>) => {
    set({ loading: true });
    try {
      const updatedVehicle = await apiService.updateVehicle(id, vehicleData);

      set(state => ({
        vehicles: state.vehicles.map(v => v.id === id ? updatedVehicle : v),
        selectedVehicle: state.selectedVehicle?.id === id ? updatedVehicle : state.selectedVehicle,
        loading: false
      }));

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

  // Maintenance Services
  fetchMaintenanceServices: async (vehicleId?: string) => {
    try {
      const filters = vehicleId ? { vehicleId } : undefined;
      const services = await apiService.getMaintenances(filters);
      set(state => ({ ...state, maintenanceServices: services }));
    } catch (error) {
      console.error('Error fetching maintenance services:', error);
    }
  },

  createMaintenanceService: async (serviceData) => {
    set({ loading: true });
    try {
      const newService = await apiService.createMaintenance(serviceData);
      set(state => ({
        maintenanceServices: [...state.maintenanceServices, newService],
        loading: false
      }));
      return newService;
    } catch (error) {
      console.error('Error creating maintenance service:', error);
      set({ loading: false });
      throw error;
    }
  },

  // Maintenance Reminders
  fetchMaintenanceReminders: async (vehicleId?: string) => {
    try {
      const filters = vehicleId ? { vehicleId } : undefined;
      const reminders = await apiService.getReminders(filters);
      set(state => ({ ...state, maintenanceReminders: reminders }));
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
      await apiService.completeReminder(id);
      set(state => ({
        maintenanceReminders: state.maintenanceReminders.map(r =>
          r.id === id ? { ...r, completed: true } : r
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Error completing reminder:', error);
      set({ loading: false });
      throw error;
    }
  },

  // Expenses
  fetchExpenses: async (vehicleId?: string) => {
    try {
      const filters = vehicleId ? { vehicleId } : undefined;
      const expenses = await apiService.getExpenses(filters);
      set(state => ({ ...state, expenses }));
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  },

  createExpense: async (expenseData) => {
    set({ loading: true });
    try {
      const newExpense = await apiService.createExpense(expenseData);
      set(state => ({
        expenses: [...state.expenses, newExpense],
        loading: false
      }));
      return newExpense;
    } catch (error) {
      console.error('Error creating expense:', error);
      set({ loading: false });
      throw error;
    }
  },

  // Vehicle Stats
  fetchVehicleStats: async (vehicleId: string) => {
    set({ loading: true });
    try {
      // Mock implementation - replace with actual API call when available
      const stats = {
        totalMaintenances: 0,
        totalExpenses: 0,
        upcomingReminders: 0,
        lastMaintenanceDate: null
      };
      set({ vehicleStats: stats, loading: false });
    } catch (error) {
      console.error('Error fetching vehicle stats:', error);
      set({ loading: false });
    }
  },

  // Password recovery
  forgotPassword: async (email: string) => {
    try {
      set({ loading: true, error: null });
      const response = await apiService.forgotPassword(email);
      set({ loading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao enviar email de recuperação',
        loading: false
      });
      throw error;
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const response = await apiService.resetPassword(token, password);
      set({ loading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao redefinir senha',
        loading: false
      });
      throw error;
    }
  },

  validateResetToken: async (token: string) => {
    try {
      set({ loading: true, error: null });
      const response = await apiService.validateResetToken(token);
      set({ loading: false });
      return response.valid;
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao validar token',
        loading: false
      });
      return false;
    }
  }
}));
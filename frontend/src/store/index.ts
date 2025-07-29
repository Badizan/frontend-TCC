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

  // Notification callback
  onNotificationTrigger?: (type: string, title: string, message: string) => void;

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
  updateMaintenanceService: (id: string, data: Partial<MaintenanceService>) => Promise<MaintenanceService>;
  deleteMaintenanceService: (id: string) => Promise<void>;
  fetchMaintenanceReminders: (vehicleId?: string) => Promise<void>;
  createMaintenanceReminder: (reminder: Omit<MaintenanceReminder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MaintenanceReminder>;
  completeReminder: (id: string) => Promise<void>;
  deleteMaintenanceReminder: (id: string) => Promise<void>;
  fetchExpenses: (vehicleId?: string) => Promise<void>;
  createExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  fetchVehicleStats: (vehicleId: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, password: string) => Promise<any>;
  validateResetToken: (token: string) => Promise<boolean>;
  // Mileage Reminders
  createMileageReminder: (data: { vehicleId: string; description: string; dueMileage: number }) => Promise<any>;
  updateVehicleMileage: (vehicleId: string, newMileage: number) => Promise<any>;
  getMileageReminders: (vehicleId: string) => Promise<any[]>;
  calculateNextMaintenance: (vehicleId: string, intervalKm: number) => Promise<any>;
  clearUserData: () => void;
  forceReset: () => void;
  setNotificationCallback: (callback: (type: string, title: string, message: string) => void) => void;
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
  onNotificationTrigger: undefined,

  // Set notification callback
  setNotificationCallback: (callback) => {
    set({ onNotificationTrigger: callback });
  },

  // Force complete reset (emergency reset)
  forceReset: () => {
    console.log('🚨 Store: FORÇA RESET TOTAL DO SISTEMA');

    // Limpar localStorage completamente
    const keysToPreserve = ['theme', 'language']; // Preservar apenas configurações básicas
    Object.keys(localStorage).forEach(key => {
      if (!keysToPreserve.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Limpar sessionStorage também
    sessionStorage.clear();

    // Limpar cache da API
    apiService.clearAllCache();

    // Reset completo do estado
    set({
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
      onNotificationTrigger: undefined
    });

    console.log('✅ Store: Reset total concluído');
  },

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

    // Limpar cache local de forma mais agressiva
    const keysToRemove = [];
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('vehicle_') ||
        key.startsWith('maintenance_') ||
        key.startsWith('expense_') ||
        key.startsWith('reminder_') ||
        key.startsWith('stats_') ||
        key.startsWith('cache_') ||
        key.startsWith('user_') ||
        key.startsWith('data_')) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Limpar sessionStorage também
    sessionStorage.clear();

    console.log(`🗑️ Store: ${keysToRemove.length} itens de cache removidos`);
  },

  // Initialize user profile if authenticated
  initializeAuth: async () => {
    const token = localStorage.getItem('auth_token');
    console.log('🔄 Store: initializeAuth chamado', { hasToken: !!token });

    // Se não há token, limpar tudo e sair
    if (!token) {
      console.log('❌ Store: Sem token, limpando e definindo como não autenticado');
      const { forceReset } = get();
      forceReset();
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

      // LIMPEZA TOTAL antes de buscar perfil
      const { forceReset } = get();
      forceReset();

      const userProfile = await apiService.getProfile();
      console.log('✅ Store: Usuário carregado com sucesso:', userProfile);

      // Verificar se o perfil é válido
      if (!userProfile || !userProfile.id) {
        throw new Error('Perfil de usuário inválido recebido');
      }

      // Verificar se é o mesmo usuário que estava logado antes (se houver)
      const previousUserId = localStorage.getItem('last_user_id');
      if (previousUserId && previousUserId !== userProfile.id) {
        console.warn('🚨 Store: MUDANÇA DE USUÁRIO DETECTADA - Limpeza extra de segurança!', {
          usuarioAnterior: previousUserId,
          usuarioAtual: userProfile.id
        });

        // Limpeza extra para mudança de usuário
        const { forceReset } = get();
        forceReset();
      }

      // Salvar ID do usuário atual para futuras verificações
      localStorage.setItem('last_user_id', userProfile.id);

      set({
        user: userProfile,
        isAuthenticated: true,
        loading: false,
        error: null,
        // Garantir estado limpo
        vehicles: [],
        selectedVehicle: null,
        maintenanceServices: [],
        maintenanceReminders: [],
        expenses: [],
        vehicleStats: null,
      });

      console.log('✅ Store: Estado autenticado definido para:', userProfile.email);
    } catch (error: any) {
      console.error('❌ Store: Erro ao carregar usuário:', error);

      // Limpar completamente em caso de erro
      const { forceReset } = get();
      forceReset();

      set({
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
      console.log('🔑 Store: Fazendo login para:', email);

      // LIMPEZA TOTAL antes do login
      const { forceReset } = get();
      forceReset();

      const response = await apiService.login(email, password);
      console.log('✅ Store: Login bem-sucedido:', response);

      // Verificar se a resposta é válida
      if (!response || !response.user || !response.user.id) {
        throw new Error('Resposta de login inválida');
      }

      // Definir estado imediatamente com dados limpos
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

      console.log('✅ Store: Estado atualizado para usuário:', response.user.email);
      return response;
    } catch (error: any) {
      console.error('❌ Store: Erro no login:', error);

      // Força reset em caso de erro
      const { forceReset } = get();
      forceReset();

      set({
        error: error.message || 'Erro ao fazer login',
        loading: false
      });
      throw error;
    }
  },

  register: async (data: { name: string; email: string; password: string; role: string }) => {
    try {
      set({ loading: true, error: null });
      console.log('📝 Store: Registrando usuário:', data.email);

      // Limpar dados antes do registro
      const { forceReset } = get();
      forceReset();

      const response = await apiService.register(data);
      console.log('✅ Store: Registro bem-sucedido');

      set({ loading: false });
      return response;
    } catch (error: any) {
      console.error('❌ Store: Erro no registro:', error);
      set({
        error: error.message || 'Erro ao registrar usuário',
        loading: false
      });
      throw error;
    }
  },

  logout: () => {
    console.log('🚪 Store: Fazendo logout...');

    // Obter usuário atual antes de limpar
    const currentUser = get().user;
    const currentUserId = currentUser?.id;

    // Limpar token da API
    apiService.clearToken();

    // Reset TOTAL do sistema
    const { forceReset } = get();
    forceReset();

    // Limpar informações do último usuário
    localStorage.removeItem('last_user_id');

    // Limpeza extra específica do usuário
    if (currentUserId) {
      console.log('🧹 Store: Limpeza específica para usuário:', currentUserId);

      // Limpar qualquer cache específico do usuário
      Object.keys(localStorage).forEach(key => {
        if (key.includes(currentUserId)) {
          localStorage.removeItem(key);
          console.log(`🗑️ Store: Removido cache específico do usuário: ${key}`);
        }
      });
    }

    // Limpar completamente o localStorage
    const keysToPreserve = ['theme', 'language']; // Preservar apenas configurações básicas
    Object.keys(localStorage).forEach(key => {
      if (!keysToPreserve.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Limpar sessionStorage
    sessionStorage.clear();

    console.log('✅ Store: Logout completo realizado');

    // Redirecionar para login com replace para evitar histórico
    console.log('🔄 Store: Redirecionando para login...');

    // Usar setTimeout para garantir que a limpeza seja concluída
    setTimeout(() => {
      window.location.replace('/login');
    }, 50);
  },

  // Vehicle actions - Otimizadas para evitar loading desnecessário
  fetchVehicles: async () => {
    try {
      const { user } = get();
      if (!user || !user.id) {
        console.warn('⚠️ Store: Tentativa de buscar veículos sem usuário autenticado');
        return;
      }

      console.log('🚗 Store: Buscando veículos para usuário:', user.id);
      const vehicles = await apiService.getVehicles();

      // Verificar se os veículos pertencem ao usuário atual
      const userVehicles = vehicles.filter(v => v.ownerId === user.id);

      if (userVehicles.length !== vehicles.length) {
        console.warn('⚠️ Store: Alguns veículos não pertencem ao usuário atual, filtrando...');
      }

      set(state => ({ ...state, vehicles: userVehicles }));
      console.log(`✅ Store: ${userVehicles.length} veículos carregados`);
    } catch (error) {
      console.error('❌ Store: Erro ao buscar veículos:', error);
    }
  },

  selectVehicle: async (id: string) => {
    set({ loading: true });
    try {
      const { user } = get();
      if (!user || !user.id) {
        throw new Error('Usuário não autenticado');
      }

      const vehicle = await apiService.getVehicle(id);

      // Verificar se o veículo pertence ao usuário
      if (vehicle.ownerId !== user.id) {
        throw new Error('Acesso negado: veículo não pertence ao usuário');
      }

      if (vehicle) {
        set({ selectedVehicle: vehicle });

        // Carregar dados em paralelo
        console.log('🔄 Store: Carregando dados do veículo:', id);

        await Promise.all([
          get().fetchMaintenanceServices(id),
          get().fetchMaintenanceReminders(id),
          get().fetchExpenses(id)
        ]);

        console.log('✅ Store: Dados carregados, calculando estatísticas...');

        // Calcular estatísticas após todos os dados estarem carregados
        await get().fetchVehicleStats(id);

        set({ loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('❌ Store: Erro ao selecionar veículo:', error);
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

      // Garantir que o ownerId está correto
      const dataWithOwner = {
        ...vehicleData,
        ownerId: currentUser.id  // SEMPRE usar o usuário atual
      };

      console.log('🚗 Store: Dados finais:', dataWithOwner);

      const newVehicle = await apiService.createVehicle(dataWithOwner);
      console.log('✅ Store: Veículo criado:', newVehicle);

      // Verificar se o veículo retornado pertence ao usuário
      if (newVehicle.ownerId !== currentUser.id) {
        console.error('❌ Store: Veículo criado não pertence ao usuário atual!');
        throw new Error('Erro de segurança: veículo não foi criado corretamente');
      }

      set(state => ({
        vehicles: [...state.vehicles, newVehicle],
        loading: false
      }));

      // Acionar notificação
      const { onNotificationTrigger } = get();
      if (onNotificationTrigger) {
        onNotificationTrigger('vehicle', 'Veículo Cadastrado', `${newVehicle.brand} ${newVehicle.model} foi adicionado com sucesso!`);
      }

      return newVehicle;
    } catch (error: any) {
      console.error('❌ Store: Erro ao criar veículo:', error);
      set({ loading: false });

      // Tratamento específico para erros de placa duplicada
      if (error.response?.data?.errorType === 'DUPLICATE_LICENSE_PLATE' ||
        error.response?.data?.errorType === 'LICENSE_PLATE_EXISTS') {
        throw new Error(error.response.data.message || 'Placa já está em uso');
      }

      // Se é um erro de rede ou outro tipo
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  },

  updateVehicleData: async (id: string, vehicleData: Partial<Vehicle>) => {
    set({ loading: true });
    try {
      const { user } = get();
      if (!user || !user.id) {
        throw new Error('Usuário não autenticado');
      }

      const updatedVehicle = await apiService.updateVehicle(id, vehicleData);

      // Verificar se o veículo atualizado pertence ao usuário
      if (updatedVehicle.ownerId !== user.id) {
        throw new Error('Erro de segurança: veículo não pertence ao usuário');
      }

      set(state => ({
        vehicles: state.vehicles.map(v => v.id === id ? updatedVehicle : v),
        selectedVehicle: state.selectedVehicle?.id === id ? updatedVehicle : state.selectedVehicle,
        loading: false
      }));

      return updatedVehicle;
    } catch (error: any) {
      console.error('❌ Store: Erro ao atualizar veículo:', error);
      set({ loading: false });

      // Tratamento específico para erros de placa duplicada
      if (error.response?.data?.errorType === 'DUPLICATE_LICENSE_PLATE' ||
        error.response?.data?.errorType === 'LICENSE_PLATE_EXISTS') {
        throw new Error(error.response.data.message || 'Placa já está em uso');
      }

      // Se é um erro de rede ou outro tipo
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

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
      console.error('❌ Store: Erro ao deletar veículo:', error);
      set({ loading: false });
      throw error;
    }
  },

  // Maintenance Services
  fetchMaintenanceServices: async (vehicleId?: string) => {
    try {
      const { user } = get();
      if (!user || !user.id) {
        console.warn('⚠️ Store: Tentativa de buscar manutenções sem usuário autenticado');
        return;
      }

      console.log('🔧 Store: Buscando manutenções para usuário:', user.id);
      const maintenances = await apiService.getMaintenances(vehicleId ? { vehicleId } : undefined);

      // Verificação de segurança: filtrar apenas manutenções de veículos do usuário
      const userVehicles = get().vehicles;
      const userVehicleIds = userVehicles.map(v => v.id);

      const userMaintenances = maintenances.filter(m => {
        // Verificar se a manutenção pertence a um veículo do usuário
        return userVehicleIds.includes(m.vehicleId);
      });

      if (userMaintenances.length !== maintenances.length) {
        console.warn('🚨 Store: FILTRO DE SEGURANÇA APLICADO - Algumas manutenções não pertencem ao usuário atual!', {
          totalRecebidas: maintenances.length,
          totalFiltradas: userMaintenances.length,
          usuarioAtual: user.id
        });
      }

      set(state => ({ ...state, maintenanceServices: userMaintenances }));
      console.log(`✅ Store: ${userMaintenances.length} manutenções carregadas para usuário ${user.email}`);
    } catch (error) {
      console.error('❌ Store: Erro ao buscar manutenções:', error);
    }
  },

  createMaintenanceService: async (serviceData) => {
    set({ loading: true });
    try {
      const { user } = get();
      if (!user || !user.id) {
        throw new Error('Usuário não autenticado');
      }

      const newService = await apiService.createMaintenance(serviceData);

      // Atualizar estado imediatamente
      set(state => ({
        maintenanceServices: [...state.maintenanceServices, newService],
        loading: false
      }));

      // Acionar notificação
      const { onNotificationTrigger } = get();
      if (onNotificationTrigger) {
        onNotificationTrigger('maintenance', 'Manutenção Agendada', `Nova manutenção "${newService.description}" foi agendada com sucesso!`);
      }

      // Atualizar todos os dados relacionados após criação da manutenção
      setTimeout(async () => {
        try {
          const {
            fetchMaintenanceServices,
            fetchMaintenanceReminders,
            fetchExpenses
          } = get();

          console.log('🔄 Atualizando dados após criação de manutenção...');

          // Atualizar manutenções
          await fetchMaintenanceServices();

          // Atualizar lembretes (novo lembrete foi criado automaticamente)
          await fetchMaintenanceReminders();

          // Atualizar despesas (nova despesa pode ter sido criada)
          await fetchExpenses();

          console.log('✅ Dados atualizados com sucesso após criação de manutenção');
        } catch (error) {
          console.warn('⚠️ Aviso: Nem todos os dados puderam ser sincronizados:', error);
        }
      }, 1000);

      return newService;
    } catch (error) {
      console.error('❌ Store: Erro ao criar manutenção:', error);
      set({ loading: false });
      throw error;
    }
  },

  updateMaintenanceService: async (id: string, data: Partial<MaintenanceService>) => {
    set({ loading: true });
    try {
      const updatedService = await apiService.updateMaintenance(id, data);

      set(state => ({
        maintenanceServices: state.maintenanceServices.map(service =>
          service.id === id ? updatedService : service
        ),
        loading: false
      }));

      // Refresh expenses if maintenance was completed (may have created new expense)
      if (data.status === 'COMPLETED') {
        setTimeout(async () => {
          try {
            const refreshedExpenses = await apiService.getExpenses();
            set(state => ({ ...state, expenses: refreshedExpenses }));
          } catch (error) {
            console.warn('Aviso: Não foi possível sincronizar despesas:', error);
          }
        }, 500);
      }

      return updatedService;
    } catch (error) {
      console.error('❌ Store: Erro ao atualizar manutenção:', error);
      set({ loading: false });
      throw error;
    }
  },

  deleteMaintenanceService: async (id: string) => {
    set({ loading: true });
    try {
      await apiService.deleteMaintenance(id);
      set(state => ({
        maintenanceServices: state.maintenanceServices.filter(service => service.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('❌ Store: Erro ao deletar manutenção:', error);
      set({ loading: false });
      throw error;
    }
  },

  // Maintenance Reminders
  fetchMaintenanceReminders: async (vehicleId?: string) => {
    try {
      const { user } = get();
      if (!user || !user.id) {
        console.warn('⚠️ Store: Tentativa de buscar lembretes sem usuário autenticado');
        return;
      }

      console.log('⏰ Store: Buscando lembretes para usuário:', user.id);
      const reminders = await apiService.getReminders(vehicleId ? { vehicleId } : undefined);

      // Verificação de segurança: filtrar apenas lembretes de veículos do usuário
      const userVehicles = get().vehicles;
      const userVehicleIds = userVehicles.map(v => v.id);

      const userReminders = reminders.filter(r => {
        // Verificar se o lembrete pertence a um veículo do usuário
        return userVehicleIds.includes(r.vehicleId);
      });

      if (userReminders.length !== reminders.length) {
        console.warn('🚨 Store: FILTRO DE SEGURANÇA APLICADO - Alguns lembretes não pertencem ao usuário atual!', {
          totalRecebidos: reminders.length,
          totalFiltrados: userReminders.length,
          usuarioAtual: user.id
        });
      }

      set(state => ({ ...state, maintenanceReminders: userReminders }));
      console.log(`✅ Store: ${userReminders.length} lembretes carregados para usuário ${user.email}`);
    } catch (error) {
      console.error('❌ Store: Erro ao buscar lembretes:', error);
    }
  },

  createMaintenanceReminder: async (reminderData) => {
    set({ loading: true });
    try {
      const { user } = get();
      if (!user || !user.id) {
        throw new Error('Usuário não autenticado');
      }

      const newReminder = await apiService.createReminder(reminderData);
      set(state => ({
        maintenanceReminders: [...state.maintenanceReminders, newReminder],
        loading: false
      }));

      // Acionar notificação
      const { onNotificationTrigger } = get();
      if (onNotificationTrigger) {
        onNotificationTrigger('reminders', 'Lembrete Criado', `Novo lembrete "${newReminder.description}" foi criado com sucesso!`);
      }

      return newReminder;
    } catch (error) {
      console.error('❌ Store: Erro ao criar lembrete:', error);
      set({ loading: false });
      throw error;
    }
  },

  completeReminder: async (id: string) => {
    set({ loading: true });
    try {
      await apiService.completeReminder(id);

      // Atualizar estado local marcando como completo
      set(state => ({
        maintenanceReminders: state.maintenanceReminders.map(r =>
          r.id === id ? { ...r, completed: true } : r
        ),
        loading: false
      }));

      // Recarregar dados do servidor para garantir sincronização
      const { fetchMaintenanceReminders } = get();
      setTimeout(() => {
        fetchMaintenanceReminders();
      }, 500);

    } catch (error) {
      console.error('❌ Store: Erro ao completar lembrete:', error);
      set({ loading: false });
      throw error;
    }
  },

  deleteMaintenanceReminder: async (id: string) => {
    set({ loading: true });
    try {
      await apiService.deleteReminder(id);
      set(state => ({
        maintenanceReminders: state.maintenanceReminders.filter(r => r.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('❌ Store: Erro ao deletar lembrete:', error);
      set({ loading: false });
      throw error;
    }
  },

  // Expenses
  fetchExpenses: async (vehicleId?: string) => {
    try {
      const { user } = get();
      if (!user || !user.id) {
        console.warn('⚠️ Store: Tentativa de buscar despesas sem usuário autenticado');
        return;
      }

      console.log('💰 Store: Buscando despesas para usuário:', user.id);
      const filters = vehicleId ? { vehicleId } : undefined;
      const expenses = await apiService.getExpenses(filters);

      // Verificação de segurança: filtrar apenas despesas de veículos do usuário
      const userVehicles = get().vehicles;
      const userVehicleIds = userVehicles.map(v => v.id);

      const userExpenses = expenses.filter(e => {
        // Verificar se a despesa pertence a um veículo do usuário
        return userVehicleIds.includes(e.vehicleId);
      });

      if (userExpenses.length !== expenses.length) {
        console.warn('🚨 Store: FILTRO DE SEGURANÇA APLICADO - Algumas despesas não pertencem ao usuário atual!', {
          totalRecebidas: expenses.length,
          totalFiltradas: userExpenses.length,
          usuarioAtual: user.id
        });
      }

      set(state => ({ ...state, expenses: userExpenses }));
      console.log(`✅ Store: ${userExpenses.length} despesas carregadas para usuário ${user.email}`);
    } catch (error) {
      console.error('❌ Store: Erro ao buscar despesas:', error);
    }
  },

  createExpense: async (expenseData) => {
    set({ loading: true });
    try {
      const { user } = get();
      if (!user || !user.id) {
        throw new Error('Usuário não autenticado');
      }

      const newExpense = await apiService.createExpense(expenseData);

      // Atualizar estado imediatamente
      set(state => {
        const updatedExpenses = [...state.expenses, newExpense];
        return {
          expenses: updatedExpenses,
          loading: false
        };
      });

      // Acionar notificação
      const { onNotificationTrigger } = get();
      if (onNotificationTrigger) {
        onNotificationTrigger('expenses', 'Despesa Registrada', `Nova despesa "${newExpense.description}" de R$ ${newExpense.amount.toFixed(2)} foi registrada!`);
      }

      // Force refresh dos dados do servidor para garantir sincronização
      setTimeout(async () => {
        try {
          const refreshedExpenses = await apiService.getExpenses();
          set(state => ({ ...state, expenses: refreshedExpenses }));
        } catch (error) {
          console.warn('Aviso: Não foi possível sincronizar despesas:', error);
        }
      }, 500);

      return newExpense;
    } catch (error) {
      console.error('❌ Store: Erro ao criar despesa:', error);
      set({ loading: false });
      throw error;
    }
  },

  deleteExpense: async (id: string) => {
    set({ loading: true });
    try {
      await apiService.deleteExpense(id);
      set(state => ({
        expenses: state.expenses.filter(e => e.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('❌ Store: Erro ao deletar despesa:', error);
      set({ loading: false });
      throw error;
    }
  },

  // Vehicle Stats
  fetchVehicleStats: async (vehicleId: string) => {
    set({ loading: true });
    try {
      const { user, expenses, maintenanceServices, maintenanceReminders } = get();

      if (!user || !user.id) {
        throw new Error('Usuário não autenticado');
      }

      // Filtrar dados específicos do veículo
      const vehicleExpenses = expenses.filter(e => e.vehicleId === vehicleId);
      const vehicleMaintenances = maintenanceServices.filter(m => m.vehicleId === vehicleId);
      const vehicleReminders = maintenanceReminders.filter(r => r.vehicleId === vehicleId);

      // Calcular estatísticas básicas
      const totalExpenses = vehicleExpenses.reduce((sum, e) => sum + e.amount, 0);
      const expenseCount = vehicleExpenses.length;
      const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;
      const totalMaintenance = vehicleMaintenances.length;
      const upcomingMaintenance = vehicleMaintenances.filter(m => m.status === 'SCHEDULED').length;

      // Calcular despesas por categoria
      const expensesByCategory = vehicleExpenses.reduce((acc, expense) => {
        const category = expense.category || 'OTHER';
        acc[category] = (acc[category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

      // Calcular despesas mensais (últimos 12 meses)
      const now = new Date();
      const monthlyExpenses: Array<{ month: string; amount: number }> = [];

      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('pt-BR', {
          month: 'short',
          year: 'numeric'
        });

        const monthExpenses = vehicleExpenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === date.getMonth() &&
            expenseDate.getFullYear() === date.getFullYear();
        });

        const totalAmount = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
        monthlyExpenses.push({ month: monthKey, amount: totalAmount });
      }

      // Calcular despesas do último mês
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthExpenses = vehicleExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === lastMonth.getMonth() &&
          expenseDate.getFullYear() === lastMonth.getFullYear();
      }).reduce((sum, e) => sum + e.amount, 0);

      const stats = {
        totalExpenses,
        expenseCount,
        averageExpense,
        totalMaintenance,
        upcomingMaintenance,
        lastMonthExpenses,
        expensesByCategory,
        monthlyExpenses
      };

      console.log('📊 Store: Estatísticas calculadas para veículo:', vehicleId, stats);

      set({ vehicleStats: stats, loading: false });
    } catch (error) {
      console.error('❌ Store: Erro ao buscar estatísticas:', error);
      set({ loading: false });
    }
  },

  // Mileage Reminders
  createMileageReminder: async (data: { vehicleId: string; description: string; dueMileage: number }) => {
    try {
      const { user } = get();
      if (!user || !user.id) {
        throw new Error('Usuário não autenticado');
      }

      console.log('📝 Store: Criando lembrete de quilometragem:', data);
      const reminder = await apiService.createMileageReminder(data);

      // Atualizar lista de lembretes
      const currentReminders = get().maintenanceReminders;
      set({ maintenanceReminders: [...currentReminders, reminder] });

      console.log('✅ Store: Lembrete de quilometragem criado');
      return reminder;
    } catch (error) {
      console.error('❌ Store: Erro ao criar lembrete de quilometragem:', error);
      throw error;
    }
  },

  updateVehicleMileage: async (vehicleId: string, newMileage: number) => {
    try {
      const { user } = get();
      if (!user || !user.id) {
        throw new Error('Usuário não autenticado');
      }

      console.log('🔄 Store: Atualizando quilometragem:', { vehicleId, newMileage });
      const result = await apiService.updateVehicleMileage(vehicleId, newMileage);

      // Atualizar quilometragem do veículo na lista
      const currentVehicles = get().vehicles;
      const updatedVehicles = currentVehicles.map(vehicle =>
        vehicle.id === vehicleId
          ? { ...vehicle, mileage: newMileage }
          : vehicle
      );

      set({ vehicles: updatedVehicles });

      // Se há um veículo selecionado, atualizar também
      const selectedVehicle = get().selectedVehicle;
      if (selectedVehicle && selectedVehicle.id === vehicleId) {
        set({ selectedVehicle: { ...selectedVehicle, mileage: newMileage } });
      }

      // Verificar se há lembretes ativados na resposta do backend
      if (result.reminders && result.reminders.length > 0) {
        console.log('🔔 Store: Lembretes por quilometragem ativados:', result.reminders.length);

        // Mostrar notificação simples para cada lembrete ativado
        result.reminders.forEach((reminder: any) => {
          const vehicle = updatedVehicles.find(v => v.id === vehicleId);
          if (vehicle) {
            // Usar toast simples em vez de componente customizado
            import('react-hot-toast').then(({ toast }) => {
              toast.success(
                `🔔 ${reminder.description} - Quilometragem atingida!`,
                {
                  duration: 8000,
                  position: 'top-right',
                }
              );
            });
          }
        });
      }

      console.log('✅ Store: Quilometragem atualizada');
      return result;
    } catch (error) {
      console.error('❌ Store: Erro ao atualizar quilometragem:', error);
      throw error;
    }
  },

  getMileageReminders: async (vehicleId: string) => {
    try {
      const { user } = get();
      if (!user || !user.id) {
        throw new Error('Usuário não autenticado');
      }

      console.log('🔍 Store: Buscando lembretes de quilometragem para veículo:', vehicleId);
      const reminders = await apiService.getMileageReminders(vehicleId);

      console.log(`✅ Store: ${reminders.length} lembretes de quilometragem encontrados`);
      return reminders;
    } catch (error) {
      console.error('❌ Store: Erro ao buscar lembretes de quilometragem:', error);
      throw error;
    }
  },

  calculateNextMaintenance: async (vehicleId: string, intervalKm: number) => {
    try {
      const { user } = get();
      if (!user || !user.id) {
        throw new Error('Usuário não autenticado');
      }

      console.log('🧮 Store: Calculando próxima manutenção:', { vehicleId, intervalKm });
      const result = await apiService.calculateNextMaintenance(vehicleId, intervalKm);

      console.log('✅ Store: Próxima manutenção calculada:', result);
      return result;
    } catch (error) {
      console.error('❌ Store: Erro ao calcular próxima manutenção:', error);
      throw error;
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
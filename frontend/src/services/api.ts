import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { Vehicle, MaintenanceService, MaintenanceReminder, Expense } from '../types';

// Configurações da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiService {
    private api: AxiosInstance;
    private preventRedirect = false;
    private currentUserId: string | null = null;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor para adicionar token
        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Adicionar cabeçalhos para evitar cache
                config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
                config.headers['Pragma'] = 'no-cache';
                config.headers['Expires'] = '0';
                config.headers['X-Requested-With'] = 'XMLHttpRequest';

                console.log('🌐 API Request:', config.method?.toUpperCase(), config.url, {
                    hasToken: !!token,
                    userId: this.currentUserId
                });
                return config;
            },
            (error) => {
                console.error('❌ Request error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor para tratar erros
        this.api.interceptors.response.use(
            (response: AxiosResponse) => {
                console.log('✅ API Response:', response.status, response.config.url);
                return response;
            },
            (error: AxiosError) => {
                console.error('❌ API Error:', error.response?.status, error.config?.url, error.response?.data);

                if (error.response?.status === 401 && !this.preventRedirect) {
                    console.log('🚪 Token inválido, limpando autenticação');
                    this.clearAllCache();
                }

                return Promise.reject(error);
            }
        );
    }

    // Métodos de token
    setToken(token: string): void {
        localStorage.setItem('auth_token', token);
        console.log('✅ Token salvo');
    }

    clearToken(): void {
        localStorage.removeItem('auth_token');

        // Limpar headers de autorização da instância
        delete this.api.defaults.headers.Authorization;

        // Limpar qualquer cache do axios
        this.api.defaults.cache = false;

        console.log('🗑️ Token removido');
    }

    // Função para limpar completamente todos os dados e cache
    clearAllCache(): void {
        console.log('🧹 ApiService: Iniciando limpeza completa...');

        // Limpar dados de usuário atual
        this.currentUserId = null;

        // Limpar token
        this.clearToken();

        // Limpar localStorage de forma mais agressiva
        const keysToRemove: string[] = [];
        Object.keys(localStorage).forEach(key => {
            if (key.includes('auth') ||
                key.includes('token') ||
                key.includes('user') ||
                key.includes('vehicle') ||
                key.includes('maintenance') ||
                key.includes('expense') ||
                key.includes('reminder') ||
                key.includes('cache') ||
                key.includes('data')) {
                keysToRemove.push(key);
            }
        });

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🗑️ ApiService: Removido ${key}`);
        });

        // Limpar sessionStorage
        sessionStorage.clear();

        // Recriar a instância do axios para garantir limpeza total
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
        console.log('✅ ApiService: Cache completamente limpo');
    }

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    // Prevenir redirecionamentos automáticos
    setPreventRedirect(prevent: boolean): void {
        this.preventRedirect = prevent;
    }

    // Definir usuário atual (para validações)
    setCurrentUser(userId: string | null): void {
        this.currentUserId = userId;
        console.log('👤 ApiService: Usuário atual definido:', userId);
    }

    // AUTENTICAÇÃO
    async login(email: string, password: string): Promise<any> {
        try {
            this.setPreventRedirect(true);
            console.log('🔑 API: Fazendo login...');

            // Limpar cache antes do login
            this.clearAllCache();

            const response = await this.api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            if (!user || !user.id) {
                throw new Error('Resposta de login inválida: dados do usuário não encontrados');
            }

            this.setToken(token);
            this.setCurrentUser(user.id);
            console.log('✅ API: Login bem-sucedido para:', user.email);

            return { user, token };
        } catch (error: any) {
            console.error('❌ API: Erro no login:', error);

            // Limpar tudo em caso de erro
            this.clearAllCache();

            // Extrair mensagem específica do backend
            if (error.response?.data?.message) {
                const backendMessage = error.response.data.message;
                console.error('❌ API: Mensagem do backend:', backendMessage);
                throw new Error(backendMessage);
            }

            // Fallback para outros tipos de erro
            throw error;
        } finally {
            this.setPreventRedirect(false);
        }
    }

    async register(data: { name: string; email: string; password: string; role: string }): Promise<any> {
        try {
            this.setPreventRedirect(true);
            console.log('📝 API: Fazendo registro...');

            // Limpar cache antes do registro
            this.clearAllCache();

            const response = await this.api.post('/auth/register', data);

            // Não salvar token no registro, pois não fazemos login automático
            console.log('✅ API: Registro bem-sucedido');

            return { success: true, message: 'Conta criada com sucesso!' };
        } catch (error: any) {
            console.error('❌ API: Erro no registro:', error);

            // Extrair mensagem específica do backend
            if (error.response?.data?.message) {
                const backendMessage = error.response.data.message;
                console.error('❌ API: Mensagem do backend:', backendMessage);
                throw new Error(backendMessage);
            }

            // Fallback para outros tipos de erro
            throw error;
        } finally {
            this.setPreventRedirect(false);
        }
    }

    async getProfile(): Promise<any> {
        try {
            console.log('👤 API: Buscando perfil...');
            const response = await this.api.get('/auth/profile', {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            const userProfile = response.data;

            if (!userProfile || !userProfile.id) {
                throw new Error('Perfil de usuário inválido recebido');
            }

            this.setCurrentUser(userProfile.id);
            console.log('✅ API: Perfil carregado para:', userProfile.email);
            return userProfile;
        } catch (error: any) {
            console.error('❌ API: Erro ao buscar perfil:', error);
            this.clearAllCache();
            throw error;
        }
    }

    async forgotPassword(email: string): Promise<any> {
        try {
            const response = await this.api.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    async resetPassword(token: string, password: string): Promise<any> {
        try {
            const response = await this.api.post('/auth/reset-password', { token, password });
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    async validateResetToken(token: string): Promise<any> {
        try {
            const response = await this.api.post('/auth/validate-reset-token', { token });
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    // VEÍCULOS
    async getVehicles(): Promise<Vehicle[]> {
        try {
            console.log('🚗 API: Buscando veículos...');
            const response = await this.api.get('/vehicles', {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            const vehicles = response.data;

            // Validar se todos os veículos pertencem ao usuário atual
            if (this.currentUserId) {
                const userVehicles = vehicles.filter((v: Vehicle) => v.ownerId === this.currentUserId);
                if (userVehicles.length !== vehicles.length) {
                    console.warn('⚠️ API: Alguns veículos não pertencem ao usuário atual, filtrando...');
                    return userVehicles;
                }
            }

            console.log(`✅ API: ${vehicles.length} veículos carregados`);
            return vehicles;
        } catch (error: any) {
            console.error('❌ API: Erro ao buscar veículos:', error);
            throw error;
        }
    }

    async getVehicle(id: string): Promise<Vehicle> {
        try {
            console.log('🚗 API: Buscando veículo:', id);
            const response = await this.api.get(`/vehicles/${id}`);
            const vehicle = response.data;

            // Validar se o veículo pertence ao usuário atual
            if (this.currentUserId && vehicle.ownerId !== this.currentUserId) {
                throw new Error('Acesso negado: veículo não pertence ao usuário atual');
            }

            console.log('✅ API: Veículo carregado:', vehicle.brand, vehicle.model);
            return vehicle;
        } catch (error: any) {
            console.error('❌ API: Erro ao buscar veículo:', error);
            throw error;
        }
    }

    async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
        try {
            console.log('🚗 API: Criando veículo:', vehicle);

            // Validar se o ownerId está correto
            if (this.currentUserId && vehicle.ownerId !== this.currentUserId) {
                console.warn('⚠️ API: ownerId corrigido para usuário atual');
                vehicle.ownerId = this.currentUserId;
            }

            const response = await this.api.post('/vehicles', vehicle);
            const newVehicle = response.data;

            // Validar se o veículo criado pertence ao usuário atual
            if (this.currentUserId && newVehicle.ownerId !== this.currentUserId) {
                throw new Error('Erro de segurança: veículo criado não pertence ao usuário atual');
            }

            console.log('✅ API: Veículo criado:', newVehicle.brand, newVehicle.model);
            return newVehicle;
        } catch (error: any) {
            console.error('❌ API: Erro ao criar veículo:', error);
            throw error;
        }
    }

    async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
        try {
            console.log('🚗 API: Atualizando veículo:', id);
            const response = await this.api.put(`/vehicles/${id}`, vehicle);
            const updatedVehicle = response.data;

            // Validar se o veículo atualizado pertence ao usuário atual
            if (this.currentUserId && updatedVehicle.ownerId !== this.currentUserId) {
                throw new Error('Erro de segurança: veículo não pertence ao usuário atual');
            }

            console.log('✅ API: Veículo atualizado');
            return updatedVehicle;
        } catch (error: any) {
            console.error('❌ API: Erro ao atualizar veículo:', error);
            throw error;
        }
    }

    async deleteVehicle(id: string): Promise<void> {
        try {
            console.log('🚗 API: Deletando veículo:', id);
            await this.api.delete(`/vehicles/${id}`);
            console.log('✅ API: Veículo deletado');
        } catch (error: any) {
            console.error('❌ API: Erro ao deletar veículo:', error);
            throw error;
        }
    }

    // FIPE API - MARCAS E MODELOS
    async getBrands(): Promise<Array<{ codigo: string; nome: string }>> {
        try {
            console.log('🏷️ API: Buscando marcas de veículos...');
            const response = await this.api.get('/vehicles/brands');
            console.log(`✅ API: ${response.data.length} marcas carregadas`);
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao buscar marcas:', error);
            throw error;
        }
    }

    async getModels(brandCode: string): Promise<Array<{ codigo: string; nome: string }>> {
        try {
            console.log(`🏷️ API: Buscando modelos da marca ${brandCode}...`);
            const response = await this.api.get(`/vehicles/brands/${brandCode}/models`);
            console.log(`✅ API: ${response.data.length} modelos carregados`);
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao buscar modelos:', error);
            throw error;
        }
    }

    async getYears(brandCode: string, modelCode: string): Promise<Array<{ codigo: string; nome: string }>> {
        try {
            console.log(`🏷️ API: Buscando anos do modelo ${modelCode}...`);
            const response = await this.api.get(`/vehicles/brands/${brandCode}/models/${modelCode}/years`);
            console.log(`✅ API: ${response.data.length} anos carregados`);
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao buscar anos:', error);
            throw error;
        }
    }

    // MILEAGE REMINDERS API
    async createMileageReminder(data: {
        vehicleId: string;
        description: string;
        dueMileage: number;
    }): Promise<any> {
        try {
            console.log('📝 API: Criando lembrete de quilometragem...');
            const response = await this.api.post('/mileage-reminders', data);
            console.log('✅ API: Lembrete de quilometragem criado');
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao criar lembrete de quilometragem:', error);
            throw error;
        }
    }

    async updateVehicleMileage(vehicleId: string, newMileage: number): Promise<any> {
        try {
            console.log(`🔄 API: Atualizando quilometragem do veículo ${vehicleId} para ${newMileage}km`);
            const response = await this.api.put('/vehicles/mileage', {
                vehicleId,
                newMileage
            });
            console.log('✅ API: Quilometragem atualizada');
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao atualizar quilometragem:', error);
            throw error;
        }
    }

    async getMileageReminders(vehicleId: string): Promise<any[]> {
        try {
            console.log(`🔍 API: Buscando lembretes de quilometragem para veículo ${vehicleId}`);
            const response = await this.api.get(`/vehicles/${vehicleId}/mileage-reminders`);
            console.log(`✅ API: ${response.data.length} lembretes encontrados`);
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao buscar lembretes de quilometragem:', error);
            throw error;
        }
    }

    async calculateNextMaintenance(vehicleId: string, intervalKm: number): Promise<any> {
        try {
            console.log(`🧮 API: Calculando próxima manutenção para veículo ${vehicleId} com intervalo de ${intervalKm}km`);
            const response = await this.api.get(`/vehicles/${vehicleId}/next-maintenance?intervalKm=${intervalKm}`);
            console.log('✅ API: Próxima manutenção calculada');
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao calcular próxima manutenção:', error);
            throw error;
        }
    }

    // MANUTENÇÕES
    async getMaintenances(filters?: { vehicleId?: string }): Promise<MaintenanceService[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.vehicleId) {
                params.append('vehicleId', filters.vehicleId);
            }

            console.log('🔧 API: Buscando manutenções...');
            const response = await this.api.get(`/maintenance?${params.toString()}`, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            console.log(`✅ API: ${response.data.length} manutenções carregadas`);
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao buscar manutenções:', error);
            throw error;
        }
    }

    async createMaintenance(maintenance: Omit<MaintenanceService, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceService> {
        try {
            console.log('🔧 API: Criando manutenção:', maintenance);
            const response = await this.api.post('/maintenance', maintenance);
            console.log('✅ API: Manutenção criada:', response.data.description);
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao criar manutenção:', error);
            throw error;
        }
    }

    async updateMaintenance(id: string, data: Partial<MaintenanceService>): Promise<MaintenanceService> {
        try {
            console.log('🔧 API: Atualizando manutenção:', id);
            const response = await this.api.put(`/maintenance/${id}`, data);
            console.log('✅ API: Manutenção atualizada');
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao atualizar manutenção:', error);
            throw error;
        }
    }

    async deleteMaintenance(id: string): Promise<void> {
        try {
            console.log('🔧 API: Deletando manutenção:', id);
            await this.api.delete(`/maintenance/${id}`);
            console.log('✅ API: Manutenção deletada');
        } catch (error: any) {
            console.error('❌ API: Erro ao deletar manutenção:', error);
            throw error;
        }
    }

    // LEMBRETES
    async getReminders(filters?: { vehicleId?: string }): Promise<MaintenanceReminder[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.vehicleId) {
                params.append('vehicleId', filters.vehicleId);
            }

            console.log('⏰ API: Buscando lembretes...');
            const response = await this.api.get(`/reminders?${params.toString()}`, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            console.log(`✅ API: ${response.data.length} lembretes carregados`);
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao buscar lembretes:', error);
            throw error;
        }
    }

    async createReminder(reminder: Omit<MaintenanceReminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceReminder> {
        try {
            console.log('⏰ API: Criando lembrete:', reminder);
            const response = await this.api.post('/reminders', reminder);
            console.log('✅ API: Lembrete criado:', response.data.description);
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao criar lembrete:', error);
            throw error;
        }
    }

    async completeReminder(id: string): Promise<void> {
        try {
            console.log('⏰ API: Completando lembrete:', id);
            await this.api.patch(`/reminders/${id}/complete`);
            console.log('✅ API: Lembrete completado');
        } catch (error: any) {
            console.error('❌ API: Erro ao completar lembrete:', error);
            throw error;
        }
    }

    async deleteReminder(id: string): Promise<void> {
        try {
            console.log('⏰ API: Deletando lembrete:', id);
            await this.api.delete(`/reminders/${id}`);
            console.log('✅ API: Lembrete deletado');
        } catch (error: any) {
            console.error('❌ API: Erro ao deletar lembrete:', error);
            throw error;
        }
    }

    // GASTOS
    async getExpenses(filters?: { vehicleId?: string }): Promise<Expense[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.vehicleId) {
                params.append('vehicleId', filters.vehicleId);
            }

            console.log('💰 API: Buscando despesas...');
            const response = await this.api.get(`/expenses?${params.toString()}`, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            console.log(`✅ API: ${response.data.length} despesas carregadas`);
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao buscar despesas:', error);
            throw error;
        }
    }

    async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
        try {
            console.log('💰 API: Criando despesa:', expense);
            const response = await this.api.post('/expenses', expense);
            console.log('✅ API: Despesa criada:', response.data.description);
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao criar despesa:', error);
            throw error;
        }
    }

    async updateExpense(id: string, data: Partial<Expense>): Promise<Expense> {
        try {
            console.log('💰 API: Atualizando despesa:', id);
            const response = await this.api.put(`/expenses/${id}`, data);
            console.log('✅ API: Despesa atualizada');
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao atualizar despesa:', error);
            throw error;
        }
    }

    async deleteExpense(id: string): Promise<void> {
        try {
            console.log('💰 API: Deletando despesa:', id);
            await this.api.delete(`/expenses/${id}`);
            console.log('✅ API: Despesa deletada');
        } catch (error: any) {
            console.error('❌ API: Erro ao deletar despesa:', error);
            throw error;
        }
    }

    // NOTIFICAÇÕES
    async getNotifications(): Promise<any[]> {
        try {
            console.log('🔔 API: Buscando notificações...');
            const response = await this.api.get('/notifications');
            console.log(`✅ API: ${response.data.length || response.data.notifications?.length || 0} notificações carregadas`);
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao buscar notificações:', error);
            throw error;
        }
    }

    async markNotificationAsRead(id: string): Promise<void> {
        try {
            console.log('🔔 API: Marcando notificação como lida:', id);
            await this.api.patch(`/notifications/${id}/read`);
            console.log('✅ API: Notificação marcada como lida');
        } catch (error: any) {
            console.error('❌ API: Erro ao marcar notificação como lida:', error);
            throw error;
        }
    }

    async markAllNotificationsAsRead(): Promise<void> {
        try {
            console.log('🔔 API: Marcando todas notificações como lidas');
            await this.api.patch('/notifications/read-all');
            console.log('✅ API: Todas notificações marcadas como lidas');
        } catch (error: any) {
            console.error('❌ API: Erro ao marcar todas notificações como lidas:', error);
            throw error;
        }
    }

    // Getter para acessar a instância do axios
    get apiInstance() {
        return this.api;
    }
}

// Create and export a single instance
const apiService = new ApiService();
export const api = apiService;
export default apiService;
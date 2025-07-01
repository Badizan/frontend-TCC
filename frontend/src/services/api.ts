import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { Vehicle, MaintenanceService, MaintenanceReminder, Expense } from '../types';

// Configurações da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiService {
    private api: AxiosInstance;
    private preventRedirect = false;

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
                console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
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
                console.error('❌ API Error:', error.response?.status, error.config?.url);

                if (error.response?.status === 401 && !this.preventRedirect) {
                    console.log('🚪 Token inválido, limpando autenticação');
                    this.clearToken();
                    // Não redireciona automaticamente - deixa isso para os componentes
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

        console.log('🗑️ Token e cache removidos');
    }

    // Função para limpar completamente todos os dados e cache
    clearAllCache(): void {
        this.clearToken();

        // Recriar a instância do axios para garantir limpeza total
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
        console.log('🧹 Cache da API completamente limpo');
    }

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    // Prevenir redirecionamentos automáticos
    setPreventRedirect(prevent: boolean): void {
        this.preventRedirect = prevent;
    }

    // AUTENTICAÇÃO
    async login(email: string, password: string): Promise<any> {
        try {
            this.setPreventRedirect(true);
            console.log('🔑 API: Fazendo login...');

            const response = await this.api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            this.setToken(token);
            console.log('✅ API: Login bem-sucedido');

            return { user, token };
        } catch (error: any) {
            console.error('❌ API: Erro no login:', error);

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
            console.log('✅ API: Perfil carregado');
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao buscar perfil:', error);
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
            const response = await this.api.get('/vehicles', {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar veículos:', error);
            throw error;
        }
    }

    async getVehicle(id: string): Promise<Vehicle> {
        try {
            const response = await this.api.get(`/vehicles/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar veículo:', error);
            throw error;
        }
    }

    async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
        try {
            console.log('🚗 API: Criando veículo:', vehicle);
            const response = await this.api.post('/vehicles', vehicle);
            console.log('✅ API: Veículo criado:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ API: Erro ao criar veículo:', error);
            throw error;
        }
    }

    async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
        try {
            const response = await this.api.put(`/vehicles/${id}`, vehicle);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao atualizar veículo:', error);
            throw error;
        }
    }

    async deleteVehicle(id: string): Promise<void> {
        try {
            await this.api.delete(`/vehicles/${id}`);
        } catch (error: any) {
            console.error('Erro ao deletar veículo:', error);
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

            const response = await this.api.get(`/maintenances?${params.toString()}`, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar manutenções:', error);
            throw error;
        }
    }

    async createMaintenance(maintenance: Omit<MaintenanceService, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceService> {
        try {
            const response = await this.api.post('/maintenance', maintenance);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao criar manutenção:', error);
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

            const response = await this.api.get(`/reminders?${params.toString()}`, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar lembretes:', error);
            throw error;
        }
    }

    async createReminder(reminder: Omit<MaintenanceReminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceReminder> {
        try {
            const response = await this.api.post('/reminders', reminder);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao criar lembrete:', error);
            throw error;
        }
    }

    async completeReminder(id: string): Promise<void> {
        try {
            await this.api.patch(`/reminders/${id}/complete`);
        } catch (error: any) {
            console.error('Erro ao completar lembrete:', error);
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

            const response = await this.api.get(`/expenses?${params.toString()}`, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar despesas:', error);
            throw error;
        }
    }

    async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
        try {
            const response = await this.api.post('/expenses', expense);
            return response.data;
        } catch (error: any) {
            console.error('Erro ao criar gasto:', error);
            throw error;
        }
    }

    // NOTIFICAÇÕES
    async getNotifications(): Promise<any[]> {
        try {
            const response = await this.api.get('/notifications');
            return response.data;
        } catch (error: any) {
            console.error('Erro ao buscar notificações:', error);
            throw error;
        }
    }

    async markNotificationAsRead(id: string): Promise<void> {
        try {
            await this.api.patch(`/notifications/${id}/read`);
        } catch (error: any) {
            console.error('Erro ao marcar notificação como lida:', error);
            throw error;
        }
    }

    async markAllNotificationsAsRead(): Promise<void> {
        try {
            await this.api.patch('/notifications/read-all');
        } catch (error: any) {
            console.error('Erro ao marcar todas notificações como lidas:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const api = new ApiService();
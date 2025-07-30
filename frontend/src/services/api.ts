import axios, { AxiosInstance, AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { Vehicle, MaintenanceService, MaintenanceReminder, Expense } from '../types';

// Configurações da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo
const CIRCUIT_BREAKER_THRESHOLD = 5; // falhas consecutivas
const CIRCUIT_BREAKER_TIMEOUT = 30000; // 30 segundos

// Tipos de erro customizados
export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public errorCode?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class NetworkError extends ApiError {
    constructor(message: string = 'Erro de conexão com o servidor') {
        super(message, 0, 'NETWORK_ERROR');
        this.name = 'NetworkError';
    }
}

export class ValidationError extends ApiError {
    constructor(message: string, details?: any) {
        super(message, 400, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends ApiError {
    constructor(message: string = 'Não autorizado') {
        super(message, 401, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string = 'Recurso não encontrado') {
        super(message, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

// Circuit Breaker simples
class CircuitBreaker {
    private failures = 0;
    private lastFailureTime?: number;
    private state: 'closed' | 'open' | 'half-open' = 'closed';

    isOpen(): boolean {
        if (this.state === 'open') {
            const now = Date.now();
            if (this.lastFailureTime && now - this.lastFailureTime > CIRCUIT_BREAKER_TIMEOUT) {
                this.state = 'half-open';
                return false;
            }
            return true;
        }
        return false;
    }

    recordSuccess(): void {
        this.failures = 0;
        this.state = 'closed';
    }

    recordFailure(): void {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= CIRCUIT_BREAKER_THRESHOLD) {
            this.state = 'open';
            console.error('🔴 Circuit breaker ABERTO - muitas falhas consecutivas');
        }
    }

    getState(): string {
        return this.state;
    }
}

export class ApiService {
    private api: AxiosInstance;
    private preventRedirect = false;
    private currentUserId: string | null = null;
    private circuitBreaker = new CircuitBreaker();

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
                    userId: this.currentUserId,
                    circuitBreakerState: this.circuitBreaker.getState()
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
                this.circuitBreaker.recordSuccess();
                return response;
            },
            async (error: AxiosError) => {
                console.error('❌ API Error:', error.response?.status, error.config?.url, error.response?.data);

                // Registrar falha no circuit breaker
                if (!error.response || error.response.status >= 500) {
                    this.circuitBreaker.recordFailure();
                }

                // Tratar erro específico
                const apiError = this.handleAxiosError(error);

                // Se for erro de autenticação e não estiver prevenindo redirect
                if (apiError instanceof AuthenticationError && !this.preventRedirect) {
                    console.log('🚪 Token inválido, limpando autenticação');
                    this.clearAllCache();
                }

                return Promise.reject(apiError);
            }
        );
    }

    // Converter erro do Axios em erro customizado
    private handleAxiosError(error: AxiosError): ApiError {
        if (!error.response) {
            // Erro de rede
            if (error.code === 'ECONNABORTED') {
                return new NetworkError('Tempo limite da requisição excedido');
            }
            return new NetworkError();
        }

        const status = error.response.status;
        const data = error.response.data as any;
        const message = data?.message || error.message;

        switch (status) {
            case 400:
                return new ValidationError(message, data?.details);
            case 401:
                return new AuthenticationError(message);
            case 404:
                return new NotFoundError(message);
            case 409:
                return new ApiError(message, 409, 'CONFLICT');
            case 422:
                return new ValidationError(message, data?.errors);
            case 429:
                return new ApiError('Muitas requisições. Tente novamente mais tarde.', 429, 'RATE_LIMIT');
            case 500:
                return new ApiError('Erro interno do servidor', 500, 'INTERNAL_ERROR');
            case 503:
                return new ApiError('Serviço temporariamente indisponível', 503, 'SERVICE_UNAVAILABLE');
            default:
                return new ApiError(message, status);
        }
    }

    // Função para fazer requisições com retry
    private async makeRequestWithRetry<T>(
        config: AxiosRequestConfig,
        retries = MAX_RETRIES
    ): Promise<AxiosResponse<T>> {
        // Verificar circuit breaker
        if (this.circuitBreaker.isOpen()) {
            throw new ApiError(
                'Serviço temporariamente indisponível. Tente novamente em alguns segundos.',
                503,
                'CIRCUIT_BREAKER_OPEN'
            );
        }

        try {
            return await this.api.request<T>(config);
        } catch (error) {
            // Se for ApiError, verificar se deve fazer retry
            if (error instanceof ApiError) {
                const shouldRetry = 
                    retries > 0 && 
                    (error.statusCode === 0 || // Erro de rede
                     error.statusCode === 503 || // Serviço indisponível
                     error.statusCode === 429 || // Rate limit
                     (error.statusCode && error.statusCode >= 500)); // Erros do servidor

                if (shouldRetry) {
                    console.log(`⏳ Tentando novamente em ${RETRY_DELAY}ms... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
                    return this.makeRequestWithRetry<T>(config, retries - 1);
                }
            }
            throw error;
        }
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

            const response = await this.makeRequestWithRetry({
                method: 'POST',
                url: '/auth/login',
                data: { email, password }
            });
            
            const { token, user } = response.data;

            if (!user || !user.id) {
                throw new ValidationError('Resposta de login inválida: dados do usuário não encontrados');
            }

            this.setToken(token);
            this.setCurrentUser(user.id);
            console.log('✅ API: Login bem-sucedido para:', user.email);

            return { user, token };
        } catch (error: any) {
            console.error('❌ API: Erro no login:', error);

            // Limpar tudo em caso de erro
            this.clearAllCache();

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
            console.log(`
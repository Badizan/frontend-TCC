import { api } from './api';

export interface Notification {
    id: string;
    title: string;
    message: string;
    category: 'maintenance' | 'expenses' | 'reminders' | 'system';
    channel: 'IN_APP' | 'EMAIL';
    read: boolean;
    createdAt: string;
    userId: string;
}

export interface NotificationResponse {
    notifications: Notification[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
}

class NotificationService {
    private static instance: NotificationService;

    constructor() {
        if (NotificationService.instance) {
            return NotificationService.instance;
        }
        NotificationService.instance = this;
    }

    // Inicialização básica
    initialize() {
        console.log('📱 NotificationService inicializado');
    }

    // Limpeza
    cleanup() {
        console.log('🧹 NotificationService limpo');
    }

    // Inicialização após login
    async initializeAfterLogin(): Promise<void> {
        try {
            console.log('🔔 Inicializando notificações após login');
            // Aqui poderia configurar WebSocket para notificações em tempo real
            await this.setupNotificationPermissions();
        } catch (error) {
            console.error('❌ Erro ao inicializar notificações:', error);
        }
    }

    // Configurar permissões de notificação
    async setupNotificationPermissions(): Promise<boolean> {
        try {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            }
            return false;
        } catch (error) {
            console.error('❌ Erro ao configurar permissões:', error);
            return false;
        }
    }

    // Buscar notificações do backend
    async getNotifications(options?: {
        page?: number;
        limit?: number;
        unreadOnly?: boolean;
        category?: string;
    }): Promise<Notification[] | NotificationResponse> {
        try {
            console.log('📥 Buscando notificações...');

            // Construir query parameters
            const params = new URLSearchParams();
            if (options?.page) params.append('page', options.page.toString());
            if (options?.limit) params.append('limit', options.limit.toString());
            if (options?.unreadOnly) params.append('unreadOnly', 'true');
            if (options?.category) params.append('category', options.category);

            const queryString = params.toString();
            const url = `/notifications${queryString ? `?${queryString}` : ''}`;

            const response = await api.apiInstance.get(url);

            console.log('✅ Notificações carregadas:', response.data);

            // Se a resposta é um array, é compatibilidade com versão antiga
            if (Array.isArray(response.data)) {
                return response.data as Notification[];
            }

            // Se a resposta tem estrutura completa
            return response.data as NotificationResponse;
        } catch (error) {
            console.error('❌ Erro ao buscar notificações:', error);

            // Retornar array vazio em caso de erro (sem mock)
            return [];
        }
    }

    // Buscar apenas notificações não lidas
    async getUnreadNotifications(): Promise<Notification[]> {
        try {
            const response = await api.apiInstance.get('/notifications/unread');
            return response.data.notifications || response.data;
        } catch (error) {
            console.error('❌ Erro ao buscar notificações não lidas:', error);
            return [];
        }
    }

    // Marcar notificação como lida
    async markAsRead(notificationId: string): Promise<void> {
        try {
            console.log('✅ Marcando notificação como lida:', notificationId);
            await api.markNotificationAsRead(notificationId);
        } catch (error) {
            console.error('❌ Erro ao marcar notificação como lida:', error);
            throw error;
        }
    }

    // Marcar todas as notificações como lidas
    async markAllAsRead(): Promise<void> {
        try {
            console.log('✅ Marcando todas notificações como lidas');
            await api.markAllNotificationsAsRead();
        } catch (error) {
            console.error('❌ Erro ao marcar todas notificações como lidas:', error);
            throw error;
        }
    }

    // Deletar notificação (se suportado pelo backend)
    async deleteNotification(notificationId: string): Promise<void> {
        try {
            console.log('🗑️ Deletando notificação:', notificationId);
            await api.apiInstance.delete(`/notifications/${notificationId}`);
        } catch (error) {
            console.error('❌ Erro ao deletar notificação:', error);
            throw error;
        }
    }

    // Enviar notificação local (browser)
    sendLocalNotification(title: string, message: string, options?: NotificationOptions) {
        try {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, {
                    body: message,
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    ...options
                });
            }
        } catch (error) {
            console.error('❌ Erro ao enviar notificação local:', error);
        }
    }

    // Dados mock para fallback
    private getMockNotifications(): Notification[] {
        return [
            {
                id: 'mock-1',
                title: 'Lembrete de Manutenção',
                message: 'Está na hora de fazer a revisão do seu veículo.',
                category: 'maintenance',
                channel: 'IN_APP',
                read: false,
                createdAt: new Date().toISOString(),
                userId: 'current-user'
            },
            {
                id: 'mock-2',
                title: 'Despesa Registrada',
                message: 'Nova despesa de combustível foi adicionada: R$ 120,00.',
                category: 'expenses',
                channel: 'IN_APP',
                read: false,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                userId: 'current-user'
            },
            {
                id: 'mock-3',
                title: 'Lembrete Vencido',
                message: 'Você tem um lembrete vencido para trocar o óleo do motor.',
                category: 'reminders',
                channel: 'IN_APP',
                read: false,
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                userId: 'current-user'
            },
            {
                id: 'mock-4',
                title: 'Sistema AutoManutenção',
                message: 'Bem-vindo ao sistema! Cadastre seus veículos para começar.',
                category: 'system',
                channel: 'IN_APP',
                read: false,
                createdAt: new Date(Date.now() - 300000).toISOString(),
                userId: 'current-user'
            },
            {
                id: 'mock-5',
                title: 'Próxima Revisão',
                message: 'Sua próxima revisão está agendada para a próxima semana.',
                category: 'maintenance',
                channel: 'IN_APP',
                read: false,
                createdAt: new Date(Date.now() - 7200000).toISOString(),
                userId: 'current-user'
            }
        ];
    }

    // Método para verificar se notificações estão habilitadas
    isNotificationEnabled(): boolean {
        return 'Notification' in window && Notification.permission === 'granted';
    }

    // Método para se inscrever em notificações push
    async subscribeToPushNotifications(): Promise<boolean> {
        try {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            }
            return false;
        } catch (error) {
            console.error('❌ Erro ao ativar notificações push:', error);
            return false;
        }
    }

    // Método para mostrar notificação local
    showLocalNotification(title: string, options?: {
        body?: string;
        icon?: string;
    }) {
        try {
            if (this.isNotificationEnabled()) {
                new Notification(title, {
                    body: options?.body || '',
                    icon: options?.icon || '/favicon.ico'
                });
            }
        } catch (error) {
            console.error('❌ Erro ao mostrar notificação local:', error);
        }
    }

    // Método para testar notificação push
    async testPushNotification(): Promise<void> {
        try {
            this.showLocalNotification('Teste de Notificação', {
                body: 'Esta é uma notificação de teste do sistema AutoManutenção!'
            });
        } catch (error) {
            console.error('❌ Erro ao testar notificação:', error);
        }
    }

    // Verificar notificações imediatas
    async checkImmediate(): Promise<void> {
        try {
            console.log('🔍 Solicitando verificação de notificações imediatas...');
            await api.apiInstance.post('/notifications/check-immediate');
            console.log('✅ Verificação de notificações imediatas solicitada');
        } catch (error) {
            console.error('❌ Erro ao verificar notificações imediatas:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
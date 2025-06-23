export interface Notification {
    id: string;
    userId: string;
    type: 'MAINTENANCE_DUE' | 'REMINDER_DUE' | 'MILEAGE_ALERT' | 'EXPENSE_LIMIT' | 'SYSTEM_UPDATE';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    data?: any;
}

export class NotificationService {
    private pushSubscription: PushSubscription | null = null;
    private apiUrl = 'http://localhost:3333';

    constructor() {
        this.initializePushNotifications();
    }

    // Inicializar notificações push
    async initializePushNotifications() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push notifications não são suportadas neste navegador');
            return;
        }

        try {
            // Registrar service worker
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registrado:', registration);

            // Verificar se já existe uma subscription
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                this.pushSubscription = existingSubscription;
            }

            // Escutar mensagens do service worker
            navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));

        } catch (error) {
            console.error('Erro ao inicializar notificações push:', error);
        }
    }

    // Solicitar permissão para notificações
    async requestNotificationPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('Este navegador não suporta notificações');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission === 'denied') {
            console.warn('Usuário negou permissão para notificações');
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    // Inscrever-se para receber push notifications
    async subscribeToPushNotifications(): Promise<boolean> {
        try {
            const hasPermission = await this.requestNotificationPermission();
            if (!hasPermission) {
                return false;
            }

            const registration = await navigator.serviceWorker.ready;

            // Chave pública VAPID (você precisa gerar uma)
            const vapidPublicKey = 'your-vapid-public-key-here';

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
            });

            this.pushSubscription = subscription;

            // Enviar subscription para o servidor
            await this.savePushSubscription(subscription);

            console.log('Push subscription criada:', subscription);
            return true;

        } catch (error) {
            console.error('Erro ao criar push subscription:', error);
            return false;
        }
    }

    // Salvar subscription no servidor
    private async savePushSubscription(subscription: PushSubscription) {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await fetch(`${this.apiUrl}/notifications/push-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subscription })
            });
        } catch (error) {
            console.error('Erro ao salvar subscription no servidor:', error);
        }
    }

    // Exibir notificação local
    showLocalNotification(title: string, options: NotificationOptions = {}) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/icon-192x192.png',
                badge: '/badge-72x72.png',
                ...options
            });

            // Auto-fechar após 5 segundos
            setTimeout(() => {
                notification.close();
            }, 5000);

            return notification;
        }
    }

    // Buscar notificações do servidor
    async getNotifications(options: {
        page?: number;
        limit?: number;
        unreadOnly?: boolean;
    } = {}): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token não encontrado');

        const params = new URLSearchParams();
        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.unreadOnly) params.append('unreadOnly', 'true');

        try {
            const response = await fetch(`${this.apiUrl}/notifications?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar notificações');
            }

            const data = await response.json();
            return data.data || data;

        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
            throw error;
        }
    }

    // Marcar notificação como lida
    async markAsRead(notificationId: string): Promise<void> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token não encontrado');

        try {
            await fetch(`${this.apiUrl}/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
            throw error;
        }
    }

    // Marcar todas as notificações como lidas
    async markAllAsRead(): Promise<void> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token não encontrado');

        try {
            await fetch(`${this.apiUrl}/notifications/read-all`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Erro ao marcar todas as notificações como lidas:', error);
            throw error;
        }
    }

    // Deletar notificação
    async deleteNotification(notificationId: string): Promise<void> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token não encontrado');

        try {
            await fetch(`${this.apiUrl}/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Erro ao deletar notificação:', error);
            throw error;
        }
    }

    // Buscar contador de notificações não lidas
    async getUnreadCount(): Promise<number> {
        const token = localStorage.getItem('token');
        if (!token) return 0;

        try {
            const response = await fetch(`${this.apiUrl}/notifications/unread-count`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar contador de notificações');
            }

            const data = await response.json();
            return data.data?.unreadCount || 0;

        } catch (error) {
            console.error('Erro ao buscar contador de notificações:', error);
            return 0;
        }
    }

    // Testar notificação push
    async testPushNotification(): Promise<void> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token não encontrado');

        try {
            await fetch(`${this.apiUrl}/notifications/test-push`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            this.showLocalNotification('Teste de Notificação', {
                body: 'Se você está vendo isso, as notificações estão funcionando!',
                tag: 'test-notification'
            });

        } catch (error) {
            console.error('Erro ao testar notificação push:', error);
            throw error;
        }
    }

    // Lidar com mensagens do service worker
    private handleServiceWorkerMessage(event: MessageEvent) {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
            // Navegar para a página relevante quando a notificação for clicada
            const notificationData = event.data.data;

            if (notificationData.vehicleId) {
                window.location.href = `/vehicles/${notificationData.vehicleId}`;
            } else if (notificationData.maintenanceId) {
                window.location.href = `/maintenance`;
            } else if (notificationData.reminderId) {
                window.location.href = `/reminders`;
            }
        }
    }

    // Converter chave VAPID para Uint8Array
    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Verificar se as notificações estão ativas
    isNotificationEnabled(): boolean {
        return Notification.permission === 'granted' && this.pushSubscription !== null;
    }

    // Desinscrever-se das notificações push
    async unsubscribeFromPushNotifications(): Promise<boolean> {
        try {
            if (this.pushSubscription) {
                await this.pushSubscription.unsubscribe();
                this.pushSubscription = null;
                console.log('Push subscription removida');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao remover push subscription:', error);
            return false;
        }
    }

    // Configurar notificações inteligentes baseadas no contexto
    async setupSmartNotifications() {
        // Verificar lembretes próximos do vencimento
        this.scheduleReminderNotifications();

        // Configurar verificações periódicas
        setInterval(() => {
            this.checkForNewNotifications();
        }, 60000); // Verificar a cada minuto
    }

    private async scheduleReminderNotifications() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${this.apiUrl}/reminders/upcoming?days=1`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const upcomingReminders = await response.json();

            for (const reminder of upcomingReminders.data || []) {
                const reminderDate = new Date(reminder.dueDate);
                const now = new Date();
                const hoursUntilDue = (reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60);

                if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
                    this.showLocalNotification('Lembrete Próximo!', {
                        body: `${reminder.description} vence em ${Math.round(hoursUntilDue)} horas`,
                        tag: `reminder-${reminder.id}`,
                        data: { reminderId: reminder.id, vehicleId: reminder.vehicleId }
                    });
                }
            }
        } catch (error) {
            console.error('Erro ao agendar notificações de lembretes:', error);
        }
    }

    private async checkForNewNotifications() {
        try {
            const unreadCount = await this.getUnreadCount();

            // Atualizar badge no navegador se suportado
            if ('setAppBadge' in navigator) {
                if (unreadCount > 0) {
                    (navigator as any).setAppBadge(unreadCount);
                } else {
                    (navigator as any).clearAppBadge();
                }
            }

            // Disparar evento personalizado para componentes React
            window.dispatchEvent(new CustomEvent('notificationsUpdated', {
                detail: { unreadCount }
            }));

        } catch (error) {
            console.error('Erro ao verificar novas notificações:', error);
        }
    }
} 
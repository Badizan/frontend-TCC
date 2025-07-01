import webpush from 'web-push';

export interface PushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    data?: any;
    actions?: Array<{
        action: string;
        title: string;
        icon?: string;
    }>;
}

export class PushService {
    constructor() {
        this.initializeWebPush();
    }

    private initializeWebPush() {
        // Configurar credenciais VAPID
        const vapidKeys = {
            publicKey: process.env.VAPID_PUBLIC_KEY || this.generateVapidKeys().publicKey,
            privateKey: process.env.VAPID_PRIVATE_KEY || this.generateVapidKeys().privateKey,
        };

        webpush.setVapidDetails(
            'mailto:' + (process.env.VAPID_EMAIL || 'suporte@automanutencao.com'),
            vapidKeys.publicKey,
            vapidKeys.privateKey
        );

        console.log('🔔 Push Service: Configurado com VAPID');
        console.log('📋 VAPID Public Key:', vapidKeys.publicKey);
    }

    // Gerar chaves VAPID (apenas para desenvolvimento)
    private generateVapidKeys() {
        console.warn('⚠️ Gerando chaves VAPID temporárias. Configure as variáveis de ambiente em produção!');
        return webpush.generateVAPIDKeys();
    }

    // Obter chave pública VAPID
    getVapidPublicKey(): string {
        return process.env.VAPID_PUBLIC_KEY || webpush.generateVAPIDKeys().publicKey;
    }

    // Enviar notificação push
    async sendPushNotification(
        subscription: PushSubscription,
        payload: PushNotificationPayload
    ): Promise<boolean> {
        try {
            const notificationPayload = JSON.stringify({
                title: payload.title,
                body: payload.body,
                icon: payload.icon || '/pwa-192x192.png',
                badge: payload.badge || '/pwa-72x72.png',
                url: payload.url || '/',
                data: payload.data || {},
                actions: payload.actions || [],
                timestamp: Date.now(),
                requireInteraction: true,
                silent: false
            });

            await webpush.sendNotification(subscription, notificationPayload);
            console.log('✅ Push: Notificação enviada');
            return true;
        } catch (error) {
            console.error('❌ Push: Erro ao enviar notificação:', error);
            return false;
        }
    }

    // Enviar para múltiplas inscrições
    async sendPushToMultiple(
        subscriptions: PushSubscription[],
        payload: PushNotificationPayload
    ): Promise<{ success: number; failed: number }> {
        const results = await Promise.allSettled(
            subscriptions.map(subscription =>
                this.sendPushNotification(subscription, payload)
            )
        );

        const success = results.filter(r => r.status === 'fulfilled' && r.value).length;
        const failed = results.length - success;

        console.log(`📊 Push: ${success} enviadas, ${failed} falharam`);
        return { success, failed };
    }

    // ================ TEMPLATES DE NOTIFICAÇÃO ================

    // Lembrete de manutenção
    async sendMaintenanceReminderPush(
        subscriptions: PushSubscription[],
        vehicleName: string,
        maintenanceType: string,
        dueDate: string
    ): Promise<{ success: number; failed: number }> {
        const payload: PushNotificationPayload = {
            title: `🔧 Lembrete de Manutenção`,
            body: `${vehicleName} - ${maintenanceType} prevista para ${new Date(dueDate).toLocaleDateString('pt-BR')}`,
            icon: '/pwa-192x192.png',
            badge: '/pwa-72x72.png',
            url: '/maintenance',
            data: {
                type: 'maintenance_reminder',
                vehicle: vehicleName,
                maintenanceType,
                dueDate
            },
            actions: [
                {
                    action: 'view',
                    title: 'Ver Detalhes'
                },
                {
                    action: 'dismiss',
                    title: 'Dispensar'
                }
            ]
        };

        return this.sendPushToMultiple(subscriptions, payload);
    }

    // Manutenção vencida
    async sendOverdueMaintenancePush(
        subscriptions: PushSubscription[],
        vehicleName: string,
        maintenanceType: string,
        daysPastDue: number
    ): Promise<{ success: number; failed: number }> {
        const payload: PushNotificationPayload = {
            title: `⚠️ Manutenção Atrasada!`,
            body: `${vehicleName} - ${maintenanceType} está ${daysPastDue} dias atrasada`,
            icon: '/pwa-192x192.png',
            badge: '/pwa-72x72.png',
            url: '/maintenance',
            data: {
                type: 'overdue_maintenance',
                vehicle: vehicleName,
                maintenanceType,
                daysPastDue
            },
            actions: [
                {
                    action: 'schedule',
                    title: 'Agendar Agora'
                },
                {
                    action: 'view',
                    title: 'Ver Detalhes'
                }
            ]
        };

        return this.sendPushToMultiple(subscriptions, payload);
    }

    // Alerta de quilometragem
    async sendMileageAlertPush(
        subscriptions: PushSubscription[],
        vehicleName: string,
        currentMileage: number
    ): Promise<{ success: number; failed: number }> {
        const payload: PushNotificationPayload = {
            title: `📍 Marco de Quilometragem`,
            body: `${vehicleName} atingiu ${currentMileage.toLocaleString()} km`,
            icon: '/pwa-192x192.png',
            badge: '/pwa-72x72.png',
            url: '/vehicles',
            data: {
                type: 'mileage_alert',
                vehicle: vehicleName,
                currentMileage
            },
            actions: [
                {
                    action: 'view',
                    title: 'Ver Recomendações'
                }
            ]
        };

        return this.sendPushToMultiple(subscriptions, payload);
    }

    // Boas-vindas
    async sendWelcomePush(
        subscription: PushSubscription,
        userName: string
    ): Promise<boolean> {
        const payload: PushNotificationPayload = {
            title: `🎉 Bem-vindo, ${userName}!`,
            body: 'Sua gestão de veículos acaba de ficar mais inteligente',
            icon: '/pwa-192x192.png',
            badge: '/pwa-72x72.png',
            url: '/dashboard',
            data: {
                type: 'welcome',
                userName
            },
            actions: [
                {
                    action: 'start',
                    title: 'Começar'
                }
            ]
        };

        return this.sendPushNotification(subscription, payload);
    }

    // Resumo semanal
    async sendWeeklySummaryPush(
        subscriptions: PushSubscription[],
        summary: {
            pendingMaintenances: number;
            upcomingReminders: number;
        }
    ): Promise<{ success: number; failed: number }> {
        const payload: PushNotificationPayload = {
            title: `📊 Resumo Semanal`,
            body: `${summary.pendingMaintenances} manutenções pendentes, ${summary.upcomingReminders} lembretes próximos`,
            icon: '/pwa-192x192.png',
            badge: '/pwa-72x72.png',
            url: '/dashboard',
            data: {
                type: 'weekly_summary',
                ...summary
            },
            actions: [
                {
                    action: 'view_dashboard',
                    title: 'Ver Dashboard'
                }
            ]
        };

        return this.sendPushToMultiple(subscriptions, payload);
    }

    // ================ UTILITÁRIOS ================

    // Validar inscrição
    isValidSubscription(subscription: any): subscription is PushSubscription {
        return (
            subscription &&
            typeof subscription.endpoint === 'string' &&
            subscription.keys &&
            typeof subscription.keys.p256dh === 'string' &&
            typeof subscription.keys.auth === 'string'
        );
    }

    // Testar inscrição
    async testSubscription(subscription: PushSubscription): Promise<boolean> {
        const testPayload: PushNotificationPayload = {
            title: '🧪 Teste de Notificação',
            body: 'Se você recebeu esta notificação, tudo está funcionando!',
            data: { type: 'test' }
        };

        return this.sendPushNotification(subscription, testPayload);
    }
}

// Singleton
let pushServiceInstance: PushService | null = null;

export function getPushService(): PushService {
    if (!pushServiceInstance) {
        pushServiceInstance = new PushService();
    }
    return pushServiceInstance;
} 
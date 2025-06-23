import { PrismaClient } from '@prisma/client';
import webpush from 'web-push';

const prisma = new PrismaClient();

// Configurar VAPID keys apenas se as chaves estiverem definidas
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:automanutencao@example.com';

if (vapidPublicKey && vapidPrivateKey) {
    try {
        webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
        console.log('✅ VAPID keys configuradas com sucesso');
    } catch (error) {
        console.warn('⚠️ Erro ao configurar VAPID keys:', error.message);
        console.warn('💡 Push notifications não funcionarão sem chaves VAPID válidas');
    }
} else {
    console.warn('⚠️ VAPID keys não encontradas nas variáveis de ambiente');
    console.warn('💡 Para habilitar push notifications, configure VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY');
    console.warn('💡 Você pode gerar chaves VAPID usando: npx web-push generate-vapid-keys');
}

export interface CreateNotificationData {
    userId: string;
    type: 'MAINTENANCE_DUE' | 'REMINDER_DUE' | 'MILEAGE_ALERT' | 'EXPENSE_LIMIT' | 'SYSTEM_UPDATE';
    title: string;
    message: string;
    channel: 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP';
    data?: any;
    scheduledFor?: Date;
}

export class NotificationService {
    // Criar notificação
    async createNotification(notificationData: CreateNotificationData) {
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId: notificationData.userId,
                    type: notificationData.type,
                    title: notificationData.title,
                    message: notificationData.message,
                    channel: notificationData.channel,
                    data: notificationData.data,
                    scheduledFor: notificationData.scheduledFor
                }
            });

            // Enviar imediatamente se não for agendada
            if (!notificationData.scheduledFor) {
                await this.sendNotification(notification.id);
            }

            return notification;
        } catch (error) {
            console.error('Erro ao criar notificação:', error);
            throw error;
        }
    }

    // Enviar notificação
    async sendNotification(notificationId: string) {
        try {
            const notification = await prisma.notification.findUnique({
                where: { id: notificationId },
                include: {
                    user: {
                        include: {
                            settings: true
                        }
                    }
                }
            });

            if (!notification || notification.sent) {
                return;
            }

            const userSettings = notification.user.settings;

            // Verificar se o usuário tem essa notificação habilitada
            const canSend = this.checkNotificationPermissions(notification.channel, userSettings);
            if (!canSend) {
                return;
            }

            let success = false;

            switch (notification.channel) {
                case 'PUSH':
                    success = await this.sendPushNotification(notification);
                    break;
                case 'EMAIL':
                    success = await this.sendEmailNotification(notification);
                    break;
                case 'SMS':
                    success = await this.sendSMSNotification(notification);
                    break;
                case 'IN_APP':
                    success = true; // Notificações in-app são sempre "enviadas"
                    break;
            }

            // Atualizar status de envio
            await prisma.notification.update({
                where: { id: notificationId },
                data: {
                    sent: success,
                    sentAt: success ? new Date() : null
                }
            });

        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            throw error;
        }
    }

    // Enviar notificação push
    private async sendPushNotification(notification: any): Promise<boolean> {
        try {
            // Verificar se as chaves VAPID estão configuradas
            if (!vapidPublicKey || !vapidPrivateKey) {
                console.warn('Push notification ignorado: VAPID keys não configuradas');
                return false;
            }

            // Buscar subscriptions do usuário (você precisará implementar isso)
            const subscriptions = await this.getUserPushSubscriptions(notification.userId);

            if (subscriptions.length === 0) {
                console.log('Usuário não possui subscriptions ativas para push notifications');
                return false;
            }

            const payload = JSON.stringify({
                title: notification.title,
                body: notification.message,
                icon: '/icon-192x192.png',
                badge: '/badge-72x72.png',
                data: {
                    notificationId: notification.id,
                    type: notification.type,
                    ...notification.data
                },
                actions: [
                    {
                        action: 'view',
                        title: 'Visualizar'
                    },
                    {
                        action: 'dismiss',
                        title: 'Dispensar'
                    }
                ]
            });

            const promises = subscriptions.map(subscription =>
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Erro ao enviar push:', error);
                        // Remover subscription inválida
                        this.removeInvalidSubscription(subscription);
                    })
            );

            await Promise.allSettled(promises);
            return true;
        } catch (error) {
            console.error('Erro no push notification:', error);
            return false;
        }
    }

    // Enviar notificação por email (implementação básica)
    private async sendEmailNotification(notification: any): Promise<boolean> {
        try {
            // Aqui você implementaria o envio por email
            // Usando nodemailer, sendgrid, etc.
            console.log(`Email enviado para ${notification.user.email}: ${notification.title}`);
            return true;
        } catch (error) {
            console.error('Erro no email notification:', error);
            return false;
        }
    }

    // Enviar notificação por SMS (implementação básica)
    private async sendSMSNotification(notification: any): Promise<boolean> {
        try {
            // Aqui você implementaria o envio por SMS
            // Usando Twilio, AWS SNS, etc.
            console.log(`SMS enviado para ${notification.user.phone}: ${notification.title}`);
            return true;
        } catch (error) {
            console.error('Erro no SMS notification:', error);
            return false;
        }
    }

    // Verificar permissões de notificação
    private checkNotificationPermissions(channel: string, settings: any): boolean {
        if (!settings) return true; // Default allow

        switch (channel) {
            case 'PUSH':
                return settings.enablePushNotifications;
            case 'EMAIL':
                return settings.enableEmailNotifications;
            case 'SMS':
                return settings.enableSMSNotifications;
            default:
                return true;
        }
    }

    // Buscar notificações do usuário
    async getUserNotifications(userId: string, options: {
        page?: number;
        limit?: number;
        unreadOnly?: boolean;
    } = {}) {
        const { page = 1, limit = 20, unreadOnly = false } = options;

        const where: any = { userId };
        if (unreadOnly) {
            where.read = false;
        }

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        });

        const total = await prisma.notification.count({ where });

        return {
            notifications,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    // Marcar notificação como lida
    async markAsRead(notificationId: string, userId: string) {
        return await prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId
            },
            data: {
                read: true
            }
        });
    }

    // Marcar todas as notificações como lidas
    async markAllAsRead(userId: string) {
        return await prisma.notification.updateMany({
            where: {
                userId,
                read: false
            },
            data: {
                read: true
            }
        });
    }

    // Deletar notificação
    async deleteNotification(notificationId: string, userId: string) {
        return await prisma.notification.deleteMany({
            where: {
                id: notificationId,
                userId
            }
        });
    }

    // Salvar subscription de push
    async savePushSubscription(userId: string, subscription: any) {
        // Implementar salvamento das subscriptions de push
        // Você pode criar uma tabela separada para isso
        console.log('Subscription salva:', { userId, subscription });
    }

    // Buscar subscriptions do usuário
    private async getUserPushSubscriptions(userId: string): Promise<any[]> {
        // Implementar busca das subscriptions
        // Retorna array vazio por enquanto
        return [];
    }

    // Remover subscription inválida
    private async removeInvalidSubscription(subscription: any) {
        // Implementar remoção de subscription inválida
        console.log('Removendo subscription inválida:', subscription);
    }

    // Contar notificações não lidas
    async getUnreadCount(userId: string): Promise<number> {
        return await prisma.notification.count({
            where: {
                userId,
                read: false
            }
        });
    }

    // Processar notificações agendadas
    async processScheduledNotifications() {
        const now = new Date();

        const scheduledNotifications = await prisma.notification.findMany({
            where: {
                sent: false,
                scheduledFor: {
                    lte: now
                }
            }
        });

        for (const notification of scheduledNotifications) {
            await this.sendNotification(notification.id);
        }
    }
} 
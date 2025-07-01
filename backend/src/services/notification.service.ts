import { PrismaClient, NotificationChannel, User } from '@prisma/client';
import { getEmailService } from './email.service';

const prisma = new PrismaClient();
const emailService = getEmailService();

export interface NotificationData {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    channel?: NotificationChannel;
    category?: string;
}

export interface NotificationSettings {
    id: string;
    userId: string;
    channels: {
        inApp: boolean;
        email: boolean;
    };
    categories: {
        [key: string]: {
            inApp: boolean;
            email: boolean;
        };
    };
    advancedSettings: {
        maintenanceReminderDays: number;
        mileageAlertThreshold: number;
        monthlyExpenseLimit: number | null;
    };
}

const DEFAULT_SETTINGS: Omit<NotificationSettings, 'id' | 'userId'> = {
    channels: {
        inApp: true,
        email: true
    },
    categories: {
        maintenance: { inApp: true, email: true },
        expenses: { inApp: true, email: true },
        reminders: { inApp: true, email: true },
        system: { inApp: true, email: false }
    },
    advancedSettings: {
        maintenanceReminderDays: 7,
        mileageAlertThreshold: 1000,
        monthlyExpenseLimit: null
    }
};

export class NotificationService {
    async createNotification(data: NotificationData) {
        try {
            // Verificar configurações do usuário
            const settings = await this.getNotificationSettings(data.userId);
            const category = data.category || 'system';

            // Verificar se o usuário deve receber esta notificação
            if (!this.shouldSendNotification(settings, data.channel || 'IN_APP', category)) {
                console.log(`🔕 Notificação ignorada para usuário ${data.userId} (canal: ${data.channel}, categoria: ${category})`);
                return null;
            }

            const notification = await prisma.notification.create({
                data: {
                    userId: data.userId,
                    type: data.type as any,
                    title: data.title,
                    message: data.message,
                    data: data.data || {},
                    read: false,
                    channel: data.channel || 'IN_APP',
                    category
                }
            });

            // Se o canal for EMAIL e o usuário aceitou emails para esta categoria
            if (data.channel === 'EMAIL' && settings.channels.email && settings.categories[category]?.email) {
                const user = await this.getUserById(data.userId);
                if (user?.email) {
                    await emailService.sendEmail(
                        user.email,
                        data.title,
                        data.message
                    );
                }
            }

            // Emitir evento de nova notificação
            this.emitNotificationEvent(notification);

            return notification;
        } catch (error) {
            console.error('❌ Erro ao criar notificação:', error);
            throw error;
        }
    }

    async getUserNotifications(userId: string, options: {
        page?: number;
        limit?: number;
        unreadOnly?: boolean;
        category?: string;
        channel?: NotificationChannel;
    } = {}) {
        const { page = 1, limit = 20, unreadOnly = false, category, channel } = options;

        try {
            const where = {
                userId,
                ...(unreadOnly ? { read: false } : {}),
                ...(category ? { category } : {}),
                ...(channel ? { channel } : {})
            };

            const [notifications, total, unreadCount] = await Promise.all([
                prisma.notification.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip: (page - 1) * limit,
                    take: limit
                }),
                prisma.notification.count({ where }),
                prisma.notification.count({
                    where: { userId, read: false }
                })
            ]);

            return {
                notifications,
                total,
                unreadCount,
                page,
                limit
            };
        } catch (error) {
            console.error('❌ Erro ao buscar notificações:', error);
            throw error;
        }
    }

    async markAsRead(notificationId: string, userId: string) {
        try {
            await prisma.notification.updateMany({
                where: { id: notificationId, userId },
                data: { read: true }
            });
        } catch (error) {
            console.error('❌ Erro ao marcar notificação como lida:', error);
            throw error;
        }
    }

    async markAllAsRead(userId: string) {
        try {
            await prisma.notification.updateMany({
                where: { userId, read: false },
                data: { read: true }
            });
        } catch (error) {
            console.error('❌ Erro ao marcar todas notificações como lidas:', error);
            throw error;
        }
    }

    async deleteNotification(notificationId: string, userId: string) {
        try {
            await prisma.notification.deleteMany({
                where: { id: notificationId, userId }
            });
        } catch (error) {
            console.error('❌ Erro ao deletar notificação:', error);
            throw error;
        }
    }

    async getUnreadCount(userId: string): Promise<number> {
        try {
            return await prisma.notification.count({
                where: { userId, read: false }
            });
        } catch (error) {
            console.error('❌ Erro ao contar notificações não lidas:', error);
            throw error;
        }
    }

    async getNotificationSettings(userId: string): Promise<NotificationSettings> {
        try {
            let settings = await prisma.userSettings.findUnique({
                where: { userId }
            });

            if (!settings) {
                settings = await prisma.userSettings.create({
                    data: {
                        userId,
                        channels: { inApp: true, email: true },
                        categories: {
                            maintenance: { inApp: true, email: true },
                            expenses: { inApp: true, email: true },
                            reminders: { inApp: true, email: true },
                            system: { inApp: true, email: false }
                        }
                    }
                });
            }

            return settings as any;
        } catch (error) {
            console.error('❌ Erro ao buscar configurações de notificação:', error);
            throw error;
        }
    }

    async updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
        try {
            const currentSettings = await this.getNotificationSettings(userId);

            const updatedSettings = await prisma.userSettings.update({
                where: { userId },
                data: {
                    channels: settings.channels || currentSettings.channels,
                    categories: settings.categories || currentSettings.categories,
                    advancedSettings: settings.advancedSettings || currentSettings.advancedSettings
                }
            });

            return updatedSettings as any;
        } catch (error) {
            console.error('❌ Erro ao atualizar configurações de notificação:', error);
            throw error;
        }
    }

    async getUserById(userId: string): Promise<User | null> {
        try {
            return await prisma.user.findUnique({
                where: { id: userId }
            });
        } catch (error) {
            console.error('❌ Erro ao buscar usuário:', error);
            throw error;
        }
    }

    private shouldSendNotification(settings: NotificationSettings, channel: NotificationChannel, category: string): boolean {
        // Verificar se o canal está habilitado
        if (!settings.channels[channel.toLowerCase() as keyof typeof settings.channels]) {
            return false;
        }

        // Verificar se a categoria está habilitada para este canal
        if (!settings.categories[category]?.[channel.toLowerCase() as keyof typeof settings.channels]) {
            return false;
        }

        return true;
    }

    private emitNotificationEvent(notification: any) {
        // Aqui você pode implementar lógica adicional para eventos
        console.log('🔔 Nova notificação criada:', notification);
    }
} 
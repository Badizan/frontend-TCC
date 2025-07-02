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

    async createWelcomeNotifications(userId: string) {
        try {
            const welcomeNotifications = [
                {
                    userId,
                    type: 'SYSTEM_UPDATE',
                    title: 'Bem-vindo ao AutoManutenção!',
                    message: 'Sistema pronto para uso. Cadastre seus veículos e comece a gerenciar suas manutenções.',
                    category: 'system',
                    channel: 'IN_APP' as NotificationChannel
                },
                {
                    userId,
                    type: 'MAINTENANCE_DUE',
                    title: 'Dica de Manutenção',
                    message: 'Lembre-se: manutenções preventivas evitam problemas maiores e economizam dinheiro.',
                    category: 'maintenance',
                    channel: 'IN_APP' as NotificationChannel
                },
                {
                    userId,
                    type: 'EXPENSE_LIMIT',
                    title: 'Controle Financeiro',
                    message: 'Registre todas suas despesas para ter controle total dos gastos com veículos.',
                    category: 'expenses',
                    channel: 'IN_APP' as NotificationChannel
                }
            ];

            for (const notificationData of welcomeNotifications) {
                await this.createNotification(notificationData);
            }

            console.log('✅ Notificações de boas-vindas criadas para usuário:', userId);
        } catch (error) {
            console.error('❌ Erro ao criar notificações de boas-vindas:', error);
        }
    }

    // Verificar e criar notificações imediatas para lembretes próximos
    async checkImmediateReminders(userId: string) {
        try {
            const now = new Date();
            const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            // Buscar lembretes próximos do usuário
            const upcomingReminders = await prisma.reminder.findMany({
                where: {
                    vehicle: { ownerId: userId },
                    completed: false,
                    OR: [
                        {
                            type: { in: ['TIME_BASED', 'HYBRID'] },
                            dueDate: {
                                gte: now,
                                lte: next7Days
                            }
                        }
                    ]
                },
                include: {
                    vehicle: true
                }
            });

            for (const reminder of upcomingReminders) {
                if (reminder.dueDate) {
                    const daysUntilDue = Math.ceil((reminder.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                    // Verificar se já não enviamos uma notificação recentemente
                    const existingNotification = await prisma.notification.findFirst({
                        where: {
                            userId,
                            type: 'REMINDER_DUE',
                            data: {
                                path: ['reminderId'],
                                equals: reminder.id
                            },
                            createdAt: {
                                gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Últimas 24h
                            }
                        }
                    });

                    if (!existingNotification) {
                        let urgencyLevel = 'info';
                        let title = 'Lembrete Próximo';

                        if (daysUntilDue <= 1) {
                            urgencyLevel = 'urgent';
                            title = 'Lembrete URGENTE - Hoje!';
                        } else if (daysUntilDue <= 3) {
                            urgencyLevel = 'high';
                            title = 'Lembrete Importante';
                        }

                        await this.createNotification({
                            userId,
                            type: 'REMINDER_DUE',
                            title,
                            message: `${reminder.description} para ${reminder.vehicle.brand} ${reminder.vehicle.model} - ${daysUntilDue === 0 ? 'HOJE' : daysUntilDue === 1 ? 'amanhã' : `em ${daysUntilDue} dias`}`,
                            data: {
                                reminderId: reminder.id,
                                vehicleId: reminder.vehicleId,
                                daysUntilDue,
                                urgencyLevel
                            },
                            category: 'reminders',
                            channel: 'IN_APP'
                        });

                        // Enviar por email se for muito urgente (1 dia ou menos)
                        if (daysUntilDue <= 1) {
                            await this.createNotification({
                                userId,
                                type: 'REMINDER_DUE',
                                title: `URGENTE: ${title}`,
                                message: `${reminder.description} para ${reminder.vehicle.brand} ${reminder.vehicle.model} deve ser realizado ${daysUntilDue === 0 ? 'HOJE' : 'amanhã'}!`,
                                data: {
                                    reminderId: reminder.id,
                                    vehicleId: reminder.vehicleId,
                                    daysUntilDue,
                                    urgencyLevel
                                },
                                category: 'reminders',
                                channel: 'EMAIL'
                            });
                        }
                    }
                }
            }

            // Verificar manutenções próximas
            const upcomingMaintenances = await prisma.maintenance.findMany({
                where: {
                    vehicle: { ownerId: userId },
                    status: 'SCHEDULED',
                    scheduledDate: {
                        gte: now,
                        lte: next7Days
                    }
                },
                include: {
                    vehicle: true
                }
            });

            for (const maintenance of upcomingMaintenances) {
                const daysUntilMaintenance = Math.ceil((maintenance.scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                // Verificar se já não enviamos uma notificação recentemente
                const existingNotification = await prisma.notification.findFirst({
                    where: {
                        userId,
                        type: 'MAINTENANCE_DUE',
                        data: {
                            path: ['maintenanceId'],
                            equals: maintenance.id
                        },
                        createdAt: {
                            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Últimas 24h
                        }
                    }
                });

                if (!existingNotification) {
                    let title = 'Manutenção Próxima';

                    if (daysUntilMaintenance <= 1) {
                        title = 'Manutenção URGENTE - Hoje!';
                    } else if (daysUntilMaintenance <= 3) {
                        title = 'Manutenção Importante';
                    }

                    await this.createNotification({
                        userId,
                        type: 'MAINTENANCE_DUE',
                        title,
                        message: `${maintenance.description} para ${maintenance.vehicle.brand} ${maintenance.vehicle.model} - ${daysUntilMaintenance === 0 ? 'HOJE' : daysUntilMaintenance === 1 ? 'amanhã' : `em ${daysUntilMaintenance} dias`}`,
                        data: {
                            maintenanceId: maintenance.id,
                            vehicleId: maintenance.vehicleId,
                            daysUntilMaintenance
                        },
                        category: 'maintenance',
                        channel: 'IN_APP'
                    });
                }
            }

        } catch (error) {
            console.error('❌ Erro ao verificar lembretes imediatos:', error);
        }
    }
} 
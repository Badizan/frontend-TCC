import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notification.service';
import { PredictionService } from './prediction.service';

const prisma = new PrismaClient();
const notificationService = new NotificationService();
const predictionService = new PredictionService();

export class CronService {
    static initialize() {
        // Executa a cada 15 minutos para verificar lembretes e notificações urgentes
        cron.schedule('*/15 * * * *', async () => {
            console.log('🔔 Executando verificação urgente de lembretes e notificações...');
            await this.checkReminders();
            await this.checkMaintenanceDue();
        });

        // Executa a cada hora para verificações completas
        cron.schedule('0 * * * *', async () => {
            console.log('🕐 Executando verificação completa de lembretes e alertas...');
            await this.checkMileageAlerts();
            await this.checkAllUserReminders();
        });

        // Executa diariamente às 8h para gerar previsões
        cron.schedule('0 8 * * *', async () => {
            console.log('Gerando previsões e relatórios automáticos...');
            await this.generateDailyPredictions();
            await this.checkExpenseLimits();
        });

        // Executa semanalmente aos domingos às 10h para limpeza e relatórios
        cron.schedule('0 10 * * 0', async () => {
            console.log('Executando limpeza semanal e relatórios...');
            await this.cleanOldNotifications();
            await this.generateWeeklyReports();
        });

        console.log('🚀 CronService inicializado com sucesso');
    }

    // Verificar lembretes imediatos para todos os usuários
    static async checkAllUserReminders() {
        try {
            console.log('👥 Verificando lembretes para todos os usuários...');

            // Buscar todos os usuários ativos
            const users = await prisma.user.findMany({
                select: { id: true, email: true }
            });

            const { NotificationService } = await import('./notification.service');

            for (const user of users) {
                try {
                    const notificationService = new NotificationService();
                    await notificationService.checkImmediateReminders(user.id);
                } catch (userError) {
                    console.error(`❌ Erro ao verificar lembretes para usuário ${user.email}:`, userError);
                }
            }

            console.log(`✅ Verificação de lembretes concluída para ${users.length} usuários`);
        } catch (error) {
            console.error('❌ Erro na verificação geral de lembretes:', error);
        }
    }

    // Verificar lembretes baseados em tempo e quilometragem
    static async checkReminders() {
        try {
            const now = new Date();

            // Lembretes baseados em tempo
            const timeBasedReminders = await prisma.reminder.findMany({
                where: {
                    completed: false,
                    type: { in: ['TIME_BASED', 'HYBRID'] },
                    dueDate: {
                        lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Próximas 24h
                    }
                },
                include: {
                    vehicle: {
                        include: {
                            owner: true
                        }
                    }
                }
            });

            for (const reminder of timeBasedReminders) {
                await notificationService.createNotification({
                    userId: reminder.vehicle.ownerId,
                    type: 'REMINDER_DUE',
                    title: 'Lembrete de Manutenção',
                    message: `${reminder.description} para ${reminder.vehicle.brand} ${reminder.vehicle.model}`,
                    channel: 'IN_APP',
                    data: {
                        reminderId: reminder.id,
                        vehicleId: reminder.vehicleId
                    }
                });

                // Enviar também por email se estiver próximo
                if (reminder.dueDate && new Date(reminder.dueDate).getTime() - now.getTime() <= 24 * 60 * 60 * 1000) {
                    await notificationService.createNotification({
                        userId: reminder.vehicle.ownerId,
                        type: 'REMINDER_DUE',
                        title: 'Lembrete de Manutenção',
                        message: `${reminder.description} para ${reminder.vehicle.brand} ${reminder.vehicle.model}`,
                        channel: 'EMAIL',
                        data: {
                            reminderId: reminder.id,
                            vehicleId: reminder.vehicleId
                        }
                    });
                }

                // Atualizar último notificado
                await prisma.reminder.update({
                    where: { id: reminder.id },
                    data: { lastNotified: now }
                });
            }

            // Lembretes baseados em quilometragem
            const mileageBasedReminders = await prisma.reminder.findMany({
                where: {
                    completed: false,
                    type: { in: ['MILEAGE_BASED', 'HYBRID'] },
                    dueMileage: { not: null }
                },
                include: {
                    vehicle: {
                        include: {
                            owner: true
                        }
                    }
                }
            });

            for (const reminder of mileageBasedReminders) {
                if (reminder.vehicle.mileage && reminder.dueMileage) {
                    const remainingMileage = reminder.dueMileage - reminder.vehicle.mileage;

                    // Notificar quando restam 1000km ou menos
                    if (remainingMileage <= 1000 && remainingMileage > 0) {
                        await notificationService.createNotification({
                            userId: reminder.vehicle.ownerId,
                            type: 'MILEAGE_ALERT',
                            title: 'Alerta de Quilometragem',
                            message: `Faltam ${remainingMileage}km para: ${reminder.description}`,
                            channel: 'IN_APP',
                            data: {
                                reminderId: reminder.id,
                                vehicleId: reminder.vehicleId,
                                remainingMileage
                            }
                        });

                        // Enviar por email se estiver muito próximo (menos de 100km)
                        if (remainingMileage <= 100) {
                            await notificationService.createNotification({
                                userId: reminder.vehicle.ownerId,
                                type: 'MILEAGE_ALERT',
                                title: 'Alerta de Quilometragem',
                                message: `URGENTE: Faltam apenas ${remainingMileage}km para: ${reminder.description}`,
                                channel: 'EMAIL',
                                data: {
                                    reminderId: reminder.id,
                                    vehicleId: reminder.vehicleId,
                                    remainingMileage
                                }
                            });
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Erro ao verificar lembretes:', error);
        }
    }

    // Verificar manutenções em atraso
    static async checkMaintenanceDue() {
        try {
            const now = new Date();
            const maintenancesDue = await prisma.maintenance.findMany({
                where: {
                    status: 'SCHEDULED',
                    scheduledDate: {
                        lt: now
                    }
                },
                include: {
                    vehicle: {
                        include: {
                            owner: true
                        }
                    },
                    mechanic: true
                }
            });

            for (const maintenance of maintenancesDue) {
                await notificationService.createNotification({
                    userId: maintenance.vehicle.ownerId,
                    type: 'MAINTENANCE_DUE',
                    title: 'Manutenção em Atraso',
                    message: `A manutenção ${maintenance.description} está em atraso`,
                    channel: 'IN_APP',
                    data: {
                        maintenanceId: maintenance.id,
                        vehicleId: maintenance.vehicleId
                    }
                });

                // Enviar por email também
                await notificationService.createNotification({
                    userId: maintenance.vehicle.ownerId,
                    type: 'MAINTENANCE_DUE',
                    title: 'Manutenção em Atraso',
                    message: `A manutenção ${maintenance.description} está em atraso. Por favor, agende o mais rápido possível.`,
                    channel: 'EMAIL',
                    data: {
                        maintenanceId: maintenance.id,
                        vehicleId: maintenance.vehicleId
                    }
                });

                // Notificar também o mecânico (se existir)
                if (maintenance.mechanicId) {
                    await notificationService.createNotification({
                        userId: maintenance.mechanicId,
                        type: 'MAINTENANCE_DUE',
                        title: 'Manutenção Agendada',
                        message: `Manutenção agendada: ${maintenance.description}`,
                        channel: 'IN_APP',
                        data: {
                            maintenanceId: maintenance.id,
                            vehicleId: maintenance.vehicleId
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Erro ao verificar manutenções:', error);
        }
    }

    // Verificar alertas de quilometragem
    static async checkMileageAlerts() {
        try {
            const vehicles = await prisma.vehicle.findMany({
                include: {
                    owner: {
                        include: {
                            settings: true
                        }
                    },
                    mileageRecords: {
                        orderBy: { date: 'desc' },
                        take: 2
                    }
                }
            });

            for (const vehicle of vehicles) {
                if (vehicle.mileageRecords.length >= 2) {
                    const latest = vehicle.mileageRecords[0];
                    const previous = vehicle.mileageRecords[1];

                    const daysDiff = Math.abs(
                        (latest.date.getTime() - previous.date.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const mileageDiff = latest.mileage - previous.mileage;
                    const dailyAverage = mileageDiff / daysDiff;

                    // Alerta se a quilometragem diária estiver muito alta (>200km/dia)
                    if (dailyAverage > 200) {
                        await notificationService.createNotification({
                            userId: vehicle.ownerId,
                            type: 'MILEAGE_ALERT',
                            title: 'Alto Uso do Veículo',
                            message: `Uso intenso detectado: ${Math.round(dailyAverage)}km/dia`,
                            channel: 'IN_APP',
                            data: {
                                vehicleId: vehicle.id,
                                dailyAverage: Math.round(dailyAverage)
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao verificar alertas de quilometragem:', error);
        }
    }

    // Verificar limites de gastos
    static async checkExpenseLimits() {
        try {
            const users = await prisma.user.findMany({
                include: {
                    settings: true,
                    vehicles: {
                        include: {
                            expenses: {
                                where: {
                                    date: {
                                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                                    }
                                }
                            }
                        }
                    }
                }
            });

            for (const user of users) {
                // Verificar limite configurado em advancedSettings
                const advancedSettings = user.settings?.advancedSettings as any;
                const monthlyExpenseLimit = advancedSettings?.monthlyExpenseLimit;

                if (monthlyExpenseLimit) {
                    const monthlyExpenses = user.vehicles.reduce((total, vehicle) => {
                        return total + vehicle.expenses.reduce((sum, expense) => sum + expense.amount, 0);
                    }, 0);

                    if (monthlyExpenses > monthlyExpenseLimit) {
                        await notificationService.createNotification({
                            userId: user.id,
                            type: 'EXPENSE_LIMIT',
                            title: 'Limite de Gastos Excedido',
                            message: `Gastos mensais: R$ ${monthlyExpenses.toFixed(2)}`,
                            channel: 'IN_APP',
                            data: {
                                monthlyExpenses,
                                limit: monthlyExpenseLimit
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao verificar limites de gastos:', error);
        }
    }

    // Gerar previsões diárias
    static async generateDailyPredictions() {
        try {
            const vehicles = await prisma.vehicle.findMany({
                include: {
                    expenses: {
                        orderBy: { date: 'desc' },
                        take: 30
                    },
                    maintenances: {
                        orderBy: { scheduledDate: 'desc' },
                        take: 10
                    }
                }
            });

            for (const vehicle of vehicles) {
                // Gerar previsão de gastos
                const expensePrediction = await predictionService.predictMonthlyExpenses(vehicle);

                // Gerar previsão de manutenção
                const maintenancePrediction = await predictionService.predictNextMaintenance(vehicle);

                // Salvar previsões
                if (expensePrediction) {
                    await prisma.prediction.create({
                        data: {
                            vehicleId: vehicle.id,
                            type: 'expense',
                            prediction: JSON.parse(JSON.stringify(expensePrediction)),
                            confidence: 0.8
                        }
                    });
                }

                if (maintenancePrediction) {
                    await prisma.prediction.create({
                        data: {
                            vehicleId: vehicle.id,
                            type: 'maintenance',
                            prediction: JSON.parse(JSON.stringify(maintenancePrediction)),
                            confidence: 0.7
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Erro ao gerar previsões:', error);
        }
    }

    // Gerar relatórios semanais
    static async generateWeeklyReports() {
        try {
            const users = await prisma.user.findMany({
                include: {
                    vehicles: {
                        include: {
                            expenses: true,
                            maintenances: true
                        }
                    }
                }
            });

            for (const user of users) {
                const weeklyReport = await predictionService.generateWeeklyReport(user);

                await prisma.report.create({
                    data: {
                        userId: user.id,
                        type: 'weekly_summary',
                        period: 'weekly',
                        data: JSON.parse(JSON.stringify(weeklyReport))
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao gerar relatórios semanais:', error);
        }
    }

    // Limpar notificações antigas
    static async cleanOldNotifications() {
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            await prisma.notification.deleteMany({
                where: {
                    createdAt: {
                        lt: thirtyDaysAgo
                    },
                    read: true
                }
            });

            console.log('Notificações antigas removidas');
        } catch (error) {
            console.error('Erro ao limpar notificações:', error);
        }
    }
} 
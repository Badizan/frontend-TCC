import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class ReminderService {
    async create(data: {
        vehicleId: string
        description: string
        type?: 'TIME_BASED' | 'MILEAGE_BASED' | 'HYBRID'
        dueDate?: Date
        dueMileage?: number
        intervalDays?: number
        intervalMileage?: number
        recurring?: boolean
    }) {
        return await prisma.reminder.create({
            data,
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                }
            }
        })
    }

    async findAll(filters?: {
        vehicleId?: string
        completed?: boolean
    }) {
        const where: any = {}

        if (filters?.vehicleId) where.vehicleId = filters.vehicleId
        if (typeof filters?.completed === 'boolean') where.completed = filters.completed

        return await prisma.reminder.findMany({
            where,
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                }
            },
            orderBy: { dueDate: 'asc' }
        })
    }

    async findById(id: string) {
        return await prisma.reminder.findUnique({
            where: { id },
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                }
            }
        })
    }

    async update(id: string, data: {
        description?: string
        type?: 'TIME_BASED' | 'MILEAGE_BASED' | 'HYBRID'
        dueDate?: Date
        dueMileage?: number
        intervalDays?: number
        intervalMileage?: number
        recurring?: boolean
        completed?: boolean
    }) {
        return await prisma.reminder.update({
            where: { id },
            data,
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                }
            }
        })
    }

    async delete(id: string) {
        return await prisma.reminder.delete({
            where: { id }
        })
    }

    async findByVehicle(vehicleId: string) {
        return await prisma.reminder.findMany({
            where: { vehicleId },
            orderBy: { dueDate: 'asc' }
        })
    }

    async getUpcomingReminders(filters: any = {}, days: number = 30) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const where: any = {
            ...filters,
            completed: false,
            OR: [
                {
                    type: { in: ['TIME_BASED', 'HYBRID'] },
                    dueDate: {
                        gte: new Date(),
                        lte: futureDate
                    }
                },
                {
                    type: { in: ['MILEAGE_BASED', 'HYBRID'] },
                    dueMileage: { gt: 0 }
                }
            ]
        };

        return await prisma.reminder.findMany({
            where,
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true, mileage: true }
                }
            },
            orderBy: { dueDate: 'asc' }
        });
    }

    async markAsCompleted(id: string) {
        const reminder = await prisma.reminder.findUnique({
            where: { id },
            include: { vehicle: true }
        });

        if (!reminder) {
            throw new Error('Lembrete não encontrado');
        }

        // Marcar como completo
        const completedReminder = await prisma.reminder.update({
            where: { id },
            data: { completed: true },
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                }
            }
        });

        // Se for recorrente, criar próximo lembrete
        if (reminder.recurring) {
            await this.createNextRecurringReminder(reminder);
        }

        return completedReminder;
    }

    // Criar lembrete inteligente baseado em padrões
    async createSmartReminder(vehicleId: string, reminderType: string) {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId },
            include: {
                maintenances: {
                    where: { status: 'COMPLETED' },
                    orderBy: { completedDate: 'desc' },
                    take: 5
                }
            }
        });

        if (!vehicle) {
            throw new Error('Veículo não encontrado');
        }

        const smartReminderConfig = this.getSmartReminderConfig(reminderType, vehicle);

        return await this.create({
            vehicleId,
            ...smartReminderConfig
        });
    }



    // Buscar lembretes baseados em quilometragem
    async getMileageBasedReminders(filters: any) {
        return await prisma.reminder.findMany({
            where: {
                ...filters,
                completed: false
            },
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true, mileage: true }
                }
            },
            orderBy: { dueMileage: 'asc' }
        });
    }

    // Atualizar quilometragem do veículo e verificar lembretes
    async updateVehicleMileageAndCheckReminders(vehicleId: string, mileage: number, notes?: string) {
        // Atualizar quilometragem do veículo
        await prisma.vehicle.update({
            where: { id: vehicleId },
            data: { mileage }
        });

        // Criar registro de quilometragem
        await prisma.mileageRecord.create({
            data: {
                vehicleId,
                mileage,
                date: new Date(),
                notes
            }
        });

        // Verificar lembretes baseados em quilometragem
        const mileageReminders = await prisma.reminder.findMany({
            where: {
                vehicleId,
                completed: false,
                type: { in: ['MILEAGE_BASED', 'HYBRID'] },
                dueMileage: {
                    lte: mileage
                }
            }
        });

        const triggeredReminders = [];

        for (const reminder of mileageReminders) {
            // Criar notificação para o lembrete vencido
            await this.createMileageNotification(reminder, mileage);
            triggeredReminders.push(reminder);
        }

        return {
            mileageUpdated: true,
            newMileage: mileage,
            triggeredReminders: triggeredReminders.length,
            reminders: triggeredReminders
        };
    }

    // Métodos auxiliares privados
    private async createNextRecurringReminder(completedReminder: any) {
        const nextReminderData: any = {
            vehicleId: completedReminder.vehicleId,
            description: completedReminder.description,
            type: completedReminder.type,
            recurring: true,
            intervalDays: completedReminder.intervalDays,
            intervalMileage: completedReminder.intervalMileage
        };

        // Calcular próxima data/quilometragem
        if (completedReminder.type === 'TIME_BASED' || completedReminder.type === 'HYBRID') {
            if (completedReminder.intervalDays) {
                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + completedReminder.intervalDays);
                nextReminderData.dueDate = nextDate;
            }
        }

        if (completedReminder.type === 'MILEAGE_BASED' || completedReminder.type === 'HYBRID') {
            if (completedReminder.intervalMileage) {
                const vehicle = await prisma.vehicle.findUnique({
                    where: { id: completedReminder.vehicleId }
                });

                if (vehicle && vehicle.mileage) {
                    nextReminderData.dueMileage = vehicle.mileage + completedReminder.intervalMileage;
                }
            }
        }

        await this.create(nextReminderData);
    }

    private getSmartReminderConfig(reminderType: string, vehicle: any) {
        const currentYear = new Date().getFullYear();
        const vehicleAge = currentYear - vehicle.year;
        const currentMileage = vehicle.mileage || 0;

        switch (reminderType) {
            case 'oil_change':
                return {
                    description: 'Troca de óleo',
                    type: 'HYBRID' as const,
                    dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 meses
                    dueMileage: currentMileage + 5000,
                    recurring: true,
                    intervalDays: 90,
                    intervalMileage: 5000
                };

            case 'tire_rotation':
                return {
                    description: 'Rodízio de pneus',
                    type: 'MILEAGE_BASED' as const,
                    dueMileage: currentMileage + 10000,
                    recurring: true,
                    intervalMileage: 10000
                };

            case 'brake_check':
                const brakeInterval = vehicleAge > 5 ? 15000 : 20000;
                return {
                    description: 'Verificação dos freios',
                    type: 'MILEAGE_BASED' as const,
                    dueMileage: currentMileage + brakeInterval,
                    recurring: true,
                    intervalMileage: brakeInterval
                };

            case 'general_maintenance':
                const maintenanceInterval = vehicleAge > 10 ? 6 : 12; // meses
                return {
                    description: 'Manutenção geral',
                    type: 'TIME_BASED' as const,
                    dueDate: new Date(Date.now() + maintenanceInterval * 30 * 24 * 60 * 60 * 1000),
                    recurring: true,
                    intervalDays: maintenanceInterval * 30
                };

            default:
                throw new Error('Tipo de lembrete inteligente não reconhecido');
        }
    }

    private async createMileageNotification(reminder: any, currentMileage: number) {
        // Aqui você integraria com o NotificationService
        console.log(`Lembrete de quilometragem ativado: ${reminder.description} aos ${currentMileage}km`);

        // Exemplo de integração (descomente quando implementar)
        /*
        const notificationService = new NotificationService();
        await notificationService.createNotification({
            userId: reminder.vehicle.ownerId,
            type: 'MILEAGE_ALERT',
            title: 'Lembrete de Quilometragem',
            message: `${reminder.description} - Quilometragem atingida: ${currentMileage}km`,
            channel: 'PUSH'
        });
        */
    }
} 
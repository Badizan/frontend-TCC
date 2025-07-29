import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notification.service';

const prisma = new PrismaClient();

export class MileageNotificationService {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    /**
     * Verifica se há lembretes baseados em quilometragem que devem ser disparados
     */
    async checkMileageBasedReminders(vehicleId: string, currentMileage: number): Promise<any[]> {
        try {
            console.log(`🔍 MileageNotificationService: Verificando lembretes para veículo ${vehicleId} com ${currentMileage}km`);

            const triggeredReminders: any[] = [];

            // Buscar todos os lembretes baseados em quilometragem para este veículo
            const mileageReminders = await prisma.reminder.findMany({
                where: {
                    vehicleId,
                    type: 'MILEAGE_BASED',
                    completed: false,
                    dueMileage: {
                        not: null
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

            console.log(`📋 MileageNotificationService: ${mileageReminders.length} lembretes baseados em quilometragem encontrados`);

            for (const reminder of mileageReminders) {
                if (reminder.dueMileage && currentMileage >= reminder.dueMileage) {
                    await this.triggerMileageReminder(reminder, currentMileage);
                    triggeredReminders.push(reminder);
                }
            }

            // Verificar lembretes híbridos (tempo + quilometragem)
            const hybridReminders = await prisma.reminder.findMany({
                where: {
                    vehicleId,
                    type: 'HYBRID',
                    completed: false,
                    dueMileage: {
                        not: null
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

            console.log(`📋 MileageNotificationService: ${hybridReminders.length} lembretes híbridos encontrados`);

            for (const reminder of hybridReminders) {
                if (reminder.dueMileage && currentMileage >= reminder.dueMileage) {
                    await this.triggerMileageReminder(reminder, currentMileage);
                    triggeredReminders.push(reminder);
                }
            }

            return triggeredReminders;

        } catch (error) {
            console.error('❌ MileageNotificationService: Erro ao verificar lembretes baseados em quilometragem:', error);
            return [];
        }
    }

    /**
     * Dispara uma notificação para um lembrete baseado em quilometragem
     */
    private async triggerMileageReminder(reminder: any, currentMileage: number): Promise<void> {
        try {
            console.log(`🔔 MileageNotificationService: Disparando notificação para lembrete ${reminder.id}`);

            const vehicle = reminder.vehicle;
            const owner = vehicle.owner;

            // Criar notificação
            await this.notificationService.createNotification({
                userId: owner.id,
                type: 'MILEAGE_ALERT',
                title: 'Manutenção por Quilometragem',
                message: `O veículo ${vehicle.brand} ${vehicle.model} atingiu ${currentMileage.toLocaleString('pt-BR')}km. ${reminder.description}`,
                channel: 'IN_APP',
                category: 'maintenance',
                data: {
                    vehicleId: vehicle.id,
                    reminderId: reminder.id,
                    currentMileage,
                    dueMileage: reminder.dueMileage,
                    description: reminder.description
                }
            });

            // Marcar como notificado
            await prisma.reminder.update({
                where: { id: reminder.id },
                data: { lastNotified: new Date() }
            });

            // Marcar como concluído
            await prisma.reminder.update({
                where: { id: reminder.id },
                data: { completed: true }
            });

            console.log(`✅ MileageNotificationService: Lembrete ${reminder.id} marcado como concluído`);

        } catch (error) {
            console.error('❌ MileageNotificationService: Erro ao disparar notificação:', error);
        }
    }

    /**
     * Cria um novo lembrete baseado em quilometragem
     */
    async createMileageReminder(data: {
        vehicleId: string;
        description: string;
        dueMileage: number;
    }): Promise<any> {
        try {
            console.log(`📝 MileageNotificationService: Criando lembrete baseado em quilometragem para veículo ${data.vehicleId}`);

            const reminder = await prisma.reminder.create({
                data: {
                    vehicleId: data.vehicleId,
                    description: data.description,
                    dueMileage: data.dueMileage,
                    type: 'MILEAGE_BASED',
                    completed: false
                },
                include: {
                    vehicle: {
                        include: {
                            owner: true
                        }
                    }
                }
            });

            console.log(`✅ MileageNotificationService: Lembrete criado com ID ${reminder.id}`);
            return reminder;

        } catch (error) {
            console.error('❌ MileageNotificationService: Erro ao criar lembrete:', error);
            throw error;
        }
    }

    /**
     * Atualiza a quilometragem de um veículo e verifica lembretes
     */
    async updateVehicleMileage(vehicleId: string, newMileage: number): Promise<{ triggeredReminders: any[] }> {
        try {
            console.log(`🔄 MileageNotificationService: Atualizando quilometragem do veículo ${vehicleId} para ${newMileage}km`);

            // Atualizar quilometragem do veículo
            await prisma.vehicle.update({
                where: { id: vehicleId },
                data: { mileage: newMileage }
            });

            // Registrar no histórico de quilometragem
            await prisma.mileageRecord.create({
                data: {
                    vehicleId,
                    mileage: newMileage,
                    date: new Date(),
                    notes: 'Atualização manual de quilometragem'
                }
            });

            // Verificar lembretes baseados em quilometragem e retornar os ativados
            const triggeredReminders = await this.checkMileageBasedReminders(vehicleId, newMileage);

            console.log(`✅ MileageNotificationService: Quilometragem atualizada e ${triggeredReminders.length} lembretes ativados`);

            return { triggeredReminders };

        } catch (error) {
            console.error('❌ MileageNotificationService: Erro ao atualizar quilometragem:', error);
            throw error;
        }
    }

    /**
     * Busca todos os lembretes baseados em quilometragem de um veículo
     */
    async getMileageReminders(vehicleId: string): Promise<any[]> {
        try {
            const reminders = await prisma.reminder.findMany({
                where: {
                    vehicleId,
                    type: {
                        in: ['MILEAGE_BASED', 'HYBRID']
                    }
                },
                orderBy: {
                    dueMileage: 'asc'
                }
            });

            return reminders;
        } catch (error) {
            console.error('❌ MileageNotificationService: Erro ao buscar lembretes:', error);
            throw error;
        }
    }

    /**
     * Calcula a próxima quilometragem para manutenção baseada no padrão do usuário
     */
    calculateNextMaintenanceMileage(currentMileage: number, intervalKm: number): number {
        // Calcular a próxima quilometragem baseada no intervalo
        const nextMileage = Math.ceil(currentMileage / intervalKm) * intervalKm;
        return nextMileage;
    }
} 
import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseController } from './base.controller';
import { MileageNotificationService } from '../services/mileageNotification.service';
import { z } from 'zod';

const mileageNotificationService = new MileageNotificationService();

const createMileageReminderSchema = z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID'),
    description: z.string().min(1, 'Description is required'),
    dueMileage: z.number().min(1, 'Due mileage must be at least 1'),
    intervalMileage: z.number().min(1, 'Interval mileage must be at least 1').optional(),
    recurring: z.boolean().default(false)
});

const updateMileageSchema = z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID'),
    newMileage: z.number().min(0, 'Mileage must be at least 0')
});

export class MileageReminderController extends BaseController {

    /**
     * Criar um novo lembrete baseado em quilometragem
     */
    async createMileageReminder(request: FastifyRequest, reply: FastifyReply) {
        try {
            if (!request.user) {
                console.warn('⚠️ MileageReminderController: Tentativa de criar lembrete sem autenticação');
                return reply.status(401).send({ message: 'User not authenticated' });
            }

            const data = createMileageReminderSchema.parse(request.body);

            console.log('📝 MileageReminderController: Criando lembrete baseado em quilometragem:', {
                vehicleId: data.vehicleId,
                dueMileage: data.dueMileage,
                userEmail: request.user.email
            });

            // Verificar se o veículo pertence ao usuário
            const vehicle = await this.verifyVehicleOwnership(data.vehicleId, request.user.id);
            if (!vehicle) {
                return reply.status(403).send({ message: 'Access denied to this vehicle' });
            }

            const reminder = await mileageNotificationService.createMileageReminder({
                vehicleId: data.vehicleId,
                description: data.description,
                dueMileage: data.dueMileage,
                intervalMileage: data.intervalMileage,
                recurring: data.recurring
            });

            console.log('✅ MileageReminderController: Lembrete criado com sucesso:', reminder.id);
            return this.sendResponse(reply, reminder, 201);

        } catch (error) {
            console.error('❌ MileageReminderController: Erro ao criar lembrete:', error);
            return this.sendError(reply, error as Error);
        }
    }

    /**
     * Atualizar quilometragem de um veículo e verificar lembretes
     */
    async updateVehicleMileage(request: FastifyRequest, reply: FastifyReply) {
        try {
            if (!request.user) {
                console.warn('⚠️ MileageReminderController: Tentativa de atualizar quilometragem sem autenticação');
                return reply.status(401).send({ message: 'User not authenticated' });
            }

            const data = updateMileageSchema.parse(request.body);

            console.log('🔄 MileageReminderController: Atualizando quilometragem:', {
                vehicleId: data.vehicleId,
                newMileage: data.newMileage,
                userEmail: request.user.email
            });

            // Verificar se o veículo pertence ao usuário
            const vehicle = await this.verifyVehicleOwnership(data.vehicleId, request.user.id);
            if (!vehicle) {
                return reply.status(403).send({ message: 'Access denied to this vehicle' });
            }

            await mileageNotificationService.updateVehicleMileage(data.vehicleId, data.newMileage);

            console.log('✅ MileageReminderController: Quilometragem atualizada com sucesso');
            return this.sendResponse(reply, {
                message: 'Mileage updated successfully',
                newMileage: data.newMileage
            });

        } catch (error) {
            console.error('❌ MileageReminderController: Erro ao atualizar quilometragem:', error);
            return this.sendError(reply, error as Error);
        }
    }

    /**
     * Buscar lembretes baseados em quilometragem de um veículo
     */
    async getMileageReminders(request: FastifyRequest, reply: FastifyReply) {
        try {
            if (!request.user) {
                console.warn('⚠️ MileageReminderController: Tentativa de buscar lembretes sem autenticação');
                return reply.status(401).send({ message: 'User not authenticated' });
            }

            const { vehicleId } = request.params as { vehicleId: string };

            console.log('🔍 MileageReminderController: Buscando lembretes para veículo:', {
                vehicleId,
                userEmail: request.user.email
            });

            // Verificar se o veículo pertence ao usuário
            const vehicle = await this.verifyVehicleOwnership(vehicleId, request.user.id);
            if (!vehicle) {
                return reply.status(403).send({ message: 'Access denied to this vehicle' });
            }

            const reminders = await mileageNotificationService.getMileageReminders(vehicleId);

            console.log(`✅ MileageReminderController: ${reminders.length} lembretes encontrados`);
            return this.sendResponse(reply, reminders);

        } catch (error) {
            console.error('❌ MileageReminderController: Erro ao buscar lembretes:', error);
            return this.sendError(reply, error as Error);
        }
    }

    /**
     * Calcular próxima quilometragem para manutenção
     */
    async calculateNextMaintenance(request: FastifyRequest, reply: FastifyReply) {
        try {
            if (!request.user) {
                console.warn('⚠️ MileageReminderController: Tentativa de calcular manutenção sem autenticação');
                return reply.status(401).send({ message: 'User not authenticated' });
            }

            const { vehicleId, intervalKm } = request.query as { vehicleId: string; intervalKm: string };

            console.log('🧮 MileageReminderController: Calculando próxima manutenção:', {
                vehicleId,
                intervalKm,
                userEmail: request.user.email
            });

            // Verificar se o veículo pertence ao usuário
            const vehicle = await this.verifyVehicleOwnership(vehicleId, request.user.id);
            if (!vehicle) {
                return reply.status(403).send({ message: 'Access denied to this vehicle' });
            }

            const currentMileage = vehicle.mileage || 0;
            const interval = parseInt(intervalKm) || 1000; // Padrão de 1000km
            const nextMileage = mileageNotificationService.calculateNextMaintenanceMileage(currentMileage, interval);

            console.log('✅ MileageReminderController: Próxima manutenção calculada:', {
                currentMileage,
                intervalKm: interval,
                nextMileage
            });

            return this.sendResponse(reply, {
                currentMileage,
                intervalKm: interval,
                nextMileage,
                remainingKm: nextMileage - currentMileage
            });

        } catch (error) {
            console.error('❌ MileageReminderController: Erro ao calcular manutenção:', error);
            return this.sendError(reply, error as Error);
        }
    }

    /**
     * Verificar se o veículo pertence ao usuário autenticado
     */
    private async verifyVehicleOwnership(vehicleId: string, userId: string): Promise<any> {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();

        try {
            const vehicle = await prisma.vehicle.findFirst({
                where: {
                    id: vehicleId,
                    ownerId: userId
                }
            });

            return vehicle;
        } catch (error) {
            console.error('❌ MileageReminderController: Erro ao verificar propriedade do veículo:', error);
            return null;
        }
    }
} 
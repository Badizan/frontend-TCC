import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseController } from './base.controller';
import { ReminderService } from '../services/reminder.service';
import { z } from 'zod';

const reminderService = new ReminderService();

const createReminderSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['TIME_BASED', 'MILEAGE_BASED', 'HYBRID']).default('TIME_BASED'),
  dueDate: z.string().transform(str => new Date(str)).optional(),
  dueMileage: z.number().positive().optional(),
  intervalDays: z.number().positive().optional(),
  intervalMileage: z.number().positive().optional(),
  recurring: z.boolean().default(false)
});

const updateReminderSchema = z.object({
  description: z.string().min(1).optional(),
  type: z.enum(['TIME_BASED', 'MILEAGE_BASED', 'HYBRID']).optional(),
  dueDate: z.string().transform(str => new Date(str)).optional(),
  dueMileage: z.number().positive().optional(),
  intervalDays: z.number().positive().optional(),
  intervalMileage: z.number().positive().optional(),
  recurring: z.boolean().optional(),
  completed: z.boolean().optional()
});

export class ReminderController extends BaseController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createReminderSchema.parse(request.body);
      const reminder = await reminderService.create(data);
      return this.sendResponse(reply, reminder, 201);
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { vehicleId, completed } = request.query as {
        vehicleId?: string;
        completed?: string;
      };

      const filters: any = {};
      if (vehicleId) filters.vehicleId = vehicleId;
      if (completed !== undefined) filters.completed = completed === 'true';

      const reminders = await reminderService.findAll(filters);
      return this.sendResponse(reply, reminders);
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const reminder = await reminderService.findById(id);

      if (!reminder) {
        return reply.status(404).send({ message: 'Reminder not found' });
      }

      return this.sendResponse(reply, reminder);
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const data = updateReminderSchema.parse(request.body);

      const reminder = await reminderService.update(id, data);
      return this.sendResponse(reply, reminder);
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      await reminderService.delete(id);
      return this.sendResponse(reply, { message: 'Reminder deleted successfully' });
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  }

  async complete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const reminder = await reminderService.markAsCompleted(id);
      return this.sendResponse(reply, reminder);
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  }

  // Criar lembrete inteligente baseado em padrões
  async createSmartReminder(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { vehicleId, reminderType } = request.body as {
        vehicleId: string;
        reminderType: 'oil_change' | 'tire_rotation' | 'brake_check' | 'general_maintenance';
      };

      const smartReminder = await reminderService.createSmartReminder(vehicleId, reminderType);
      return this.sendResponse(reply, smartReminder, 201);
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  }

  // Buscar lembretes próximos ao vencimento
  async getUpcomingReminders(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { vehicleId, days = 7 } = request.query as {
        vehicleId?: string;
        days?: string;
      };

      const filters: any = {};
      if (vehicleId) filters.vehicleId = vehicleId;

      const upcomingReminders = await reminderService.getUpcomingReminders(
        filters,
        parseInt(days as string)
      );

      return this.sendResponse(reply, upcomingReminders);
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  }

  // Buscar lembretes baseados em quilometragem
  async getMileageBasedReminders(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { vehicleId } = request.query as { vehicleId?: string };

      const filters: any = {
        type: { in: ['MILEAGE_BASED', 'HYBRID'] }
      };

      if (vehicleId) filters.vehicleId = vehicleId;

      const mileageReminders = await reminderService.getMileageBasedReminders(filters);
      return this.sendResponse(reply, mileageReminders);
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  }

  // Atualizar quilometragem do veículo e verificar lembretes
  async updateVehicleMileage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { vehicleId, mileage, notes } = request.body as {
        vehicleId: string;
        mileage: number;
        notes?: string;
      };

      const result = await reminderService.updateVehicleMileageAndCheckReminders(
        vehicleId,
        mileage,
        notes
      );

      return this.sendResponse(reply, result);
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  }

  // Configurar lembretes recorrentes
  async setupRecurringReminder(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createReminderSchema.parse(request.body);

      if (!data.recurring || (!data.intervalDays && !data.intervalMileage)) {
        return reply.status(400).send({
          success: false,
          message: 'Para lembretes recorrentes, defina intervalDays ou intervalMileage'
        });
      }

      const reminder = await reminderService.create(data);
      return this.sendResponse(reply, reminder, 201);
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  }
} 
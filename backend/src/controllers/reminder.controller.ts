import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseController } from './base.controller';
import { ReminderService } from '../services/reminder.service';
import { z } from 'zod';

const reminderService = new ReminderService();

const createReminderSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().transform(str => new Date(str))
});

const updateReminderSchema = z.object({
  description: z.string().min(1).optional(),
  dueDate: z.string().transform(str => new Date(str)).optional(),
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
} 
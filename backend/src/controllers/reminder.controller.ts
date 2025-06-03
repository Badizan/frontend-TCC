import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createReminderSchema, updateReminderSchema } from '../schemas/reminder.schema';
import { BaseController } from './base.controller';

const prisma = new PrismaClient();

export class ReminderController extends BaseController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createReminderSchema.parse(request.body);
      const reminder = await prisma.reminder.create({ data });
      return this.sendResponse(reply, reminder, 201);
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const reminders = await prisma.reminder.findMany();
      return this.sendResponse(reply, reminders);
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const reminder = await prisma.reminder.findUnique({ where: { id } });
      if (!reminder) return reply.status(404).send({ message: 'Reminder not found' });
      return this.sendResponse(reply, reminder);
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const data = updateReminderSchema.parse(request.body);
      const reminder = await prisma.reminder.update({ where: { id }, data });
      return this.sendResponse(reply, reminder);
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      await prisma.reminder.delete({ where: { id } });
      return reply.status(204).send();
    } catch (error) {
      return this.sendError(reply, error as Error);
    }
  }
} 
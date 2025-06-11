import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseController } from './base.controller';
import { ExpenseService } from '../services/expense.service';
import { z } from 'zod';

const expenseService = new ExpenseService();

const createExpenseSchema = z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID'),
    description: z.string().min(1, 'Description is required'),
    category: z.string().min(1, 'Category is required'),
    amount: z.number().positive('Amount must be positive'),
    date: z.string().transform(str => new Date(str))
});

const updateExpenseSchema = z.object({
    description: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    amount: z.number().positive().optional(),
    date: z.string().transform(str => new Date(str)).optional()
});

export class ExpenseController extends BaseController {
    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const data = createExpenseSchema.parse(request.body);
            const expense = await expenseService.create(data);
            return this.sendResponse(reply, expense, 201);
        } catch (error) {
            return this.sendError(reply, error as Error);
        }
    }

    async findAll(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { vehicleId, category, startDate, endDate } = request.query as {
                vehicleId?: string;
                category?: string;
                startDate?: string;
                endDate?: string;
            };

            const filters: any = {};
            if (vehicleId) filters.vehicleId = vehicleId;
            if (category) filters.category = category;
            if (startDate) filters.startDate = new Date(startDate);
            if (endDate) filters.endDate = new Date(endDate);

            const expenses = await expenseService.findAll(filters);
            return this.sendResponse(reply, expenses);
        } catch (error) {
            return this.sendError(reply, error as Error);
        }
    }

    async findById(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const expense = await expenseService.findById(id);

            if (!expense) {
                return reply.status(404).send({ message: 'Expense not found' });
            }

            return this.sendResponse(reply, expense);
        } catch (error) {
            return this.sendError(reply, error as Error);
        }
    }

    async update(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const data = updateExpenseSchema.parse(request.body);

            const expense = await expenseService.update(id, data);
            return this.sendResponse(reply, expense);
        } catch (error) {
            return this.sendError(reply, error as Error);
        }
    }

    async delete(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            await expenseService.delete(id);
            return this.sendResponse(reply, { message: 'Expense deleted successfully' });
        } catch (error) {
            return this.sendError(reply, error as Error);
        }
    }
} 
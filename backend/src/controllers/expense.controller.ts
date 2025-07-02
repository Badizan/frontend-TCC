import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseController } from './base.controller';
import { ExpenseService } from '../services/expense.service';
import { VehicleService } from '../services/vehicle.service';
import { z } from 'zod';
import { parseLocalDate } from '../utils/dateParser';

const expenseService = new ExpenseService();
const vehicleService = new VehicleService();

const createExpenseSchema = z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID'),
    description: z.string().min(1, 'Description is required'),
    category: z.string().min(1, 'Category is required'),
    amount: z.number().positive('Amount must be positive'),
    date: z.string().transform(str => parseLocalDate(str))
});

const updateExpenseSchema = z.object({
    description: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    amount: z.number().positive().optional(),
    date: z.string().transform(str => parseLocalDate(str)).optional()
});

export class ExpenseController extends BaseController {
    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.status(401).send({ message: 'User not authenticated' });
            }

            const data = createExpenseSchema.parse(request.body);

            // Verificar se o veículo pertence ao usuário
            const vehicle = await vehicleService.findById(data.vehicleId);
            if (!vehicle || vehicle.ownerId !== request.user.id) {
                return reply.status(403).send({ message: 'Access denied to this vehicle' });
            }

            const expense = await expenseService.create(data);
            return this.sendResponse(reply, expense, 201);
        } catch (error) {
            return this.sendError(reply, error as Error);
        }
    }

    async getAll(request: FastifyRequest, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.status(401).send({ message: 'User not authenticated' });
            }

            const { vehicleId, category, startDate, endDate } = request.query as {
                vehicleId?: string;
                category?: string;
                startDate?: string;
                endDate?: string;
            };

            // Filtrar apenas pelos veículos do usuário
            const userVehicles = await vehicleService.findAll(request.user.id);
            const userVehicleIds = userVehicles.map(v => v.id);

            const filters: any = {};

            // Se vehicleId foi especificado, verificar se pertence ao usuário
            if (vehicleId) {
                if (!userVehicleIds.includes(vehicleId)) {
                    return reply.status(403).send({ message: 'Access denied to this vehicle' });
                }
                filters.vehicleId = vehicleId;
            } else {
                // Se não especificou veículo, buscar despesas de todos os veículos do usuário
                filters.vehicleIds = userVehicleIds;
            }

            if (category) filters.category = category;
            if (startDate) filters.startDate = parseLocalDate(startDate);
            if (endDate) filters.endDate = parseLocalDate(endDate);

            const expenses = await expenseService.findAll(filters);
            return this.sendResponse(reply, expenses);
        } catch (error) {
            return this.sendError(reply, error as Error);
        }
    }

    async findById(request: FastifyRequest, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.status(401).send({ message: 'User not authenticated' });
            }

            const { id } = request.params as { id: string };
            const expense = await expenseService.findById(id);

            if (!expense) {
                return reply.status(404).send({ message: 'Expense not found' });
            }

            // Verificar se a despesa pertence a um veículo do usuário
            const vehicle = await vehicleService.findById(expense.vehicleId);
            if (!vehicle || vehicle.ownerId !== request.user.id) {
                return reply.status(403).send({ message: 'Access denied to this expense' });
            }

            return this.sendResponse(reply, expense);
        } catch (error) {
            return this.sendError(reply, error as Error);
        }
    }

    async update(request: FastifyRequest, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.status(401).send({ message: 'User not authenticated' });
            }

            const { id } = request.params as { id: string };
            const data = updateExpenseSchema.parse(request.body);

            // Verificar se a despesa existe e pertence ao usuário
            const expense = await expenseService.findById(id);
            if (!expense) {
                return reply.status(404).send({ message: 'Expense not found' });
            }

            const vehicle = await vehicleService.findById(expense.vehicleId);
            if (!vehicle || vehicle.ownerId !== request.user.id) {
                return reply.status(403).send({ message: 'Access denied to this expense' });
            }

            const updatedExpense = await expenseService.update(id, data);
            return this.sendResponse(reply, updatedExpense);
        } catch (error) {
            return this.sendError(reply, error as Error);
        }
    }

    async delete(request: FastifyRequest, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.status(401).send({ message: 'User not authenticated' });
            }

            const { id } = request.params as { id: string };

            // Verificar se a despesa existe e pertence ao usuário
            const expense = await expenseService.findById(id);
            if (!expense) {
                return reply.status(404).send({ message: 'Expense not found' });
            }

            const vehicle = await vehicleService.findById(expense.vehicleId);
            if (!vehicle || vehicle.ownerId !== request.user.id) {
                return reply.status(403).send({ message: 'Access denied to this expense' });
            }

            await expenseService.delete(id);
            return this.sendResponse(reply, { message: 'Expense deleted successfully' });
        } catch (error) {
            return this.sendError(reply, error as Error);
        }
    }
} 
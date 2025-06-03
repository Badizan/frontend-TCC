import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createExpenseSchema, updateExpenseSchema } from '../schemas/expense.schema';
import { BaseController } from './base.controller';

const prisma = new PrismaClient();

export class ExpenseController extends BaseController {
    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const data = createExpenseSchema.parse(request.body);
            const expense = await prisma.expense.create({ data });
            return this.sendResponse(reply, expense, 201);
        } catch (error) {
            return this.sendError(reply, error as Error);
        }
    }

    async findAll(request: FastifyRequest, reply: FastifyReply) {
        try {
            const expenses = await prisma.expense.findMany();
            return this.sendResponse(reply, expenses);
        } catch (error) {
            return this.sendError(reply, error as Error);
        }
    }

    async findById(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const expense = await prisma.expense.findUnique({ where: { id } });
            if (!expense) return reply.status(404).send({ message: 'Expense not found' });
            return this.sendResponse(reply, expense);
        } catch (error) {
            return this.sendError(reply, error as Error);
        }
    }

    async update(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const data = updateExpenseSchema.parse(request.body);
            const expense = await prisma.expense.update({ where: { id }, data });
            return this.sendResponse(reply, expense);
        } catch (error) {
            return this.sendError(reply, error as Error);
        }
    }

    async delete(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            await prisma.expense.delete({ where: { id } });
            return reply.status(204).send();
        } catch (error) {
            return this.sendError(reply, error as Error);
        }
    }
} 
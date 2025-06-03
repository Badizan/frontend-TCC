import { z } from 'zod';

export const createExpenseSchema = z.object({
    vehicleId: z.string().uuid(),
    description: z.string().min(3),
    category: z.string().min(2),
    amount: z.number().positive(),
    date: z.coerce.date(),
});

export const updateExpenseSchema = z.object({
    description: z.string().min(3).optional(),
    category: z.string().min(2).optional(),
    amount: z.number().positive().optional(),
    date: z.coerce.date().optional(),
}); 
import { z } from 'zod';

export const createReminderSchema = z.object({
    vehicleId: z.string().uuid(),
    description: z.string().min(3),
    dueDate: z.coerce.date(),
    completed: z.boolean().optional(),
});

export const updateReminderSchema = z.object({
    description: z.string().min(3).optional(),
    dueDate: z.coerce.date().optional(),
    completed: z.boolean().optional(),
}); 
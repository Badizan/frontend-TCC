import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'USER']).optional(),
})

export const updateUserSchema = createUserSchema.partial()

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
}) 
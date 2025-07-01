import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must have at least 6 characters'),
  role: z.enum(['ADMIN', 'OWNER']).optional(),
  phone: z.string().optional()
})

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  role: z.enum(['ADMIN', 'OWNER']).optional(),
  phone: z.string().optional()
})

export type CreateUserData = z.infer<typeof createUserSchema>
export type UpdateUserData = z.infer<typeof updateUserSchema>

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
}) 
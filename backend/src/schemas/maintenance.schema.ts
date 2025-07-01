import { z } from 'zod'

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  mechanicId: z.string().uuid('Invalid mechanic ID').optional(),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'INSPECTION']),
  description: z.string().min(1, 'Description is required'),
  scheduledDate: z.string().datetime('Invalid date format'),
  cost: z.number().positive('Cost must be positive').optional(),
  notes: z.string().optional()
})

export const updateMaintenanceSchema = z.object({
  mechanicId: z.string().uuid('Invalid mechanic ID').optional(),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'INSPECTION']).optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  description: z.string().min(1, 'Description is required').optional(),
  scheduledDate: z.string().datetime('Invalid date format').optional(),
  completedDate: z.string().datetime('Invalid date format').optional(),
  cost: z.number().positive('Cost must be positive').optional(),
  notes: z.string().optional()
})

export type CreateMaintenanceData = z.infer<typeof createMaintenanceSchema>
export type UpdateMaintenanceData = z.infer<typeof updateMaintenanceSchema>

export const maintenanceIdParamSchema = z.object({
  id: z.string().uuid('Invalid maintenance ID'),
}) 
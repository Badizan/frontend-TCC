import { z } from 'zod'

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  mechanicId: z.string().uuid('Invalid mechanic ID'),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'INSPECTION']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  scheduledDate: z.string().datetime(),
  notes: z.string().optional(),
})

export const updateMaintenanceSchema = z.object({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  completedDate: z.string().datetime().optional(),
  cost: z.number().positive().optional(),
  notes: z.string().optional(),
})

export const maintenanceIdParamSchema = z.object({
  id: z.string().uuid('Invalid maintenance ID'),
}) 
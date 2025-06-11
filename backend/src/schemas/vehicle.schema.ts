import { z } from 'zod'

export const createVehicleSchema = z.object({
  brand: z.string().min(2, 'Brand must be at least 2 characters'),
  model: z.string().min(2, 'Model must be at least 2 characters'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  licensePlate: z.string().regex(/^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/, 'Invalid license plate format'),
  type: z.enum(['CAR', 'MOTORCYCLE', 'TRUCK', 'VAN']),
  ownerId: z.string().uuid('Invalid owner ID'),
})

export const updateVehicleSchema = createVehicleSchema.partial()

export const vehicleIdParamSchema = z.object({
  id: z.string().uuid('Invalid vehicle ID'),
}) 
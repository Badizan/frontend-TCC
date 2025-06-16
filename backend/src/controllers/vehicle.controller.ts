import { FastifyRequest, FastifyReply } from 'fastify'
import { BaseController } from './base.controller'
import { VehicleService } from '../services/vehicle.service'
import { z } from 'zod'

const vehicleService = new VehicleService()

const createVehicleSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  licensePlate: z.string().min(1, 'License plate is required'),
  type: z.enum(['CAR', 'MOTORCYCLE', 'TRUCK', 'VAN']),
  color: z.string().optional(),
  mileage: z.number().min(0).optional(),
  ownerId: z.string().uuid('Invalid owner ID')
})

const updateVehicleSchema = z.object({
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  licensePlate: z.string().min(1).optional(),
  type: z.enum(['CAR', 'MOTORCYCLE', 'TRUCK', 'VAN']).optional(),
  color: z.string().optional(),
  mileage: z.number().min(0).optional()
})

export class VehicleController extends BaseController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createVehicleSchema.parse(request.body)
      const vehicle = await vehicleService.create(data)
      return this.sendResponse(reply, vehicle, 201)
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { ownerId } = request.query as { ownerId?: string }
      const vehicles = await vehicleService.findAll(ownerId)
      return this.sendResponse(reply, vehicles)
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const vehicle = await vehicleService.findById(id)

      if (!vehicle) {
        return reply.status(404).send({ message: 'Vehicle not found' })
      }

      return this.sendResponse(reply, vehicle)
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const data = updateVehicleSchema.parse(request.body)

      const vehicle = await vehicleService.update(id, data)
      return this.sendResponse(reply, vehicle)
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      await vehicleService.delete(id)
      return this.sendResponse(reply, { message: 'Vehicle deleted successfully' })
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }
} 
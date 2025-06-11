import { FastifyRequest, FastifyReply } from 'fastify'
import { BaseController } from './base.controller'
import { MaintenanceService } from '../services/maintenance.service'
import { z } from 'zod'

const maintenanceService = new MaintenanceService()

const createMaintenanceSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  mechanicId: z.string().uuid('Invalid mechanic ID'),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'INSPECTION']),
  description: z.string().min(1, 'Description is required'),
  scheduledDate: z.string().transform(str => new Date(str)),
  cost: z.number().optional(),
  notes: z.string().optional()
})

const updateMaintenanceSchema = z.object({
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'INSPECTION']).optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  description: z.string().min(1).optional(),
  scheduledDate: z.string().transform(str => new Date(str)).optional(),
  completedDate: z.string().transform(str => new Date(str)).optional(),
  cost: z.number().optional(),
  notes: z.string().optional()
})

export class MaintenanceController extends BaseController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createMaintenanceSchema.parse(request.body)
      const maintenance = await maintenanceService.create(data)
      return this.sendResponse(reply, maintenance, 201)
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { vehicleId, mechanicId, status, type } = request.query as {
        vehicleId?: string
        mechanicId?: string
        status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
        type?: 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION'
      }

      const maintenances = await maintenanceService.findAll({
        vehicleId,
        mechanicId,
        status,
        type
      })

      return this.sendResponse(reply, maintenances)
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const maintenance = await maintenanceService.findById(id)

      if (!maintenance) {
        return reply.status(404).send({ message: 'Maintenance not found' })
      }

      return this.sendResponse(reply, maintenance)
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const data = updateMaintenanceSchema.parse(request.body)

      const maintenance = await maintenanceService.update(id, data)
      return this.sendResponse(reply, maintenance)
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      await maintenanceService.delete(id)
      return this.sendResponse(reply, { message: 'Maintenance deleted successfully' })
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async findByVehicle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { vehicleId } = request.params as { vehicleId: string }
      const maintenances = await maintenanceService.findByVehicle(vehicleId)
      return this.sendResponse(reply, maintenances)
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async findByMechanic(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { mechanicId } = request.params as { mechanicId: string }
      const maintenances = await maintenanceService.findByMechanic(mechanicId)
      return this.sendResponse(reply, maintenances)
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }
} 
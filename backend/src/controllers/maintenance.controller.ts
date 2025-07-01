import { FastifyRequest, FastifyReply } from 'fastify'
import { BaseController } from './base.controller'
import { MaintenanceService } from '../services/maintenance.service'
import { VehicleService } from '../services/vehicle.service'
import { z } from 'zod'

const maintenanceService = new MaintenanceService()
const vehicleService = new VehicleService()

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
      if (!request.user) {
        return reply.status(401).send({ message: 'User not authenticated' });
      }

      const data = createMaintenanceSchema.parse(request.body)

      // Verificar se o veículo pertence ao usuário
      const vehicle = await vehicleService.findById(data.vehicleId);
      if (!vehicle || vehicle.ownerId !== request.user.id) {
        return reply.status(403).send({ message: 'Access denied to this vehicle' });
      }

      const maintenance = await maintenanceService.create(data)
      return this.sendResponse(reply, maintenance, 201)
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ message: 'User not authenticated' });
      }

      const { vehicleId, mechanicId, status, type } = request.query as {
        vehicleId?: string
        mechanicId?: string
        status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
        type?: 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION'
      }

      // Filtrar apenas pelos veículos do usuário
      const userVehicles = await vehicleService.findAll(request.user.id);
      const userVehicleIds = userVehicles.map(v => v.id);

      const filters: any = { mechanicId, status, type };

      // Se vehicleId foi especificado, verificar se pertence ao usuário
      if (vehicleId) {
        if (!userVehicleIds.includes(vehicleId)) {
          return reply.status(403).send({ message: 'Access denied to this vehicle' });
        }
        filters.vehicleId = vehicleId;
      } else {
        // Se não especificou veículo, buscar manutenções de todos os veículos do usuário
        filters.vehicleIds = userVehicleIds;
      }

      const maintenances = await maintenanceService.findAll(filters)
      return this.sendResponse(reply, maintenances)
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ message: 'User not authenticated' });
      }

      const { id } = request.params as { id: string }
      const maintenance = await maintenanceService.findById(id)

      if (!maintenance) {
        return reply.status(404).send({ message: 'Maintenance not found' })
      }

      // Verificar se a manutenção pertence a um veículo do usuário
      const vehicle = await vehicleService.findById(maintenance.vehicleId);
      if (!vehicle || vehicle.ownerId !== request.user.id) {
        return reply.status(403).send({ message: 'Access denied to this maintenance' });
      }

      return this.sendResponse(reply, maintenance)
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ message: 'User not authenticated' });
      }

      const { id } = request.params as { id: string }
      const data = updateMaintenanceSchema.parse(request.body)

      // Verificar se a manutenção existe e pertence ao usuário
      const maintenance = await maintenanceService.findById(id);
      if (!maintenance) {
        return reply.status(404).send({ message: 'Maintenance not found' });
      }

      const vehicle = await vehicleService.findById(maintenance.vehicleId);
      if (!vehicle || vehicle.ownerId !== request.user.id) {
        return reply.status(403).send({ message: 'Access denied to this maintenance' });
      }

      const updatedMaintenance = await maintenanceService.update(id, data)
      return this.sendResponse(reply, updatedMaintenance)
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ message: 'User not authenticated' });
      }

      const { id } = request.params as { id: string }

      // Verificar se a manutenção existe e pertence ao usuário
      const maintenance = await maintenanceService.findById(id);
      if (!maintenance) {
        return reply.status(404).send({ message: 'Maintenance not found' });
      }

      const vehicle = await vehicleService.findById(maintenance.vehicleId);
      if (!vehicle || vehicle.ownerId !== request.user.id) {
        return reply.status(403).send({ message: 'Access denied to this maintenance' });
      }

      await maintenanceService.delete(id)
      return this.sendResponse(reply, { message: 'Maintenance deleted successfully' })
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async findByVehicle(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ message: 'User not authenticated' });
      }

      const { vehicleId } = request.params as { vehicleId: string }

      // Verificar se o veículo pertence ao usuário
      const vehicle = await vehicleService.findById(vehicleId);
      if (!vehicle || vehicle.ownerId !== request.user.id) {
        return reply.status(403).send({ message: 'Access denied to this vehicle' });
      }

      const maintenances = await maintenanceService.findByVehicle(vehicleId)
      return this.sendResponse(reply, maintenances)
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }

  async findByMechanic(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ message: 'User not authenticated' });
      }

      const { mechanicId } = request.params as { mechanicId: string }

      // Buscar apenas manutenções de veículos do usuário para este mecânico
      const userVehicles = await vehicleService.findAll(request.user.id);
      const userVehicleIds = userVehicles.map(v => v.id);

      const maintenances = await maintenanceService.findByMechanic(mechanicId, userVehicleIds)
      return this.sendResponse(reply, maintenances)
    } catch (error) {
      return this.sendError(reply, error as Error)
    }
  }
} 
import { FastifyRequest, FastifyReply } from 'fastify'
import { BaseController } from './base.controller'
import { VehicleService } from '../services/vehicle.service'
import { z } from 'zod'
import { updateVehicleSchema } from '../schemas/vehicle.schema'

const vehicleService = new VehicleService()

const createVehicleSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  licensePlate: z.string().min(1, 'License plate is required'),
  type: z.enum(['CAR', 'MOTORCYCLE', 'TRUCK', 'VAN']),
  color: z.string().optional(),
  mileage: z.number().min(0).optional()
})

export class VehicleController extends BaseController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        console.warn('⚠️ VehicleController: Tentativa de criar veículo sem autenticação');
        return reply.status(401).send({ message: 'User not authenticated' });
      }

      console.log('🚗 VehicleController: Criando veículo para usuário:', request.user.id);

      const data = createVehicleSchema.parse(request.body);

      // SEMPRE usar o usuário autenticado como owner (NUNCA confiar no frontend)
      const vehicleData = {
        ...data,
        ownerId: request.user.id  // Forçar sempre o usuário autenticado
      };

      // Log de segurança
      if ((request.body as any).ownerId && (request.body as any).ownerId !== request.user.id) {
        console.warn('🚨 VehicleController: TENTATIVA DE FALSIFICAÇÃO - Frontend enviou ownerId diferente do usuário autenticado!', {
          frontendOwnerId: (request.body as any).ownerId,
          authenticatedUserId: request.user.id,
          userEmail: request.user.email
        });
      }

      console.log('✅ VehicleController: Dados finais validados:', {
        brand: vehicleData.brand,
        model: vehicleData.model,
        ownerId: vehicleData.ownerId,
        userEmail: request.user.email
      });

      const vehicle = await vehicleService.create(vehicleData);

      // Verificação final de segurança
      if (vehicle.ownerId !== request.user.id) {
        console.error('🚨 VehicleController: ERRO CRÍTICO - Veículo criado com ownerId incorreto!', {
          vehicleOwnerId: vehicle.ownerId,
          authenticatedUserId: request.user.id
        });
        throw new Error('Erro interno de segurança');
      }

      console.log('✅ VehicleController: Veículo criado com sucesso:', vehicle.id);
      return this.sendResponse(reply, vehicle, 201);
    } catch (error) {
      console.error('❌ VehicleController: Erro ao criar veículo:', error);
      return this.sendError(reply, error as Error);
    }
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        console.warn('⚠️ VehicleController: Tentativa de buscar veículos sem autenticação');
        return reply.status(401).send({ message: 'User not authenticated' });
      }

      console.log('🔍 VehicleController: Buscando veículos para usuário:', request.user.id);

      // SEMPRE filtrar pelos veículos do usuário autenticado
      const vehicles = await vehicleService.findAll(request.user.id);

      // Verificação adicional de segurança
      const invalidVehicles = vehicles.filter(v => v.ownerId !== request.user.id);
      if (invalidVehicles.length > 0) {
        console.error('🚨 VehicleController: ERRO CRÍTICO - Veículos retornados não pertencem ao usuário!', {
          authenticatedUserId: request.user.id,
          invalidVehicleIds: invalidVehicles.map(v => v.id),
          invalidOwnerIds: invalidVehicles.map(v => v.ownerId)
        });
        // Filtrar apenas os veículos corretos
        const validVehicles = vehicles.filter(v => v.ownerId === request.user.id);
        console.log('✅ VehicleController: Filtragem de segurança aplicada, retornando apenas veículos válidos');
        return this.sendResponse(reply, validVehicles);
      }

      console.log(`✅ VehicleController: ${vehicles.length} veículos encontrados para usuário ${request.user.email}`);
      return this.sendResponse(reply, vehicles);
    } catch (error) {
      console.error('❌ VehicleController: Erro ao buscar veículos:', error);
      return this.sendError(reply, error as Error);
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        console.warn('⚠️ VehicleController: Tentativa de buscar veículo sem autenticação');
        return reply.status(401).send({ message: 'User not authenticated' });
      }

      const { id } = request.params as { id: string };
      console.log('🔍 VehicleController: Buscando veículo específico:', id, 'para usuário:', request.user.id);

      const vehicle = await vehicleService.findById(id);

      if (!vehicle) {
        console.log('❌ VehicleController: Veículo não encontrado:', id);
        return reply.status(404).send({ message: 'Vehicle not found' });
      }

      // VERIFICAÇÃO CRÍTICA: Veículo pertence ao usuário autenticado?
      if (vehicle.ownerId !== request.user.id) {
        console.warn('🚨 VehicleController: TENTATIVA DE ACESSO NÃO AUTORIZADO!', {
          vehicleId: id,
          vehicleOwnerId: vehicle.ownerId,
          authenticatedUserId: request.user.id,
          userEmail: request.user.email
        });
        return reply.status(403).send({ message: 'Access denied to this vehicle' });
      }

      console.log('✅ VehicleController: Veículo autorizado encontrado:', vehicle.brand, vehicle.model);
      return this.sendResponse(reply, vehicle);
    } catch (error) {
      console.error('❌ VehicleController: Erro ao buscar veículo:', error);
      return this.sendError(reply, error as Error);
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        console.warn('⚠️ VehicleController: Tentativa de atualizar veículo sem autenticação');
        return reply.status(401).send({ message: 'User not authenticated' });
      }

      const { id } = request.params as { id: string };
      const data = updateVehicleSchema.parse(request.body);

      console.log('🔧 VehicleController: Atualizando veículo:', id, 'para usuário:', request.user.id);

      // Verificar se o veículo pertence ao usuário antes de atualizar
      const existingVehicle = await vehicleService.findById(id);
      if (!existingVehicle) {
        console.log('❌ VehicleController: Veículo não encontrado para atualização:', id);
        return reply.status(404).send({ message: 'Vehicle not found' });
      }

      // VERIFICAÇÃO CRÍTICA DE SEGURANÇA
      if (existingVehicle.ownerId !== request.user.id) {
        console.warn('🚨 VehicleController: TENTATIVA DE ATUALIZAÇÃO NÃO AUTORIZADA!', {
          vehicleId: id,
          vehicleOwnerId: existingVehicle.ownerId,
          authenticatedUserId: request.user.id,
          userEmail: request.user.email
        });
        return reply.status(403).send({ message: 'Access denied to this vehicle' });
      }

      // Remover qualquer tentativa de alterar o ownerId
      const cleanData = { ...data };
      delete (cleanData as any).ownerId;

      const vehicle = await vehicleService.update(id, cleanData);

      // Verificação final
      if (vehicle.ownerId !== request.user.id) {
        console.error('🚨 VehicleController: ERRO CRÍTICO - ownerId alterado durante atualização!');
        throw new Error('Erro interno de segurança');
      }

      console.log('✅ VehicleController: Veículo atualizado com sucesso:', id);
      return this.sendResponse(reply, vehicle);
    } catch (error) {
      console.error('❌ VehicleController: Erro ao atualizar veículo:', error);
      return this.sendError(reply, error as Error);
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        console.warn('⚠️ VehicleController: Tentativa de deletar veículo sem autenticação');
        return reply.status(401).send({ message: 'User not authenticated' });
      }

      const { id } = request.params as { id: string };
      console.log('🗑️ VehicleController: Deletando veículo:', id, 'para usuário:', request.user.id);

      // Verificar se o veículo pertence ao usuário antes de deletar
      const existingVehicle = await vehicleService.findById(id);
      if (!existingVehicle) {
        console.log('❌ VehicleController: Veículo não encontrado para deleção:', id);
        return reply.status(404).send({ message: 'Vehicle not found' });
      }

      // VERIFICAÇÃO CRÍTICA DE SEGURANÇA
      if (existingVehicle.ownerId !== request.user.id) {
        console.warn('🚨 VehicleController: TENTATIVA DE DELEÇÃO NÃO AUTORIZADA!', {
          vehicleId: id,
          vehicleOwnerId: existingVehicle.ownerId,
          authenticatedUserId: request.user.id,
          userEmail: request.user.email
        });
        return reply.status(403).send({ message: 'Access denied to this vehicle' });
      }

      await vehicleService.delete(id);
      console.log('✅ VehicleController: Veículo deletado com sucesso:', id);
      return this.sendResponse(reply, { message: 'Vehicle deleted successfully' });
    } catch (error) {
      console.error('❌ VehicleController: Erro ao deletar veículo:', error);
      return this.sendError(reply, error as Error);
    }
  }
} 
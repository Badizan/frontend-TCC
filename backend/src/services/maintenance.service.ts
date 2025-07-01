import { PrismaClient, MaintenanceType, MaintenanceStatus } from '@prisma/client'

const prisma = new PrismaClient()

interface CreateMaintenanceData {
    vehicleId: string
    mechanicId?: string
    type: MaintenanceType
    description: string
    scheduledDate: Date
    cost?: number
    notes?: string
}

export class MaintenanceService {
    async create(data: CreateMaintenanceData) {
        return await prisma.maintenance.create({
            data,
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                },
                mechanic: {
                    select: { id: true, name: true, email: true }
                }
            }
        })
    }

    async findAll(filters?: {
        vehicleId?: string;
        vehicleIds?: string[];
        mechanicId?: string;
        status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
        type?: 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION';
    }) {
        const where: any = {};

        // Filtrar por veículo específico OU lista de veículos
        if (filters?.vehicleId) {
            where.vehicleId = filters.vehicleId;
        } else if (filters?.vehicleIds && filters.vehicleIds.length > 0) {
            where.vehicleId = { in: filters.vehicleIds };
        }

        if (filters?.mechanicId) where.mechanicId = filters.mechanicId;
        if (filters?.status) where.status = filters.status;
        if (filters?.type) where.type = filters.type;

        return await prisma.maintenance.findMany({
            where,
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                },
                mechanic: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { scheduledDate: 'desc' }
        });
    }

    async findById(id: string) {
        return await prisma.maintenance.findUnique({
            where: { id },
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                },
                mechanic: {
                    select: { id: true, name: true, email: true }
                }
            }
        })
    }

    async update(id: string, data: {
        type?: MaintenanceType
        status?: MaintenanceStatus
        description?: string
        scheduledDate?: Date
        completedDate?: Date
        cost?: number
        notes?: string
    }) {
        return await prisma.maintenance.update({
            where: { id },
            data,
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                },
                mechanic: {
                    select: { id: true, name: true, email: true }
                }
            }
        })
    }

    async delete(id: string) {
        return await prisma.maintenance.delete({
            where: { id }
        })
    }

    async findByVehicle(vehicleId: string) {
        return await prisma.maintenance.findMany({
            where: { vehicleId },
            include: {
                mechanic: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { scheduledDate: 'desc' }
        })
    }

    async findByMechanic(mechanicId: string, vehicleIds?: string[]) {
        const where: any = { mechanicId };

        // Se vehicleIds foi fornecido, filtrar apenas por esses veículos
        if (vehicleIds && vehicleIds.length > 0) {
            where.vehicleId = { in: vehicleIds };
        }

        return await prisma.maintenance.findMany({
            where,
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                },
                mechanic: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { scheduledDate: 'desc' }
        });
    }

    async getUpcomingMaintenances(days: number = 30) {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + days)

        return await prisma.maintenance.findMany({
            where: {
                scheduledDate: {
                    gte: new Date(),
                    lte: futureDate
                },
                status: {
                    in: ['SCHEDULED', 'IN_PROGRESS']
                }
            },
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                },
                mechanic: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { scheduledDate: 'asc' }
        })
    }
} 
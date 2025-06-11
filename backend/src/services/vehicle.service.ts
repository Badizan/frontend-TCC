import { PrismaClient, VehicleType } from '@prisma/client'

const prisma = new PrismaClient()

export class VehicleService {
    async create(data: {
        brand: string
        model: string
        year: number
        licensePlate: string
        type: VehicleType
        ownerId: string
    }) {
        return await prisma.vehicle.create({
            data,
            include: {
                owner: {
                    select: { id: true, name: true, email: true }
                }
            }
        })
    }

    async findAll(ownerId?: string) {
        const where = ownerId ? { ownerId } : {}

        return await prisma.vehicle.findMany({
            where,
            include: {
                owner: {
                    select: { id: true, name: true, email: true }
                },
                maintenances: {
                    orderBy: { scheduledDate: 'desc' },
                    take: 5
                },
                _count: {
                    select: {
                        maintenances: true,
                        reminders: true,
                        expenses: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    }

    async findById(id: string) {
        return await prisma.vehicle.findUnique({
            where: { id },
            include: {
                owner: {
                    select: { id: true, name: true, email: true }
                },
                maintenances: {
                    orderBy: { scheduledDate: 'desc' },
                    include: {
                        mechanic: {
                            select: { id: true, name: true }
                        }
                    }
                },
                reminders: {
                    orderBy: { dueDate: 'asc' }
                },
                expenses: {
                    orderBy: { date: 'desc' }
                }
            }
        })
    }

    async update(id: string, data: {
        brand?: string
        model?: string
        year?: number
        licensePlate?: string
        type?: VehicleType
    }) {
        return await prisma.vehicle.update({
            where: { id },
            data,
            include: {
                owner: {
                    select: { id: true, name: true, email: true }
                }
            }
        })
    }

    async delete(id: string) {
        return await prisma.vehicle.delete({
            where: { id }
        })
    }

    async findByOwner(ownerId: string) {
        return await prisma.vehicle.findMany({
            where: { ownerId },
            include: {
                _count: {
                    select: {
                        maintenances: true,
                        reminders: true,
                        expenses: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    }
} 
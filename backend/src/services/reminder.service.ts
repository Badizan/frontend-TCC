import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class ReminderService {
    async create(data: {
        vehicleId: string
        description: string
        dueDate: Date
    }) {
        return await prisma.reminder.create({
            data,
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                }
            }
        })
    }

    async findAll(filters?: {
        vehicleId?: string
        completed?: boolean
    }) {
        const where: any = {}

        if (filters?.vehicleId) where.vehicleId = filters.vehicleId
        if (typeof filters?.completed === 'boolean') where.completed = filters.completed

        return await prisma.reminder.findMany({
            where,
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                }
            },
            orderBy: { dueDate: 'asc' }
        })
    }

    async findById(id: string) {
        return await prisma.reminder.findUnique({
            where: { id },
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                }
            }
        })
    }

    async update(id: string, data: {
        description?: string
        dueDate?: Date
        completed?: boolean
    }) {
        return await prisma.reminder.update({
            where: { id },
            data,
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                }
            }
        })
    }

    async delete(id: string) {
        return await prisma.reminder.delete({
            where: { id }
        })
    }

    async findByVehicle(vehicleId: string) {
        return await prisma.reminder.findMany({
            where: { vehicleId },
            orderBy: { dueDate: 'asc' }
        })
    }

    async getUpcomingReminders(days: number = 30) {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + days)

        return await prisma.reminder.findMany({
            where: {
                dueDate: {
                    gte: new Date(),
                    lte: futureDate
                },
                completed: false
            },
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                }
            },
            orderBy: { dueDate: 'asc' }
        })
    }

    async markAsCompleted(id: string) {
        return await prisma.reminder.update({
            where: { id },
            data: { completed: true },
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                }
            }
        })
    }
} 
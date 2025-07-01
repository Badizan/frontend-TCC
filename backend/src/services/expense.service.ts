import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class ExpenseService {
    async create(data: {
        vehicleId: string
        description: string
        category: string
        amount: number
        date: Date
    }) {
        return await prisma.expense.create({
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
        vehicleIds?: string[]
        category?: string
        startDate?: Date
        endDate?: Date
    }) {
        const where: any = {}

        // Filtrar por veículo específico OU lista de veículos
        if (filters?.vehicleId) {
            where.vehicleId = filters.vehicleId
        } else if (filters?.vehicleIds && filters.vehicleIds.length > 0) {
            where.vehicleId = { in: filters.vehicleIds }
        }

        if (filters?.category) where.category = filters.category
        if (filters?.startDate || filters?.endDate) {
            where.date = {}
            if (filters.startDate) where.date.gte = filters.startDate
            if (filters.endDate) where.date.lte = filters.endDate
        }

        return await prisma.expense.findMany({
            where,
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true }
                }
            },
            orderBy: { date: 'desc' }
        })
    }

    async findById(id: string) {
        return await prisma.expense.findUnique({
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
        category?: string
        amount?: number
        date?: Date
    }) {
        return await prisma.expense.update({
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
        return await prisma.expense.delete({
            where: { id }
        })
    }

    async findByVehicle(vehicleId: string) {
        return await prisma.expense.findMany({
            where: { vehicleId },
            orderBy: { date: 'desc' }
        })
    }

    async getTotalByCategory(vehicleId?: string) {
        const where = vehicleId ? { vehicleId } : {}

        const expenses = await prisma.expense.groupBy({
            by: ['category'],
            where,
            _sum: {
                amount: true
            },
            _count: {
                _all: true
            }
        })

        return expenses.map(expense => ({
            category: expense.category,
            total: expense._sum.amount || 0,
            count: expense._count._all
        }))
    }

    async getMonthlyExpenses(vehicleId?: string, year?: number) {
        const currentYear = year || new Date().getFullYear()
        const startDate = new Date(currentYear, 0, 1)
        const endDate = new Date(currentYear, 11, 31)

        const where: any = {
            date: {
                gte: startDate,
                lte: endDate
            }
        }

        if (vehicleId) where.vehicleId = vehicleId

        const expenses = await prisma.expense.findMany({
            where,
            select: {
                amount: true,
                date: true
            }
        })

        // Agrupar por mês
        const monthlyTotals = new Array(12).fill(0)
        expenses.forEach(expense => {
            const month = expense.date.getMonth()
            monthlyTotals[month] += expense.amount
        })

        return monthlyTotals.map((total, index) => ({
            month: index + 1,
            total
        }))
    }
} 
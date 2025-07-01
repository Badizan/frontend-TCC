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
        color?: string
        mileage?: number
    }) {
        try {
            // Verificar se o proprietário existe
            const owner = await prisma.user.findUnique({
                where: { id: data.ownerId }
            })

            if (!owner) {
                throw new Error('Proprietário não encontrado')
            }

            // Verificar se já existe um veículo com essa placa para esse proprietário
            const existingVehicle = await prisma.vehicle.findFirst({
                where: {
                    licensePlate: data.licensePlate.toUpperCase(),
                    ownerId: data.ownerId
                }
            })

            if (existingVehicle) {
                throw new Error(`Você já possui um veículo cadastrado com a placa ${data.licensePlate.toUpperCase()}`)
            }

            return await prisma.vehicle.create({
                data: {
                    brand: data.brand,
                    model: data.model,
                    year: data.year,
                    licensePlate: data.licensePlate.toUpperCase(),
                    type: data.type,
                    ownerId: data.ownerId,
                    color: data.color,
                    mileage: data.mileage || 0
                },
                include: {
                    owner: {
                        select: { id: true, name: true, email: true }
                    }
                }
            })
        } catch (error: any) {
            // Log do erro para debug
            console.error('Erro ao criar veículo:', error.message)

            // Tratar erros específicos do Prisma
            if (error.code === 'P2002') {
                if (error.meta?.target?.includes('licensePlate')) {
                    throw new Error(`A placa ${data.licensePlate} já está cadastrada no sistema`)
                }
            }

            // Re-throw outros erros
            throw error
        }
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
        const vehicle = await prisma.vehicle.findUnique({
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

        if (!vehicle) {
            throw new Error('Veículo não encontrado')
        }

        return vehicle
    }

    async update(id: string, data: {
        brand?: string
        model?: string
        year?: number
        licensePlate?: string
        type?: VehicleType
        color?: string
        mileage?: number
    }) {
        try {
            // Se está atualizando a placa, verificar se não existe
            if (data.licensePlate) {
                const existingVehicle = await prisma.vehicle.findFirst({
                    where: {
                        licensePlate: data.licensePlate,
                        NOT: { id }
                    }
                })

                if (existingVehicle) {
                    throw new Error(`A placa ${data.licensePlate} já está sendo usada por outro veículo`)
                }

                // Normalizar placa
                data.licensePlate = data.licensePlate.toUpperCase()
            }

            return await prisma.vehicle.update({
                where: { id },
                data,
                include: {
                    owner: {
                        select: { id: true, name: true, email: true }
                    }
                }
            })
        } catch (error: any) {
            if (error.code === 'P2025') {
                throw new Error('Veículo não encontrado')
            }

            if (error.code === 'P2002') {
                if (error.meta?.target?.includes('licensePlate')) {
                    throw new Error(`A placa ${data.licensePlate} já está cadastrada no sistema`)
                }
            }

            throw error
        }
    }

    async delete(id: string) {
        try {
            // Verificar se o veículo tem manutenções ou outros dados vinculados
            const vehicle = await prisma.vehicle.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            maintenances: true,
                            reminders: true,
                            expenses: true
                        }
                    }
                }
            })

            if (!vehicle) {
                throw new Error('Veículo não encontrado')
            }

            const totalRecords = vehicle._count.maintenances + vehicle._count.reminders + vehicle._count.expenses

            if (totalRecords > 0) {
                throw new Error(`Não é possível excluir o veículo pois ele possui ${totalRecords} registro(s) vinculado(s) (manutenções, lembretes ou despesas)`)
            }

            return await prisma.vehicle.delete({
                where: { id }
            })
        } catch (error: any) {
            if (error.code === 'P2025') {
                throw new Error('Veículo não encontrado')
            }

            throw error
        }
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

    async checkLicensePlateExists(licensePlate: string, excludeId?: string) {
        const where: any = { licensePlate: licensePlate.toUpperCase() }

        if (excludeId) {
            where.id = { not: excludeId }
        }

        const existing = await prisma.vehicle.findUnique({ where })
        return !!existing
    }
} 
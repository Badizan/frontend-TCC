import { PrismaClient, MaintenanceType, MaintenanceStatus } from '@prisma/client'
import { NotificationService } from './notification.service'
import { ExpenseService } from './expense.service'
import { ReminderService } from './reminder.service'

const prisma = new PrismaClient()
const notificationService = new NotificationService()
const expenseService = new ExpenseService()
const reminderService = new ReminderService()

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
        const maintenance = await prisma.maintenance.create({
            data,
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true, ownerId: true }
                },
                mechanic: {
                    select: { id: true, name: true, email: true }
                }
            }
        })

        // Criar notificação para o proprietário do veículo
        try {
            await notificationService.createNotification({
                userId: maintenance.vehicle.ownerId,
                type: 'MAINTENANCE_SCHEDULED',
                title: 'Manutenção Agendada',
                message: `Nova manutenção ${data.type.toLowerCase()} agendada para o veículo ${maintenance.vehicle.brand} ${maintenance.vehicle.model} (${maintenance.vehicle.licensePlate}) em ${data.scheduledDate.toLocaleDateString('pt-BR')}.`,
                data: {
                    maintenanceId: maintenance.id,
                    vehicleId: maintenance.vehicleId,
                    type: data.type,
                    scheduledDate: data.scheduledDate
                },
                category: 'maintenance',
                channel: 'IN_APP'
            })
        } catch (error) {
            console.error('❌ Erro ao criar notificação de manutenção:', error)
        }

        // Criar lembrete automático para a manutenção (no mesmo dia)
        try {
            const reminderDate = new Date(data.scheduledDate);
            // Definir o lembrete para o mesmo dia da manutenção, mas às 8h da manhã
            reminderDate.setHours(8, 0, 0, 0);

            // Formatar a data da manutenção para exibição
            const maintenanceDate = new Date(data.scheduledDate);
            const formattedDate = maintenanceDate.toLocaleDateString('pt-BR');

            await reminderService.create({
                vehicleId: maintenance.vehicleId,
                description: `Lembrete: ${data.description} agendada para ${formattedDate}`,
                type: 'TIME_BASED',
                dueDate: reminderDate,
                recurring: false
            });

            console.log('✅ Lembrete criado automaticamente para manutenção agendada');
        } catch (error) {
            console.error('❌ Erro ao criar lembrete automático:', error);
        }

        // Criar despesa automática se foi informado um custo
        if (data.cost && data.cost > 0) {
            try {
                await expenseService.create({
                    vehicleId: maintenance.vehicleId,
                    description: `Manutenção: ${data.description}`,
                    category: 'MAINTENANCE',
                    amount: data.cost,
                    date: data.scheduledDate
                });

                console.log('✅ Despesa criada automaticamente para manutenção agendada');
            } catch (error) {
                console.error('❌ Erro ao criar despesa automática:', error);
            }
        }

        return maintenance
    }

    async findAll(filters?: {
        vehicleId?: string;
        vehicleIds?: string[];
        mechanicId?: string;
        status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
        type?: 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION';
    }) {
        console.log('🔧 MaintenanceService: Buscando manutenções com filtros:', filters);

        const where: any = {};

        // Filtrar por veículo específico OU lista de veículos
        if (filters?.vehicleId) {
            where.vehicleId = filters.vehicleId;
            console.log('🔧 MaintenanceService: Filtrando por veículo específico:', filters.vehicleId);
        } else if (filters?.vehicleIds && filters.vehicleIds.length > 0) {
            where.vehicleId = { in: filters.vehicleIds };
            console.log('🔧 MaintenanceService: Filtrando por lista de veículos:', filters.vehicleIds.length, 'veículos');
        }

        if (filters?.mechanicId) where.mechanicId = filters.mechanicId;
        if (filters?.status) where.status = filters.status;
        if (filters?.type) where.type = filters.type;

        const maintenances = await prisma.maintenance.findMany({
            where,
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true, ownerId: true }
                },
                mechanic: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { scheduledDate: 'desc' }
        });

        // Verificação de segurança: registrar ownerIds únicos
        const ownerIds = new Set(maintenances.map(m => m.vehicle.ownerId));
        if (ownerIds.size > 1) {
            console.warn('🚨 MaintenanceService: MÚLTIPLOS PROPRIETÁRIOS DETECTADOS nas manutenções retornadas!', {
                totalManutencoes: maintenances.length,
                proprietariosUnicos: ownerIds.size,
                proprietarios: Array.from(ownerIds),
                filtrosUsados: filters
            });
        }

        console.log(`✅ MaintenanceService: ${maintenances.length} manutenções encontradas, ${ownerIds.size} proprietário(s) único(s)`);
        return maintenances;
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
        // Buscar a manutenção atual para verificar se já tem custo
        const currentMaintenance = await prisma.maintenance.findUnique({
            where: { id },
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true, ownerId: true }
                },
                mechanic: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        if (!currentMaintenance) {
            throw new Error('Manutenção não encontrada');
        }

        const maintenance = await prisma.maintenance.update({
            where: { id },
            data,
            include: {
                vehicle: {
                    select: { id: true, brand: true, model: true, licensePlate: true, ownerId: true }
                },
                mechanic: {
                    select: { id: true, name: true, email: true }
                }
            }
        })

        // Criar notificação se a manutenção foi completada
        if (data.status === 'COMPLETED') {
            try {
                await notificationService.createNotification({
                    userId: maintenance.vehicle.ownerId,
                    type: 'MAINTENANCE_COMPLETED',
                    title: 'Manutenção Concluída',
                    message: `A manutenção do veículo ${maintenance.vehicle.brand} ${maintenance.vehicle.model} (${maintenance.vehicle.licensePlate}) foi concluída${data.cost ? ` com custo de R$ ${data.cost.toFixed(2)}` : ''}.`,
                    data: {
                        maintenanceId: maintenance.id,
                        vehicleId: maintenance.vehicleId,
                        cost: data.cost,
                        completedDate: data.completedDate
                    },
                    category: 'maintenance',
                    channel: 'IN_APP'
                })
            } catch (error) {
                console.error('❌ Erro ao criar notificação de manutenção concluída:', error)
            }

            // Criar despesa automaticamente apenas se:
            // 1. A manutenção não tinha custo inicial E agora tem custo, OU
            // 2. O custo informado é diferente do custo original
            const shouldCreateExpense = data.cost && data.cost > 0 && (
                !currentMaintenance.cost || // Não tinha custo inicial
                currentMaintenance.cost !== data.cost // Custo diferente
            );

            if (shouldCreateExpense) {
                try {
                    // Primeiro, tentar encontrar uma despesa existente para esta manutenção
                    const existingExpenses = await expenseService.findByMaintenance(
                        maintenance.vehicleId,
                        maintenance.description
                    );

                    if (existingExpenses.length > 0) {
                        // Atualizar a despesa mais recente (primeira da lista)
                        const expenseToUpdate = existingExpenses[0];
                        await expenseService.update(expenseToUpdate.id, {
                            amount: data.cost,
                            date: data.completedDate || new Date()
                        });
                        console.log('✅ Despesa existente atualizada para manutenção concluída');
                    } else {
                        // Criar nova despesa se não encontrar nenhuma existente
                        await expenseService.create({
                            vehicleId: maintenance.vehicleId,
                            description: `Manutenção: ${maintenance.description}`,
                            category: 'MAINTENANCE',
                            amount: data.cost || 0,
                            date: data.completedDate || new Date()
                        });
                        console.log('✅ Nova despesa criada para manutenção concluída');
                    }
                } catch (error) {
                    console.error('❌ Erro ao criar/atualizar despesa da manutenção:', error)
                }
            } else if (data.cost && data.cost > 0) {
                console.log('ℹ️ Despesa não criada: manutenção já possui despesa com o mesmo valor')
            }
        }

        return maintenance
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
import { FastifyRequest, FastifyReply } from 'fastify';
import { PredictionService } from '../services/prediction.service';
import { BaseController } from './base.controller';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();
const predictionService = new PredictionService();

export class ReportController extends BaseController {
    // Obter resumo geral de relatórios
    async getSummaryReport(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id: userId } = request.user as any;
            const { vehicleId, period = 'last6months' } = request.query as any;

            const startDate = this.getStartDateForPeriod(period);
            const endDate = new Date();

            // Filtrar por veículo se especificado
            const whereClause: any = {
                vehicle: { ownerId: userId },
                date: {
                    gte: startDate,
                    lte: endDate
                }
            };

            if (vehicleId) {
                whereClause.vehicleId = vehicleId;
            }

            // Buscar dados em paralelo
            const [expenses, maintenances, vehicles] = await Promise.all([
                prisma.expense.findMany({
                    where: whereClause,
                    include: { vehicle: true }
                }),
                prisma.maintenance.findMany({
                    where: {
                        vehicle: { ownerId: userId },
                        ...(vehicleId ? { vehicleId } : {}),
                        OR: [
                            { scheduledDate: { gte: startDate, lte: endDate } },
                            { completedDate: { gte: startDate, lte: endDate } },
                            { createdAt: { gte: startDate, lte: endDate } }
                        ]
                    },
                    include: { vehicle: true }
                }),
                prisma.vehicle.findMany({
                    where: {
                        ownerId: userId,
                        ...(vehicleId ? { id: vehicleId } : {})
                    }
                })
            ]);

            const summary = {
                totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
                totalMaintenances: maintenances.length,
                completedMaintenances: maintenances.filter(m => m.status === 'COMPLETED').length,
                maintenanceCosts: maintenances
                    .filter(m => m.cost && m.cost > 0)
                    .reduce((sum, m) => sum + (m.cost || 0), 0),
                averageExpense: expenses.length > 0 ? expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length : 0,
                expensesByCategory: this.groupExpensesByCategory(expenses),
                maintenancesByType: this.groupMaintenancesByType(maintenances),
                maintenancesByStatus: this.groupMaintenancesByStatus(maintenances),
                vehicleCount: vehicles.length,
                period
            };

            return reply.send({
                success: true,
                data: summary
            });
        } catch (error) {
            return BaseController.handleError(reply, error, 'Erro ao obter resumo de relatórios');
        }
    }

    // Obter análise detalhada de manutenções
    async getMaintenanceAnalytics(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id: userId } = request.user as any;
            const { vehicleId, period = 'last6months' } = request.query as any;

            const startDate = this.getStartDateForPeriod(period);
            const endDate = new Date();

            const maintenances = await prisma.maintenance.findMany({
                where: {
                    vehicle: { ownerId: userId },
                    ...(vehicleId ? { vehicleId } : {}),
                    OR: [
                        { scheduledDate: { gte: startDate, lte: endDate } },
                        { completedDate: { gte: startDate, lte: endDate } },
                        { createdAt: { gte: startDate, lte: endDate } }
                    ]
                },
                include: { vehicle: true },
                orderBy: { createdAt: 'desc' }
            });

            const analytics = {
                totalMaintenances: maintenances.length,
                byType: this.groupMaintenancesByType(maintenances),
                byStatus: this.groupMaintenancesByStatus(maintenances),
                byCost: this.analyzeMaintenanceCosts(maintenances),
                byVehicle: this.groupMaintenancesByVehicle(maintenances),
                timeline: this.createMaintenanceTimeline(maintenances),
                period
            };

            return reply.send({
                success: true,
                data: analytics
            });
        } catch (error) {
            return BaseController.handleError(reply, error, 'Erro ao obter análise de manutenções');
        }
    }

    // Obter despesas por período
    async getExpensesByPeriod(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id: userId } = request.user as any;
            const { vehicleId, period = 'last6months' } = request.query as any;

            const startDate = this.getStartDateForPeriod(period);
            const endDate = new Date();

            const whereClause: any = {
                vehicle: { ownerId: userId },
                date: {
                    gte: startDate,
                    lte: endDate
                }
            };

            if (vehicleId) {
                whereClause.vehicleId = vehicleId;
            }

            const expenses = await prisma.expense.findMany({
                where: whereClause,
                include: { vehicle: true },
                orderBy: { date: 'desc' }
            });

            const analysis = {
                totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
                expenseCount: expenses.length,
                averageExpense: expenses.length > 0 ? expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length : 0,
                byCategory: this.groupExpensesByCategory(expenses),
                byMonth: this.groupExpensesByMonth(expenses),
                byVehicle: this.groupExpensesByVehicle(expenses),
                topExpenses: expenses.slice(0, 10),
                period
            };

            return reply.send({
                success: true,
                data: analysis
            });
        } catch (error) {
            return BaseController.handleError(reply, error, 'Erro ao obter despesas por período');
        }
    }

    // Gerar relatório de gastos
    async generateExpenseReport(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id: userId } = request.user as any;
            const { vehicleId, period = 'monthly', format = 'json' } = request.query as any;

            const startDate = this.getStartDateForPeriod(period);
            const endDate = new Date();

            // Buscar dados
            const where: any = {
                vehicle: { ownerId: userId },
                date: {
                    gte: startDate,
                    lte: endDate
                }
            };

            if (vehicleId) {
                where.vehicleId = vehicleId;
            }

            const expenses = await prisma.expense.findMany({
                where,
                include: {
                    vehicle: true
                },
                orderBy: { date: 'desc' }
            });

            // Processar dados
            const report = this.processExpenseData(expenses, period);

            if (format === 'pdf') {
                const pdfBuffer = await this.generateExpensePDF(report);
                reply.type('application/pdf');
                return reply.send(pdfBuffer);
            }

            return reply.send({
                success: true,
                data: report
            });
        } catch (error) {
            return BaseController.handleError(reply, error, 'Erro ao gerar relatório de gastos');
        }
    }

    // Gerar previsão manual
    async generatePrediction(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id: userId } = request.user as any;
            const { vehicleId, type } = request.body as any;

            // Verificar se o veículo pertence ao usuário
            const vehicle = await prisma.vehicle.findFirst({
                where: {
                    id: vehicleId,
                    ownerId: userId
                },
                include: {
                    expenses: {
                        orderBy: { date: 'desc' },
                        take: 30
                    },
                    maintenances: {
                        orderBy: { scheduledDate: 'desc' },
                        take: 10
                    }
                }
            });

            if (!vehicle) {
                return reply.status(404).send({
                    success: false,
                    message: 'Veículo não encontrado'
                });
            }

            let prediction;

            if (type === 'expense') {
                prediction = await predictionService.predictMonthlyExpenses(vehicle);
            } else if (type === 'maintenance') {
                prediction = await predictionService.predictNextMaintenance(vehicle);
            } else {
                return reply.status(400).send({
                    success: false,
                    message: 'Tipo de previsão inválido'
                });
            }

            if (prediction) {
                // Salvar previsão
                const savedPrediction = await prisma.prediction.create({
                    data: {
                        vehicleId,
                        type,
                        prediction: prediction as any,
                        confidence: 0.8
                    }
                });

                return reply.send({
                    success: true,
                    data: savedPrediction
                });
            } else {
                return reply.status(400).send({
                    success: false,
                    message: 'Dados insuficientes para gerar previsão'
                });
            }
        } catch (error) {
            return BaseController.handleError(reply, error, 'Erro ao gerar previsão');
        }
    }

    // Métodos auxiliares
    private getStartDateForPeriod(period: string): Date {
        const now = new Date();

        switch (period) {
            case 'weekly':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case 'monthly':
                return new Date(now.getFullYear(), now.getMonth(), 1);
            case 'yearly':
                return new Date(now.getFullYear(), 0, 1);
            default:
                return new Date(now.getFullYear(), now.getMonth(), 1);
        }
    }

    // Métodos auxiliares para agrupamento de dados
    private groupExpensesByCategory(expenses: any[]) {
        return expenses.reduce((acc, expense) => {
            const category = expense.category;
            if (!acc[category]) {
                acc[category] = { total: 0, count: 0 };
            }
            acc[category].total += expense.amount;
            acc[category].count += 1;
            return acc;
        }, {});
    }

    private groupMaintenancesByType(maintenances: any[]) {
        return maintenances.reduce((acc, maintenance) => {
            const type = maintenance.type || 'OTHER';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
    }

    private groupMaintenancesByStatus(maintenances: any[]) {
        return maintenances.reduce((acc, maintenance) => {
            const status = maintenance.status || 'SCHEDULED';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
    }

    private groupMaintenancesByVehicle(maintenances: any[]) {
        return maintenances.reduce((acc, maintenance) => {
            const vehicleKey = `${maintenance.vehicle.brand} ${maintenance.vehicle.model} - ${maintenance.vehicle.licensePlate}`;
            if (!acc[vehicleKey]) {
                acc[vehicleKey] = { count: 0, totalCost: 0 };
            }
            acc[vehicleKey].count += 1;
            acc[vehicleKey].totalCost += maintenance.cost || 0;
            return acc;
        }, {});
    }

    private groupExpensesByVehicle(expenses: any[]) {
        return expenses.reduce((acc, expense) => {
            const vehicleKey = `${expense.vehicle.brand} ${expense.vehicle.model} - ${expense.vehicle.licensePlate}`;
            if (!acc[vehicleKey]) {
                acc[vehicleKey] = { total: 0, count: 0 };
            }
            acc[vehicleKey].total += expense.amount;
            acc[vehicleKey].count += 1;
            return acc;
        }, {});
    }

    private groupExpensesByMonth(expenses: any[]) {
        return expenses.reduce((acc, expense) => {
            const monthYear = new Date(expense.date).toISOString().substring(0, 7); // YYYY-MM
            if (!acc[monthYear]) {
                acc[monthYear] = { total: 0, count: 0 };
            }
            acc[monthYear].total += expense.amount;
            acc[monthYear].count += 1;
            return acc;
        }, {});
    }

    private analyzeMaintenanceCosts(maintenances: any[]) {
        const withCost = maintenances.filter(m => m.cost && m.cost > 0);
        const totalCost = withCost.reduce((sum, m) => sum + m.cost, 0);

        return {
            totalCost,
            averageCost: withCost.length > 0 ? totalCost / withCost.length : 0,
            maintenancesWithCost: withCost.length,
            maintenancesWithoutCost: maintenances.length - withCost.length,
            highestCost: withCost.length > 0 ? Math.max(...withCost.map(m => m.cost)) : 0,
            lowestCost: withCost.length > 0 ? Math.min(...withCost.map(m => m.cost)) : 0
        };
    }

    private createMaintenanceTimeline(maintenances: any[]) {
        return maintenances.reduce((acc, maintenance) => {
            const date = maintenance.scheduledDate || maintenance.completedDate || maintenance.createdAt;
            const monthYear = new Date(date).toISOString().substring(0, 7); // YYYY-MM

            if (!acc[monthYear]) {
                acc[monthYear] = {
                    scheduled: 0,
                    completed: 0,
                    inProgress: 0,
                    total: 0
                };
            }

            acc[monthYear][maintenance.status.toLowerCase()] += 1;
            acc[monthYear].total += 1;
            return acc;
        }, {});
    }

    private processExpenseData(expenses: any[], period: string) {
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const averageExpense = totalExpenses / Math.max(1, expenses.length);

        return {
            summary: {
                totalExpenses,
                averageExpense,
                transactionCount: expenses.length,
                period
            },
            categoryBreakdown: this.groupExpensesByCategory(expenses),
            topExpenses: expenses.slice(0, 10)
        };
    }

    private async generateExpensePDF(reportData: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const buffers: Buffer[] = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(buffers);
                    resolve(pdfBuffer);
                });

                // Cabeçalho
                doc.fontSize(20).text('Relatório de Gastos', 50, 50);
                doc.fontSize(12).text(`Total: R$ ${reportData.summary.totalExpenses.toFixed(2)}`, 50, 80);

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }
} 
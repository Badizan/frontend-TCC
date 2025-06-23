import { FastifyRequest, FastifyReply } from 'fastify';
import { PredictionService } from '../services/prediction.service';
import { BaseController } from './base.controller';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();
const predictionService = new PredictionService();

export class ReportController extends BaseController {
    // Gerar relatório de gastos
    static async generateExpenseReport(request: FastifyRequest, reply: FastifyReply) {
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
            return this.handleError(reply, error, 'Erro ao gerar relatório de gastos');
        }
    }

    // Gerar previsão manual
    static async generatePrediction(request: FastifyRequest, reply: FastifyReply) {
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
                        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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
            return this.handleError(reply, error, 'Erro ao gerar previsão');
        }
    }

    // Métodos auxiliares
    private static getStartDateForPeriod(period: string): Date {
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

    private static processExpenseData(expenses: any[], period: string) {
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const averageExpense = totalExpenses / Math.max(1, expenses.length);

        // Agrupar por categoria
        const categoryBreakdown = expenses.reduce((categories, expense) => {
            const category = expense.category;
            if (!categories[category]) {
                categories[category] = { total: 0, count: 0 };
            }
            categories[category].total += expense.amount;
            categories[category].count += 1;
            return categories;
        }, {});

        return {
            summary: {
                totalExpenses,
                averageExpense,
                transactionCount: expenses.length,
                period
            },
            categoryBreakdown,
            topExpenses: expenses.slice(0, 10)
        };
    }

    private static async generateExpensePDF(reportData: any): Promise<Buffer> {
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
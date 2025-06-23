import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ExpensePrediction {
    predictedAmount: number;
    confidence: number;
    category: string;
    period: 'weekly' | 'monthly' | 'yearly';
    factors: string[];
}

interface MaintenancePrediction {
    nextMaintenanceDate: Date;
    predictedCost: number;
    confidence: number;
    recommendedServices: string[];
    factors: string[];
}

export class PredictionService {
    // Prever gastos mensais baseado no histórico
    async predictMonthlyExpenses(vehicle: any): Promise<ExpensePrediction | null> {
        try {
            if (!vehicle.expenses || vehicle.expenses.length < 3) {
                return null; // Dados insuficientes
            }

            const expenses = vehicle.expenses.slice(0, 12); // Últimos 12 registros
            const monthlyTotals: number[] = [];

            // Agrupar gastos por mês
            const expensesByMonth = this.groupExpensesByMonth(expenses);
            Object.values(expensesByMonth).forEach(monthExpenses => {
                const total = monthExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
                monthlyTotals.push(total);
            });

            if (monthlyTotals.length < 2) {
                return null;
            }

            // Calcular tendência usando regressão linear simples
            const trend = this.calculateLinearTrend(monthlyTotals);
            const average = monthlyTotals.reduce((sum, val) => sum + val, 0) / monthlyTotals.length;

            // Prever próximo mês considerando tendência
            const predictedAmount = average + trend;

            // Calcular confiança baseada na variação dos dados
            const variance = this.calculateVariance(monthlyTotals);
            const confidence = Math.max(0.1, Math.min(0.95, 1 - (variance / (average * average))));

            // Identificar categoria predominante
            const categoryStats = this.analyzeExpenseCategories(expenses);
            const mainCategory = Object.keys(categoryStats).reduce((a, b) =>
                categoryStats[a] > categoryStats[b] ? a : b
            );

            // Identificar fatores que influenciam os gastos
            const factors = this.identifyExpenseFactors(vehicle, expenses);

            return {
                predictedAmount: Math.max(0, predictedAmount),
                confidence,
                category: mainCategory,
                period: 'monthly',
                factors
            };

        } catch (error) {
            console.error('Erro ao prever gastos mensais:', error);
            return null;
        }
    }

    // Prever próxima manutenção
    async predictNextMaintenance(vehicle: any): Promise<MaintenancePrediction | null> {
        try {
            if (!vehicle.maintenances || vehicle.maintenances.length < 2) {
                return null;
            }

            const maintenances = vehicle.maintenances
                .filter((m: any) => m.status === 'COMPLETED')
                .sort((a: any, b: any) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime());

            if (maintenances.length < 2) {
                return null;
            }

            // Calcular intervalo médio entre manutenções
            const intervals: number[] = [];
            for (let i = 0; i < maintenances.length - 1; i++) {
                const current = new Date(maintenances[i].completedDate);
                const previous = new Date(maintenances[i + 1].completedDate);
                const daysDiff = Math.abs((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
                intervals.push(daysDiff);
            }

            const averageInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;

            // Prever próxima data
            const lastMaintenance = new Date(maintenances[0].completedDate);
            const nextMaintenanceDate = new Date(lastMaintenance.getTime() + averageInterval * 24 * 60 * 60 * 1000);

            // Prever custo baseado no histórico
            const costs = maintenances.filter((m: any) => m.cost).map((m: any) => m.cost);
            const averageCost = costs.length > 0 ?
                costs.reduce((sum: number, cost: number) => sum + cost, 0) / costs.length : 0;

            // Ajustar custo baseado na idade do veículo
            const currentYear = new Date().getFullYear();
            const vehicleAge = currentYear - vehicle.year;
            const ageFactor = 1 + (vehicleAge * 0.05); // 5% a mais por ano
            const predictedCost = averageCost * ageFactor;

            // Calcular confiança
            const costVariance = costs.length > 1 ? this.calculateVariance(costs) : 0;
            const intervalVariance = intervals.length > 1 ? this.calculateVariance(intervals) : 0;
            const confidence = Math.max(0.1, Math.min(0.9, 1 - ((costVariance + intervalVariance) / 10000)));

            // Recomendar serviços baseado no histórico
            const recommendedServices = this.recommendMaintenanceServices(vehicle, maintenances);

            // Identificar fatores
            const factors = this.identifyMaintenanceFactors(vehicle, maintenances);

            return {
                nextMaintenanceDate,
                predictedCost,
                confidence,
                recommendedServices,
                factors
            };

        } catch (error) {
            console.error('Erro ao prever próxima manutenção:', error);
            return null;
        }
    }

    // Gerar relatório semanal
    async generateWeeklyReport(user: any) {
        try {
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            const report = {
                userId: user.id,
                period: { start: weekAgo, end: now },
                summary: {
                    totalVehicles: user.vehicles.length,
                    totalExpenses: 0,
                    totalMaintenances: 0,
                    averageExpensePerVehicle: 0
                },
                vehicles: [] as any[],
                insights: [] as string[],
                recommendations: [] as string[]
            };

            // Analisar cada veículo
            for (const vehicle of user.vehicles) {
                const weekExpenses = vehicle.expenses.filter((e: any) =>
                    new Date(e.date) >= weekAgo && new Date(e.date) <= now
                );

                const weekMaintenances = vehicle.maintenances.filter((m: any) =>
                    new Date(m.scheduledDate) >= weekAgo && new Date(m.scheduledDate) <= now
                );

                const vehicleExpenseTotal = weekExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);

                report.summary.totalExpenses += vehicleExpenseTotal;
                report.summary.totalMaintenances += weekMaintenances.length;

                report.vehicles.push({
                    id: vehicle.id,
                    name: `${vehicle.brand} ${vehicle.model}`,
                    weekExpenses: vehicleExpenseTotal,
                    maintenanceCount: weekMaintenances.length,
                    status: this.getVehicleStatus(vehicle)
                });
            }

            report.summary.averageExpensePerVehicle =
                report.summary.totalExpenses / Math.max(1, user.vehicles.length);

            // Gerar insights
            report.insights = this.generateInsights(report);

            // Gerar recomendações
            report.recommendations = this.generateRecommendations(user, report);

            return report;

        } catch (error) {
            console.error('Erro ao gerar relatório semanal:', error);
            return null;
        }
    }

    // Métodos auxiliares
    private groupExpensesByMonth(expenses: any[]) {
        return expenses.reduce((groups, expense) => {
            const month = new Date(expense.date).toISOString().substring(0, 7); // YYYY-MM
            if (!groups[month]) groups[month] = [];
            groups[month].push(expense);
            return groups;
        }, {});
    }

    private calculateLinearTrend(values: number[]): number {
        const n = values.length;
        const sumX = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, index) => sum + val * index, 0);
        const sumX2 = values.reduce((sum, _, index) => sum + index * index, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope || 0;
    }

    private calculateVariance(values: number[]): number {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return variance;
    }

    private analyzeExpenseCategories(expenses: any[]) {
        return expenses.reduce((categories, expense) => {
            categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
            return categories;
        }, {});
    }

    private identifyExpenseFactors(vehicle: any, expenses: any[]): string[] {
        const factors: string[] = [];

        // Fator idade do veículo
        const currentYear = new Date().getFullYear();
        const age = currentYear - vehicle.year;
        if (age > 10) factors.push('Veículo antigo (>10 anos)');
        if (age > 5) factors.push('Veículo com idade média');

        // Fator quilometragem
        if (vehicle.mileage > 100000) factors.push('Alta quilometragem');

        // Fator frequência de gastos
        const recentExpenses = expenses.filter(e =>
            new Date(e.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
        if (recentExpenses.length > 5) factors.push('Gastos frequentes');

        return factors;
    }

    private identifyMaintenanceFactors(vehicle: any, maintenances: any[]): string[] {
        const factors: string[] = [];

        const currentYear = new Date().getFullYear();
        const age = currentYear - vehicle.year;

        if (age > 10) factors.push('Veículo requer manutenção mais frequente');
        if (vehicle.mileage > 150000) factors.push('Alta quilometragem exige mais cuidados');

        const preventiveCount = maintenances.filter(m => m.type === 'PREVENTIVE').length;
        const correctiveCount = maintenances.filter(m => m.type === 'CORRECTIVE').length;

        if (correctiveCount > preventiveCount) {
            factors.push('Padrão de manutenção corretiva');
        } else {
            factors.push('Boa manutenção preventiva');
        }

        return factors;
    }

    private recommendMaintenanceServices(vehicle: any, maintenances: any[]): string[] {
        const services: string[] = [];
        const currentYear = new Date().getFullYear();
        const age = currentYear - vehicle.year;

        // Recomendações baseadas na idade
        if (age > 5) {
            services.push('Verificação do sistema de freios');
            services.push('Troca de filtros');
        }

        if (age > 10) {
            services.push('Revisão do sistema elétrico');
            services.push('Verificação da suspensão');
        }

        // Recomendações baseadas na quilometragem
        if (vehicle.mileage > 50000) {
            services.push('Troca de óleo e filtros');
        }

        if (vehicle.mileage > 100000) {
            services.push('Revisão da embreagem');
            services.push('Verificação do motor');
        }

        return services.slice(0, 5); // Máximo 5 recomendações
    }

    private getVehicleStatus(vehicle: any): string {
        const now = new Date();
        const pendingMaintenances = vehicle.maintenances.filter((m: any) =>
            m.status === 'SCHEDULED' && new Date(m.scheduledDate) <= now
        );

        if (pendingMaintenances.length > 0) return 'Manutenção pendente';

        const recentExpenses = vehicle.expenses.filter((e: any) =>
            new Date(e.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );

        if (recentExpenses.length > 3) return 'Gastos altos';

        return 'Normal';
    }

    private generateInsights(report: any): string[] {
        const insights: string[] = [];

        if (report.summary.totalExpenses > 1000) {
            insights.push('Gastos semanais acima da média');
        }

        if (report.summary.totalMaintenances === 0) {
            insights.push('Nenhuma manutenção programada esta semana');
        }

        const highExpenseVehicles = report.vehicles.filter((v: any) => v.weekExpenses > 500);
        if (highExpenseVehicles.length > 0) {
            insights.push(`${highExpenseVehicles.length} veículo(s) com gastos elevados`);
        }

        return insights;
    }

    private generateRecommendations(user: any, report: any): string[] {
        const recommendations: string[] = [];

        if (report.summary.averageExpensePerVehicle > 300) {
            recommendations.push('Considere revisar os gastos e buscar economia');
        }

        if (report.summary.totalMaintenances === 0) {
            recommendations.push('Programe manutenções preventivas');
        }

        const oldVehicles = user.vehicles.filter((v: any) =>
            new Date().getFullYear() - v.year > 10
        );

        if (oldVehicles.length > 0) {
            recommendations.push('Veículos antigos podem necessitar mais atenção');
        }

        return recommendations;
    }
} 
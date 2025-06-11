import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calculator } from 'lucide-react';
import { VehicleStats } from '../../types';

interface FinancialSummaryProps {
  stats: VehicleStats;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ stats }) => {
  const calculateMonthlyAverage = () => {
    const totalMonths = stats.monthlyExpenses.length;
    const totalAmount = stats.monthlyExpenses.reduce((sum, month) => sum + month.amount, 0);
    return totalAmount / totalMonths;
  };

  const getExpenseTrend = () => {
    if (stats.monthlyExpenses.length < 2) return null;
    
    const currentMonth = stats.monthlyExpenses[stats.monthlyExpenses.length - 1].amount;
    const previousMonth = stats.monthlyExpenses[stats.monthlyExpenses.length - 2].amount;
    
    const percentChange = ((currentMonth - previousMonth) / previousMonth) * 100;
    return {
      value: Math.abs(percentChange),
      isIncrease: percentChange > 0
    };
  };

  const monthlyAverage = calculateMonthlyAverage();
  const trend = getExpenseTrend();

  const categoryColors = {
    maintenance: 'bg-blue-100 text-blue-800',
    fuel: 'bg-green-100 text-green-800',
    insurance: 'bg-purple-100 text-purple-800',
    tax: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800'
  };

  const categoryNames = {
    maintenance: 'Manutenção',
    fuel: 'Combustível',
    insurance: 'Seguro',
    tax: 'Impostos/Taxas',
    other: 'Outros'
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-800">Gasto Total</p>
              <p className="text-2xl font-bold text-primary-900">
                R$ {stats.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-secondary-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-800">Média Mensal</p>
              <p className="text-2xl font-bold text-secondary-900">
                R$ {monthlyAverage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Calculator className="w-8 h-8 text-secondary-600" />
          </div>
        </div>

        <div className="bg-accent-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-accent-800">Último Mês</p>
              <p className="text-2xl font-bold text-accent-900">
                R$ {stats.lastMonthExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              {trend && (
                <div className="flex items-center mt-1">
                  {trend.isIncrease ? (
                    <TrendingUp className="w-4 h-4 text-error-600 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-success-600 mr-1" />
                  )}
                  <span className={`text-xs font-medium ${
                    trend.isIncrease ? 'text-error-600' : 'text-success-600'
                  }`}>
                    {trend.value.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              trend?.isIncrease ? 'text-error-600' : 'text-success-600'
            }`}>
              {trend?.isIncrease ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Gastos por Categoria</h4>
        <div className="space-y-3">
          {Object.entries(stats.expensesByCategory).map(([category, amount]) => {
            const percentage = (amount / stats.totalExpenses) * 100;
            return (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    categoryColors[category as keyof typeof categoryColors]
                  }`}>
                    {categoryNames[category as keyof typeof categoryNames]}
                  </span>
                  <div className="ml-3 flex-1">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;
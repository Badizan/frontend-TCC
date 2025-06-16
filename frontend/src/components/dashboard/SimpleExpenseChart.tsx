import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface ExpenseData {
  month: string;
  amount: number;
}

interface SimpleExpenseChartProps {
  data: ExpenseData[];
}

const SimpleExpenseChart: React.FC<SimpleExpenseChartProps> = ({ data }) => {
  // Se não há dados, mostrar estado vazio
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <DollarSign className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-1">
            Nenhuma despesa registrada
          </p>
          <p className="text-sm text-gray-600">
            Adicione algumas despesas para ver o gráfico
          </p>
        </div>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map(item => item.amount));
  const previousMonth = data.length > 1 ? data[data.length - 2].amount : 0;
  const currentMonth = data[data.length - 1].amount;
  const trend = currentMonth > previousMonth;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <div className="h-64">
      {/* Resumo do mês atual */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Gastos deste mês</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentMonth)}
            </p>
          </div>
          {data.length > 1 && (
            <div className={`flex items-center space-x-1 ${
              trend ? 'text-red-600' : 'text-green-600'
            }`}>
              {trend ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(((currentMonth - previousMonth) / previousMonth) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de barras simples */}
      <div className="flex items-end space-x-2 h-40">
        {data.slice(-6).map((item, index) => {
          const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-500 rounded-t-md transition-all duration-300 hover:bg-blue-600 relative group"
                style={{ height: `${Math.max(height, 2)}%` }}
              >
                {/* Tooltip no hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {formatCurrency(item.amount)}
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">
                {item.month.slice(0, 3)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Últimos {Math.min(data.length, 6)} meses de gastos
        </p>
      </div>
    </div>
  );
};

export default SimpleExpenseChart; 
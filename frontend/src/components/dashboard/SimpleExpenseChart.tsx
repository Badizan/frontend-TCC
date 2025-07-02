import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface ExpenseData {
  month: string;
  amount: number;
}

interface SimpleExpenseChartProps {
  data: ExpenseData[];
}

const SimpleExpenseChart: React.FC<SimpleExpenseChartProps> = ({ data }) => {
  console.log('📊 SimpleExpenseChart: Dados recebidos:', data);

  // Se não há dados, mostrar estado vazio
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-1">
            Nenhuma despesa registrada
          </p>
          <p className="text-sm text-gray-600">
            Adicione algumas despesas para ver o gráfico dos últimos 6 meses
          </p>
        </div>
      </div>
    );
  }

  // Verificar se todos os valores são zero
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  
  if (totalAmount === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <DollarSign className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-1">
            Nenhum gasto nos últimos meses
          </p>
          <p className="text-sm text-gray-600">
            Comece a registrar suas despesas para ver a evolução
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

  const formatMonth = (month: string) => {
    // Capitalizar primeira letra
    return month.charAt(0).toUpperCase() + month.slice(1);
  };

  return (
    <div className="h-64">
      {/* Resumo do mês atual */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-600 font-medium">Gastos deste mês</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentMonth)}
            </p>
          </div>
          {data.length > 1 && previousMonth > 0 && (
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

      {/* Gráfico de barras */}
      <div className="flex items-end space-x-2 h-32 bg-gray-50 rounded-lg p-3">
        {data.map((item, index) => {
          const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
          const hasValue = item.amount > 0;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full rounded-t-md transition-all duration-300 relative group ${
                  hasValue 
                    ? 'bg-gradient-to-t from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500' 
                    : 'bg-gray-200'
                }`}
                style={{ height: `${Math.max(height, hasValue ? 8 : 2)}%` }}
              >
                {/* Tooltip no hover */}
                {hasValue && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {formatCurrency(item.amount)}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center font-medium">
                {formatMonth(item.month)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <p>
          Últimos {data.length} meses • Total: {formatCurrency(totalAmount)}
        </p>
        <p>
          Média: {formatCurrency(totalAmount / data.length)}
        </p>
      </div>
    </div>
  );
};

export default SimpleExpenseChart; 
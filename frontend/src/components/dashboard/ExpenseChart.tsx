import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Expense } from '../../services/expense.service';

interface ExpenseChartProps {
  expenses: Expense[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses }) => {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'fuel':
        return 'Combustível';
      case 'maintenance':
        return 'Manutenção';
      case 'insurance':
        return 'Seguro';
      case 'tax':
        return 'Imposto';
      default:
        return type;
    }
  };

  const data = expenses.reduce((acc: any[], expense) => {
    const month = format(new Date(expense.date), 'MMM yyyy', { locale: ptBR });
    const type = getTypeLabel(expense.type);
    
    const existingMonth = acc.find(item => item.month === month);
    if (existingMonth) {
      existingMonth[type] = (existingMonth[type] || 0) + expense.amount;
    } else {
      acc.push({
        month,
        [type]: expense.amount
      });
    }
    
    return acc;
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Despesas por Tipo</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
              labelFormatter={(label) => `Mês: ${label}`}
            />
            <Bar dataKey="Combustível" fill="#3B82F6" />
            <Bar dataKey="Manutenção" fill="#F59E0B" />
            <Bar dataKey="Seguro" fill="#10B981" />
            <Bar dataKey="Imposto" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseChart;
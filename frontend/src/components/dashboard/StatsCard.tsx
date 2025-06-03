import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  period?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  period
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="p-2 bg-blue-50 rounded-xl">
          {icon}
        </div>
      </div>
      
      <div className="flex items-baseline">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <span className={`ml-2 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>

      {period && (
        <p className="mt-1 text-sm text-gray-500">
          {period}
        </p>
      )}
    </div>
  );
};

export default StatsCard; 
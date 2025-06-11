import React, { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  trend,
  colorClass = 'bg-primary-50 text-primary-700',
}) => {
  return (
    <div className="card animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
          {trend && (
            <div className="mt-2 flex items-center">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? 'text-success-700' : 'text-error-700'
                }`}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs. mês anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>{icon}</div>
      </div>
    </div>
  );
};

export default DashboardCard;
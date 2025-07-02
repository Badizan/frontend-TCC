import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface MaintenanceChartProps {
  data: Record<string, number>;
  type: 'pie' | 'bar';
  title?: string;
}

const COLORS = {
  PREVENTIVE: '#10B981', // green
  CORRECTIVE: '#EF4444', // red
  INSPECTION: '#3B82F6', // blue
  ROUTINE: '#F59E0B', // yellow
  OTHER: '#6B7280' // gray
};

const STATUS_COLORS = {
  SCHEDULED: '#3B82F6', // blue
  IN_PROGRESS: '#F59E0B', // yellow
  COMPLETED: '#10B981', // green
  CANCELLED: '#EF4444' // red
};

export const MaintenanceChart: React.FC<MaintenanceChartProps> = ({ data, type, title }) => {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: formatLabel(key),
    value,
    key
  }));

  const getColor = (key: string) => {
    return COLORS[key as keyof typeof COLORS] || STATUS_COLORS[key as keyof typeof STATUS_COLORS] || '#6B7280';
  };

  function formatLabel(key: string) {
    const labels: Record<string, string> = {
      PREVENTIVE: 'Preventiva',
      CORRECTIVE: 'Corretiva',
      INSPECTION: 'Inspeção',
      ROUTINE: 'Rotina',
      OTHER: 'Outros',
      SCHEDULED: 'Agendada',
      IN_PROGRESS: 'Em Andamento',
      COMPLETED: 'Concluída',
      CANCELLED: 'Cancelada'
    };
    return labels[key] || key;
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Nenhum dado disponível</p>
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div className="h-80">
        {title && <h4 className="text-center mb-4 font-medium">{title}</h4>}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={false}
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.key)} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [value, name]} 
              labelFormatter={() => 'Quantidade'}
            />
            <Legend 
              verticalAlign="bottom" 
              height={60}
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value, entry) => `${value}: ${entry.payload.value}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-80">
      {title && <h4 className="text-center mb-4 font-medium">{title}</h4>}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 80,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            fontSize={12}
          />
          <YAxis />
          <Tooltip formatter={(value, name) => [value, name]} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ paddingTop: '10px' }}
          />
          <Bar dataKey="value" name="Quantidade">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.key)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}; 
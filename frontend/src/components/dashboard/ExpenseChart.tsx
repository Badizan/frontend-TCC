import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

interface ExpenseData {
  month: string;
  amount: number;
}

interface ExpenseChartProps {
  data: ExpenseData[];
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    console.log('📊 ExpenseChart: Dados recebidos:', data);
    
    // Add safety checks for data
    const safeData = data || [];
    console.log('📊 ExpenseChart: Dados seguros:', safeData);
    
    const validData = safeData.filter(item => {
      const isValid = item && item.month && typeof item.amount === 'number';
      if (!isValid) {
        console.warn('📊 ExpenseChart: Item inválido:', item);
      }
      return isValid;
    });
    
    console.log('📊 ExpenseChart: Dados válidos:', validData);
    
    const newChartData = {
      labels: validData.map((item) => item.month),
      datasets: [
        {
          label: 'Gastos (R$)',
          data: validData.map((item) => item.amount),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
    
    console.log('📊 ExpenseChart: Chart data gerado:', newChartData);
    setChartData(newChartData);
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 10,
        right: 10
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
          },
          font: {
            size: 11
          }
        },
      },
    },
  };

  // Show empty state if no valid data
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">📊 Nenhum dado de despesa disponível</p>
          <p className="text-sm">Crie algumas despesas via manutenções para ver o gráfico</p>
        </div>
      </div>
    );
  }

  // Check if all amounts are zero
  const hasNonZeroData = chartData.datasets[0]?.data?.some((amount: number) => amount > 0);
  if (!hasNonZeroData) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">📈 Sem gastos registrados</p>
          <p className="text-sm">Agende manutenções com custo para gerar dados no gráfico</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
};

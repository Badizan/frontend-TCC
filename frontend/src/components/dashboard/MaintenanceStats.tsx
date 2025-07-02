import React from 'react';
import { MaintenanceService } from '../../types';
import { Wrench, Clock, DollarSign, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

interface MaintenanceStatsProps {
  services: MaintenanceService[];
}

export const MaintenanceStats: React.FC<MaintenanceStatsProps> = ({ services }) => {
  // Calcular estatísticas
  const totalServices = services.length;
  const completedServices = services.filter(s => s.status === 'COMPLETED').length;
  const scheduledServices = services.filter(s => s.status === 'SCHEDULED').length;
  const inProgressServices = services.filter(s => s.status === 'IN_PROGRESS').length;
  
  const totalCost = services
    .filter(s => s.cost && s.status === 'COMPLETED')
    .reduce((sum, s) => sum + (s.cost || 0), 0);
  
  const averageCost = completedServices > 0 ? totalCost / completedServices : 0;
  
  // Próximas manutenções (agendadas nos próximos 30 dias)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const upcomingServices = services.filter(s => {
    if (s.status !== 'SCHEDULED') return false;
    const serviceDate = new Date(s.scheduledDate);
    return serviceDate >= new Date() && serviceDate <= thirtyDaysFromNow;
  }).length;

  // Distribuição por tipo
  const preventiveCount = services.filter(s => s.type === 'PREVENTIVE').length;
  const correctiveCount = services.filter(s => s.type === 'CORRECTIVE').length;
  const inspectionCount = services.filter(s => s.type === 'INSPECTION').length;

  const statsData = [
    {
      title: 'Total de Manutenções',
      value: totalServices,
      icon: Wrench,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: null
    },
    {
      title: 'Concluídas',
      value: completedServices,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: totalServices > 0 ? `${Math.round((completedServices / totalServices) * 100)}%` : null
    },
    {
      title: 'Agendadas',
      value: scheduledServices,
      icon: Calendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: null
    },
    {
      title: 'Em Andamento',
      value: inProgressServices,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: null
    },
    {
      title: 'Próximas 30 dias',
      value: upcomingServices,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: null
    },
    {
      title: 'Custo Médio',
      value: `R$ ${averageCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.bgColor} rounded-lg p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.title}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    {stat.change && (
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stat.change}
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Distribuição por tipo */}
      {totalServices > 0 && (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Tipo</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Preventiva</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{preventiveCount}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(preventiveCount / totalServices) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-10 text-right">
                  {Math.round((preventiveCount / totalServices) * 100)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Corretiva</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{correctiveCount}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(correctiveCount / totalServices) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-10 text-right">
                  {Math.round((correctiveCount / totalServices) * 100)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Inspeção</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{inspectionCount}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(inspectionCount / totalServices) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-10 text-right">
                  {Math.round((inspectionCount / totalServices) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumo de custos */}
      {totalCost > 0 && (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo Financeiro</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">Custo Total</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                R$ {averageCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">Custo Médio</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {completedServices}
              </div>
              <div className="text-sm text-gray-500">Manutenções Pagas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
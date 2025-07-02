import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { Wrench, Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { MaintenanceService } from '../../types';
import { parseLocalDate, formatDate } from '../../utils/formatters';

const RecentMaintenances: React.FC = () => {
  const navigate = useNavigate();
  const { maintenanceServices } = useAppStore();

  // Pegar as últimas 5 manutenções, ordenadas por data
  const recentMaintenances = maintenanceServices
    .sort((a, b) => parseLocalDate(b.createdAt.toString()).getTime() - parseLocalDate(a.createdAt.toString()).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />;
      case 'SCHEDULED':
        return <Calendar className="h-4 w-4" />;
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Wrench className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Concluída';
      case 'IN_PROGRESS':
        return 'Em Andamento';
      case 'SCHEDULED':
        return 'Agendada';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const formatDateString = (dateString: string | Date): string => {
    return formatDate(dateString);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Wrench className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Manutenções Recentes
            </h3>
            <p className="text-sm text-gray-600">
              Últimas atividades de manutenção
            </p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/maintenance')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Ver todas
        </button>
      </div>

      {recentMaintenances.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-gray-50 rounded-full p-3 w-16 h-16 mx-auto mb-4">
            <Wrench className="h-10 w-10 text-gray-400" />
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            Nenhuma manutenção registrada
          </h4>
          <p className="text-sm text-gray-600">
            Comece adicionando sua primeira manutenção
          </p>
          <button 
            onClick={() => navigate('/maintenance')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Adicionar Manutenção
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {recentMaintenances.map((maintenance) => (
            <div 
              key={maintenance.id} 
              className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => navigate(`/maintenance`)} // Note: pode ser melhorado para navegar para detalhes específicos
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {maintenance.type || 'Manutenção'}
                    </h4>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(maintenance.status)}`}>
                      {getStatusIcon(maintenance.status)}
                      <span>{getStatusText(maintenance.status)}</span>
                    </span>
                  </div>
                  
                  {maintenance.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {maintenance.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {maintenance.scheduledDate 
                          ? formatDateString(maintenance.scheduledDate)
                          : formatDateString(maintenance.createdAt)
                        }
                      </span>
                    </div>
                    
                    {maintenance.cost && (
                      <div className="flex items-center space-x-1">
                        <span>•</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(maintenance.cost)}
                        </span>
                      </div>
                    )}
                    
                    {maintenance.mileage && (
                      <div className="flex items-center space-x-1">
                        <span>•</span>
                        <span>{maintenance.mileage?.toLocaleString() || '-'} km</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentMaintenances; 
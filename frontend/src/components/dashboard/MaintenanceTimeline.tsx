import React, { useState } from 'react';
import { MaintenanceService } from '../../types';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Wrench, ChevronDown, ChevronUp, Eye, Calendar, DollarSign, User, CheckCircle, Trash2, Edit } from 'lucide-react';
import { parseLocalDate, formatDate } from '../../utils/formatters';

interface MaintenanceTimelineProps {
  services: MaintenanceService[];
  onComplete?: (service: MaintenanceService) => void;
  onDelete?: (service: MaintenanceService) => void;
}

export const MaintenanceTimeline: React.FC<MaintenanceTimelineProps> = ({ services, onComplete, onDelete }) => {
  const [showAll, setShowAll] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (serviceId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId);
    } else {
      newExpanded.add(serviceId);
    }
    setExpandedItems(newExpanded);
  };

  const formatMaintenanceType = (type: string) => {
    switch (type) {
      case 'PREVENTIVE': return 'Preventiva';
      case 'CORRECTIVE': return 'Corretiva';
      case 'INSPECTION': return 'Inspeção';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PREVENTIVE': return 'bg-blue-100 text-blue-700';
      case 'CORRECTIVE': return 'bg-red-100 text-red-700';
      case 'INSPECTION': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDateSafe = (dateStr: string | Date | null | undefined, formatString: string = 'dd MMM yyyy'): string => {
    if (!dateStr) return 'Data não definida';
    
    try {
      const date = parseLocalDate(dateStr.toString());
      if (!isValid(date)) return 'Data inválida';
      return format(date, formatString, { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatTimeOnly = (dateStr: string | Date | null | undefined): string => {
    if (!dateStr) return '';
    
    try {
      const date = parseLocalDate(dateStr.toString());
      if (!isValid(date)) return '';
      return format(date, 'HH:mm');
    } catch (error) {
      return '';
    }
  };

  // Filtrar apenas serviços válidos
  const validServices = services.filter(service => {
    if (!service || typeof service !== 'object') return false;
    if (!service.id) return false;
    return true;
  });

  // Ordenar por data (mais recente primeiro)
  const sortedServices = validServices.sort((a, b) => {
    const dateA = parseLocalDate((a.scheduledDate || a.completedDate || a.createdAt)?.toString() || '');
    const dateB = parseLocalDate((b.scheduledDate || b.completedDate || b.createdAt)?.toString() || '');
    return dateB.getTime() - dateA.getTime();
  });

  const servicesToShow = showAll ? sortedServices : sortedServices.slice(0, 5);

  if (validServices.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
          <Wrench className="w-full h-full" />
        </div>
        <p className="text-gray-500">Nenhuma manutenção registrada.</p>
        <p className="text-sm text-gray-400 mt-1">
          Registre as manutenções para acompanhar o histórico.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com estatísticas */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="flex items-center space-x-6">
          <div>
            <span className="text-2xl font-semibold text-gray-900">{validServices.length}</span>
            <p className="text-sm text-gray-500">Total de manutenções</p>
          </div>
          <div>
            <span className="text-2xl font-semibold text-green-600">
              {validServices.filter(s => s.status === 'COMPLETED').length}
            </span>
            <p className="text-sm text-gray-500">Concluídas</p>
          </div>
          <div>
            <span className="text-2xl font-semibold text-blue-600">
              {validServices.filter(s => s.status === 'SCHEDULED').length}
            </span>
            <p className="text-sm text-gray-500">Agendadas</p>
          </div>
        </div>
        
        {validServices.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>{showAll ? 'Ver menos' : `Ver todas (${validServices.length})`}</span>
            {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Lista de manutenções */}
      <div className="space-y-4">
        {servicesToShow.map((service, index) => {
          // Garantir que todas as propriedades necessárias existem
          const safeService = {
            id: service.id || `service-${index}`,
            description: service.description || 'Sem descrição',
            type: service.type || 'PREVENTIVE',
            notes: service.notes || '',
            cost: service.cost || 0,
            date: service.scheduledDate || service.completedDate || service.createdAt || new Date(),
            status: service.status || 'SCHEDULED',
            mechanic: service.mechanic || null,
            vehicle: service.vehicle || null
          };

          const isExpanded = expandedItems.has(safeService.id);

          return (
            <div key={safeService.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getTypeColor(safeService.type)} flex items-center justify-center`}>
                      <Wrench className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {safeService.description}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(safeService.type)}`}>
                          {formatMaintenanceType(safeService.type)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDateSafe(safeService.date)}
                        </div>
                        
                        {safeService.cost > 0 && (
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            R$ {safeService.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        )}
                        
                        {safeService.mechanic && (
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {safeService.mechanic.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        safeService.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        safeService.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                        safeService.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {safeService.status === 'COMPLETED' ? 'Concluída' : 
                         safeService.status === 'IN_PROGRESS' ? 'Em andamento' : 
                         safeService.status === 'CANCELLED' ? 'Cancelada' : 'Agendada'}
                      </span>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center space-x-1">
                      {safeService.status !== 'COMPLETED' && safeService.status !== 'CANCELLED' && onComplete && (
                        <button
                          onClick={() => onComplete(service)}
                          className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                          title="Marcar como concluída"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {onDelete && (
                        <button
                          onClick={() => onDelete(service)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Excluir manutenção"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {(safeService.notes || safeService.vehicle) && (
                      <button
                        onClick={() => toggleExpanded(safeService.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    {safeService.vehicle && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Veículo: </span>
                        <span className="text-sm text-gray-600">
                          {safeService.vehicle.brand} {safeService.vehicle.model} - {safeService.vehicle.licensePlate}
                        </span>
                      </div>
                    )}
                    
                    {safeService.notes && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Observações: </span>
                        <p className="text-sm text-gray-600 mt-1">{safeService.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

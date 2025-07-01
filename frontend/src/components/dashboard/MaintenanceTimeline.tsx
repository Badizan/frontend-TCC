import React from 'react';
import { MaintenanceService } from '../../types';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Wrench } from 'lucide-react';

interface MaintenanceTimelineProps {
  services: MaintenanceService[];
}

export const MaintenanceTimeline: React.FC<MaintenanceTimelineProps> = ({ services }) => {
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

  const formatServiceDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return 'Data não informada';
    
    try {
      const date = new Date(dateStr);
      if (!isValid(date) || isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return format(date, 'dd MMM yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', error, dateStr);
      return 'Data inválida';
    }
  };

  const getValidDateTimeString = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      if (!isValid(date) || isNaN(date.getTime())) {
        return '';
      }
      return date.toISOString();
    } catch (error) {
      console.error('Error converting to ISO string:', error, dateStr);
      return '';
    }
  };

  // Filtrar apenas serviços válidos
  const validServices = services.filter(service => {
    if (!service || typeof service !== 'object') return false;
    if (!service.id) return false;
    return true;
  });

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
    <div className="flow-root">
      <ul className="-mb-8">
        {validServices.slice(0, 5).map((service, index) => {
          // Garantir que todas as propriedades necessárias existem
          const safeService = {
            id: service.id || `service-${index}`,
            description: service.description || 'Sem descrição',
            type: service.type || 'PREVENTIVE',
            notes: service.notes || '',
            cost: service.cost || 0,
            date: service.scheduledDate || service.completedDate || service.createdAt || new Date(),
            status: service.status || 'SCHEDULED',
            mechanic: service.mechanic || null
          };

          return (
            <li key={safeService.id}>
              <div className="relative pb-8">
                {index !== validServices.slice(0, 5).length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  ></span>
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full ${getTypeColor(safeService.type)} flex items-center justify-center ring-8 ring-white`}>
                      <Wrench className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-800 font-medium">
                        {safeService.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(safeService.type)} mr-2`}>
                          {formatMaintenanceType(safeService.type)}
                        </span>
                        {safeService.mechanic && `${safeService.mechanic.name} • `}
                        Status: {safeService.status === 'COMPLETED' ? 'Concluída' : 
                                safeService.status === 'IN_PROGRESS' ? 'Em andamento' : 
                                safeService.status === 'CANCELLED' ? 'Cancelada' : 'Agendada'}
                      </p>
                      {safeService.notes && (
                        <p className="text-xs text-gray-400 mt-1 italic">
                          {safeService.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      {safeService.cost > 0 && (
                        <div className="font-medium text-blue-600">
                          R$ {safeService.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                      <time dateTime={getValidDateTimeString(safeService.date)}>
                        {formatServiceDate(safeService.date)}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      
      {validServices.length > 5 && (
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500">
            E mais {validServices.length - 5} manutenç{validServices.length - 5 === 1 ? 'ão' : 'ões'}...
          </p>
        </div>
      )}
    </div>
  );
};

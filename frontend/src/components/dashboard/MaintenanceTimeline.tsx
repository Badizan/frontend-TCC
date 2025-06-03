import React from 'react';
import { MaintenanceService } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MaintenanceTimelineProps {
  services: MaintenanceService[];
}

const MaintenanceTimeline: React.FC<MaintenanceTimelineProps> = ({ services }) => {
  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum serviço de manutenção registrado.</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {services.slice(0, 5).map((service, index) => (
          <li key={service.id}>
            <div className="relative pb-8">
              {index !== services.slice(0, 5).length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                ></span>
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center ring-8 ring-white">
                    <span className="text-primary-700 text-sm font-medium">
                      {service.serviceType.substring(0, 1)}
                    </span>
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-800 font-medium">
                      {service.serviceType}
                      <span className="ml-1 text-gray-500 font-normal">
                        - {service.description}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {service.provider && `${service.provider} • `}
                      {service.mileage.toLocaleString()} km
                    </p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <div className="font-medium text-primary-600">
                      R$ {service.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <time dateTime={service.date.toISOString()}>
                      {format(service.date, 'dd MMM yyyy', { locale: ptBR })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MaintenanceTimeline;
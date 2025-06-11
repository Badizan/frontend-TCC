import React from 'react';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { MaintenanceService, MaintenanceReminder } from '../../types';
import { differenceInDays, subMonths } from 'date-fns';

interface MaintenanceInsightsProps {
  services: MaintenanceService[];
  reminders: MaintenanceReminder[];
}

const MaintenanceInsights: React.FC<MaintenanceInsightsProps> = ({ services, reminders }) => {
  const getMaintenanceFrequency = () => {
    if (services.length < 2) return null;
    
    const sortedServices = [...services].sort((a, b) => a.date.getTime() - b.date.getTime());
    const intervals = [];
    
    for (let i = 1; i < sortedServices.length; i++) {
      const daysBetween = differenceInDays(sortedServices[i].date, sortedServices[i - 1].date);
      intervals.push(daysBetween);
    }
    
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    return Math.round(averageInterval);
  };

  const getUpcomingMaintenanceCount = () => {
    return reminders.filter(reminder => !reminder.isCompleted).length;
  };

  const getOverdueMaintenanceCount = () => {
    const today = new Date();
    return reminders.filter(reminder => 
      !reminder.isCompleted && 
      reminder.dueDate && 
      reminder.dueDate < today
    ).length;
  };

  const getRecentMaintenanceCount = () => {
    const oneMonthAgo = subMonths(new Date(), 1);
    return services.filter(service => service.date >= oneMonthAgo).length;
  };

  const getMostCommonService = () => {
    const serviceTypes = services.reduce((acc, service) => {
      acc[service.serviceType] = (acc[service.serviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommon = Object.entries(serviceTypes).reduce((a, b) => 
      serviceTypes[a[0]] > serviceTypes[b[0]] ? a : b
    );
    
    return mostCommon ? mostCommon[0] : null;
  };

  const averageInterval = getMaintenanceFrequency();
  const upcomingCount = getUpcomingMaintenanceCount();
  const overdueCount = getOverdueMaintenanceCount();
  const recentCount = getRecentMaintenanceCount();
  const mostCommonService = getMostCommonService();

  const insights = [
    {
      title: 'Manutenções Pendentes',
      value: upcomingCount,
      icon: Clock,
      color: upcomingCount > 3 ? 'text-warning-600' : 'text-primary-600',
      bgColor: upcomingCount > 3 ? 'bg-warning-50' : 'bg-primary-50',
      description: upcomingCount > 3 ? 'Muitas manutenções pendentes' : 'Cronograma sob controle'
    },
    {
      title: 'Manutenções Atrasadas',
      value: overdueCount,
      icon: AlertCircle,
      color: overdueCount > 0 ? 'text-error-600' : 'text-success-600',
      bgColor: overdueCount > 0 ? 'bg-error-50' : 'bg-success-50',
      description: overdueCount > 0 ? 'Atenção necessária!' : 'Tudo em dia'
    },
    {
      title: 'Manutenções Recentes',
      value: recentCount,
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      description: 'Último mês'
    },
    {
      title: 'Frequência Média',
      value: averageInterval ? `${averageInterval} dias` : 'N/A',
      icon: TrendingUp,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
      description: 'Entre manutenções'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, index) => (
          <div key={index} className={`${insight.bgColor} rounded-lg p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${insight.color.replace('600', '800')}`}>
                  {insight.title}
                </p>
                <p className={`text-xl font-bold ${insight.color.replace('600', '900')}`}>
                  {insight.value}
                </p>
                <p className={`text-xs ${insight.color.replace('600', '700')}`}>
                  {insight.description}
                </p>
              </div>
              <insight.icon className={`w-6 h-6 ${insight.color}`} />
            </div>
          </div>
        ))}
      </div>

      {mostCommonService && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Insights de Manutenção</h4>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 mr-2 text-primary-600" />
              <span>Serviço mais frequente: <strong>{mostCommonService}</strong></span>
            </div>
            {averageInterval && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-secondary-600" />
                <span>
                  Você realiza manutenções a cada <strong>{averageInterval} dias</strong> em média
                </span>
              </div>
            )}
            {overdueCount === 0 && upcomingCount <= 2 && (
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-2 text-success-600" />
                <span>Parabéns! Você está mantendo um bom cronograma de manutenção</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceInsights;
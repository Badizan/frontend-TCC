import React from 'react';
import { MaintenanceReminder } from '../../types';
import { format, isAfter, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, AlertTriangle, AlertCircle, Clock } from 'lucide-react';

interface RemindersListProps {
  reminders: MaintenanceReminder[];
  onComplete: (id: string) => void;
}

const RemindersList: React.FC<RemindersListProps> = ({ reminders, onComplete }) => {
  const getSeverity = (dueDate?: Date) => {
    if (!dueDate) return 'normal';
    
    const today = new Date();
    if (isAfter(today, dueDate)) return 'overdue';
    
    const daysUntilDue = differenceInDays(dueDate, today);
    if (daysUntilDue <= 7) return 'urgent';
    if (daysUntilDue <= 30) return 'warning';
    return 'normal';
  };
  
  const getStatusInfo = (reminder: MaintenanceReminder) => {
    if (reminder.isCompleted) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-success-700" />,
        textColor: 'text-success-700',
        bgColor: 'bg-success-50',
        label: 'Concluído',
      };
    }
    
    const severity = getSeverity(reminder.dueDate);
    
    switch (severity) {
      case 'overdue':
        return {
          icon: <AlertCircle className="w-5 h-5 text-error-700" />,
          textColor: 'text-error-700',
          bgColor: 'bg-error-50',
          label: 'Atrasado',
        };
      case 'urgent':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-warning-700" />,
          textColor: 'text-warning-700',
          bgColor: 'bg-warning-50',
          label: 'Urgente',
        };
      case 'warning':
        return {
          icon: <Clock className="w-5 h-5 text-accent-700" />,
          textColor: 'text-accent-700',
          bgColor: 'bg-accent-50',
          label: 'Em breve',
        };
      default:
        return {
          icon: <Clock className="w-5 h-5 text-secondary-600" />,
          textColor: 'text-secondary-600',
          bgColor: 'bg-secondary-50',
          label: 'Agendado',
        };
    }
  };
  
  if (reminders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum lembrete de manutenção.</p>
      </div>
    );
  }
  
  return (
    <ul className="divide-y divide-gray-200">
      {reminders.filter(r => !r.isCompleted).map((reminder) => {
        const statusInfo = getStatusInfo(reminder);
        
        return (
          <li key={reminder.id} className="py-4 flex items-start">
            <div className={`rounded-full p-1 ${statusInfo.bgColor} mr-4`}>
              {statusInfo.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {reminder.serviceType}
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{reminder.description}</p>
              
              <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                {reminder.dueDate && (
                  <span>
                    Data: {format(reminder.dueDate, 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                )}
                
                {reminder.dueMileage && (
                  <span>
                    Km: {reminder.dueMileage.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={() => onComplete(reminder.id)}
              className="ml-4 bg-white text-primary-600 border border-primary-600 hover:bg-primary-50 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Concluir
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default RemindersList;
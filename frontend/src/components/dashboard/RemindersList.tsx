import React from 'react';
import { MaintenanceReminder } from '../../types';
import { format, isAfter, differenceInDays, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, AlertTriangle, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { parseLocalDate, formatDate } from '../../utils/formatters';

interface RemindersListProps {
  reminders: MaintenanceReminder[];
  onComplete: (id: string) => void;
  onDelete?: (reminder: MaintenanceReminder) => void;
  getVehicleName?: (vehicleId: string) => string;
}

export const RemindersList: React.FC<RemindersListProps> = ({ reminders, onComplete, onDelete, getVehicleName }) => {
  const getSeverity = (dueDate?: Date | string) => {
    if (!dueDate) return 'normal';
    
    const date = parseLocalDate(dueDate.toString());
    if (!isValid(date)) return 'normal';
    
    const today = new Date();
    if (isAfter(today, date)) return 'overdue';
    
    const daysUntilDue = differenceInDays(date, today);
    if (daysUntilDue <= 7) return 'urgent';
    if (daysUntilDue <= 30) return 'warning';
    return 'normal';
  };
  
  const getStatusInfo = (reminder: MaintenanceReminder) => {
    if (reminder.completed) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-700" />,
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        label: 'Concluído',
      };
    }
    
    const severity = getSeverity(reminder.dueDate);
    
    switch (severity) {
      case 'overdue':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-700" />,
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          label: 'Atrasado',
        };
      case 'urgent':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-yellow-700" />,
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          label: 'Urgente',
        };
      case 'warning':
        return {
          icon: <Clock className="w-5 h-5 text-orange-700" />,
          textColor: 'text-orange-700',
          bgColor: 'bg-orange-50',
          label: 'Em breve',
        };
      default:
        return {
          icon: <Clock className="w-5 h-5 text-gray-600" />,
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          label: 'Agendado',
        };
    }
  };

  const formatReminderType = (type: string) => {
    switch (type) {
      case 'MAINTENANCE': return 'Manutenção';
      case 'INSPECTION': return 'Inspeção';
      case 'DOCUMENT': return 'Documento';
      case 'OTHER': return 'Outro';
      default: return type;
    }
  };

  const formatReminderDate = (dateStr: string | Date) => {
    try {
      return formatDate(dateStr);
    } catch (error) {
      return 'Data inválida';
    }
  };
  
  if (reminders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
          <Clock className="w-full h-full" />
        </div>
        <p className="text-gray-500">Nenhum lembrete cadastrado.</p>
        <p className="text-sm text-gray-400 mt-1">
          Lembretes são criados automaticamente ao agendar manutenções.
        </p>
      </div>
    );
  }
  
  return (
    <ul className="divide-y divide-gray-200">
      {reminders.map((reminder) => {
        const statusInfo = getStatusInfo(reminder);
        
        return (
          <li key={reminder.id} className="py-4 flex items-start">
            <div className={`rounded-full p-1 ${statusInfo.bgColor} mr-4`}>
              {statusInfo.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {reminder.description || 'Sem descrição'}
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                  {statusInfo.label}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-gray-500">
                  {reminder.serviceType || 'Lembrete'}
                </p>
                {getVehicleName && reminder.vehicleId && (
                  <>
                    <span className="text-xs text-gray-300">•</span>
                    <p className="text-xs text-gray-500">
                      {getVehicleName(reminder.vehicleId)}
                    </p>
                  </>
                )}
              </div>
              

              
              <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                {reminder.dueDate && (
                  <span>
                    📅 {formatReminderDate(reminder.dueDate)}
                  </span>
                )}
                
                {reminder.dueMileage && reminder.dueMileage > 0 && (
                  <span>
                    🛣️ {reminder.dueMileage?.toLocaleString() || '-'} km
                  </span>
                )}
              </div>
            </div>
            
            <div className="ml-4 flex items-center space-x-2">
              {!reminder.completed && (
                <button
                  onClick={() => onComplete(reminder.id)}
                  className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Concluir
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(reminder)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="Excluir lembrete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
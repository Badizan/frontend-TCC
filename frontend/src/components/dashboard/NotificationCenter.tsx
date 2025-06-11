import React from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { MaintenanceReminder } from '../../types';
import { format, isAfter, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationCenterProps {
  reminders: MaintenanceReminder[];
  onMarkAsRead: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ reminders, onMarkAsRead }) => {
  const getUrgentReminders = () => {
    return reminders.filter(reminder => {
      if (reminder.isCompleted) return false;
      if (!reminder.dueDate) return false;
      
      const today = new Date();
      const daysUntilDue = differenceInDays(reminder.dueDate, today);
      
      return daysUntilDue <= 7 || isAfter(today, reminder.dueDate);
    });
  };

  const urgentReminders = getUrgentReminders();

  if (urgentReminders.length === 0) {
    return (
      <div className="bg-success-50 border border-success-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-success-600 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-success-800">
              Tudo em dia!
            </h3>
            <p className="text-sm text-success-700">
              Não há manutenções urgentes no momento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-primary-600" />
          Notificações Urgentes
        </h3>
        <span className="bg-error-100 text-error-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {urgentReminders.length}
        </span>
      </div>
      
      <div className="space-y-2">
        {urgentReminders.map((reminder) => {
          const isOverdue = reminder.dueDate && isAfter(new Date(), reminder.dueDate);
          const daysUntilDue = reminder.dueDate ? differenceInDays(reminder.dueDate, new Date()) : 0;
          
          return (
            <div
              key={reminder.id}
              className={`p-4 rounded-lg border-l-4 ${
                isOverdue 
                  ? 'bg-error-50 border-error-400' 
                  : 'bg-warning-50 border-warning-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  {isOverdue ? (
                    <AlertTriangle className="w-5 h-5 text-error-600 mr-3 mt-0.5" />
                  ) : (
                    <Clock className="w-5 h-5 text-warning-600 mr-3 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`font-medium ${
                      isOverdue ? 'text-error-800' : 'text-warning-800'
                    }`}>
                      {reminder.serviceType}
                    </h4>
                    <p className={`text-sm ${
                      isOverdue ? 'text-error-700' : 'text-warning-700'
                    }`}>
                      {reminder.description}
                    </p>
                    <p className={`text-xs mt-1 ${
                      isOverdue ? 'text-error-600' : 'text-warning-600'
                    }`}>
                      {isOverdue 
                        ? `Atrasado há ${Math.abs(daysUntilDue)} dias`
                        : daysUntilDue === 0 
                          ? 'Vence hoje!'
                          : `Vence em ${daysUntilDue} dias`
                      }
                      {reminder.dueDate && ` - ${format(reminder.dueDate, 'dd/MM/yyyy', { locale: ptBR })}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onMarkAsRead(reminder.id)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Marcar como lida
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationCenter;
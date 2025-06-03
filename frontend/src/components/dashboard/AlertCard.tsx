import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  date: string;
}

interface AlertCardProps {
  alerts: Alert[];
}

const AlertCard: React.FC<AlertCardProps> = ({ alerts }) => {
  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Alertas e Notificações</h2>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="p-2 bg-white rounded-lg shadow-sm">
              {getIcon(alert.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{alert.title}</h3>
                <span className="text-sm text-gray-500">
                  {format(new Date(alert.date), "d 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
              <p className="mt-1 text-gray-600">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertCard; 
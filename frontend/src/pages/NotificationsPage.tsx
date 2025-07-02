import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, Filter, Check, ExternalLink, AlertTriangle, AlertCircle, Clock, ArrowLeft, Trash2, X } from 'lucide-react';

interface NotificationFilters {
  category?: string;
  read?: boolean;
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<NotificationFilters>({});

  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotifications();

  const getNotificationIcon = (category: string, priority?: string) => {
    if (category === 'reminders') {
      switch (priority) {
        case 'overdue':
          return <AlertCircle className="h-6 w-6 text-red-600" />;
        case 'urgent':
          return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
        default:
          return <Clock className="h-6 w-6 text-blue-600" />;
      }
    }

    switch (category) {
      case 'maintenance':
        return '🔧';
      case 'expenses':
        return '💰';
      case 'reminders':
        return '⏰';
      case 'system':
        return '🔔';
      default:
        return '📝';
    }
  };

  const getNotificationStyle = (notification: any) => {
    if (notification.category === 'reminders') {
      switch (notification.priority) {
        case 'overdue':
          return {
            bgColor: 'bg-red-50 border-l-4 border-red-500',
            textColor: 'text-red-800',
            titleColor: 'text-red-900'
          };
        case 'urgent':
          return {
            bgColor: 'bg-yellow-50 border-l-4 border-yellow-500',
            textColor: 'text-yellow-800',
            titleColor: 'text-yellow-900'
          };
        default:
          return {
            bgColor: 'bg-blue-50 border-l-4 border-blue-500',
            textColor: 'text-blue-800',
            titleColor: 'text-blue-900'
          };
      }
    }

    return {
      bgColor: notification.read ? 'bg-gray-50' : 'bg-white',
      textColor: notification.read ? 'text-gray-600' : 'text-gray-800',
      titleColor: notification.read ? 'text-gray-700' : 'text-gray-900'
    };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleReminderNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    navigate('/reminders');
  };

  // Aplicar filtros
  const filteredNotifications = notifications.filter(notification => {
    if (filters.category && notification.category !== filters.category) {
      return false;
    }
    if (filters.read !== undefined && notification.read !== filters.read) {
      return false;
    }
    return true;
  });

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'maintenance': return 'Manutenção';
      case 'expenses': return 'Despesas';
      case 'reminders': return 'Lembretes';
      case 'system': return 'Sistema';
      default: return category;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <Bell className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
                  <p className="text-sm text-gray-600">
                    {unreadCount > 0 ? `${unreadCount} não lida(s)` : 'Todas as notificações lidas'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setFilters({ ...filters, read: filters.read === false ? undefined : false })}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  filters.read === false
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>{filters.read === false ? 'Mostrar todas' : 'Apenas não lidas'}</span>
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>{loading ? 'Marcando...' : 'Marcar todas como lidas'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Filtros de categoria */}
          <div className="flex flex-wrap gap-2 mt-4">
            {['maintenance', 'expenses', 'reminders', 'system'].map((category) => (
              <button
                key={category}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    category: prev.category === category ? undefined : category
                  }))
                }
                className={`px-3 py-2 rounded-full text-sm transition-colors flex items-center space-x-2 ${
                  filters.category === category
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-base">{getNotificationIcon(category)}</span>
                <span>{getCategoryLabel(category)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando notificações...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filters.read === false ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
              </h3>
              <p className="text-gray-600">
                {filters.read === false 
                  ? 'Você está em dia com todas as suas notificações!'
                  : 'Suas notificações aparecerão aqui quando houver atividades.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification, index) => {
                const style = getNotificationStyle(notification);
                const isReminderNotification = notification.category === 'reminders' && 
                  (notification.type === 'OVERDUE_REMINDERS' || notification.type === 'URGENT_REMINDERS');

                return (
                  <div
                    key={notification?.id || index}
                    className={`p-6 transition-colors duration-150 ${style.bgColor} ${
                      !notification.read ? 'hover:bg-blue-25' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {typeof getNotificationIcon(notification?.category || 'system', notification?.priority) === 'string' ? (
                          <div className="text-2xl">
                            {getNotificationIcon(notification?.category || 'system', notification?.priority)}
                          </div>
                        ) : (
                          getNotificationIcon(notification?.category || 'system', notification?.priority)
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className={`text-lg font-semibold ${style.titleColor}`}>
                                {notification?.title || 'Notificação'}
                              </h3>
                              {!notification.read && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Não lida
                                </span>
                              )}
                            </div>
                            <p className={`mt-2 text-sm ${style.textColor}`}>
                              {notification?.message || 'Sem mensagem'}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {isReminderNotification && (
                              <button
                                onClick={() => handleReminderNotificationClick(notification)}
                                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-400 rounded-md transition-colors flex items-center space-x-1"
                                title="Ver lembretes"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span>Ver Lembretes</span>
                              </button>
                            )}
                            
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification?.id || '')}
                                className="px-3 py-1 text-sm text-green-600 hover:text-green-800 border border-green-300 hover:border-green-400 rounded-md transition-colors flex items-center space-x-1"
                                title="Marcar como lida"
                              >
                                <Check className="h-4 w-4" />
                                <span>Marcar como lida</span>
                              </button>
                            )}
                            
                            <button
                              onClick={async () => {
                                try {
                                  await deleteNotification(notification?.id || '');
                                } catch (error) {
                                  console.error('Erro ao deletar notificação:', error);
                                }
                              }}
                              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 hover:border-red-400 rounded-md transition-colors flex items-center space-x-1"
                              title="Deletar notificação"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Deletar</span>
                            </button>
                          </div>
                        </div>

                        {/* Mostrar detalhes dos lembretes se disponível */}
                        {notification?.data?.reminders && notification.data.reminders.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">Lembretes:</h4>
                            <div className="space-y-2">
                              {notification.data.reminders.slice(0, 5).map((reminder: any, idx: number) => (
                                <div key={idx} className="bg-white bg-opacity-70 rounded-lg p-3 border border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">{reminder.description}</span>
                                    {reminder.vehicleName && (
                                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                        {reminder.vehicleName}
                                      </span>
                                    )}
                                  </div>
                                  {reminder.dueDate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Vencimento: {formatDate(reminder.dueDate)}
                                    </p>
                                  )}
                                </div>
                              ))}
                              {notification.data.reminders.length > 5 && (
                                <p className="text-sm text-gray-600 font-medium">
                                  +{notification.data.reminders.length - 5} lembrete(s) adicional(ais)
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs text-gray-500">
                            {formatDate(notification?.createdAt)}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {getCategoryLabel(notification?.category || 'system')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
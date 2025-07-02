import React, { useState, useRef } from 'react';
import { Bell, AlertTriangle, AlertCircle, Clock, ExternalLink, Check, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

export function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    deleteNotification, 
    refreshNotifications 
  } = useNotifications();

    // Adicionar listener para fechar o dropdown quando clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      titleColor: 'text-gray-900'
    };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleReminderNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    setShowDropdown(false);
    navigate('/reminders');
  };

  const hasUrgentNotifications = notifications.some(n => 
    n.category === 'reminders' && (n.priority === 'overdue' || n.priority === 'urgent') && !n.read
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) {
            refreshNotifications();
          }
        }}
        className={`p-2 rounded-lg transition-colors relative ${
          hasUrgentNotifications
            ? 'text-red-600 hover:text-red-700 hover:bg-red-50 animate-pulse' 
            : unreadCount > 0 
            ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' 
            : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
        }`}
        aria-label="Notificações"
      >
        {hasUrgentNotifications ? (
          <Bell className="h-6 w-6 fill-current" />
        ) : unreadCount > 0 ? (
          <Bell className="h-6 w-6 fill-current" />
        ) : (
          <Bell className="h-6 w-6" />
        )}
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-md border-2 border-white ${
            hasUrgentNotifications ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
          }`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {loading ? 'Marcando...' : 'Marcar todas como lidas'}
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma notificação</p>
                <p className="text-sm text-gray-400 mt-1">
                  Você está em dia com tudo!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification, index) => {
                  const style = getNotificationStyle(notification);
                  const isReminderNotification = notification.category === 'reminders' && 
                    (notification.type === 'OVERDUE_REMINDERS' || notification.type === 'URGENT_REMINDERS');

                  return (
                    <div
                      key={notification?.id || index}
                      className={`p-4 hover:bg-gray-50 transition-colors duration-150 ${style.bgColor}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification?.category || 'system', notification?.priority)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${style.titleColor}`}>
                              {notification?.title || 'Notificação'}
                            </p>
                            <div className="flex items-center space-x-1">
                              {isReminderNotification && (
                                <button
                                  onClick={() => handleReminderNotificationClick(notification)}
                                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                  title="Ver lembretes"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  <span>Ver</span>
                                </button>
                              )}
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification?.id || '')}
                                  className="text-xs text-green-600 hover:text-green-800 flex items-center space-x-1"
                                  title="Marcar como lida"
                                >
                                  <Check className="h-3 w-3" />
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
                                className="text-xs text-red-600 hover:text-red-800 flex items-center space-x-1"
                                title="Deletar notificação"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <p className={`text-sm mt-1 line-clamp-2 ${style.textColor}`}>
                            {notification?.message || 'Sem mensagem'}
                          </p>
                          
                          {/* Mostrar detalhes dos lembretes se disponível */}
                          {notification?.data?.reminders && notification.data.reminders.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {notification.data.reminders.slice(0, 3).map((reminder: any, idx: number) => (
                                <div key={idx} className="text-xs bg-white bg-opacity-50 rounded p-2">
                                  <span className="font-medium">{reminder.description}</span>
                                  {reminder.vehicleName && (
                                    <span className="text-gray-600"> - {reminder.vehicleName}</span>
                                  )}
                                </div>
                              ))}
                              {notification.data.reminders.length > 3 && (
                                <p className="text-xs text-gray-600">
                                  +{notification.data.reminders.length - 3} mais...
                                </p>
                              )}
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(notification?.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-100">
            <button
              onClick={() => {
                setShowDropdown(false);
                navigate('/notifications');
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2"
            >
              Ver todas as notificações
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
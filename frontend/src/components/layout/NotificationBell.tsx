import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);

    // Adicionar listener para fechar o dropdown quando clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const result = await notificationService.getNotifications({ limit: 10, unreadOnly: false });
      
      let notifications: any[] = [];
      let unreadCount = 0;
      
      if (Array.isArray(result)) {
        // Compatibilidade com resposta simples (array)
        notifications = result;
        unreadCount = result.filter(n => !n.read).length;
      } else if (result && typeof result === 'object') {
        // Resposta completa com estrutura
        notifications = result.notifications || [];
        unreadCount = result.unreadCount || notifications.filter(n => !n.read).length;
      }
      
      setNotifications(notifications);
      setUnreadCount(unreadCount);
      
      console.log('🔔 Notificações carregadas:', notifications.length, 'não lidas:', unreadCount);
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
      // Em caso de erro, definir valores padrão
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (category: string) => {
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

  // Garantir que notifications sempre é um array
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 text-gray-400 hover:text-gray-500 relative"
        aria-label="Notificações"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {loading ? 'Marcando...' : 'Marcar todas como lidas'}
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {safeNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhuma notificação não lida
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {safeNotifications.map((notification, index) => (
                  <div
                    key={notification?.id || index}
                    className="p-4 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification?.category || 'system')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification?.title || 'Notificação'}
                          </p>
                          <button
                            onClick={() => handleMarkAsRead(notification?.id || '')}
                            className="text-xs text-gray-500 hover:text-gray-700 ml-2"
                          >
                            Marcar como lida
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {notification?.message || 'Sem mensagem'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(notification?.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
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
import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { Bell, Filter, Check, Trash2 } from 'lucide-react';

interface NotificationFilters {
  category?: string;
  channel?: string;
  read?: boolean;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadNotifications();
  }, [page, filters]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Passar filtros para o backend
      const options: any = {
        page,
        limit: 10
      };
      
      if (filters.category) {
        options.category = filters.category;
      }
      
      if (filters.read === false) {
        options.unreadOnly = true;
      }
      
      const response = await notificationService.getNotifications(options);
      
      if (Array.isArray(response)) {
        // Compatibilidade com resposta simples (array)
        setNotifications(response);
        setTotalPages(1);
      } else if (response && typeof response === 'object') {
        // Resposta completa com estrutura
        const notifications = response.notifications || [];
        setNotifications(notifications);
        setTotalPages(Math.ceil((response.total || 0) / 10));
      }
      
      console.log('📋 Notificações da página carregadas:', response);
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
      // Em caso de erro, definir valores padrão
      setNotifications([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Atualizar localmente
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification?.(notificationId);
      // Atualizar localmente
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Atualizar localmente
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
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
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Garantir que notifications sempre é um array
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  // Aplicar filtros localmente
  const filteredNotifications = safeNotifications.filter(notification => {
    if (filters.category && notification.category !== filters.category) {
      return false;
    }
    if (filters.read !== undefined && notification.read !== filters.read) {
      return false;
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilters({ ...filters, read: filters.read === false ? undefined : false })}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              filters.read === false
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>{filters.read === false ? 'Mostrar todas' : 'Apenas não lidas'}</span>
          </button>

          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Check className="h-4 w-4" />
            <span>Marcar todas como lidas</span>
          </button>
        </div>
      </div>

      {/* Filtros de categoria */}
      <div className="flex space-x-2 mb-6">
        {['maintenance', 'expenses', 'reminders', 'system'].map((category) => (
          <button
            key={category}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                category: prev.category === category ? undefined : category
              }))
            }
            className={`px-3 py-1 rounded-full text-sm ${
              filters.category === category
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {getNotificationIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhuma notificação encontrada</h3>
          <p className="text-gray-500">Não há notificações para exibir com os filtros selecionados.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg divide-y divide-gray-100">
          {filteredNotifications.map((notification, index) => (
            <div
              key={notification?.id || index}
              className={`p-4 hover:bg-gray-50 transition-colors duration-150 ${
                !notification?.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="text-2xl flex-shrink-0">
                  {getNotificationIcon(notification?.category || 'system')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {notification?.title || 'Notificação'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification?.message || 'Sem mensagem'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(notification?.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification?.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification?.id || '')}
                          className="text-sm text-blue-600 hover:text-blue-800"
                          title="Marcar como lida"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification?.id || '')}
                        className="text-sm text-red-600 hover:text-red-800"
                        title="Deletar notificação"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`px-3 py-1 rounded ${
                page === pageNum
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export { NotificationsPage };
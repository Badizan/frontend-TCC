import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { notificationService } from '../services/notificationService';
import { useAppStore } from '../store';
import { parseLocalDate } from '../utils/formatters';

export interface UnifiedNotification {
    id: string;
    title: string;
    message: string;
    category: 'maintenance' | 'expenses' | 'reminders' | 'system';
    read: boolean;
    createdAt: string;
    type?: string;
    data?: any;
    priority?: 'normal' | 'urgent' | 'overdue';
}

interface UseNotificationsReturn {
    notifications: UnifiedNotification[];
    unreadCount: number;
    loading: boolean;
    showToast: (title: string, message: string, category?: string, type?: 'success' | 'error' | 'info') => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    refreshNotifications: () => Promise<void>;
    checkImmediateNotifications: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
    const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Acesso ao store para obter lembretes
    const { maintenanceReminders, vehicles } = useAppStore();

    const createReminderNotifications = useCallback(() => {
        if (!maintenanceReminders || maintenanceReminders.length === 0) {
            return [];
        }

        const reminderNotifications: UnifiedNotification[] = [];

        // Lembretes urgentes (próximos 7 dias)
        const urgentReminders = maintenanceReminders.filter(r => {
            if (r.completed) return false;
            if (!r.dueDate) return false;

            const today = new Date();
            const reminderDate = parseLocalDate(r.dueDate.toString());
            const diffDays = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

            return diffDays <= 7 && diffDays >= 0;
        });

        // Lembretes vencidos
        const overdueReminders = maintenanceReminders.filter(r => {
            if (r.completed) return false;
            if (!r.dueDate) return false;

            const today = new Date();
            const reminderDate = parseLocalDate(r.dueDate.toString());

            return reminderDate < today;
        });

        // Criar notificação para lembretes vencidos
        if (overdueReminders.length > 0) {
            reminderNotifications.push({
                id: `reminder-overdue-${Date.now()}`,
                title: '🚨 Lembretes Vencidos',
                message: `Você tem ${overdueReminders.length} lembrete(s) vencido(s) que precisa(m) de atenção imediata.`,
                category: 'reminders',
                read: false,
                createdAt: new Date().toISOString(),
                type: 'OVERDUE_REMINDERS',
                priority: 'overdue',
                data: {
                    reminders: overdueReminders.map(r => ({
                        ...r,
                        vehicleName: vehicles?.find(v => v.id === r.vehicleId)?.brand + ' ' + vehicles?.find(v => v.id === r.vehicleId)?.model
                    }))
                }
            });
        }

        // Criar notificação para lembretes urgentes
        if (urgentReminders.length > 0) {
            reminderNotifications.push({
                id: `reminder-urgent-${Date.now()}`,
                title: '⚠️ Lembretes Urgentes',
                message: `Você tem ${urgentReminders.length} lembrete(s) para os próximos 7 dias.`,
                category: 'reminders',
                read: false,
                createdAt: new Date().toISOString(),
                type: 'URGENT_REMINDERS',
                priority: 'urgent',
                data: {
                    reminders: urgentReminders.map(r => ({
                        ...r,
                        vehicleName: vehicles?.find(v => v.id === r.vehicleId)?.brand + ' ' + vehicles?.find(v => v.id === r.vehicleId)?.model
                    }))
                }
            });
        }

        return reminderNotifications;
    }, [maintenanceReminders, vehicles]);

    const refreshNotifications = useCallback(async () => {
        try {
            console.log('🔄 Atualizando notificações...');

            const result = await notificationService.getNotifications({
                limit: 50,
                unreadOnly: false
            });

            let fetchedNotifications: UnifiedNotification[] = [];

            if (Array.isArray(result)) {
                fetchedNotifications = result.map(n => ({
                    id: n.id,
                    title: n.title,
                    message: n.message,
                    category: n.category,
                    read: n.read,
                    createdAt: n.createdAt,
                    type: n.type,
                    data: n.data
                }));
            } else if (result && typeof result === 'object' && 'notifications' in result) {
                fetchedNotifications = (result.notifications || []).map(n => ({
                    id: n.id,
                    title: n.title,
                    message: n.message,
                    category: n.category,
                    read: n.read,
                    createdAt: n.createdAt,
                    type: n.type,
                    data: n.data
                }));
            }

            // Filtrar apenas notificações válidas (não mock)
            const validNotifications = fetchedNotifications.filter(n =>
                n.id && !n.id.startsWith('mock-') && !n.id.startsWith('local-')
            );

            // Adicionar notificações de lembretes importantes
            const reminderNotifications = createReminderNotifications();

            // Combinar notificações do backend com notificações de lembretes
            const allNotifications = [...reminderNotifications, ...validNotifications];

            setNotifications(allNotifications);
            setUnreadCount(allNotifications.filter(n => !n.read).length);

            console.log('✅ Notificações atualizadas:', allNotifications.length, 'total,', allNotifications.filter(n => !n.read).length, 'não lidas');
        } catch (error) {
            console.error('❌ Erro ao carregar notificações:', error);
        }
    }, [createReminderNotifications]);

    const checkImmediateNotifications = useCallback(async () => {
        try {
            console.log('🔍 Verificando notificações imediatas...');
            await notificationService.checkImmediate();

            // Aguardar um pouco para dar tempo ao backend processar
            setTimeout(async () => {
                await refreshNotifications();
            }, 2000);
        } catch (error) {
            console.error('❌ Erro ao verificar notificações imediatas:', error);
        }
    }, [refreshNotifications]);

    const showToast = useCallback((
        title: string,
        message: string,
        category: string = 'system',
        type: 'success' | 'error' | 'info' = 'success'
    ) => {
        // Exibir toast
        const toastOptions = {
            duration: 4000,
            position: 'bottom-right' as const,
            style: {
                background: type === 'success' ? '#10B981' :
                    type === 'error' ? '#EF4444' : '#3B82F6',
                color: '#fff',
                fontWeight: '500',
            },
        };

        const toastMessage = `${title}: ${message}`;

        switch (type) {
            case 'success':
                toast.success(toastMessage, toastOptions);
                break;
            case 'error':
                toast.error(toastMessage, toastOptions);
                break;
            default:
                toast(toastMessage, { ...toastOptions, icon: '🔔' });
        }

        // Aguardar e recarregar notificações do backend
        setTimeout(() => {
            refreshNotifications();
            checkImmediateNotifications();
        }, 1500);
    }, [refreshNotifications, checkImmediateNotifications]);

    const markAsRead = useCallback(async (id: string) => {
        try {
            // Se é notificação de lembrete local, apenas marcar como lida localmente
            if (id.startsWith('reminder-') || id.startsWith('local-') || id.startsWith('mock-')) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
                return;
            }

            await notificationService.markAsRead(id);

            // Atualizar estado local imediatamente
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));

            // Refresh para sincronizar com backend
            setTimeout(refreshNotifications, 500);
        } catch (error) {
            console.error('❌ Erro ao marcar notificação como lida:', error);
        }
    }, [refreshNotifications]);

    const markAllAsRead = useCallback(async () => {
        try {
            setLoading(true);

            await notificationService.markAllAsRead();

            // Atualizar estado local imediatamente
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);

            // Refresh para sincronizar com backend
            setTimeout(refreshNotifications, 500);
        } catch (error) {
            console.error('❌ Erro ao marcar todas notificações como lidas:', error);
        } finally {
            setLoading(false);
        }
    }, [refreshNotifications]);

    const deleteNotification = useCallback(async (id: string) => {
        try {
            // Se é notificação de lembrete local, apenas remover localmente
            if (id.startsWith('reminder-') || id.startsWith('local-') || id.startsWith('mock-')) {
                setNotifications(prev => {
                    const updated = prev.filter(n => n.id !== id);
                    setUnreadCount(updated.filter(n => !n.read).length);
                    return updated;
                });
                return;
            }

            await notificationService.deleteNotification(id);

            // Atualizar estado local imediatamente
            setNotifications(prev => {
                const updated = prev.filter(n => n.id !== id);
                setUnreadCount(updated.filter(n => !n.read).length);
                return updated;
            });

            // Refresh para sincronizar com backend
            setTimeout(refreshNotifications, 500);
        } catch (error) {
            console.error('❌ Erro ao deletar notificação:', error);
            throw error;
        }
    }, [refreshNotifications]);

    useEffect(() => {
        // Carregar notificações iniciais
        refreshNotifications();

        // Verificar notificações imediatas
        setTimeout(checkImmediateNotifications, 1000);

        // Configurar intervalos de atualização
        const refreshInterval = setInterval(refreshNotifications, 30000); // 30s
        const immediateInterval = setInterval(checkImmediateNotifications, 120000); // 2min

        return () => {
            clearInterval(refreshInterval);
            clearInterval(immediateInterval);
        };
    }, [refreshNotifications, checkImmediateNotifications]);

    // Recarregar quando os lembretes mudarem
    useEffect(() => {
        if (maintenanceReminders) {
            refreshNotifications();
        }
    }, [maintenanceReminders, refreshNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        showToast,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
        checkImmediateNotifications
    };
}; 
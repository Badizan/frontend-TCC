import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAppStore } from '../store';
import { MileageNotification } from '../components/ui/MileageNotification';

interface MileageReminder {
    id: string;
    description: string;
    dueMileage: number;
    vehicleId: string;
    vehicle?: {
        brand: string;
        model: string;
        mileage: number;
    };
}

export const useMileageNotifications = () => {
    const [notifications, setNotifications] = useState<MileageReminder[]>([]);
    const { vehicles, getMileageReminders } = useAppStore();

      // Verificar lembretes próximos
  const checkNearbyReminders = useCallback(async () => {
    try {
      for (const vehicle of vehicles) {
        const reminders = await getMileageReminders(vehicle.id);
        
        // Só verificar se há lembretes configurados
        if (reminders.length > 0) {
          reminders.forEach((reminder: MileageReminder) => {
            if (!reminder.completed && reminder.dueMileage) {
              const currentMileage = vehicle.mileage || 0;
              const distanceToTarget = reminder.dueMileage - currentMileage;
              
              // Notificar quando estiver próximo (dentro de 1000km)
              if (distanceToTarget <= 1000 && distanceToTarget > 0) {
                showMileageNotification(reminder, vehicle, distanceToTarget);
              }
              
              // Notificar quando atingir ou passar da quilometragem
              if (currentMileage >= reminder.dueMileage) {
                showMileageAlert(reminder, vehicle, currentMileage);
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar lembretes próximos:', error);
    }
  }, [vehicles, getMileageReminders]);

    // Mostrar notificação de proximidade
    const showMileageNotification = (reminder: MileageReminder, vehicle: any, distance: number) => {
        const notificationId = `mileage-${reminder.id}`;

        // Verificar se já mostrou esta notificação
        if (notifications.find(n => n.id === reminder.id)) {
            return;
        }

        toast.custom(
            (t) => (
                <MileageNotification
          type={distance <= 100 ? 'alert' : 'warning'}
          title={distance <= 100 ? 'Manutenção Urgente!' : 'Manutenção Próxima'}
          message={`${reminder.description} - ${distance.toLocaleString('pt-BR')} km restantes`}
          vehicleInfo={{
            brand: vehicle.brand,
            model: vehicle.model,
            currentMileage: vehicle.mileage || 0,
            targetMileage: reminder.dueMileage
          }}
          onClose={() => {
            toast.dismiss(t.id);
            setNotifications(prev => prev.filter(n => n.id !== reminder.id));
          }}
        />
      ),
      {
        id: notificationId,
        duration: distance <= 100 ? 10000 : 6000, // Mais tempo para alertas urgentes
        position: 'top-right',
      }
    );

    // Adicionar à lista de notificações mostradas
    setNotifications(prev => [...prev, reminder]);
  };

  // Mostrar alerta quando atingir a quilometragem
  const showMileageAlert = (reminder: MileageReminder, vehicle: any, currentMileage: number) => {
    const notificationId = `mileage-alert-${reminder.id}`;
    
    toast.custom(
      (t) => (
        <MileageNotification
          type="alert"
          title="Manutenção Devida!"
          message={`${reminder.description} - Quilometragem atingida!`}
          vehicleInfo={{
            brand: vehicle.brand,
            model: vehicle.model,
            currentMileage: currentMileage,
            targetMileage: reminder.dueMileage
          }}
          onClose={() => {
            toast.dismiss(t.id);
          }}
        />
      ),
      {
        id: notificationId,
        duration: 15000, // 15 segundos para alertas importantes
        position: 'top-right',
      }
    );
  };

  // Verificar lembretes quando a página carrega ou quando veículos mudam
  useEffect(() => {
    if (vehicles.length > 0) {
      checkNearbyReminders();
    }
  }, [vehicles, checkNearbyReminders]);

  // Função para mostrar notificação manual
  const showManualNotification = (reminder: MileageReminder, vehicle: any, type: 'info' | 'warning' | 'alert' | 'success') => {
    const notificationId = `manual-${reminder.id}`;
    
    toast.custom(
      (t) => (
        <MileageNotification
          type={type}
          title="Lembrete de Manutenção"
          message={reminder.description}
          vehicleInfo={{
            brand: vehicle.brand,
            model: vehicle.model,
            currentMileage: vehicle.mileage || 0,
            targetMileage: reminder.dueMileage
          }}
          onClose={() => {
            toast.dismiss(t.id);
          }}
        />
      ),
      {
        id: notificationId,
        duration: 8000,
        position: 'top-right',
      }
    );
  };

  return {
    checkNearbyReminders,
    showManualNotification,
    notifications
  };
}; 
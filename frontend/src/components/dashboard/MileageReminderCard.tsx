import React, { useState, useEffect } from 'react';
import { Clock, Plus, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { useAppStore } from '../../store';
import { toast } from 'react-hot-toast';
import { MileageNotification } from '../ui/MileageNotification';

interface MileageReminderCardProps {
  vehicleId: string;
  currentMileage?: number;
}

export const MileageReminderCard: React.FC<MileageReminderCardProps> = ({ 
  vehicleId, 
  currentMileage = 0 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    description: '',
    dueMileage: currentMileage + 1000,
    intervalMileage: 1000,
    recurring: false
  });

  const { createMileageReminder, getMileageReminders, calculateNextMaintenance, vehicles } = useAppStore();
  
  // Buscar informações do veículo
  const selectedVehicle = vehicles.find(v => v.id === vehicleId);

  // Carregar lembretes existentes
  useEffect(() => {
    loadReminders();
  }, [vehicleId]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const mileageReminders = await getMileageReminders(vehicleId);
      setReminders(mileageReminders);
    } catch (error) {
      console.error('Erro ao carregar lembretes:', error);
      toast.error('Erro ao carregar lembretes de quilometragem');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    if (formData.dueMileage <= currentMileage) {
      toast.error('Quilometragem deve ser maior que a atual');
      return;
    }

    try {
      setLoading(true);
      await createMileageReminder({
        vehicleId,
        description: formData.description,
        dueMileage: formData.dueMileage,
        intervalMileage: formData.recurring ? formData.intervalMileage : undefined,
        recurring: formData.recurring
      });

      // Mostrar notificação personalizada
      toast.custom(
        (t) => (
          <MileageNotification
            type="success"
            title="Lembrete Criado!"
            message={`${formData.description} configurado para ${formData.dueMileage.toLocaleString('pt-BR')} km`}
            vehicleInfo={{
              brand: selectedVehicle?.brand || '',
              model: selectedVehicle?.model || '',
              currentMileage: currentMileage,
              targetMileage: formData.dueMileage
            }}
            onClose={() => toast.dismiss(t.id)}
            onAction={() => {
              toast.dismiss(t.id);
              // Fechar formulário e recarregar
              setShowForm(false);
              setFormData({
                description: '',
                dueMileage: currentMileage + 1000,
                intervalMileage: 1000,
                recurring: false
              });
              loadReminders();
            }}
          />
        ),
        {
          duration: 5000,
          position: 'top-right',
        }
      );
      
      setShowForm(false);
      setFormData({
        description: '',
        dueMileage: currentMileage + 1000,
        intervalMileage: 1000,
        recurring: false
      });
      loadReminders();
    } catch (error: any) {
      console.error('Erro ao criar lembrete:', error);
      toast.error(error.message || 'Erro ao criar lembrete');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (reminder: any) => {
    if (reminder.completed) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    if (reminder.dueMileage && currentMileage >= reminder.dueMileage) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    
    return <Clock className="w-5 h-5 text-blue-500" />;
  };

  const getStatusText = (reminder: any) => {
    if (reminder.completed) {
      return 'Concluído';
    }
    
    if (reminder.dueMileage && currentMileage >= reminder.dueMileage) {
      return 'Vencido';
    }
    
    return 'Pendente';
  };

  const getStatusColor = (reminder: any) => {
    if (reminder.completed) {
      return 'text-green-600 bg-green-50';
    }
    
    if (reminder.dueMileage && currentMileage >= reminder.dueMileage) {
      return 'text-red-600 bg-red-50';
    }
    
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Lembretes por Quilometragem
          </h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lembrete</span>
        </button>
      </div>

      {/* Formulário para criar novo lembrete */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ex: Troca de óleo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quilometragem Alvo *
              </label>
              <input
                type="number"
                value={formData.dueMileage}
                onChange={(e) => setFormData(prev => ({ ...prev, dueMileage: parseInt(e.target.value) || 0 }))}
                min={currentMileage + 1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Atual: {currentMileage.toLocaleString('pt-BR')} km
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recorrente
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.recurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Repetir a cada</span>
              </div>
            </div>

            {formData.recurring && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intervalo (km)
                </label>
                <input
                  type="number"
                  value={formData.intervalMileage}
                  onChange={(e) => setFormData(prev => ({ ...prev, intervalMileage: parseInt(e.target.value) || 1000 }))}
                  min="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Criando...' : 'Criar Lembrete'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de lembretes */}
      <div className="space-y-3">
        {loading && reminders.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Carregando lembretes...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum lembrete configurado</p>
            <p className="text-sm text-gray-400 mt-1">
              Configure lembretes para receber notificações quando atingir quilometragens específicas
            </p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(reminder)}
                <div>
                  <p className="font-medium text-gray-900">{reminder.description}</p>
                  <p className="text-sm text-gray-600">
                    {reminder.dueMileage?.toLocaleString('pt-BR')} km
                    {reminder.recurring && reminder.intervalMileage && (
                      <span className="ml-2 text-blue-600">
                        (a cada {reminder.intervalMileage.toLocaleString('pt-BR')} km)
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reminder)}`}>
                  {getStatusText(reminder)}
                </span>
                
                {reminder.dueMileage && currentMileage < reminder.dueMileage && (
                  <span className="text-xs text-gray-500">
                    Faltam {(reminder.dueMileage - currentMileage).toLocaleString('pt-BR')} km
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Informações adicionais */}
      {currentMileage > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Settings className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Dicas de Manutenção</span>
          </div>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Troca de óleo: a cada 5.000 - 10.000 km</p>
            <p>• Filtros: a cada 10.000 - 15.000 km</p>
            <p>• Pastilhas de freio: a cada 20.000 - 40.000 km</p>
            <p>• Pneus: a cada 40.000 - 60.000 km</p>
          </div>
        </div>
      )}
    </div>
  );
}; 
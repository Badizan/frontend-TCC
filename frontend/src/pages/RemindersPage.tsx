import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Search, Filter, Calendar, CheckCircle } from 'lucide-react';
import { RemindersList } from '../components/dashboard/RemindersList';
import { ReminderForm } from '../components/forms/ReminderForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotifications } from '../hooks/useNotifications';

const RemindersPage: React.FC = () => {
  const { 
    maintenanceReminders, 
    vehicles, 
    fetchMaintenanceReminders, 
    fetchVehicles, 
    createMaintenanceReminder, 
    completeReminder,
    deleteMaintenanceReminder
  } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  
  const { showToast } = useNotifications();

  useEffect(() => {
    fetchMaintenanceReminders();
    fetchVehicles();
  }, [fetchMaintenanceReminders, fetchVehicles]);



  const handleDeleteReminder = async (reminder: any) => {
    if (!confirm(`Tem certeza que deseja excluir o lembrete "${reminder.title || reminder.description}"?`)) {
      return;
    }
    
    try {
      await deleteMaintenanceReminder(reminder.id);
      
      showToast(
        'Lembrete Excluído',
        'Lembrete foi excluído com sucesso',
        'reminders',
        'success'
      );
      
    } catch (error) {
      console.error('Erro ao excluir lembrete:', error);
      showToast(
        'Erro',
        'Não foi possível excluir o lembrete. Tente novamente.',
        'system',
        'error'
      );
    }
  };

  const filteredReminders = maintenanceReminders.filter(reminder => {
    // Adicionar verificações de segurança para campos que podem ser undefined
    const title = reminder.title || '';
    const description = reminder.description || '';
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVehicle = selectedVehicle === 'all' || reminder.vehicleId === selectedVehicle;
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'pending' && !reminder.completed) ||
                         (filterStatus === 'completed' && reminder.completed);
    return matchesSearch && matchesVehicle && matchesStatus;
  });

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate}` : 'Veículo não encontrado';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Lembretes</h1>
          <p className="text-sm text-gray-600">Lembretes são criados automaticamente através das manutenções</p>
        </div>
        <div className="bg-green-50 px-4 py-2 rounded-lg">
          <p className="text-sm text-green-800">
            ✨ <strong>Criação Automática:</strong> Lembretes são gerados automaticamente 1 dia antes das manutenções agendadas
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-yellow-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-yellow-900 truncate">
                  Pendentes
                </dt>
                <dd className="text-lg font-medium text-yellow-900">
                  {maintenanceReminders.filter(r => !r.completed).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-green-900 truncate">
                  Concluídos
                </dt>
                <dd className="text-lg font-medium text-green-900">
                  {maintenanceReminders.filter(r => r.completed).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-blue-900 truncate">
                  Total
                </dt>
                <dd className="text-lg font-medium text-blue-900">
                  {maintenanceReminders.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="form-input pl-10"
            placeholder="Buscar por título ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="form-input pl-10"
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
          >
            <option value="all">Todos os veículos</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            className="form-input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="completed">Concluídos</option>
          </select>
        </div>
      </div>



      {/* Results */}
      <div className="card">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Lista de Lembretes
            {filteredReminders.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({filteredReminders.length} lembrete{filteredReminders.length !== 1 ? 's' : ''})
              </span>
            )}
          </h2>
        </div>

        <RemindersList 
          reminders={filteredReminders} 
          onComplete={completeReminder}
          onDelete={handleDeleteReminder}
          getVehicleName={getVehicleName}
        />
      </div>
    </div>
  );
};

export { RemindersPage };
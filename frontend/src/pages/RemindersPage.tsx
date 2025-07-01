import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Search, Filter, Calendar, CheckCircle } from 'lucide-react';
import { RemindersList } from '../components/dashboard/RemindersList';
import { ReminderForm } from '../components/forms/ReminderForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const RemindersPage: React.FC = () => {
  const { maintenanceReminders, vehicles, fetchMaintenanceReminders, fetchVehicles, createMaintenanceReminder, completeReminder } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [showForm, setShowForm] = useState(false);
  const [selectedVehicleForForm, setSelectedVehicleForForm] = useState<string>('');

  useEffect(() => {
    fetchMaintenanceReminders();
    fetchVehicles();
  }, [fetchMaintenanceReminders, fetchVehicles]);

  const handleCreateReminder = async (data: any) => {
    try {
      await createMaintenanceReminder(data);
      setShowForm(false);
      setSelectedVehicleForForm('');
      // Recarregar dados após criar
      fetchMaintenanceReminders();
    } catch (error) {
      console.error('Erro ao criar lembrete:', error);
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
                         (filterStatus === 'pending' && !reminder.isCompleted) ||
                         (filterStatus === 'completed' && reminder.isCompleted);
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
          <p className="text-sm text-gray-600">Gerencie todos os lembretes dos seus veículos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Lembrete
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  {maintenanceReminders.filter(r => !r.isCompleted).length}
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
                  {maintenanceReminders.filter(r => r.isCompleted).length}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Novo Lembrete</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="form-label">Selecione o veículo</label>
              <select
                className="form-input"
                value={selectedVehicleForForm}
                onChange={(e) => setSelectedVehicleForForm(e.target.value)}
                required
              >
                <option value="">Escolha um veículo</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
                  </option>
                ))}
              </select>
            </div>

            {selectedVehicleForForm && (
              <ReminderForm
                vehicleId={selectedVehicleForForm}
                onSubmit={handleCreateReminder}
                isLoading={false}
              />
            )}
          </div>
        </div>
      )}

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
          getVehicleName={getVehicleName}
        />
      </div>
    </div>
  );
};

export { RemindersPage };
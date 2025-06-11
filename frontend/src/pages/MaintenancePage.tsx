import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Search, Filter } from 'lucide-react';
import MaintenanceTimeline from '../components/dashboard/MaintenanceTimeline';
import MaintenanceForm from '../components/forms/MaintenanceForm';

const MaintenancePage: React.FC = () => {
  const { maintenanceServices, vehicles, fetchMaintenanceServices, fetchVehicles, createMaintenanceService } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedVehicleForForm, setSelectedVehicleForForm] = useState<string>('');

  useEffect(() => {
    fetchMaintenanceServices();
    fetchVehicles();
  }, [fetchMaintenanceServices, fetchVehicles]);

  const handleCreateMaintenance = async (data: any) => {
    try {
      await createMaintenanceService(data);
      setShowForm(false);
      setSelectedVehicleForForm('');
      // Recarregar dados após criar
      fetchMaintenanceServices();
    } catch (error) {
      console.error('Erro ao criar manutenção:', error);
    }
  };

  const filteredServices = maintenanceServices.filter(service => {
    // Adicionar verificações de segurança para campos que podem ser undefined
    const description = service.description || '';
    const provider = service.provider || '';
    
    const matchesSearch = description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVehicle = selectedVehicle === 'all' || service.vehicleId === selectedVehicle;
    return matchesSearch && matchesVehicle;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manutenções</h1>
          <p className="text-sm text-gray-600">Gerencie todas as manutenções dos seus veículos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Manutenção
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="form-input pl-10"
            placeholder="Buscar por descrição ou fornecedor..."
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
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Nova Manutenção</h3>
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
              <MaintenanceForm
                vehicleId={selectedVehicleForForm}
                onSubmit={handleCreateMaintenance}
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
            Histórico de Manutenções
            {filteredServices.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({filteredServices.length} registro{filteredServices.length !== 1 ? 's' : ''})
              </span>
            )}
          </h2>
        </div>

        <MaintenanceTimeline services={filteredServices} />
      </div>
    </div>
  );
};

export default MaintenancePage; 
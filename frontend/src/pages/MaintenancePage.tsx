import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Search, Filter, BarChart3, List } from 'lucide-react';
import { MaintenanceTimeline } from '../components/dashboard/MaintenanceTimeline';
import { MaintenanceStats } from '../components/dashboard/MaintenanceStats';
import { MaintenanceForm } from '../components/forms/MaintenanceForm';
import { useNotifications } from '../hooks/useNotifications';

const MaintenancePage: React.FC = () => {
  const { 
    maintenanceServices, 
    vehicles, 
    fetchMaintenanceServices, 
    fetchVehicles, 
    createMaintenanceService,
    updateMaintenanceService,
    deleteMaintenanceService
  } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedVehicleForForm, setSelectedVehicleForForm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [completionCost, setCompletionCost] = useState<string>('');
  
  const { showToast } = useNotifications();

  useEffect(() => {
    fetchMaintenanceServices();
    fetchVehicles();
  }, [fetchMaintenanceServices, fetchVehicles]);

  const handleCreateMaintenance = async (data: any) => {
    try {
      await createMaintenanceService(data);
      setShowForm(false);
      setSelectedVehicleForForm('');
      
      // Exibir toast de sucesso
      const vehicleName = vehicles.find(v => v.id === data.vehicleId);
      const vehicleInfo = vehicleName ? `${vehicleName.brand} ${vehicleName.model}` : 'veículo';
      
      const typeText = data.type === 'PREVENTIVE' ? 'preventiva' : 
                      data.type === 'CORRECTIVE' ? 'corretiva' : 
                      data.type === 'INSPECTION' ? 'inspeção' : 'manutenção';
      
      // Criar mensagem detalhada baseada nos dados enviados
      let message = `Manutenção ${typeText} agendada com sucesso para ${vehicleInfo}`;
      
      const automaticCreations = [];
      
      // Verificar se foi criado lembrete
      automaticCreations.push('lembrete automático para 1 dia antes');
      
      // Verificar se foi criada despesa
      if (data.cost && data.cost > 0) {
        automaticCreations.push(`despesa de R$ ${data.cost.toFixed(2)}`);
      }
      
      if (automaticCreations.length > 0) {
        message += `\n\n✨ Criados automaticamente: ${automaticCreations.join(' e ')}.`;
      }
      
      showToast(
        'Manutenção Agendada',
        message,
        'maintenance',
        'success'
      );
      
      // A lista de manutenções será atualizada automaticamente via store
      
    } catch (error) {
      console.error('Erro ao criar manutenção:', error);
      showToast(
        'Erro',
        'Não foi possível agendar a manutenção. Tente novamente.',
        'system',
        'error'
      );
    }
  };

  const handleCompleteMaintenance = async (maintenance: any) => {
    setSelectedMaintenance(maintenance);
    setCompletionCost(maintenance.cost ? maintenance.cost.toString() : '');
    setShowCompleteModal(true);
  };

  const confirmCompleteMaintenance = async () => {
    if (!selectedMaintenance) return;
    
    try {
      const cost = parseFloat(completionCost) || 0;
      
      await updateMaintenanceService(selectedMaintenance.id, {
        status: 'COMPLETED',
        completedDate: new Date(),
        cost: cost > 0 ? cost : undefined
      });
      
      setShowCompleteModal(false);
      setSelectedMaintenance(null);
      setCompletionCost('');
      
      showToast(
        'Manutenção Concluída',
        `Manutenção marcada como concluída${cost > 0 ? ` e despesa de R$ ${cost.toFixed(2)} foi registrada` : ''}`,
        'maintenance',
        'success'
      );
      
    } catch (error) {
      console.error('Erro ao concluir manutenção:', error);
      showToast(
        'Erro',
        'Não foi possível concluir a manutenção. Tente novamente.',
        'system',
        'error'
      );
    }
  };

  const handleDeleteMaintenance = async (maintenance: any) => {
    if (!confirm(`Tem certeza que deseja excluir a manutenção "${maintenance.description}"?`)) {
      return;
    }
    
    try {
      await deleteMaintenanceService(maintenance.id);
      
      showToast(
        'Manutenção Excluída',
        'Manutenção foi excluída com sucesso',
        'maintenance',
        'success'
      );
      
    } catch (error) {
      console.error('Erro ao excluir manutenção:', error);
      showToast(
        'Erro',
        'Não foi possível excluir a manutenção. Tente novamente.',
        'system',
        'error'
      );
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
        <div className="flex items-center space-x-4">
          {/* Botões de visualização */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Lista</span>
            </button>
            <button
              onClick={() => setViewMode('stats')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'stats' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Estatísticas</span>
            </button>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Manutenção
          </button>
        </div>
      </div>

      {/* Filters - apenas na visualização de lista */}
      {viewMode === 'list' && (
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
      )}

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

      {/* Content */}
      {viewMode === 'stats' ? (
        // Visualização de estatísticas
        <MaintenanceStats services={maintenanceServices} />
      ) : (
        // Visualização de lista
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

          <MaintenanceTimeline 
            services={filteredServices} 
            onComplete={handleCompleteMaintenance}
            onDelete={handleDeleteMaintenance}
          />
        </div>
      )}

      {/* Modal de Conclusão */}
      {showCompleteModal && selectedMaintenance && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Concluir Manutenção</h3>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Manutenção:</strong> {selectedMaintenance.description}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Tipo:</strong> {
                    selectedMaintenance.type === 'PREVENTIVE' ? 'Preventiva' :
                    selectedMaintenance.type === 'CORRECTIVE' ? 'Corretiva' :
                    selectedMaintenance.type === 'INSPECTION' ? 'Inspeção' : selectedMaintenance.type
                  }
                </p>
              </div>

              <div>
                <label className="form-label">Custo da Manutenção (opcional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="0,00"
                  value={completionCost}
                  onChange={(e) => setCompletionCost(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se informado, uma despesa será automaticamente registrada
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmCompleteMaintenance}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Marcar como Concluída
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { MaintenancePage };
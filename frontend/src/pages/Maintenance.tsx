import React, { useState } from 'react';
import { Plus, Search, Wrench, Calendar, DollarSign, AlertTriangle, Car } from 'lucide-react';

const mockMaintenances = [
  {
    id: '1',
    vehicle: { id: '1', brand: 'Toyota', model: 'Corolla', licensePlate: 'ABC1234', image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200' },
    type: 'preventive',
    description: 'Troca de óleo e filtros',
    date: '2024-03-15',
    cost: 350.0,
    mileage: 45000,
    status: 'scheduled',
    nextMaintenance: '2024-09-15',
  },
  {
    id: '2',
    vehicle: { id: '2', brand: 'Honda', model: 'Civic', licensePlate: 'DEF5678', image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200' },
    type: 'corrective',
    description: 'Substituição de pastilhas de freio',
    date: '2024-02-20',
    cost: 280.0,
    mileage: 30000,
    status: 'completed',
  },
  {
    id: '3',
    vehicle: { id: '3', brand: 'Volkswagen', model: 'Golf', licensePlate: 'GHI9012', image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200' },
    type: 'preventive',
    description: 'Revisão geral',
    date: '2024-03-01',
    cost: 500.0,
    mileage: 60000,
    status: 'in_progress',
  },
];

const Maintenance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredMaintenances = mockMaintenances.filter(maintenance => {
    const matchesSearch = 
      maintenance.vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      maintenance.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      maintenance.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || maintenance.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getTypeText = (type: string) => {
    switch (type) {
      case 'preventive':
        return 'Preventiva';
      case 'corrective':
        return 'Corretiva';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendada';
      case 'in_progress':
        return 'Em Andamento';
      case 'completed':
        return 'Concluída';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-lg">Manutenções</h1>
          <span className="text-gray-400 text-lg font-medium">Gerencie todas as manutenções dos seus veículos</span>
        </div>
        <button
          onClick={() => window.location.href = '/maintenance/new'}
          className="btn-primary px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform text-lg font-bold"
        >
          <Plus className="w-5 h-5 mr-2" /> Nova Manutenção
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-base"
            placeholder="Buscar por veículo ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-base"
        >
          <option value="all">Todos os tipos</option>
          <option value="preventive">Preventiva</option>
          <option value="corrective">Corretiva</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaintenances.map((maintenance) => (
          <div
            key={maintenance.id}
            onClick={() => window.location.href = `/maintenance/${maintenance.id}`}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all border-2 border-blue-100 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-4 border-blue-100 group-hover:border-blue-300 transition">
                  <img
                    src={maintenance.vehicle.image}
                    alt={`${maintenance.vehicle.brand} ${maintenance.vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition">
                    {maintenance.vehicle.brand} {maintenance.vehicle.model}
                  </h3>
                  <p className="text-sm text-gray-500">{maintenance.vehicle.licensePlate}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(maintenance.status)}`}>
                {getStatusText(maintenance.status)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Wrench className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{maintenance.description}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">
                  Data: {new Date(maintenance.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">
                  Custo: R$ {maintenance.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {maintenance.nextMaintenance && (
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Próxima manutenção: {new Date(maintenance.nextMaintenance).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredMaintenances.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma manutenção encontrada</h3>
          <p className="text-gray-500">Tente ajustar sua busca ou adicione uma nova manutenção.</p>
        </div>
      )}
    </div>
  );
};

export default Maintenance; 
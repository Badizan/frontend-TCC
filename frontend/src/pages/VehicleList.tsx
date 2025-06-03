import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Car, Calendar, Gauge, AlertTriangle } from 'lucide-react';

const mockVehicles = [
  {
    id: '1',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    licensePlate: 'ABC1234',
    color: 'Prata',
    mileage: 45000,
    lastMaintenance: '2023-12-15',
    nextMaintenance: '2024-06-15',
    status: 'active',
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200',
  },
  {
    id: '2',
    brand: 'Honda',
    model: 'Civic',
    year: 2021,
    licensePlate: 'DEF5678',
    color: 'Preto',
    mileage: 30000,
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-07-10',
    status: 'active',
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200',
  },
  {
    id: '3',
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2019,
    licensePlate: 'GHI9012',
    color: 'Branco',
    mileage: 60000,
    lastMaintenance: '2024-02-01',
    nextMaintenance: '2024-08-01',
    status: 'maintenance',
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200',
  },
];

const VehicleList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = mockVehicles.filter(vehicle =>
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'maintenance':
        return 'Em Manutenção';
      case 'inactive':
        return 'Inativo';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-lg">Meus Veículos</h1>
          <span className="text-gray-400 text-lg font-medium">Gerencie todos os seus veículos cadastrados</span>
        </div>
        <Link
          to="/vehicles/new"
          className="btn-primary px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform text-lg font-bold"
        >
          <Plus className="w-5 h-5 mr-2" /> Novo Veículo
        </Link>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-base"
          placeholder="Buscar por marca, modelo ou placa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <Link
            key={vehicle.id}
            to={`/vehicles/${vehicle.id}`}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all border-2 border-blue-100 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-4 border-blue-100 group-hover:border-blue-300 transition">
                  <img
                    src={vehicle.image}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.color}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(vehicle.status)}`}>
                {getStatusText(vehicle.status)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Gauge className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{vehicle.mileage.toLocaleString('pt-BR')} km</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">
                  Próxima manutenção: {new Date(vehicle.nextMaintenance).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {vehicle.status === 'maintenance' && (
                <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Em manutenção</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum veículo encontrado</h3>
          <p className="text-gray-500">Tente ajustar sua busca ou adicione um novo veículo.</p>
        </div>
      )}
    </div>
  );
};

export default VehicleList;
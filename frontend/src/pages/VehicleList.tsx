import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';

const VehicleList: React.FC = () => {
  const { vehicles, fetchVehicles } = useAppStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const formatVehicleType = (type: string) => {
    switch (type) {
      case 'CAR': return 'Carro';
      case 'MOTORCYCLE': return 'Motocicleta';
      case 'TRUCK': return 'Caminhão';
      case 'VAN': return 'Van/Utilitário';
      default: return type;
    }
  };

  const getStatusBadge = () => {
    return {
      text: 'Ativo',
      className: 'bg-green-100 text-green-800'
    };
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Meus Veículos</h1>
          <p className="text-sm text-gray-600">Gerencie todos os seus veículos cadastrados</p>
        </div>
        <button
          onClick={() => navigate('/vehicles/new')}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Veículo
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="form-input pl-10"
          placeholder="Buscar por marca, modelo ou placa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Vehicle Cards */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Tente ajustar sua busca ou adicione um novo veículo.'
              : 'Comece cadastrando seu primeiro veículo.'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/vehicles/new')}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeiro Veículo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => {
            const status = getStatusBadge();
            return (
              <div
                key={vehicle.id}
                className="card cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/vehicles/${vehicle.id}`)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`badge ${status.className}`}>
                      {status.text}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatVehicleType(vehicle.type)}
                    </span>
                  </div>
                  
                  <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2" />
                        <circle cx="7" cy="17" r="2" />
                        <path d="M9 17h6" />
                        <circle cx="17" cy="17" r="2" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">{vehicle.brand} {vehicle.model}</h3>
                    <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.licensePlate}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-4 h-4 mr-2">📋</span>
                      Placa: {vehicle.licensePlate}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-4 h-4 mr-2">🚗</span>
                      {formatVehicleType(vehicle.type)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-4 h-4 mr-2">📅</span>
                      Ano: {vehicle.year}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VehicleList;
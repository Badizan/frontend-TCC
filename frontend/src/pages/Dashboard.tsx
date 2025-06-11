import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { vehicles, fetchVehicles } = useAppStore();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      await fetchVehicles();
      setLoading(false);
    };
    loadData();
  }, [fetchVehicles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Resumo geral do sistema</p>
        </div>
        <button
          onClick={() => navigate('/vehicles/new')}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Veículo
        </button>
      </div>

      {/* Alert */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-orange-800">
              Manutenção pendente
            </h3>
            <div className="mt-1 text-sm text-orange-700">
              <p>Troca de óleo em 15 dias para Toyota Corolla</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            <span className="mr-2">🚗</span>
            Meus Veículos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="card cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/vehicles/${vehicle.id}`)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  {vehicle.image ? (
                    <img
                      src={vehicle.image}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2" />
                        <circle cx="7" cy="17" r="2" />
                        <path d="M9 17h6" />
                        <circle cx="17" cy="17" r="2" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{vehicle.brand} {vehicle.model}</h3>
                  <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.licensePlate}</p>
                  <p className="text-sm text-gray-500">Tipo: {vehicle.type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              <span className="mr-2">📅</span>
              Próximas Manutenções
            </h3>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-gray-500">Nenhuma manutenção agendada</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              <span className="mr-2">📊</span>
              Histórico de Manutenções
            </h3>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-gray-500">Nenhuma manutenção registrada</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
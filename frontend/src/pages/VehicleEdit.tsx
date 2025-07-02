import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { VehicleForm } from '../components/forms/VehicleForm';
import { translateError } from '../utils/errorTranslations';

export const VehicleEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedVehicle, selectVehicle, updateVehicleData, loading } = useAppStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      selectVehicle(id);
    }
  }, [id, selectVehicle]);

  const handleSubmit = async (vehicleData: any) => {
    try {
      setError(null); // Limpar erro anterior
      
      if (id) {
        await updateVehicleData(id, vehicleData);
        navigate(`/vehicles/${id}`);
      }
    } catch (error: any) {
      console.error('Error updating vehicle:', error);
      
      // Traduzir e exibir erro específico
      let errorMessage = 'Ocorreu um erro inesperado ao atualizar o veículo';
      
      if (error?.message) {
        errorMessage = translateError(error.message);
      } else if (error?.response?.data?.message) {
        errorMessage = translateError(error.response.data.message);
      } else if (typeof error === 'string') {
        errorMessage = translateError(error);
      }
      
      setError(errorMessage);
    }
  };

  if (!selectedVehicle) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-pulse text-primary-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(`/vehicles/${id}`)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Editar {selectedVehicle.brand} {selectedVehicle.model}
        </h1>
      </div>

      {/* Exibir erro se houver */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Erro ao atualizar veículo</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <VehicleForm 
          initialData={selectedVehicle} 
          onSubmit={handleSubmit} 
          isLoading={loading} 
        />
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { VehicleForm } from '../components/forms/VehicleForm';
import { translateError } from '../utils/errorTranslations';

export const VehicleNew: React.FC = () => {
  const { createVehicle, loading } = useAppStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (vehicleData: any) => {
    console.log('🚗 Tentando criar veículo:', vehicleData);
    setError(null); // Limpar erro anterior
    
    try {
      const newVehicle = await createVehicle(vehicleData);
      console.log('✅ Veículo criado com sucesso:', newVehicle);
      if (newVehicle && newVehicle.id) {
        navigate(`/vehicles/${newVehicle.id}`);
      } else {
        navigate('/vehicles');
      }
    } catch (error: any) {
      console.error('❌ Erro ao criar veículo:', error);
      console.log('🔍 MENSAGEM DE ERRO COMPLETA:', {
        errorType: typeof error,
        errorMessage: error?.message,
        errorResponse: error?.response,
        errorResponseData: error?.response?.data,
        errorResponseMessage: error?.response?.data?.message
      });
      
      // Traduzir e exibir erro específico
      let errorMessage = 'Ocorreu um erro inesperado ao criar o veículo';
      
      // Tentar extrair a mensagem de erro de diferentes locais
      if (error?.response?.data?.message) {
        errorMessage = translateError(error.response.data.message);
      } else if (error?.message) {
        errorMessage = translateError(error.message);
      } else if (typeof error === 'string') {
        errorMessage = translateError(error);
      } else if (error?.response?.data) {
        // Se não há message específica, mas há data, tentar usar o data como string
        const dataString = JSON.stringify(error.response.data);
        errorMessage = translateError(dataString);
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 sm:mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Adicionar Novo Veículo</h1>
      </div>

      {/* Exibir erro se houver */}
      {error && (
        <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mr-2 sm:mr-3" />
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-red-800">Erro ao criar veículo</h3>
              <p className="text-xs sm:text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <VehicleForm onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  );
};
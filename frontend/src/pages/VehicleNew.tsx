import React from 'react';
import { useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import VehicleForm from '../components/forms/VehicleForm';

const VehicleNew: React.FC = () => {
  const { createVehicle, loading } = useAppStore();
  const navigate = useNavigate();

  const handleSubmit = async (vehicleData: any) => {
    console.log('🚗 Tentando criar veículo:', vehicleData);
    try {
      const newVehicle = await createVehicle(vehicleData);
      console.log('✅ Veículo criado com sucesso:', newVehicle);
      if (newVehicle && newVehicle.id) {
        navigate(`/vehicles/${newVehicle.id}`);
      } else {
        navigate('/vehicles');
      }
    } catch (error) {
      console.error('❌ Erro ao criar veículo:', error);
      alert(`Erro ao criar veículo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Adicionar Novo Veículo</h1>
      </div>

      <div className="card">
        <VehicleForm onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  );
};

export default VehicleNew;
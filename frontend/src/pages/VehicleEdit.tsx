import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ArrowLeft } from 'lucide-react';
import { VehicleForm } from '../components/forms/VehicleForm';

export const VehicleEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedVehicle, selectVehicle, updateVehicleData, loading } = useAppStore();

  useEffect(() => {
    if (id) {
      selectVehicle(id);
    }
  }, [id, selectVehicle]);

  const handleSubmit = async (vehicleData: any) => {
    try {
      if (id) {
        await updateVehicleData(id, vehicleData);
        navigate(`/vehicles/${id}`);
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
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

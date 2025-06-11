import React, { useState } from 'react';
import { Vehicle, VehicleType } from '../../types';
import { useAppStore } from '../../store';

interface VehicleFormProps {
  initialData?: Partial<Vehicle>;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const { user } = useAppStore();
  
  const [formData, setFormData] = useState({
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    licensePlate: initialData?.licensePlate || '',
    type: (initialData?.type as VehicleType) || 'CAR',
    ownerId: initialData?.ownerId || user?.id || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="brand" className="form-label">
            Marca <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="form-input"
            placeholder="Ex: Toyota, Honda, Ford"
            required
          />
        </div>

        <div>
          <label htmlFor="model" className="form-label">
            Modelo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="form-input"
            placeholder="Ex: Corolla, Civic, Fiesta"
            required
          />
        </div>

        <div>
          <label htmlFor="year" className="form-label">
            Ano <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="form-input"
            min="1900"
            max={new Date().getFullYear() + 1}
            required
          />
        </div>

        <div>
          <label htmlFor="licensePlate" className="form-label">
            Placa <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="licensePlate"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            className="form-input"
            placeholder="Ex: ABC-1234"
            pattern="[A-Z]{3}-?[0-9]{4}"
            title="Formato: ABC-1234 ou ABC1234"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="type" className="form-label">
            Tipo de Veículo <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="CAR">Carro</option>
            <option value="MOTORCYCLE">Motocicleta</option>
            <option value="TRUCK">Caminhão</option>
            <option value="VAN">Van/Utilitário</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Informações Importantes:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Todos os campos marcados com * são obrigatórios</li>
          <li>• A placa deve seguir o padrão brasileiro (ABC-1234)</li>
          <li>• Os dados podem ser editados posteriormente</li>
        </ul>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : initialData?.id ? 'Atualizar Veículo' : 'Cadastrar Veículo'}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;
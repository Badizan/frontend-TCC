import React, { useState } from 'react';
import { Vehicle } from '../../types';

interface VehicleFormProps {
  initialData?: Partial<Vehicle>;
  onSubmit: (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isLoading: boolean;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    licensePlate: initialData?.licensePlate || '',
    currentMileage: initialData?.currentMileage || 0,
    fuelType: initialData?.fuelType || 'flex',
    image: initialData?.image || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'currentMileage' ? Number(value) : value,
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
          <label htmlFor="name" className="form-label">
            Nome do Veículo
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            placeholder="Ex: Meu Carro Principal"
            required
          />
        </div>

        <div>
          <label htmlFor="brand" className="form-label">
            Marca
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="form-input"
            placeholder="Ex: Toyota"
            required
          />
        </div>

        <div>
          <label htmlFor="model" className="form-label">
            Modelo
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="form-input"
            placeholder="Ex: Corolla"
            required
          />
        </div>

        <div>
          <label htmlFor="year" className="form-label">
            Ano
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
            Placa
          </label>
          <input
            type="text"
            id="licensePlate"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            className="form-input"
            placeholder="Ex: ABC1234"
            required
          />
        </div>

        <div>
          <label htmlFor="currentMileage" className="form-label">
            Quilometragem Atual
          </label>
          <input
            type="number"
            id="currentMileage"
            name="currentMileage"
            value={formData.currentMileage}
            onChange={handleChange}
            className="form-input"
            min="0"
            required
          />
        </div>

        <div>
          <label htmlFor="fuelType" className="form-label">
            Tipo de Combustível
          </label>
          <select
            id="fuelType"
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="gasoline">Gasolina</option>
            <option value="ethanol">Etanol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Elétrico</option>
            <option value="hybrid">Híbrido</option>
            <option value="flex">Flex</option>
          </select>
        </div>

        <div>
          <label htmlFor="image" className="form-label">
            URL da Imagem (opcional)
          </label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="form-input"
            placeholder="https://exemplo.com/imagem.jpg"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : 'Salvar Veículo'}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;
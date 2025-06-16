import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { user } = useAppStore();
  
  const [formData, setFormData] = useState({
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    licensePlate: initialData?.licensePlate || '',
    type: (initialData?.type as VehicleType) || 'CAR',
    color: initialData?.color || '',
    mileage: initialData?.mileage || 0,
    ownerId: initialData?.ownerId || user?.id || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Formatação especial para placa
    if (name === 'licensePlate') {
      // Remove caracteres não alfanuméricos e converte para maiúsculo
      processedValue = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      
      // Aplica formatação ABC-1234 ou ABC-1A23
      if (processedValue.length > 3) {
        processedValue = processedValue.slice(0, 3) + '-' + processedValue.slice(3, 7);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'mileage' ? Number(value) : processedValue,
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
            maxLength={8}
            title="Formato brasileiro: ABC-1234 ou ABC-1A23 (Mercosul)"
            required
          />
        </div>

        <div>
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

        <div>
          <label htmlFor="color" className="form-label">
            Cor
          </label>
          <input
            type="text"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="form-input"
            placeholder="Ex: Branco, Preto, Azul"
          />
        </div>

        <div>
          <label htmlFor="mileage" className="form-label">
            Quilometragem Atual
          </label>
          <input
            type="number"
            id="mileage"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            className="form-input"
            min="0"
            placeholder="Ex: 50000"
          />
        </div>
      </div>

              <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Informações Importantes:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Todos os campos marcados com * são obrigatórios</li>
          <li>• A placa será formatada automaticamente (ABC-1234 ou ABC-1A23)</li>
          <li>• Os dados podem ser editados posteriormente</li>
          <li>• Campos opcionais: cor e quilometragem</li>
        </ul>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate(-1)}
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
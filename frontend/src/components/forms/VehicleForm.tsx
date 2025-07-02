import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vehicle, VehicleType } from '../../types';
import { useAppStore } from '../../store';

interface VehicleFormProps {
  initialData?: Partial<Vehicle>;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validar marca
    if (!formData.brand.trim()) {
      newErrors.brand = 'Marca é obrigatória';
    } else if (formData.brand.length < 2) {
      newErrors.brand = 'Marca deve ter pelo menos 2 caracteres';
    }

    // Validar modelo
    if (!formData.model.trim()) {
      newErrors.model = 'Modelo é obrigatório';
    } else if (formData.model.length < 2) {
      newErrors.model = 'Modelo deve ter pelo menos 2 caracteres';
    }

    // Validar ano
    const currentYear = new Date().getFullYear();
    if (formData.year < 1900 || formData.year > currentYear + 1) {
      newErrors.year = `Ano deve estar entre 1900 e ${currentYear + 1}`;
    }

    // Validar placa
    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'Placa é obrigatória';
    } else {
      const plateRegex = /^[A-Z]{3}-?[0-9]{4}$|^[A-Z]{3}-?[0-9][A-Z][0-9]{2}$/;
      if (!plateRegex.test(formData.licensePlate.toUpperCase())) {
        newErrors.licensePlate = 'Formato de placa inválido (ex: ABC-1234 ou ABC-1D23)';
      }
    }

    // Validar quilometragem
    if (formData.mileage < 0) {
      newErrors.mileage = 'Quilometragem não pode ser negativa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

    // Limpar erro quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      setErrors({ submit: 'Usuário não autenticado. Faça login novamente.' });
      return;
    }

    // Para atualização, não enviar ownerId (apenas para criação)
    const submitData = { ...formData };
    
    // Se é uma atualização (tem initialData), remover ownerId
    if (initialData?.id) {
      delete submitData.ownerId;
      console.log('🔄 VehicleForm: Enviando dados de atualização (sem ownerId):', submitData);
    } else {
      // Para criação, incluir ownerId
      submitData.ownerId = user.id;
      console.log('🆕 VehicleForm: Enviando dados de criação (com ownerId):', submitData);
    }

    onSubmit(submitData);
  };

  const vehicleTypes = [
    { value: 'CAR', label: 'Carro' },
    { value: 'MOTORCYCLE', label: 'Motocicleta' },
    { value: 'TRUCK', label: 'Caminhão' },
    { value: 'VAN', label: 'Van/Utilitário' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marca */}
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
            Marca *
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Ex: Toyota, Honda, Ford..."
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.brand ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
        </div>

        {/* Modelo */}
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
            Modelo *
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="Ex: Corolla, Civic, Focus..."
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.model ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
        </div>

        {/* Ano */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
            Ano *
          </label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear() + 1}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.year ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
        </div>

        {/* Placa */}
        <div>
          <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-2">
            Placa *
          </label>
          <input
            type="text"
            id="licensePlate"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            placeholder="ABC-1234 ou ABC-1D23"
            maxLength={8}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.licensePlate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.licensePlate && <p className="mt-1 text-sm text-red-600">{errors.licensePlate}</p>}
          <p className="mt-1 text-xs text-gray-500">
            Formato: ABC-1234 (antigo) ou ABC-1D23 (Mercosul)
          </p>
        </div>

        {/* Tipo */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Veículo *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {vehicleTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Cor */}
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
            Cor
          </label>
          <input
            type="text"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="Ex: Branco, Prata, Preto..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        {/* Quilometragem */}
        <div className="md:col-span-2">
          <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-2">
            Quilometragem Atual (km)
          </label>
          <input
            type="number"
            id="mileage"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            min="0"
            placeholder="0"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.mileage ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.mileage && <p className="mt-1 text-sm text-red-600">{errors.mileage}</p>}
        </div>
      </div>

      {/* Informação sobre campos obrigatórios */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-blue-700 text-sm">
          <span className="font-medium">Dica:</span> Os campos marcados com * são obrigatórios. 
          Certifique-se de que a placa não esteja já cadastrada no sistema.
        </p>
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || !user?.id}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Salvando...' : initialData ? 'Atualizar Veículo' : 'Cadastrar Veículo'}
        </button>
      </div>
    </form>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocalDateString, getTodayString, parseLocalDate } from '../../utils/formatters';

interface ExpenseFormProps {
  vehicleId: string;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  vehicleId,
  onSubmit,
  isLoading,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicleId,
    description: '',
    amount: 0,
    date: getTodayString(),
    category: 'FUEL',
    mileage: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' || name === 'mileage' ? Number(value) : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      ...formData,
      date: parseLocalDate(formData.date),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="description" className="form-label">
            Descrição <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`form-input ${errors.description ? 'border-red-500' : ''}`}
            placeholder="Ex: Abastecimento, Óleo do motor"
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="form-label">
            Categoria <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`form-input ${errors.category ? 'border-red-500' : ''}`}
            required
          >
            <option value="">Selecione uma categoria</option>
            <option value="FUEL">Combustível</option>
            <option value="MAINTENANCE">Manutenção</option>
            <option value="INSURANCE">Seguro</option>
            <option value="TOLLS">Pedágios</option>
            <option value="PARKING">Estacionamento</option>
            <option value="FINES">Multas</option>
            <option value="OTHER">Outros</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="form-label">
            Valor (R$) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className={`form-input ${errors.amount ? 'border-red-500' : ''}`}
            min="0"
            step="0.01"
            placeholder="Ex: 75.50"
            required
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        <div>
          <label htmlFor="date" className="form-label">
            Data <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`form-input ${errors.date ? 'border-red-500' : ''}`}
            max={getTodayString()}
            required
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        <div>
          <label htmlFor="mileage" className="form-label">
            Quilometragem (opcional)
          </label>
          <input
            type="number"
            id="mileage"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            className="form-input"
            min="0"
            placeholder="Ex: 45000"
          />
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-green-800 mb-2">Categorias de Despesa:</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• <strong>Combustível:</strong> Gasolina, etanol, diesel</li>
          <li>• <strong>Manutenção:</strong> Serviços e peças</li>
          <li>• <strong>Seguro:</strong> Seguro do veículo</li>
          <li>• <strong>Pedágios:</strong> Taxas de pedágio</li>
          <li>• <strong>Estacionamento:</strong> Custos de estacionamento</li>
          <li>• <strong>Multas:</strong> Infrações de trânsito</li>
          <li>• <strong>Outros:</strong> Demais gastos relacionados</li>
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
          {isLoading ? 'Salvando...' : 'Registrar Despesa'}
        </button>
      </div>
    </form>
  );
};
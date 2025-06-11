import React, { useState } from 'react';

interface ExpenseFormProps {
  vehicleId: string;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  vehicleId,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    vehicleId,
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: 'FUEL',
    mileage: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' || name === 'mileage' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      date: new Date(formData.date),
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
            className="form-input"
            placeholder="Ex: Abastecimento, Óleo do motor"
            required
          />
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
            className="form-input"
            required
          >
            <option value="FUEL">Combustível</option>
            <option value="MAINTENANCE">Manutenção</option>
            <option value="INSURANCE">Seguro</option>
            <option value="TOLLS">Pedágios</option>
            <option value="PARKING">Estacionamento</option>
            <option value="FINES">Multas</option>
            <option value="OTHER">Outros</option>
          </select>
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
            className="form-input"
            min="0"
            step="0.01"
            placeholder="Ex: 75.50"
            required
          />
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
            className="form-input"
            required
          />
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
          {isLoading ? 'Salvando...' : 'Registrar Despesa'}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
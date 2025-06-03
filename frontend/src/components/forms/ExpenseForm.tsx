import React, { useState } from 'react';
import { Expense } from '../../types';

interface ExpenseFormProps {
  vehicleId: string;
  onSubmit: (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isLoading: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  vehicleId,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>({
    vehicleId,
    category: 'fuel',
    description: '',
    amount: 0,
    date: new Date(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'amount'
          ? Number(value)
          : name === 'date'
          ? new Date(value)
          : value,
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
          <label htmlFor="category" className="form-label">
            Categoria
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="maintenance">Manutenção</option>
            <option value="fuel">Combustível</option>
            <option value="insurance">Seguro</option>
            <option value="tax">Impostos/Taxas</option>
            <option value="other">Outros</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="form-label">
            Descrição
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-input"
            placeholder="Descreva a despesa"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="form-label">
            Valor (R$)
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
            required
          />
        </div>

        <div>
          <label htmlFor="date" className="form-label">
            Data
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date.toISOString().split('T')[0]}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Registrar Despesa'}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
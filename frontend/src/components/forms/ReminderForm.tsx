import React, { useState } from 'react';
import { MaintenanceReminder } from '../../types';

interface ReminderFormProps {
  vehicleId: string;
  onSubmit: (data: Omit<MaintenanceReminder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isLoading: boolean;
}

const ReminderForm: React.FC<ReminderFormProps> = ({
  vehicleId,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Omit<MaintenanceReminder, 'id' | 'createdAt' | 'updatedAt'>>({
    vehicleId,
    serviceType: '',
    description: '',
    dueDate: undefined,
    dueMileage: undefined,
    isCompleted: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'dueDate'
          ? value ? new Date(value) : undefined
          : name === 'dueMileage'
          ? value ? Number(value) : undefined
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dueDate && !formData.dueMileage) {
      alert('É necessário definir uma data ou quilometragem para o lembrete');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="serviceType" className="form-label">
            Tipo de Serviço
          </label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="" disabled>
              Selecione o tipo de serviço
            </option>
            <option value="Troca de Óleo">Troca de Óleo</option>
            <option value="Revisão">Revisão</option>
            <option value="Freios">Freios</option>
            <option value="Pneus">Pneus</option>
            <option value="Suspensão">Suspensão</option>
            <option value="Bateria">Bateria</option>
            <option value="Elétrica">Elétrica</option>
            <option value="Motor">Motor</option>
            <option value="Ar Condicionado">Ar Condicionado</option>
            <option value="Outro">Outro</option>
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
            placeholder="Descreva o serviço a ser realizado"
            required
          />
        </div>

        <div>
          <label htmlFor="dueDate" className="form-label">
            Data Prevista
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : ''}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="dueMileage" className="form-label">
            Quilometragem Prevista
          </label>
          <input
            type="number"
            id="dueMileage"
            name="dueMileage"
            value={formData.dueMileage || ''}
            onChange={handleChange}
            className="form-input"
            min="0"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Criar Lembrete'}
        </button>
      </div>
    </form>
  );
};

export default ReminderForm;
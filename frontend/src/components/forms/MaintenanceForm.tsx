import React, { useState } from 'react';
import { MaintenanceService } from '../../types';

interface MaintenanceFormProps {
  vehicleId: string;
  onSubmit: (data: Omit<MaintenanceService, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isLoading: boolean;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  vehicleId,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Omit<MaintenanceService, 'id' | 'createdAt' | 'updatedAt'>>({
    vehicleId,
    serviceType: '',
    description: '',
    date: new Date(),
    mileage: 0,
    cost: 0,
    provider: '',
    notes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'date'
          ? new Date(value)
          : name === 'mileage' || name === 'cost'
          ? Number(value)
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
            placeholder="Descreva o serviço realizado"
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

        <div>
          <label htmlFor="mileage" className="form-label">
            Quilometragem
          </label>
          <input
            type="number"
            id="mileage"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            className="form-input"
            min="0"
            required
          />
        </div>

        <div>
          <label htmlFor="cost" className="form-label">
            Custo (R$)
          </label>
          <input
            type="number"
            id="cost"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            className="form-input"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label htmlFor="provider" className="form-label">
            Fornecedor/Oficina
          </label>
          <input
            type="text"
            id="provider"
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            className="form-input"
            placeholder="Ex: Oficina Central"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="nextServiceDate" className="form-label">
            Data do Próximo Serviço (opcional)
          </label>
          <input
            type="date"
            id="nextServiceDate"
            name="nextServiceDate"
            value={formData.nextServiceDate?.toISOString().split('T')[0] || ''}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="nextServiceMileage" className="form-label">
            Quilometragem do Próximo Serviço (opcional)
          </label>
          <input
            type="number"
            id="nextServiceMileage"
            name="nextServiceMileage"
            value={formData.nextServiceMileage || ''}
            onChange={handleChange}
            className="form-input"
            min="0"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="form-label">
            Observações
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="form-input"
            rows={3}
            placeholder="Informações adicionais sobre o serviço"
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Registrar Manutenção'}
        </button>
      </div>
    </form>
  );
};

export default MaintenanceForm;
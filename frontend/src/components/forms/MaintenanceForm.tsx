import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { getLocalDateString, getTodayString, parseLocalDate } from '../../utils/formatters';

type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION';

interface MaintenanceFormProps {
  vehicleId: string;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

interface MaintenanceFormData {
  vehicleId: string;
  mechanicId?: string;
  type: MaintenanceType;
  description: string;
  scheduledDate: string;
  cost?: number;
  notes?: string;
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  vehicleId,
  onSubmit,
  isLoading,
}) => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [formData, setFormData] = useState<MaintenanceFormData>({
    vehicleId,
    mechanicId: user?.id || '',
    type: 'PREVENTIVE',
    description: '',
    scheduledDate: getTodayString(),
    cost: 0,
    notes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cost' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicleId || !formData.description || !formData.scheduledDate) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    onSubmit({
      ...formData,
      scheduledDate: parseLocalDate(formData.scheduledDate),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="type" className="form-label">
            Tipo de Manutenção <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="PREVENTIVE">Preventiva</option>
            <option value="CORRECTIVE">Corretiva</option>
            <option value="INSPECTION">Inspeção</option>
          </select>
        </div>

        <div>
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
            placeholder="Ex: Troca de óleo e filtro"
            required
          />
        </div>

        <div>
          <label htmlFor="scheduledDate" className="form-label">
            Data Agendada <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="scheduledDate"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            className="form-input"
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
            placeholder="Ex: 150.00"
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
            placeholder="Informações adicionais sobre o serviço a ser realizado..."
          ></textarea>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Tipos de Manutenção:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Preventiva:</strong> Manutenções programadas para evitar problemas</li>
            <li>• <strong>Corretiva:</strong> Reparos necessários devido a falhas ou problemas</li>
            <li>• <strong>Inspeção:</strong> Verificações e diagnósticos técnicos</li>
          </ul>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800 mb-2">✨ Criação Automática:</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• <strong>Lembrete:</strong> Será criado 1 dia antes da manutenção</li>
            <li>• <strong>Despesa:</strong> Será criada automaticamente se informar custo</li>
            <li>• <strong>Relatório:</strong> Aparecerá nos relatórios imediatamente</li>
          </ul>
        </div>
      </div>

      {!user?.id && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Atenção: É necessário estar logado como mecânico para registrar manutenções.
          </p>
        </div>
      )}

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
          disabled={isLoading || !user?.id}
        >
          {isLoading ? 'Salvando...' : 'Agendar Manutenção'}
        </button>
      </div>
    </form>
  );
};

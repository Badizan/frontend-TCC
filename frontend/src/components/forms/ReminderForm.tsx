import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ReminderFormProps {
  vehicleId: string;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const ReminderForm: React.FC<ReminderFormProps> = ({
  vehicleId,
  onSubmit,
  isLoading,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicleId,
    description: '',
    dueDate: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      alert('Por favor, preencha a descrição do lembrete.');
      return;
    }

    onSubmit({
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : new Date(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="description" className="form-label">
            Descrição do Lembrete <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-input"
            rows={3}
            placeholder="Ex: Lembrar de trocar o óleo do motor"
            required
          ></textarea>
          <p className="text-xs text-gray-500 mt-1">
            Descreva o que deve ser lembrado (manutenção, revisão, documentos, etc.)
          </p>
        </div>

        <div>
          <label htmlFor="dueDate" className="form-label">
            Data de Vencimento <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="form-input"
            min={new Date().toISOString().split('T')[0]}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Data em que você deseja ser lembrado
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Dicas para Lembretes:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Seja específico na descrição (ex: "Trocar óleo - filtro de ar")</li>
          <li>• Defina datas realistas considerando sua agenda</li>
          <li>• Use lembretes para manutenções preventivas</li>
          <li>• Inclua documentos e papéis do veículo</li>
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
          {isLoading ? 'Salvando...' : 'Criar Lembrete'}
        </button>
      </div>
    </form>
  );
};

export default ReminderForm;
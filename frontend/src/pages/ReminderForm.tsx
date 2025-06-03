import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Bell, Calendar, Car, AlertTriangle } from 'lucide-react';
import Input from '../components/Input';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import Button from '../components/Button';
import Loading from '../components/Loading';

const mockVehicles = [
  { id: '1', brand: 'Toyota', model: 'Corolla', licensePlate: 'ABC1234', image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200' },
  { id: '2', brand: 'Honda', model: 'Civic', licensePlate: 'DEF5678', image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200' },
  { id: '3', brand: 'Volkswagen', model: 'Golf', licensePlate: 'GHI9012', image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200' },
];

const mockReminders = [
  {
    id: '1',
    vehicleId: '1',
    type: 'maintenance',
    description: 'Troca de óleo',
    dueDate: '2024-04-15',
    status: 'pending',
    priority: 'high',
    notes: 'Trocar filtro de óleo também'
  },
  {
    id: '2',
    vehicleId: '2',
    type: 'document',
    description: 'Renovação do seguro',
    dueDate: '2024-05-01',
    status: 'pending',
    priority: 'medium',
    notes: 'Verificar cobertura atual'
  },
  {
    id: '3',
    vehicleId: '3',
    type: 'inspection',
    description: 'Vistoria anual',
    dueDate: '2024-06-30',
    status: 'completed',
    priority: 'low',
    notes: 'Agendar com antecedência'
  }
];

const ReminderForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vehicles] = useState(mockVehicles);
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'maintenance',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    priority: 'medium',
    notes: '',
  });

  useEffect(() => {
    if (id) {
      const reminder = mockReminders.find(r => r.id === id);
      if (reminder) {
        setFormData({
          vehicleId: reminder.vehicleId,
          type: reminder.type,
          description: reminder.description,
          dueDate: reminder.dueDate.split('T')[0],
          status: reminder.status,
          priority: reminder.priority,
          notes: reminder.notes || '',
        });
      }
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/reminders');
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <Loading fullScreen text="Salvando..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="md" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {id ? 'Editar Lembrete' : 'Novo Lembrete'}
            </h1>
            <p className="text-gray-500">Preencha os dados do lembrete</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Informações Gerais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Veículo"
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  options={vehicles.map(vehicle => ({
                    value: vehicle.id,
                    label: `${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate}`
                  }))}
                  required
                />
                <Select
                  label="Tipo"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  options={[
                    { value: 'maintenance', label: 'Manutenção' },
                    { value: 'document', label: 'Documento' },
                    { value: 'inspection', label: 'Vistoria' }
                  ]}
                  required
                />
                <Input
                  label="Data de Vencimento"
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
                <Select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    { value: 'pending', label: 'Pendente' },
                    { value: 'completed', label: 'Concluído' },
                    { value: 'overdue', label: 'Atrasado' }
                  ]}
                  required
                />
                <Select
                  label="Prioridade"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  options={[
                    { value: 'high', label: 'Alta' },
                    { value: 'medium', label: 'Média' },
                    { value: 'low', label: 'Baixa' }
                  ]}
                  required
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Descrição e Observações</h2>
              <div className="space-y-4">
                <Input
                  label="Descrição"
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descrição do lembrete"
                  required
                />
                <Textarea
                  label="Observações"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Observações adicionais"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Resumo</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                    {formData.vehicleId && (
                      <img
                        src={vehicles.find(v => v.id === formData.vehicleId)?.image}
                        alt="Vehicle"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {formData.vehicleId
                        ? `${vehicles.find(v => v.id === formData.vehicleId)?.brand} ${vehicles.find(v => v.id === formData.vehicleId)?.model}`
                        : 'Selecione um veículo'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formData.vehicleId
                        ? vehicles.find(v => v.id === formData.vehicleId)?.licensePlate
                        : 'Nenhum veículo selecionado'}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tipo</span>
                    <span className="font-medium">
                      {formData.type === 'maintenance' ? 'Manutenção' : formData.type === 'document' ? 'Documento' : 'Vistoria'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium">
                      {formData.status === 'pending' ? 'Pendente' : formData.status === 'completed' ? 'Concluído' : 'Atrasado'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Prioridade</span>
                    <span className="font-medium">
                      {formData.priority === 'high' ? 'Alta' : formData.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Vencimento</span>
                    <span className="font-medium">
                      {new Date(formData.dueDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              leftIcon={<Save className="w-5 h-5 mr-2 inline" />}
            >
              {id ? 'Salvar Alterações' : 'Criar Lembrete'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReminderForm; 
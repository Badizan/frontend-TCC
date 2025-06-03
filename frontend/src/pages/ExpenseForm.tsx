import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, DollarSign, Car, Calendar, Tag, AlertTriangle } from 'lucide-react';
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

const mockExpenses = [
  {
    id: '1',
    vehicleId: '1',
    type: 'fuel',
    description: 'Abastecimento',
    date: '2024-03-15',
    amount: 150.0,
    mileage: 45000,
    notes: 'Combustível comum'
  },
  {
    id: '2',
    vehicleId: '2',
    type: 'maintenance',
    description: 'Troca de óleo',
    date: '2024-03-10',
    amount: 280.0,
    mileage: 30000,
    notes: 'Inclui filtro de óleo'
  },
  {
    id: '3',
    vehicleId: '3',
    type: 'insurance',
    description: 'Seguro anual',
    date: '2024-03-01',
    amount: 2500.0,
    mileage: 25000,
    notes: 'Cobertura completa'
  }
];

const ExpenseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vehicles] = useState(mockVehicles);
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'fuel',
    description: '',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    mileage: 0,
    notes: '',
  });

  useEffect(() => {
    if (id) {
      const expense = mockExpenses.find(e => e.id === id);
      if (expense) {
        setFormData({
          vehicleId: expense.vehicleId,
          type: expense.type,
          description: expense.description,
          date: expense.date.split('T')[0],
          amount: expense.amount,
          mileage: expense.mileage,
          notes: expense.notes || '',
        });
      }
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/expenses');
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'mileage' ? Number(value) : value
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
              {id ? 'Editar Despesa' : 'Nova Despesa'}
            </h1>
            <p className="text-gray-500">Preencha os dados da despesa</p>
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
                    { value: 'fuel', label: 'Combustível' },
                    { value: 'maintenance', label: 'Manutenção' },
                    { value: 'insurance', label: 'Seguro' },
                    { value: 'tax', label: 'Imposto' }
                  ]}
                  required
                />
                <Input
                  label="Data"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Quilometragem"
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  required
                  min={0}
                />
                <Input
                  label="Valor (R$)"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min={0}
                  step={0.01}
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
                  placeholder="Descrição da despesa"
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
                      {formData.type === 'fuel' ? 'Combustível' : formData.type === 'maintenance' ? 'Manutenção' : formData.type === 'insurance' ? 'Seguro' : 'Imposto'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Data</span>
                    <span className="font-medium">
                      {new Date(formData.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Quilometragem</span>
                    <span className="font-medium">
                      {formData.mileage.toLocaleString('pt-BR')} km
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Valor</span>
                    <span className="font-medium text-blue-600">
                      R$ {formData.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              {id ? 'Salvar Alterações' : 'Criar Despesa'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Wrench, Calendar, DollarSign, Gauge, AlertTriangle } from 'lucide-react';
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

const mockMaintenances = [
  {
    id: '1',
    vehicleId: '1',
    type: 'preventive',
    description: 'Troca de óleo e filtros',
    date: '2024-03-15',
    cost: 350.0,
    mileage: 45000,
    status: 'scheduled',
    nextMaintenance: '2024-09-15',
    parts: [
      { name: 'Óleo de motor', quantity: 1, price: 120.0 },
      { name: 'Filtro de óleo', quantity: 1, price: 45.0 },
      { name: 'Filtro de ar', quantity: 1, price: 85.0 },
    ],
    labor: 100.0,
    notes: 'Trocar filtro de ar também.',
  },
  {
    id: '2',
    vehicleId: '2',
    type: 'corrective',
    description: 'Substituição de pastilhas de freio',
    date: '2024-02-20',
    cost: 280.0,
    mileage: 30000,
    status: 'completed',
    parts: [
      { name: 'Pastilhas de freio', quantity: 4, price: 180.0 },
      { name: 'Fluido de freio', quantity: 1, price: 40.0 },
    ],
    labor: 60.0,
  },
];

const MaintenanceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vehicles] = useState(mockVehicles);
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'preventive',
    description: '',
    date: new Date().toISOString().split('T')[0],
    cost: 0,
    mileage: 0,
    status: 'scheduled',
    nextMaintenance: '',
    parts: [{ name: '', quantity: 1, price: 0 }],
    labor: 0,
    notes: '',
  });

  useEffect(() => {
    if (id) {
      const maintenance = mockMaintenances.find(m => m.id === id);
      if (maintenance) {
        setFormData({
          vehicleId: maintenance.vehicleId,
          type: maintenance.type,
          description: maintenance.description,
          date: maintenance.date.split('T')[0],
          cost: maintenance.cost,
          mileage: maintenance.mileage,
          status: maintenance.status,
          nextMaintenance: maintenance.nextMaintenance || '',
          parts: maintenance.parts || [{ name: '', quantity: 1, price: 0 }],
          labor: maintenance.labor || 0,
          notes: maintenance.notes || '',
        });
      }
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/maintenance');
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' || name === 'mileage' || name === 'labor' ? Number(value) : value
    }));
  };

  const handlePartChange = (index: number, field: string, value: string | number) => {
    const newParts = [...formData.parts];
    newParts[index] = {
      ...newParts[index],
      [field]: field === 'quantity' || field === 'price' ? Number(value) : value
    };
    setFormData(prev => ({ ...prev, parts: newParts }));
  };

  const addPart = () => {
    setFormData(prev => ({
      ...prev,
      parts: [...prev.parts, { name: '', quantity: 1, price: 0 }]
    }));
  };

  const removePart = (index: number) => {
    setFormData(prev => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index)
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
              {id ? 'Editar Manutenção' : 'Nova Manutenção'}
            </h1>
            <p className="text-gray-500">Preencha os dados da manutenção</p>
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
                    { value: 'preventive', label: 'Preventiva' },
                    { value: 'corrective', label: 'Corretiva' }
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
                />
                <Select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    { value: 'scheduled', label: 'Agendada' },
                    { value: 'in_progress', label: 'Em Andamento' },
                    { value: 'completed', label: 'Concluída' }
                  ]}
                  required
                />
                {formData.type === 'preventive' && (
                  <Input
                    label="Próxima Manutenção"
                    type="date"
                    name="nextMaintenance"
                    value={formData.nextMaintenance}
                    onChange={handleChange}
                  />
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Peças e Serviços</h2>
              <div className="space-y-4">
                <div className="space-y-4">
                  {formData.parts.map((part, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-5">
                        <Input
                          label="Peça"
                          value={part.name}
                          onChange={(e) => handlePartChange(index, 'name', e.target.value)}
                          placeholder="Nome da peça"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          label="Qtd"
                          type="number"
                          value={part.quantity}
                          onChange={(e) => handlePartChange(index, 'quantity', e.target.value)}
                          min={1}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          label="Preço Unit."
                          type="number"
                          value={part.price}
                          onChange={(e) => handlePartChange(index, 'price', e.target.value)}
                          min={0}
                          step={0.01}
                        />
                      </div>
                      <div className="col-span-2">
                        <Button type="button" variant="danger" fullWidth onClick={() => removePart(index)}>
                          Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="secondary" fullWidth onClick={addPart}>
                  + Adicionar Peça
                </Button>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">Mão de obra</label>
                    <Input
                      type="number"
                      name="labor"
                      value={formData.labor}
                      onChange={handleChange}
                      min={0}
                      step={0.01}
                      className="w-48"
                    />
                  </div>
                </div>
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
                  placeholder="Descrição da manutenção"
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
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total de peças</span>
                  <span className="font-medium">
                    R$ {formData.parts.reduce((sum, part) => sum + (part.price * part.quantity), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mão de obra</span>
                  <span className="font-medium">
                    R$ {formData.labor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-blue-600">
                      R$ {(formData.parts.reduce((sum, part) => sum + (part.price * part.quantity), 0) + formData.labor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              {id ? 'Salvar Alterações' : 'Criar Manutenção'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceForm; 
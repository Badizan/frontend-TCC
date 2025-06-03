import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Bell, Calendar, Car, AlertTriangle, CheckCircle2, Clock, Wrench, FileText, ClipboardCheck } from 'lucide-react';

const mockReminders = [
  {
    id: '1',
    vehicleId: '1',
    vehicle: {
      brand: 'Toyota',
      model: 'Corolla',
      licensePlate: 'ABC1234',
      image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200'
    },
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
    vehicle: {
      brand: 'Honda',
      model: 'Civic',
      licensePlate: 'DEF5678',
      image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200'
    },
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
    vehicle: {
      brand: 'Volkswagen',
      model: 'Golf',
      licensePlate: 'GHI9012',
      image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200'
    },
    type: 'inspection',
    description: 'Vistoria anual',
    dueDate: '2024-06-30',
    status: 'completed',
    priority: 'low',
    notes: 'Agendar com antecedência'
  }
];

const Reminders: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredReminders = mockReminders.filter(reminder => {
    const matchesSearch = reminder.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || reminder.type === filterType;
    const matchesStatus = filterStatus === 'all' || reminder.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Wrench className="w-5 h-5" />;
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'inspection':
        return <ClipboardCheck className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lembretes</h1>
          <p className="text-gray-500">Gerencie seus lembretes e notificações</p>
        </div>
        <button
          onClick={() => navigate('/reminders/new')}
          className="btn-primary px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5 mr-2 inline" />
          Novo Lembrete
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar lembretes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
        >
          <option value="all">Todos os tipos</option>
          <option value="maintenance">Manutenção</option>
          <option value="document">Documento</option>
          <option value="inspection">Vistoria</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
        >
          <option value="all">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="completed">Concluído</option>
          <option value="overdue">Atrasado</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReminders.map(reminder => (
          <div
            key={reminder.id}
            className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100 hover:scale-105 transition-transform cursor-pointer"
            onClick={() => navigate(`/reminders/${reminder.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden">
                  <img
                    src={reminder.vehicle.image}
                    alt={`${reminder.vehicle.brand} ${reminder.vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{reminder.vehicle.brand} {reminder.vehicle.model}</h3>
                  <p className="text-sm text-gray-500">{reminder.vehicle.licensePlate}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reminder.status)}`}>
                {reminder.status === 'pending' ? 'Pendente' : reminder.status === 'completed' ? 'Concluído' : 'Atrasado'}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getTypeIcon(reminder.type)}
                <h4 className="font-semibold text-gray-900">{reminder.description}</h4>
              </div>

              <div className="flex items-center gap-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(reminder.dueDate).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${getPriorityColor(reminder.priority)}`}>
                {reminder.priority === 'high' ? 'Alta' : reminder.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
              </div>

              {reminder.notes && (
                <div className="text-sm text-gray-500">
                  <p className="font-medium text-gray-700">Observações:</p>
                  <p>{reminder.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredReminders.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lembrete encontrado</h3>
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Tente ajustar sua busca ou filtros'
              : 'Comece adicionando um novo lembrete'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Reminders; 
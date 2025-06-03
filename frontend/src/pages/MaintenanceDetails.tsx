import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Wrench, Calendar, DollarSign, Gauge, AlertTriangle, Car } from 'lucide-react';

const mockMaintenances = [
  {
    id: '1',
    vehicle: { 
      id: '1', 
      brand: 'Toyota', 
      model: 'Corolla', 
      licensePlate: 'ABC1234',
      image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200'
    },
    type: 'preventive',
    description: 'Troca de óleo e filtros',
    date: '2024-03-15',
    cost: 350.0,
    mileage: 45000,
    status: 'scheduled',
    nextMaintenance: '2024-09-15',
    notes: 'Trocar filtro de ar também.',
    parts: [
      { name: 'Óleo de motor', quantity: 1, price: 120.0 },
      { name: 'Filtro de óleo', quantity: 1, price: 45.0 },
      { name: 'Filtro de ar', quantity: 1, price: 85.0 },
    ],
    labor: 100.0,
  },
  {
    id: '2',
    vehicle: { 
      id: '2', 
      brand: 'Honda', 
      model: 'Civic', 
      licensePlate: 'DEF5678',
      image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200'
    },
    type: 'corrective',
    description: 'Substituição de pastilhas de freio',
    date: '2024-02-20',
    cost: 280.0,
    mileage: 30000,
    status: 'completed',
    notes: '',
    parts: [
      { name: 'Pastilhas de freio', quantity: 4, price: 180.0 },
      { name: 'Fluido de freio', quantity: 1, price: 40.0 },
    ],
    labor: 60.0,
  },
];

const MaintenanceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const maintenance = mockMaintenances.find(m => m.id === id);

  if (!maintenance) {
    return (
      <div className="text-center py-12">
        <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Manutenção não encontrada</h3>
        <p className="text-gray-500">A manutenção que você está procurando não existe.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendada';
      case 'in_progress':
        return 'Em Andamento';
      case 'completed':
        return 'Concluída';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'preventive':
        return 'Preventiva';
      case 'corrective':
        return 'Corretiva';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalhes da Manutenção</h1>
            <p className="text-gray-500">Informações completas sobre a manutenção</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/maintenance/${id}/edit`)}
            className="btn-secondary px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={() => {
              if (window.confirm('Tem certeza que deseja excluir esta manutenção?')) {
                navigate('/maintenance');
              }
            }}
            className="btn-danger px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informações Gerais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Wrench className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Tipo</span>
                </div>
                <p className="text-gray-900 font-medium">{getTypeText(maintenance.type)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Data</span>
                </div>
                <p className="text-gray-900 font-medium">
                  {new Date(maintenance.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Gauge className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Quilometragem</span>
                </div>
                <p className="text-gray-900 font-medium">{maintenance.mileage.toLocaleString('pt-BR')} km</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Custo Total</span>
                </div>
                <p className="text-gray-900 font-medium">
                  R$ {maintenance.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Peças e Serviços</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Peças Utilizadas</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500">
                        <th className="pb-2">Peça</th>
                        <th className="pb-2">Quantidade</th>
                        <th className="pb-2 text-right">Preço Unit.</th>
                        <th className="pb-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {maintenance.parts.map((part, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="py-2">{part.name}</td>
                          <td className="py-2">{part.quantity}</td>
                          <td className="py-2 text-right">
                            R$ {part.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 text-right">
                            R$ {(part.price * part.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-600">Mão de obra</span>
                <span className="font-medium">
                  R$ {maintenance.labor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {maintenance.notes && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Observações</h2>
              <p className="text-gray-700">{maintenance.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Veículo</h2>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-blue-100">
                <img
                  src={maintenance.vehicle.image}
                  alt={`${maintenance.vehicle.brand} ${maintenance.vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {maintenance.vehicle.brand} {maintenance.vehicle.model}
                </h3>
                <p className="text-gray-500">{maintenance.vehicle.licensePlate}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Status</h2>
            <div className="flex items-center justify-between">
              <span className={`px-4 py-2 text-sm font-bold rounded-full border ${getStatusColor(maintenance.status)}`}>
                {getStatusText(maintenance.status)}
              </span>
              {maintenance.nextMaintenance && (
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Próxima: {new Date(maintenance.nextMaintenance).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDetails; 
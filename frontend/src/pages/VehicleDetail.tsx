import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ArrowLeft, Edit, PenTool as Tool, Clock, DollarSign, Trash2 } from 'lucide-react';
import { MaintenanceTimeline } from '../components/dashboard/MaintenanceTimeline';
import { RemindersList } from '../components/dashboard/RemindersList';
import { ExpenseChart } from '../components/dashboard/ExpenseChart';
import { MileageReminderCard } from '../components/dashboard/MileageReminderCard';
import { formatDate } from '../utils/formatters';
import { toast } from 'react-hot-toast';

export const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedVehicle,
    maintenanceServices,
    maintenanceReminders,
    expenses,
    vehicleStats,
    selectVehicle,
    updateVehicleMileage,
    completeReminder,
    deleteVehicle,
    loading,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('overview');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMileageModal, setShowMileageModal] = useState(false);
  const [newMileage, setNewMileage] = useState(selectedVehicle?.mileage || 0);

  useEffect(() => {
    if (id) {
      selectVehicle(id);
    }
  }, [id, selectVehicle]);

  if (!selectedVehicle) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-pulse text-primary-600">
          <svg
            className="w-12 h-12 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    );
  }



  const handleDeleteVehicle = async () => {
    if (selectedVehicle?.id) {
      try {
        await deleteVehicle(selectedVehicle.id);
        navigate('/vehicles');
      } catch (error) {
        console.error('Erro ao deletar veículo:', error);
        alert('Erro ao deletar veículo. Tente novamente.');
      }
    }
    setShowDeleteModal(false);
  };

  const handleUpdateMileage = async () => {
    if (selectedVehicle?.id && newMileage !== selectedVehicle.mileage) {
      try {
        await updateVehicleMileage(selectedVehicle.id, newMileage);
        
        // Mostrar apenas uma notificação simples de sucesso
        toast.success('Quilometragem atualizada com sucesso!');
        
        setShowMileageModal(false);
      } catch (error) {
        console.error('Erro ao atualizar quilometragem:', error);
        toast.error('Erro ao atualizar quilometragem');
      }
    }
  };

  const formatVehicleType = (type: string) => {
    switch (type) {
      case 'CAR': return 'Carro';
      case 'MOTORCYCLE': return 'Motocicleta';
      case 'TRUCK': return 'Caminhão';
      case 'VAN': return 'Van/Utilitário';
      default: return type;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mr-3">
          {selectedVehicle.brand} {selectedVehicle.model}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/vehicles/${id}/edit`)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Editar veículo"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-full hover:bg-red-50 transition-colors"
            title="Deletar veículo"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden h-48 mb-4 relative">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-16 h-16 text-blue-400 mx-auto mb-2"
                  >
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2" />
                    <circle cx="7" cy="17" r="2" />
                    <path d="M9 17h6" />
                    <circle cx="17" cy="17" r="2" />
                  </svg>
                  <p className="text-sm text-blue-600 font-medium">
                    {selectedVehicle.brand} {selectedVehicle.model}
                  </p>
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-white/80 rounded-full px-3 py-1">
                <span className="text-xs font-medium text-gray-700">
                  {formatVehicleType(selectedVehicle.type)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Marca/Modelo</p>
                <p className="font-medium">
                  {selectedVehicle.brand} {selectedVehicle.model}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ano</p>
                <p className="font-medium">{selectedVehicle.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Placa</p>
                <p className="font-medium">{selectedVehicle.licensePlate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <p className="font-medium">
                  {formatVehicleType(selectedVehicle.type)}
                </p>
              </div>
              {selectedVehicle.color && (
                <div>
                  <p className="text-sm text-gray-500">Cor</p>
                  <p className="font-medium">{selectedVehicle.color}</p>
                </div>
              )}
              {selectedVehicle.mileage !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">Quilometragem</p>
                  <p className="font-medium">
                    {selectedVehicle.mileage.toLocaleString('pt-BR')} km
                  </p>
                </div>
              )}
            </div>

            {/* Card de Quilometragem sempre visível */}
            {selectedVehicle.mileage !== undefined && (
              <div className="mt-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-3 text-green-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-6 h-6"
                        >
                          <path d="M12 2v20M2 12h20" />
                          <circle cx="12" cy="12" r="3" />
                          <path d="M12 1v6" />
                          <path d="M12 17v6" />
                          <path d="M4.22 4.22l4.24 4.24" />
                          <path d="M15.54 15.54l4.24 4.24" />
                          <path d="M1 12h6" />
                          <path d="M17 12h6" />
                          <path d="M4.22 19.78l4.24-4.24" />
                          <path d="M15.54 8.46l4.24-4.24" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">Quilometragem Atual</p>
                        <p className="text-2xl font-bold text-green-900">
                          {selectedVehicle.mileage.toLocaleString('pt-BR')} km
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-600">Última atualização</p>
                      <p className="text-xs text-green-700">
                        {formatDate(selectedVehicle.updatedAt)}
                      </p>
                      <button
                        onClick={() => {
                          setNewMileage(selectedVehicle.mileage || 0);
                          setShowMileageModal(true);
                        }}
                        className="mt-2 px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Atualizar KM
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {vehicleStats && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="mr-3 text-primary-600">
                      <Tool className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-primary-800">Manutenções</p>
                      <p className="font-medium text-primary-900">
                        {vehicleStats.totalMaintenance || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-accent-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="mr-3 text-accent-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-accent-800">Pendentes</p>
                      <p className="font-medium text-accent-900">
                        {vehicleStats.upcomingMaintenance || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="mr-3 text-secondary-600">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-secondary-800">Gastos</p>
                      <p className="font-medium text-secondary-900">
                        R$ {(vehicleStats.totalExpenses || 0).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Visão Geral
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'maintenance'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('maintenance')}
            >
              Manutenções
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'reminders'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('reminders')}
            >
              Lembretes
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'mileage-reminders'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('mileage-reminders')}
            >
              Lembretes por KM
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'expenses'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('expenses')}
            >
              Despesas
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Próximas Manutenções
              </h2>
              <button
                onClick={() => setActiveTab('reminders')}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                Ver todos
              </button>
            </div>
            <RemindersList
              reminders={maintenanceReminders.slice(0, 3)}
              onComplete={completeReminder}
            />
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Últimas Manutenções
              </h2>
              <button
                onClick={() => setActiveTab('maintenance')}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                Ver todos
              </button>
            </div>
            <MaintenanceTimeline services={maintenanceServices.slice(0, 3)} />
          </div>

          {vehicleStats && (
            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Gastos Mensais
                </h2>
                <button
                  onClick={() => setActiveTab('expenses')}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Ver todos
                </button>
              </div>
              <ExpenseChart data={vehicleStats.monthlyExpenses} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Histórico de Manutenções
            </h2>
            <div className="bg-green-50 px-3 py-2 rounded-lg">
              <p className="text-sm text-green-800">
                ✨ Manutenções criadas na página principal "Manutenções"
              </p>
            </div>
          </div>

          <div className="card">
            <MaintenanceTimeline services={maintenanceServices} />
          </div>
        </div>
      )}

      {activeTab === 'reminders' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Lembretes de Manutenção
            </h2>
            <div className="bg-green-50 px-3 py-2 rounded-lg">
              <p className="text-sm text-green-800">
                ✨ Lembretes criados automaticamente via manutenções
              </p>
            </div>
          </div>



          <div className="card">
            <RemindersList
              reminders={maintenanceReminders}
              onComplete={completeReminder}
            />
          </div>
        </div>
      )}

      {activeTab === 'mileage-reminders' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Lembretes por Quilometragem
            </h2>
            <div className="bg-blue-50 px-3 py-2 rounded-lg">
              <p className="text-sm text-blue-800">
                ⏰ Configure lembretes baseados na quilometragem do veículo
              </p>
            </div>
          </div>

          <MileageReminderCard 
            vehicleId={selectedVehicle.id} 
            currentMileage={selectedVehicle.mileage || 0}
          />
        </div>
      )}

      {activeTab === 'expenses' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Registro de Despesas
            </h2>
            <div className="bg-green-50 px-3 py-2 rounded-lg">
              <p className="text-sm text-green-800">
                ✨ Despesas criadas automaticamente via manutenções
              </p>
            </div>
          </div>



          {vehicleStats && (
            <div className="card mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Gastos Mensais
              </h3>
              <ExpenseChart data={vehicleStats.monthlyExpenses} />
            </div>
          )}

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Histórico de Despesas
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Data
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Categoria
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Descrição
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            expense.category === 'maintenance'
                              ? 'bg-blue-100 text-blue-800'
                              : expense.category === 'fuel'
                              ? 'bg-green-100 text-green-800'
                              : expense.category === 'insurance'
                              ? 'bg-purple-100 text-purple-800'
                              : expense.category === 'tax'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {expense.category === 'maintenance'
                            ? 'Manutenção'
                            : expense.category === 'fuel'
                            ? 'Combustível'
                            : expense.category === 'insurance'
                            ? 'Seguro'
                            : expense.category === 'tax'
                            ? 'Impostos/Taxas'
                            : 'Outros'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        R$ {expense.amount.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Deleção */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirmar Exclusão
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Tem certeza de que deseja excluir permanentemente o veículo{' '}
                <strong>{selectedVehicle.brand} {selectedVehicle.model}</strong>?
              </p>
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Esta ação não pode ser desfeita. Todos os dados relacionados 
                (manutenções, lembretes e despesas) também serão excluídos.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteVehicle}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Excluir Veículo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para atualizar quilometragem */}
      {showMileageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Atualizar Quilometragem
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova Quilometragem (km)
              </label>
              <input
                type="number"
                value={newMileage}
                onChange={(e) => setNewMileage(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite a nova quilometragem"
              />
              <p className="text-xs text-gray-500 mt-1">
                Atual: {selectedVehicle?.mileage?.toLocaleString('pt-BR')} km
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowMileageModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateMileage}
                disabled={newMileage === selectedVehicle?.mileage}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

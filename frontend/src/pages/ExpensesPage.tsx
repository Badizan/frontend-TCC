import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Search, Filter, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import ExpenseForm from '../components/forms/ExpenseForm';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ExpensesPage: React.FC = () => {
  const { expenses, vehicles, fetchExpenses, fetchVehicles, createExpense } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedVehicleForForm, setSelectedVehicleForForm] = useState<string>('');

  useEffect(() => {
    fetchExpenses();
    fetchVehicles();
  }, [fetchExpenses, fetchVehicles]);

  const handleCreateExpense = async (data: any) => {
    try {
      await createExpense(data);
      setShowForm(false);
      setSelectedVehicleForForm('');
      // Recarregar dados após criar
      fetchExpenses();
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
    }
  };

  const formatCategory = (category: string) => {
    switch (category) {
      case 'FUEL': return 'Combustível';
      case 'MAINTENANCE': return 'Manutenção';
      case 'INSURANCE': return 'Seguro';
      case 'TOLLS': return 'Pedágios';
      case 'PARKING': return 'Estacionamento';
      case 'FINES': return 'Multas';
      case 'OTHER': return 'Outros';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FUEL': return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE': return 'bg-red-100 text-red-800';
      case 'INSURANCE': return 'bg-green-100 text-green-800';
      case 'TOLLS': return 'bg-yellow-100 text-yellow-800';
      case 'PARKING': return 'bg-purple-100 text-purple-800';
      case 'FINES': return 'bg-orange-100 text-orange-800';
      case 'OTHER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    // Adicionar verificações de segurança para campos que podem ser undefined
    const description = expense.description || '';
    
    const matchesSearch = description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVehicle = selectedVehicle === 'all' || expense.vehicleId === selectedVehicle;
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    return matchesSearch && matchesVehicle && matchesCategory;
  });

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate}` : 'Veículo não encontrado';
  };

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

  // Preparar dados para o gráfico
  const chartData = expenses.reduce((acc: any[], expense) => {
    const monthYear = format(new Date(expense.date), 'MMM yyyy', { locale: ptBR });
    const existing = acc.find(item => item.month === monthYear);
    
    if (existing) {
      existing.amount += expense.amount;
    } else {
      acc.push({ month: monthYear, amount: expense.amount });
    }
    
    return acc;
  }, []).slice(-6); // Últimos 6 meses

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Despesas</h1>
          <p className="text-sm text-gray-600">Gerencie todas as despesas dos seus veículos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Despesa
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-green-900 truncate">
                  Total de Despesas
                </dt>
                <dd className="text-lg font-medium text-green-900">
                  R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-blue-900 truncate">
                  Média por Despesa
                </dt>
                <dd className="text-lg font-medium text-blue-900">
                  R$ {averageExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-purple-900 truncate">
                  Total de Registros
                </dt>
                <dd className="text-lg font-medium text-purple-900">
                  {filteredExpenses.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Gastos Mensais</h2>
          <ExpenseChart data={chartData} />
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="form-input pl-10"
            placeholder="Buscar por descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="form-input pl-10"
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
          >
            <option value="all">Todos os veículos</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            className="form-input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas as categorias</option>
            <option value="FUEL">Combustível</option>
            <option value="MAINTENANCE">Manutenção</option>
            <option value="INSURANCE">Seguro</option>
            <option value="TOLLS">Pedágios</option>
            <option value="PARKING">Estacionamento</option>
            <option value="FINES">Multas</option>
            <option value="OTHER">Outros</option>
          </select>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Nova Despesa</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="form-label">Selecione o veículo</label>
              <select
                className="form-input"
                value={selectedVehicleForForm}
                onChange={(e) => setSelectedVehicleForForm(e.target.value)}
                required
              >
                <option value="">Escolha um veículo</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
                  </option>
                ))}
              </select>
            </div>

            {selectedVehicleForForm && (
              <ExpenseForm
                vehicleId={selectedVehicleForForm}
                onSubmit={handleCreateExpense}
                isLoading={false}
              />
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="card">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Registro de Despesas
            {filteredExpenses.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({filteredExpenses.length} registro{filteredExpenses.length !== 1 ? 's' : ''})
              </span>
            )}
          </h2>
        </div>

        {filteredExpenses.length > 0 ? (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.description}
                      {expense.mileage && expense.mileage > 0 && (
                        <div className="text-xs text-gray-500">
                          {expense.mileage.toLocaleString()} km
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getVehicleName(expense.vehicleId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                        {formatCategory(expense.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(expense.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Nenhuma despesa encontrada.</p>
            <p className="text-sm text-gray-400 mt-1">
              Registre as despesas para acompanhar os custos dos seus veículos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensesPage; 
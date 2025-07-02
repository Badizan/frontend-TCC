import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Search, Filter, DollarSign, TrendingUp, Calendar, Trash2 } from 'lucide-react';
import { ExpenseForm } from '../components/forms/ExpenseForm';
import { ExpenseChart } from '../components/dashboard/ExpenseChart';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotifications } from '../hooks/useNotifications';
import { parseLocalDate, formatDate } from '../utils/formatters';

const ExpensesPage: React.FC = () => {
  const { expenses, vehicles, fetchExpenses, fetchVehicles, createExpense, deleteExpense } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartKey, setChartKey] = useState<number>(0); // Force re-render do gráfico
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<any>(null);
  
  const { showToast } = useNotifications();

  useEffect(() => {
    fetchExpenses();
    fetchVehicles();
  }, [fetchExpenses, fetchVehicles]);

  // Atualizar dados do gráfico sempre que expenses mudar
  useEffect(() => {
    if (expenses.length === 0) {
      setChartData([]);
      return;
    }

    // Agrupar despesas por mês
    const groupedExpenses = expenses.reduce((groups: Record<string, Expense[]>, expense) => {
      const expenseDate = parseLocalDate(expense.date.toString());
      const monthYear = format(expenseDate, 'MMM yyyy', { locale: ptBR });
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(expense);
      return groups;
    }, {});

    // Converter para array e ordenar por data
    const sortedData = Object.entries(groupedExpenses)
      .map(([month, expenses]) => {
        const monthIndex = new Date(month).getMonth();
        const sortDate = new Date(parseInt(month.split(' ')[1]), monthIndex, 1);
        
        return {
          month,
          amount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
          sortDate
        };
      })
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
      .slice(-6) // Últimos 6 meses
      .map(({ month, amount }) => ({ month, amount }));

    setChartData(sortedData);
    setChartKey(prev => prev + 1); // Force re-render do gráfico
  }, [expenses]);



  const handleDeleteClick = (expense: any) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;

    try {
      await deleteExpense(expenseToDelete.id);
      setShowDeleteModal(false);
      setExpenseToDelete(null);
      
      showToast(
        'Despesa Excluída',
        `Despesa "${expenseToDelete.description}" foi excluída com sucesso`,
        'expenses',
        'success'
      );
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      showToast(
        'Erro',
        'Não foi possível excluir a despesa. Tente novamente.',
        'system',
        'error'
      );
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setExpenseToDelete(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Despesas</h1>
          <p className="text-sm text-gray-600">Despesas são criadas automaticamente através das manutenções</p>
        </div>
        <div className="bg-green-50 px-4 py-2 rounded-lg">
          <p className="text-sm text-green-800">
            ✨ <strong>Criação Automática:</strong> Despesas são geradas automaticamente quando você agenda uma manutenção com custo
          </p>
        </div>
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
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Gastos Mensais</h2>
        {chartData.length > 0 ? (
          <ExpenseChart key={chartKey} data={chartData} />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium">Nenhuma despesa registrada ainda</p>
              <p className="text-sm">Comece registrando algumas despesas para ver o gráfico</p>
            </div>
          </div>
        )}
      </div>

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
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
                          {expense.mileage?.toLocaleString() || '-'} km
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleDeleteClick(expense)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Excluir despesa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
              Despesas são criadas automaticamente ao agendar manutenções com custo.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && expenseToDelete && (
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
                Tem certeza de que deseja excluir a despesa{' '}
                <strong>"{expenseToDelete.description}"</strong>?
              </p>
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ExpensesPage };
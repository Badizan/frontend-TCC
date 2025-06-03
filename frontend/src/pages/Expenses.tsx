import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, DollarSign, Car, Calendar, Tag, AlertTriangle, Wrench, Shield, FileText, Gauge, Edit, Trash2, Download } from 'lucide-react';
import { expenseService, Expense } from '../services/expense.service';
import { exportService } from '../services/export.service';
import Pagination from '../components/common/Pagination';
import SortSelect, { SortOption } from '../components/common/SortSelect';

const ITEMS_PER_PAGE = 10;

const sortOptions: SortOption[] = [
  { label: 'Data (mais recente)', value: 'date-desc' },
  { label: 'Data (mais antiga)', value: 'date-asc' },
  { label: 'Valor (maior)', value: 'amount-desc' },
  { label: 'Valor (menor)', value: 'amount-asc' },
  { label: 'Quilometragem (maior)', value: 'mileage-desc' },
  { label: 'Quilometragem (menor)', value: 'mileage-asc' },
];

const Expenses: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseService.getAll();
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar despesas. Tente novamente mais tarde.');
      console.error('Erro ao carregar despesas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;

    try {
      setLoading(true);
      await expenseService.delete(id);
      await loadExpenses();
    } catch (err) {
      setError('Erro ao excluir despesa. Tente novamente mais tarde.');
      console.error('Erro ao excluir despesa:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportService.exportExpenses(filteredExpenses);
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || expense.type === filterType;
    const matchesDate = filterDate === 'all' || expense.date === filterDate;
    return matchesSearch && matchesType && matchesDate;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (!sortBy) return 0;

    const [field, direction] = sortBy.split('-');
    const multiplier = direction === 'asc' ? 1 : -1;

    switch (field) {
      case 'date':
        return multiplier * (new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'amount':
        return multiplier * (a.amount - b.amount);
      case 'mileage':
        return multiplier * (a.mileage - b.mileage);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedExpenses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedExpenses = sortedExpenses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fuel':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'insurance':
        return 'bg-green-100 text-green-800';
      case 'tax':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fuel':
        return <DollarSign className="w-5 h-5" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5" />;
      case 'insurance':
        return <Shield className="w-5 h-5" />;
      case 'tax':
        return <FileText className="w-5 h-5" />;
      default:
        return <Tag className="w-5 h-5" />;
    }
  };

  const totalAmount = sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading && expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Despesas</h1>
          <p className="text-gray-500">Gerencie suas despesas e gastos</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExport}
            className="btn-secondary px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            <Download className="w-5 h-5 mr-2 inline" />
            Exportar
          </button>
          <button
            onClick={() => navigate('/expenses/new')}
            className="btn-primary px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5 mr-2 inline" />
            Nova Despesa
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar despesas..."
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
          <option value="fuel">Combustível</option>
          <option value="maintenance">Manutenção</option>
          <option value="insurance">Seguro</option>
          <option value="tax">Imposto</option>
        </select>
        <select
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
        >
          <option value="all">Todas as datas</option>
          <option value="2024-03-15">15/03/2024</option>
          <option value="2024-03-10">10/03/2024</option>
          <option value="2024-03-01">01/03/2024</option>
        </select>
        <SortSelect
          options={sortOptions}
          value={sortBy}
          onChange={setSortBy}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Resumo</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total de despesas</p>
            <p className="text-2xl font-bold text-blue-600">
              R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Carregando despesas...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar despesas</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedExpenses.map(expense => (
                <div
                  key={expense.id}
                  className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => navigate(`/expenses/${expense.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden">
                        <img
                          src={expense.vehicle.image}
                          alt={`${expense.vehicle.brand} ${expense.vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{expense.vehicle.brand} {expense.vehicle.model}</h3>
                        <p className="text-sm text-gray-500">{expense.vehicle.licensePlate}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(expense.type)}`}>
                      {expense.type === 'fuel' ? 'Combustível' : expense.type === 'maintenance' ? 'Manutenção' : expense.type === 'insurance' ? 'Seguro' : 'Imposto'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(expense.type)}
                      <h4 className="font-semibold text-gray-900">{expense.description}</h4>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(expense.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500">
                      <Gauge className="w-4 h-4" />
                      <span className="text-sm">
                        {expense.mileage.toLocaleString('pt-BR')} km
                      </span>
                    </div>

                    <div className="text-lg font-bold text-blue-600">
                      R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>

                    {expense.notes && (
                      <div className="text-sm text-gray-500">
                        <p className="font-medium text-gray-700">Observações:</p>
                        <p>{expense.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/expenses/${expense.id}/edit`);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(expense.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}

        {sortedExpenses.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma despesa encontrada</h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' || filterDate !== 'all'
                ? 'Tente ajustar sua busca ou filtros'
                : 'Comece adicionando uma nova despesa'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Bell, Calendar, Car, AlertTriangle, CheckCircle2, Clock, Wrench, FileText, ClipboardCheck, Edit, Trash2, Download } from 'lucide-react';
import { reminderService, Reminder } from '../services/reminder.service';
import { exportService } from '../services/export.service';
import Pagination from '../components/common/Pagination';
import SortSelect, { SortOption } from '../components/common/SortSelect';

const ITEMS_PER_PAGE = 10;

const sortOptions: SortOption[] = [
  { label: 'Data de Vencimento (próximo)', value: 'dueDate-asc' },
  { label: 'Data de Vencimento (distante)', value: 'dueDate-desc' },
  { label: 'Prioridade (alta)', value: 'priority-desc' },
  { label: 'Prioridade (baixa)', value: 'priority-asc' },
  { label: 'Status (pendente)', value: 'status-asc' },
  { label: 'Status (concluído)', value: 'status-desc' },
];

const Reminders: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const data = await reminderService.getAll();
      setReminders(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar lembretes. Tente novamente mais tarde.');
      console.error('Erro ao carregar lembretes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este lembrete?')) return;

    try {
      setLoading(true);
      await reminderService.delete(id);
      await loadReminders();
    } catch (err) {
      setError('Erro ao excluir lembrete. Tente novamente mais tarde.');
      console.error('Erro ao excluir lembrete:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportService.exportReminders(filteredReminders);
  };

  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = reminder.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || reminder.type === filterType;
    const matchesStatus = filterStatus === 'all' || reminder.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedReminders = [...filteredReminders].sort((a, b) => {
    if (!sortBy) return 0;

    const [field, direction] = sortBy.split('-');
    const multiplier = direction === 'asc' ? 1 : -1;

    switch (field) {
      case 'dueDate':
        return multiplier * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return multiplier * (priorityOrder[a.priority] - priorityOrder[b.priority]);
      case 'status':
        const statusOrder = { pending: 1, overdue: 2, completed: 3 };
        return multiplier * (statusOrder[a.status] - statusOrder[b.status]);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedReminders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReminders = sortedReminders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
        <div className="flex items-center gap-4">
          <button
            onClick={handleExport}
            className="btn-secondary px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            <Download className="w-5 h-5 mr-2 inline" />
            Exportar
          </button>
          <button
            onClick={() => navigate('/reminders/new')}
            className="btn-primary px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5 mr-2 inline" />
            Novo Lembrete
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar lembretes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          />
        </div>
        <SortSelect
          options={sortOptions}
          value={sortBy}
          onChange={setSortBy}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando lembretes...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar lembretes</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedReminders.map(reminder => (
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

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/reminders/${reminder.id}/edit`);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(reminder.id);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default Reminders; 
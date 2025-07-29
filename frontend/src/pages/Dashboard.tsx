import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import StatsCard from '../components/dashboard/StatsCard';
import RecentMaintenances from '../components/dashboard/RecentMaintenances';
import { RemindersList } from '../components/dashboard/RemindersList';
import { parseLocalDate } from '../utils/formatters';

import { Car, Wrench, Clock, DollarSign } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    vehicles, 
    maintenanceServices, 
    expenses, 
    maintenanceReminders,
    fetchVehicles,
    fetchMaintenanceServices,
    fetchExpenses,
    fetchMaintenanceReminders,
    completeReminder,
    user 
  } = useAppStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Dashboard: Carregando dados...');
        await Promise.all([
          fetchVehicles(),
          fetchMaintenanceServices(),
          fetchExpenses(),
          fetchMaintenanceReminders(),
        ]);
        console.log('✅ Dashboard: Dados carregados com sucesso');
      } catch (error) {
        console.error('❌ Dashboard: Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // Removido dependências para executar apenas no mount

  // Calcular estatísticas em tempo real
  const stats = {
    totalVehicles: vehicles?.length || 0,
    pendingMaintenances: maintenanceServices?.filter(m => m.status === 'SCHEDULED').length || 0,
    upcomingReminders: maintenanceReminders?.filter(r => !r.completed).length || 0,
    monthlyExpenses: expenses
      ?.filter(e => {
        const expenseDate = parseLocalDate(e.date.toString());
        const currentDate = new Date();
        return expenseDate.getMonth() === currentDate.getMonth() &&
               expenseDate.getFullYear() === currentDate.getFullYear();
      })
      .reduce((total, expense) => total + expense.amount, 0) || 0,
  };

  // Calcular lembretes urgentes para as estatísticas
  const urgentReminders = maintenanceReminders?.filter(r => {
    if (r.completed) return false;
    
    if (!r.dueDate) return false;
    
    const today = new Date();
    const reminderDate = parseLocalDate(r.dueDate.toString());
    const diffDays = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    return diffDays <= 7 && diffDays >= 0; // Próximos 7 dias
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header personalizado */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 sm:p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Bem vindo, {user?.name || 'Usuário'}
        </h1>
        <p className="text-blue-100 mt-1 text-sm sm:text-base">
          Aqui está um resumo dos seus veículos e atividades recentes
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatsCard
          title="Total de Veículos"
          value={stats.totalVehicles}
          icon={<Car className="h-8 w-8" />}
          trend={stats.totalVehicles > 0 ? "+100%" : "0%"}
          trendUp={stats.totalVehicles > 0}
          color="blue"
        />
        <StatsCard
          title="Manutenções Pendentes"
          value={stats.pendingMaintenances}
          icon={<Wrench className="h-8 w-8" />}
          trend={stats.pendingMaintenances > 0 ? "Atenção" : "Em dia"}
          trendUp={stats.pendingMaintenances === 0}
          color="orange"
        />
        <StatsCard
          title="Lembretes Ativos"
          value={stats.upcomingReminders}
          icon={<Clock className="h-8 w-8" />}
          trend={`${urgentReminders.length} urgente(s)`}
          trendUp={urgentReminders.length === 0}
          color="green"
        />
        <StatsCard
          title="Gastos do Mês"
          value={`R$ ${stats.monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-8 w-8" />}
          trend="Este mês"
          trendUp={true}
          color="purple"
        />
      </div>

      {/* Grid principal de componentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Coluna da esquerda - Manutenções */}
        <div className="lg:col-span-1">
          <RecentMaintenances />
        </div>

        {/* Coluna da direita - Lembretes */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Lembretes Ativos
                  </h3>
                  <p className="text-sm text-gray-600">
                    Próximas manutenções e tarefas
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/reminders')}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Ver todos
              </button>
            </div>
            <RemindersList 
              reminders={maintenanceReminders || []}
              onComplete={completeReminder}
              getVehicleName={(vehicleId) => {
                const vehicle = vehicles?.find(v => v.id === vehicleId);
                return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Veículo não encontrado';
              }}
            />
          </div>
          
          {/* Card de Resumo Rápido */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumo Rápido
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total de Veículos:</span>
                <span className="font-medium">{stats.totalVehicles}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Manutenções Agendadas:</span>
                <span className="font-medium text-orange-600">{stats.pendingMaintenances}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Lembretes Pendentes:</span>
                <span className="font-medium text-blue-600">{stats.upcomingReminders}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Gastos Este Mês:</span>
                <span className="font-medium text-green-600">
                  R$ {stats.monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ações Rápidas
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/vehicles/new')}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                + Adicionar Veículo
              </button>
              <button 
                onClick={() => navigate('/maintenance')}
                className="w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
              >
                + Agendar Manutenção
              </button>
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-xs text-green-700 font-medium">
                  ✨ Ao agendar manutenções, lembretes e despesas são criados automaticamente!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Dashboard };
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import StatsCard from '../components/dashboard/StatsCard';
import RecentMaintenances from '../components/dashboard/RecentMaintenances';
import { RemindersList } from '../components/dashboard/RemindersList';
import SimpleExpenseChart from '../components/dashboard/SimpleExpenseChart';

import { Car, Wrench, Clock, DollarSign, AlertTriangle } from 'lucide-react';

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
        const expenseDate = new Date(e.date);
        const currentDate = new Date();
        return expenseDate.getMonth() === currentDate.getMonth() &&
               expenseDate.getFullYear() === currentDate.getFullYear();
      })
      .reduce((total, expense) => total + expense.amount, 0) || 0,
  };

  // Alertas importantes
  const urgentReminders = maintenanceReminders?.filter(r => {
    if (r.completed) return false;
    
    const today = new Date();
    const reminderDate = new Date(r.reminderDate);
    const diffDays = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    return diffDays <= 7 && diffDays >= 0; // Próximos 7 dias
  }) || [];

  const overdueReminders = maintenanceReminders?.filter(r => {
    if (r.completed) return false;
    
    const today = new Date();
    const reminderDate = new Date(r.reminderDate);
    
    return reminderDate < today; // Vencidos
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          Bem-vindo, {user?.name || 'Usuário'}! 👋
        </h1>
        <p className="text-blue-100 mt-1">
          Aqui está um resumo dos seus veículos e atividades recentes
        </p>
      </div>

      {/* Alertas Importantes */}
      {(urgentReminders.length > 0 || overdueReminders.length > 0) && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-sm font-medium text-red-800">
              Atenção! Você tem lembretes importantes
            </h3>
          </div>
          <div className="mt-2 text-sm text-red-700">
            {overdueReminders.length > 0 && (
              <p>• {overdueReminders.length} lembrete(s) vencido(s)</p>
            )}
            {urgentReminders.length > 0 && (
              <p>• {urgentReminders.length} lembrete(s) para os próximos 7 dias</p>
            )}
          </div>
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna da esquerda - Manutenções e Gráfico */}
        <div className="lg:col-span-2 space-y-6">
          <RecentMaintenances />
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Gastos Mensais
                  </h3>
                  <p className="text-sm text-gray-600">
                    Evolução dos gastos ao longo do tempo
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/expenses')}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Ver todas
              </button>
            </div>
                         <SimpleExpenseChart data={[]} />
          </div>
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
              <button 
                onClick={() => navigate('/reminders')}
                className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
              >
                + Criar Lembrete
              </button>
              <button 
                onClick={() => navigate('/expenses')}
                className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
              >
                + Registrar Despesa
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Componentes de teste temporários - removidos para produção */}
      
    </div>
  );
};

export { Dashboard };
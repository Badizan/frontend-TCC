import React, { useEffect, useState } from 'react';
import { DollarSign, Car, AlertTriangle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { expenseService, Expense } from '../services/expense.service';
import { vehicleService, Vehicle } from '../services/vehicle.service';
import { reminderService, Reminder } from '../services/reminder.service';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import StatsCard from '../components/dashboard/StatsCard';
import AlertCard from '../components/dashboard/AlertCard';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesData, vehiclesData, remindersData] = await Promise.all([
        expenseService.getAll(),
        vehicleService.getAll(),
        reminderService.getAll()
      ]);

      setExpenses(expensesData);
      setVehicles(vehiclesData);
      setReminders(remindersData);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard. Tente novamente mais tarde.');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const calculateExpenseTrend = () => {
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const currentMonthExpenses = expenses
      .filter(expense => new Date(expense.date).getMonth() === currentMonth)
      .reduce((total, expense) => total + expense.amount, 0);

    const lastMonthExpenses = expenses
      .filter(expense => new Date(expense.date).getMonth() === lastMonth)
      .reduce((total, expense) => total + expense.amount, 0);

    if (lastMonthExpenses === 0) return 0;
    return ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
  };

  const getAlerts = () => {
    const alerts = [];

    // Alertas de lembretes próximos do vencimento
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    reminders
      .filter(reminder => reminder.status === 'pending')
      .forEach(reminder => {
        const dueDate = new Date(reminder.dueDate);
        if (dueDate <= nextWeek) {
          alerts.push({
            id: reminder.id,
            type: dueDate <= today ? 'warning' : 'info',
            title: `Lembrete: ${reminder.description}`,
            message: `Vence em ${format(dueDate, "d 'de' MMMM", { locale: ptBR })}`,
            date: reminder.dueDate
          });
        }
      });

    // Alertas de manutenção preventiva
    vehicles.forEach(vehicle => {
      const lastMaintenance = expenses
        .filter(expense => 
          expense.vehicleId === vehicle.id && 
          expense.type === 'maintenance'
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (lastMaintenance) {
        const lastMaintenanceDate = new Date(lastMaintenance.date);
        const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

        if (lastMaintenanceDate <= threeMonthsAgo) {
          alerts.push({
            id: `maintenance-${vehicle.id}`,
            type: 'warning',
            title: 'Manutenção Preventiva',
            message: `O veículo ${vehicle.brand} ${vehicle.model} está há mais de 3 meses sem manutenção`,
            date: lastMaintenanceDate.toISOString()
          });
        }
      }
    });

    return alerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dashboard</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  const expenseTrend = calculateExpenseTrend();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral do seu controle de gastos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Gastos"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(calculateTotalExpenses())}
          icon={<DollarSign className="w-6 h-6 text-blue-500" />}
          trend={{
            value: Math.abs(Math.round(expenseTrend)),
            isPositive: expenseTrend < 0
          }}
          period="Comparado ao mês anterior"
        />

        <StatsCard
          title="Veículos"
          value={vehicles.length}
          icon={<Car className="w-6 h-6 text-blue-500" />}
        />

        <StatsCard
          title="Lembretes Pendentes"
          value={reminders.filter(r => r.status === 'pending').length}
          icon={<AlertTriangle className="w-6 h-6 text-blue-500" />}
        />

        <StatsCard
          title="Economia Mensal"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(expenseTrend < 0 ? Math.abs(expenseTrend) : 0)}
          icon={<TrendingUp className="w-6 h-6 text-blue-500" />}
          period="Comparado ao mês anterior"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart expenses={expenses} />
        <AlertCard alerts={getAlerts()} />
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { TrendingUp, DollarSign, Calendar, FileText, Download, Filter } from 'lucide-react';
import { ExpenseChart } from '../components/dashboard/ExpenseChart';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ReportsPage: React.FC = () => {
  const { 
    vehicles, 
    maintenanceServices, 
    expenses, 
    fetchVehicles, 
    fetchMaintenanceServices, 
    fetchExpenses 
  } = useAppStore();
  
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('last6months');

  useEffect(() => {
    fetchVehicles();
    fetchMaintenanceServices();
    fetchExpenses();
  }, [fetchVehicles, fetchMaintenanceServices, fetchExpenses]);

  // Filtrar dados por veículo e período
  const getFilteredData = () => {
    let filteredExpenses = expenses;
    let filteredMaintenances = maintenanceServices;

    // Filtrar por veículo
    if (selectedVehicle !== 'all') {
      filteredExpenses = expenses.filter(e => e.vehicleId === selectedVehicle);
      filteredMaintenances = maintenanceServices.filter(m => m.vehicleId === selectedVehicle);
    }

    // Filtrar por período
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case 'last3months':
        startDate = subMonths(now, 3);
        break;
      case 'last6months':
        startDate = subMonths(now, 6);
        break;
      case 'last12months':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subMonths(now, 6);
    }

    filteredExpenses = filteredExpenses.filter(e => new Date(e.date) >= startDate);
    filteredMaintenances = filteredMaintenances.filter(m => new Date(m.date) >= startDate);

    return { filteredExpenses, filteredMaintenances };
  };

  const { filteredExpenses, filteredMaintenances } = getFilteredData();

  const handleExportPDF = () => {
    // Implementação básica de exportação
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Relatório de Manutenção - ${selectedVehicle === 'all' ? 'Todos os Veículos' : 'Veículo Selecionado'}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
              .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
              .expenses-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              .expenses-table th, .expenses-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .expenses-table th { background-color: #f5f5f5; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Relatório de Manutenção</h1>
              <p>Período: ${dateRange}</p>
              <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            
            <div class="stats">
              <div class="stat-card">
                <h3>Gastos Totais</h3>
                <p>R$ ${stats.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div class="stat-card">
                <h3>Média por Despesa</h3>
                <p>R$ ${stats.averageExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div class="stat-card">
                <h3>Total de Manutenções</h3>
                <p>${stats.totalMaintenances}</p>
              </div>
              <div class="stat-card">
                <h3>Despesas Registradas</h3>
                <p>${filteredExpenses.length}</p>
              </div>
            </div>
            
            <h2>Detalhes das Despesas</h2>
            <table class="expenses-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                ${filteredExpenses.map(expense => `
                  <tr>
                    <td>${new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                    <td>${formatCategory(expense.category)}</td>
                    <td>${expense.description}</td>
                    <td>R$ ${expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Calcular estatísticas
  const stats = {
    totalExpenses: filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    totalMaintenances: filteredMaintenances.length,
    averageExpense: filteredExpenses.length > 0 ? filteredExpenses.reduce((sum, e) => sum + e.amount, 0) / filteredExpenses.length : 0,
    expensesByCategory: filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>),
    maintenancesByType: filteredMaintenances.reduce((acc, maintenance) => {
      acc[maintenance.type] = (acc[maintenance.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  // Preparar dados para gráfico mensal
  const monthlyData = filteredExpenses.reduce((acc: any[], expense) => {
    const monthYear = format(new Date(expense.date), 'MMM yyyy', { locale: ptBR });
    const existing = acc.find(item => item.month === monthYear);
    
    if (existing) {
      existing.amount += expense.amount;
    } else {
      acc.push({ month: monthYear, amount: expense.amount });
    }
    
    return acc;
  }, []).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

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

  const formatMaintenanceType = (type: string) => {
    switch (type) {
      case 'PREVENTIVE': return 'Preventiva';
      case 'CORRECTIVE': return 'Corretiva';
      case 'ROUTINE': return 'Rotina';
      default: return type;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FUEL': return 'bg-blue-500';
      case 'MAINTENANCE': return 'bg-red-500';
      case 'INSURANCE': return 'bg-green-500';
      case 'TOLLS': return 'bg-yellow-500';
      case 'PARKING': return 'bg-purple-500';
      case 'FINES': return 'bg-orange-500';
      case 'OTHER': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Relatórios</h1>
          <p className="text-sm text-gray-600">Análise completa dos custos e manutenções</p>
        </div>
        <button 
          onClick={() => handleExportPDF()}
          className="btn-primary"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="form-input pl-10"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="last3months">Últimos 3 meses</option>
            <option value="last6months">Últimos 6 meses</option>
            <option value="last12months">Últimos 12 meses</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Gastos Totais</p>
              <p className="text-lg font-semibold text-gray-900">
                R$ {stats.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Média por Despesa</p>
              <p className="text-lg font-semibold text-gray-900">
                R$ {stats.averageExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Manutenções</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalMaintenances}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Despesas Registradas</p>
              <p className="text-lg font-semibold text-gray-900">{filteredExpenses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Gastos por Mês</h3>
          <div className="h-64">
            <ExpenseChart data={monthlyData} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Distribuição por Categoria</h3>
          <div className="space-y-4">
            {Object.entries(stats.expensesByCategory).map(([category, amount]) => (
              <div key={category} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {formatCategory(category)}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${getCategoryColor(category)} h-2 rounded-full`}
                    style={{
                      width: `${(amount / stats.totalExpenses) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maintenance Types */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Tipos de Manutenção</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats.maintenancesByType).map(([type, count]) => (
            <div key={type} className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700">{formatMaintenanceType(type)}</h4>
              <p className="text-2xl font-semibold text-gray-900 mt-2">{count}</p>
              <p className="text-sm text-gray-500 mt-1">
                {((count / stats.totalMaintenances) * 100).toFixed(1)}% do total
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
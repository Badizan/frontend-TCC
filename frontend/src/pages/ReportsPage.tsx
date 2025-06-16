import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { TrendingUp, DollarSign, Calendar, FileText, Download, Filter } from 'lucide-react';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ReportsPage: React.FC = () => {
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-blue-900 truncate">
                  Gastos Totais
                </dt>
                <dd className="text-lg font-medium text-blue-900">
                  R$ {stats.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-green-900 truncate">
                  Média por Despesa
                </dt>
                <dd className="text-lg font-medium text-green-900">
                  R$ {stats.averageExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-purple-900 truncate">
                  Manutenções
                </dt>
                <dd className="text-lg font-medium text-purple-900">
                  {stats.totalMaintenances}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-orange-900 truncate">
                  Despesas Registradas
                </dt>
                <dd className="text-lg font-medium text-orange-900">
                  {filteredExpenses.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Expenses Chart */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Gastos Mensais</h2>
          {monthlyData.length > 0 ? (
            <ExpenseChart data={monthlyData} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum dado disponível para o período selecionado</p>
            </div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Gastos por Categoria</h2>
          {Object.keys(stats.expensesByCategory).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.expensesByCategory).map(([category, amount]) => {
                const percentage = (amount / stats.totalExpenses) * 100;
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`}></div>
                      <span className="text-sm font-medium text-gray-700">
                        {formatCategory(category)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                      <span className="text-sm font-medium text-gray-900">
                        R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma despesa encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Manutenções por Tipo</h2>
          {Object.keys(stats.maintenancesByType).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(stats.maintenancesByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {formatMaintenanceType(type)}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {count} {count === 1 ? 'serviço' : 'serviços'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma manutenção encontrada</p>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Resumo do Período</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total de despesas</span>
              <span className="font-medium">
                R$ {stats.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Número de transações</span>
              <span className="font-medium">{filteredExpenses.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Manutenções realizadas</span>
              <span className="font-medium">{stats.totalMaintenances}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Veículos analisados</span>
              <span className="font-medium">
                {selectedVehicle === 'all' ? vehicles.length : 1}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { TrendingUp, DollarSign, Calendar, FileText, Download, Filter, Wrench, BarChart3, PieChart } from 'lucide-react';
import { ExpenseChart } from '../components/dashboard/ExpenseChart';
import { MaintenanceChart } from '../components/dashboard/MaintenanceChart';
import { format, subMonths, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseLocalDate, formatDate } from '../utils/formatters';

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

    // Melhor filtragem de data considerando vários campos possíveis
    filteredExpenses = filteredExpenses.filter(e => {
      const expenseDate = new Date(e.date);
      return isValid(expenseDate) && expenseDate >= startDate;
    });

    filteredMaintenances = filteredMaintenances.filter(m => {
      // Tentar diferentes campos de data
      const maintenanceDate = new Date(m.scheduledDate || m.completedDate || m.createdAt || m.date);
      return isValid(maintenanceDate) && maintenanceDate >= startDate;
    });

    return { filteredExpenses, filteredMaintenances };
  };

  const { filteredExpenses, filteredMaintenances } = getFilteredData();

  const handleExportPDF = () => {
    const selectedVehicleName = selectedVehicle === 'all' 
      ? 'Todos os Veículos' 
      : vehicles.find(v => v.id === selectedVehicle)?.brand + ' ' + vehicles.find(v => v.id === selectedVehicle)?.model || 'Veículo Selecionado';

    const dateRangeText = {
      'last3months': 'Últimos 3 meses',
      'last6months': 'Últimos 6 meses',
      'last12months': 'Últimos 12 meses'
    }[dateRange] || 'Período personalizado';

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Relatório de Manutenção - ${selectedVehicleName}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: #fff;
              }
              
              .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 40px 20px;
              }
              
              .header {
                text-align: center;
                margin-bottom: 40px;
                border-bottom: 3px solid #3B82F6;
                padding-bottom: 20px;
              }
              
              .header h1 {
                font-size: 2.5em;
                color: #1F2937;
                margin-bottom: 10px;
                font-weight: 700;
              }
              
              .header .subtitle {
                font-size: 1.2em;
                color: #6B7280;
                margin-bottom: 5px;
              }
              
              .header .meta {
                font-size: 0.9em;
                color: #9CA3AF;
              }
              
              .section {
                margin-bottom: 40px;
                break-inside: avoid;
              }
              
              .section-title {
                font-size: 1.8em;
                color: #1F2937;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #E5E7EB;
                font-weight: 600;
              }
              
              .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
              }
              
              .stat-card {
                background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
                border: 1px solid #E2E8F0;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                transition: transform 0.2s;
              }
              
              .stat-card:hover {
                transform: translateY(-2px);
              }
              
              .stat-card h3 {
                font-size: 1.1em;
                color: #475569;
                margin-bottom: 8px;
                font-weight: 600;
              }
              
              .stat-card .value {
                font-size: 2em;
                font-weight: 700;
                color: #1E293B;
                margin-bottom: 5px;
              }
              
              .stat-card .subtitle {
                font-size: 0.85em;
                color: #64748B;
              }
              
              .analysis-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 30px;
                margin-bottom: 30px;
              }
              
              .analysis-card {
                background: #fff;
                border: 1px solid #E2E8F0;
                border-radius: 12px;
                padding: 25px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
              }
              
              .analysis-card h4 {
                font-size: 1.3em;
                color: #1E293B;
                margin-bottom: 15px;
                font-weight: 600;
              }
              
              .analysis-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #F1F5F9;
              }
              
              .analysis-item:last-child {
                border-bottom: none;
              }
              
              .analysis-item .label {
                font-weight: 500;
                color: #374151;
              }
              
              .analysis-item .value {
                font-weight: 600;
                color: #1F2937;
              }
              
              .analysis-item .percentage {
                font-size: 0.85em;
                color: #6B7280;
                margin-left: 8px;
              }
              
              .table-container {
                overflow-x: auto;
                margin-top: 20px;
                border-radius: 12px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
              
              .data-table {
                width: 100%;
                border-collapse: collapse;
                background: #fff;
                border-radius: 12px;
                overflow: hidden;
              }
              
              .data-table th {
                background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                color: white;
                padding: 15px 12px;
                text-align: left;
                font-weight: 600;
                font-size: 0.9em;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .data-table td {
                padding: 12px;
                border-bottom: 1px solid #F1F5F9;
                font-size: 0.9em;
              }
              
              .data-table tr:hover {
                background-color: #F8FAFC;
              }
              
              .data-table tr:last-child td {
                border-bottom: none;
              }
              
              .footer {
                margin-top: 50px;
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #E5E7EB;
                color: #6B7280;
                font-size: 0.9em;
              }
              
              .badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 0.75em;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .badge-fuel { background: #FEF3C7; color: #92400E; }
              .badge-maintenance { background: #DBEAFE; color: #1E40AF; }
              .badge-insurance { background: #D1FAE5; color: #065F46; }
              .badge-other { background: #F3E8FF; color: #7C3AED; }
              
              @media print {
                body { -webkit-print-color-adjust: exact; }
                .container { padding: 20px; }
                .section { page-break-inside: avoid; }
                .stat-card { page-break-inside: avoid; }
                .analysis-card { page-break-inside: avoid; }
              }
              
              @page {
                size: A4;
                margin: 1.5cm;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <header class="header">
                <h1>🚗 Relatório de Manutenção</h1>
                <div class="subtitle">${selectedVehicleName}</div>
                <div class="meta">
                  <strong>Período:</strong> ${dateRangeText} | 
                  <strong>Gerado em:</strong> ${formatDate(new Date())}
            </div>
              </header>
            
              <section class="section">
                <h2 class="section-title">📊 Resumo Executivo</h2>
                <div class="stats-grid">
              <div class="stat-card">
                    <h3>💰 Gastos Totais</h3>
                    <div class="value">R$ ${stats.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div class="subtitle">${filteredExpenses.length} despesa${filteredExpenses.length !== 1 ? 's' : ''} registrada${filteredExpenses.length !== 1 ? 's' : ''}</div>
              </div>
              <div class="stat-card">
                    <h3>🔧 Total de Manutenções</h3>
                    <div class="value">${stats.totalMaintenances}</div>
                    <div class="subtitle">${stats.completedMaintenances} concluída${stats.completedMaintenances !== 1 ? 's' : ''}, ${stats.scheduledMaintenances} agendada${stats.scheduledMaintenances !== 1 ? 's' : ''}</div>
              </div>
              <div class="stat-card">
                    <h3>💸 Custo de Manutenção</h3>
                    <div class="value">R$ ${stats.maintenanceCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div class="subtitle">Média: R$ ${stats.averageMaintenanceCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              </div>
              <div class="stat-card">
                    <h3>📈 Média por Despesa</h3>
                    <div class="value">R$ ${stats.averageExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div class="subtitle">Baseado em ${filteredExpenses.length} registro${filteredExpenses.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
              </section>

              <section class="section">
                <h2 class="section-title">🔍 Análise Detalhada</h2>
                <div class="analysis-grid">
                  <div class="analysis-card">
                    <h4>🛠️ Tipos de Manutenção</h4>
              ${Object.entries(stats.maintenancesByType).map(([type, count]) => `
                      <div class="analysis-item">
                        <span class="label">${formatMaintenanceType(type)}</span>
                        <div>
                          <span class="value">${count}</span>
                          <span class="percentage">(${stats.totalMaintenances > 0 ? ((count / stats.totalMaintenances) * 100).toFixed(1) : 0}%)</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                  
                  <div class="analysis-card">
                    <h4>📋 Status das Manutenções</h4>
                    ${Object.entries(stats.maintenancesByStatus).map(([status, count]) => `
                      <div class="analysis-item">
                        <span class="label">${formatMaintenanceStatus(status)}</span>
                        <div>
                          <span class="value">${count}</span>
                          <span class="percentage">(${stats.totalMaintenances > 0 ? ((count / stats.totalMaintenances) * 100).toFixed(1) : 0}%)</span>
                        </div>
                </div>
              `).join('')}
            </div>
            
                  <div class="analysis-card">
                    <h4>💳 Gastos por Categoria</h4>
                    ${Object.entries(stats.expensesByCategory).map(([category, amount]) => `
                      <div class="analysis-item">
                        <span class="label">${formatCategory(category)}</span>
                        <div>
                          <span class="value">R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <span class="percentage">(${stats.totalExpenses > 0 ? ((amount / stats.totalExpenses) * 100).toFixed(1) : 0}%)</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </section>

              ${filteredExpenses.length > 0 ? `
              <section class="section">
                <h2 class="section-title">📝 Detalhamento das Despesas</h2>
                <div class="table-container">
                  <table class="data-table">
              <thead>
                <tr>
                        <th>📅 Data</th>
                        <th>🏷️ Categoria</th>
                        <th>📄 Descrição</th>
                        <th>💰 Valor</th>
                </tr>
              </thead>
              <tbody>
                      ${filteredExpenses.slice(0, 50).map(expense => `
                  <tr>
                    <td>${formatDate(expense.date)}</td>
                          <td>
                            <span class="badge badge-${expense.category.toLowerCase()}">
                              ${formatCategory(expense.category)}
                            </span>
                          </td>
                    <td>${expense.description}</td>
                          <td><strong>R$ ${expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
                        </tr>
                      `).join('')}
                      ${filteredExpenses.length > 50 ? `
                        <tr>
                          <td colspan="4" style="text-align: center; font-style: italic; color: #6B7280;">
                            ... e mais ${filteredExpenses.length - 50} despesa${filteredExpenses.length - 50 !== 1 ? 's' : ''} (mostrando apenas as 50 primeiras)
                          </td>
                        </tr>
                      ` : ''}
                    </tbody>
                  </table>
                </div>
              </section>
              ` : ''}

              ${filteredMaintenances.length > 0 ? `
              <section class="section">
                <h2 class="section-title">🔧 Histórico de Manutenções</h2>
                <div class="table-container">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>📅 Data</th>
                        <th>🔧 Tipo</th>
                        <th>📄 Descrição</th>
                        <th>📊 Status</th>
                        <th>💰 Custo</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${filteredMaintenances.slice(0, 30).map(maintenance => `
                        <tr>
                          <td>${formatDate(maintenance.scheduledDate)}</td>
                          <td>${formatMaintenanceType(maintenance.type)}</td>
                          <td>${maintenance.description}</td>
                          <td>${formatMaintenanceStatus(maintenance.status)}</td>
                          <td>${maintenance.cost ? 'R$ ' + maintenance.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}</td>
                  </tr>
                `).join('')}
                      ${filteredMaintenances.length > 30 ? `
                        <tr>
                          <td colspan="5" style="text-align: center; font-style: italic; color: #6B7280;">
                            ... e mais ${filteredMaintenances.length - 30} manutenção${filteredMaintenances.length - 30 !== 1 ? 'ões' : ''} (mostrando apenas as 30 primeiras)
                          </td>
                        </tr>
                      ` : ''}
              </tbody>
            </table>
                </div>
              </section>
              ` : ''}

              <footer class="footer">
                <p>Relatório gerado automaticamente pelo Sistema de Gestão de Veículos</p>
                <p>© ${new Date().getFullYear()} - Todos os direitos reservados</p>
              </footer>
            </div>
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
    
    // Estatísticas de manutenção
    completedMaintenances: filteredMaintenances.filter(m => m.status === 'COMPLETED').length,
    scheduledMaintenances: filteredMaintenances.filter(m => m.status === 'SCHEDULED').length,
    inProgressMaintenances: filteredMaintenances.filter(m => m.status === 'IN_PROGRESS').length,
    
    // Custo das manutenções
    maintenanceCosts: filteredMaintenances
      .filter(m => m.cost && m.cost > 0)
      .reduce((sum, m) => sum + (m.cost || 0), 0),
    averageMaintenanceCost: (() => {
      const maintenancesWithCost = filteredMaintenances.filter(m => m.cost && m.cost > 0);
      return maintenancesWithCost.length > 0 
        ? maintenancesWithCost.reduce((sum, m) => sum + (m.cost || 0), 0) / maintenancesWithCost.length 
        : 0;
    })(),
    
    // Distribuições
    expensesByCategory: filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>),
    
    maintenancesByType: filteredMaintenances.reduce((acc, maintenance) => {
      const type = maintenance.type || 'OTHER';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    
    maintenancesByStatus: filteredMaintenances.reduce((acc, maintenance) => {
      const status = maintenance.status || 'SCHEDULED';
      acc[status] = (acc[status] || 0) + 1;
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
      case 'INSPECTION': return 'Inspeção';
      case 'ROUTINE': return 'Rotina';
      case 'OTHER': return 'Outros';
      default: return type;
    }
  };

  const formatMaintenanceStatus = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Agendada';
      case 'IN_PROGRESS': return 'Em Andamento';
      case 'COMPLETED': return 'Concluída';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  };

  const getMaintenanceTypeColor = (type: string) => {
    switch (type) {
      case 'PREVENTIVE': return 'bg-green-500';
      case 'CORRECTIVE': return 'bg-red-500';
      case 'INSPECTION': return 'bg-blue-500';
      case 'ROUTINE': return 'bg-yellow-500';
      case 'OTHER': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-500';
      case 'IN_PROGRESS': return 'bg-yellow-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
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
              <p className="text-xs text-gray-500 mt-1">
                {filteredExpenses.length} despesa{filteredExpenses.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Wrench className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Manutenções</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalMaintenances}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.completedMaintenances} concluída{stats.completedMaintenances !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Custo de Manutenção</p>
              <p className="text-lg font-semibold text-gray-900">
                R$ {stats.maintenanceCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Média: R$ {stats.averageMaintenanceCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Média por Despesa</p>
              <p className="text-lg font-semibold text-gray-900">
                R$ {stats.averageExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.scheduledMaintenances} agendada{stats.scheduledMaintenances !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Gastos por Mês</h3>
            <ExpenseChart data={monthlyData} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Tipos de Manutenção</h3>
          <MaintenanceChart 
            data={stats.maintenancesByType} 
            type="pie"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Status das Manutenções</h3>
          <MaintenanceChart 
            data={stats.maintenancesByStatus} 
            type="pie"
          />
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Distribuição de Gastos por Categoria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      width: `${stats.totalExpenses > 0 ? (amount / stats.totalExpenses) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <MaintenanceChart 
              data={Object.entries(stats.expensesByCategory).reduce((acc, [category, amount]) => {
                acc[category] = amount;
                return acc;
              }, {} as Record<string, number>)}
              type="bar"
              title="Gastos por Categoria"
            />
          </div>
        </div>
      </div>

      {/* Maintenance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Tipos de Manutenção</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          {Object.keys(stats.maintenancesByType).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(stats.maintenancesByType).map(([type, count]) => (
                <div key={type} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getMaintenanceTypeColor(type)} mr-2`}></div>
                      <span className="text-sm font-medium text-gray-700">
                        {formatMaintenanceType(type)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{count}</span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({stats.totalMaintenances > 0 ? ((count / stats.totalMaintenances) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getMaintenanceTypeColor(type)} h-2 rounded-full`}
                      style={{
                        width: `${stats.totalMaintenances > 0 ? (count / stats.totalMaintenances) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma manutenção encontrada no período</p>
            </div>
          )}
        </div>

        {/* Maintenance Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Status das Manutenções</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          {Object.keys(stats.maintenancesByStatus).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(stats.maintenancesByStatus).map(([status, count]) => (
                <div key={status} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getMaintenanceStatusColor(status)} mr-2`}></div>
                      <span className="text-sm font-medium text-gray-700">
                        {formatMaintenanceStatus(status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{count}</span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({stats.totalMaintenances > 0 ? ((count / stats.totalMaintenances) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getMaintenanceStatusColor(status)} h-2 rounded-full`}
                      style={{
                        width: `${stats.totalMaintenances > 0 ? (count / stats.totalMaintenances) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma manutenção encontrada no período</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
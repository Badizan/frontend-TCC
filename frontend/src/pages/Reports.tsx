import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, DollarSign, Car, Gauge, AlertTriangle } from 'lucide-react';

const mockExpenses = [
  {
    id: '1',
    vehicleId: '1',
    vehicle: {
      brand: 'Toyota',
      model: 'Corolla',
      licensePlate: 'ABC1234',
      image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200'
    },
    type: 'fuel',
    description: 'Abastecimento',
    date: '2024-03-15',
    amount: 150.0,
    mileage: 45000,
    notes: 'Combustível comum'
  },
  {
    id: '2',
    vehicleId: '2',
    vehicle: {
      brand: 'Honda',
      model: 'Civic',
      licensePlate: 'DEF5678',
      image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200'
    },
    type: 'maintenance',
    description: 'Troca de óleo',
    date: '2024-03-10',
    amount: 280.0,
    mileage: 30000,
    notes: 'Inclui filtro de óleo'
  },
  {
    id: '3',
    vehicleId: '3',
    vehicle: {
      brand: 'Volkswagen',
      model: 'Golf',
      licensePlate: 'GHI9012',
      image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200'
    },
    type: 'insurance',
    description: 'Seguro anual',
    date: '2024-03-01',
    amount: 2500.0,
    mileage: 25000,
    notes: 'Cobertura completa'
  }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState('month');

  const expensesByType = mockExpenses.reduce((acc, expense) => {
    acc[expense.type] = (acc[expense.type] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const expensesByVehicle = mockExpenses.reduce((acc, expense) => {
    const key = `${expense.vehicle.brand} ${expense.vehicle.model}`;
    acc[key] = (acc[key] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(expensesByType).map(([name, value]) => ({
    name: name === 'fuel' ? 'Combustível' : name === 'maintenance' ? 'Manutenção' : name === 'insurance' ? 'Seguro' : 'Imposto',
    value
  }));

  const barData = Object.entries(expensesByVehicle).map(([name, value]) => ({
    name,
    value
  }));

  const totalAmount = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageAmount = totalAmount / mockExpenses.length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-500">Análise de despesas e gastos</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          >
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
            <option value="year">Último ano</option>
          </select>
          <button
            className="btn-primary px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            <Download className="w-5 h-5 mr-2 inline" />
            Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total de Despesas</h3>
              <p className="text-2xl font-bold text-gray-900">
                R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-green-100">
              <Car className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Veículos</h3>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(expensesByVehicle).length}
              </p>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-yellow-100">
              <Gauge className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Média por Despesa</h3>
              <p className="text-2xl font-bold text-gray-900">
                R$ {averageAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Despesas por Tipo</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Despesas por Veículo</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
                />
                <Tooltip
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Últimas Despesas</h2>
        <div className="space-y-4">
          {mockExpenses.map(expense => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 hover:scale-105 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden">
                  <img
                    src={expense.vehicle.image}
                    alt={`${expense.vehicle.brand} ${expense.vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{expense.vehicle.brand} {expense.vehicle.model}</h3>
                  <p className="text-sm text-gray-500">{expense.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">
                  R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(expense.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports; 
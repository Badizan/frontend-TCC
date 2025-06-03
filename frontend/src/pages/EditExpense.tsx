import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { expenseService, Expense } from '../services/expense.service';
import { vehicleService, Vehicle } from '../services/vehicle.service';

const EditExpense: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expense, setExpense] = useState<Expense | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'fuel',
    description: '',
    date: '',
    amount: '',
    mileage: '',
    notes: ''
  });

  useEffect(() => {
    loadExpense();
    loadVehicles();
  }, [id]);

  const loadExpense = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await expenseService.getById(id);
      setExpense(data);
      setFormData({
        vehicleId: data.vehicleId,
        type: data.type,
        description: data.description,
        date: data.date,
        amount: data.amount.toString(),
        mileage: data.mileage.toString(),
        notes: data.notes || ''
      });
    } catch (err) {
      setError('Erro ao carregar despesa. Tente novamente mais tarde.');
      console.error('Erro ao carregar despesa:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (err) {
      setError('Erro ao carregar veículos. Tente novamente mais tarde.');
      console.error('Erro ao carregar veículos:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      await expenseService.update(id, {
        ...formData,
        amount: parseFloat(formData.amount),
        mileage: parseInt(formData.mileage)
      });
      navigate('/expenses');
    } catch (err) {
      setError('Erro ao atualizar despesa. Tente novamente mais tarde.');
      console.error('Erro ao atualizar despesa:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;

    try {
      setLoading(true);
      await expenseService.delete(id);
      navigate('/expenses');
    } catch (err) {
      setError('Erro ao excluir despesa. Tente novamente mais tarde.');
      console.error('Erro ao excluir despesa:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !expense) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Despesa não encontrada</h3>
        <button
          onClick={() => navigate('/expenses')}
          className="text-blue-600 hover:text-blue-800"
        >
          Voltar para a lista de despesas
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/expenses')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Despesa</h1>
            <p className="text-gray-500">Atualize os dados da despesa</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="btn-danger px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Veículo
            </label>
            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            >
              <option value="">Selecione um veículo</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            >
              <option value="fuel">Combustível</option>
              <option value="maintenance">Manutenção</option>
              <option value="insurance">Seguro</option>
              <option value="tax">Imposto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor (R$)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quilometragem
            </label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Save className="w-5 h-5 mr-2 inline" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditExpense; 
import { useEffect, useState } from 'react';
import MaintenanceForm from '../components/MaintenanceForm';
import Notification from '../components/Notification';
import { FaPlus, FaWrench } from 'react-icons/fa';
import { api } from '../config/api';

const statusColors = {
    'Concluída': 'text-green-600',
    'Agendada': 'text-blue-600',
    'Pendente': 'text-orange-500',
    'Cancelada': 'text-red-600',
};

export default function Maintenances() {
    const [maintenances, setMaintenances] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editMaintenance, setEditMaintenance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    const [search, setSearch] = useState('');

    const fetchMaintenances = async () => {
        setLoading(true);
        try {
            const res = await api.get('/maintenances');
            setMaintenances(res.data);
        } catch (err) {
            setError('Erro ao carregar manutenções.');
        }
        setLoading(false);
    };

    const fetchVehicles = async () => {
        try {
            const res = await api.get('/vehicles');
            setVehicles(res.data);
        } catch { }
    };

    useEffect(() => {
        fetchMaintenances();
        fetchVehicles();
    }, []);

    const handleAdd = () => {
        setEditMaintenance(null);
        setShowForm(true);
    };

    const handleEdit = (maintenance) => {
        setEditMaintenance(maintenance);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Deseja realmente excluir esta manutenção?')) {
            try {
                await api.delete(`/maintenances/${id}`);
                setNotification({ message: 'Manutenção excluída com sucesso!', type: 'success' });
                fetchMaintenances();
            } catch {
                setNotification({ message: 'Erro ao excluir manutenção.', type: 'error' });
            }
        }
    };

    const handleFormSubmit = async (data) => {
        try {
            if (editMaintenance) {
                await api.put(`/maintenances/${editMaintenance.id}`, data);
                setNotification({ message: 'Manutenção atualizada com sucesso!', type: 'success' });
            } else {
                await api.post('/maintenances', data);
                setNotification({ message: 'Manutenção cadastrada com sucesso!', type: 'success' });
            }
            setShowForm(false);
            setEditMaintenance(null);
            fetchMaintenances();
        } catch {
            setNotification({ message: 'Erro ao salvar manutenção.', type: 'error' });
        }
    };

    const filteredMaintenances = maintenances.filter(m => {
        const v = vehicles.find(v => v.id === m.vehicleId) || {};
        return (
            (v.brand + ' ' + v.model + ' ' + v.plate).toLowerCase().includes(search.toLowerCase()) ||
            (m.type || '').toLowerCase().includes(search.toLowerCase())
        );
    });

    return (
        <div className="p-6">
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: 'success' })} />
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Manutenções</h1>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition">
                    <FaPlus /> Agendar Manutenção
                </button>
            </div>
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar por veículo, tipo ou status..."
                    className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            {error && <div className="mb-4 text-red-600">{error}</div>}
            {showForm && (
                <div className="mb-6">
                    <MaintenanceForm
                        initialData={editMaintenance || {}}
                        onSubmit={handleFormSubmit}
                        onCancel={() => { setShowForm(false); setEditMaintenance(null); }}
                        vehicles={vehicles}
                    />
                </div>
            )}
            {loading ? (
                <div>Carregando...</div>
            ) : filteredMaintenances.length === 0 ? (
                <div className="bg-white rounded shadow p-4 text-gray-500">Nenhuma manutenção registrada.</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMaintenances.map(m => {
                                const v = vehicles.find(v => v.id === m.vehicleId) || {};
                                return (
                                    <tr key={m.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold">{v.brand} {v.model} ({v.plate})</td>
                                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2"><FaWrench /> {m.type}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap font-semibold ${statusColors[m.status] || ''}`}>{m.status}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(m.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{m.cost > 0 ? `R$ ${m.cost.toFixed(2)}` : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button onClick={() => handleEdit(m)} className="text-blue-700 hover:underline mr-2">Editar</button>
                                            <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:underline">Excluir</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
} 
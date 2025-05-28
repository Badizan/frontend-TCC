import { useEffect, useState } from 'react';
import VehicleForm from '../components/VehicleForm';
import Notification from '../components/Notification';
import { FaPlus } from 'react-icons/fa';
import { api } from '../config/api';

function exportToCSV(data, filename) {
    const csvRows = [
        ['Marca', 'Modelo', 'Ano', 'Placa', 'Cor'],
        ...data.map(v => [v.brand, v.model, v.year, v.plate, v.color])
    ];
    const csvContent = csvRows.map(row => row.map(String).map(s => '"' + s.replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export default function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editVehicle, setEditVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    const [search, setSearch] = useState('');

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await api.get('/vehicles');
            setVehicles(res.data);
        } catch (err) {
            setError('Erro ao carregar veículos.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleAdd = () => {
        setEditVehicle(null);
        setShowForm(true);
    };

    const handleEdit = (vehicle) => {
        setEditVehicle(vehicle);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Deseja realmente excluir este veículo?')) {
            try {
                await api.delete(`/vehicles/${id}`);
                setNotification({ message: 'Veículo excluído com sucesso!', type: 'success' });
                fetchVehicles();
            } catch {
                setNotification({ message: 'Erro ao excluir veículo.', type: 'error' });
            }
        }
    };

    const handleFormSubmit = async (data) => {
        try {
            if (editVehicle) {
                await api.put(`/vehicles/${editVehicle.id}`, data);
                setNotification({ message: 'Veículo atualizado com sucesso!', type: 'success' });
            } else {
                await api.post('/vehicles', data);
                setNotification({ message: 'Veículo cadastrado com sucesso!', type: 'success' });
            }
            setShowForm(false);
            setEditVehicle(null);
            fetchVehicles();
        } catch {
            setNotification({ message: 'Erro ao salvar veículo.', type: 'error' });
        }
    };

    const filteredVehicles = vehicles.filter(v =>
        v.plate.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6">
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: 'success' })} />
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Seus Veículos</h1>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition">
                    <FaPlus /> Adicionar Veículo
                </button>
            </div>
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar veículos por nome, marca, modelo ou placa..."
                    className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            {showForm && (
                <div className="mb-6">
                    <VehicleForm
                        initialData={editVehicle || {}}
                        onSubmit={handleFormSubmit}
                        onCancel={() => { setShowForm(false); setEditVehicle(null); }}
                    />
                </div>
            )}
            {loading ? (
                <div>Carregando...</div>
            ) : filteredVehicles.length === 0 ? (
                <div className="text-center text-gray-500 mt-12">Nenhum veículo encontrado.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map(v => (
                        <div key={v.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
                            <img src={v.image} alt={v.model} className="w-full h-40 object-cover rounded mb-4" />
                            <div className="font-bold text-lg mb-1">{v.name}</div>
                            <div className="text-gray-600 mb-2">{v.model} ({v.year})</div>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-2">
                                <span><b>Ano:</b> {v.year}</span>
                                <span><b>Combustível:</b> {v.fuel}</span>
                                <span><b>Hodômetro:</b> {v.odometer?.toLocaleString()} km</span>
                            </div>
                            <div className="text-xs text-gray-400 mb-2">Placa: {v.plate}</div>
                            <div className="mt-auto text-right">
                                <button onClick={() => handleEdit(v)} className="text-blue-700 hover:underline mr-2">Editar</button>
                                <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:underline">Excluir</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 
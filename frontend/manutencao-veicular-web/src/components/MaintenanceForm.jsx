import { useState } from 'react';

export default function MaintenanceForm({ initialData = {}, onSubmit, onCancel, vehicles = [] }) {
    const [vehicleId, setVehicleId] = useState(initialData.vehicleId || '');
    const [description, setDescription] = useState(initialData.description || '');
    const [date, setDate] = useState(initialData.date || '');
    const [cost, setCost] = useState(initialData.cost || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ vehicleId, description, date, cost });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block mb-1">Veículo</label>
                <select className="w-full border rounded px-3 py-2" value={vehicleId} onChange={e => setVehicleId(e.target.value)} required>
                    <option value="">Selecione...</option>
                    {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block mb-1">Descrição</label>
                <input className="w-full border rounded px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
            <div>
                <label className="block mb-1">Data</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div>
                <label className="block mb-1">Custo</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={cost} onChange={e => setCost(e.target.value)} required />
            </div>
            <div className="flex gap-2 justify-end">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Salvar</button>
            </div>
        </form>
    );
} 
import { useState } from 'react';

export default function VehicleForm({ initialData = {}, onSubmit, onCancel }) {
    const [brand, setBrand] = useState(initialData.brand || '');
    const [model, setModel] = useState(initialData.model || '');
    const [year, setYear] = useState(initialData.year || '');
    const [plate, setPlate] = useState(initialData.plate || '');
    const [color, setColor] = useState(initialData.color || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ brand, model, year, plate, color });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block mb-1">Marca</label>
                <input className="w-full border rounded px-3 py-2" value={brand} onChange={e => setBrand(e.target.value)} required />
            </div>
            <div>
                <label className="block mb-1">Modelo</label>
                <input className="w-full border rounded px-3 py-2" value={model} onChange={e => setModel(e.target.value)} required />
            </div>
            <div>
                <label className="block mb-1">Ano</label>
                <input className="w-full border rounded px-3 py-2" value={year} onChange={e => setYear(e.target.value)} required />
            </div>
            <div>
                <label className="block mb-1">Placa</label>
                <input className="w-full border rounded px-3 py-2" value={plate} onChange={e => setPlate(e.target.value)} required />
            </div>
            <div>
                <label className="block mb-1">Cor</label>
                <input className="w-full border rounded px-3 py-2" value={color} onChange={e => setColor(e.target.value)} required />
            </div>
            <div className="flex gap-2 justify-end">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Salvar</button>
            </div>
        </form>
    );
} 
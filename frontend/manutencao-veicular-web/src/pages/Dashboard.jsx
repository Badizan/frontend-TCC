import { useEffect, useState } from 'react';
import { api } from '../config/api';
import { FaCar, FaTools, FaClock, FaMoneyBillWave } from 'react-icons/fa';

const DIAS_PARA_LEMBRETE = 180; // 6 meses

function getDiasEntreDatas(data1, data2) {
    const dt1 = new Date(data1);
    const dt2 = new Date(data2);
    return Math.floor((dt2 - dt1) / (1000 * 60 * 60 * 24));
}

export default function Dashboard() {
    const [vehicles, setVehicles] = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lembretes, setLembretes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [vRes, mRes] = await Promise.all([
                    api.get('/vehicles'),
                    api.get('/maintenances')
                ]);
                setVehicles(Array.isArray(vRes.data) ? vRes.data : vRes.data.vehicles || []);
                setMaintenances(Array.isArray(mRes.data) ? mRes.data : mRes.data.maintenances || []);
            } catch {
                setVehicles([]);
                setMaintenances([]);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        // Gerar lembretes automáticos
        const hoje = new Date();
        const lembretesGerados = vehicles.map(v => {
            const manuts = maintenances.filter(m => m.vehicleId === v.id);
            if (manuts.length === 0) {
                return {
                    vehicle: v,
                    tipo: 'alerta',
                    mensagem: `O veículo ${v.brand} ${v.model} (${v.plate}) nunca teve manutenção registrada. Agende uma revisão!`
                };
            }
            const ultima = manuts.reduce((a, b) => (a.date > b.date ? a : b));
            const dias = getDiasEntreDatas(ultima.date, hoje.toISOString().slice(0, 10));
            if (dias >= DIAS_PARA_LEMBRETE) {
                return {
                    vehicle: v,
                    tipo: 'alerta',
                    mensagem: `O veículo ${v.brand} ${v.model} (${v.plate}) está há ${dias} dias sem manutenção. Agende uma revisão!`
                };
            } else if (dias >= DIAS_PARA_LEMBRETE - 15) {
                return {
                    vehicle: v,
                    tipo: 'info',
                    mensagem: `O veículo ${v.brand} ${v.model} (${v.plate}) está próximo do prazo de revisão preventiva.`
                };
            }
            return null;
        }).filter(Boolean);
        setLembretes(lembretesGerados);
    }, [vehicles, maintenances]);

    // Gastos totais por veículo
    const gastosPorVeiculo = vehicles.map(v => ({
        name: `${v.brand} ${v.model}`,
        total: maintenances.filter(m => m.vehicleId === v.id).reduce((sum, m) => sum + Number(m.cost), 0)
    }));

    // Gastos por mês (YYYY-MM)
    const gastosPorMes = {};
    maintenances.forEach(m => {
        const mes = m.date?.slice(0, 7);
        if (!mes) return;
        gastosPorMes[mes] = (gastosPorMes[mes] || 0) + Number(m.cost);
    });
    const gastosMesArray = Object.entries(gastosPorMes).map(([mes, total]) => ({ mes, total }));

    return (
        <div className="space-y-8">
            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <SummaryCard icon={<FaCar size={28} />} label="Total de Veículos" value={vehicles.length} color="bg-blue-600" />
                <SummaryCard icon={<FaTools size={28} />} label="Manutenções" value={maintenances.length} color="bg-green-600" />
                <SummaryCard icon={<FaClock size={28} />} label="Próximas Manutenções" value={0} color="bg-orange-500" />
                <SummaryCard icon={<FaMoneyBillWave size={28} />} label="Gasto Anual" value={`R$ ${gastosPorVeiculo.reduce((sum, v) => sum + v.total, 0)}`} color="bg-purple-600" />
            </div>

            {/* Lembretes */}
            {lembretes.length > 0 && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                    <ul className="list-disc pl-5">
                        {lembretes.map((l, i) => (
                            <li key={i}>{l.mensagem}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Listas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Veículos */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Seus Veículos</h2>
                    <ul className="space-y-4">
                        {Array.isArray(vehicles) && vehicles.map((v) => (
                            <li key={v.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                                <img src={v.image} alt={v.model} className="w-16 h-16 rounded object-cover" />
                                <div className="flex-1">
                                    <div className="font-semibold">{v.name}</div>
                                    <div className="text-sm text-gray-500">{v.model} • {v.year}</div>
                                </div>
                                <div className="text-xs text-gray-400">Placa: {v.plate}</div>
                            </li>
                        ))}
                    </ul>
                    <button className="mt-4 w-full border border-blue-700 text-blue-700 rounded py-2 hover:bg-blue-50 transition">Ver todos os veículos</button>
                </div>
                {/* Próximas Manutenções */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Próximas Manutenções</h2>
                    <div className="text-gray-500 text-center">Nenhuma manutenção próxima</div>
                    <button className="mt-4 w-full border border-blue-700 text-blue-700 rounded py-2 hover:bg-blue-50 transition">Agendar Manutenção</button>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ icon, label, value, color }) {
    return (
        <div className={`flex items-center gap-4 p-6 rounded-lg shadow text-white ${color}`}>
            <div>{icon}</div>
            <div>
                <div className="text-lg font-bold">{value}</div>
                <div className="text-sm">{label}</div>
            </div>
        </div>
    );
} 
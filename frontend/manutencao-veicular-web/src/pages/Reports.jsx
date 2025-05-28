import { useEffect, useState } from 'react';
import { api } from '../config/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

export default function Reports() {
    const [vehicles, setVehicles] = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [vRes, mRes] = await Promise.all([
                    api.get('/vehicles'),
                    api.get('/maintenances')
                ]);
                setVehicles(vRes.data);
                setMaintenances(mRes.data);
            } catch { }
            setLoading(false);
        };
        fetchData();
    }, []);

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
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-8">Relatórios</h1>
            {loading ? (
                <div>Carregando...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Gráfico de barras: Gastos por veículo */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold mb-4">Gastos Totais por Veículo</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={gastosPorVeiculo}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="total" fill="#2563eb" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    {/* Gráfico de linha: Gastos por mês */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold mb-4">Evolução dos Gastos (por mês)</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={gastosMesArray}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mes" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="total" stroke="#2563eb" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 
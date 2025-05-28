import { useEffect, useState } from 'react';
import { api } from '../config/api';
import { FaBell, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const DIAS_PARA_LEMBRETE = 180; // 6 meses

function getDiasEntreDatas(data1, data2) {
    const dt1 = new Date(data1);
    const dt2 = new Date(data2);
    return Math.floor((dt2 - dt1) / (1000 * 60 * 60 * 24));
}

const typeStyles = {
    alert: 'bg-red-100 text-red-800 border-red-300',
    info: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    success: 'bg-green-100 text-green-800 border-green-300',
};

const typeIcons = {
    alert: <FaExclamationTriangle className="text-red-500" />,
    info: <FaBell className="text-yellow-500" />,
    success: <FaCheckCircle className="text-green-500" />,
};

export default function Notifications() {
    const [vehicles, setVehicles] = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [notifications, setNotifications] = useState([]);
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

    useEffect(() => {
        // Gerar notificações automáticas
        const hoje = new Date();
        const notifs = [];
        vehicles.forEach(v => {
            const manuts = maintenances.filter(m => m.vehicleId === v.id);
            if (manuts.length === 0) {
                notifs.push({
                    id: `alert-${v.id}`,
                    type: 'alert',
                    message: `O veículo ${v.brand} ${v.model} (${v.plate}) nunca teve manutenção registrada. Agende uma revisão!`,
                    date: hoje.toISOString().slice(0, 10),
                });
                return;
            }
            const ultima = manuts.reduce((a, b) => (a.date > b.date ? a : b));
            const dias = getDiasEntreDatas(ultima.date, hoje.toISOString().slice(0, 10));
            if (dias >= DIAS_PARA_LEMBRETE) {
                notifs.push({
                    id: `alert-${v.id}`,
                    type: 'alert',
                    message: `O veículo ${v.brand} ${v.model} (${v.plate}) está há ${dias} dias sem manutenção. Agende uma revisão!`,
                    date: hoje.toISOString().slice(0, 10),
                });
            } else if (dias >= DIAS_PARA_LEMBRETE - 15) {
                notifs.push({
                    id: `info-${v.id}`,
                    type: 'info',
                    message: `O veículo ${v.brand} ${v.model} (${v.plate}) está próximo do prazo de revisão preventiva.`,
                    date: hoje.toISOString().slice(0, 10),
                });
            }
        });
        // Notificação de sucesso de manutenção recente
        maintenances.forEach(m => {
            if (m.status === 'COMPLETED') {
                const v = vehicles.find(v => v.id === m.vehicleId);
                if (v) {
                    notifs.push({
                        id: `success-${m.id}`,
                        type: 'success',
                        message: `Manutenção do ${v.brand} ${v.model} concluída com sucesso!`,
                        date: m.date,
                    });
                }
            }
        });
        setNotifications(notifs);
    }, [vehicles, maintenances]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-8">Notificações</h1>
            <div className="space-y-4">
                {loading ? (
                    <div>Carregando...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">Nenhuma notificação encontrada.</div>
                ) : (
                    notifications.map(n => (
                        <div key={n.id} className={`flex items-center gap-4 p-4 rounded border ${typeStyles[n.type]}`}>
                            {typeIcons[n.type]}
                            <div className="flex-1">
                                <div className="font-semibold">{n.message}</div>
                                <div className="text-xs text-gray-500 mt-1">{new Date(n.date).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
} 
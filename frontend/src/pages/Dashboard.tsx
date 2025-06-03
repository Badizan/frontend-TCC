import React from 'react';
import { Car, ChevronRight, AlertTriangle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock de veículos
const mockVehicles = [
  {
    id: '1',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    mileage: 45000,
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200',
  },
  {
    id: '2',
    brand: 'Honda',
    model: 'HR-V',
    year: 2019,
    mileage: 62000,
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200',
  },
  {
    id: '3',
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2018,
    mileage: 80000,
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200',
  },
];

// Mock de lembretes
const mockReminders = [
  {
    id: '1',
    title: 'Troca de óleo',
    date: '2025-06-05',
    urgent: true,
    vehicle: 'Toyota Corolla',
  },
  {
    id: '2',
    title: 'Revisão dos freios',
    date: '2025-06-13',
    urgent: false,
    vehicle: 'Toyota Corolla',
  },
];

// Mock de histórico de manutenções
const mockHistory = [
  {
    id: '1',
    type: 'P',
    title: 'Pneus',
    desc: 'Troca de pneus',
    place: 'Oficina do Zé',
    mileage: 44000,
    value: 1200,
    date: '2025-04-29',
  },
  {
    id: '2',
    type: 'A',
    title: 'Alinhamento',
    desc: 'Alinhamento e balanceamento',
    place: 'Auto Center',
    mileage: 61500,
    value: 200,
    date: '2025-05-19',
  },
];

const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen animate-fade-in p-2 sm:p-0">
      {/* Alerta de manutenção pendente igual à imagem */}
      <div className="max-w-2xl w-full mt-2 mb-2 mx-auto">
        <div className="flex items-center bg-gradient-to-r from-orange-100 via-orange-50 to-yellow-50 border border-orange-200 rounded-xl px-5 py-4 text-orange-800 text-base font-semibold gap-4 shadow-lg animate-fade-in">
          <AlertTriangle className="w-6 h-6 text-orange-500 animate-pulse" />
          <div>
            <div className="font-bold text-orange-700">Manutenção pendente</div>
            <div className="text-xs text-orange-700">Troca de óleo em 15 dias para Toyota Corolla</div>
          </div>
        </div>
      </div>
      <main className="flex-1 space-y-12 max-w-6xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-lg">Dashboard</h1>
            <span className="text-gray-400 text-lg font-medium">Resumo geral do sistema</span>
          </div>
          <Link to="/vehicles/new" className="btn-primary px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform text-lg font-bold">
            + Adicionar Veículo
          </Link>
        </div>
        {/* Meus Veículos */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Car className="w-6 h-6 text-blue-500" />Meus Veículos</h2>
          <div className="flex gap-8 overflow-x-auto pb-2">
            {mockVehicles.map(v => (
              <Link to={`/vehicles/${v.id}`} key={v.id} className="bg-white rounded-2xl shadow-xl p-7 min-w-[260px] flex flex-col items-start hover:shadow-2xl hover:-translate-y-1 transition-all border-2 border-blue-100 group relative">
                <img src={v.image} alt={v.model} className="w-20 h-20 rounded-xl object-cover mb-4 border-4 border-blue-100 group-hover:border-blue-300 transition" />
                <div className="font-bold text-2xl text-gray-900 flex items-center gap-2">
                  {v.brand} {v.model}
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition" />
                </div>
                <div className="text-gray-500 text-sm mb-1">{v.brand} {v.model} ({v.year})</div>
                <div className="text-gray-700 text-base font-medium">{v.mileage.toLocaleString('pt-BR')} km</div>
                <span className="absolute top-3 right-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold shadow">ID {v.id}</span>
              </Link>
            ))}
          </div>
        </section>
        {/* Próximas Manutenções e Histórico */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Próximas Manutenções */}
          <div className="bg-white rounded-2xl shadow-xl p-7 flex flex-col gap-5 border-2 border-yellow-100">
            <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" /> Próximas Manutenções
            </h3>
            <ul className="space-y-5">
              {mockReminders.map(m => (
                <li key={m.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    {m.urgent ? (
                      <span className="rounded-full bg-orange-100 p-1 animate-pulse"><AlertTriangle className="text-orange-500 w-4 h-4" /></span>
                    ) : (
                      <span className="rounded-full bg-yellow-100 p-1"><Clock className="text-yellow-500 w-4 h-4" /></span>
                    )}
                    <div>
                      <div className="font-semibold text-gray-700 group-hover:text-blue-700 transition text-base">{m.title}</div>
                      <div className="text-xs text-gray-500">Data: {new Date(m.date).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold border shadow-sm ${m.urgent ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>{m.urgent ? 'Urgente' : 'Em breve'}</span>
                    <button className="btn-outline-primary text-xs rounded-lg px-4 py-1 font-bold">Concluir</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* Histórico de Manutenções */}
          <div className="bg-white rounded-2xl shadow-xl p-7 flex flex-col gap-5 border-2 border-blue-100">
            <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-400" /> Histórico de Manutenções
            </h3>
            <ul className="space-y-5">
              {mockHistory.map(h => (
                <li key={h.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg group-hover:bg-blue-200 transition shadow">
                      {h.type}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700 group-hover:text-blue-700 transition text-base">{h.title} <span className="text-gray-500 font-normal">- {h.desc}</span></div>
                      <div className="text-xs text-gray-500">{h.place} • {h.mileage.toLocaleString('pt-BR')} km</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-700 group-hover:text-blue-900 transition text-base">R$ {h.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                    <div className="text-xs text-gray-400">{new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Dashboard;
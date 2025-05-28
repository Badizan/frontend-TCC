import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';

export default function Profile() {
    const { user } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email] = useState(user?.email || '');
    const [role] = useState(user?.role || '');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess('');
        setError('');
        setLoading(true);
        try {
            await api.put(`/users/${user.id}`, {
                name,
                password: password || undefined,
            });
            setSuccess('Perfil atualizado com sucesso!');
            setPassword('');
        } catch {
            setError('Erro ao atualizar perfil.');
        }
        setLoading(false);
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Meu Perfil</h1>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input
                        type="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                        value={email}
                        disabled
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Usuário</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                        value={role}
                        disabled
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                    <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Deixe em branco para não alterar"
                    />
                </div>
                {success && <div className="text-green-600 text-sm">{success}</div>}
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Alterações'}</button>
            </form>
        </div>
    );
} 
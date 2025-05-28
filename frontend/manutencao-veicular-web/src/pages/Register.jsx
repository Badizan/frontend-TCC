import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Erro ao cadastrar. Verifique os dados.');
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-2">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Cadastro</h2>
                {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
                <div className="mb-4">
                    <label className="block mb-1 text-gray-700">Nome</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300" />
                </div>
                <div className="mb-4">
                    <label className="block mb-1 text-gray-700">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300" />
                </div>
                <div className="mb-6">
                    <label className="block mb-1 text-gray-700">Senha</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300" />
                </div>
                <button type="submit" disabled={loading} className={`w-full bg-blue-600 text-white py-2 rounded transition ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}>{loading ? 'Cadastrando...' : 'Cadastrar'}</button>
            </form>
        </div>
    );
} 
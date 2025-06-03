import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      // Simulação de cadastro (mock)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError('Erro ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 bg-gradient-to-br from-green-100 via-white to-blue-200 animate-fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center animate-bounce-slow">
          <span className="text-green-600 bg-green-100 p-4 rounded-full shadow-lg shadow-green-200">
            <Car className="w-12 h-12" />
          </span>
        </div>
        <h2 className="mt-6 text-center text-4xl font-extrabold tracking-tight text-gray-900 drop-shadow-lg">
          Criar Conta
        </h2>
        <p className="mt-2 text-center text-base text-gray-600 font-medium">
          Preencha os campos para se cadastrar
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 py-10 px-6 shadow-2xl rounded-2xl sm:px-12 border border-green-100">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-semibold animate-shake">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm font-semibold animate-bounce">
              Cadastro realizado com sucesso! Redirecionando...
            </div>
          )}
          <form className="space-y-7" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-lg font-semibold text-gray-700 mb-1">
                Nome
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition text-base shadow-sm"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-lg font-semibold text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition text-base shadow-sm"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-lg font-semibold text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition text-base shadow-sm"
                placeholder="********"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-lg shadow-md transition bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-700 focus:ring-2 focus:ring-green-400 focus:outline-none ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cadastrando...
                  </span>
                ) : 'Cadastrar'}
              </button>
            </div>
          </form>
          <div className="mt-8 text-center">
            <p className="text-base text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-bold text-green-600 hover:text-blue-700 transition underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
      <style>{`
        .animate-bounce-slow { animation: bounce 2.5s infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-shake { animation: shake 0.4s; }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        .animate-fade-in { animation: fadeIn 0.7s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Register; 
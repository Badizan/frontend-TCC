import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Eye, EyeOff, Lock, Mail, User, Car, Loader2, AlertCircle, Shield, Check } from 'lucide-react';
import { translateError } from '../utils/errorTranslations';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register, loading } = useAppStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Remove erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validação de email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Digite um email válido';
    }

    // Validação de senha
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validações específicas para registro
    if (!isLogin) {
      if (!formData.name.trim()) {
        newErrors.name = 'Nome é obrigatório';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      if (isLogin) {
        console.log('🔑 Login: Fazendo login...');
        const response = await login(formData.email, formData.password);
        console.log('✅ Login: Sucesso, redirecionando...', response);
        
        // Aguarda um pouco para garantir que o estado foi atualizado
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } else {
        console.log('📝 Login: Fazendo registro...');
        const response = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: 'OWNER'
        });
        console.log('✅ Login: Registro bem-sucedido', response);
        
        // Mostrar sucesso e alternar para modo login após 2 segundos
        setRegistrationSuccess(true);
        setFormData({
          email: formData.email, // Manter email para facilitar login
          password: '',
          name: '',
          confirmPassword: ''
        });
        
        setTimeout(() => {
          setRegistrationSuccess(false);
          setIsLogin(true);
        }, 3000);
      }
    } catch (error: any) {
      console.error('❌ Login: Erro na autenticação:', error);
      
      let errorMessage = 'Ocorreu um erro inesperado';
      
      if (error?.message) {
        errorMessage = translateError(error.message);
      } else if (error?.response?.data?.message) {
        errorMessage = translateError(error.response.data.message);
      } else if (typeof error === 'string') {
        errorMessage = translateError(error);
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: formData.email, // Mantém email ao trocar de modo
      password: '',
      name: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-sm sm:max-w-md relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-3 sm:mb-4 shadow-2xl">
            <Car className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Auto<span className="text-blue-400">Manutenção</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Plataforma completa para gestão veicular
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 sm:px-8 py-4 sm:py-6 text-center relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
            <div className="relative z-10">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-1">
                {isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm">
                {isLogin 
                  ? 'Acesse sua conta para continuar' 
                  : 'Junte-se à nossa plataforma'
                }
              </p>
            </div>
          </div>

          {/* Toggle */}
          <div className="px-4 sm:px-8 pt-4 sm:pt-6">
            <div className="flex bg-slate-100 rounded-xl sm:rounded-2xl p-1 sm:p-1.5">
              <button
                type="button"
                onClick={() => !isSubmitting && toggleMode()}
                disabled={isSubmitting}
                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 ${
                  isLogin
                    ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => !isSubmitting && toggleMode()}
                disabled={isSubmitting}
                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 ${
                  !isLogin
                    ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Registrar
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-4 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
            {/* Nome (apenas para registro) */}
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-slate-700">
                  Nome completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 border-2 rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                    placeholder="Seu nome completo"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs sm:text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-slate-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 border-2 rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                  placeholder="seu@email.com"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="text-xs sm:text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-slate-700">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 border-2 rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                  placeholder="Sua senha"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs sm:text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirmar senha (apenas para registro) */}
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-semibold text-slate-700">
                  Confirmar senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 border-2 rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                    placeholder="Confirme sua senha"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs sm:text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Mensagem de sucesso do registro */}
            {registrationSuccess && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                    <Check className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-2">Conta criada com sucesso!</h3>
                  <p className="text-xs sm:text-sm text-green-700 mb-3">
                    Sua conta foi criada com segurança. Agora você pode fazer login para acessar a plataforma.
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    Redirecionando para o login...
                  </p>
                </div>
              </div>
            )}

            {/* Mensagem de erro */}
            {errors.submit && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-red-700 flex items-center">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-500" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Botão de submit */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full flex justify-center items-center py-3 sm:py-4 px-4 sm:px-6 border border-transparent rounded-lg sm:rounded-xl shadow-lg text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                  {isLogin ? 'Entrando...' : 'Criando conta...'}
                </>
              ) : (
                <>{isLogin ? 'Entrar na plataforma' : 'Criar conta'}</>
              )}
            </button>
          </form>

          {/* Security Footer */}
          <div className="px-4 sm:px-8 pb-4 sm:pb-6">
            <div className="flex items-center justify-center text-xs text-slate-500 border-t border-slate-200 pt-3 sm:pt-4">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="text-xs">Seus dados estão protegidos com criptografia de ponta</span>
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-slate-400 text-xs sm:text-sm">
            © 2025 AutoManutenção. Todos os direitos reservados.
          </p>
          <div className="flex justify-center space-x-4 sm:space-x-6 mt-2 sm:mt-3">
            <a href="#" className="text-slate-400 hover:text-white text-xs transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="text-slate-400 hover:text-white text-xs transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-slate-400 hover:text-white text-xs transition-colors">
              Suporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
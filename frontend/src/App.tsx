import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { VehicleList } from './pages/VehicleList';
import { VehicleDetail } from './pages/VehicleDetail';
import { VehicleNew } from './pages/VehicleNew';
import { VehicleEdit } from './pages/VehicleEdit';
import { MaintenancePage } from './pages/MaintenancePage';
import { ExpensesPage } from './pages/ExpensesPage';
import { RemindersPage } from './pages/RemindersPage';
import { ReportsPage } from './pages/ReportsPage';
import Login from './pages/Login';
import NotificationsPage from './pages/NotificationsPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { useAppStore } from './store';
import { useNotifications } from './hooks/useNotifications';
import { useMileageNotifications } from './hooks/useMileageNotifications';
import { api } from './services/api';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [forceRefresh, setForceRefresh] = useState(0); // Para forçar re-render quando necessário
    const [isLoggingOut, setIsLoggingOut] = useState(false); // Para controlar processo de logout
    
    const { 
        initializeAuth, 
        isAuthenticated, 
        user, 
        clearUserData, 
        forceReset,
        setNotificationCallback 
    } = useAppStore();
    
    const { showToast, checkImmediateNotifications } = useNotifications();
    
    // Hook para notificações de quilometragem
    useMileageNotifications();

    // Configurar callback de notificação
    useEffect(() => {
        const handleNotification = (type: string, title: string, message: string) => {
            console.log('🔔 App: Notificação disparada:', { type, title, message });
            showToast(title, message, type, 'success');
            
            // Verificar notificações imediatas após cadastro
            setTimeout(() => {
                checkImmediateNotifications();
            }, 1000);
        };

        setNotificationCallback(handleNotification);
    }, [setNotificationCallback, showToast, checkImmediateNotifications]);

    // Monitorar mudanças críticas de usuário para garantir isolamento total
    useEffect(() => {
        const newUserId = user?.id || null;
        
        console.log('👤 App: Verificando mudança de usuário...', {
            currentUserId,
            newUserId,
            isAuthenticated,
            isLoggingOut
        });

        // Se está fazendo logout, não processar mudanças
        if (isLoggingOut) {
            console.log('🚪 App: Logout em andamento, pulando processamento...');
            return;
        }

        // Se houve mudança de usuário ou logout
        if (currentUserId !== newUserId) {
            console.log('🔄 App: Mudança de usuário detectada!');
            
            // Se havia um usuário diferente antes
            if (currentUserId && newUserId && currentUserId !== newUserId) {
                console.log('⚠️ App: TROCA DE USUÁRIO - Limpeza total necessária');
                forceReset(); // Reset total do sistema
                setForceRefresh(prev => prev + 1); // Forçar re-render
            }
            // Se fez logout (tinha usuário, agora não tem)
            else if (currentUserId && !newUserId) {
                console.log('🚪 App: LOGOUT detectado - Limpeza total');
                setIsLoggingOut(true); // Marcar que está fazendo logout
                forceReset();
                api.clearAllCache();
                setForceRefresh(prev => prev + 1);
            }
            // Se fez login (não tinha usuário, agora tem)
            else if (!currentUserId && newUserId) {
                console.log('🔑 App: LOGIN detectado - Definindo usuário atual');
                api.setCurrentUser(newUserId);
            }
            
            setCurrentUserId(newUserId);
        }
    }, [user, currentUserId, forceReset, isLoggingOut]);

    // Inicialização da autenticação
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Verificar se estamos na página de login
                const isLoginPage = window.location.pathname === '/login';
                const token = localStorage.getItem('auth_token');
                
                console.log('🔍 App: Verificando autenticação...', { 
                    hasToken: !!token,
                    forceRefresh,
                    isLoginPage,
                    pathname: window.location.pathname
                });
                
                // Se estamos na página de login e não há token, não fazer nada
                if (isLoginPage && !token) {
                    console.log('✅ App: Página de login sem token - estado correto');
                    setIsLoading(false);
                    return;
                }
                
                if (token) {
                    console.log('🔄 App: Token encontrado, inicializando autenticação...');
                    await initializeAuth();
                    console.log('✅ App: Autenticação inicializada com sucesso');
                } else {
                    console.log('❌ App: Sem token, garantindo limpeza');
                    forceReset();
                    api.clearAllCache();
                }
            } catch (error) {
                console.error('❌ App: Erro na inicialização:', error);
                
                // Limpeza total em caso de erro
                console.log('🧹 App: Erro na autenticação, limpando tudo...');
                forceReset();
                api.clearAllCache();
                setCurrentUserId(null);
            } finally {
                // Garantir que o loading seja sempre false após um tempo máximo
                setTimeout(() => {
                    setIsLoading(false);
                }, 100);
            }
        };

        checkAuth();
    }, [initializeAuth, forceReset, forceRefresh]); // Incluir forceRefresh como dependência

    // Timeout de segurança para evitar loading infinito
    useEffect(() => {
        const safetyTimeout = setTimeout(() => {
            if (isLoading) {
                console.warn('⚠️ App: Timeout de segurança - forçando fim do loading');
                setIsLoading(false);
            }
        }, 10000); // 10 segundos

        return () => clearTimeout(safetyTimeout);
    }, [isLoading]);

    // Limpeza quando o componente é desmontado
    useEffect(() => {
        return () => {
            console.log('🧹 App: Componente desmontado, limpeza final');
        };
    }, []);

    // Loading screen
    if (isLoading || isLoggingOut) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        {isLoggingOut ? 'Saindo do sistema...' : 'Carregando sistema...'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Usuário: {currentUserId ? 'Autenticado' : 'Anônimo'}
                    </p>
                    {!isLoggingOut && (
                        <button 
                            onClick={() => {
                                console.log('🔄 App: Usuário forçou fim do loading');
                                setIsLoading(false);
                                forceReset();
                            }}
                            className="mt-4 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Se estiver demorando, clique aqui
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Debug info (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
        console.log('🎯 App Render:', {
            isAuthenticated,
            hasUser: !!user,
            userId: user?.id,
            currentUserId,
            forceRefresh
        });
    }

    return (
        <>
            <Router key={forceRefresh}> {/* Key forçará re-render completo quando necessário */}
                <Routes>
                    {/* Rotas públicas */}
                    <Route 
                        path="/login" 
                        element={
                            isAuthenticated && user ? 
                                <Navigate to="/" replace /> : 
                                <Login />
                        } 
                    />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    
                    {/* Rotas protegidas */}
                    {isAuthenticated && user ? (
                        <Route element={<Layout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/vehicles" element={<VehicleList />} />
                            <Route path="/vehicles/:id" element={<VehicleDetail />} />
                            <Route path="/vehicles/new" element={<VehicleNew />} />
                            <Route path="/vehicles/:id/edit" element={<VehicleEdit />} />
                            <Route path="/maintenance" element={<MaintenancePage />} />
                            <Route path="/expenses" element={<ExpensesPage />} />
                            <Route path="/reminders" element={<RemindersPage />} />
                            <Route path="/reports" element={<ReportsPage />} />
                            <Route path="/notifications" element={<NotificationsPage />} />
                        </Route>
                    ) : (
                        // Redirecionar apenas se não estiver já na página de login
                        <Route path="*" element={
                            window.location.pathname === '/login' ? 
                                <Login /> : 
                                <Navigate to="/login" replace />
                        } />
                    )}
                </Routes>
            </Router>
                
            {/* Toast container */}
            <Toaster
                position="bottom-right"
                gutter={12}
                containerStyle={{
                    bottom: '20px',
                    right: '20px'
                }}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        fontWeight: '500',
                        fontSize: '14px',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    },
                    success: {
                        style: {
                            background: '#10B981',
                        },
                        iconTheme: {
                            primary: '#fff',
                            secondary: '#10B981',
                        },
                    },
                    error: {
                        style: {
                            background: '#EF4444',
                        },
                        iconTheme: {
                            primary: '#fff',
                            secondary: '#EF4444',
                        },
                    },
                }}
            />
        </>
    );
};

export { App };
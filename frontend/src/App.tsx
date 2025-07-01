import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { NotificationsPage } from './pages/NotificationsPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { useAppStore } from './store';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const { initializeAuth, isAuthenticated, user, clearUserData } = useAppStore();

    // Monitorar mudanças de usuário para limpar dados
    useEffect(() => {
        if (user && user.id !== currentUserId) {
            console.log('👤 App: Mudança de usuário detectada, limpando dados...');
            
            // Se havia um usuário diferente antes, limpar dados
            if (currentUserId && currentUserId !== user.id) {
                clearUserData();
            }
            
            setCurrentUserId(user.id);
        } else if (!user && currentUserId) {
            console.log('🚪 App: Logout detectado, limpando dados...');
            clearUserData();
            setCurrentUserId(null);
        }
    }, [user, currentUserId, clearUserData]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                console.log('🔍 App: Verificando token...', { hasToken: !!token });
                
                if (token) {
                    console.log('🔄 App: Inicializando autenticação...');
                    await initializeAuth();
                    console.log('✅ App: Autenticação inicializada');
                }
            } catch (error) {
                console.error('❌ App: Erro na inicialização:', error);
                // Limpar token inválido
                localStorage.removeItem('auth_token');
                clearUserData();
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [initializeAuth, clearUserData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando sistema...</p>
                </div>
            </div>
        );
    }

    return (
        <Router>
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
                    <Route path="*" element={<Navigate to="/login" replace />} />
                )}
            </Routes>
        </Router>
    );
};

export { App };
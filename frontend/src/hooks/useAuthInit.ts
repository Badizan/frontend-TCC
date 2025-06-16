import { useEffect } from 'react';
import { useAppStore } from '../store';

export const useAuthInit = () => {
    const { initializeAuth, isAuthenticated } = useAppStore();

    useEffect(() => {
        // Só inicializa se há token mas não há usuário carregado
        const token = localStorage.getItem('auth_token');
        if (token && isAuthenticated) {
            initializeAuth();
        }
    }, [initializeAuth, isAuthenticated]);
}; 
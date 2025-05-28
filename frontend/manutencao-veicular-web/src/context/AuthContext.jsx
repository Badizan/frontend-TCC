import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../config/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('@manutencao:token');
        if (token) {
            api.get('/users/profile')
                .then(response => {
                    setUser(response.data.user);
                })
                .catch(() => {
                    localStorage.removeItem('@manutencao:token');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const signIn = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('@manutencao:token', token);
            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Erro ao fazer login'
            };
        }
    };

    const signOut = () => {
        localStorage.removeItem('@manutencao:token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signIn,
            signOut,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 
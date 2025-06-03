import api from './api';

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData extends LoginCredentials {
    name: string;
}

interface AuthResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

class AuthService {
    private user: User | null = null;

    async login(credentials: LoginCredentials): Promise<User> {
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Credenciais mockadas
        if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
            this.user = {
                id: '1',
                name: 'Admin',
                email: credentials.email,
                avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'
            };
            localStorage.setItem('user', JSON.stringify(this.user));
            return this.user;
        }

        throw new Error('Credenciais inválidas');
    }

    logout(): void {
        this.user = null;
        localStorage.removeItem('user');
    }

    isAuthenticated(): boolean {
        return !!this.user;
    }

    getCurrentUser(): User | null {
        if (!this.user) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                this.user = JSON.parse(storedUser);
            }
        }
        return this.user;
    }
}

export const authService = new AuthService(); 
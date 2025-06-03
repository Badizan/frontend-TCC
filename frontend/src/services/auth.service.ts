import { apiService } from './api.service';
import { storageService } from './storage.service';
import { notificationService } from './notification.service';
import { configService } from './config.service';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    [key: string]: any;
}

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface LoginCredentials {
    email: string;
    password: string;
    remember?: boolean;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface ResetPasswordData {
    email: string;
}

interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface UpdateProfileData {
    name?: string;
    email?: string;
    avatar?: File;
    [key: string]: any;
}

class AuthService {
    private readonly TOKEN_KEY = 'auth_token';
    private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
    private readonly USER_KEY = 'auth_user';
    private readonly REMEMBER_KEY = 'auth_remember';

    private state: AuthState = {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
    };

    constructor() {
        this.loadState();
    }

    private loadState(): void {
        const token = storageService.get<string>(this.TOKEN_KEY, null);
        const refreshToken = storageService.get<string>(this.REFRESH_TOKEN_KEY, null);
        const user = storageService.get<User>(this.USER_KEY, null);
        const remember = storageService.get<boolean>(this.REMEMBER_KEY, false);

        this.state = {
            user,
            token,
            refreshToken,
            isAuthenticated: !!token && !!user,
            isLoading: false,
            error: null,
        };

        if (remember && token && refreshToken) {
            this.refreshToken();
        }
    }

    private saveState(): void {
        if (this.state.token) {
            storageService.set(this.TOKEN_KEY, this.state.token);
        } else {
            storageService.remove(this.TOKEN_KEY);
        }

        if (this.state.refreshToken) {
            storageService.set(this.REFRESH_TOKEN_KEY, this.state.refreshToken);
        } else {
            storageService.remove(this.REFRESH_TOKEN_KEY);
        }

        if (this.state.user) {
            storageService.set(this.USER_KEY, this.state.user);
        } else {
            storageService.remove(this.USER_KEY);
        }
    }

    private clearState(): void {
        this.state = {
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        };
        this.saveState();
    }

    async login(credentials: LoginCredentials): Promise<void> {
        try {
            this.state.isLoading = true;
            this.state.error = null;

            const response = await apiService.post<{ user: User; token: string; refreshToken: string }>('/auth/login', credentials);

            this.state.user = response.user;
            this.state.token = response.token;
            this.state.refreshToken = response.refreshToken;
            this.state.isAuthenticated = true;

            if (credentials.remember) {
                storageService.set(this.REMEMBER_KEY, true);
            } else {
                storageService.remove(this.REMEMBER_KEY);
            }

            this.saveState();
            notificationService.success('Login successful');
        } catch (error: any) {
            this.state.error = error.message || 'Login failed';
            notificationService.error(this.state.error);
            throw error;
        } finally {
            this.state.isLoading = false;
        }
    }

    async register(data: RegisterData): Promise<void> {
        try {
            this.state.isLoading = true;
            this.state.error = null;

            await apiService.post('/auth/register', data);
            notificationService.success('Registration successful. Please check your email to verify your account.');
        } catch (error: any) {
            this.state.error = error.message || 'Registration failed';
            notificationService.error(this.state.error);
            throw error;
        } finally {
            this.state.isLoading = false;
        }
    }

    async logout(): Promise<void> {
        try {
            this.state.isLoading = true;
            this.state.error = null;

            if (this.state.token) {
                await apiService.post('/auth/logout');
            }

            this.clearState();
            notificationService.success('Logout successful');
        } catch (error: any) {
            this.state.error = error.message || 'Logout failed';
            notificationService.error(this.state.error);
            throw error;
        } finally {
            this.state.isLoading = false;
        }
    }

    async refreshToken(): Promise<void> {
        try {
            if (!this.state.refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await apiService.post<{ token: string; refreshToken: string }>('/auth/refresh', {
                refreshToken: this.state.refreshToken,
            });

            this.state.token = response.token;
            this.state.refreshToken = response.refreshToken;
            this.saveState();
        } catch (error: any) {
            this.clearState();
            throw error;
        }
    }

    async verifyEmail(token: string): Promise<void> {
        try {
            this.state.isLoading = true;
            this.state.error = null;

            await apiService.post('/auth/verify-email', { token });
            notificationService.success('Email verified successfully');
        } catch (error: any) {
            this.state.error = error.message || 'Email verification failed';
            notificationService.error(this.state.error);
            throw error;
        } finally {
            this.state.isLoading = false;
        }
    }

    async resendVerificationEmail(email: string): Promise<void> {
        try {
            this.state.isLoading = true;
            this.state.error = null;

            await apiService.post('/auth/resend-verification', { email });
            notificationService.success('Verification email sent successfully');
        } catch (error: any) {
            this.state.error = error.message || 'Failed to send verification email';
            notificationService.error(this.state.error);
            throw error;
        } finally {
            this.state.isLoading = false;
        }
    }

    async forgotPassword(data: ResetPasswordData): Promise<void> {
        try {
            this.state.isLoading = true;
            this.state.error = null;

            await apiService.post('/auth/forgot-password', data);
            notificationService.success('Password reset instructions sent to your email');
        } catch (error: any) {
            this.state.error = error.message || 'Failed to send password reset instructions';
            notificationService.error(this.state.error);
            throw error;
        } finally {
            this.state.isLoading = false;
        }
    }

    async resetPassword(token: string, password: string): Promise<void> {
        try {
            this.state.isLoading = true;
            this.state.error = null;

            await apiService.post('/auth/reset-password', { token, password });
            notificationService.success('Password reset successful');
        } catch (error: any) {
            this.state.error = error.message || 'Password reset failed';
            notificationService.error(this.state.error);
            throw error;
        } finally {
            this.state.isLoading = false;
        }
    }

    async changePassword(data: ChangePasswordData): Promise<void> {
        try {
            this.state.isLoading = true;
            this.state.error = null;

            await apiService.post('/auth/change-password', data);
            notificationService.success('Password changed successfully');
        } catch (error: any) {
            this.state.error = error.message || 'Password change failed';
            notificationService.error(this.state.error);
            throw error;
        } finally {
            this.state.isLoading = false;
        }
    }

    async updateProfile(data: UpdateProfileData): Promise<void> {
        try {
            this.state.isLoading = true;
            this.state.error = null;

            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined) {
                    formData.append(key, value);
                }
            });

            const response = await apiService.put<{ user: User }>('/auth/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            this.state.user = response.user;
            this.saveState();
            notificationService.success('Profile updated successfully');
        } catch (error: any) {
            this.state.error = error.message || 'Profile update failed';
            notificationService.error(this.state.error);
            throw error;
        } finally {
            this.state.isLoading = false;
        }
    }

    async deleteAccount(): Promise<void> {
        try {
            this.state.isLoading = true;
            this.state.error = null;

            await apiService.delete('/auth/account');
            this.clearState();
            notificationService.success('Account deleted successfully');
        } catch (error: any) {
            this.state.error = error.message || 'Account deletion failed';
            notificationService.error(this.state.error);
            throw error;
        } finally {
            this.state.isLoading = false;
        }
    }

    getToken(): string | null {
        return this.state.token;
    }

    getRefreshToken(): string | null {
        return this.state.refreshToken;
    }

    getUser(): User | null {
        return this.state.user;
    }

    isAuthenticated(): boolean {
        return this.state.isAuthenticated;
    }

    isLoading(): boolean {
        return this.state.isLoading;
    }

    getError(): string | null {
        return this.state.error;
    }

    hasRole(role: string): boolean {
        return this.state.user?.role === role;
    }

    hasPermission(permission: string): boolean {
        return this.state.user?.permissions?.includes(permission) || false;
    }

    isAdmin(): boolean {
        return this.hasRole('admin');
    }

    isModerator(): boolean {
        return this.hasRole('moderator');
    }

    isUser(): boolean {
        return this.hasRole('user');
    }

    isGuest(): boolean {
        return !this.isAuthenticated();
    }
}

export const authService = new AuthService(); 
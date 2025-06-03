import { api } from './api';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileData {
    name?: string;
    email?: string;
    avatar?: string;
    phone?: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const profileService = {
    async get(): Promise<UserProfile> {
        const response = await api.get<UserProfile>('/profile');
        return response.data;
    },

    async update(data: UpdateProfileData): Promise<UserProfile> {
        const response = await api.put<UserProfile>('/profile', data);
        return response.data;
    },

    async changePassword(data: ChangePasswordData): Promise<void> {
        await api.put('/profile/password', data);
    },

    async deleteAccount(): Promise<void> {
        await api.delete('/profile');
    },
}; 
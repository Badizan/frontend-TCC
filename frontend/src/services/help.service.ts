import { api } from './api';

export interface HelpArticle {
    id: string;
    title: string;
    content: string;
    category: 'getting-started' | 'vehicles' | 'expenses' | 'reminders' | 'reports' | 'settings';
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface HelpCategory {
    id: string;
    name: string;
    description: string;
    articles: HelpArticle[];
}

export const helpService = {
    async getAllArticles(): Promise<HelpArticle[]> {
        const response = await api.get<HelpArticle[]>('/help/articles');
        return response.data;
    },

    async getArticleById(id: string): Promise<HelpArticle> {
        const response = await api.get<HelpArticle>(`/help/articles/${id}`);
        return response.data;
    },

    async getArticlesByCategory(category: HelpArticle['category']): Promise<HelpArticle[]> {
        const response = await api.get<HelpArticle[]>(`/help/articles/category/${category}`);
        return response.data;
    },

    async searchArticles(query: string): Promise<HelpArticle[]> {
        const response = await api.get<HelpArticle[]>('/help/articles/search', {
            params: { query }
        });
        return response.data;
    },

    async getCategories(): Promise<HelpCategory[]> {
        const response = await api.get<HelpCategory[]>('/help/categories');
        return response.data;
    },
}; 
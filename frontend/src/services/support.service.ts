import { api } from './api';

export interface SupportTicket {
    id: string;
    subject: string;
    description: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    category: 'technical' | 'billing' | 'account' | 'other';
    createdAt: string;
    updatedAt: string;
}

export interface SupportMessage {
    id: string;
    ticketId: string;
    content: string;
    sender: 'user' | 'support';
    createdAt: string;
}

export interface CreateTicketData {
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    category: 'technical' | 'billing' | 'account' | 'other';
}

export const supportService = {
    async createTicket(data: CreateTicketData): Promise<SupportTicket> {
        const response = await api.post<SupportTicket>('/support/tickets', data);
        return response.data;
    },

    async getAllTickets(): Promise<SupportTicket[]> {
        const response = await api.get<SupportTicket[]>('/support/tickets');
        return response.data;
    },

    async getTicketById(id: string): Promise<SupportTicket> {
        const response = await api.get<SupportTicket>(`/support/tickets/${id}`);
        return response.data;
    },

    async getTicketMessages(ticketId: string): Promise<SupportMessage[]> {
        const response = await api.get<SupportMessage[]>(`/support/tickets/${ticketId}/messages`);
        return response.data;
    },

    async sendMessage(ticketId: string, content: string): Promise<SupportMessage> {
        const response = await api.post<SupportMessage>(`/support/tickets/${ticketId}/messages`, { content });
        return response.data;
    },

    async updateTicketStatus(id: string, status: SupportTicket['status']): Promise<SupportTicket> {
        const response = await api.put<SupportTicket>(`/support/tickets/${id}/status`, { status });
        return response.data;
    },

    async closeTicket(id: string): Promise<SupportTicket> {
        const response = await api.put<SupportTicket>(`/support/tickets/${id}/close`);
        return response.data;
    },
}; 